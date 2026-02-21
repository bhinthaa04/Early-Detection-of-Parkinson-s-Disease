import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, Activity, TrendingUp, TrendingDown, 
  AlertTriangle, ChevronDown, Info, 
  Calendar, BarChart3, LineChart, ArrowLeft
} from "lucide-react";
import { useLocation } from "wouter";
import { BackendConfigButton } from "@/components/backend-config";

// Mock data for demonstration
const mockPatients = [
  { id: "12345", name: "John Doe", age: 68 },
  { id: "12346", name: "Jane Smith", age: 72 },
  { id: "12347", name: "Robert Johnson", age: 65 },
  { id: "12348", name: "Emily Davis", age: 70 },
];

const mockHistoricalData = {
  tremor_severity: [3.2, 3.5, 3.8, 4.0, 4.2, 4.5, 4.8, 5.0, 5.2, 5.5, 5.8, 6.0],
  gait_stability: [4.5, 4.3, 4.0, 3.8, 3.5, 3.2, 3.0, 2.8, 2.5, 2.2, 2.0, 1.8],
  speech_clarity: [4.0, 3.8, 3.6, 3.4, 3.2, 3.0, 2.8, 2.6, 2.4, 2.2, 2.0, 1.8],
  cognitive_score: [4.2, 4.0, 3.8, 3.6, 3.5, 3.3, 3.1, 2.9, 2.8, 2.6, 2.4, 2.2],
};

const mockForecast = {
  patient_id: "12345",
  current_score: 42.3,
  forecast_6_month: 48.9,
  forecast_12_month: 55.4,
  confidence: 0.87,
  risk_level: "High",
  key_factors: [
    "Increasing tremor frequency",
    "Reduced gait stability",
    "Declining speech clarity"
  ],
  recommendation: "Immediate neurological consultation advised"
};

export default function ProgressionForecast() {
  const [, setLocation] = useLocation();
  const [selectedPatient, setSelectedPatient] = useState<string>("12345");
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentPatient = mockPatients.find(p => p.id === selectedPatient);

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "High":
        return "bg-red-500 text-white";
      case "Moderate":
        return "bg-orange-500 text-white";
      case "Low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatient(patientId);
    setShowPatientDropdown(false);
    setIsLoading(true);
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-sans">
      <BackendConfigButton />

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/")}
            className="mb-4 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-2">
                AI Disease Progression Forecast
              </h1>
              <p className="text-white/70">
                Predict disease progression using advanced AI models
              </p>
            </div>

            {/* Patient Selector */}
            <div className="relative">
              <Button
                onClick={() => setShowPatientDropdown(!showPatientDropdown)}
                className="bg-white/10 border border-white/20 text-white hover:bg-white/20 rounded-lg px-4 py-2"
              >
                <Brain className="w-4 h-4 mr-2" />
                {currentPatient?.name || "Select Patient"}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>

              {showPatientDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full mt-2 right-0 bg-slate-800/90 backdrop-blur-md border border-white/20 rounded-lg shadow-xl z-50 min-w-[200px]"
                >
                  {mockPatients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => handlePatientSelect(patient.id)}
                      className={`w-full text-left px-4 py-3 hover:bg-white/10 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        selectedPatient === patient.id ? 'bg-white/10' : ''
                      }`}
                    >
                      <div className="text-white font-medium">{patient.name}</div>
                      <div className="text-white/50 text-sm">Age: {patient.age} • ID: {patient.id}</div>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Forecast Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <Card className="bg-white/10 backdrop-blur-md border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <LineChart className="w-5 h-5" />
                    Progression Forecast
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    12-month projection based on historical data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Forecast Graph UI - Mock */}
                  <div className="relative h-64 bg-slate-800/50 rounded-xl p-4 mb-6">
                    {/* Y-axis labels */}
                    <div className="absolute left-2 top-4 bottom-12 flex flex-col justify-between text-xs text-white/40">
                      <span>10</span>
                      <span>8</span>
                      <span>6</span>
                      <span>4</span>
                      <span>2</span>
                      <span>0</span>
                    </div>

                    {/* Chart area */}
                    <div className="ml-8 h-full relative">
                      {/* Grid lines */}
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="border-t border-white/10 w-full"></div>
                        ))}
                      </div>

                      {/* Historical line */}
                      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <polyline
                          points="0,68 9.09,65 18.18,62 27.27,60 36.36,58 45.45,55 54.55,52 63.64,50 72.73,48 81.82,45 90.91,42 100,40"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="2"
                          vectorEffect="non-scaling-stroke"
                        />
                        {/* Forecast line (dashed) */}
                        <polyline
                          points="0,40 8.33,43.25 16.67,46.5 25,49.75 33.33,53 41.67,56.25 50,59.5 58.33,62.75 66.67,66 75,69.25 83.33,72.5 91.67,75.75 100,79"
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                          vectorEffect="non-scaling-stroke"
                        />
                        {/* Confidence interval */}
                        <polygon
                          points="0,40 8.33,43.25 16.67,46.5 25,49.75 33.33,53 41.67,56.25 50,59.5 58.33,62.75 66.67,66 75,69.25 83.33,72.5 91.67,75.75 100,79 100,90 91.67,86.75 83.33,83.5 75,80.25 66.67,77 58.33,73.75 50,70.5 41.67,67.25 33.33,64 25,60.75 16.67,57.5 8.33,54.25 0,51"
                          fill="#f59e0b"
                          opacity={0.2}
                        />
                      </svg>

                      {/* X-axis labels */}
                      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-white/40">
                        <span>Jan</span>
                        <span>Mar</span>
                        <span>May</span>
                        <span>Jul</span>
                        <span>Sep</span>
                        <span>Nov</span>
                        <span className="text-orange-400">+6mo</span>
                        <span className="text-orange-400">+12mo</span>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="absolute top-4 right-4 flex gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-0.5 bg-blue-500"></div>
                        <span className="text-white/60">Historical</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-0.5 bg-orange-500 border-dashed"></div>
                        <span className="text-white/60">Forecast</span>
                      </div>
                    </div>
                  </div>

                  {/* Forecast Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                      <div className="text-white/60 text-sm mb-1">Current Score</div>
                      <div className="text-2xl font-bold text-white">{mockForecast.current_score}</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                      <div className="text-white/60 text-sm mb-1">6-Month Forecast</div>
                      <div className="text-2xl font-bold text-orange-400 flex items-center justify-center gap-1">
                        {mockForecast.forecast_6_month}
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                      <div className="text-white/60 text-sm mb-1">12-Month Forecast</div>
                      <div className="text-2xl font-bold text-red-400 flex items-center justify-center gap-1">
                        {mockForecast.forecast_12_month}
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                      <div className="text-white/60 text-sm mb-1">Confidence</div>
                      <div className="text-2xl font-bold text-green-400">{Math.round(mockForecast.confidence * 100)}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Side Panel */}
            <div className="space-y-6">
              {/* Risk Level Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className={`${mockForecast.risk_level === 'High' ? 'bg-red-500/20' : mockForecast.risk_level === 'Moderate' ? 'bg-orange-500/20' : 'bg-green-500/20'} border border-white/20`}>
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Risk Level
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge className={`${getRiskBadgeColor(mockForecast.risk_level)} text-lg px-4 py-2`}>
                      {mockForecast.risk_level} Risk
                    </Badge>
                    {mockForecast.risk_level === "High" && (
                      <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                        <p className="text-red-200 text-sm">
                          ⚠️ Immediate action recommended. Please consult with a neurologist as soon as possible.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Key Factors */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-white/10 backdrop-blur-md border border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Key Factors
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockForecast.key_factors.map((factor, index) => (
                      <div key={index} className="flex items-center gap-2 text-white/80">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        {factor}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* AI Recommendation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-white/10 backdrop-blur-md border border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      AI Recommendation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                      <p className="text-blue-200">
                        {mockForecast.recommendation}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Historical Metrics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-white/10 backdrop-blur-md border border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Historical Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { label: "Tremor Severity", value: mockHistoricalData.tremor_severity[11], trend: "up" },
                      { label: "Gait Stability", value: mockHistoricalData.gait_stability[11], trend: "down" },
                      { label: "Speech Clarity", value: mockHistoricalData.speech_clarity[11], trend: "down" },
                      { label: "Cognitive Score", value: mockHistoricalData.cognitive_score[11], trend: "down" },
                    ].map((metric, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-white/70">{metric.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{metric.value}</span>
                          {metric.trend === "up" ? (
                            <TrendingUp className="w-4 h-4 text-red-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
