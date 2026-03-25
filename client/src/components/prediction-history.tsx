import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService, type PredictionResponse } from "@/lib/api-service";
import { readPatientData } from "@/lib/patient-data";

interface HistoryItem {
  id: number;
  date: string;
  prediction: string;
  confidence: number;
  stage: string;
  risk?: "Low" | "Moderate" | "Medium" | "High";
  rawDate?: string;
}

interface PredictionHistoryProps {
  history?: HistoryItem[];
}


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

function riskClass(risk: "Low" | "Moderate" | "High"): string {
  if (risk === "High") return "bg-red-100 text-red-700";
  if (risk === "Moderate") return "bg-orange-100 text-orange-700";
  return "bg-green-100 text-green-700";
}

export function PredictionHistory({ history: historyProp }: PredictionHistoryProps) {
  const { toast } = useToast();
  const [history, setHistory] = useState<HistoryItem[]>(historyProp ?? []);
  const [currentPage, setCurrentPage] = useState(0);
  const [loadingReportId, setLoadingReportId] = useState<number | null>(null);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const itemsPerPage = 4;

  useEffect(() => {
    if (historyProp !== undefined) {
      setHistory(historyProp);
      return;
    }

    const storedHistory = parseStoredHistory(localStorage.getItem("predictionHistory"));
    if (storedHistory.length > 0) {
      const sorted = [...storedHistory].sort((a, b) => {
        const ad = a.rawDate ? new Date(a.rawDate).getTime() : 0;
        const bd = b.rawDate ? new Date(b.rawDate).getTime() : 0;
        return bd - ad;
      });
      setHistory(sorted.slice(0, 12));
    } else {
      setHistory([]);
    }
  }, [historyProp]);

  const normalizedHistory = useMemo(
    () => history.map((item) => ({ ...item, risk: normalizeRisk(item) })),
    [history],
  );

  const totalPages = Math.ceil(normalizedHistory.length / itemsPerPage);
  const safePage = Math.min(currentPage, Math.max(0, totalPages - 1));

  useEffect(() => {
    if (currentPage !== safePage) {
      setCurrentPage(safePage);
    }
  }, [currentPage, safePage]);

  const viewReport = async (item: HistoryItem) => {
    setLoadingReportId(item.id);
    try {
      const patientData = readPatientData();
      const prediction: PredictionResponse = {
        prediction: item.prediction.toLowerCase() === "positive",
        confidence: item.confidence / 100,
        stage: item.stage,
      };
      const blob = await apiService.downloadReport(prediction, patientData ?? undefined);
      const url = URL.createObjectURL(blob);

      // Show in-app preview instead of triggering download
      setReportUrl(url);
      setIsReportOpen(true);
    } catch (error) {
      toast({
        title: "Report error",
        description: "Failed to open report.",
        variant: "destructive",
      });
    } finally {
      setLoadingReportId(null);
    }
  };

  const closeReport = () => {
    if (reportUrl) {
      URL.revokeObjectURL(reportUrl);
      setReportUrl(null);
    }
    setIsReportOpen(false);
  };

  const pageStart = safePage * itemsPerPage;
  const pageItems = normalizedHistory.slice(pageStart, pageStart + itemsPerPage);
  const hasHistory = normalizedHistory.length > 0;

  return (
    <div className="space-y-4">
      <h3 className="mb-6 text-2xl font-heading font-bold text-white">Patient Progress History</h3>

      {hasHistory ? (
        pageItems.map((item, idx) => (
          <motion.div
            key={`${item.id}-${idx}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="bg-white text-black border border-slate-200 transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <div className="grid items-center gap-4 md:grid-cols-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-black">{item.date}</p>
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
                    <p className="font-semibold text-black">{item.stage}</p>
                  </div>

                  <div>
                    <p className="text-xs text-black">Risk</p>
                    <span className={`inline-block rounded-md px-2 py-1 text-xs font-semibold ${riskClass(item.risk)}`}>
                      {item.risk}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-lg"
                      data-testid={`btn-view-report-${item.id}`}
                      onClick={() => viewReport(item)}
                      disabled={loadingReportId === item.id}
                    >
                      <FileText className="mr-1 h-4 w-4" />
                      {loadingReportId === item.id ? "Opening..." : "View Report"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))
      ) : (
        <Card className="bg-white text-black border border-slate-200">
          <CardContent className="p-6 text-center text-sm text-slate-600">
            No test history yet. Run a new test.
          </CardContent>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-white/70">
            Page {safePage + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => setCurrentPage((page) => Math.max(0, page - 1))}
              disabled={safePage === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => setCurrentPage((page) => Math.min(totalPages - 1, page + 1))}
              disabled={safePage === totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {isReportOpen && reportUrl ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-4xl h-[80vh] rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-3">
              <div className="text-sm font-semibold">Patient Report</div>
              <Button size="sm" variant="ghost" onClick={closeReport}>
                Close
              </Button>
            </div>
            <iframe
              src={reportUrl}
              className="w-full h-full"
              title="Patient Report"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
