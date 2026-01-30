import { useState, useEffect } from 'react';
import { dataService } from '@/services/dataService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  FlaskConical, 
  FileText, 
  Search,
  Beaker,
  Dna,
  Clock,
  TrendingUp,
  Shield,
  Microscope,
  Database
} from 'lucide-react';
import { PKSimulatorPanel } from '@/components/PKSimulatorPanel';
import { CYP450Visualizer } from '@/components/CYP450Visualizer';
import { MolecularLab } from '@/components/MolecularLab';
import { DosingOptimizer } from '@/components/DosingOptimizer';
import { EvidenceDashboard } from '@/components/EvidenceDashboard';
import { FormulationOptimizer } from '@/components/FormulationOptimizer';
import { RegulatoryReporter } from '@/components/RegulatoryReporter';
import { InteractionChecker } from '@/components/InteractionChecker';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('interactions');

  useEffect(() => {
    const init = async () => {
      await dataService.initialize();
      setIsLoading(false);
    };
    init();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-400 text-lg font-semibold">Loading HIV Drug Interaction Database...</p>
          <p className="text-slate-400 text-sm mt-2">NYSDOH AI 2025 Guidelines</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Dna className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  HIV Drug Interaction Platform
                </h1>
                <p className="text-xs text-slate-400">NYSDOH AI 2025 Guidelines</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
                <Activity className="w-3 h-3 mr-1" />
                Live Data
              </Badge>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                <Shield className="w-3 h-3 mr-1" />
                Clinical Grade
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-2 bg-slate-900/50 p-2 rounded-xl">
            <TabsTrigger value="interactions" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <Search className="w-4 h-4 mr-2" />
              Interactions
            </TabsTrigger>
            <TabsTrigger value="pk" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              <TrendingUp className="w-4 h-4 mr-2" />
              PK Simulator
            </TabsTrigger>
            <TabsTrigger value="molecular" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400">
              <Microscope className="w-4 h-4 mr-2" />
              3D Molecular
            </TabsTrigger>
            <TabsTrigger value="cyp450" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              <Beaker className="w-4 h-4 mr-2" />
              CYP450
            </TabsTrigger>
            <TabsTrigger value="dosing" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
              <Clock className="w-4 h-4 mr-2" />
              Dosing
            </TabsTrigger>
            <TabsTrigger value="evidence" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
              <Database className="w-4 h-4 mr-2" />
              Evidence
            </TabsTrigger>
            <TabsTrigger value="formulation" className="data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-400">
              <FlaskConical className="w-4 h-4 mr-2" />
              Formulation
            </TabsTrigger>
            <TabsTrigger value="regulatory" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">
              <FileText className="w-4 h-4 mr-2" />
              Regulatory
            </TabsTrigger>
          </TabsList>

          <TabsContent value="interactions" className="space-y-4">
            <InteractionChecker />
          </TabsContent>

          <TabsContent value="pk" className="space-y-4">
            <PKSimulatorPanel />
          </TabsContent>

          <TabsContent value="molecular" className="space-y-4">
            <MolecularLab />
          </TabsContent>

          <TabsContent value="cyp450" className="space-y-4">
            <CYP450Visualizer />
          </TabsContent>

          <TabsContent value="dosing" className="space-y-4">
            <DosingOptimizer />
          </TabsContent>

          <TabsContent value="evidence" className="space-y-4">
            <EvidenceDashboard />
          </TabsContent>

          <TabsContent value="formulation" className="space-y-4">
            <FormulationOptimizer />
          </TabsContent>

          <TabsContent value="regulatory" className="space-y-4">
            <RegulatoryReporter />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              Data Source: NYSDOH AI Drug-Drug Interaction Guide (October 7, 2025)
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>109 Documented Interactions</span>
              <span>•</span>
              <span>37 ARV Drugs</span>
              <span>•</span>
              <span>7 Drug Classes</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
