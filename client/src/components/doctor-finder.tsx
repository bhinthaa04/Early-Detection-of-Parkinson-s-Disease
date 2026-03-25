import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { List, Map, MapPin, Phone, Search, Star } from "lucide-react";
import { DoctorFinderPagination } from "./doctor-finder-pagination";
import { SPECIALIST_DOCTORS } from "@/data/specialists";

type Doctor = {
  id: number;
  name: string;
  doctorName?: string;
  hospital?: string;
  location?: string;
  experience?: string;
  address: string;
  phone?: string;
  rating?: number;
  specialty: string;
  mapQuery: string;
};

const doctors: Doctor[] = [
  ...SPECIALIST_DOCTORS.map((doctor) => ({
    id: doctor.id,
    name: doctor.name,
    doctorName: `${doctor.name} (${doctor.specialty})`,
    hospital: doctor.clinic,
    location: `${doctor.location}, Tamil Nadu`,
    experience: `${doctor.experience}+ years`,
    address: `${doctor.clinic}, ${doctor.location}, Tamil Nadu`,
    rating: doctor.rating,
    specialty:
      doctor.specialty === "Neurologist"
        ? "Medication Management (Neurology)"
        : "Advanced Procedures & Movement Disorders",
    mapQuery: `${doctor.clinic}, ${doctor.location}, Tamil Nadu`,
  })),
];

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
const DEFAULT_CENTER = { lat: 8.7139, lng: 77.7567 };

function buildMapLink(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function DoctorFinder() {
  const [view, setView] = useState<"list" | "map">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(doctors[0] ?? null);
  const [googleReady, setGoogleReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const hasMapsKey = Boolean(GOOGLE_MAPS_API_KEY);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);
  const geocodeCacheRef = useRef<Record<number, { lat: number; lng: number }>>({});

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredDoctors = useMemo(() => {
    if (!normalizedQuery) return doctors;
    return doctors.filter((doctor) =>
      [
        doctor.name,
        doctor.doctorName ?? "",
        doctor.address,
        doctor.specialty,
        doctor.hospital ?? "",
        doctor.location ?? "",
        doctor.experience ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [normalizedQuery]);

  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 5;
  const startIndex = (currentPage - 1) * cardsPerPage;
  const visibleDoctors = filteredDoctors.slice(startIndex, startIndex + cardsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [normalizedQuery]);

  useEffect(() => {
    if (filteredDoctors.length === 0) {
      setSelectedDoctor(null);
      return;
    }
    if (!selectedDoctor || !filteredDoctors.some((doctor) => doctor.id === selectedDoctor.id)) {
      setSelectedDoctor(filteredDoctors[0]);
    }
  }, [filteredDoctors, selectedDoctor]);

  useEffect(() => {
    if (view !== "map") return;
    if (!hasMapsKey) {
      setMapError("Add VITE_GOOGLE_MAPS_API_KEY to enable the map view.");
      setGoogleReady(false);
      return;
    }
    setMapError(null);
    if (window.google?.maps) {
      setGoogleReady(true);
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src^="https://maps.googleapis.com/maps/api/js"]',
    );
    if (existing) {
      existing.addEventListener("load", () => setGoogleReady(true), { once: true });
      existing.addEventListener(
        "error",
        () => setMapError("Google Maps failed to load. Check your API key."),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleReady(true);
    script.onerror = () => setMapError("Google Maps failed to load. Check your API key and network.");
    document.head.appendChild(script);
  }, [view]);

  useEffect(() => {
    if (view !== "map" || !hasMapsKey || !googleReady || !mapRef.current) return;

    const map =
      mapInstanceRef.current ||
      new window.google.maps.Map(mapRef.current, {
        center: DEFAULT_CENTER,
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
    mapInstanceRef.current = map;

    const infoWindow = infoWindowRef.current || new window.google.maps.InfoWindow();
    infoWindowRef.current = infoWindow;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    if (!filteredDoctors.length) {
      map.setCenter(DEFAULT_CENTER);
      map.setZoom(12);
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    const bounds = new window.google.maps.LatLngBounds();

    const addMarker = (doctor: Doctor, position: { lat: number; lng: number }) => {
      const marker = new window.google.maps.Marker({
        position,
        map,
        title: doctor.name,
      });

      marker.addListener("click", () => {
        setSelectedDoctor(doctor);
        const phone = doctor.phone ? doctor.phone : "Not available";
        infoWindow.setContent(
          `<div style="font-size:12px;line-height:1.4;">
            <strong>${doctor.name}</strong><br/>
            ${doctor.address}<br/>
            Phone: ${phone}
          </div>`,
        );
        infoWindow.open(map, marker);
      });

      markersRef.current.push(marker);
      bounds.extend(position);
    };

    const geocodeDoctor = (doctor: Doctor) =>
      new Promise<void>((resolve) => {
        const cached = geocodeCacheRef.current[doctor.id];
        if (cached) {
          addMarker(doctor, cached);
          resolve();
          return;
        }
        const query = doctor.mapQuery || doctor.address;
        geocoder.geocode({ address: query }, (results: any, status: string) => {
          if (status === "OK" && results && results[0]) {
            const location = results[0].geometry.location;
            const coords = { lat: location.lat(), lng: location.lng() };
            geocodeCacheRef.current[doctor.id] = coords;
            addMarker(doctor, coords);
          }
          resolve();
        });
      });

    Promise.all(filteredDoctors.map(geocodeDoctor)).then(() => {
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, 60);
      }
    });
  }, [view, googleReady, filteredDoctors]);

  const openMap = (doctor: Doctor) => {
    window.open(buildMapLink(doctor.mapQuery), "_blank", "noopener,noreferrer");
  };

  const callDoctor = (phone?: string) => {
    if (!phone) return;
    const normalized = phone.replace(/[^\d+]/g, "");
    if (!normalized) return;
    window.location.href = `tel:${normalized}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-2xl font-heading font-bold text-white">Thoothukudi & Tirunelveli Neurology Specialists</h3>
          <p className="text-sm text-white/70">Medication management and advanced movement-disorder care</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={view === "list" ? "default" : "outline"}
            className={view === "list" ? "" : "border-white/20 text-white hover:bg-white/10"}
            onClick={() => setView("list")}
          >
            <List className="mr-2 h-4 w-4" />
            List View
          </Button>
          <Button
            variant={view === "map" ? "default" : "outline"}
            className={view === "map" ? "" : "border-white/20 text-white hover:bg-white/10"}
            onClick={() => setView("map")}
          >
            <Map className="mr-2 h-4 w-4" />
            Map View
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by clinic, location, hospital, or specialty"
            className="pl-9 bg-white text-black"
          />
        </div>
        <div className="px-4 py-2 bg-white/10 text-white rounded-full text-sm font-medium">
          {filteredDoctors.length} specialists
        </div>
      </div>

      {view === "list" ? (
        <div className="space-y-6">
          {filteredDoctors.length === 0 ? (
            <Card className="glass-panel">
              <CardContent className="p-8 text-center text-sm text-slate-600">
                No clinics match your search. Try a different location or specialty.
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {visibleDoctors.map((doctor, idx) => (
                  <motion.div
                    key={doctor.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card
                      className={`glass-panel p-6 space-y-4 cursor-pointer hover:shadow-2xl transition-all border-slate-200/50 ${
                        selectedDoctor?.id === doctor.id ? "ring-4 ring-primary/30 shadow-2xl" : ""
                      }`}
                      onClick={() => setSelectedDoctor(doctor)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-heading text-lg font-bold text-slate-900">{doctor.name}</h4>
                          {doctor.doctorName && <p className="text-sm text-slate-700">{doctor.doctorName}</p>}
                          {doctor.hospital && <p className="text-sm font-medium text-slate-700">{doctor.hospital}</p>}
                          {doctor.location && <p className="text-xs text-slate-500">{doctor.location}</p>}
                          {doctor.experience && <p className="text-xs text-slate-500">Exp: {doctor.experience}</p>}
                          <p className="text-sm font-semibold text-primary mt-1">{doctor.specialty}</p>
                        </div>
                        {doctor.rating && (
                          <div className="flex items-center gap-1 bg-amber-100/80 px-3 py-1.5 rounded-full">
                            <Star className="h-4 w-4 text-amber-600 fill-current" />
                            <span className="text-sm font-bold text-amber-800">
                              {doctor.rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 text-sm text-slate-700 pt-2 border-t border-slate-200/50">
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-1 h-4 w-4 text-primary shrink-0" />
                          <span className="text-slate-600 leading-relaxed">{doctor.address}</span>
                        </div>
                        {doctor.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-primary shrink-0" />
                            <span className="text-slate-600 font-mono">{doctor.phone}</span>
                          </div>
                        )}
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 flex-1 border-slate-300 hover:border-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              openMap(doctor);
                            }}
                          >
                            Maps
                          </Button>
                          {doctor.phone && (
                            <Button
                              size="sm"
                              className="h-9 flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                callDoctor(doctor.phone);
                              }}
                            >
                              Call
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
              <DoctorFinderPagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredDoctors.length / cardsPerPage)}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Map View - Full Width */}
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="text-lg">Map View</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-80 overflow-hidden rounded-xl border border-white/10 bg-slate-900/30">
                {hasMapsKey ? (
                  <>
                    <div ref={mapRef} className="absolute inset-0" />
                    {mapError ? (
                      <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-white/80">
                        {mapError}
                      </div>
                    ) : !googleReady ? (
                      <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-white/80">
                        Loading Google Maps...
                      </div>
                    ) : null}
                  </>
                ) : selectedDoctor ? (
                  <>
                    <iframe
                      title="Doctor map view"
                      src={`https://www.google.com/maps?q=${encodeURIComponent(selectedDoctor.mapQuery)}&output=embed`}
                      className="absolute inset-0 h-full w-full"
                      loading="lazy"
                    />
                    <div className="absolute bottom-3 right-3 rounded-full bg-slate-900/70 px-3 py-1 text-xs text-white">
                      Add `VITE_GOOGLE_MAPS_API_KEY` for interactive pins
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-white/80">
                    Select a clinic to view the map.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Selected Clinic and Clinics List - Below Map */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="text-lg">Selected Clinic</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-black">
                {selectedDoctor ? (
                  <>
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Doctor / Clinic</p>
                      <p className="font-semibold text-slate-900">{selectedDoctor.name}</p>
                      {selectedDoctor.doctorName ? (
                        <p className="text-xs text-slate-600">{selectedDoctor.doctorName}</p>
                      ) : null}
                      {selectedDoctor.hospital ? (
                        <p className="text-xs text-slate-600">{selectedDoctor.hospital}</p>
                      ) : null}
                      {selectedDoctor.location ? (
                        <p className="text-xs text-slate-500">{selectedDoctor.location}</p>
                      ) : null}
                      {selectedDoctor.experience ? (
                        <p className="text-xs text-slate-500">Experience: {selectedDoctor.experience}</p>
                      ) : null}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Specialty</p>
                      <p className="text-slate-900">{selectedDoctor.specialty}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Address</p>
                      <p className="text-slate-900">{selectedDoctor.address}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Phone</p>
                      <p className="text-slate-900">{selectedDoctor.phone || "Not provided"}</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        className="h-9 flex-1"
                        onClick={() => openMap(selectedDoctor)}
                      >
                        Open in Maps
                      </Button>
                      {selectedDoctor.phone ? (
                        <Button
                          className="h-9 flex-1"
                          onClick={() => callDoctor(selectedDoctor.phone)}
                        >
                          Call
                        </Button>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <p className="text-slate-600">Select a clinic marker to view details.</p>
                )}
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="text-lg">Clinics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                {filteredDoctors.map((doctor) => (
                  <button
                    key={doctor.id}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                      selectedDoctor?.id === doctor.id
                        ? "border-primary bg-primary/10 text-slate-900"
                        : "border-slate-200 bg-white text-slate-700 hover:border-primary/40"
                    }`}
                    onClick={() => setSelectedDoctor(doctor)}
                  >
                    <div className="font-semibold">{doctor.name}</div>
                    <div className="text-xs text-slate-500">{doctor.address}</div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
