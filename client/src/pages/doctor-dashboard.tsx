import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FileText,
  Activity,
  AlertTriangle,
  ArrowLeft,
  Search,
  Filter,
  Calendar,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { useLocation } from "wouter";
import { BackendConfigButton } from "@/components/backend-config";
import { API_ENDPOINTS } from "@/lib/api-config";
import { openPdfInEmbedWindow } from "@/lib/pdf-viewer";

interface Patient {
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
  patient_name: string;
  test_date: string;
  result: string;
  stage: string | null;
  confidence_score: number | string;
  risk_level: string;
  report_url?: string | null;
  created_at: string;
}

interface Appointment {
  bookingId: string;
  patient_id: number;
  patient_name: string;
  appointment_date: string;
  time_slot: string;
  status: string;
  doctor_name?: string | null;
  visit_reason?: string | null;
  created_at: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  pendingCount?: number;
  todayCount?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

interface DoctorStats {
  totalPatients: number;
  todayAppointments: number;
  pendingReports: number;
  highRiskCases: number;
}

interface PatientWithDetails {
  id: number;
  name: string;
  age: number | null;
  status: string;
  condition: string;
  lastVisit: string;
  latestTest: PatientTest | null;
}

const PATIENT_LIMIT = 5;
const APPOINTMENT_LIMIT = 5;

function parseDate(value?: string | null): number {
  if (!value) return 0;
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : 0;
}

function toNumber(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function formatDate(value?: string | null): string {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString();
}

function isHighRisk(value?: string | null): boolean {
  return (value ?? "").toLowerCase() === "high";
}

function buildPageWindow(current: number, totalPages: number): number[] {
  const start = Math.max(1, current - 2);
  const end = Math.min(totalPages, start + 4);
  const adjustedStart = Math.max(1, end - 4);

  const pages: number[] = [];
  for (let page = adjustedStart; page <= end; page += 1) {
    pages.push(page);
  }
  return pages;
}

export default function DoctorDashboard() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [patientPage, setPatientPage] = useState(1);
  const [appointmentPage, setAppointmentPage] = useState(1);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientTests, setPatientTests] = useState<PatientTest[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [patientPagination, setPatientPagination] = useState<PaginationMeta>({
    page: 1,
    limit: PATIENT_LIMIT,
    total: 0,
    totalPages: 1,
  });
  const [appointmentPagination, setAppointmentPagination] = useState<PaginationMeta>({
    page: 1,
    limit: APPOINTMENT_LIMIT,
    total: 0,
    totalPages: 1,
  });

  const [stats, setStats] = useState<DoctorStats>({
    totalPatients: 0,
    todayAppointments: 0,
    pendingReports: 0,
    highRiskCases: 0,
  });

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [patientsRes, testsRes, appointmentsRes] = await Promise.all([
          fetch(`${API_ENDPOINTS.patients}?page=${patientPage}&limit=${PATIENT_LIMIT}`, { signal: controller.signal }),
          fetch(API_ENDPOINTS.patientTests, { signal: controller.signal }),
          fetch(`${API_ENDPOINTS.appointmentsBase}?page=${appointmentPage}&limit=${APPOINTMENT_LIMIT}`, {
            signal: controller.signal,
          }),
        ]);

        if (!patientsRes.ok) throw new Error("Failed to fetch patients");
        if (!testsRes.ok) throw new Error("Failed to fetch patient tests");
        if (!appointmentsRes.ok) throw new Error("Failed to fetch appointments");

        const [patientsPayload, testsPayload, appointmentsPayload] = await Promise.all([
          patientsRes.json(),
          testsRes.json(),
          appointmentsRes.json(),
        ]);

        const pagedPatients = patientsPayload as PaginatedResponse<Patient>;
        const pagedAppointments = appointmentsPayload as PaginatedResponse<Appointment>;

        const safePatients = Array.isArray(pagedPatients?.data)
          ? pagedPatients.data
          : Array.isArray(patientsPayload)
            ? (patientsPayload as Patient[])
            : [];

        const safeTests = Array.isArray(testsPayload) ? (testsPayload as PatientTest[]) : [];

        const safeAppointments = Array.isArray(pagedAppointments?.data)
          ? pagedAppointments.data
          : Array.isArray(appointmentsPayload)
            ? (appointmentsPayload as Appointment[])
            : [];

        setPatients(safePatients);
        setPatientTests(safeTests);
        setAppointments(safeAppointments);

        setPatientPagination(
          pagedPatients?.pagination ?? {
            page: patientPage,
            limit: PATIENT_LIMIT,
            total: safePatients.length,
            totalPages: 1,
          },
        );

        setAppointmentPagination(
          pagedAppointments?.pagination ?? {
            page: appointmentPage,
            limit: APPOINTMENT_LIMIT,
            total: safeAppointments.length,
            totalPages: 1,
          },
        );

        setStats({
          totalPatients: Number(pagedPatients?.pagination?.total ?? safePatients.length),
          todayAppointments: Number(
            pagedAppointments?.pagination?.todayCount ??
              safeAppointments.filter((app) => String(app.appointment_date ?? "").slice(0, 10) === new Date().toISOString().slice(0, 10)).length,
          ),
          pendingReports: Number(
            pagedAppointments?.pagination?.pendingCount ??
              safeAppointments.filter((app) => app.status?.toLowerCase() === "pending").length,
          ),
          highRiskCases: safeTests.filter((test) => isHighRisk(test.risk_level)).length,
        });
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("Error fetching dashboard data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [patientPage, appointmentPage]);

  const latestTestByPatientId = useMemo(() => {
    const map = new Map<number, PatientTest>();
    for (const test of [...patientTests].sort((a, b) => parseDate(b.test_date) - parseDate(a.test_date))) {
      if (!map.has(test.patient_id)) {
        map.set(test.patient_id, test);
      }
    }
    return map;
  }, [patientTests]);

  const patientsWithDetails = useMemo<PatientWithDetails[]>(() => {
    return patients.map((patient) => {
      const latestTest = latestTestByPatientId.get(patient.patient_id) ?? null;
      const status = latestTest?.risk_level || patient.risk_level || "Stable";
      const condition = latestTest
        ? `${latestTest.result}${latestTest.stage ? ` - ${latestTest.stage}` : ""}`
        : "No test results yet";

      return {
        id: patient.patient_id,
        name: patient.name,
        age: patient.age,
        status,
        condition,
        lastVisit: latestTest ? formatDate(latestTest.test_date) : "No activity",
        latestTest,
      };
    });
  }, [patients, latestTestByPatientId]);

  const filteredPatients = useMemo(() => {
    return patientsWithDetails.filter((patient) => {
      const matchesSearch =
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(patient.id).includes(searchQuery.trim());

      const matchesFilter =
        filterStatus === "all" || patient.status.toLowerCase().includes(filterStatus.toLowerCase());

      return matchesSearch && matchesFilter;
    });
  }, [patientsWithDetails, searchQuery, filterStatus]);

  const alerts = useMemo(() => {
    const highRisk = [...patientTests]
      .filter((test) => isHighRisk(test.risk_level))
      .sort((a, b) => parseDate(b.test_date) - parseDate(a.test_date))
      .slice(0, 2)
      .map((test) => ({
        id: `high-${test.id}`,
        type: "critical" as const,
        message: `${test.patient_name} - High risk detected`,
      }));

    const pending = [...appointments]
      .filter((appointment) => appointment.status?.toLowerCase() === "pending")
      .slice(0, 2)
      .map((appointment) => ({
        id: `pending-${appointment.bookingId}`,
        type: "warning" as const,
        message: `Pending appointment - ${appointment.patient_name}`,
      }));

    const items = [...highRisk, ...pending];
    if (items.length === 0) {
      return [{ id: "ok", type: "info" as const, message: "No urgent alerts" }];
    }
    return items;
  }, [patientTests, appointments]);

  const getStatusColor = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized.includes("high")) return "bg-red-500/20 text-red-400 border-red-500/30";
    if (normalized.includes("moderate") || normalized.includes("pending")) {
      return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    }
    if (normalized.includes("low") || normalized.includes("stable") || normalized.includes("confirmed")) {
      return "bg-green-500/20 text-green-400 border-green-500/30";
    }
    return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  const patientPageNumbers = buildPageWindow(patientPagination.page, patientPagination.totalPages);
  const appointmentPageNumbers = buildPageWindow(appointmentPagination.page, appointmentPagination.totalPages);

  return (
    <div className="min-h-screen relative overflow-hidden font-sans">
      <BackendConfigButton />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Button variant="ghost" onClick={() => setLocation("/")} className="mb-4 text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-2">Doctor Dashboard</h1>
              <p className="text-white/70">Real patient data from backend API</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90" onClick={() => setLocation("/doctor-login")}>
              Logout
            </Button>
          </div>
        </motion.div>

        {error ? (
          <Card className="mb-6 bg-red-500/15 border border-red-400/30">
            <CardContent className="p-4 text-red-100 text-sm">{error}</CardContent>
          </Card>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: "Total Patients", value: stats.totalPatients, color: "bg-blue-500/20 text-blue-400" },
            { icon: Calendar, label: "Today's Appointments", value: stats.todayAppointments, color: "bg-purple-500/20 text-purple-400" },
            { icon: FileText, label: "Pending Reports", value: stats.pendingReports, color: "bg-orange-500/20 text-orange-400" },
            { icon: Activity, label: "High Risk Cases", value: stats.highRiskCases, color: "bg-red-500/20 text-red-400" },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
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
          <div className="lg:col-span-3 space-y-6">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                    <input
                      type="text"
                      placeholder="Search patients by name or ID"
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
                      <option value="high">High Risk</option>
                      <option value="moderate">Moderate</option>
                      <option value="low">Low</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Patient List
                </CardTitle>
                <CardDescription className="text-white/60">
                  {loading ? "Loading..." : `Page ${patientPagination.page} of ${patientPagination.totalPages}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-white/70 text-sm">Loading patient records...</p>
                ) : filteredPatients.length === 0 ? (
                  <p className="text-white/70 text-sm">No patients found.</p>
                ) : (
                  <div className="space-y-4">
                    {filteredPatients.map((patient) => (
                      <div
                        key={patient.id}
                        className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                        onClick={() => setLocation(`/doctor-patient-view?id=${patient.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-white font-semibold">{patient.name}</h3>
                            <p className="text-white/50 text-sm">ID: {patient.id} - Age: {patient.age ?? "N/A"}</p>
                            <p className="text-white/50 text-sm">{patient.condition}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-white border-white/20 hover:bg-white/10"
                              onClick={(event) => {
                                event.stopPropagation();
                                if (patient.latestTest) {
                                  openPdfInEmbedWindow(
                                    `${API_ENDPOINTS.reportsByTestBase}/${patient.latestTest.id}`,
                                    `${patient.name} Report`,
                                  );
                                }
                              }}
                              disabled={!patient.latestTest}
                            >
                              View Report
                            </Button>
                            <Badge className={getStatusColor(patient.status)}>{patient.status}</Badge>
                            <ChevronRight className="w-5 h-5 text-white/50" />
                          </div>
                        </div>
                        <div className="mt-3 text-sm text-white/60">Last test: {patient.lastVisit}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-5 flex items-center justify-between">
                  <Button
                    variant="outline"
                    className="text-white border-white/20 hover:bg-white/10"
                    disabled={patientPagination.page <= 1}
                    onClick={() => setPatientPage((prev) => Math.max(1, prev - 1))}
                  >
                    Prev
                  </Button>

                  <div className="flex items-center gap-2">
                    {patientPageNumbers.map((page) => (
                      <Button
                        key={page}
                        variant={page === patientPagination.page ? "default" : "outline"}
                        className={page === patientPagination.page ? "bg-primary" : "text-white border-white/20 hover:bg-white/10"}
                        onClick={() => setPatientPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    className="text-white border-white/20 hover:bg-white/10"
                    disabled={patientPagination.page >= patientPagination.totalPages}
                    onClick={() => setPatientPage((prev) => Math.min(patientPagination.totalPages, prev + 1))}
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Appointments
                </CardTitle>
                <CardDescription className="text-white/60">
                  Page {appointmentPagination.page} of {appointmentPagination.totalPages}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <p className="text-white/70 text-sm">No appointments found.</p>
                ) : (
                  <div className="space-y-3">
                    {appointments.map((appointment) => (
                      <div key={appointment.bookingId} className="p-3 bg-white/5 border border-white/10 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{appointment.patient_name}</p>
                            <p className="text-white/60 text-xs">{formatDate(appointment.appointment_date)} {appointment.time_slot}</p>
                            <p className="text-white/60 text-xs">Doctor: {appointment.doctor_name ?? "N/A"}</p>
                          </div>
                          <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-5 flex items-center justify-between">
                  <Button
                    variant="outline"
                    className="text-white border-white/20 hover:bg-white/10"
                    disabled={appointmentPagination.page <= 1}
                    onClick={() => setAppointmentPage((prev) => Math.max(1, prev - 1))}
                  >
                    Prev
                  </Button>

                  <div className="flex items-center gap-2">
                    {appointmentPageNumbers.map((page) => (
                      <Button
                        key={page}
                        variant={page === appointmentPagination.page ? "default" : "outline"}
                        className={page === appointmentPagination.page ? "bg-primary" : "text-white border-white/20 hover:bg-white/10"}
                        onClick={() => setAppointmentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    className="text-white border-white/20 hover:bg-white/10"
                    disabled={appointmentPagination.page >= appointmentPagination.totalPages}
                    onClick={() => setAppointmentPage((prev) => Math.min(appointmentPagination.totalPages, prev + 1))}
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Recent Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.map((alert) => (
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
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start text-white border-white/20 hover:bg-white/10">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Reports
                </Button>
                <Button variant="outline" className="w-full justify-start text-white border-white/20 hover:bg-white/10">
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
