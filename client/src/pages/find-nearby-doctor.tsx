import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Globe2,
  MapPin,
  SlidersHorizontal,
  Star,
  CalendarCheck2,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SPECIALIST_DOCTORS } from "@/data/specialists";

type Language = "en" | "ta";
type CareTrack = "all" | "medication" | "advanced";

const copy = {
  en: {
    title: "Find Nearby Doctor",
    subtitle: "Thoothukudi & Tirunelveli Parkinson's and neurology specialists",
    back: "Back to Result",
    language: "Language",
    filterTitle: "Filters",
    distance: "Max Distance",
    rating: "Min Rating",
    careTrack: "Care Path",
    medication: "Medication Management",
    advanced: "Advanced Procedures",
    all: "All",
    mapTitle: "Map View",
    mapHint: "Selected doctor location preview",
    kmAway: "km away",
    book: "Book Appointment",
    mapOpen: "Open in Maps",
    results: "Doctors found",
    focus: "Primary Focus",
  },
  ta: {
    title: "அருகிலுள்ள மருத்துவரை கண்டுபிடிக்கவும்",
    subtitle: "தூத்துக்குடி மற்றும் திருநெல்வேலி நரம்பியல் நிபுணர்கள்",
    back: "விளைவுக்கு திரும்ப",
    language: "மொழி",
    filterTitle: "வடிகட்டிகள்",
    distance: "அதிகபட்ச தூரம்",
    rating: "குறைந்தபட்ச மதிப்பீடு",
    careTrack: "சிகிச்சை வகை",
    medication: "மருந்து மேலாண்மை",
    advanced: "மேம்பட்ட செயல்முறைகள்",
    all: "அனைத்தும்",
    mapTitle: "வரைபட காட்சி",
    mapHint: "தேர்ந்தெடுக்கப்பட்ட மருத்துவர்",
    kmAway: "கி.மீ தூரம்",
    book: "நியமனம் பதிவு",
    mapOpen: "வரைபடத்தில் திற",
    results: "கிடைத்த மருத்துவர்கள்",
    focus: "முதன்மை கவனம்",
  },
} as const;

function primaryFocus(specialty: "Neurologist" | "Parkinson's Specialist") {
  return specialty === "Neurologist"
    ? "Medication management and neurological monitoring"
    : "Advanced procedures and movement-disorder care";
}

export default function FindNearbyDoctor() {
  const [language, setLanguage] = useState<Language>("en");
  const [maxDistance, setMaxDistance] = useState(15);
  const [minRating, setMinRating] = useState(4.0);
  const [careTrack, setCareTrack] = useState<CareTrack>("all");
  const [selectedDoctorId, setSelectedDoctorId] = useState<number>(SPECIALIST_DOCTORS[0]?.id ?? 1);
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 6;

  const t = copy[language];

  const filteredDoctors = useMemo(() => {
    return SPECIALIST_DOCTORS.filter((doctor) => {
      const matchesDistance = doctor.distanceKm <= maxDistance;
      const matchesRating = doctor.rating >= minRating;
      const matchesTrack =
        careTrack === "all" ||
        (careTrack === "medication" && doctor.specialty === "Neurologist") ||
        (careTrack === "advanced" && doctor.specialty === "Parkinson's Specialist");
      return matchesDistance && matchesRating && matchesTrack;
    });
  }, [careTrack, maxDistance, minRating]);

  useEffect(() => {
    setCurrentPage(1);
  }, [maxDistance, minRating, careTrack]);

  const totalPages = Math.max(1, Math.ceil(filteredDoctors.length / cardsPerPage));

  const paginatedDoctors = useMemo(() => {
    const start = (currentPage - 1) * cardsPerPage;
    return filteredDoctors.slice(start, start + cardsPerPage);
  }, [filteredDoctors, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (!paginatedDoctors.length) return;
    if (!paginatedDoctors.some((doctor) => doctor.id === selectedDoctorId)) {
      setSelectedDoctorId(paginatedDoctors[0].id);
    }
  }, [paginatedDoctors, selectedDoctorId]);

  const selectedDoctor =
    filteredDoctors.find((doctor) => doctor.id === selectedDoctorId) ||
    filteredDoctors[0] ||
    SPECIALIST_DOCTORS[0];

  const mapQuery = encodeURIComponent(`${selectedDoctor.clinic} ${selectedDoctor.location}`);

  return (
    <div className="relative z-10 min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Button variant="outline" onClick={() => window.history.back()} className="mb-4">
                <ArrowLeft className="h-4 w-4" />
                {t.back}
              </Button>
              <h1 className="text-2xl font-semibold text-[#2c5ba9] md:text-3xl">{t.title}</h1>
              <p className="mt-2 text-sm text-slate-600">{t.subtitle}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">{t.language}</p>
              <div className="flex gap-2">
                <Button
                  variant={language === "en" ? "default" : "outline"}
                  onClick={() => setLanguage("en")}
                  className="h-9 min-w-[88px]"
                >
                  <Globe2 className="h-4 w-4" />
                  English
                </Button>
                <Button
                  variant={language === "ta" ? "default" : "outline"}
                  onClick={() => setLanguage("ta")}
                  className="h-9 min-w-[88px]"
                >
                  <Globe2 className="h-4 w-4" />
                  Tamil
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
            <div className="mb-4 flex items-center gap-2 text-[#2c5ba9]">
              <SlidersHorizontal className="h-5 w-5" />
              <h2 className="text-lg font-semibold">{t.filterTitle}</h2>
            </div>
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t.distance}: {maxDistance} km
                </label>
                <input
                  type="range"
                  min={1}
                  max={20}
                  step={1}
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(Number(e.target.value))}
                  className="w-full accent-[#2c5ba9]"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t.rating}: {minRating.toFixed(1)}
                </label>
                <input
                  type="range"
                  min={3.5}
                  max={5}
                  step={0.1}
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full accent-[#2c5ba9]"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">{t.careTrack}</label>
                <div className="grid grid-cols-1 gap-2">
                  <Button variant={careTrack === "all" ? "default" : "outline"} onClick={() => setCareTrack("all")}>
                    {t.all}
                  </Button>
                  <Button
                    variant={careTrack === "medication" ? "default" : "outline"}
                    onClick={() => setCareTrack("medication")}
                  >
                    {t.medication}
                  </Button>
                  <Button
                    variant={careTrack === "advanced" ? "default" : "outline"}
                    onClick={() => setCareTrack("advanced")}
                  >
                    {t.advanced}
                  </Button>
                </div>
              </div>
              <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
                {filteredDoctors.length} {t.results}
              </p>
            </div>
          </div>

          <div className="space-y-4 lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-[#2c5ba9]">
                <MapPin className="h-5 w-5" />
                <h2 className="text-lg font-semibold">{t.mapTitle}</h2>
              </div>
              <p className="mb-3 text-sm text-slate-600">{t.mapHint}: {selectedDoctor.name}</p>
              <div className="h-72 overflow-hidden rounded-xl border border-slate-200">
                <iframe
                  title="Doctor map view"
                  src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                  className="h-full w-full"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {paginatedDoctors.map((doctor) => {
                const doctorMapQuery = encodeURIComponent(`${doctor.clinic} ${doctor.location}`);
                return (
                  <motion.article
                    key={doctor.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl border p-4 shadow-sm transition ${doctor.id === selectedDoctor.id ? "border-[#2c5ba9] bg-blue-50/40" : "border-slate-200 bg-white"}`}
                    onClick={() => setSelectedDoctorId(doctor.id)}
                  >
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">{doctor.name}</h3>
                        <p className="text-sm text-[#2c5ba9]">{doctor.specialty}</p>
                      </div>
                    </div>

                    <p className="text-sm text-slate-700">{doctor.clinic}</p>
                    <div className="mt-3 space-y-1 text-sm text-slate-600">
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#2c5ba9]" />
                        {doctor.location}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#2c5ba9]" />
                        {doctor.distanceKm} {t.kmAway}
                      </p>
                      <p className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-amber-500" />
                        {doctor.rating.toFixed(1)} / 5.0
                      </p>
                      <p className="flex items-center gap-2">
                        <CalendarCheck2 className="h-4 w-4 text-[#2c5ba9]" />
                        {doctor.availability}
                      </p>
                      <p className="flex items-start gap-2">
                        <Stethoscope className="mt-0.5 h-4 w-4 text-[#2c5ba9]" />
                        <span>
                          {t.focus}: {primaryFocus(doctor.specialty)}
                        </span>
                      </p>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button
                        className="h-10 flex-1 bg-[#2c5ba9] hover:bg-[#244a8f]"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(doctor.googleSearchUrl, "_blank", "noopener,noreferrer");
                        }}
                      >
                        <CalendarCheck2 className="h-4 w-4" />
                        {t.book}
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      className="mt-2 h-9 w-full text-[#2c5ba9]"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://www.google.com/maps/search/?api=1&query=${doctorMapQuery}`, "_blank", "noopener,noreferrer");
                      }}
                    >
                      <MapPin className="h-4 w-4" />
                      {t.mapOpen}
                    </Button>
                  </motion.article>
                );
              })}
            </div>

            {filteredDoctors.length > 0 ? (
              <div className="mt-5 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  className="rounded-xl border-slate-300"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    className={`h-9 w-9 rounded-xl p-0 ${currentPage === page ? "bg-[#2c5ba9] text-white" : "border-slate-300"}`}
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
          </div>
        </section>
      </div>
    </div>
  );
}
