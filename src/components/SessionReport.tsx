import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PatientInfo } from '@/lib/openai';
import { Separator } from '@/components/ui/separator';
import { Check, Copy, Download, FileText } from 'lucide-react';
import { useState } from 'react';

export interface SessionReportData {
  patientInfo: PatientInfo;
  sessionDuration: string;
  summaryOfDiscussion: string;
  emotionsDetected: string[];
  aiAnalysis: string;
  doctorDiagnosis: string;
  diagnosisFeedback: {
    status: 'accurate' | 'partially accurate' | 'not consistent';
    explanation: string;
  };
  suggestedQuestions?: string[];
}

interface SessionReportProps {
  reportData: SessionReportData;
  onClose: () => void;
}

const SessionReport: React.FC<SessionReportProps> = ({ reportData, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyReport = () => {
    const reportText = `
SESSION REPORT
==============

Patient: ${reportData.patientInfo.name}, ${reportData.patientInfo.age} years old, ${reportData.patientInfo.gender}
Condition: ${reportData.patientInfo.condition}
Session Duration: ${reportData.sessionDuration}

SUMMARY OF DISCUSSION
--------------------
${reportData.summaryOfDiscussion}

EMOTIONS DETECTED
----------------
${reportData.emotionsDetected.join(', ')}

AI ANALYSIS OF PATIENT CONDITION
-------------------------------
${reportData.aiAnalysis}

DOCTOR'S DIAGNOSIS
----------------
${reportData.doctorDiagnosis}

AI FEEDBACK ON DIAGNOSIS
----------------------
Status: ${reportData.diagnosisFeedback.status}
${reportData.diagnosisFeedback.explanation}

${reportData.suggestedQuestions && reportData.suggestedQuestions.length > 0 ? `
SUGGESTED QUESTIONS FOR FUTURE SESSIONS
-------------------------------------
${reportData.suggestedQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}
` : ''}
`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    const reportText = `
SESSION REPORT
==============

Patient: ${reportData.patientInfo.name}, ${reportData.patientInfo.age} years old, ${reportData.patientInfo.gender}
Condition: ${reportData.patientInfo.condition}
Session Duration: ${reportData.sessionDuration}

SUMMARY OF DISCUSSION
--------------------
${reportData.summaryOfDiscussion}

EMOTIONS DETECTED
----------------
${reportData.emotionsDetected.join(', ')}

AI ANALYSIS OF PATIENT CONDITION
-------------------------------
${reportData.aiAnalysis}

DOCTOR'S DIAGNOSIS
----------------
${reportData.doctorDiagnosis}

AI FEEDBACK ON DIAGNOSIS
----------------------
Status: ${reportData.diagnosisFeedback.status}
${reportData.diagnosisFeedback.explanation}

${reportData.suggestedQuestions && reportData.suggestedQuestions.length > 0 ? `
SUGGESTED QUESTIONS FOR FUTURE SESSIONS
-------------------------------------
${reportData.suggestedQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}
` : ''}
`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session_report_${reportData.patientInfo.name}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getDiagnosisBadgeVariant = () => {
    switch (reportData.diagnosisFeedback.status) {
      case 'accurate':
        return 'default';
      case 'partially accurate':
        return 'secondary';
      case 'not consistent':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="bg-muted/50">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Session Report
          </CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleCopyReport}>
              {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadReport}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Patient Information</h3>
          <p>
            <span className="font-medium">Name:</span> {reportData.patientInfo.name}, {reportData.patientInfo.age} years old, {reportData.patientInfo.gender}
          </p>
          <p>
            <span className="font-medium">Condition:</span> {reportData.patientInfo.condition}
          </p>
          <p>
            <span className="font-medium">Session Duration:</span> {reportData.sessionDuration}
          </p>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-2">Summary of Discussion</h3>
          <p className="whitespace-pre-wrap text-muted-foreground">{reportData.summaryOfDiscussion}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Emotions Detected</h3>
          <div className="flex flex-wrap gap-2">
            {reportData.emotionsDetected.map((emotion, index) => (
              <Badge key={index} variant="outline">
                {emotion}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-2">AI Analysis of Patient Condition</h3>
          <p className="whitespace-pre-wrap text-muted-foreground">{reportData.aiAnalysis}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Doctor's Diagnosis</h3>
          <p className="whitespace-pre-wrap text-muted-foreground">{reportData.doctorDiagnosis}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">AI Feedback on Diagnosis</h3>
          <div className="mb-2">
            <Badge variant={getDiagnosisBadgeVariant()}>
              {reportData.diagnosisFeedback.status}
            </Badge>
          </div>
          <p className="whitespace-pre-wrap text-muted-foreground">{reportData.diagnosisFeedback.explanation}</p>
        </div>

        {reportData.suggestedQuestions && reportData.suggestedQuestions.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-2">Suggested Questions for Future Sessions</h3>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                {reportData.suggestedQuestions.map((question, index) => (
                  <li key={index}>{question}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-end border-t p-4">
        <Button onClick={onClose}>Close Report</Button>
      </CardFooter>
    </Card>
  );
};

export default SessionReport;