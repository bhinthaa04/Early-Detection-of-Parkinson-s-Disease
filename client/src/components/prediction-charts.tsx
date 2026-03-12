import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type HistoryItem = {
  id: number;
  date: string;
  prediction: string;
  confidence: number;
  stage: string;
  risk?: "Low" | "Moderate" | "Medium" | "High";
  rawDate?: string;
};

type ChartPoint = {
  date: string;
  confidence: number;
  riskValue: number;
  risk: "Low" | "Moderate" | "High";
};

function normalizeRisk(item: HistoryItem): "Low" | "Moderate" | "High" {
  if (item.risk) {
    const label = item.risk.toLowerCase();
    if (label === "high") return "High";
    if (label === "medium" || label === "moderate") return "Moderate";
    return "Low";
  }
  const positive = item.prediction.toLowerCase() === "positive";
  if (!positive) return "Low";
  if (item.confidence >= 80) return "High";
  if (item.confidence >= 60) return "Moderate";
  return "Low";
}

function riskToValue(risk: "Low" | "Moderate" | "High"): number {
  if (risk === "High") return 3;
  if (risk === "Moderate") return 2;
  return 1;
}

function parseHistory(value: string | null): HistoryItem[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed as HistoryItem[];
  } catch {
    return [];
  }
}

interface PredictionChartsProps {
  history?: HistoryItem[];
}

export function PredictionCharts({ history: historyProp }: PredictionChartsProps) {
  const [history, setHistory] = useState<HistoryItem[]>(historyProp ?? []);

  useEffect(() => {
    if (historyProp !== undefined) {
      setHistory(historyProp);
      return;
    }

    const stored = parseHistory(localStorage.getItem("predictionHistory"));
    if (stored.length > 0) {
      const ordered = [...stored].sort((a, b) => {
        const ad = a.rawDate ? new Date(a.rawDate).getTime() : 0;
        const bd = b.rawDate ? new Date(b.rawDate).getTime() : 0;
        return ad - bd;
      });
      setHistory(ordered.slice(-20));
    } else {
      setHistory([]);
    }
  }, [historyProp]);

  const orderedHistory = useMemo(() => {
    const items = [...history];
    return items.sort((a, b) => {
      const ad = a.rawDate ? new Date(a.rawDate).getTime() : 0;
      const bd = b.rawDate ? new Date(b.rawDate).getTime() : 0;
      return ad - bd;
    });
  }, [history]);

  const chartData = useMemo<ChartPoint[]>(
    () =>
      orderedHistory.map((item) => {
        const risk = normalizeRisk(item);
        return {
          date: item.date,
          confidence: item.confidence,
          riskValue: riskToValue(risk),
          risk,
        };
      }),
    [orderedHistory],
  );
  const hasData = chartData.length > 0;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="text-lg">Patient Progress History</CardTitle>
            <p className="mt-1 text-xs text-black">Date vs confidence score trend</p>
          </CardHeader>
          <CardContent>
            {hasData ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e0e7ff",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="confidence"
                    name="Confidence %"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    dot={{ fill: "#06b6d4", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-sm text-slate-600">
                No test history yet. Run a new test.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="text-lg">Risk Level Trend</CardTitle>
            <p className="mt-1 text-xs text-black">Low to High progression over time</p>
          </CardHeader>
          <CardContent>
            {hasData ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis dataKey="date" />
                  <YAxis
                    domain={[1, 3]}
                    ticks={[1, 2, 3]}
                    tickFormatter={(value) => (value === 1 ? "Low" : value === 2 ? "Moderate" : "High")}
                  />
                  <Tooltip
                    formatter={(value) =>
                      value === 1 ? "Low" : value === 2 ? "Moderate" : "High"
                    }
                    contentStyle={{
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e0e7ff",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="riskValue"
                    name="Risk Trend"
                    stroke="#f97316"
                    strokeWidth={3}
                    dot={{ fill: "#f97316", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-sm text-slate-600">
                No test history yet. Run a new test.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
