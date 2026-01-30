import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  Search, 
  TrendingUp, 
  Pill, 
  AlertTriangle,
  Users,
  Activity,
  Microscope
} from 'lucide-react';

// Mock real-world evidence data
const EVIDENCE_DATA = {
  virologicSuppression: {
    'Biktarvy': { rate: 92, n: 1247, time: '48 weeks' },
    'Triumeq': { rate: 89, n: 983, time: '48 weeks' },
    'Genvoya': { rate: 91, n: 1124, time: '48 weeks' },
    'Dovato': { rate: 88, n: 756, time: '48 weeks' },
    'Symtuza': { rate: 90, n: 892, time: '48 weeks' },
  },
  resistancePatterns: [
    { mutation: 'M184V', prevalence: 45, drugs: '3TC, FTC', clinicalImpact: 'High' },
    { mutation: 'K65R', prevalence: 12, drugs: 'TDF, TAF, ABC', clinicalImpact: 'Moderate' },
    { mutation: 'INSTI-R', prevalence: 8, drugs: 'DTG, BIC, RAL', clinicalImpact: 'High' },
    { mutation: 'M46I', prevalence: 22, drugs: 'ATV, DRV', clinicalImpact: 'Moderate' },
    { mutation: 'K103N', prevalence: 35, drugs: 'EFV, NVP', clinicalImpact: 'High' },
  ],
  adherenceData: [
    { regimen: 'Single tablet', adherence: 87, discontinuation: 8 },
    { regimen: '2 tablets', adherence: 78, discontinuation: 14 },
    { regimen: '3+ tablets', adherence: 65, discontinuation: 23 },
    { regimen: 'Injectable', adherence: 94, discontinuation: 5 },
  ],
  sideEffects: [
    { drug: 'TAF', effect: 'Renal', incidence: 3, severity: 'Mild' },
    { drug: 'TDF', effect: 'Renal/Bone', incidence: 12, severity: 'Moderate' },
    { drug: 'ABC', effect: 'Hypersensitivity', incidence: 5, severity: 'Severe' },
    { drug: 'EFV', effect: 'CNS', incidence: 45, severity: 'Mild-Moderate' },
    { drug: 'DTG', effect: 'Weight Gain', incidence: 18, severity: 'Mild' },
  ],
  pillBurden: [
    { drugs: ['BIC', 'FTC', 'TAF'], count: 1, name: 'Biktarvy' },
    { drugs: ['DTG', 'ABC', '3TC'], count: 1, name: 'Triumeq' },
    { drugs: ['DTG', 'RPV'], count: 1, name: 'Juluca' },
    { drugs: ['EVG', 'COBI', 'FTC', 'TAF'], count: 1, name: 'Genvoya' },
    { drugs: ['DRV', 'COBI', 'FTC', 'TAF'], count: 1, name: 'Symtuza' },
  ]
};

const SAMPLE_QUERIES = [
  "What's the virologic failure rate for Biktarvy in patients >65?",
  "Which 3-drug combos have lowest pill burden but highest efficacy?",
  "Emerging resistance patterns in our network this quarter",
  "Side effect profiles: DTG vs BIC",
  "Adherence rates by formulation type",
  "INSTI resistance trends 2020-2025"
];

export function EvidenceDashboard() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<string | null>(null);

  const handleSearch = () => {
    setIsSearching(true);
    // Simulate search
    setTimeout(() => {
      setSearchResult(`Based on NYSDOH AI 2025 guidelines and real-world evidence:\n\n` +
        `For "${query}", the data shows:\n\n` +
        `• Biktarvy (BIC/FTC/TAF): 92% virologic suppression at 48 weeks (n=1,247)\n` +
        `• Discontinuation rate: 8% (primarily due to insurance/cost)\n` +
        `• No significant difference in efficacy by age group (>65 vs <65)\n` +
        `• Weight gain: +2.1kg median at 48 weeks\n\n` +
        `Source: NYSDOH AI 2025, pooled clinical trial data`
      );
      setIsSearching(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Query Interface */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <Database className="w-5 h-5" />
            Real-World Evidence Query
          </CardTitle>
          <CardDescription>
            Ask questions about virologic outcomes, resistance patterns, and treatment effectiveness
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about HIV treatment data..."
              className="flex-1 bg-slate-950 border-slate-700 text-slate-100"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button 
              onClick={handleSearch}
              disabled={isSearching || !query}
              className="bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              <Search className="w-4 h-4 mr-2" />
              {isSearching ? 'Searching...' : 'Query'}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-slate-500">Suggested:</span>
            {SAMPLE_QUERIES.slice(0, 4).map((q, i) => (
              <Badge 
                key={i}
                variant="outline"
                className="cursor-pointer hover:bg-slate-800 text-xs"
                onClick={() => setQuery(q)}
              >
                {q.length > 40 ? q.substring(0, 40) + '...' : q}
              </Badge>
            ))}
          </div>

          {searchResult && (
            <div className="mt-4 p-4 bg-slate-950/50 rounded-lg border border-slate-800">
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans">{searchResult}</pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dashboard Tabs */}
      <Tabs defaultValue="efficacy" className="space-y-4">
        <TabsList className="bg-slate-900/50">
          <TabsTrigger value="efficacy">
            <TrendingUp className="w-4 h-4 mr-2" />
            Efficacy
          </TabsTrigger>
          <TabsTrigger value="resistance">
            <Microscope className="w-4 h-4 mr-2" />
            Resistance
          </TabsTrigger>
          <TabsTrigger value="adherence">
            <Users className="w-4 h-4 mr-2" />
            Adherence
          </TabsTrigger>
          <TabsTrigger value="safety">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Safety
          </TabsTrigger>
        </TabsList>

        <TabsContent value="efficacy" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(EVIDENCE_DATA.virologicSuppression).map(([regimen, data]) => (
              <Card key={regimen} className="bg-slate-900/50 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-cyan-400">{regimen}</CardTitle>
                  <CardDescription>{data.time}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-emerald-400">{data.rate}%</span>
                    <span className="text-sm text-slate-500 mb-1">suppression</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">n={data.n.toLocaleString()}</p>
                  <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                      style={{ width: `${data.rate}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-purple-400" />
                Pill Burden Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {EVIDENCE_DATA.pillBurden.map((reg) => (
                  <div key={reg.name} className="p-3 bg-slate-950/50 rounded-lg text-center">
                    <Badge className="mb-2 bg-purple-500/20 text-purple-400">{reg.name}</Badge>
                    <p className="text-2xl font-bold text-slate-200">{reg.count}</p>
                    <p className="text-xs text-slate-500">tablet{reg.count > 1 ? 's' : ''}/day</p>
                    <p className="text-xs text-slate-600 mt-1">{reg.drugs.join('/')}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resistance" className="space-y-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-400">
                <Microscope className="w-5 h-5" />
                Emerging Resistance Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {EVIDENCE_DATA.resistancePatterns.map((pattern) => (
                  <div key={pattern.mutation} className="flex items-center gap-4 p-3 bg-slate-950/50 rounded-lg">
                    <div className="w-16 text-center">
                      <span className="text-lg font-bold text-amber-400">{pattern.prevalence}%</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-200">{pattern.mutation}</span>
                        <Badge 
                          className={
                            pattern.clinicalImpact === 'High' 
                              ? 'bg-red-500/20 text-red-400' 
                              : 'bg-amber-500/20 text-amber-400'
                          }
                        >
                          {pattern.clinicalImpact} Impact
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500">Affects: {pattern.drugs}</p>
                    </div>
                    <div className="h-2 w-24 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500"
                        style={{ width: `${pattern.prevalence * 2}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adherence" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-emerald-400">Adherence by Formulation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {EVIDENCE_DATA.adherenceData.map((data) => (
                    <div key={data.regimen} className="p-3 bg-slate-950/50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-300">{data.regimen}</span>
                        <span className="text-emerald-400 font-bold">{data.adherence}%</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                          style={{ width: `${data.adherence}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Discontinuation: {data.discontinuation}%
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-blue-400">Key Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-slate-950/50 rounded-lg">
                    <Activity className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-200">Injectable ART</p>
                      <p className="text-sm text-slate-500">Highest adherence (94%) with lowest discontinuation (5%)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-950/50 rounded-lg">
                    <Pill className="w-5 h-5 text-cyan-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-200">Single-Tablet Regimens</p>
                      <p className="text-sm text-slate-500">87% adherence vs 65% for 3+ tablets</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-950/50 rounded-lg">
                    <Users className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-200">Age Factor</p>
                      <p className="text-sm text-slate-500">Patients &gt;50 show 12% better adherence</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="safety" className="space-y-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                Side Effect Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {EVIDENCE_DATA.sideEffects.map((se) => (
                  <div key={`${se.drug}-${se.effect}`} className="flex items-center gap-4 p-3 bg-slate-950/50 rounded-lg">
                    <Badge className="bg-slate-800 text-slate-300 min-w-[60px]">{se.drug}</Badge>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-200">{se.effect}</span>
                        <Badge 
                          className={
                            se.severity === 'Severe' 
                              ? 'bg-red-500/20 text-red-400'
                              : se.severity === 'Moderate'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }
                        >
                          {se.severity}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-rose-400 font-bold">{se.incidence}%</span>
                      <div className="h-2 w-16 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-rose-500"
                          style={{ width: `${se.incidence * 2}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
