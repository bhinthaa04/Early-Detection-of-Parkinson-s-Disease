import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, Activity, TrendingUp, TrendingDown,
  AlertTriangle, ArrowLeft, Calendar, Clock,
  FileText, MessageSquare, Download, Send,
  Heart, Wind, Speech, Eye
} from "lucide-react";
import { useLocation } from "wouter";
import { BackendConfigButton } from "@/components/backend-config";

// Mock patient data
const mockPatient = {
  id: "12345",
  name: "John Doe",
  age: 68,
  gender: "Male",
  condition: "Parkinson's Disease - Advanced Stage",
  status: "High Risk",
  diagnosedDate: "2020-03-15",
  lastVisit: "2024-01-15",
  nextAppointment: "2024-01-22",
  medications: [
    { name: "Levodopa", dosage: "100mg", frequency: "3x daily" },
    { name: "Carbidopa", dosage: "25mg", frequency: "3x daily" },
    { name: "Entacapone", dosage: "200mg", frequency: "With each dose" }
  ],
  allergies: ["Penicillin", "Sulfa drugs"],
  emergencyContact: {
    name: "Mary Doe",
    relationship: "Spouse",
    phone: "+1 (555) 123-4567"
  }
};

const mockTestHistory = [
  { date: "2024-01-15", type: "Spiral Test", score: 72, status: "Declining" },
  { date: "2024-01-10", type: "Voice Analysis", score: 65, status: "Declining" },
  { date: "2024-01-05", type: "Gait Analysis", score: 58, status: "Stable" },
  { date: "2023-12-20", type: "Face Analysis", score: 70, status: "Declining" },
  { date: "2023-12-10", type: "Finger Tapping", score: 62, status: "Declining" },
];

const mockProgressData = {
  tremor: [3.2, 3.5, 3.8, 4.2, 4.5, 4.8, 5.2, 5.5, 5.8, 6.0],
  gait: [4.5, 4.3, 4.0, 3.8, 3.5, 3.2, 3.0, 2.8, 2.5, 2.2],
  speech: [4.0, 3.8, 3.6, 3.4, 3.2, 3.0, 2.8, 2.6, 2.4, 2.2],
  cognitive: [4.2, 4.0, 3.8, 3.6, 3.5, 3.3, 3.1, 2.9, 2.8, 2.6],
};

const mockDoctorNotes = [
  { id: 1, date: "2024-01-15", doctor: "Dr. Sarah Smith", note: "Patient shows significant tremor progression. Recommend increasing Levodopa dosage." },
  { id: 2, date: "2024-01-10", doctor: "Dr. Sarah Smith", note: "Voice analysis indicates worsening speech clarity. Consider speech therapy." },
  { id: 3, date: "2023-12-20", doctor: "Dr. Michael Johnson", note: "Patient reports occasional falls. Safety assessment needed." },
];

export default function DoctorPatientView() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "High Risk":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "Moderate":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "Stable":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Declining":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
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
            onClick={() => setLocation("/doctor-dashboard")}
            className="mb-4 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-xl">
                  {mockPatient.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-heading font-bold text-white mb-1">
                  {mockPatient.name}
                </h1>
                <p className="text-white/70">
                  ID: {mockPatient.id} • Age: {mockPatient.age} • {mockPatient.gender}
                </p>
                <Badge className={`mt-2 ${getStatusColor(mockPatient.status)}`}>
                  {mockPatient.status}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Records
              </Button>
              <Button className="bg-primary hover:bg-primary/90">
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Patient
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Patient Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Brain className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-white/60 text-sm">Condition</p>
                  <p className="text-white font-semibold">{mockPatient.condition}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-white/60 text-sm">Diagnosed</p>
                  <p className="text-white font-semibold">{mockPatient.diagnosedDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-orange-400" />
                <div>
                  <p className="text-white/60 text-sm">Last Visit</p>
                  <p className="text-white font-semibold">{mockPatient.lastVisit}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-white/60 text-sm">Next Appointment</p>
                  <p className="text-white font-semibold">{mockPatient.nextAppointment}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-white/10 border border-white/20">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white/20">Overview</TabsTrigger>
            <TabsTrigger value="tests" className="text-white data-[state=active]:bg-white/20">Test History</TabsTrigger>
            <TabsTrigger value="progress" className="text-white data-[state=active]:bg-white/20">Progress</TabsTrigger>
            <TabsTrigger value="notes" className="text-white data-[state=active]:bg-white/20">Doctor Notes</TabsTrigger>
            <TabsTrigger value="medications" className="text-white data-[state=active]:bg-white/20">Medications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Metrics */}
              <Card className="bg-white/10 backdrop-blur-md border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Current Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Tremor Severity", value: "6.0", trend: "up", icon: Wind },
                    { label: "Gait Stability", value: "2.2", trend: "down", icon: Activity },
                    { label: "Speech Clarity", value: "2.2", trend: "down", icon: Speech },
                    { label: "Cognitive Score", value: "2.6", trend: "down", icon: Brain },
                  ].map((metric, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <metric.icon className="w-5 h-5 text-primary" />
                        <span className="text-white">{metric.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{metric.value}</span>
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

              {/* Emergency Contact & Allergies */}
              <div className="space-y-6">
                <Card className="bg-white/10 backdrop-blur-md border border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      Allergies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {mockPatient.allergies.map((allergy, index) => (
                        <Badge key={index} className="bg-red-500/20 text-red-400">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-md border border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      Emergency Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-white"><strong>{mockPatient.emergencyContact.name}</strong></p>
                      <p className="text-white/70">{mockPatient.emergencyContact.relationship}</p>
                      <p className="text-white/70">{mockPatient.emergencyContact.phone}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tests">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Test History</CardTitle>
                <CardDescription className="text-white/60">
                  Recent tests and their results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockTestHistory.map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-white font-semibold">{test.type}</p>
                        <p className="text-white/50 text-sm">{test.date}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-white font-bold">{test.score}%</p>
                          <Badge className={getStatusColor(test.status)}>{test.status}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Disease Progression</CardTitle>
                <CardDescription className="text-white/60">
                  6-month trend analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Progress Chart - Mock */}
                <div className="h-64 bg-slate-800/50 rounded-xl p-4">
                  <div className="flex items-center justify-between h-full">
                    {Object.entries(mockProgressData).map(([key, values]) => (
                      <div key={key} className="flex-1 flex flex-col items-center gap-2">
                        <div className="flex items-end gap-1 h-48">
                          {values.map((val, i) => (
                            <div
                              key={i}
                              className="w-2 bg-primary rounded-t"
                              style={{ height: `${(val / 10) * 100}%` }}
                            />
                          ))}
                        </div>
                        <span className="text-white/60 text-sm capitalize">{key}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  Doctor Notes
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    <Send className="w-4 h-4 mr-2" />
                    Add Note
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockDoctorNotes.map((note) => (
                    <div key={note.id} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white font-semibold">{note.doctor}</p>
                        <p className="text-white/50 text-sm">{note.date}</p>
                      </div>
                      <p className="text-white/80">{note.note}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medications">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Current Medications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockPatient.medications.map((med, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
                      <div>
                        <p className="text-white font-semibold">{med.name}</p>
                        <p className="text-white/50 text-sm">{med.dosage} • {med.frequency}</p>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
