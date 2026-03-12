import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Globe2,
  MapPin,
  Phone,
  SlidersHorizontal,
  Sparkles,
  Star,
  CalendarCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Language = "en" | "ta";

type Doctor = {
  id: number;
  name: string;
  specialtyEn: string;
  specialtyTa: string;
  hospitalEn: string;
  hospitalTa: string;
  address: string;
  phone: string;
  rating: number;
  distanceKm: number;
  nextSlotEn: string;
  nextSlotTa: string;
  aiRecommended?: boolean;
};

const doctors: Doctor[] = [
  {
    id: 1,
    name: "Dr. Priya Natarajan",
    specialtyEn: "Movement Disorder Neurologist",
    specialtyTa: "இயக்கக் கோளாறு நரம்பியல் நிபுணர்",
    hospitalEn: "NeuroCare Medical Center",
    hospitalTa: "நியூரோகேர் மருத்துவ மையம்",
    address: "T. Nagar, Chennai",
    phone: "+91 44 4012 8890",
    rating: 4.9,
    distanceKm: 2.1,
    nextSlotEn: "Today, 5:30 PM",
    nextSlotTa: "இன்று, மாலை 5:30",
    aiRecommended: true,
  },
  {
    id: 2,
    name: "Dr. Arun Kumar",
    specialtyEn: "Parkinson's Specialist",
    specialtyTa: "பார்கின்சன் நிபுணர்",
    hospitalEn: "City Neuro Institute",
    hospitalTa: "சிட்டி நியூரோ இன்ஸ்டிட்யூட்",
    address: "Velachery, Chennai",
    phone: "+91 44 4312 2201",
    rating: 4.8,
    distanceKm: 4.7,
    nextSlotEn: "Tomorrow, 10:15 AM",
    nextSlotTa: "நாளை, காலை 10:15",
  },
  {
    id: 3,
    name: "Dr. Meena Raj",
    specialtyEn: "Senior Neurologist",
    specialtyTa: "மூத்த நரம்பியல் நிபுணர்",
    hospitalEn: "Apollo Specialty Clinic",
    hospitalTa: "அப்போலோ சிறப்பு மருத்துவமனை",
    address: "Adyar, Chennai",
    phone: "+91 44 4098 1100",
    rating: 4.6,
    distanceKm: 6.3,
    nextSlotEn: "Tomorrow, 4:00 PM",
    nextSlotTa: "நாளை, மாலை 4:00",
  },
  {
    id: 4,
    name: "Dr. Suresh Babu",
    specialtyEn: "Clinical Neurologist",
    specialtyTa: "மருத்துவ நரம்பியல் நிபுணர்",
    hospitalEn: "Lifeline Neurology Hub",
    hospitalTa: "லைஃப்லைன் நியூராலஜி மையம்",
    address: "Anna Nagar, Chennai",
    phone: "+91 44 2781 5502",
    rating: 4.4,
    distanceKm: 8.9,
    nextSlotEn: "Friday, 11:45 AM",
    nextSlotTa: "வெள்ளி, காலை 11:45",
  },
];

const copy = {
  en: {
    title: "Find Nearby Doctor",
    subtitle: "Modern Parkinson's care discovery with smart AI guidance",
    back: "Back to Result",
    language: "Language",
    filterTitle: "Filters",
    distance: "Max Distance",
    rating: "Min Rating",
    mapTitle: "Map View",
    mapHint: "Selected doctor location preview",
    aiBadge: "AI Recommended",
    kmAway: "km away",
    call: "Call",
    book: "Book Appointment",
    mapOpen: "Open in Maps",
    results: "Doctors found",
  },
  ta: {
    title: "அருகிலுள்ள மருத்துவரை கண்டுபிடிக்கவும்",
    subtitle: "AI வழிகாட்டுதலுடன் பார்கின்சன் சிகிச்சை மருத்துவர் தேடல்",
    back: "விளைவுக்கு திரும்ப",
    language: "மொழி",
    filterTitle: "வடிகட்டிகள்",
    distance: "அதிகபட்ச தூரம்",
    rating: "குறைந்தபட்ச மதிப்பீடு",
    mapTitle: "வரைபட காட்சி",
    mapHint: "தேர்ந்தெடுக்கப்பட்ட மருத்துவரின் இடம்",
    aiBadge: "AI பரிந்துரை",
    kmAway: "கி.மீ தூரம்",
    call: "அழைக்க",
    book: "நியமனம் பதிவு",
    mapOpen: "வரைபடத்தில் திற",
    results: "கிடைத்த மருத்துவர்கள்",
  },
} as const;

export default function FindNearbyDoctor() {
  const [language, setLanguage] = useState<Language>("en");
  const [maxDistance, setMaxDistance] = useState(10);
  const [minRating, setMinRating] = useState(4.0);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number>(1);

  const t = copy[language];

  const filteredDoctors = useMemo(
    () =>
      doctors
        .filter((doctor) => doctor.distanceKm <= maxDistance && doctor.rating >= minRating)
        .sort((a, b) => Number(Boolean(b.aiRecommended)) - Number(Boolean(a.aiRecommended))),
    [maxDistance, minRating],
  );

  const selectedDoctor =
    filteredDoctors.find((doctor) => doctor.id === selectedDoctorId) || filteredDoctors[0] || doctors[0];

  const mapQuery = encodeURIComponent(`${selectedDoctor.address} ${selectedDoctor.hospitalEn}`);

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
                  max={15}
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
              {filteredDoctors.map((doctor) => {
                const doctorMapQuery = encodeURIComponent(`${doctor.address} ${doctor.hospitalEn}`);
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
                      <p className="text-sm text-[#2c5ba9]">
                        {language === "en" ? doctor.specialtyEn : doctor.specialtyTa}
                      </p>
                    </div>
                    {doctor.aiRecommended ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                        <Sparkles className="h-3 w-3" />
                        {t.aiBadge}
                      </span>
                    ) : null}
                  </div>

                  <p className="text-sm text-slate-700">{language === "en" ? doctor.hospitalEn : doctor.hospitalTa}</p>
                  <div className="mt-3 space-y-1 text-sm text-slate-600">
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
                      {language === "en" ? doctor.nextSlotEn : doctor.nextSlotTa}
                    </p>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      className="h-10 flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`tel:${doctor.phone}`);
                      }}
                    >
                      <Phone className="h-4 w-4" />
                      {t.call}
                    </Button>
                    <Button
                      className="h-10 flex-1 bg-[#2c5ba9] hover:bg-[#244a8f]"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(
                          `https://www.google.com/search?q=${encodeURIComponent(`${doctor.name} ${doctor.hospitalEn} appointment`)}`,
                          "_blank",
                          "noopener,noreferrer",
                        );
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
          </div>
        </section>
      </div>
    </div>
  );
}
