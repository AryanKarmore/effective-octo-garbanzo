import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  Beaker,
  BookOpen,
  Shield,
  Info
} from 'lucide-react';

// FDA Report Templates
const REPORT_TEMPLATES = {
  adverseEvent: {
    name: 'Adverse Event Report (MedWatch)',
    sections: [
      'Patient Information',
      'Adverse Event Description',
      'Suspect Medication(s)',
      'Concomitant Medications',
      'Reporter Information',
      'Event Outcome'
    ]
  },
  interactionStudy: {
    name: 'Drug Interaction Study Report',
    sections: [
      'Study Design',
      'PK Parameters',
      'Statistical Analysis',
      'Clinical Relevance',
      'Dosing Recommendations',
      'Labeling Implications'
    ]
  },
  rwePackage: {
    name: 'Real-World Evidence Package',
    sections: [
      'Data Sources',
      'Study Population',
      'Outcomes Measured',
      'Statistical Methods',
      'Results Summary',
      'Regulatory Implications'
    ]
  }
};

// Sample interaction case studies
const CASE_STUDIES = [
  {
    id: 'DDI-2025-001',
    title: 'DTG-Metformin Interaction in Elderly Patients',
    drugs: ['Dolutegravir (DTG)', 'Metformin'],
    mechanism: 'OCT2/MATE1 inhibition by DTG reduces metformin renal clearance',
    finding: '1.5-fold increase in metformin AUC; increased GI adverse effects',
    recommendation: 'Initiate metformin at 50% dose; monitor for lactic acidosis',
    severity: 'Moderate',
    evidence: 'Clinical trial + post-marketing data'
  },
  {
    id: 'DDI-2025-002',
    title: 'INSTI-Polyvalent Cation Chelation',
    drugs: ['Bictegravir (BIC)', 'Calcium Carbonate'],
    mechanism: 'Chelation forms insoluble complex, reducing INSTI absorption',
    finding: '35-45% reduction in BIC AUC when coadministered without food',
    recommendation: 'Separate dosing by 2 hours (INSTI before) or 6 hours (cations after)',
    severity: 'Moderate',
    evidence: 'Dedicated PK study'
  },
  {
    id: 'DDI-2025-003',
    title: 'PI-Boosted Statin Myopathy Risk',
    drugs: ['Darunavir/Ritonavir (DRV/r)', 'Simvastatin'],
    mechanism: 'CYP3A4 inhibition increases statin plasma concentrations',
    finding: '15-fold increase in simvastatin AUC; rhabdomyolysis cases reported',
    recommendation: 'CONTRAINDICATED - use pravastatin or pitavastatin instead',
    severity: 'Severe',
    evidence: 'Case reports + PK study'
  }
];

export function RegulatoryReporter() {
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof REPORT_TEMPLATES>('adverseEvent');
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const template = REPORT_TEMPLATES[selectedTemplate];
      const report = `
${template.name}
Generated: ${new Date().toLocaleDateString()}
Source: NYSDOH AI Drug-Drug Interaction Guide (October 7, 2025)

================================================================================
SUMMARY
================================================================================

This report documents drug-drug interactions based on the NYSDOH AIDS Institute 
2025 guidelines, incorporating data from clinical trials, post-marketing 
surveillance, and published literature.

Total Interactions Documented: 109
ARV Drugs Covered: 37
Guideline Version: October 7, 2025

================================================================================
${template.sections.map((section, i) => `${i + 1}. ${section.toUpperCase()}`).join('\n')}
================================================================================

${template.sections.map((section, i) => `
${i + 1}. ${section}
--------------------------------------------------------------------------------
[Content to be completed based on specific case/study data]

Key Points:
- Mechanism of interaction
- Clinical significance
- Management recommendations
- Supporting evidence
`).join('\n')}

================================================================================
REFERENCES
================================================================================

1. NYSDOH AIDS Institute. Drug-Drug Interactions. October 7, 2025.
2. DHHS Panel on Antiretroviral Guidelines. Adult and Adolescent ARV Guidelines.
3. University of Liverpool HIV Drug Interactions. www.hiv-druginteractions.org
4. FDA Drug Development and Drug Interactions Guidance.

================================================================================
DISCLAIMER
================================================================================

This report is generated for informational purposes based on published guidelines.
Clinical decisions should consider individual patient factors and full 
prescribing information.

Report ID: RPT-${Date.now()}
      `.trim();
      
      setGeneratedReport(report);
      setIsGenerating(false);
    }, 1500);
  };

  const downloadReport = () => {
    if (!generatedReport) return;
    
    const blob = new Blob([generatedReport], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `regulatory-report-${selectedTemplate}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Generator */}
        <Card className="bg-slate-900/50 border-slate-800 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-400">
              <FileText className="w-5 h-5" />
              Report Generator
            </CardTitle>
            <CardDescription>
              Generate regulatory submission documents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">
                Report Template
              </label>
              <div className="space-y-2">
                {Object.entries(REPORT_TEMPLATES).map(([key, template]) => (
                  <div
                    key={key}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate === key 
                        ? 'bg-indigo-500/20 border border-indigo-500/30' 
                        : 'bg-slate-950/50 border border-slate-800 hover:border-slate-700'
                    }`}
                    onClick={() => setSelectedTemplate(key as keyof typeof REPORT_TEMPLATES)}
                  >
                    <div className="flex items-center gap-2">
                      {key === 'adverseEvent' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                      {key === 'interactionStudy' && <Beaker className="w-4 h-4 text-cyan-400" />}
                      {key === 'rwePackage' && <BookOpen className="w-4 h-4 text-emerald-400" />}
                      <span className="text-sm font-medium text-slate-200">{template.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={generateReport}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
            >
              <FileText className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </Button>

            {generatedReport && (
              <Button 
                onClick={downloadReport}
                variant="outline"
                className="w-full border-emerald-500/30 text-emerald-400"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Preview Panel */}
        <Card className="bg-slate-900/50 border-slate-800 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-400">
              <BookOpen className="w-5 h-5" />
              Report Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {generatedReport ? (
              <div className="bg-slate-950 rounded-lg border border-slate-800 p-4">
                <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono overflow-auto max-h-[500px]">
                  {generatedReport}
                </pre>
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center bg-slate-950/50 rounded-lg border border-slate-800">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500">Select a template and generate report</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Case Studies */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-400">
            <Shield className="w-5 h-5" />
            Documented Interaction Case Studies
          </CardTitle>
          <CardDescription>
            FDA submission-ready interaction documentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {CASE_STUDIES.map((study) => (
              <div key={study.id} className="p-4 bg-slate-950/50 rounded-lg border border-slate-800">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-slate-800 text-slate-300">{study.id}</Badge>
                      <span className="font-semibold text-slate-200">{study.title}</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      {study.drugs.join(' + ')}
                    </p>
                  </div>
                  <Badge 
                    className={
                      study.severity === 'Severe' 
                        ? 'bg-red-500/20 text-red-400'
                        : study.severity === 'Moderate'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }
                  >
                    {study.severity}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Mechanism:</span>
                    <p className="text-slate-300">{study.mechanism}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Finding:</span>
                    <p className="text-slate-300">{study.finding}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-slate-500">Recommendation:</span>
                    <p className="text-cyan-400">{study.recommendation}</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Beaker className="w-3 h-3" />
                    Evidence: {study.evidence}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Guideline Citations */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-400">
            <Info className="w-5 h-5" />
            Guideline Citations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950/50 rounded-lg">
              <h4 className="font-semibold text-slate-200 mb-2">Primary Source</h4>
              <p className="text-sm text-slate-400">
                New York State Department of Health AIDS Institute. 
                Drug-Drug Interactions. October 7, 2025.
              </p>
              <Badge className="mt-2 bg-emerald-500/20 text-emerald-400">
                <CheckCircle className="w-3 h-3 mr-1" />
                Current
              </Badge>
            </div>
            <div className="p-4 bg-slate-950/50 rounded-lg">
              <h4 className="font-semibold text-slate-200 mb-2">Supporting Guidelines</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• DHHS Panel on Antiretroviral Guidelines</li>
                <li>• IAS-USA Antiretroviral Therapy Guidelines</li>
                <li>• EACS Guidelines version 12.0</li>
                <li>• WHO Consolidated ARV Guidelines</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
