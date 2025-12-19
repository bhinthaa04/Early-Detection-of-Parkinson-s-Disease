import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface PredictionData {
  date: string;
  confidence: number;
  positive: boolean;
}

const mockPredictionHistory: PredictionData[] = [
  { date: "Dec 5", confidence: 45, positive: false },
  { date: "Dec 8", confidence: 52, positive: false },
  { date: "Dec 12", confidence: 68, positive: true },
  { date: "Dec 15", confidence: 72, positive: true },
  { date: "Dec 18", confidence: 78, positive: true },
];

const stageDistribution = [
  { stage: "Healthy", count: 12 },
  { stage: "Early", count: 8 },
  { stage: "Mid", count: 3 },
  { stage: "Advanced", count: 1 },
];

export function PredictionCharts() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Confidence Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="text-lg">Confidence Trend (30 days)</CardTitle>
            <p className="text-xs text-black mt-1">Your test confidence scores over time</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={mockPredictionHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="date" />
                <YAxis />
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
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ fill: "#06b6d4", r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stage Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="text-lg">Results Distribution</CardTitle>
            <p className="text-xs text-black mt-1">Your test results breakdown by stage</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stageDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e0e7ff",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="count" fill="#06b6d4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
