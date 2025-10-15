import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { SessionReportData } from '@/components/SessionReport';
import Link from 'next/link';
import Head from 'next/head';
import { Badge } from '@/components/ui/badge';

function ReportPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [report, setReport] = useState<SessionReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !user) return;

    const fetchReport = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/generate-report`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversationId: id,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch report');
        }

        const data = await response.json();
        setReport(data);
      } catch (err) {
        console.error('Error fetching report:', err);
        setError('Failed to load the session report. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [id, user]);

  const getDiagnosisBadgeVariant = () => {
    if (!report) return 'outline';
    
    switch (report.diagnosisFeedback.status) {
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

  const handleCopyReport = () => {
    if (!report) return;
    
    const reportText = `
SESSION REPORT
==============

Patient: ${report.patientInfo.name}, ${report.patientInfo.age} years old, ${report.patientInfo.gender}
Condition: ${report.patientInfo.condition}
Session Duration: ${report.sessionDuration}

SUMMARY OF DISCUSSION
--------------------
${report.summaryOfDiscussion}

EMOTIONS DETECTED
----------------
${report.emotionsDetected.join(', ')}

AI ANALYSIS OF PATIENT CONDITION
-------------------------------
${report.aiAnalysis}

DOCTOR'S DIAGNOSIS
----------------
${report.doctorDiagnosis}

AI FEEDBACK ON DIAGNOSIS
----------------------
Status: ${report.diagnosisFeedback.status}
${report.diagnosisFeedback.explanation}

${report.suggestedQuestions && report.suggestedQuestions.length > 0 ? `
SUGGESTED QUESTIONS FOR FUTURE SESSIONS
-------------------------------------
${report.suggestedQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}
` : ''}
`;

    navigator.clipboard.writeText(reportText);
    // You could add a toast notification here
  };

  const handleDownloadReport = () => {
    if (!report) return;
    
    const reportText = `
SESSION REPORT
==============

Patient: ${report.patientInfo.name}, ${report.patientInfo.age} years old, ${report.patientInfo.gender}
Condition: ${report.patientInfo.condition}
Session Duration: ${report.sessionDuration}

SUMMARY OF DISCUSSION
--------------------
${report.summaryOfDiscussion}

EMOTIONS DETECTED
----------------
${report.emotionsDetected.join(', ')}

AI ANALYSIS OF PATIENT CONDITION
-------------------------------
${report.aiAnalysis}

DOCTOR'S DIAGNOSIS
----------------
${report.doctorDiagnosis}

AI FEEDBACK ON DIAGNOSIS
----------------------
Status: ${report.diagnosisFeedback.status}
${report.diagnosisFeedback.explanation}

${report.suggestedQuestions && report.suggestedQuestions.length > 0 ? `
SUGGESTED QUESTIONS FOR FUTURE SESSIONS
-------------------------------------
${report.suggestedQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}
` : ''}
`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session_report_${report.patientInfo.name}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Head>
        <title>Session Report | Virtual Doctor</title>
      </Head>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b p-4">
          <div className="container mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <div className="flex items-center">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="mr-2 sm:mr-4">
                  <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Back to Dashboard</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold">Session Report</h1>
            </div>
            <div className="flex space-x-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopyReport}
                disabled={!report}
                className="flex-1 sm:flex-none"
              >
                Copy Report
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownloadReport}
                disabled={!report}
                className="flex-1 sm:flex-none"
              >
                Download Report
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container mx-auto py-8 px-4 md:px-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p className="text-lg font-medium">Loading Session Report...</p>
            </div>
          ) : error ? (
            <Card className="p-6 text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button asChild>
                <Link href="/dashboard">Return to Dashboard</Link>
              </Button>
            </Card>
          ) : report ? (
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Patient Information */}
              <Card className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Patient Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{report.patientInfo.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Age & Gender</p>
                    <p className="font-medium">{report.patientInfo.age} years old, {report.patientInfo.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Condition</p>
                    <p className="font-medium">{report.patientInfo.condition}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Session Duration</p>
                    <p className="font-medium">{report.sessionDuration}</p>
                  </div>
                </div>
              </Card>

              {/* Summary of Discussion */}
              <Card className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Summary of Discussion</h2>
                <p className="whitespace-pre-wrap text-muted-foreground">{report.summaryOfDiscussion}</p>
              </Card>

              {/* Emotions Detected */}
              <Card className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Emotions Detected</h2>
                <div className="flex flex-wrap gap-2">
                  {report.emotionsDetected.map((emotion, index) => (
                    <Badge key={index} variant="outline" className="text-sm sm:text-base py-1 px-2 sm:px-3">
                      {emotion}
                    </Badge>
                  ))}
                </div>
              </Card>

              {/* AI Analysis */}
              <Card className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">AI Analysis of Patient Condition</h2>
                <p className="whitespace-pre-wrap text-muted-foreground">{report.aiAnalysis}</p>
              </Card>

              {/* Doctor's Diagnosis */}
              <Card className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Doctor's Diagnosis</h2>
                <p className="whitespace-pre-wrap text-muted-foreground">{report.doctorDiagnosis}</p>
              </Card>

              {/* AI Feedback on Diagnosis */}
              <Card className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">AI Feedback on Diagnosis</h2>
                <div className="mb-4">
                  <Badge variant={getDiagnosisBadgeVariant()} className="text-sm sm:text-base py-1 px-2 sm:px-3">
                    {report.diagnosisFeedback.status}
                  </Badge>
                </div>
                <p className="whitespace-pre-wrap text-muted-foreground">{report.diagnosisFeedback.explanation}</p>
              </Card>

              {/* Suggested Questions */}
              {report.suggestedQuestions && report.suggestedQuestions.length > 0 && (
                <Card className="p-4 sm:p-6">
                  <h2 className="text-xl sm:text-2xl font-bold mb-4">Suggested Questions for Future Sessions</h2>
                  <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                    {report.suggestedQuestions.map((question, index) => (
                      <li key={index}>{question}</li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-center sm:space-x-4 space-y-2 sm:space-y-0 pt-4">
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/dashboard">Return to Dashboard</Link>
                </Button>
                <Button variant="outline" onClick={handleDownloadReport} className="w-full sm:w-auto">
                  Download Report
                </Button>
              </div>
            </div>
          ) : (
            <Card className="p-6 text-center">
              <p className="mb-4">No report data available.</p>
              <Button asChild>
                <Link href="/dashboard">Return to Dashboard</Link>
              </Button>
            </Card>
          )}
        </main>
      </div>
    </>
  );
}

export default function ProtectedReportPage() {
  return (
    <ProtectedRoute>
      <ReportPage />
    </ProtectedRoute>
  );
}