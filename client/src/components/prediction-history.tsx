import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText } from "lucide-react";

interface HistoryItem {
  id: number;
  date: string;
  prediction: string;
  confidence: number;
  stage: string;
  risk?: "Low" | "Moderate" | "High";
  rawDate?: string;
}

const mockHistory: HistoryItem[] = [
  { id: 1, date: "Dec 18, 2024", prediction: "Positive", confidence: 78, stage: "Moderate", risk: "High" },
  { id: 2, date: "Dec 15, 2024", prediction: "Positive", confidence: 72, stage: "Early", risk: "Moderate" },
  { id: 3, date: "Dec 12, 2024", prediction: "Positive", confidence: 68, stage: "Early", risk: "Moderate" },
];

function parseStoredHistory(value: string | null): HistoryItem[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed as HistoryItem[];
  } catch {
    return [];
  }
}

function normalizeRisk(item: HistoryItem): "Low" | "Moderate" | "High" {
  if (item.risk) return item.risk;
  const positive = item.prediction.toLowerCase() === "positive";
  if (!positive) return "Low";
  if (item.confidence >= 80) return "High";
  if (item.confidence >= 60) return "Moderate";
  return "Low";
}

function riskClass(risk: "Low" | "Moderate" | "High"): string {
  if (risk === "High") return "bg-red-100 text-red-700";
  if (risk === "Moderate") return "bg-orange-100 text-orange-700";
  return "bg-green-100 text-green-700";
}

export function PredictionHistory() {
  const [history, setHistory] = useState<HistoryItem[]>(mockHistory);

  useEffect(() => {
    const storedHistory = parseStoredHistory(localStorage.getItem("predictionHistory"));
    if (storedHistory.length > 0) {
      const sorted = [...storedHistory].sort((a, b) => {
        const ad = a.rawDate ? new Date(a.rawDate).getTime() : 0;
        const bd = b.rawDate ? new Date(b.rawDate).getTime() : 0;
        return bd - ad;
      });
      setHistory(sorted.slice(0, 12));
    }
  }, []);

  const normalizedHistory = useMemo(
    () => history.map((item) => ({ ...item, risk: normalizeRisk(item) })),
    [history],
  );

  return (
    <div className="space-y-4">
      <h3 className="mb-6 text-2xl font-heading font-bold text-foreground">Patient Progress History</h3>

      {normalizedHistory.map((item, idx) => (
        <motion.div
          key={`${item.id}-${idx}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <Card className="transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800/50">
            <CardContent className="p-4">
              <div className="grid items-center gap-4 md:grid-cols-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.date}</p>
                    <p className="text-xs text-black">Test taken</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-black">Result</p>
                  <p className={`font-semibold ${item.prediction === "Positive" ? "text-red-600" : "text-green-600"}`}>
                    {item.prediction}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-black">Confidence</p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        className={`h-full ${item.confidence > 70 ? "bg-red-500" : "bg-green-500"}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.confidence}%` }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      />
                    </div>
                    <span className="w-10 text-sm font-semibold">{item.confidence}%</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-black">Stage</p>
                  <p className="font-semibold text-foreground">{item.stage}</p>
                </div>

                <div>
                  <p className="text-xs text-black">Risk</p>
                  <span className={`inline-block rounded-md px-2 py-1 text-xs font-semibold ${riskClass(item.risk)}`}>
                    {item.risk}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="rounded-lg" data-testid={`btn-view-report-${item.id}`}>
                    <FileText className="mr-1 h-4 w-4" />
                    Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
