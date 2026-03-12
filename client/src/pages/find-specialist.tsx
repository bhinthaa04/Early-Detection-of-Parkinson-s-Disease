import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MapPin, Search, Phone, Clock, Star, Navigation,
  ArrowLeft, Filter, Award, Users, Calendar
} from "lucide-react";
import { useLocation } from "wouter";

const mockSpecialists = [
  {
    id: 1,
    name: "Dr. Sarah Thompson",
    specialty: "Movement Disorder Specialist",
    hospital: "Mayo Clinic Scottsdale",
    address: "13400 E Shea Blvd, Scottsdale, AZ 85259",
    phone: "(480) 301-8000",
    rating: 4.9,
    reviews: 127,
    distance: "2.3 miles",
    hours: "Mon-Fri 8AM-5PM",
    certifications: ["Board Certified Neurologist", "Parkinson's Foundation Center of Excellence"],
    coordinates: { lat: 33.5820, lng: -111.8796 }
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Neurologist",
    hospital: "Cleveland Clinic",
    address: "9500 Euclid Ave, Cleveland, OH 44195",
    phone: "(216) 444-2200",
    rating: 4.8,
    reviews: 89,
    distance: "5.1 miles",
    hours: "Mon-Thu 7AM-6PM",
    certifications: ["Board Certified Neurologist", "Deep Brain Stimulation Specialist"],
    coordinates: { lat: 41.5061, lng: -81.6084 }
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    specialty: "Parkinson's Disease Specialist",
    hospital: "Johns Hopkins Hospital",
    address: "1800 Orleans St, Baltimore, MD 21287",
    phone: "(410) 955-5000",
    rating: 4.7,
    reviews: 156,
    distance: "8.7 miles",
    hours: "Tue-Sat 9AM-4PM",
    certifications: ["Board Certified Neurologist", "Parkinson's Foundation Center of Excellence"],
    coordinates: { lat: 39.2979, lng: -76.5933 }
  }
];

export default function FindSpecialist() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialist, setSelectedSpecialist] = useState<typeof mockSpecialists[0] | null>(null);
  const [filteredSpecialists, setFilteredSpecialists] = useState(mockSpecialists);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const filtered = mockSpecialists.filter(specialist =>
      specialist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      specialist.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      specialist.hospital.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSpecialists(filtered);
  }, [searchQuery]);

  useEffect(() => {
    // Check if google is available on window
    if (mapRef.current && window.google && window.google.maps) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 39.8283, lng: -98.5795 },
        zoom: 4,
      });

      filteredSpecialists.forEach(specialist => {
        const marker = new window.google.maps.Marker({
          position: specialist.coordinates,
          map: map,
          title: specialist.name,
        });

        marker.addListener('click', () => {
          setSelectedSpecialist(specialist);
        });
      });
    }
  }, [filteredSpecialists]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Parkinson's Specialists
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Locate certified movement disorder specialists and Parkinson's disease experts near you
          </p>
        </motion.div>

        <div className="space-y-6">
            <Card className="w-full">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Search Specialists
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Input
                    placeholder="Search by name, specialty, or hospital..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-white">
                    <Filter className="w-3 h-3 mr-1" />
                    Movement Disorders
                  </Badge>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-white">
                    <Award className="w-3 h-3 mr-1" />
                    Center of Excellence
                  </Badge>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-white">
                    <Users className="w-3 h-3 mr-1" />
                    Accepting Patients
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="w-full">
              <CardContent className="p-0 pt-4">
                <div className="space-y-4">
                  {filteredSpecialists.map((specialist) => (
                    <motion.div
                      key={specialist.id}
                      whileHover={{ scale: 1.02 }}
                      className={`p-6 rounded-xl border cursor-pointer transition-all ${
                        selectedSpecialist?.id === specialist.id
                          ? 'border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20'
                          : 'border-gray-200 bg-white hover:shadow-lg hover:border-gray-300'
                      }`}
                      onClick={() => {
                        setSelectedSpecialist(specialist);
                        // Scroll map into view and highlight
                        const mapEl = mapRef.current;
                        if (mapEl) {
                          mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-xl">{specialist.name}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-lg font-bold text-yellow-500">{specialist.rating}</span>
                          <span className="text-sm text-gray-500">({specialist.reviews} reviews)</span>
                        </div>
                      </div>

                      <p className="text-primary font-semibold text-base mb-2">{specialist.specialty}</p>
                      <p className="text-lg font-medium mb-2 text-gray-800">{specialist.hospital}</p>

                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                          <MapPin className="w-4 h-4 text-blue-500" />
                          <span>{specialist.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Phone className="w-4 h-4 text-green-500" />
                          <span>{specialist.phone}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <LocateFixed className="w-3 h-3" />
                          {specialist.distance}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {specialist.hours}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSpecialist(specialist);
                            const mapEl = mapRef.current;
                            if (mapEl) {
                              mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                          }}
                        >
                          <Navigation className="w-4 h-4 mr-1" />
                          View on Map
                        </Button>
                        <Button size="sm" className="flex-1">Book Now</Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-0">
                <div
                  ref={mapRef}
                  className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center"
                >
                  {!window.google && (
                    <div className="text-center text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto mb-2" />
                      <p>Google Maps API is loading...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {selectedSpecialist && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{selectedSpecialist.name}</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Navigation className="w-4 h-4 mr-2" />
                          Directions
                        </Button>
                        <Button size="sm">
                          <Calendar className="w-4 h-4 mr-2" />
                          Book Appointment
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Contact Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>{selectedSpecialist.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span>{selectedSpecialist.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>{selectedSpecialist.hours}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Certifications</h4>
                        <div className="space-y-2">
                          {selectedSpecialist.certifications.map((cert, idx) => (
                            <Badge key={idx} variant="secondary" className="mr-2">
                              <Award className="w-3 h-3 mr-1" />
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{selectedSpecialist.rating}</span>
                          <span className="text-gray-500">({selectedSpecialist.reviews} reviews)</span>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Accepting New Patients
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
