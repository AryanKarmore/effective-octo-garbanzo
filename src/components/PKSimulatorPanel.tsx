import { useState, useMemo } from 'react';
import { pkSimulator } from '@/services/PKSimulator';
import type { PKCurve } from '@/services/PKSimulator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TrendingUp, Activity, Clock, Beaker, Calculator } from 'lucide-react';

export function PKSimulatorPanel() {
  const [regimen, setRegimen] = useState('DTG');
  const [concomitant, setConcomitant] = useState('');
  const [dose, setDose] = useState(50);
  const [frequency, setFrequency] = useState(24);
  const [duration, setDuration] = useState(72);
  const [curves, setCurves] = useState<PKCurve[]>([]);
  const [hasSimulated, setHasSimulated] = useState(false);

  const handleSimulate = () => {
    const arvs = regimen.split(',').map(s => s.trim()).filter(Boolean);
    const drugs = concomitant.split(',').map(s => s.trim()).filter(Boolean);
    
    // Get interaction results
    const interactions = pkSimulator.simulate(arvs, drugs);
    
    // Generate curves for each ARV
    const newCurves: PKCurve[] = [];
    for (const arv of arvs) {
      const curve = pkSimulator.generateConcentrationCurve(
        arv,
        dose,
        frequency,
        duration,
        interactions
      );
      newCurves.push(curve);
    }
    
    setCurves(newCurves);
    setHasSimulated(true);
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    if (curves.length === 0) return [];
    
    // Find the longest curve
    const maxPoints = Math.max(...curves.map(c => c.data.length));
    
    const data = [];
    for (let i = 0; i < maxPoints; i++) {
      const point: any = { time: curves[0]?.data[i]?.time || i * 0.5 };
      curves.forEach(curve => {
        if (curve.data[i]) {
          point[curve.drug] = parseFloat(curve.data[i].concentration.toFixed(2));
        }
      });
      data.push(point);
    }
    return data;
  }, [curves]);

  const colors = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <Card className="bg-slate-900/50 border-slate-800 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-400">
              <Calculator className="w-5 h-5" />
              PK Parameters
            </CardTitle>
            <CardDescription>
              Configure simulation parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-slate-300">ARV Drug(s)</Label>
              <Input
                value={regimen}
                onChange={(e) => setRegimen(e.target.value)}
                placeholder="e.g., DTG"
                className="bg-slate-950 border-slate-700 text-slate-100 mt-1"
              />
            </div>

            <div>
              <Label className="text-sm text-slate-300">Concomitant Drug(s)</Label>
              <Input
                value={concomitant}
                onChange={(e) => setConcomitant(e.target.value)}
                placeholder="e.g., metformin"
                className="bg-slate-950 border-slate-700 text-slate-100 mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-slate-300">Dose (mg)</Label>
                <Input
                  type="number"
                  value={dose}
                  onChange={(e) => setDose(Number(e.target.value))}
                  className="bg-slate-950 border-slate-700 text-slate-100 mt-1"
                />
              </div>
              <div>
                <Label className="text-sm text-slate-300">Frequency (h)</Label>
                <Input
                  type="number"
                  value={frequency}
                  onChange={(e) => setFrequency(Number(e.target.value))}
                  className="bg-slate-950 border-slate-700 text-slate-100 mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm text-slate-300">Duration (h)</Label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="bg-slate-950 border-slate-700 text-slate-100 mt-1"
              />
            </div>

            <Button 
              onClick={handleSimulate}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
            >
              <Activity className="w-4 h-4 mr-2" />
              Run Simulation
            </Button>

            <div className="pt-4 space-y-2">
              <p className="text-xs font-medium text-slate-400">Quick Select</p>
              <div className="flex flex-wrap gap-2">
                {['DTG', 'BIC', 'ATV', 'RPV'].map(drug => (
                  <Badge 
                    key={drug}
                    variant="outline"
                    className="cursor-pointer hover:bg-slate-800"
                    onClick={() => setRegimen(drug)}
                  >
                    {drug}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart Panel */}
        <Card className="bg-slate-900/50 border-slate-800 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-400">
              <TrendingUp className="w-5 h-5" />
              Concentration-Time Profile
            </CardTitle>
            <CardDescription>
              Predicted plasma concentration over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasSimulated && curves.length > 0 ? (
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#94a3b8"
                      label={{ value: 'Time (hours)', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
                    />
                    <YAxis 
                      stroke="#94a3b8"
                      label={{ value: 'Concentration (mg/L)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        border: '1px solid #334155',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    {curves.map((curve, index) => (
                      <Line
                        key={curve.drug}
                        type="monotone"
                        dataKey={curve.drug}
                        stroke={colors[index % colors.length]}
                        strokeWidth={2}
                        dot={false}
                        name={`${curve.drug} (Cmax: ${curve.cmax.toFixed(2)})`}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center bg-slate-950/50 rounded-lg border border-slate-800">
                <div className="text-center">
                  <Beaker className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500">Configure parameters and run simulation</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* PK Parameters Display */}
      {hasSimulated && curves.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {curves.map((curve, index) => (
            <Card key={curve.drug} className="bg-slate-900/50 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg" style={{ color: colors[index % colors.length] }}>
                  {curve.drug}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-400">Cmax</span>
                    <span className="text-sm font-mono">{curve.cmax.toFixed(2)} mg/L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-400">Tmax</span>
                    <span className="text-sm font-mono">{curve.tmax.toFixed(1)} h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-400">AUC</span>
                    <span className="text-sm font-mono">{curve.auc.toFixed(1)} mg·h/L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-400">t½</span>
                    <span className="text-sm font-mono">{curve.halfLife.toFixed(1)} h</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Food Effects */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-400">
            <Clock className="w-5 h-5" />
            Food Effect Guidance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['DTG', 'BIC', 'ATV', 'RPV', 'EFV'].map(drug => {
              const effects = pkSimulator.getFoodEffect(drug);
              return (
                <div key={drug} className="p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                  <Badge className="mb-2 bg-amber-500/20 text-amber-400">{drug}</Badge>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-slate-400">With food:</span> {effects.withFood}</p>
                    <p><span className="text-slate-400">Without food:</span> {effects.withoutFood}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
