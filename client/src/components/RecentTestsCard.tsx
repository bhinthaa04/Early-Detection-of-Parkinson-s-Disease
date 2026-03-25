import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

interface PatientTest {
  id: number;
  patient_name: string;
  test_date: string;
  result: string;
  stage: string | null;
  confidence_score: number;
}

interface Props {
  tests: PatientTest[];
  isLoading?: boolean;
}

export function RecentTestsCard({ tests, isLoading }: Props) {
  const recent = tests.slice(0, 4);

  return (
    <Card className="glass-panel p-8 space-y-6 rounded-3xl shadow-2xl border-slate-200/50 max-h-96 overflow-y-auto">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Recent Tests
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div>Loading...</div>
        ) : recent.length === 0 ? (
          <p className="text-slate-600 text-center py-8">No recent tests</p>
        ) : (
          recent.map((test) => (
            <div key={test.id} className="p-4 rounded-2xl border border-slate-200/50 bg-white/80 hover:bg-white transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">{test.test_date}</span>
                <Badge variant={test.result === 'Detected' ? "destructive" : "default"} className="text-xs">
                  {test.result}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900">{test.stage || 'N/A'}</span>
                <span className="text-sm font-bold text-primary">{Math.round(test.confidence_score)}%</span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

