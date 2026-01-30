import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Beaker, 
  Activity, 
  MinusCircle, 
  PlusCircle, 
  Circle,
  Info
} from 'lucide-react';

const CYP_ENZYMES = {
  'CYP3A4': {
    name: 'CYP3A4',
    fullName: 'Cytochrome P450 3A4',
    description: 'Most abundant CYP enzyme, metabolizes ~50% of drugs',
    location: 'Liver, intestine',
    inducers: ['Rifampin', 'Carbamazepine', 'Phenytoin', 'St. John\'s Wort', 'Efavirenz'],
    inhibitors: ['Ritonavir', 'Cobicistat', 'Clarithromycin', 'Ketoconazole', 'Grapefruit'],
    substrates: ['Atorvastatin', 'Simvastatin', 'Midazolam', 'Tacrolimus', 'Cyclosporine']
  },
  'CYP2D6': {
    name: 'CYP2D6',
    fullName: 'Cytochrome P450 2D6',
    description: 'Highly polymorphic, metabolizes ~25% of drugs',
    location: 'Liver',
    inducers: ['Rifampin', 'Dexamethasone'],
    inhibitors: ['Fluoxetine', 'Paroxetine', 'Quinidine', 'Ritonavir'],
    substrates: ['Codeine', 'Tramadol', 'Metoprolol', 'Haloperidol', 'Nortriptyline']
  },
  'CYP2C9': {
    name: 'CYP2C9',
    fullName: 'Cytochrome P450 2C9',
    description: 'Metabolizes many NSAIDs and oral anticoagulants',
    location: 'Liver',
    inducers: ['Rifampin', 'Carbamazepine', 'Secobarbital'],
    inhibitors: ['Fluconazole', 'Amiodarone', 'Miconazole', 'Sulfaphenazole'],
    substrates: ['Warfarin', 'Phenytoin', 'Ibuprofen', 'Losartan', 'Tolbutamide']
  },
  'CYP2C19': {
    name: 'CYP2C19',
    fullName: 'Cytochrome P450 2C19',
    description: 'Metabolizes PPIs, clopidogrel, and diazepam',
    location: 'Liver',
    inducers: ['Rifampin', 'Carbamazepine', 'St. John\'s Wort'],
    inhibitors: ['Omeprazole', 'Fluvoxamine', 'Fluoxetine', 'Ticlopidine'],
    substrates: ['Omeprazole', 'Clopidogrel', 'Diazepam', 'Phenytoin', 'Proguanil']
  },
  'CYP1A2': {
    name: 'CYP1A2',
    fullName: 'Cytochrome P450 1A2',
    description: 'Metabolizes caffeine, theophylline, and clozapine',
    location: 'Liver',
    inducers: ['Smoking', 'Char-grilled food', 'Rifampin', 'Omeprazole'],
    inhibitors: ['Fluvoxamine', 'Ciprofloxacin', 'Cimetidine', 'Ethinyl estradiol'],
    substrates: ['Caffeine', 'Theophylline', 'Clozapine', 'Tacrine', 'Ropivacaine']
  },
  'CYP2B6': {
    name: 'CYP2B6',
    fullName: 'Cytochrome P450 2B6',
    description: 'Metabolizes bupropion, efavirenz, and cyclophosphamide',
    location: 'Liver',
    inducers: ['Rifampin', 'Carbamazepine', 'Phenytoin', 'Efavirenz'],
    inhibitors: ['Ticlopidine', 'Clopidogrel', 'Thiotepa'],
    substrates: ['Bupropion', 'Efavirenz', 'Cyclophosphamide', 'Ifosfamide', 'Methadone']
  }
};

const TRANSPORTERS = {
  'P-gP': {
    name: 'P-glycoprotein (P-gP/MDR1)',
    gene: 'ABCB1',
    function: 'Efflux transporter in gut, liver, kidney, BBB',
    inducers: ['Rifampin', 'St. John\'s Wort'],
    inhibitors: ['Ritonavir', 'Cobicistat', 'Quinidine', 'Verapamil'],
    substrates: ['Digoxin', 'Fexofenadine', 'Loperamide', 'Docetaxel']
  },
  'OATP1B1': {
    name: 'OATP1B1',
    gene: 'SLCO1B1',
    function: 'Hepatic uptake transporter',
    inducers: ['Rifampin'],
    inhibitors: ['Ritonavir', 'Cobicistat', 'Cyclosporine', 'Gemfibrozil'],
    substrates: ['Atorvastatin', 'Rosuvastatin', 'Pravastatin', 'Methotrexate']
  },
  'MATE1': {
    name: 'MATE1',
    gene: 'SLC47A1',
    function: 'Renal tubular secretion',
    inducers: [],
    inhibitors: ['Cobicistat', 'Ritonavir', 'Cimetidine', 'Pyrimethamine'],
    substrates: ['Metformin', 'Cimetidine', 'Acyclovir', 'Ganciclovir']
  },
  'OCT2': {
    name: 'OCT2',
    gene: 'SLC22A2',
    function: 'Renal tubular uptake',
    inducers: [],
    inhibitors: ['Cimetidine', 'Dolutegravir', 'Bictegravir'],
    substrates: ['Metformin', 'Atenolol', 'Cimetidine', 'Memantine']
  },
  'BCRP': {
    name: 'BCRP',
    gene: 'ABCG2',
    function: 'Efflux transporter in gut, liver, placenta',
    inducers: ['Rifampin'],
    inhibitors: ['Ritonavir', 'Cobicistat', 'Eltrombopag', 'Curcumin'],
    substrates: ['Rosuvastatin', 'Sulfasalazine', 'Topotecan', 'Methotrexate']
  }
};

const ARV_MECHANISMS: Record<string, { cyp: Record<string, string>; transporters: Record<string, string> }> = {
  'RTV': {
    cyp: {
      'CYP3A4': 'Strong inhibitor',
      'CYP2D6': 'Weak inhibitor',
      'CYP2C9': 'Inducer',
      'CYP2C19': 'Inducer',
      'CYP1A2': 'Inducer',
      'CYP2B6': 'Inducer'
    },
    transporters: {
      'P-gP': 'Inhibitor',
      'OATP1B1': 'Inhibitor',
      'MATE1': 'Inhibitor',
      'BCRP': 'Inhibitor'
    }
  },
  'COBI': {
    cyp: {
      'CYP3A4': 'Strong inhibitor',
      'CYP2D6': 'Weak inhibitor'
    },
    transporters: {
      'P-gP': 'Inhibitor',
      'OATP1B1': 'Inhibitor',
      'MATE1': 'Inhibitor',
      'BCRP': 'Inhibitor'
    }
  },
  'DTG': {
    cyp: {
      'CYP3A4': 'Minor substrate'
    },
    transporters: {
      'P-gP': 'Substrate',
      'OCT2': 'Inhibitor',
      'MATE1': 'Inhibitor'
    }
  },
  'BIC': {
    cyp: {
      'CYP3A4': 'Minor substrate'
    },
    transporters: {
      'OCT2': 'Inhibitor',
      'MATE1': 'Inhibitor'
    }
  },
  'ATV': {
    cyp: {
      'CYP3A4': 'Substrate & inhibitor'
    },
    transporters: {
      'P-gP': 'Substrate & inhibitor',
      'OATP1B1': 'Inhibitor'
    }
  },
  'DRV': {
    cyp: {
      'CYP3A4': 'Substrate'
    },
    transporters: {
      'P-gP': 'Substrate'
    }
  },
  'EFV': {
    cyp: {
      'CYP2B6': 'Primary substrate',
      'CYP3A4': 'Substrate & Inducer'
    },
    transporters: {}
  },
  'RPV': {
    cyp: {
      'CYP3A4': 'Substrate'
    },
    transporters: {}
  }
};

export function CYP450Visualizer() {
  const [selectedARV, setSelectedARV] = useState<string>('RTV');

  const arvMechanism = ARV_MECHANISMS[selectedARV];

  const getEffectColor = (effect: string) => {
    if (effect.includes('Strong')) return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (effect.includes('Moderate')) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    if (effect.includes('Weak')) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    if (effect.includes('Inhibitor')) return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    if (effect.includes('Inducer')) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (effect.includes('Substrate')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  return (
    <div className="space-y-6">
      {/* ARV Selector */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-400">
            <Beaker className="w-5 h-5" />
            ARV Metabolic Profile
          </CardTitle>
          <CardDescription>
            Select an ARV to view its CYP450 and transporter effects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.keys(ARV_MECHANISMS).map(arv => (
              <Badge
                key={arv}
                className={`cursor-pointer text-sm px-3 py-1 ${
                  selectedARV === arv 
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
                onClick={() => setSelectedARV(arv)}
              >
                {arv}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ARV Effects Display */}
      {arvMechanism && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-cyan-400">CYP450 Effects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(arvMechanism.cyp).map(([enzyme, effect]) => (
                  <div key={enzyme} className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg">
                    <span className="font-mono text-slate-300">{enzyme}</span>
                    <Badge className={getEffectColor(effect as string)}>{effect as string}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-purple-400">Transporter Effects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(arvMechanism.transporters).length > 0 ? (
                  Object.entries(arvMechanism.transporters).map(([transporter, effect]) => (
                    <div key={transporter} className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg">
                      <span className="font-mono text-slate-300">{transporter}</span>
                      <Badge className={getEffectColor(effect as string)}>{effect as string}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-4">No significant transporter effects</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Reference */}
      <Tabs defaultValue="cyp" className="space-y-4">
        <TabsList className="bg-slate-900/50">
          <TabsTrigger value="cyp">CYP450 Enzymes</TabsTrigger>
          <TabsTrigger value="transporters">Transporters</TabsTrigger>
        </TabsList>

        <TabsContent value="cyp">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(CYP_ENZYMES).map(([key, enzyme]) => (
              <Card key={key} className="bg-slate-900/50 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    {enzyme.name}
                  </CardTitle>
                  <CardDescription className="text-xs">{enzyme.fullName}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-400">{enzyme.description}</p>
                  
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Inducers</p>
                    <div className="flex flex-wrap gap-1">
                      {enzyme.inducers.map((ind, i) => (
                        <Badge key={i} variant="outline" className="text-xs border-emerald-500/30 text-emerald-400">
                          <PlusCircle className="w-3 h-3 mr-1" />
                          {ind}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Inhibitors</p>
                    <div className="flex flex-wrap gap-1">
                      {enzyme.inhibitors.map((inh, i) => (
                        <Badge key={i} variant="outline" className="text-xs border-rose-500/30 text-rose-400">
                          <MinusCircle className="w-3 h-3 mr-1" />
                          {inh}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Substrates</p>
                    <div className="flex flex-wrap gap-1">
                      {enzyme.substrates.slice(0, 3).map((sub, i) => (
                        <Badge key={i} variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                          <Circle className="w-3 h-3 mr-1" />
                          {sub}
                        </Badge>
                      ))}
                      {enzyme.substrates.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{enzyme.substrates.length - 3} more</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transporters">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(TRANSPORTERS).map(([key, transporter]) => (
              <Card key={key} className="bg-slate-900/50 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-400" />
                    {transporter.name}
                  </CardTitle>
                  <CardDescription className="text-xs">{transporter.gene}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-400">{transporter.function}</p>
                  
                  {transporter.inducers.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Inducers</p>
                      <div className="flex flex-wrap gap-1">
                        {transporter.inducers.map((ind, i) => (
                          <Badge key={i} variant="outline" className="text-xs border-emerald-500/30 text-emerald-400">
                            {ind}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Inhibitors</p>
                    <div className="flex flex-wrap gap-1">
                      {transporter.inhibitors.map((inh, i) => (
                        <Badge key={i} variant="outline" className="text-xs border-rose-500/30 text-rose-400">
                          {inh}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Substrates</p>
                    <div className="flex flex-wrap gap-1">
                      {transporter.substrates.map((sub, i) => (
                        <Badge key={i} variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                          {sub}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Legend */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Info className="w-4 h-4" />
            Legend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">Inhibitor</Badge>
              <span className="text-sm text-slate-500">Decreases enzyme activity</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Inducer</Badge>
              <span className="text-sm text-slate-500">Increases enzyme activity</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Substrate</Badge>
              <span className="text-sm text-slate-500">Metabolized by enzyme</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
