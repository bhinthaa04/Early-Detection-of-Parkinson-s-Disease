import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { CalendarDays, CheckCircle2, Clock3, UserRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SPECIALIST_DOCTORS } from "@/data/specialists";
import { apiService } from "@/lib/api-service";
import { readPatientData } from "@/lib/patient-data";

type Step = 1 | 2 | 3;

const SLOT_GROUPS: { label: string; slots: string[] }[] = [
  { label: "Morning", slots: ["08:30 AM", "09:00 AM", "10:00 AM", "11:00 AM"] },
  { label: "Afternoon", slots: ["12:30 PM", "01:30 PM", "02:30 PM", "03:30 PM"] },
  { label: "Evening", slots: ["04:30 PM", "05:30 PM", "06:30 PM"] },
];

function parseDoctorIdFromLocation(location: string): number | null {
  const queryString = location.includes("?") ? location.split("?")[1] : "";
  const params = new URLSearchParams(queryString);
  const id = Number(params.get("doctorId"));
  return Number.isFinite(id) && id > 0 ? id : null;
}

export default function ScheduleCheckup() {
  const [location, setLocation] = useLocation();
  const [step, setStep] = useState<Step>(1);
  const [visibleMonth, setVisibleMonth] = useState(new Date(2026, 3, 1));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 3, 24));
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [patientName, setPatientName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedDoctorId = parseDoctorIdFromLocation(location);
  const selectedDoctor = SPECIALIST_DOCTORS.find((doctor) => doctor.id === selectedDoctorId) ?? null;

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(visibleMonth);
    const monthEnd = endOfMonth(visibleMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [visibleMonth]);

  const canContinueFromStep1 = Boolean(selectedDate);
  const canContinueFromStep2 = Boolean(selectedSlot);
  const canSubmit = patientName.trim().length > 1 && phoneNumber.trim().length >= 8 && reason.trim().length > 3;

  useEffect(() => {
    const patientData = readPatientData();
    if (!patientData) return;
    setPatientName((prev) => (prev.trim() ? prev : patientData.name || ""));
    setPhoneNumber((prev) => (prev.trim() ? prev : patientData.contact || ""));
  }, []);

  const goNext = () => {
    if (step === 1 && canContinueFromStep1) setStep(2);
    if (step === 2 && canContinueFromStep2) setStep(3);
  };

  const goBack = () => {
    if (step === 3) setStep(2);
    if (step === 2) setStep(1);
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedSlot || !canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const patientData = readPatientData();
      let patientId = patientData?.db_patient_id;

      if (!patientId) {
        patientId = await apiService.createPatient({
          name: patientName.trim(),
          phone: phoneNumber.trim(),
        });
      }

      const doctorId = selectedDoctor?.id ?? (await apiService.ensureDefaultDoctor());

      const appointmentResponse = await apiService.createAppointment({
        patientName: patientName.trim(),
        phoneNumber: phoneNumber.trim(),
        reason: reason.trim(),
        doctorId,
        date: format(selectedDate, "yyyy-MM-dd"),
        time: selectedSlot,
        patientId,
      });

      setLocation(`/booking-success/${appointmentResponse.bookingId}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to create appointment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/80 px-4 py-8 font-sans">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-slate-900">Schedule Appointment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {(["Select Date", "Select Time Slot", "Patient Details"] as const).map((label, index) => {
                const indexStep = (index + 1) as Step;
                const isActive = step === indexStep;
                const isDone = step > indexStep;
                return (
                  <div
                    key={label}
                    className={`rounded-2xl border px-4 py-3 ${isActive ? "border-[#0546af] bg-blue-50" : "border-slate-200 bg-slate-50"}`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step {index + 1}</p>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="font-semibold text-slate-900">{label}</p>
                      {isDone ? <CheckCircle2 className="h-4 w-4 text-[#0546af]" /> : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {selectedDoctor ? (
          <Card className="rounded-2xl border-blue-100 bg-blue-50/80 shadow-sm">
            <CardContent className="p-4 text-sm text-slate-700">
              Booking with <span className="font-semibold text-[#0546af]">{selectedDoctor.name}</span> ({selectedDoctor.clinic})
            </CardContent>
          </Card>
        ) : null}

        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardContent className="p-6">
            {step === 1 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
                    <CalendarDays className="h-5 w-5 text-[#0546af]" />
                    {format(visibleMonth, "MMMM yyyy")}
                  </h2>
                  <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl border-slate-300" onClick={() => setVisibleMonth((prev) => addMonths(prev, -1))}>
                      Previous
                    </Button>
                    <Button variant="outline" className="rounded-xl border-slate-300" onClick={() => setVisibleMonth((prev) => addMonths(prev, 1))}>
                      Next
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day) => {
                    const inMonth = isSameMonth(day, visibleMonth);
                    const active = isSameDay(day, selectedDate);
                    return (
                      <button
                        key={day.toISOString()}
                        type="button"
                        onClick={() => setSelectedDate(day)}
                        className={`h-14 rounded-xl border text-sm font-semibold ${
                          active
                            ? "border-[#0546af] bg-[#0546af] text-white"
                            : inMonth
                              ? "border-slate-200 text-slate-800 hover:border-[#0546af]/40"
                              : "border-slate-200 bg-slate-50 text-slate-400"
                        }`}
                      >
                        {format(day, "d")}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-5">
                <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <Clock3 className="h-5 w-5 text-[#0546af]" />
                  Select Time Slot
                </h2>
                {SLOT_GROUPS.map((group) => (
                  <div key={group.label}>
                    <p className="mb-2 text-sm font-semibold text-slate-700">{group.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.slots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                            selectedSlot === slot
                              ? "border-[#0546af] bg-[#0546af] text-white"
                              : "border-slate-300 text-slate-700 hover:border-[#0546af]/40"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-4">
                <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <UserRound className="h-5 w-5 text-[#0546af]" />
                  Patient Details
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Patient Name</label>
                    <Input
                      value={patientName}
                      onChange={(event) => setPatientName(event.target.value)}
                      placeholder="Enter full name"
                      className="rounded-xl border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Phone Number</label>
                    <Input
                      value={phoneNumber}
                      onChange={(event) => setPhoneNumber(event.target.value)}
                      placeholder="Enter contact number"
                      className="rounded-xl border-slate-300"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Reason for Visit</label>
                  <Textarea
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="Briefly describe symptoms or follow-up needs"
                    className="min-h-28 rounded-2xl border-slate-300"
                  />
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <p className="font-semibold text-slate-900">Summary</p>
                  <p className="mt-1">
                    {format(selectedDate, "EEE, MMM d, yyyy")} at {selectedSlot || "Time not selected"}
                  </p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="rounded-xl border-slate-300" onClick={() => (step === 1 ? setLocation("/view-specialists") : goBack())}>
            {step === 1 ? "Back to Specialists" : "Back"}
          </Button>
          {step < 3 ? (
            <Button
              className="rounded-xl bg-[#0546af] px-6 text-white hover:bg-[#043b95]"
              onClick={goNext}
              disabled={(step === 1 && !canContinueFromStep1) || (step === 2 && !canContinueFromStep2)}
            >
              Continue
            </Button>
          ) : (
            <Button
              className="rounded-xl bg-[#0546af] px-6 text-white hover:bg-[#043b95]"
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
            >
              {submitting ? "Confirming..." : "Confirm Appointment"}
            </Button>
          )}
        </div>
        {submitError ? <p className="text-sm font-medium text-red-600">{submitError}</p> : null}
      </div>
    </div>
  );
}
