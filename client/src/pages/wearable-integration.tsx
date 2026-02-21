import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, Activity, Watch, Bluetooth, Battery,
  Heart, Footprints, Moon, AlertTriangle, ArrowLeft,
  RefreshCw, Settings, CheckCircle, XCircle,
  TrendingUp, TrendingDown
} from "lucide-react";
import { useLocation } from "wouter";
import { BackendConfigButton } from "@/components/backend-config";

// Mock wearable data
const mockWearableData = {
  connected: true,
  deviceName: "Parkinson's Smart Watch Pro",
  battery: 78,
  lastSync: "2 minutes ago",
  steps: 6543,
  stepsGoal: 8000,
  tremorFrequency: 12,
  heartRate: 72,
  heartRateVariability: 52,
  sleepHours: 6.5,
  sleepQuality: "Good",
  fallDetected: false,
  activeMinutes: 45
};

const mockTremorData = [
  { time: "6AM", frequency: 8 },
  { time: "8AM", frequency: 15 },
  { time: "10AM", frequency: 12 },
  { time: "12PM", frequency: 10 },
  { time: "2PM", frequency: 18 },
  { time: "4PM", frequency: 14 },
  { time: "6PM", frequency: 16 },
  { time: "8PM", frequency: 11 },
];

const mockSleepData = [
  { day: "Mon", hours: 6.2, quality: 75 },
  { day: "Tue", hours: 5.8, quality: 68 },
  { day: "Wed", hours: 6.5, quality: 82 },
  { day: "Thu", hours: 7.0, quality: 88 },
  { day: "Fri", hours: 6.1, quality: 72 },
  { day: "Sat", hours: 7.5, quality: 92 },
  { day: "Sun", hours: 6.8, quality: 85 },
];

const mockAlerts = [
  { id: 1, type: "warning", message: "Tremor frequency increased this morning", time: "2 hours ago" },
  { id: 2, type: "info", message: "Daily step goal achieved!", time: "5 hours ago" },
  { id: 3, type: "success", message: "Medication reminder sent", time: "8 hours ago" },
];

export default function WearableIntegration() {
  const [, setLocation] = useLocation();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
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
                Wearable Integration
              </h1>
              <p className="text-white/70">
                Monitor health metrics in real-time with smart wearables
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={handleSync}
                disabled={isSyncing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </Button>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Connection Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className={`${mockWearableData.connected ? 'bg-green-500/10' : 'bg-red-500/10'} border border-white/20`}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-full ${mockWearableData.connected ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    <Watch className={`w-8 h-8 ${mockWearableData.connected ? 'text-green-400' : 'text-red-400'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-semibold text-lg">{mockWearableData.deviceName}</h3>
                      {mockWearableData.connected ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                    <p className="text-white/60">
                      {mockWearableData.connected ? 'Connected' : 'Disconnected'} • Last sync: {mockWearableData.lastSync}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-white/70">
                    <Battery className="w-5 h-5" />
                    <span>{mockWearableData.battery}%</span>
                  </div>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Bluetooth className="w-4 h-4 mr-2" />
                    Manage Device
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { 
              icon: Footprints, 
              label: "Steps Today", 
              value: mockWearableData.steps.toLocaleString(), 
              goal: mockWearableData.stepsGoal,
              unit: "steps",
              trend: "up",
              color: "bg-blue-500/20 text-blue-400"
            },
            { 
              icon: Heart, 
              label: "Heart Rate", 
              value: mockWearableData.heartRate, 
              unit: "bpm",
              trend: "stable",
              color: "bg-red-500/20 text-red-400"
            },
            { 
              icon: Activity, 
              label: "Active Minutes", 
              value: mockWearableData.activeMinutes, 
              unit: "min",
              trend: "up",
              color: "bg-green-500/20 text-green-400"
            },
            { 
              icon: Moon, 
              label: "Sleep Last Night", 
              value: mockWearableData.sleepHours, 
              unit: "hours",
              quality: mockWearableData.sleepQuality,
              color: "bg-purple-500/20 text-purple-400"
            },
          ].map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/10 backdrop-blur-md border border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${metric.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      {metric.trend && (
                        metric.trend === "up" ? (
                          <TrendingUp className="w-5 h-5 text-green-400" />
                        ) : metric.trend === "down" ? (
                          <TrendingDown className="w-5 h-5 text-red-400" />
                        ) : null
                      )}
                    </div>
                    <p className="text-white/60 text-sm">{metric.label}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-white">{metric.value}</span>
                      <span className="text-white/60">{metric.unit}</span>
                    </div>
                    {metric.goal && (
                      <div className="mt-3">
                        <Progress value={(metric.value as number / metric.goal) * 100} className="h-2" />
                        <p className="text-white/40 text-xs mt-1">{Math.round((metric.value as number / metric.goal) * 100)}% of goal</p>
                      </div>
                    )}
                    {metric.quality && (
                      <Badge className="mt-2 bg-green-500/20 text-green-400">
                        {metric.quality} Quality
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Tremor Frequency Chart */}
          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Tremor Frequency
              </CardTitle>
              <CardDescription className="text-white/60">
                Today's tremor episodes per hour
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-end gap-2">
                {mockTremorData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-orange-500/50 rounded-t transition-all hover:bg-orange-500/70"
                      style={{ height: `${(data.frequency / 20) * 100}%` }}
                    />
                    <span className="text-white/50 text-xs">{data.time}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <p className="text-red-200 text-sm">
                    Average: {Math.round(mockTremorData.reduce((a, b) => a + b.frequency, 0) / mockTremorData.length)} episodes/hour
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sleep Quality Chart */}
          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Moon className="w-5 h-5" />
                Weekly Sleep Analysis
              </CardTitle>
              <CardDescription className="text-white/60">
                Hours of sleep and quality score
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-end gap-2">
                {mockSleepData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full relative" style={{ height: '120px' }}>
                      <div 
                        className="absolute bottom-0 w-full bg-purple-500/50 rounded-t"
                        style={{ height: `${(data.hours / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-white/50 text-xs">{data.day}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Average Sleep</p>
                  <p className="text-white font-bold">
                    {(mockSleepData.reduce((a, b) => a + b.hours, 0) / mockSleepData.length).toFixed(1)} hours
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white/60 text-sm">Average Quality</p>
                  <p className="text-white font-bold">
                    {Math.round(mockSleepData.reduce((a, b) => a + b.quality, 0) / mockSleepData.length)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Alerts */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Recent Alerts</CardTitle>
                <CardDescription className="text-white/60">
                  Notifications from your wearable device
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${
                      alert.type === "warning" 
                        ? "bg-orange-500/10 border-orange-500/20" 
                        : alert.type === "success"
                        ? "bg-green-500/10 border-green-500/20"
                        : "bg-blue-500/10 border-blue-500/20"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {alert.type === "warning" ? (
                        <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                      ) : alert.type === "success" ? (
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Activity className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-white">{alert.message}</p>
                        <p className="text-white/50 text-sm mt-1">{alert.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Fall Detection Status */}
          <div>
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Fall Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                    mockWearableData.fallDetected 
                      ? 'bg-red-500/20' 
                      : 'bg-green-500/20'
                  }`}>
                    {mockWearableData.fallDetected ? (
                      <AlertTriangle className="w-10 h-10 text-red-400" />
                    ) : (
                      <CheckCircle className="w-10 h-10 text-green-400" />
                    )}
                  </div>
                  <p className="text-white font-semibold mt-4">
                    {mockWearableData.fallDetected ? 'Fall Detected!' : 'No Falls Detected'}
                  </p>
                  <p className="text-white/60 text-sm mt-2">
                    {mockWearableData.fallDetected 
                      ? 'Emergency contacts have been notified'
                      : 'Monitoring active - 7 day streak'}
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4 border-white/20 text-white hover:bg-white/10"
                  >
                    Configure Alerts
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
