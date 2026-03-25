import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, AlertTriangle, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PatientTest {
  id: number;
  patient_name: string;
  test_date: string;
  result: string;
  stage: string | null;
  confidence_score: number;
}

const formatConfidence = (score: number | null | undefined) => {
  if (score === null || score === undefined || Number.isNaN(score)) {
    return 'N/A';
  }

  const percent = score <= 1 ? score * 100 : score;
  return `${Math.round(percent)}%`;
};

export default function PatientHistory() {
  const [tests, setTests] = useState<PatientTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatientTests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/patient-tests');
      if (!response.ok) {
        throw new Error('Failed to fetch patient history');
      }
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('JSON parse error:', text);
        data = [];
      }
      setTests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientTests();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-24" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Patient History</h1>
          <p className="text-white mt-2">View all prediction results and test history</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" className="text-white border-white hover:bg-white/10" onClick={fetchPatientTests} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card className="mb-6">
          <CardContent className="p-6 flex items-center gap-3 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <div>
              <p>{error}</p>
              <Button variant="link" onClick={fetchPatientTests} className="p-0 h-auto">
                Try again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Prediction History</CardTitle>
        </CardHeader>
        <CardContent>
          {tests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-1">No test results yet</h3>
              <p>Run some predictions to see history here</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Confidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell className="font-medium">{test.patient_name}</TableCell>
                    <TableCell>
                      {test.test_date ? format(parseISO(test.test_date), 'MMM dd, yyyy HH:mm') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={test.result === 'Detected' ? "destructive" : "default"}>
                        {test.result}
                      </Badge>
                    </TableCell>
                    <TableCell>{test.stage || 'N/A'}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatConfidence(test.confidence_score)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

