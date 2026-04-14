import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  MessageSquare,
  Send,
  FileText,
  Pill,
} from "lucide-react";
import { useLocation } from "wouter";
import { BackendConfigButton } from "@/components/backend-config";
import { API_ENDPOINTS } from "@/lib/api-config";

interface PatientDetail {
  patient_id: number;
  name: string;
  age: number | null;
  gender: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  risk_level?: string | null;
  created_at: string;
}

interface PatientTest {
  id: number;
  patient_id: number;
  test_date: string;
  result: string;
  stage: string | null;
  confidence_score: number | string;
  risk_level: string;
  test_type?: string | null;
  report_url?: string | null;
  created_at: string;
}

interface DoctorNote {
  note_id: number;
  patient_id: number;
  doctor_id: number;
  doctor_name?: string | null;
  note: string;
  note_date: string;
  created_at: string;
}

interface Medication {
  medication_id: number;
  patient_id: number;
  medicine_name: string;
  dosage: string | null;
  frequency: string | null;
  created_at: string;
}

function toNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatDateTime(value?: string | null): string {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString();
}

export default function DoctorPatientView() {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [tests, setTests] = useState<PatientTest[]>([]);
  const [notes, setNotes] = useState<DoctorNote[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);

  const [newNote, setNewNote] = useState("");
  const [noteSubmitting, setNoteSubmitting] = useState(false);

  const [medicineName, setMedicineName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [medSubmitting, setMedSubmitting] = useState(false);

  const patientId = useMemo(() => {
    const query = typeof window !== "undefined"
      ? window.location.search
      : location.includes("?")
        ? location.slice(location.indexOf("?"))
        : "";
    const params = new URLSearchParams(query);
    const id = params.get("id");
    const parsed = Number(id);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [location]);

  const doctorId = useMemo(() => {
    const cached = window.localStorage.getItem("defaultDoctorId");
    const parsed = Number(cached);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }, []);

  const fetchPatientViewData = async (id: number, signal?: AbortSignal) => {
    const [patientRes, testsRes, notesRes, medsRes] = await Promise.all([
      fetch(`${API_ENDPOINTS.patients}/${id}`, { signal }),
      fetch(`${API_ENDPOINTS.patientTests}?patientId=${id}`, { signal }),
      fetch(`${API_ENDPOINTS.doctorNotes}?patientId=${id}`, { signal }),
      fetch(`${API_ENDPOINTS.medications}?patientId=${id}`, { signal }),
    ]);

    if (!patientRes.ok) throw new Error("Failed to fetch patient details");
    if (!testsRes.ok) throw new Error("Failed to fetch patient tests");
    if (!notesRes.ok) throw new Error("Failed to fetch doctor notes");
    if (!medsRes.ok) throw new Error("Failed to fetch medications");

    const [patientData, testsData, notesData, medsData] = await Promise.all([
      patientRes.json(),
      testsRes.json(),
      notesRes.json(),
      medsRes.json(),
    ]);

    setPatient(patientData as PatientDetail);
    setTests(Array.isArray(testsData) ? (testsData as PatientTest[]) : []);
    setNotes(Array.isArray(notesData) ? (notesData as DoctorNote[]) : []);
    setMedications(Array.isArray(medsData) ? (medsData as Medication[]) : []);
  };

  useEffect(() => {
    if (!patientId) {
      setError("Invalid patient id in URL");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        await fetchPatientViewData(patientId, controller.signal);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("doctor patient view fetch error", err);
        setError(err instanceof Error ? err.message : "Failed to load patient data");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      controller.abort();
    };
  }, [patientId]);

  const latestTest = tests[0] ?? null;

  const statusBadgeClass = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized.includes("high")) return "bg-red-500/20 text-red-400 border-red-500/30";
    if (normalized.includes("moderate") || normalized.includes("pending")) {
      return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    }
    if (normalized.includes("low") || normalized.includes("stable")) {
      return "bg-green-500/20 text-green-400 border-green-500/30";
    }
    return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  const handleAddNote = async () => {
    if (!patientId || !newNote.trim()) return;

    try {
      setNoteSubmitting(true);
      const response = await fetch(API_ENDPOINTS.doctorNotes, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          doctorId,
          note: newNote.trim(),
          date: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Failed to add note");
        throw new Error(errorText || "Failed to add note");
      }

      setNewNote("");
      await fetchPatientViewData(patientId);
    } catch (err) {
      console.error("add note error", err);
      setError(err instanceof Error ? err.message : "Failed to add note");
    } finally {
      setNoteSubmitting(false);
    }
  };

  const handleAddMedication = async () => {
    if (!patientId || !medicineName.trim()) return;

    try {
      setMedSubmitting(true);
      const response = await fetch(API_ENDPOINTS.medications, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          medicine_name: medicineName.trim(),
          dosage: dosage.trim() || null,
          frequency: frequency.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Failed to add medication");
        throw new Error(errorText || "Failed to add medication");
      }

      setMedicineName("");
      setDosage("");
      setFrequency("");
      await fetchPatientViewData(patientId);
    } catch (err) {
      console.error("add medication error", err);
      setError(err instanceof Error ? err.message : "Failed to add medication");
    } finally {
      setMedSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-sans">
      <BackendConfigButton />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Button variant="ghost" onClick={() => setLocation("/doctor-dashboard")} className="mb-4 text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          {error ? (
            <Card className="mb-4 bg-red-500/15 border border-red-400/30">
              <CardContent className="p-4 text-red-100 text-sm">{error}</CardContent>
            </Card>
          ) : null}

          {loading ? (
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardContent className="p-6 text-white/80">Loading patient details...</CardContent>
            </Card>
          ) : patient ? (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-heading font-bold text-white mb-1">{patient.name}</h1>
                <p className="text-white/70">ID: {patient.patient_id} - Age: {patient.age ?? "N/A"} - {patient.gender ?? "N/A"}</p>
                <Badge className={`mt-2 ${statusBadgeClass(patient.risk_level || "Stable")}`}>
                  {patient.risk_level || "Stable"}
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={() => {
                    if (latestTest) {
                      window.open(`${API_ENDPOINTS.reportsByTestBase}/${latestTest.id}`, "_blank");
                    }
                  }}
                  disabled={!latestTest}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Latest Report
                </Button>
                <Button className="bg-primary hover:bg-primary/90">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Patient
                </Button>
              </div>
            </div>
          ) : null}
        </motion.div>

        {patient ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="bg-white/10 backdrop-blur-md border border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-white/60 text-sm">Latest Result</p>
                      <p className="text-white font-semibold">{latestTest?.result || "N/A"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-md border border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-purple-400" />
                    <div>
                      <p className="text-white/60 text-sm">Last Test Date</p>
                      <p className="text-white font-semibold">{formatDateTime(latestTest?.test_date)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-md border border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-8 h-8 text-orange-400" />
                    <div>
                      <p className="text-white/60 text-sm">Patient Created</p>
                      <p className="text-white font-semibold">{formatDateTime(patient.created_at)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="bg-white/10 border border-white/20">
                <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white/20">Overview</TabsTrigger>
                <TabsTrigger value="tests" className="text-white data-[state=active]:bg-white/20">Test History</TabsTrigger>
                <TabsTrigger value="notes" className="text-white data-[state=active]:bg-white/20">Doctor Notes</TabsTrigger>
                <TabsTrigger value="medications" className="text-white data-[state=active]:bg-white/20">Medications</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card className="bg-white/10 backdrop-blur-md border border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">Patient Basic Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-white/85">
                    <p><strong>Name:</strong> {patient.name}</p>
                    <p><strong>Age:</strong> {patient.age ?? "N/A"}</p>
                    <p><strong>Gender:</strong> {patient.gender ?? "N/A"}</p>
                    <p><strong>Phone:</strong> {patient.phone ?? "N/A"}</p>
                    <p><strong>Email:</strong> {patient.email ?? "N/A"}</p>
                    <p><strong>Address:</strong> {patient.address ?? "N/A"}</p>
                    <p><strong>Risk Level:</strong> {patient.risk_level ?? "N/A"}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tests">
                <Card className="bg-white/10 backdrop-blur-md border border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">Test History</CardTitle>
                    <CardDescription className="text-white/60">Real test records from database</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {tests.length === 0 ? (
                      <p className="text-white/70">No tests found for this patient.</p>
                    ) : (
                      <div className="space-y-3">
                        {tests.map((test) => (
                          <div key={test.id} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                              <p className="text-white/90 text-sm">{formatDateTime(test.test_date)}</p>
                              <p className="text-white/90 text-sm">{test.result}</p>
                              <p className="text-white/90 text-sm">{test.stage || "N/A"}</p>
                              <p className="text-white/90 text-sm">{toNumber(test.confidence_score) ?? "N/A"}%</p>
                              <Button
                                size="sm"
                                className="bg-primary hover:bg-primary/90"
                                onClick={() => window.open(`${API_ENDPOINTS.reportsByTestBase}/${test.id}`, "_blank")}
                              >
                                View Report
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes">
                <Card className="bg-white/10 backdrop-blur-md border border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      Doctor Notes
                      <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={handleAddNote} disabled={noteSubmitting || !newNote.trim()}>
                        <Send className="w-4 h-4 mr-2" />
                        Add Note
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Enter doctor note"
                      className="w-full min-h-24 rounded-lg border border-white/20 bg-white/10 p-3 text-white placeholder:text-white/50"
                    />

                    {notes.length === 0 ? (
                      <p className="text-white/70">No notes available.</p>
                    ) : (
                      notes.map((note) => (
                        <div key={note.note_id} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-white font-semibold">{note.doctor_name || `Doctor ${note.doctor_id}`}</p>
                            <p className="text-white/50 text-sm">{formatDateTime(note.note_date)}</p>
                          </div>
                          <p className="text-white/80">{note.note}</p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="medications">
                <Card className="bg-white/10 backdrop-blur-md border border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Pill className="w-5 h-5" />
                      Medications
                    </CardTitle>
                    <CardDescription className="text-white/60">Store and fetch medication list from database</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        value={medicineName}
                        onChange={(e) => setMedicineName(e.target.value)}
                        placeholder="Medicine name"
                        className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50"
                      />
                      <input
                        value={dosage}
                        onChange={(e) => setDosage(e.target.value)}
                        placeholder="Dosage"
                        className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50"
                      />
                      <input
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                        placeholder="Frequency"
                        className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50"
                      />
                    </div>

                    <Button className="bg-primary hover:bg-primary/90" onClick={handleAddMedication} disabled={medSubmitting || !medicineName.trim()}>
                      <FileText className="w-4 h-4 mr-2" />
                      Add Medication
                    </Button>

                    {medications.length === 0 ? (
                      <p className="text-white/70">No medications found.</p>
                    ) : (
                      <div className="space-y-3">
                        {medications.map((medication) => (
                          <div key={medication.medication_id} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                            <p className="text-white font-semibold">{medication.medicine_name}</p>
                            <p className="text-white/60 text-sm">Dosage: {medication.dosage || "N/A"}</p>
                            <p className="text-white/60 text-sm">Frequency: {medication.frequency || "N/A"}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : null}
      </div>
    </div>
  );
}
