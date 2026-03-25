import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export function TipsCard() {
  const tips = [
    "Regular exercise 30 mins daily",
    "Speech therapy 2x weekly",
    "Consult neurologist monthly",
    "Medication on time",
  ];

  return (
    <Card className="glass-panel p-8 space-y-6 rounded-3xl shadow-2xl border-emerald-200/50 bg-gradient-to-b from-emerald-50/80 to-blue-50/80">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle className="h-6 w-6 text-emerald-600" />
          Daily Tips
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tips.map((tip, idx) => (
          <div key={idx} className="flex gap-3 items-start text-base leading-relaxed">
            <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0 flex-shrink-0" />
            <span className="text-slate-700">{tip}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

