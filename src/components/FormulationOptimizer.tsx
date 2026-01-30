import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  FlaskConical, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Minus,
  Pill,
  Beaker,
  Lightbulb
} from 'lucide-react';

// Known FDCs
const EXISTING_FDCS = [
  { name: 'Biktarvy', components: ['BIC', 'FTC', 'TAF'], count: 1 },
  { name: 'Triumeq', components: ['ABC', 'DTG', '3TC'], count: 1 },
  { name: 'Genvoya', components: ['EVG', 'COBI', 'FTC', 'TAF'], count: 1 },
  { name: 'Stribild', components: ['EVG', 'COBI', 'FTC', 'TDF'], count: 1 },
  { name: 'Complera', components: ['RPV', 'FTC', 'TDF'], count: 1 },
  { name: 'Odefsey', components: ['RPV', 'FTC', 'TAF'], count: 1 },
  { name: 'Juluca', components: ['DTG', 'RPV'], count: 1 },
  { name: 'Dovato', components: ['DTG', '3TC'], count: 1 },
  { name: 'Symtuza', components: ['DRV', 'COBI', 'FTC', 'TAF'], count: 1 },
  { name: 'Atripla', components: ['EFV', 'FTC', 'TDF'], count: 1 },
];

// Drug properties for compatibility analysis
const DRUG_PROPERTIES: Record<string, {
  class: string;
  stability: string;
  incompatibilities: string[];
  formulation: string[];
}> = {
  'DTG': {
    class: 'INSTI',
    stability: 'Good',
    incompatibilities: [],
    formulation: ['Tablet', 'Dispersible']
  },
  'BIC': {
    class: 'INSTI',
    stability: 'Good',
    incompatibilities: ['Polyvalent cations'],
    formulation: ['Tablet']
  },
  'FTC': {
    class: 'NRTI',
    stability: 'Excellent',
    incompatibilities: [],
    formulation: ['Tablet', 'Capsule', 'Oral solution']
  },
  'TAF': {
    class: 'NRTI',
    stability: 'Good',
    incompatibilities: ['Strong inducers'],
    formulation: ['Tablet']
  },
  'RPV': {
    class: 'NNRTI',
    stability: 'Moderate',
    incompatibilities: ['PPIs', 'Strong inducers'],
    formulation: ['Tablet', 'Injectable']
  },
  'ATV': {
    class: 'PI',
    stability: 'Moderate',
    incompatibilities: ['PPIs', 'H2RAs (dose limits)'],
    formulation: ['Capsule', 'Powder']
  },
  'DRV': {
    class: 'PI',
    stability: 'Good',
    incompatibilities: [],
    formulation: ['Tablet', 'Suspension']
  }
};

const PEDIATRIC_NEEDS = [
  { drug: 'DTG', formulation: 'Dispersible tablet', priority: 'High', age: '4 weeks+' },
  { drug: 'RAL', formulation: 'Chewable tablet', priority: 'High', age: '4 weeks+' },
  { drug: 'ABC', formulation: 'Strawberry-flavored liquid', priority: 'Medium', age: '3 months+' },
  { drug: '3TC', formulation: 'Oral solution', priority: 'Medium', age: 'Birth+' },
  { drug: 'LPV/r', formulation: 'Pellets', priority: 'Medium', age: 'Birth+' },
];

export function FormulationOptimizer() {
  const [drugs, setDrugs] = useState<string[]>(['']);
  const [analysis, setAnalysis] = useState<any>(null);

  const addDrug = () => setDrugs([...drugs, '']);
  const removeDrug = (index: number) => {
    const newDrugs = drugs.filter((_, i) => i !== index);
    setDrugs(newDrugs.length ? newDrugs : ['']);
  };
  const updateDrug = (index: number, value: string) => {
    const newDrugs = [...drugs];
    newDrugs[index] = value;
    setDrugs(newDrugs);
  };

  const analyzeFDC = () => {
    const validDrugs = drugs.filter(d => d.trim());
    
    // Check if FDC already exists
    const existingFDC = EXISTING_FDCS.find(fdc => 
      fdc.components.length === validDrugs.length &&
      fdc.components.every(c => validDrugs.includes(c))
    );

    // Check compatibility
    const incompatibilities: string[] = [];
    const barriers: string[] = [];
    
    for (const drug of validDrugs) {
      const props = DRUG_PROPERTIES[drug.toUpperCase()];
      if (props) {
        // Check incompatibilities with other drugs
        for (const otherDrug of validDrugs) {
          if (otherDrug !== drug) {
            if (props.incompatibilities.some(i => otherDrug.toLowerCase().includes(i.toLowerCase()))) {
              incompatibilities.push(`${drug} + ${otherDrug}`);
            }
          }
        }
      }
    }

    // Check for known problematic combinations
    if (validDrugs.includes('RPV') && validDrugs.some(d => ['PPI', 'omeprazole'].includes(d))) {
      barriers.push('RPV is contraindicated with PPIs - would need enteric coating');
    }
    if (validDrugs.includes('BIC') && validDrugs.some(d => ['calcium', 'magnesium', 'aluminum'].includes(d.toLowerCase()))) {
      barriers.push('BIC chelates with polyvalent cations - would need separation mechanism');
    }

    setAnalysis({
      drugs: validDrugs,
      existingFDC: existingFDC || null,
      isViable: incompatibilities.length === 0 && barriers.length < 2,
      incompatibilities,
      barriers,
      pillBurden: validDrugs.length,
      recommendations: generateRecommendations(validDrugs, incompatibilities, barriers)
    });
  };

  const generateRecommendations = (validDrugs: string[], incompatibilities: string[], barriers: string[]) => {
    const recs: string[] = [];
    
    if (incompatibilities.length === 0 && barriers.length === 0) {
      recs.push('No significant formulation barriers identified');
      recs.push('Standard immediate-release formulation should be feasible');
    }
    
    if (barriers.some(b => b.includes('enteric'))) {
      recs.push('Consider enteric-coated formulation for pH-sensitive components');
    }
    
    if (validDrugs.length > 3) {
      recs.push('Large tablet size may impact swallowability - consider patient preferences');
    }
    
    if (validDrugs.some(d => ['ATV', 'DRV'].includes(d))) {
      recs.push('PI-based FDC requires co-formulation with booster (RTV or COBI)');
    }
    
    return recs;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FDC Checker */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-rose-400">
              <FlaskConical className="w-5 h-5" />
              FDC Feasibility Checker
            </CardTitle>
            <CardDescription>
              Analyze drug combinations for fixed-dose formulation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Drug Components</label>
              {drugs.map((drug, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={drug}
                    onChange={(e) => updateDrug(index, e.target.value)}
                    placeholder={`Drug ${index + 1} (e.g., DTG)`}
                    className="bg-slate-950 border-slate-700 text-slate-100"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => removeDrug(index)}
                    className="border-slate-700"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button 
                variant="outline" 
                onClick={addDrug}
                className="w-full border-slate-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Drug
              </Button>
            </div>

            <Button 
              onClick={analyzeFDC}
              className="w-full bg-gradient-to-r from-rose-600 to-pink-600"
            >
              <Beaker className="w-4 h-4 mr-2" />
              Analyze Feasibility
            </Button>

            {analysis && (
              <div className="mt-4 space-y-3">
                {analysis.existingFDC ? (
                  <Alert className="bg-emerald-500/10 border-emerald-500/30">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <AlertTitle className="text-emerald-400">Existing FDC Found</AlertTitle>
                    <AlertDescription>
                      {analysis.existingFDC.name} already contains this combination
                    </AlertDescription>
                  </Alert>
                ) : analysis.isViable ? (
                  <Alert className="bg-emerald-500/10 border-emerald-500/30">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <AlertTitle className="text-emerald-400">Feasible</AlertTitle>
                    <AlertDescription>
                      This combination appears viable for FDC development
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="bg-red-500/10 border-red-500/30">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <AlertTitle className="text-red-400">Barriers Identified</AlertTitle>
                    <AlertDescription>
                      Significant formulation challenges detected
                    </AlertDescription>
                  </Alert>
                )}

                {analysis.barriers.length > 0 && (
                  <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
                    <p className="text-sm font-medium text-amber-400 mb-2">Barriers:</p>
                    <ul className="text-sm text-slate-300 space-y-1">
                      {analysis.barriers.map((b: string, i: number) => (
                        <li key={i}>• {b}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.recommendations.length > 0 && (
                  <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                    <p className="text-sm font-medium text-blue-400 mb-2">Recommendations:</p>
                    <ul className="text-sm text-slate-300 space-y-1">
                      {analysis.recommendations.map((r: string, i: number) => (
                        <li key={i}>• {r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Existing FDCs */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-400">
              <Pill className="w-5 h-5" />
              Existing FDCs
            </CardTitle>
            <CardDescription>
              Currently available fixed-dose combinations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EXISTING_FDCS.map((fdc) => (
                <div 
                  key={fdc.name}
                  className="p-3 bg-slate-950/50 rounded-lg border border-slate-800 hover:border-cyan-500/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-200">{fdc.name}</span>
                    <Badge className="bg-cyan-500/20 text-cyan-400">{fdc.count} tab</Badge>
                  </div>
                  <p className="text-xs text-slate-500">{fdc.components.join(' + ')}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pediatric Formulations */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-400">
            <Lightbulb className="w-5 h-5" />
            Pediatric Formulation Needs
          </CardTitle>
          <CardDescription>
            Identified gaps in pediatric HIV treatment options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PEDIATRIC_NEEDS.map((need) => (
              <div key={`${need.drug}-${need.formulation}`} className="p-4 bg-slate-950/50 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-slate-800 text-slate-300">{need.drug}</Badge>
                  <Badge 
                    className={
                      need.priority === 'High' 
                        ? 'bg-red-500/20 text-red-400' 
                        : 'bg-amber-500/20 text-amber-400'
                    }
                  >
                    {need.priority} Priority
                  </Badge>
                </div>
                <p className="text-sm text-slate-300">{need.formulation}</p>
                <p className="text-xs text-slate-500 mt-1">Approved for: {need.age}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Drug Properties Reference */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-purple-400">Drug Formulation Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(DRUG_PROPERTIES).map(([drug, props]) => (
              <div key={drug} className="p-4 bg-slate-950/50 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-lg text-purple-400">{drug}</span>
                  <Badge className="bg-slate-800 text-slate-400">{props.class}</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Stability:</span>
                    <span className={
                      props.stability === 'Excellent' ? 'text-emerald-400' :
                      props.stability === 'Good' ? 'text-cyan-400' : 'text-amber-400'
                    }>{props.stability}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Forms:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {props.formulation.map((f, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {props.incompatibilities.length > 0 && (
                    <div>
                      <span className="text-slate-500">Incompatibilities:</span>
                      <p className="text-rose-400 text-xs">{props.incompatibilities.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
