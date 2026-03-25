import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapPin, Star, Stethoscope, Clock3, GraduationCap } from "lucide-react";
import { SPECIALIST_DOCTORS, type SpecialistDoctor } from "@/data/specialists";

type AvailabilityFilter = "Any" | "Today" | "This Week";
type SpecialtyFilter = "All" | "Neurologist" | "Parkinson's Specialist";
type CareTrackFilter = "All" | "Medical (Neurology)" | "Surgical (Neurosurgery)";

function careTrackForDoctor(doctor: SpecialistDoctor): "Medical (Neurology)" | "Surgical (Neurosurgery)" {
  return doctor.specialty === "Parkinson's Specialist" ? "Surgical (Neurosurgery)" : "Medical (Neurology)";
}

export default function ViewSpecialists() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState<SpecialtyFilter>("All");
  const [availability, setAvailability] = useState<AvailabilityFilter>("Any");
  const [careTrack, setCareTrack] = useState<CareTrackFilter>("All");
  const [maxDistance, setMaxDistance] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<SpecialistDoctor | null>(null);
  const pageSize = 6;

  const filteredDoctors = useMemo(() => {
    return SPECIALIST_DOCTORS.filter((doctor) => {
      const terms = `${doctor.name} ${doctor.specialty} ${doctor.location} ${doctor.clinic}`.toLowerCase();
      const matchesQuery = query.trim() ? terms.includes(query.toLowerCase()) : true;
      const matchesSpecialty = specialty === "All" || doctor.specialty === specialty;
      const matchesAvailability = availability === "Any" || doctor.availability === availability;
      const matchesCareTrack = careTrack === "All" || careTrackForDoctor(doctor) === careTrack;
      const matchesDistance = doctor.distanceKm <= maxDistance;
      return matchesQuery && matchesSpecialty && matchesAvailability && matchesCareTrack && matchesDistance;
    });
  }, [availability, careTrack, maxDistance, query, specialty]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, specialty, availability, careTrack, maxDistance]);

  const totalPages = Math.max(1, Math.ceil(filteredDoctors.length / pageSize));
  const paginatedDoctors = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDoctors.slice(start, start + pageSize);
  }, [currentPage, filteredDoctors]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="min-h-screen bg-slate-100/80 px-4 py-8 font-sans">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-wide text-slate-900">Specialist Directory</h1>
          <p className="mt-1 text-sm text-slate-600">
            Parkinson&apos;s and neurology specialists in Thoothukudi and Tirunelveli.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm lg:col-span-1">
            <CardContent className="space-y-5 p-5">
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">Search</p>
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Doctor, clinic, location"
                  className="rounded-xl border-slate-300"
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">Specialty</p>
                <div className="flex flex-wrap gap-2">
                  {(["All", "Neurologist", "Parkinson's Specialist"] as SpecialtyFilter[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setSpecialty(item)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                        specialty === item ? "border-[#0546af] bg-[#0546af] text-white" : "border-slate-300 text-slate-700"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">Availability</p>
                <div className="space-y-2">
                  {(["Any", "Today", "This Week"] as AvailabilityFilter[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setAvailability(item)}
                      className={`w-full rounded-xl border px-3 py-2 text-left text-sm font-semibold ${
                        availability === item ? "border-[#0546af] bg-blue-50 text-[#0546af]" : "border-slate-300 text-slate-700"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">Care Track</p>
                <div className="space-y-2">
                  {(["All", "Medical (Neurology)", "Surgical (Neurosurgery)"] as CareTrackFilter[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCareTrack(item)}
                      className={`w-full rounded-xl border px-3 py-2 text-left text-sm font-semibold ${
                        careTrack === item ? "border-[#0546af] bg-blue-50 text-[#0546af]" : "border-slate-300 text-slate-700"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">Distance</p>
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={maxDistance}
                  onChange={(event) => setMaxDistance(Number(event.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200"
                />
                <p className="mt-1 text-xs text-slate-600">Within {maxDistance} km</p>
              </div>

            </CardContent>
          </Card>

          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">{filteredDoctors.length} specialists found</p>
              <Badge className="rounded-full bg-[#0546af] px-3 py-1 text-white">Thoothukudi & Tirunelveli</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {paginatedDoctors.map((doctor) => (
                <Card key={doctor.id} className="rounded-2xl border-slate-200 bg-white shadow-sm transition hover:shadow-md">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-start gap-3">
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(doctor.name)}`}
                        alt={doctor.name}
                        className="h-14 w-14 rounded-full border border-slate-200 bg-slate-50"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-semibold text-slate-900">{doctor.name}</h3>
                        <p className="text-xs text-slate-600">{doctor.clinic}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-700">
                            {doctor.specialty}
                          </Badge>
                          <Badge variant="secondary" className="rounded-full bg-blue-50 text-[#0546af]">
                            {doctor.location}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rating</p>
                        <p className="mt-1 inline-flex items-center gap-1 font-semibold text-slate-900">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {doctor.rating}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Experience</p>
                        <p className="mt-1 inline-flex items-center gap-1 font-semibold text-slate-900">
                          <Stethoscope className="h-3.5 w-3.5 text-[#0546af]" />
                          {doctor.experience} yrs
                        </p>
                      </div>
                    </div>

                    <p className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                      <MapPin className="h-3.5 w-3.5" />
                      {doctor.distanceKm} km away
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        className="rounded-xl border-slate-300 font-semibold"
                        onClick={() => setSelectedDoctor(doctor)}
                      >
                        View Profile
                      </Button>
                      <Button
                        className="rounded-xl bg-[#0546af] font-semibold text-white hover:bg-[#043b95]"
                        onClick={() => window.open(doctor.googleSearchUrl, "_blank", "noopener,noreferrer")}
                      >
                        Book Appointment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredDoctors.length > 0 ? (
              <div className="mt-6 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  className="rounded-xl border-slate-300"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    className={`h-9 w-9 rounded-xl p-0 ${currentPage === page ? "bg-[#0546af] text-white" : "border-slate-300"}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  className="rounded-xl border-slate-300"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            ) : null}

            {filteredDoctors.length === 0 ? (
              <Card className="mt-4 rounded-2xl border-slate-200 bg-white shadow-sm">
                <CardContent className="p-8 text-center">
                  <p className="text-sm font-semibold text-slate-700">No doctors match your filters.</p>
                  <p className="mt-1 text-sm text-slate-500">Try adjusting specialty, care track, or distance.</p>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </div>

      <Dialog open={Boolean(selectedDoctor)} onOpenChange={(open) => !open && setSelectedDoctor(null)}>
        <DialogContent className="max-w-2xl rounded-2xl border-slate-200 bg-white p-0">
          {selectedDoctor ? (
            <div className="p-6">
              <DialogHeader>
                <DialogTitle className="text-2xl font-semibold text-slate-900">{selectedDoctor.name}</DialogTitle>
                <DialogDescription className="text-slate-600">
                  {selectedDoctor.specialty} at {selectedDoctor.clinic}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Professional Bio</p>
                  <p className="mt-2 text-sm text-slate-700">{selectedDoctor.bio}</p>
                </div>
                <div className="space-y-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <GraduationCap className="h-4 w-4" />
                      Qualifications
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{selectedDoctor.qualifications}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <Clock3 className="h-4 w-4" />
                      Clinic Timings
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{selectedDoctor.clinicTimings}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="rounded-xl border-slate-300"
                  onClick={() => setLocation(`/schedule-checkup?doctorId=${selectedDoctor.id}`)}
                >
                  Schedule in App
                </Button>
                <Button
                  className="rounded-xl bg-[#0546af] text-white hover:bg-[#043b95]"
                  onClick={() => window.open(selectedDoctor.googleSearchUrl, "_blank", "noopener,noreferrer")}
                >
                  Book Appointment
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
