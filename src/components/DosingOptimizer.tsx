import { useState } from 'react';
import { pkSimulator } from '@/services/PKSimulator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Clock, Calendar, AlertTriangle, CheckCircle, Utensils } from 'lucide-react';
import type { ScheduleConflict, DosingSchedule } from '@/types';

export function DosingOptimizer() {
  const [regimen, setRegimen] = useState('DTG, FTC, TAF');
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
  const [hasOptimized, setHasOptimized] = useState(false);

  const handleOptimize = () => {
    const drugs = regimen.split(',').map(s => s.trim()).filter(Boolean);
    const scheduleConflicts = pkSimulator.optimizeSchedule(drugs);
    setConflicts(scheduleConflicts);
    setHasOptimized(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      default:
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  // Sample optimized schedules for common regimens
  const getOptimizedSchedule = (regimenName: string): DosingSchedule[] => {
    const schedules: Record<string, DosingSchedule[]> = {
      'Biktarvy': [
        { time: '08:00', medication: 'BIC/FTC/TAF (Biktarvy)', notes: 'Take with food' },
      ],
      'Triumeq': [
        { time: '08:00', medication: 'ABC/DTG/3TC (Triumeq)', notes: 'Can take with or without food' },
      ],
      'Genvoya': [
        { time: '08:00', medication: 'EVG/COBI/FTC/TAF (Genvoya)', notes: 'Take with food' },
      ],
      'DTG+FTC/TAF': [
        { time: '08:00', medication: 'DTG + FTC/TAF', notes: 'DTG can take with or without food' },
      ],
      'DTG+RPV': [
        { time: '08:00', medication: 'DTG + RPV', notes: 'Take with meal (≥390 calories)' },
      ],
      'ATV/RTV': [
        { time: '08:00', medication: 'ATV/RTV', notes: 'Take with food' },
        { time: '20:00', medication: 'If H2RA needed: take ≥10h after ATV', notes: '' },
      ],
    };
    return schedules[regimenName] || [];
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-400">
              <Clock className="w-5 h-5" />
              Regimen Input
            </CardTitle>
            <CardDescription>
              Enter ARV regimen to optimize dosing schedule
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">
                ARV Regimen
              </label>
              <Input
                value={regimen}
                onChange={(e) => setRegimen(e.target.value)}
                placeholder="e.g., DTG, FTC, TAF"
                className="bg-slate-950 border-slate-700 text-slate-100"
              />
            </div>

            <Button 
              onClick={handleOptimize}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Optimize Schedule
            </Button>

            <div className="pt-4">
              <p className="text-sm font-medium text-slate-300 mb-2">Quick Select Regimens</p>
              <div className="space-y-2">
                {['Biktarvy', 'Triumeq', 'Genvoya', 'DTG+FTC/TAF', 'DTG+RPV', 'ATV/RTV'].map(r => (
                  <Badge 
                    key={r}
                    variant="outline"
                    className="cursor-pointer hover:bg-slate-800 mr-2"
                    onClick={() => setRegimen(r)}
                  >
                    {r}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Schedule View */}
        <Card className="bg-slate-900/50 border-slate-800 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-400">
              <Calendar className="w-5 h-5" />
              Optimized Daily Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasOptimized ? (
              <div className="space-y-4">
                {/* Timeline */}
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-700"></div>
                  
                  {conflicts.length > 0 ? (
                    conflicts.map((conflict, idx) => (
                      <div key={idx} className="mb-6">
                        <Alert className={`mb-4 ${getSeverityColor(conflict.severity)}`}>
                          {getSeverityIcon(conflict.severity)}
                          <AlertTitle className="ml-2">
                            {conflict.drugs.join(' + ')}
                          </AlertTitle>
                          <AlertDescription className="ml-2">
                            {conflict.timingRule}
                          </AlertDescription>
                        </Alert>
                        
                        <div className="space-y-2 ml-8">
                          {conflict.visualSchedule.map((slot, sidx) => (
                            <div key={sidx} className="flex items-start gap-4 p-3 bg-slate-950/50 rounded-lg">
                              <div className="flex items-center gap-2 min-w-[80px]">
                                <Clock className="w-4 h-4 text-slate-500" />
                                <span className="font-mono text-slate-300">{slot.time}</span>
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-slate-200">{slot.medication}</p>
                                {slot.notes && (
                                  <p className="text-sm text-slate-500">{slot.notes}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="ml-8 space-y-2">
                      {getOptimizedSchedule(regimen).map((slot, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-3 bg-slate-950/50 rounded-lg">
                          <div className="flex items-center gap-2 min-w-[80px]">
                            <Clock className="w-4 h-4 text-slate-500" />
                            <span className="font-mono text-slate-300">{slot.time}</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-200">{slot.medication}</p>
                            {slot.notes && (
                              <p className="text-sm text-slate-500">{slot.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {getOptimizedSchedule(regimen).length === 0 && (
                        <Alert className="bg-emerald-500/10 border-emerald-500/30">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <AlertTitle className="text-emerald-400">No Timing Conflicts</AlertTitle>
                          <AlertDescription>
                            This regimen has no significant timing interactions. All medications can be taken together.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center bg-slate-950/50 rounded-lg border border-slate-800">
                <div className="text-center">
                  <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500">Enter a regimen to see optimized schedule</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timing Rules Reference */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-400">
            <Utensils className="w-5 h-5" />
            Common Timing Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800">
              <Badge className="mb-2 bg-cyan-500/20 text-cyan-400">INSTIs + Cations</Badge>
              <p className="text-sm text-slate-300">DTG/BIC with calcium/iron/magnesium</p>
              <p className="text-sm text-slate-500 mt-1">Separate by 2h before or 6h after</p>
            </div>
            
            <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800">
              <Badge className="mb-2 bg-amber-500/20 text-amber-400">ATV + Acid Reducers</Badge>
              <p className="text-sm text-slate-300">Atazanavir with PPIs/H2RAs</p>
              <p className="text-sm text-slate-500 mt-1">PPIs ≥12h before; H2RAs simultaneously or ≥10h after</p>
            </div>
            
            <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800">
              <Badge className="mb-2 bg-red-500/20 text-red-400">RPV + PPIs</Badge>
              <p className="text-sm text-slate-300">Rilpivirine with proton pump inhibitors</p>
              <p className="text-sm text-slate-500 mt-1">CONTRAINDICATED - use H2RA instead</p>
            </div>
            
            <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800">
              <Badge className="mb-2 bg-emerald-500/20 text-emerald-400">Food Requirements</Badge>
              <p className="text-sm text-slate-300">RPV, ATV, BIC require food</p>
              <p className="text-sm text-slate-500 mt-1">Take with meal for optimal absorption</p>
            </div>
            
            <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800">
              <Badge className="mb-2 bg-purple-500/20 text-purple-400">DTG + Rifampin</Badge>
              <p className="text-sm text-slate-300">Dolutegravir with strong inducers</p>
              <p className="text-sm text-slate-500 mt-1">Increase DTG to 50mg BID</p>
            </div>
            
            <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800">
              <Badge className="mb-2 bg-blue-500/20 text-blue-400">BIC + Antacids</Badge>
              <p className="text-sm text-slate-300">Bictegravir with aluminum/magnesium</p>
              <p className="text-sm text-slate-500 mt-1">Separate by 6h before or 2h after</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
