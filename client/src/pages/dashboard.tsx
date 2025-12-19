import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, ClipboardList, Home } from "lucide-react";
import { useLocation } from "wouter";
import { PredictionCharts } from "@/components/prediction-charts";
import { PredictionHistory } from "@/components/prediction-history";
import { DoctorFinder } from "@/components/doctor-finder";
import { BackendConfigButton } from "@/components/backend-config";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const stats = [
    { icon: ClipboardList, label: "Total Tests", value: "24", color: "bg-blue-100 text-blue-600" },
    { icon: TrendingUp, label: "Positive Cases", value: "12", color: "bg-red-100 text-red-600" },
    { icon: Users, label: "Avg Confidence", value: "68%", color: "bg-orange-100 text-orange-600" },
    { icon: BarChart3, label: "This Month", value: "5", color: "bg-green-100 text-green-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 relative overflow-hidden font-sans">
      <BackendConfigButton />
      
      {/* Background */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Dashboard</h1>
              <p className="text-gray-700">Your Parkinson's disease monitoring overview</p>
            </div>
            <Button
              onClick={() => setLocation("/prediction")}
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
                        <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
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
          <PredictionCharts />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* History - Spans 2 columns on large screens */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="space-y-6">
              <PredictionHistory />
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
                    <span className="text-sm text-gray-700">Last Test</span>
                    <span className="font-semibold">Dec 18, 2024</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Result</span>
                    <span className="font-semibold text-red-600">Positive</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Stage</span>
                    <span className="font-semibold text-orange-600">Mid</span>
                  </div>
                  <div className="h-px bg-border my-3" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Next Checkup</span>
                    <span className="font-semibold text-primary">Dec 25, 2024</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full rounded-lg" data-testid="btn-schedule-checkup">
                  📅 Schedule Checkup
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
