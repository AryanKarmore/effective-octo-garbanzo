// HIV Drug Interaction Platform Types

export interface DrugInteraction {
  arvDrug: string;
  otherDrug: string;
  interactionEffect: string;
  recommendations: string;
  mechanism: string;
  severity: 'contraindicated' | 'warning' | 'monitor' | 'none';
  foldChange?: string;
  timingRule?: string;
}

export interface ARVDrug {
  abbreviation: string;
  fullName: string;
  drugClass: DrugClass;
  mechanisms: DrugMechanism;
}

export interface DrugMechanism {
  cypSubstrate: string[];
  cypInhibitor: string[];
  cypInducer: string[];
  ugt1a1: string;
  transportProtein: string[];
  other: string[];
}

export type DrugClass = 
  | 'INSTI' 
  | 'PI' 
  | 'NNRTI' 
  | 'NRTI' 
  | 'EI' 
  | 'Capsid Inhibitor'
  | 'PK Booster';

export interface PKSimulationResult {
  drugs: [string, string];
  predictedChange: string;
  clinicalAction: string;
  confidence: string;
  mechanism: string;
  severity: 'contraindicated' | 'warning' | 'monitor' | 'none';
}

export interface DosingSchedule {
  time: string;
  medication: string;
  notes?: string;
}

export interface ScheduleConflict {
  drugs: string[];
  timingRule: string;
  visualSchedule: DosingSchedule[];
  severity: 'critical' | 'warning' | 'info';
}

export interface CYP450Node {
  id: string;
  name: string;
  type: 'enzyme' | 'drug' | 'transporter';
  x: number;
  y: number;
  effects?: {
    substrates: string[];
    inhibitors: string[];
    inducers: string[];
  };
}

export interface CYP450Edge {
  source: string;
  target: string;
  type: 'substrate' | 'inhibit' | 'induce';
  strength: 'strong' | 'moderate' | 'weak' | 'none';
}

export interface MolecularProtein {
  id: string;
  name: string;
  type: 'protease' | 'integrase' | 'reverse_transcriptase' | 'entry' | 'capsid';
  pdbId?: string;
  description: string;
}

export interface TrialCriteria {
  ageRange: [number, number];
  viralLoad?: number;
  cd4Count?: [number, number];
  priorTreatment: boolean;
  comorbidities: string[];
}

export interface DrugRegimen {
  name: string;
  drugs: string[];
  pillBurden: number;
  dosingFrequency: 'daily' | 'twice_daily' | 'weekly' | 'monthly';
  efficacy: number;
}

export interface FormulationAnalysis {
  drugs: string[];
  isViable: boolean;
  existingFDC: string | null;
  barriers: string[];
  recommendations: string[];
}

export interface RegulatoryReport {
  interactionPairs: DrugInteraction[];
  mechanisms: string[];
  clinicalEvidence: string[];
  guidelineCitations: string[];
  generatedAt: Date;
}

export interface PKCurve {
  drug: string;
  data: ConcentrationPoint[];
  cmax: number;
  tmax: number;
  auc: number;
  halfLife: number;
}

export interface ConcentrationPoint {
  time: number;
  concentration: number;
  drug: string;
}
