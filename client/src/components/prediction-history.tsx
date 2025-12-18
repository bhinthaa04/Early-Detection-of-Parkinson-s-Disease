import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText } from "lucide-react";
import { useEffect, useState } from "react";

interface HistoryItem {
  id: number;
  date: string;
  prediction: string;
  confidence: number;
  stage: string;
}

const mockHistory: HistoryItem[] = [
  { id: 1, date: "Dec 18, 2024", prediction: "Positive", confidence: 78, stage: "Mid" },
  { id: 2, date: "Dec 15, 2024", prediction: "Positive", confidence: 72, stage: "Early" },
  { id: 3, date: "Dec 12, 2024", prediction: "Positive", confidence: 68, stage: "Early" },
  { id: 4, date: "Dec 8, 2024", prediction: "Negative", confidence: 52, stage: "Healthy" },
  { id: 5, date: "Dec 5, 2024", prediction: "Negative", confidence: 45, stage: "Healthy" },
];

export function PredictionHistory() {
  const [history, setHistory] = useState<HistoryItem[]>(mockHistory);

  useEffect(() => {
    const storedHistory = localStorage.getItem('predictionHistory');
    if (storedHistory) {
      try {
        const parsedHistory = JSON.parse(storedHistory);
        // Combine mock with stored, or just use stored if available.
        // For prototype, let's prepend stored to mock.
        if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
           // Dedup based on id if necessary, but simple spread is fine for now
           // Assuming ids are unique enough (Date.now())
           setHistory([...parsedHistory, ...mockHistory]);
        }
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-heading font-bold text-foreground mb-6">Test History</h3>
      
      {history.map((item, idx) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <Card className="hover:shadow-md transition-shadow dark:bg-slate-800/50 dark:border-slate-700">
            <CardContent className="p-4">
              <div className="grid md:grid-cols-5 gap-4 items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.date}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Test taken</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Result</p>
                  <p className={`font-semibold ${item.prediction === 'Positive' ? 'text-red-600' : 'text-green-600'}`}>
                    {item.prediction}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Confidence</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${item.confidence > 70 ? 'bg-red-500' : 'bg-green-500'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.confidence}%` }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      />
                    </div>
                    <span className="font-semibold text-sm w-10">{item.confidence}%</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Stage</p>
                  <p className="font-semibold text-foreground">{item.stage}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-lg"
                    data-testid={`btn-view-report-${item.id}`}
                  >
                    <FileText className="w-4 h-4 mr-1" />
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
