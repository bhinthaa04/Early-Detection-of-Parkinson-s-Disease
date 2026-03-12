import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, ClipboardList, Home } from "lucide-react";
import { useLocation } from "wouter";
import { PredictionCharts } from "@/components/prediction-charts";
import { PredictionHistory } from "@/components/prediction-history";
import { DoctorFinder } from "@/components/doctor-finder";
import { BackendConfigButton } from "@/components/backend-config";
import { apiService, type PatientTestRecord } from "@/lib/api-service";
import { readPatientData } from "@/lib/patient-data";
import heroBg from "@assets/generated_images/hopeful_medical_background_with_brain_waves_and_pulses.png";

type HistoryItem = {
  id: number;
  date: string;
  prediction: string;
  confidence: number;
  stage: string;
  risk?: "Low" | "Moderate" | "Medium" | "High";
  rawDate?: string;
};

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

function historyDate(item: HistoryItem): Date | null {
  if (item.rawDate) {
    const raw = new Date(item.rawDate);
    if (!Number.isNaN(raw.getTime())) return raw;
  }
  if (item.date) {
    const parsed = new Date(item.date);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

function formatDate(value: Date | null): string {
  if (!value) return "Not available";
  return value.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function normalizeRiskLabel(value?: string): "Low" | "Moderate" | "High" {
  const label = (value || "").toLowerCase();
  if (label === "high") return "High";
  if (label === "medium" || label === "moderate") return "Moderate";
  return "Low";
}

function riskBadgeClass(value?: string): string {
  const label = normalizeRiskLabel(value);
  if (label === "High") return "bg-red-100 text-red-700";
  if (label === "Moderate") return "bg-orange-100 text-orange-700";
  return "bg-green-100 text-green-700";
}

function mapTestToHistory(test: PatientTestRecord): HistoryItem {
  const testDate = new Date(test.test_date);
  const hasValidDate = !Number.isNaN(testDate.getTime());
  return {
    id: test.id,
    date: hasValidDate
      ? testDate.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
      : "Unknown date",
    prediction: test.result,
    confidence: Math.round(Number(test.confidence_score)),
    stage: test.stage ?? "N/A",
    risk: normalizeRiskLabel(test.risk_level),
    rawDate: hasValidDate ? testDate.toISOString() : undefined,
  };
}

function followupDays(item: HistoryItem): number {
  if (item.risk === "High") return 7;
  if (item.risk === "Moderate") return 14;
  if (item.risk === "Low") return 30;
  if (item.prediction.toLowerCase() === "positive") {
    if (item.confidence >= 80) return 7;
    if (item.confidence >= 60) return 14;
    return 21;
  }
  return 30;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    setHistoryError(null);

    const patientData = readPatientData();
    if (!patientData?.db_patient_id) {
      setHistory([]);
      setIsLoadingHistory(false);
      return;
    }

    try {
      const tests = await apiService.getPatientTests(patientData.db_patient_id);
      const mapped = tests.map(mapTestToHistory);
      const sorted = mapped.sort((a, b) => {
        const ad = historyDate(a)?.getTime() ?? 0;
        const bd = historyDate(b)?.getTime() ?? 0;
        return bd - ad;
      });
      setHistory(sorted);
    } catch (error) {
      const storedHistory = parseStoredHistory(localStorage.getItem("predictionHistory"));
      if (storedHistory.length > 0) {
        const sorted = [...storedHistory].sort((a, b) => {
          const ad = historyDate(a)?.getTime() ?? 0;
          const bd = historyDate(b)?.getTime() ?? 0;
          return bd - ad;
        });
        setHistory(sorted);
      } else {
        setHistory([]);
      }
      setHistoryError(error instanceof Error ? error.message : "Failed to fetch test history.");
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    const handler = () => loadHistory();
    window.addEventListener("patient-tests-updated", handler as EventListener);
    return () => {
      window.removeEventListener("patient-tests-updated", handler as EventListener);
    };
  }, [loadHistory]);

  const metrics = useMemo(() => {
    const totalTests = history.length;
    const positiveCases = history.filter(
      (item) => item.prediction.toLowerCase() === "positive",
    ).length;
    const avgConfidence = totalTests
      ? Math.round(history.reduce((sum, item) => sum + (item.confidence || 0), 0) / totalTests)
      : 0;
    const now = new Date();
    const testsThisMonth = history.filter((item) => {
      const d = historyDate(item);
      return d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const latestTest = history[0] ?? null;
    return { totalTests, positiveCases, avgConfidence, testsThisMonth, latestTest };
  }, [history]);

  const stats = [
    { icon: ClipboardList, label: "Total Tests", value: `${metrics.totalTests}`, color: "bg-blue-100 text-blue-600" },
    { icon: TrendingUp, label: "Positive Cases", value: `${metrics.positiveCases}`, color: "bg-red-100 text-red-600" },
    {
      icon: Users,
      label: "Avg Confidence",
      value: metrics.totalTests ? `${metrics.avgConfidence}%` : "N/A",
      color: "bg-orange-100 text-orange-600",
    },
    { icon: BarChart3, label: "This Month", value: `${metrics.testsThisMonth}`, color: "bg-green-100 text-green-600" },
  ];

  const latestDate = formatDate(metrics.latestTest ? historyDate(metrics.latestTest) : null);
  const nextCheckup = metrics.latestTest
    ? formatDate(
        (() => {
          const base = historyDate(metrics.latestTest);
          if (!base) return null;
          const next = new Date(base);
          next.setDate(next.getDate() + followupDays(metrics.latestTest));
          return next;
        })(),
      )
    : "Not scheduled";
  const lastResult = metrics.latestTest?.prediction ?? "No tests yet";
  const lastStage = metrics.latestTest?.stage ?? "N/A";
  const resultClass =
    lastResult.toLowerCase() === "positive"
      ? "text-red-600"
      : lastResult.toLowerCase() === "negative"
        ? "text-green-600"
        : "text-slate-500";
  const stageLower = lastStage.toLowerCase();
  const stageClass = stageLower.includes("early")
    ? "text-amber-600"
    : stageLower.includes("moderate") || stageLower.includes("mid")
      ? "text-orange-600"
      : stageLower.includes("advanced") || stageLower.includes("severe")
        ? "text-red-600"
        : "text-slate-600";

  const recentTests = useMemo(() => history.slice(0, 5), [history]);

  return (
    <div className="min-h-screen relative overflow-hidden font-sans">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 transition-opacity duration-1000"
        style={{ backgroundImage: `url(${heroBg})` }}
      />

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: [0, 50, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -30, 0],
            opacity: [0.05, 0.2, 0.05],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-400/10 rounded-full blur-[100px]"
        />

        <svg className="absolute inset-0 w-full h-full opacity-10">
          <motion.path
            d="M0 100 Q 250 50 500 100 T 1000 100"
            stroke="currentColor"
            strokeWidth="1"
            fill="transparent"
            className="text-primary"
            animate={{
              x: [-20, 20, -20],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </svg>
      </div>

      <BackendConfigButton />

      <div className="container mx-auto px-4 py-12 max-w-6xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-heading font-bold text-white mb-2">
                {location === '/dashboard' ? 'Dashboard' : 'Patient History'}
              </h1>
              <p className="text-white/70">
                {location === '/dashboard' 
                  ? 'Your Parkinson\'s disease monitoring overview' 
                  : 'All your test records and progression tracking'
                }
              </p>
            </div>
            <Button
              onClick={() => setLocation("/take-test")}
              className="rounded-full px-6"
              data-testid="btn-new-test-dashboard"
            >
              + New Test
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="glass-panel">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-black mb-1">{stat.label}</p>
                        <p className="text-3xl font-heading font-bold text-foreground">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <PredictionCharts history={history} />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
        {/* Recent Patients (Top 10) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-3"
        >
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Recent Patients (Last 10 Tests)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-12">
<div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3" style={{width: '32px', height: '32px'}} />
                  Loading patient history...
                </div>
              ) : recentTests.length > 0 ? (
                <div className="space-y-3">
                  {recentTests.map((test) => (
                    <motion.div
                      key={test.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white/50 hover:bg-white transition-all"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{test.prediction}</p>
                          <p className="text-sm text-slate-500">{test.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-lg">{test.confidence}%</div>
                        <Badge className={riskBadgeClass(test.risk)}>
                          {normalizeRiskLabel(test.risk)}
                        </Badge>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-medium text-slate-900">{test.stage}</p>
                        <div className="mt-1 h-2 bg-slate-200 rounded-full">
                          <div 
                            className="h-2 rounded-full bg-gradient-to-r from-primary to-secondary" 
                            style={{ width: `${test.confidence}%` }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent tests found</p>
                  <p className="text-sm mt-1">Run your first test to get started</p>
                </div>
              )}
              {historyError && (
                <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {historyError}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* All Patient Records */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-3"
        >
          <div className="space-y-6">
            <PredictionHistory history={history} />
          </div>
        </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="text-lg">Health Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-black">Last Test</span>
                    <span className="font-semibold">{latestDate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-black dark:text-black">Result</span>
                    <span className={`font-semibold ${resultClass}`}>{lastResult}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-black dark:text-black">Stage</span>
                    <span className={`font-semibold ${stageClass}`}>{lastStage}</span>
                  </div>
                  <div className="h-px bg-border my-3" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-black dark:text-black">Next Checkup</span>
                    <span className="font-semibold text-primary">{nextCheckup}</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full rounded-lg" data-testid="btn-schedule-checkup">
                  Schedule Checkup
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-panel bg-blue-50/50 border-blue-200/50">
              <CardHeader>
                <CardTitle className="text-lg">Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <span className="text-primary">✓</span>
                  <p>Regular exercise for 30 mins daily</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-primary">✓</span>
                  <p>Speech therapy 2x weekly</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-primary">✓</span>
                  <p>Consult neurologist monthly</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="text-lg">Recent Tests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {isLoadingHistory ? (
                  <p className="text-slate-600">Loading test history...</p>
                ) : recentTests.length > 0 ? (
                  recentTests.map((test) => (
                    <div key={test.id} className="rounded-lg border border-slate-200 bg-white/80 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-500">{test.date}</p>
                          <p className="font-semibold text-slate-900">{test.prediction}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Confidence</p>
                          <p className="font-semibold text-slate-900">{test.confidence}%</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className={`rounded-full px-2 py-1 font-semibold ${riskBadgeClass(test.risk)}`}>
                          {normalizeRiskLabel(test.risk)}
                        </span>
                        <span className="text-slate-500">{test.stage}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-600">No test history yet. Run a new test.</p>
                )}
                {historyError ? (
                  <p className="text-xs text-red-600">{historyError}</p>
                ) : null}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Doctor Finder Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <DoctorFinder />
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center"
        >
          <Button
            variant="outline"
            className="rounded-full px-6"
            onClick={() => setLocation("/")}
            data-testid="btn-back-home-dashboard"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
