import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Calendar } from "lucide-react";

interface Props {
  latestDate: string;
  lastResult: string;
  lastStage: string;
  nextCheckup: string;
  resultClass: string;
  stageClass: string;
}

export function HealthSummaryCard({ latestDate, lastResult, lastStage, nextCheckup, resultClass, stageClass }: Props) {
  return (
    <Card className="glass-panel p-8 space-y-6 rounded-3xl shadow-2xl border-slate-200/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <AlertCircle className="h-6 w-6 text-primary" />
          Health Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <span className="text-slate-600 font-medium">Last Test</span>
          <span className="font-bold text-right">{latestDate}</span>
          <span className="text-slate-600 font-medium">Result</span>
          <span className={`font-bold text-right ${resultClass}`}>{lastResult}</span>
          <span className="text-slate-600 font-medium">Stage</span>
          <span className={`font-bold text-right ${stageClass}`}>{lastStage}</span>
          <span className="text-slate-600 font-medium">Next Checkup</span>
          <span className="font-bold text-primary text-right">{nextCheckup}</span>
        </div>
        <Button className="w-full h-12 rounded-xl font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90">
          Schedule Checkup
        </Button>
      </CardContent>
    </Card>
  );
}

