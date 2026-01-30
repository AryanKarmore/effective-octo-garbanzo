import Papa from 'papaparse';
import type { DrugInteraction, DrugMechanism } from '@/types';

class DataService {
  private interactions: DrugInteraction[] = [];
  private mechanisms: Map<string, DrugMechanism> = new Map();
  private interactionRules: Map<string, any> = new Map();

  async initialize(): Promise<void> {
    await Promise.all([
      this.loadInteractions(),
      this.loadMechanisms(),
      this.loadARVInteractions(),
      this.loadCommonInteractions(),
    ]);
    this.buildInteractionRules();
  }

  private async loadInteractions(): Promise<void> {
    try {
      const response = await fetch('/data/hiv_drug_interactions_clean.csv');
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          this.interactions = (results.data as any[])
            .filter((row: any) => row.ARV_Drug && row.ARV_Drug !== 'Not Specified')
            .map((row: any) => this.parseInteractionRow(row));
        },
      });
    } catch (error) {
      console.error('Error loading interactions:', error);
    }
  }

  private async loadMechanisms(): Promise<void> {
    try {
      const response = await fetch('/data/hiv_drug_interactions_drug_mechanisms.csv');
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const mechanisms = new Map();
          (results.data as any[]).forEach((row: any) => {
            if (row.drug_abbreviation && row.context) {
              const mechanism = this.parseMechanism(row.context);
              mechanisms.set(row.drug_abbreviation, mechanism);
            }
          });
          this.mechanisms = mechanisms;
        },
      });
    } catch (error) {
      console.error('Error loading mechanisms:', error);
    }
  }

  private async loadARVInteractions(): Promise<void> {
    try {
      const response = await fetch('/data/hiv_drug_interactions_arv_interactions.csv');
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          (results.data as any[]).forEach((row: any) => {
            if (row.arv_drug && row.mechanism) {
              const key = `${row.arv_drug}_${row.interacting_drug_class}`;
              this.interactionRules.set(key, {
                arv: row.arv_drug,
                drugClass: row.interacting_drug_class,
                mechanism: row.mechanism,
                clinicalComments: row.clinical_comments,
              });
            }
          });
        },
      });
    } catch (error) {
      console.error('Error loading ARV interactions:', error);
    }
  }

  private async loadCommonInteractions(): Promise<void> {
    try {
      const response = await fetch('/data/hiv_drug_interactions_common_med_interactions.csv');
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: () => {
          // Process common medication interactions
        },
      });
    } catch (error) {
      console.error('Error loading common interactions:', error);
    }
  }

  private parseInteractionRow(row: any): DrugInteraction {
    const recommendations = row.Recommendations || row.Clinical_Comments || '';
    const mechanism = row.Interaction_Effect || row.Mechanism || '';
    
    return {
      arvDrug: row.ARV_Drug,
      otherDrug: row.Other_Drug || row.interacting_drug_class || 'Unknown',
      interactionEffect: row.Interaction_Effect || '',
      recommendations: recommendations,
      mechanism: mechanism,
      severity: this.determineSeverity(recommendations, mechanism),
    };
  }

  private parseMechanism(context: string): DrugMechanism {
    const mechanism: DrugMechanism = {
      cypSubstrate: [],
      cypInhibitor: [],
      cypInducer: [],
      ugt1a1: '',
      transportProtein: [],
      other: [],
    };

    // Parse CYP information from context
    const cypSubMatch = context.match(/CYP Substrate[:\s]+([^|]+)/i);
    if (cypSubMatch) {
      mechanism.cypSubstrate = cypSubMatch[1].split(/[,\s]+/).filter(s => s && s !== '—');
    }

    const cypInhMatch = context.match(/CYP Inhibitor[:\s]+([^|]+)/i);
    if (cypInhMatch) {
      mechanism.cypInhibitor = cypInhMatch[1].split(/[,\s]+/).filter(s => s && s !== '—');
    }

    const cypIndMatch = context.match(/CYP Inducer[:\s]+([^|]+)/i);
    if (cypIndMatch) {
      mechanism.cypInducer = cypIndMatch[1].split(/[,\s]+/).filter(s => s && s !== '—');
    }

    const ugtMatch = context.match(/UGT1A1[:\s]+([^|]+)/i);
    if (ugtMatch) {
      mechanism.ugt1a1 = ugtMatch[1].trim();
    }

    const transMatch = context.match(/Drug Transport Protein[:\s]+([^|]+)/i);
    if (transMatch) {
      mechanism.transportProtein = transMatch[1].split(/[,\s]+/).filter(s => s && s !== '—');
    }

    const otherMatch = context.match(/Other[:\s]+([^|]+)/i);
    if (otherMatch) {
      mechanism.other = otherMatch[1].split(/[,\s]+/).filter(s => s && s !== '—');
    }

    return mechanism;
  }

  private determineSeverity(recommendations: string, mechanism: string): 'contraindicated' | 'warning' | 'monitor' | 'none' {
    const text = (recommendations + ' ' + mechanism).toLowerCase();
    
    if (text.includes('contraindicated') || text.includes('do not coadminister') || text.includes('contraindication')) {
      return 'contraindicated';
    }
    if (text.includes('avoid') || text.includes('caution') || text.includes('monitor closely') || text.includes('reduce dose')) {
      return 'warning';
    }
    if (text.includes('monitor') || text.includes('adjust') || text.includes('increase')) {
      return 'monitor';
    }
    return 'none';
  }

  private buildInteractionRules(): void {
    // Build comprehensive interaction rules from all data sources
    const documentedRules: Record<string, any> = {
      'DTG': {
        'metformin': {
          mechanism: 'OCT2/MATE1 inhibition',
          fold_change: '+1.5x',
          recommendation: 'Reduce metformin dose by 50% initially, monitor for adverse effects',
          severity: 'monitor'
        },
        'atenolol': {
          mechanism: 'OCT2/MATE1 inhibition',
          fold_change: '+1.3x',
          recommendation: 'Start at lower atenolol dose and titrate slowly',
          severity: 'monitor'
        },
        'calcium': {
          mechanism: 'Chelation - reduced absorption',
          fold_change: '-40%',
          recommendation: 'Separate DTG 2h before or 6h after cations',
          severity: 'warning'
        },
        'iron': {
          mechanism: 'Chelation - reduced absorption',
          fold_change: '-35%',
          recommendation: 'Separate DTG 2h before or 6h after iron, or take together with food',
          severity: 'warning'
        },
        'magnesium': {
          mechanism: 'Chelation - reduced absorption',
          fold_change: '-45%',
          recommendation: 'Separate DTG 2h before or 6h after antacids',
          severity: 'warning'
        }
      },
      'BIC': {
        'metformin': {
          mechanism: 'OCT2/MATE1 inhibition',
          fold_change: '+1.4x',
          recommendation: 'Monitor for metformin-related adverse effects',
          severity: 'monitor'
        },
        'calcium': {
          mechanism: 'Chelation - reduced absorption',
          fold_change: '-35%',
          recommendation: 'Aluminum/magnesium antacids: 6h before or 2h after BIC',
          severity: 'warning'
        }
      },
      'ritonavir': {
        'simvastatin': {
          mechanism: 'CYP3A4 inhibition',
          fold_change: '+15x',
          recommendation: 'CONTRAINDICATED - risk of rhabdomyolysis',
          severity: 'contraindicated'
        },
        'lovastatin': {
          mechanism: 'CYP3A4 inhibition',
          fold_change: '+12x',
          recommendation: 'CONTRAINDICATED - risk of rhabdomyolysis',
          severity: 'contraindicated'
        },
        'atorvastatin': {
          mechanism: 'CYP3A4 inhibition',
          fold_change: '+3-5x',
          recommendation: 'Use lowest effective dose, monitor for myopathy',
          severity: 'warning'
        },
        'midazolam': {
          mechanism: 'CYP3A4 inhibition',
          fold_change: '+8x',
          recommendation: 'CONTRAINDICATED with oral midazolam',
          severity: 'contraindicated'
        }
      },
      'cobicistat': {
        'simvastatin': {
          mechanism: 'CYP3A4 inhibition',
          fold_change: '+15x',
          recommendation: 'CONTRAINDICATED - risk of rhabdomyolysis',
          severity: 'contraindicated'
        },
        'lovastatin': {
          mechanism: 'CYP3A4 inhibition',
          fold_change: '+12x',
          recommendation: 'CONTRAINDICATED - risk of rhabdomyolysis',
          severity: 'contraindicated'
        }
      },
      'ATV': {
        'omeprazole': {
          mechanism: 'Increased gastric pH reduces ATV absorption',
          fold_change: '-75%',
          recommendation: 'Do not exceed omeprazole 20mg/day; separate by 12h',
          severity: 'warning'
        },
        'famotidine': {
          mechanism: 'H2RA reduces ATV absorption',
          fold_change: '-40%',
          recommendation: 'Administer simultaneously or ≥10 hours after H2RA',
          severity: 'warning'
        }
      },
      'RPV': {
        'omeprazole': {
          mechanism: 'PPIs increase gastric pH, reducing RPV absorption',
          fold_change: '-85%',
          recommendation: 'CONTRAINDICATED with PPIs',
          severity: 'contraindicated'
        }
      },
      'EFV': {
        'simvastatin': {
          mechanism: 'CYP3A4 induction reduces statin levels',
          fold_change: '-60%',
          recommendation: 'Monitor lipid levels, may need dose adjustment',
          severity: 'monitor'
        }
      }
    };

    // Store the rules
    Object.entries(documentedRules).forEach(([arv, drugs]) => {
      Object.entries(drugs as Record<string, any>).forEach(([drug, rule]) => {
        const key = `${arv.toLowerCase()}_${drug.toLowerCase()}`;
        this.interactionRules.set(key, rule);
      });
    });
  }

  getInteractions(): DrugInteraction[] {
    return this.interactions;
  }

  getARVDrugs(): string[] {
    const drugs = new Set<string>();
    this.interactions.forEach(i => drugs.add(i.arvDrug));
    return Array.from(drugs).sort();
  }

  getInteractionsForARV(arvDrug: string): DrugInteraction[] {
    return this.interactions.filter(i => 
      i.arvDrug.toLowerCase().includes(arvDrug.toLowerCase())
    );
  }

  getInteractionRule(arv: string, drug: string): any | null {
    const key = `${arv.toLowerCase()}_${drug.toLowerCase()}`;
    return this.interactionRules.get(key) || null;
  }

  getMechanism(drug: string): DrugMechanism | null {
    return this.mechanisms.get(drug.toUpperCase()) || null;
  }

  searchInteractions(query: string): DrugInteraction[] {
    const lowerQuery = query.toLowerCase();
    return this.interactions.filter(i =>
      i.arvDrug.toLowerCase().includes(lowerQuery) ||
      i.otherDrug.toLowerCase().includes(lowerQuery) ||
      i.mechanism.toLowerCase().includes(lowerQuery) ||
      i.recommendations.toLowerCase().includes(lowerQuery)
    );
  }

  getDrugClass(drug: string): string | null {
    const upperDrug = drug.toUpperCase();
    const instis = ['BIC', 'CAB', 'DTG', 'EVG', 'RAL'];
    const pis = ['ATV', 'DRV'];
    const nnrtis = ['DOR', 'RPV', 'EFV', 'ETR', 'NVP'];
    const nrtis = ['ABC', 'TDF', 'TAF', '3TC', 'FTC'];
    const eis = ['FTR', 'MVC', 'IBA'];
    const boosters = ['COBI', 'RTV'];

    if (instis.includes(upperDrug)) return 'INSTI';
    if (pis.includes(upperDrug)) return 'PI';
    if (nnrtis.includes(upperDrug)) return 'NNRTI';
    if (nrtis.includes(upperDrug)) return 'NRTI';
    if (eis.includes(upperDrug)) return 'EI';
    if (upperDrug === 'LEN') return 'Capsid Inhibitor';
    if (boosters.includes(upperDrug)) return 'PK Booster';

    return null;
  }
}

export const dataService = new DataService();
