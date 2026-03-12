import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { List, Map, MapPin, Phone, Search, Star } from "lucide-react";

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
  {
    id: 1,
    name: "PS Neuro Centre",
    doctorName: "Dr. P. Muthukumaran (Neurologist)",
    hospital: "PS Neuro Centre",
    location: "Tirunelveli, Tamil Nadu",
    address: "Tiruchendur Main Rd, Palayamkottai, Tirunelveli, Tamil Nadu 627002",
    phone: "+91 462 4220087",
    rating: 4.4,
    specialty: "Neurology, Parkinson's disease, movement disorders",
    mapQuery: "PS Neuro Centre, Tiruchendur Main Rd, Palayamkottai, Tirunelveli, Tamil Nadu 627002",
  },
  {
    id: 2,
    name: "Sankar Neuro Clinic",
    hospital: "Sankar Neuro Clinic",
    location: "Tirunelveli, Tamil Nadu",
    address: "N Bypass Rd, Barani Nagar, Tirunelveli, Tamil Nadu 627003",
    phone: "+91 73050 28840",
    rating: 4.4,
    specialty: "Parkinson's disease, tremor, nerve disorders",
    mapQuery: "Sankar Neuro Clinic, N Bypass Rd, Barani Nagar, Tirunelveli, Tamil Nadu 627003",
  },
  {
    id: 3,
    name: "Dr. Raja S. Vignesh Neuro Clinic",
    hospital: "Dr. Raja S. Vignesh Neuro Clinic",
    location: "Tirunelveli, Tamil Nadu",
    address: "Perumalpuram, Tirunelveli, Tamil Nadu 627007",
    rating: 4.8,
    specialty: "Neurology, Parkinson's treatment",
    mapQuery: "Dr. Raja S. Vignesh Neuro Clinic, Perumalpuram, Tirunelveli, Tamil Nadu 627007",
  },
  {
    id: 4,
    name: "K.G. Neuro Clinic",
    hospital: "K.G. Neuro Clinic",
    location: "Tirunelveli, Tamil Nadu",
    address: "Tiruchendur Main Rd, Palayamkottai, Tirunelveli",
    phone: "+91 89038 58737",
    specialty: "Neurology consultation",
    mapQuery: "K.G. Neuro Clinic, Tiruchendur Main Rd, Palayamkottai, Tirunelveli",
  },
  {
    id: 5,
    name: "Shifa Hospitals",
    hospital: "Shifa Hospitals",
    location: "Tirunelveli, Tamil Nadu",
    address: "Kailasapuram, Tirunelveli Junction",
    phone: "+91 94421 39292",
    specialty: "Neurology Department - Parkinson's treatment",
    mapQuery: "Shifa Hospitals, Kailasapuram, Tirunelveli Junction",
  },
  {
    id: 6,
    name: "Dr. U. Meenakshisundaram",
    hospital: "MGM Healthcare / Apollo Hospitals",
    location: "Chennai, Tamil Nadu",
    experience: "35+ years",
    address: "MGM Healthcare / Apollo Hospitals, Chennai, Tamil Nadu",
    specialty: "Parkinson's disease, stroke, movement disorders, neuromuscular diseases",
    mapQuery: "MGM Healthcare, Chennai, Tamil Nadu",
  },
  {
    id: 7,
    name: "Dr. P. Vijayashankar",
    hospital: "Apollo Hospitals, Greams Road / Sunway Medical Centre",
    location: "Chennai, Tamil Nadu",
    address: "Apollo Hospitals, Greams Road, Chennai, Tamil Nadu",
    specialty: "Parkinson's disease, deep brain stimulation, movement disorders",
    mapQuery: "Apollo Hospitals, Greams Road, Chennai, Tamil Nadu",
  },
  {
    id: 8,
    name: "Dr. Shankar Balakrishnan",
    hospital: "Rela Institute & Medical Centre",
    location: "Chennai, Tamil Nadu",
    experience: "18+ years",
    address: "Rela Institute & Medical Centre, Chennai, Tamil Nadu",
    specialty: "Movement disorders, neuro-rehabilitation, Parkinson's disease treatment",
    mapQuery: "Rela Institute & Medical Centre, Chennai, Tamil Nadu",
  },
  {
    id: 9,
    name: "Dr. Prof. P. Vijayashankar",
    hospital: "Apollo Hospitals Greams Road",
    location: "Chennai, Tamil Nadu",
    experience: "10+ years",
    address: "Apollo Hospitals, Greams Road, Chennai, Tamil Nadu",
    specialty: "Parkinson's disease, epilepsy, neurological disorders",
    mapQuery: "Apollo Hospitals, Greams Road, Chennai, Tamil Nadu",
  },
  {
    id: 10,
    name: "Dr. C. U. Velmurugendran",
    hospital: "Sri Ramachandra Medical College and Research Institute",
    location: "Chennai, Tamil Nadu",
    address: "Sri Ramachandra Medical College and Research Institute, Chennai, Tamil Nadu",
    specialty: "Neurology research, neurological disorders including Parkinson's disease",
    mapQuery: "Sri Ramachandra Medical College and Research Institute, Chennai, Tamil Nadu",
  },
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
          <h3 className="text-2xl font-heading font-bold text-white">Tirunelveli Neurology Specialists</h3>
          <p className="text-sm text-white/70">Parkinson's treatment and movement disorder clinics</p>
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
          {filteredDoctors.length} clinics
        </div>
      </div>

      {view === "list" ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredDoctors.length === 0 ? (
            <Card className="bg-white text-black border border-slate-200">
              <CardContent className="p-6 text-center text-sm text-slate-600">
                No clinics match your search. Try a different location or specialty.
              </CardContent>
            </Card>
          ) : (
            filteredDoctors.map((doctor, idx) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card
                  className={`bg-white text-black border border-slate-200 transition-shadow hover:shadow-md ${
                    selectedDoctor?.id === doctor.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedDoctor(doctor)}
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-heading text-lg font-semibold text-black">{doctor.name}</h4>
                        {doctor.doctorName ? (
                          <p className="text-sm text-slate-600">{doctor.doctorName}</p>
                        ) : null}
                        {doctor.hospital ? (
                          <p className="text-sm text-slate-600">{doctor.hospital}</p>
                        ) : null}
                        {doctor.location ? (
                          <p className="text-xs text-slate-500">{doctor.location}</p>
                        ) : null}
                        {doctor.experience ? (
                          <p className="text-xs text-slate-500">Experience: {doctor.experience}</p>
                        ) : null}
                        <p className="text-sm font-medium text-primary">{doctor.specialty}</p>
                      </div>
                      <div className="flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1">
                        <Star className="h-4 w-4 text-yellow-600 fill-current" />
                        <span className="text-sm font-semibold text-yellow-700">
                          {doctor.rating ? doctor.rating.toFixed(1) : "Not rated"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-slate-700">
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                        <span>{doctor.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-primary" />
                        <span>{doctor.phone || "Not provided"}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            openMap(doctor);
                          }}
                        >
                          Open in Maps
                        </Button>
                        {doctor.phone ? (
                          <Button
                            size="sm"
                            className="h-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              callDoctor(doctor.phone);
                            }}
                          >
                            Call
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="glass-panel lg:col-span-2">
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

          <div className="space-y-4">
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
              <CardContent className="space-y-2">
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
