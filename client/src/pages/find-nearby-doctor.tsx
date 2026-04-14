import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarCheck2,
  MapPin,
  SlidersHorizontal,
  Stethoscope,
  Star,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { SPECIALIST_DOCTORS } from "@/data/specialists";

type SubSpecialization = "Epilepsy" | "Stroke" | "Sleep Medicine";

type FilterState = {
  subSpecializations: SubSpecialization[];
  minExperience: number;
  telehealth: boolean;
  inPerson: boolean;
  weekendAvailability: boolean;
  onsiteMRI: boolean;
  onsiteEEG: boolean;
};

type DoctorSearchRecord = (typeof SPECIALIST_DOCTORS)[number] & {
  subSpecializations: SubSpecialization[];
  logistics: {
    telehealth: boolean;
    inPerson: boolean;
    weekend: boolean;
  };
  facilities: {
    mri: boolean;
    eeg: boolean;
  };
};

const SUB_SPECIALIZATION_OPTIONS: SubSpecialization[] = ["Epilepsy", "Stroke", "Sleep Medicine"];

const SUB_SPECIALIZATION_PRESETS: SubSpecialization[][] = [
  ["Epilepsy"],
  ["Stroke"],
  ["Sleep Medicine"],
  ["Epilepsy", "Stroke"],
  ["Stroke", "Sleep Medicine"],
  ["Epilepsy", "Sleep Medicine"],
];

const DOCTOR_SEARCH_DATA: DoctorSearchRecord[] = SPECIALIST_DOCTORS.map((doctor, index) => {
  const preset = SUB_SPECIALIZATION_PRESETS[index % SUB_SPECIALIZATION_PRESETS.length] ?? ["Stroke"];
  return {
    ...doctor,
    subSpecializations: preset,
    logistics: {
      telehealth: index % 2 === 0 || index % 5 === 0,
      inPerson: true,
      weekend: index % 3 === 0,
    },
    facilities: {
      mri: index % 2 === 0,
      eeg: index % 3 !== 1,
    },
  };
});

const defaultFilterState: FilterState = {
  subSpecializations: [],
  minExperience: 0,
  telehealth: false,
  inPerson: false,
  weekendAvailability: false,
  onsiteMRI: false,
  onsiteEEG: false,
};

type FilterChip =
  | { id: "subSpec"; label: string; value: SubSpecialization }
  | { id: "minExperience"; label: string }
  | { id: "telehealth"; label: string }
  | { id: "inPerson"; label: string }
  | { id: "weekend"; label: string }
  | { id: "mri"; label: string }
  | { id: "eeg"; label: string };

function primaryFocus(specialty: "Neurologist" | "Parkinson's Specialist") {
  return specialty === "Neurologist"
    ? "Medication management and neurological monitoring"
    : "Advanced procedures and movement-disorder care";
}

export default function FindNearbyDoctor() {
  const [filterState, setFilterState] = useState<FilterState>(defaultFilterState);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number>(DOCTOR_SEARCH_DATA[0]?.id ?? 1);
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 6;

  const filteredDoctors = useMemo(() => {
    return DOCTOR_SEARCH_DATA.filter((doctor) => {
      const matchesSubSpecialization =
        filterState.subSpecializations.length === 0 ||
        filterState.subSpecializations.some((item) => doctor.subSpecializations.includes(item));

      const matchesExperience = doctor.experience >= filterState.minExperience;

      const modeFiltersEnabled = filterState.telehealth || filterState.inPerson;
      const matchesLogisticsMode =
        !modeFiltersEnabled ||
        (filterState.telehealth && doctor.logistics.telehealth) ||
        (filterState.inPerson && doctor.logistics.inPerson);

      const matchesWeekend = !filterState.weekendAvailability || doctor.logistics.weekend;

      const matchesFacilities =
        (!filterState.onsiteMRI || doctor.facilities.mri) &&
        (!filterState.onsiteEEG || doctor.facilities.eeg);

      return (
        matchesSubSpecialization &&
        matchesExperience &&
        matchesLogisticsMode &&
        matchesWeekend &&
        matchesFacilities
      );
    });
  }, [filterState]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterState]);

  const totalPages = Math.max(1, Math.ceil(filteredDoctors.length / cardsPerPage));

  const paginatedDoctors = useMemo(() => {
    const start = (currentPage - 1) * cardsPerPage;
    return filteredDoctors.slice(start, start + cardsPerPage);
  }, [currentPage, filteredDoctors]);

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
    filteredDoctors.find((doctor) => doctor.id === selectedDoctorId) || filteredDoctors[0] || null;

  const mapQuery = selectedDoctor
    ? encodeURIComponent(`${selectedDoctor.clinic} ${selectedDoctor.location}`)
    : "";

  const chips = useMemo<FilterChip[]>(() => {
    const list: FilterChip[] = [];
    filterState.subSpecializations.forEach((item) => {
      list.push({ id: "subSpec", label: item, value: item });
    });
    if (filterState.minExperience > 0) {
      list.push({ id: "minExperience", label: `Experience >= ${filterState.minExperience} years` });
    }
    if (filterState.telehealth) list.push({ id: "telehealth", label: "Telehealth" });
    if (filterState.inPerson) list.push({ id: "inPerson", label: "In-person" });
    if (filterState.weekendAvailability) list.push({ id: "weekend", label: "Weekend Availability" });
    if (filterState.onsiteMRI) list.push({ id: "mri", label: "On-site MRI" });
    if (filterState.onsiteEEG) list.push({ id: "eeg", label: "On-site EEG" });
    return list;
  }, [filterState]);

  const toggleSubSpecialization = (value: SubSpecialization) => {
    setFilterState((prev) => {
      const exists = prev.subSpecializations.includes(value);
      return {
        ...prev,
        subSpecializations: exists
          ? prev.subSpecializations.filter((item) => item !== value)
          : [...prev.subSpecializations, value],
      };
    });
  };

  const removeChip = (chip: FilterChip) => {
    setFilterState((prev) => {
      if (chip.id === "subSpec") {
        return {
          ...prev,
          subSpecializations: prev.subSpecializations.filter((item) => item !== chip.value),
        };
      }
      if (chip.id === "minExperience") return { ...prev, minExperience: 0 };
      if (chip.id === "telehealth") return { ...prev, telehealth: false };
      if (chip.id === "inPerson") return { ...prev, inPerson: false };
      if (chip.id === "weekend") return { ...prev, weekendAvailability: false };
      if (chip.id === "mri") return { ...prev, onsiteMRI: false };
      return { ...prev, onsiteEEG: false };
    });
  };

  const clearAllFilters = () => setFilterState(defaultFilterState);

  return (
    <div className="relative z-10 min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <Button variant="outline" onClick={() => window.history.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Result
          </Button>
          <h1 className="text-2xl font-semibold text-[#0546af] md:text-3xl">Doctor Search</h1>
          <p className="mt-2 text-sm text-slate-600">
            High-trust specialist discovery for Thoothukudi and Tirunelveli.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#0546af]">
                <SlidersHorizontal className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Doctor Search Filters</h2>
              </div>
              <Button
                variant="ghost"
                className="h-8 px-2 text-xs text-slate-600 hover:text-slate-900"
                onClick={clearAllFilters}
              >
                Reset
              </Button>
            </div>

            <Accordion type="multiple" defaultValue={["clinical", "logistics", "facilities"]} className="space-y-2">
              <AccordionItem value="clinical" className="rounded-xl border border-slate-200 px-3">
                <AccordionTrigger className="text-sm font-semibold text-slate-800">Clinical Expertise</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Sub-Specialization</p>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {SUB_SPECIALIZATION_OPTIONS.map((item) => {
                      const active = filterState.subSpecializations.includes(item);
                      return (
                        <Button
                          key={item}
                          type="button"
                          variant={active ? "default" : "outline"}
                          className={`h-8 rounded-full px-3 text-xs ${active ? "bg-[#0546af] text-white" : "border-slate-300 text-slate-700"}`}
                          onClick={() => toggleSubSpecialization(item)}
                        >
                          {item}
                        </Button>
                      );
                    })}
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Years of Experience</p>
                      <span className="text-xs font-semibold text-[#0546af]">{filterState.minExperience}+ years</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={30}
                      step={1}
                      value={filterState.minExperience}
                      onChange={(e) =>
                        setFilterState((prev) => ({ ...prev, minExperience: Number(e.target.value) }))
                      }
                      className="w-full accent-[#0546af]"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="logistics" className="rounded-xl border border-slate-200 px-3">
                <AccordionTrigger className="text-sm font-semibold text-slate-800">Logistics</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                      <span className="text-sm font-medium text-slate-700">Telehealth</span>
                      <Switch
                        checked={filterState.telehealth}
                        onCheckedChange={(checked) => setFilterState((prev) => ({ ...prev, telehealth: checked }))}
                      />
                    </label>
                    <label className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                      <span className="text-sm font-medium text-slate-700">In-person</span>
                      <Switch
                        checked={filterState.inPerson}
                        onCheckedChange={(checked) => setFilterState((prev) => ({ ...prev, inPerson: checked }))}
                      />
                    </label>
                    <label className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                      <span className="text-sm font-medium text-slate-700">Weekend Availability</span>
                      <Switch
                        checked={filterState.weekendAvailability}
                        onCheckedChange={(checked) =>
                          setFilterState((prev) => ({ ...prev, weekendAvailability: checked }))
                        }
                      />
                    </label>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="facilities" className="rounded-xl border border-slate-200 px-3">
                <AccordionTrigger className="text-sm font-semibold text-slate-800">Facilities</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                      <Checkbox
                        checked={filterState.onsiteMRI}
                        onCheckedChange={(checked) =>
                          setFilterState((prev) => ({ ...prev, onsiteMRI: checked === true }))
                        }
                      />
                      <span className="text-sm font-medium text-slate-700">On-site MRI</span>
                    </label>
                    <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                      <Checkbox
                        checked={filterState.onsiteEEG}
                        onCheckedChange={(checked) =>
                          setFilterState((prev) => ({ ...prev, onsiteEEG: checked === true }))
                        }
                      />
                      <span className="text-sm font-medium text-slate-700">On-site EEG</span>
                    </label>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </aside>

          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-[#0546af]">
                <MapPin className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Map View</h2>
              </div>
              {selectedDoctor ? (
                <>
                  <p className="mb-3 text-sm text-slate-600">Selected doctor: {selectedDoctor.name}</p>
                  <div className="h-72 overflow-hidden rounded-xl border border-slate-200">
                    <iframe
                      title="Doctor map view"
                      src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                      className="h-full w-full"
                      loading="lazy"
                    />
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                  No doctors match the selected filters.
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <p className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-[#0546af]">
                  {filteredDoctors.length} Doctors found
                </p>
                {chips.length > 0 ? (
                  <Button variant="outline" className="rounded-xl border-slate-300" onClick={clearAllFilters}>
                    Clear All Filters
                  </Button>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                {chips.length === 0 ? (
                  <span className="text-sm text-slate-500">No active filters</span>
                ) : (
                  chips.map((chip) => (
                    <button
                      key={`${chip.id}-${chip.label}`}
                      type="button"
                      className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-[#0546af]"
                      onClick={() => removeChip(chip)}
                    >
                      {chip.label}
                      <X className="h-3 w-3" />
                    </button>
                  ))
                )}
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
                    className={`rounded-2xl border p-4 shadow-sm transition ${
                      doctor.id === selectedDoctor?.id ? "border-[#0546af] bg-blue-50/40" : "border-slate-200 bg-white"
                    }`}
                    onClick={() => setSelectedDoctorId(doctor.id)}
                  >
                    <div className="mb-3">
                      <h3 className="text-base font-semibold text-slate-900">{doctor.name}</h3>
                      <p className="text-sm text-[#0546af]">{doctor.specialty}</p>
                    </div>

                    <p className="text-sm text-slate-700">{doctor.clinic}</p>
                    <div className="mt-3 space-y-1 text-sm text-slate-600">
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#0546af]" />
                        {doctor.location}
                      </p>
                      <p className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-amber-500" />
                        {doctor.rating.toFixed(1)} / 5.0
                      </p>
                      <p className="flex items-center gap-2">
                        <CalendarCheck2 className="h-4 w-4 text-[#0546af]" />
                        {doctor.availability}
                      </p>
                      <p className="flex items-start gap-2">
                        <Stethoscope className="mt-0.5 h-4 w-4 text-[#0546af]" />
                        <span>{primaryFocus(doctor.specialty)}</span>
                      </p>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button
                        className="h-10 flex-1 rounded-xl bg-[#0546af] hover:bg-[#043b95]"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(doctor.googleSearchUrl, "_blank", "noopener,noreferrer");
                        }}
                      >
                        <CalendarCheck2 className="h-4 w-4" />
                        Book Appointment
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      className="mt-2 h-9 w-full rounded-xl text-[#0546af]"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(
                          `https://www.google.com/maps/search/?api=1&query=${doctorMapQuery}`,
                          "_blank",
                          "noopener,noreferrer",
                        );
                      }}
                    >
                      <MapPin className="h-4 w-4" />
                      Open in Maps
                    </Button>
                  </motion.article>
                );
              })}
            </div>

            {filteredDoctors.length > 0 ? (
              <div className="mt-2 flex items-center justify-center gap-2">
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
                    className={`h-9 w-9 rounded-xl p-0 ${
                      currentPage === page ? "bg-[#0546af] text-white" : "border-slate-300"
                    }`}
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
