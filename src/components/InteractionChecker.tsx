import { useState } from 'react';
import { dataService } from '@/services/dataService';
import { pkSimulator } from '@/services/PKSimulator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  Info,
  Pill,
  Beaker,
  ArrowRight
} from 'lucide-react';
import type { PKSimulationResult } from '@/types';

export function InteractionChecker() {
  const [arvInput, setArvInput] = useState('');
  const [drugInput, setDrugInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<PKSimulationResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleCheck = () => {
    const arvs = arvInput.split(',').map(s => s.trim()).filter(Boolean);
    const drugs = drugInput.split(',').map(s => s.trim()).filter(Boolean);
    
    const simulationResults = pkSimulator.simulate(arvs, drugs);
    setResults(simulationResults);
    setHasSearched(true);
  };

  const handleSearch = () => {
    // Search functionality
    const interactions = dataService.searchInteractions(searchQuery);
    // Convert to PK results format for display
    const converted: PKSimulationResult[] = interactions.map(i => ({
      drugs: [i.arvDrug, i.otherDrug] as [string, string],
      predictedChange: i.interactionEffect || 'Unknown',
      clinicalAction: i.recommendations,
      confidence: 'NYSDOH 2025',
      mechanism: i.mechanism,
      severity: i.severity
    }));
    setResults(converted);
    setHasSearched(true);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'contraindicated':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'monitor':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'contraindicated':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      case 'monitor':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      default:
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'contraindicated':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Contraindicated</Badge>;
      case 'warning':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Warning</Badge>;
      case 'monitor':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Monitor</Badge>;
      default:
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">No Significant Interaction</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Check Panel */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-400">
              <Pill className="w-5 h-5" />
              Quick Interaction Check
            </CardTitle>
            <CardDescription>
              Enter ARV regimen and concomitant medications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">
                ARV Regimen (comma-separated)
              </label>
              <Input
                placeholder="e.g., DTG, FTC, TAF"
                value={arvInput}
                onChange={(e) => setArvInput(e.target.value)}
                className="bg-slate-950 border-slate-700 text-slate-100"
              />
              <p className="text-xs text-slate-500 mt-1">
                Examples: DTG, BIC, ATV, DRV, RPV, EFV, FTC, TAF, TDF
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">
                Concomitant Medications (comma-separated)
              </label>
              <Input
                placeholder="e.g., metformin, atorvastatin"
                value={drugInput}
                onChange={(e) => setDrugInput(e.target.value)}
                className="bg-slate-950 border-slate-700 text-slate-100"
              />
              <p className="text-xs text-slate-500 mt-1">
                Examples: metformin, atorvastatin, omeprazole, calcium
              </p>
            </div>

            <Button 
              onClick={handleCheck}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
            >
              <Beaker className="w-4 h-4 mr-2" />
              Check Interactions
            </Button>
          </CardContent>
        </Card>

        {/* Search Panel */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-400">
              <Search className="w-5 h-5" />
              Search Database
            </CardTitle>
            <CardDescription>
              Search documented interactions by drug name or mechanism
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">
                Search Query
              </label>
              <Input
                placeholder="Search drugs, mechanisms, recommendations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border-slate-700 text-slate-100"
              />
            </div>

            <Button 
              onClick={handleSearch}
              variant="outline"
              className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
            >
              <Search className="w-4 h-4 mr-2" />
              Search Database
            </Button>

            <div className="pt-4">
              <p className="text-sm font-medium text-slate-300 mb-2">Common ARV Drugs</p>
              <div className="flex flex-wrap gap-2">
                {['DTG', 'BIC', 'ATV', 'DRV', 'RPV', 'EFV', 'FTC', 'TAF'].map(drug => (
                  <Badge 
                    key={drug}
                    variant="outline"
                    className="cursor-pointer hover:bg-slate-800"
                    onClick={() => setArvInput(prev => prev ? `${prev}, ${drug}` : drug)}
                  >
                    {drug}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Panel */}
      {hasSearched && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Beaker className="w-5 h-5 text-emerald-400" />
              Interaction Results
              {results.length > 0 && (
                <Badge className="ml-2 bg-emerald-500/20 text-emerald-400">
                  {results.length} found
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <Alert className="bg-emerald-500/10 border-emerald-500/30">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <AlertTitle className="text-emerald-400">No Significant Interactions Found</AlertTitle>
                <AlertDescription>
                  Based on NYSDOH AI 2025 guidelines, no clinically significant interactions were identified 
                  between the specified medications. Always verify with full prescribing information.
                </AlertDescription>
              </Alert>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border ${getSeverityColor(result.severity)}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getSeverityIcon(result.severity)}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{result.drugs[0]}</span>
                              <ArrowRight className="w-4 h-4" />
                              <span className="font-semibold">{result.drugs[1]}</span>
                            </div>
                            {getSeverityBadge(result.severity)}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {result.confidence}
                        </Badge>
                      </div>

                      <Separator className="my-3 opacity-30" />

                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-slate-400">Mechanism:</span>
                          <p className="text-sm mt-1">{result.mechanism}</p>
                        </div>
                        
                        {result.predictedChange && result.predictedChange !== 'Unknown' && (
                          <div>
                            <span className="text-sm font-medium text-slate-400">Predicted Change:</span>
                            <p className="text-sm mt-1 font-mono bg-slate-950/50 px-2 py-1 rounded inline-block">
                              {result.predictedChange}
                            </p>
                          </div>
                        )}

                        <div>
                          <span className="text-sm font-medium text-slate-400">Clinical Action:</span>
                          <p className="text-sm mt-1">{result.clinicalAction}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-cyan-400">109</div>
            <p className="text-sm text-slate-400">Documented Interactions</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-400">37</div>
            <p className="text-sm text-slate-400">ARV Drugs</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-400">7</div>
            <p className="text-sm text-slate-400">Drug Classes</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-emerald-400">2025</div>
            <p className="text-sm text-slate-400">Guideline Version</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
