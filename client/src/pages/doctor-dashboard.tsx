import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, Users, FileText, Activity, TrendingUp,
  AlertTriangle, CheckCircle, Clock, ArrowLeft,
  Search, Filter, Calendar, MessageSquare, ChevronRight
} from "lucide-react";
import { useLocation } from "wouter";
import { BackendConfigButton } from "@/components/backend-config";

// Mock data
const mockDoctor = {
  name: "Dr. Sarah Smith",
  specialization: "Neurologist",
  patientsCount: 156,
  todayAppointments: 8,
  pendingReports: 5
};

const mockPatients = [
  { 
    id: "12345", 
    name: "John Doe", 
    age: 68, 
    status: "High Risk",
    lastVisit: "2024-01-15",
    nextAppointment: "2024-01-22",
    condition: "Parkinson's - Advanced"
  },
  { 
    id: "12346", 
    name: "Jane Smith", 
    age: 72, 
    status: "Moderate",
    lastVisit: "2024-01-14",
    nextAppointment: "2024-01-21",
    condition: "Parkinson's - Mid Stage"
  },
  { 
    id: "12347", 
    name: "Robert Johnson", 
    age: 65, 
    status: "Stable",
    lastVisit: "2024-01-10",
    nextAppointment: "2024-01-25",
    condition: "Parkinson's - Early Stage"
  },
  { 
    id: "12348", 
    name: "Emily Davis", 
    age: 70, 
    status: "High Risk",
    lastVisit: "2024-01-15",
    nextAppointment: "2024-01-20",
    condition: "Parkinson's - Advanced"
  },
  { 
    id: "12349", 
    name: "Michael Wilson", 
    age: 67, 
    status: "Moderate",
    lastVisit: "2024-01-12",
    nextAppointment: "2024-01-26",
    condition: "Parkinson's - Mid Stage"
  },
];

const mockAlerts = [
  { id: 1, type: "critical", message: "John Doe - Tremor progression detected", time: "2 hours ago" },
  { id: 2, type: "warning", message: "Emily Davis - Missed medication log", time: "4 hours ago" },
  { id: 3, type: "info", message: "New test results available for review", time: "6 hours ago" },
];

export default function DoctorDashboard() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "High Risk":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "Moderate":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "Stable":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const filteredPatients = mockPatients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.id.includes(searchQuery);
    const matchesFilter = filterStatus === "all" || patient.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
                Doctor Dashboard
              </h1>
              <p className="text-white/70">
                Welcome back, {mockDoctor.name}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={() => setLocation("/doctor-login")}
              >
                Logout
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: "Total Patients", value: mockDoctor.patientsCount, color: "bg-blue-500/20 text-blue-400" },
            { icon: Calendar, label: "Today's Appointments", value: mockDoctor.todayAppointments, color: "bg-purple-500/20 text-purple-400" },
            { icon: FileText, label: "Pending Reports", value: mockDoctor.pendingReports, color: "bg-orange-500/20 text-orange-400" },
            { icon: Activity, label: "High Risk Cases", value: "2", color: "bg-red-500/20 text-red-400" },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/10 backdrop-blur-md border border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/60 text-sm">{stat.label}</p>
                        <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search and Filter */}
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                    <input
                      type="text"
                      placeholder="Search patients by name or ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-white/50" />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    >
                      <option value="all">All Status</option>
                      <option value="High Risk">High Risk</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Stable">Stable</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Patients List */}
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Patient List
                </CardTitle>
                <CardDescription className="text-white/60">
                  {filteredPatients.length} patients found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPatients.map((patient) => (
                    <motion.div
                      key={patient.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                      onClick={() => setLocation(`/doctor-patient-view?id=${patient.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                            <span className="text-primary font-bold">
                              {patient.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">{patient.name}</h3>
                            <p className="text-white/50 text-sm">ID: {patient.id} • Age: {patient.age}</p>
                            <p className="text-white/50 text-sm">{patient.condition}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className={getStatusColor(patient.status)}>
                            {patient.status}
                          </Badge>
                          <ChevronRight className="w-5 h-5 text-white/50" />
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-white/50">
                          <Clock className="w-4 h-4" />
                          Last visit: {patient.lastVisit}
                        </div>
                        <div className="flex items-center gap-2 text-white/50">
                          <Calendar className="w-4 h-4" />
                          Next: {patient.nextAppointment}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Alerts */}
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Recent Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border ${
                      alert.type === "critical" 
                        ? "bg-red-500/10 border-red-500/20" 
                        : alert.type === "warning"
                        ? "bg-orange-500/10 border-orange-500/20"
                        : "bg-blue-500/10 border-blue-500/20"
                    }`}
                  >
                    <p className="text-white text-sm">{alert.message}</p>
                    <p className="text-white/50 text-xs mt-1">{alert.time}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-white border-white/20 hover:bg-white/10"
                  onClick={() => setLocation("/progression-forecast")}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Forecasts
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-white border-white/20 hover:bg-white/10"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Reports
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-white border-white/20 hover:bg-white/10"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Messages
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
