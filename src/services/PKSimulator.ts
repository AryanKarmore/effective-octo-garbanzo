import type { PKSimulationResult, ScheduleConflict } from '@/types';

export interface ConcentrationPoint {
  time: number;
  concentration: number;
  drug: string;
}

export interface PKCurve {
  drug: string;
  data: ConcentrationPoint[];
  cmax: number;
  tmax: number;
  auc: number;
  halfLife: number;
}

export class PKSimulator {
  private rules: Map<string, any> = new Map();

  constructor() {
    this.initializeRules();
  }

  private initializeRules(): void {
    // Comprehensive interaction rules based on NYSDOH 2025 guidelines
    this.rules.set('DTG', {
      metformin: {
        mechanism: 'OCT2/MATE1 inhibition',
        foldChange: '+1.5x',
        recommendation: 'Reduce metformin dose by 50% initially, monitor for adverse effects',
        severity: 'monitor',
        confidence: 'Guideline-based (NYSDOH 2025)'
      },
      atenolol: {
        mechanism: 'OCT2/MATE1 inhibition',
        foldChange: '+1.3x',
        recommendation: 'Start at lower atenolol dose and titrate slowly',
        severity: 'monitor',
        confidence: 'Guideline-based (NYSDOH 2025)'
      },
      dofetilide: {
        mechanism: 'OCT2/MATE1 inhibition - increased dofetilide levels',
        foldChange: '+3x',
        recommendation: 'CONTRAINDICATED - risk of QT prolongation/torsades',
        severity: 'contraindicated',
        confidence: 'Guideline-based (NYSDOH 2025)'
      },
      calcium: {
        mechanism: 'Chelation - reduced DTG absorption',
        foldChange: '-40%',
        recommendation: 'Separate DTG 2h before or 6h after cations',
        severity: 'warning',
        confidence: 'Guideline-based (NYSDOH 2025)'
      },
      iron: {
        mechanism: 'Chelation - reduced DTG absorption',
        foldChange: '-35%',
        recommendation: 'Separate DTG 2h before or 6h after iron, or take together with food',
        severity: 'warning',
        confidence: 'Guideline-based (NYSDOH 2025)'
      },
      magnesium: {
        mechanism: 'Chelation - reduced DTG absorption',
        foldChange: '-45%',
        recommendation: 'Separate DTG 2h before or 6h after magnesium/aluminum antacids',
        severity: 'warning',
        confidence: 'Guideline-based (NYSDOH 2025)'
      },
      rifampin: {
        mechanism: 'UGT1A1/CYP3A induction reduces DTG levels',
        foldChange: '-75%',
        recommendation: 'Use DTG 50mg twice daily instead of once daily',
        severity: 'warning',
        confidence: 'Guideline-based (NYSDOH 2025)'
      }
    });

    this.rules.set('BIC', {
      metformin: {
        mechanism: 'OCT2/MATE1 inhibition',
        foldChange: '+1.4x',
        recommendation: 'Monitor for metformin-related adverse effects',
        severity: 'monitor',
        confidence: 'Guideline-based (NYSDOH 2025)'
      },
      dofetilide: {
        mechanism: 'OCT2/MATE1 inhibition',
        foldChange: '+3x',
        recommendation: 'CONTRAINDICATED - risk of QT prolongation',
        severity: 'contraindicated',
        confidence: 'Guideline-based (NYSDOH 2025)'
      },
      atenolol: {
        mechanism: 'OCT2/MATE1 inhibition',
        foldChange: '+1.3x',
        recommendation: 'Start at lower atenolol dose and titrate slowly',
        severity: 'monitor',
        confidence: 'Guideline-based (NYSDOH 2025)'
      },
      calcium: {
        mechanism: 'Chelation - reduced BIC absorption',
        foldChange: '-35%',
        recommendation: 'Aluminum/magnesium antacids: 6h before or 2h after BIC; Calcium with food OK',
        severity: 'warning',
        confidence: 'Guideline-based (NYSDOH 2025)'
      },
      cyclosporine: {
        mechanism: 'P-gP inhibition may increase BIC levels',
        foldChange: '+1.5x',
        recommendation: 'Monitor for BIC-related adverse effects',
        severity: 'monitor',
        confidence: 'Guideline-based (NYSDOH 2025)'
      }
    });

    this.rules.set('ritonavir', {
      simvastatin: {
        mechanism: 'CYP3A4 inhibition - dramatically increases statin levels',
        foldChange: '+15x',
        recommendation: 'CONTRAINDICATED - risk of rhabdomyolysis',
        severity: 'contraindicated',
        confidence: 'Guideline-based (NYSDOH 2025)'
      },
      lovastatin: {
        mechanism: 'CYP3A4 inhibition',
        foldChange: '+12x',
        recommendation: 'CONTRAINDICATED - risk of rhabdomyolysis',
        severity: 'contraindicated',
        confidence: 'Guideline-based (NYSDOH 2025)'
      },
      atorvastatin: {
        mechanism: 'CYP3A4 inhibition',
        foldChange: '+3-5x',
        recommendation: 'Use lowest effective dose, monitor for myopathy',
        severity: 'warning',
        confidence: 'Guideline-based (NYSDOH 2025)'
      },
      midazolam: {
        mechanism: 'CYP3A4 inhibition',
        foldChange: '+8x',
        recommendation: 'CONTRAINDICATED with oral midazolam',
        severity: 'contraindicated',
        confidence: 'Guideline-based (NYSDOH 2025)'
      }
    });

    this.rules.set('cobicistat', {
      simvastatin: {
        mechanism: 'CYP3A4 inhibition',
        foldChange: '+15x',
        recommendation: 'CONTRAINDICATED - risk of rhabdomyolysis',
        severity: 'contraindicated',
        confidence: 'Guideline-based (NYSDOH 2025)'
      },
      lovastatin: {
        mechanism: 'CYP3A4 inhibition',
        foldChange: '+12x',
        recommendation: 'CONTRAINDICATED - risk of rhabdomyolysis',
        severity: 'contraindicated',
        confidence: 'Guideline-based (NYSDOH 2025)'
      }
    });

    this.rules.set('ATV', {
      omeprazole: {
        mechanism: 'Increased gastric pH reduces ATV absorption',
        foldChange: '-75%',
        recommendation: 'Do not exceed omeprazole 20mg/day; separate by 12h',
        severity: 'warning',
        confidence: 'Guideline-based (NYSDOH 2025)'
      },
      famotidine: {
        mechanism: 'H2RA reduces ATV absorption',
        foldChange: '-40%',
        recommendation: 'Administer simultaneously or ≥10 hours after H2RA',
        severity: 'warning',
        confidence: 'Guideline-based (NYSDOH 2025)'
      }
    });

    this.rules.set('RPV', {
      omeprazole: {
        mechanism: 'PPIs increase gastric pH, reducing RPV absorption',
        foldChange: '-85%',
        recommendation: 'CONTRAINDICATED with PPIs',
        severity: 'contraindicated',
        confidence: 'Guideline-based (NYSDOH 2025)'
      }
    });

    this.rules.set('EFV', {
      simvastatin: {
        mechanism: 'CYP3A4 induction reduces statin levels',
        foldChange: '-60%',
        recommendation: 'Monitor lipid levels, may need dose adjustment',
        severity: 'monitor',
        confidence: 'Guideline-based (NYSDOH 2025)'
      }
    });
  }

  simulate(regimen: string[], concomitant: string[]): PKSimulationResult[] {
    const results: PKSimulationResult[] = [];

    for (const arv of regimen) {
      const arvKey = arv.toLowerCase();
      const arvRules = this.rules.get(arvKey) || this.rules.get(this.getARVName(arv));
      
      if (arvRules) {
        for (const drug of concomitant) {
          const drugKey = drug.toLowerCase();
          const rule = arvRules[drugKey];
          
          if (rule) {
            results.push({
              drugs: [arv, drug] as [string, string],
              predictedChange: rule.foldChange,
              clinicalAction: rule.recommendation,
              confidence: rule.confidence,
              mechanism: rule.mechanism,
              severity: rule.severity
            });
          }
        }
      }
    }

    return results;
  }

  private getARVName(abbreviation: string): string {
    const map: Record<string, string> = {
      'dtg': 'DTG',
      'dolutegravir': 'DTG',
      'bic': 'BIC',
      'bictegravir': 'BIC',
      'rtv': 'ritonavir',
      'ritonavir': 'ritonavir',
      'cobi': 'cobicistat',
      'cobicistat': 'cobicistat',
      'atv': 'ATV',
      'atazanavir': 'ATV',
      'rpv': 'RPV',
      'rilpivirine': 'RPV',
      'efv': 'EFV',
      'efavirenz': 'EFV'
    };
    return map[abbreviation.toLowerCase()] || abbreviation;
  }

  generateConcentrationCurve(
    drug: string,
    dose: number,
    frequency: number,
    duration: number,
    interactions: PKSimulationResult[]
  ): PKCurve {
    const data: ConcentrationPoint[] = [];
    const foldChange = this.calculateFoldChange(drug, interactions);
    
    // PK parameters (simplified models)
    const params = this.getPKParameters(drug);
    const adjustedParams = {
      ...params,
      ka: params.ka * foldChange,
      ke: params.ke / foldChange,
      vd: params.vd
    };

    // Generate concentration-time curve
    const timeStep = 0.5;
    for (let t = 0; t <= duration; t += timeStep) {
      const concentration = this.calculateConcentration(t, dose, adjustedParams, frequency);
      data.push({ time: t, concentration, drug });
    }

    // Calculate PK parameters
    const cmax = Math.max(...data.map(d => d.concentration));
    const tmax = data.find(d => d.concentration === cmax)?.time || 0;
    const auc = this.calculateAUC(data);

    return {
      drug,
      data,
      cmax,
      tmax,
      auc,
      halfLife: Math.log(2) / adjustedParams.ke
    };
  }

  private getPKParameters(drug: string): { ka: number; ke: number; vd: number; f: number } {
    // Simplified PK parameters for common ARVs
    const params: Record<string, { ka: number; ke: number; vd: number; f: number }> = {
      'DTG': { ka: 1.2, ke: 0.03, vd: 30, f: 0.9 },
      'BIC': { ka: 1.0, ke: 0.025, vd: 35, f: 0.85 },
      'ATV': { ka: 0.8, ke: 0.02, vd: 50, f: 0.7 },
      'DRV': { ka: 0.9, ke: 0.025, vd: 45, f: 0.82 },
      'RPV': { ka: 0.6, ke: 0.015, vd: 80, f: 0.5 },
      'EFV': { ka: 0.5, ke: 0.02, vd: 200, f: 0.5 },
      'FTC': { ka: 1.5, ke: 0.04, vd: 100, f: 0.93 },
      'TAF': { ka: 1.0, ke: 0.03, vd: 50, f: 0.4 },
      'TDF': { ka: 0.8, ke: 0.02, vd: 100, f: 0.25 }
    };

    return params[drug.toUpperCase()] || { ka: 1.0, ke: 0.03, vd: 50, f: 0.8 };
  }

  private calculateConcentration(
    t: number,
    dose: number,
    params: { ka: number; ke: number; vd: number; f: number },
    frequency: number
  ): number {
    const { ka, ke, vd, f } = params;
    let concentration = 0;

    // Sum contributions from all doses
    const numDoses = Math.floor(t / frequency) + 1;
    for (let i = 0; i < numDoses; i++) {
      const doseTime = i * frequency;
      if (t >= doseTime) {
        const timeSinceDose = t - doseTime;
        const doseConcentration = (f * dose / vd) * 
          (ka / (ka - ke)) * 
          (Math.exp(-ke * timeSinceDose) - Math.exp(-ka * timeSinceDose));
        concentration += Math.max(0, doseConcentration);
      }
    }

    return concentration;
  }

  private calculateAUC(data: ConcentrationPoint[]): number {
    let auc = 0;
    for (let i = 1; i < data.length; i++) {
      const dt = data[i].time - data[i - 1].time;
      const avgConcentration = (data[i].concentration + data[i - 1].concentration) / 2;
      auc += avgConcentration * dt;
    }
    return auc;
  }

  private calculateFoldChange(drug: string, interactions: PKSimulationResult[]): number {
    let foldChange = 1.0;
    
    for (const interaction of interactions) {
      if (interaction.drugs[0] === drug || interaction.drugs[1] === drug) {
        const changeStr = interaction.predictedChange;
        const match = changeStr.match(/([+-]?)([\d.]+)x/);
        if (match) {
          const multiplier = parseFloat(match[2]);
          if (match[1] === '-') {
            foldChange *= (1 - (multiplier / 100));
          } else {
            foldChange *= multiplier;
          }
        }
      }
    }

    return foldChange;
  }

  optimizeSchedule(regimen: string[]): ScheduleConflict[] {
    const conflicts: ScheduleConflict[] = [];

    // Check for DTG + cations interaction
    if (regimen.some(r => r.toLowerCase().includes('dtg'))) {
      const hasCations = regimen.some(r => 
        ['calcium', 'iron', 'magnesium', 'aluminum', 'zinc'].some(c => 
          r.toLowerCase().includes(c)
        )
      );
      
      if (hasCations) {
        conflicts.push({
          drugs: ['DTG', 'Ca2+/Mg2+/Al3+/Fe2+'],
          timingRule: 'DTG 2h before OR 6h after cations',
          visualSchedule: [
            { time: '08:00', medication: 'DTG dose', notes: 'Take on empty stomach' },
            { time: '10:00', medication: 'Calcium/Iron supplement', notes: '≥2 hours after DTG' },
            { time: '14:00', medication: 'Lunch', notes: '' },
            { time: '20:00', medication: 'DTG dose (evening)', notes: 'If twice daily dosing' }
          ],
          severity: 'warning'
        });
      }
    }

    // Check for BIC + antacids
    if (regimen.some(r => r.toLowerCase().includes('bic'))) {
      conflicts.push({
        drugs: ['BIC', 'Aluminum/Magnesium antacids'],
        timingRule: 'Antacids 6h before OR 2h after BIC',
        visualSchedule: [
          { time: '07:00', medication: 'Antacid (if needed)', notes: '≥6 hours before BIC' },
          { time: '08:00', medication: 'BIC with food', notes: 'Take with meal' },
          { time: '10:00', medication: 'Antacid OK', notes: '≥2 hours after BIC' }
        ],
        severity: 'warning'
      });
    }

    // Check for ATV + acid-reducing agents
    if (regimen.some(r => r.toLowerCase().includes('atv'))) {
      conflicts.push({
        drugs: ['ATV', 'PPIs/H2RAs'],
        timingRule: 'PPIs ≥12h before boosted ATV; H2RAs simultaneously or ≥10h after',
        visualSchedule: [
          { time: '20:00', medication: 'PPI (omeprazole ≤20mg)', notes: 'Night before' },
          { time: '08:00', medication: 'ATV/RTV with food', notes: 'Morning dose' },
          { time: '18:00', medication: 'H2RA (if needed)', notes: '≥10 hours after ATV' }
        ],
        severity: 'critical'
      });
    }

    // Check for RPV + PPIs
    if (regimen.some(r => r.toLowerCase().includes('rpv'))) {
      conflicts.push({
        drugs: ['RPV', 'PPIs'],
        timingRule: 'CONTRAINDICATED - PPIs with RPV',
        visualSchedule: [
          { time: '08:00', medication: 'RPV with meal', notes: 'Requires acidic environment' },
          { time: 'Avoid', medication: 'PPIs entirely', notes: 'Use H2RA if needed' }
        ],
        severity: 'critical'
      });
    }

    return conflicts;
  }

  getFoodEffect(drug: string): { withFood: string; withoutFood: string } {
    const effects: Record<string, { withFood: string; withoutFood: string }> = {
      'DTG': {
        withFood: 'AUC increased ~1.3x (acceptable)',
        withoutFood: 'Standard absorption'
      },
      'BIC': {
        withFood: 'Required for optimal absorption',
        withoutFood: 'AUC decreased ~40%'
      },
      'ATV': {
        withFood: 'Required - take with meal',
        withoutFood: 'Significantly reduced absorption'
      },
      'RPV': {
        withFood: 'Required - ≥390 calories',
        withoutFood: 'AUC decreased ~50%'
      },
      'EFV': {
        withFood: 'Take on empty stomach preferred',
        withoutFood: 'Standard absorption'
      }
    };

    return effects[drug.toUpperCase()] || { withFood: 'No significant effect', withoutFood: 'Standard absorption' };
  }
}

export const pkSimulator = new PKSimulator();
