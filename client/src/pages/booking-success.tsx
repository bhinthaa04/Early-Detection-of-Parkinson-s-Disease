import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { CheckCircle2, CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiService, type AppointmentDetails } from "@/lib/api-service";

export default function BookingSuccess() {
  const [, params] = useRoute("/booking-success/:bookingId");
  const [location, setLocation] = useLocation();
  const queryBookingId = new URLSearchParams(location.split("?")[1] || "").get("bookingId") || "";
  const bookingId = params?.bookingId || queryBookingId || "N/A";
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId || bookingId === "N/A") {
      setLoading(false);
      setError("Booking ID is missing");
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiService.getAppointmentByBookingId(bookingId);
        if (!cancelled) setAppointment(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load appointment");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();

    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  return (
    <div className="min-h-screen bg-slate-100/80 px-4 py-8 font-sans">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-center">
        <Card className="w-full rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
              <CheckCircle2 className="h-10 w-10 text-[#0546af]" />
            </div>
            <CardTitle className="text-2xl font-semibold text-slate-900">Appointment Confirmed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p>
                Booking ID: <span className="font-semibold text-[#0546af]">{bookingId}</span>
              </p>
              <p className="mt-1">Status: {appointment?.status ?? "pending"}</p>
            </div>

            {appointment ? (
              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-slate-700">
                <p className="inline-flex items-center gap-2 font-semibold text-slate-900">
                  <CalendarClock className="h-4 w-4 text-[#0546af]" />
                  Appointment Summary
                </p>
                <p className="mt-2">Doctor: {appointment.doctor_name || "Specialist"}</p>
                <p>Date: {appointment.appointment_date || "N/A"}</p>
                <p>Time: {appointment.time_slot || "N/A"}</p>
              </div>
            ) : null}

            {loading ? <p className="text-sm text-slate-600">Loading booking details...</p> : null}
            {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

            <Button className="w-full rounded-xl bg-[#0546af] text-white hover:bg-[#043b95]" onClick={() => setLocation("/dashboard")}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
