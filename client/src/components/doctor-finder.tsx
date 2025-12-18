import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Star, Globe } from "lucide-react";

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  distance: number;
  rating: number;
  phone: string;
  address: string;
  availability: string;
}

const mockDoctors: Doctor[] = [
  {
    id: 1,
    name: "Dr. Sarah Chen",
    specialty: "Neurologist",
    distance: 0.8,
    rating: 4.9,
    phone: "+1-555-0101",
    address: "123 Medical Plaza, Downtown",
    availability: "Today 3-5 PM",
  },
  {
    id: 2,
    name: "Dr. James Wilson",
    specialty: "Movement Disorders",
    distance: 1.2,
    rating: 4.8,
    phone: "+1-555-0102",
    address: "456 Health Center, Uptown",
    availability: "Tomorrow 10 AM",
  },
  {
    id: 3,
    name: "Dr. Priya Patel",
    specialty: "Parkinson's Specialist",
    distance: 1.5,
    rating: 4.7,
    phone: "+1-555-0103",
    address: "789 Neurology Institute, Midtown",
    availability: "This Friday",
  },
  {
    id: 4,
    name: "Dr. Michael Rodriguez",
    specialty: "Movement Neurologist",
    distance: 2.1,
    rating: 4.6,
    phone: "+1-555-0104",
    address: "321 Clinical Center, Suburb",
    availability: "Next Monday",
  },
];

export function DoctorFinder() {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-heading font-bold text-foreground">Nearby Specialists</h3>
        <div className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
          {mockDoctors.length} Found
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Doctors List */}
        <div className="space-y-4">
          {mockDoctors.map((doctor, idx) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card
                className={`cursor-pointer transition-all ${
                  selectedDoctor?.id === doctor.id
                    ? "border-primary shadow-lg"
                    : "hover:shadow-md"
                }`}
                onClick={() => setSelectedDoctor(doctor)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-heading font-semibold text-foreground">{doctor.name}</h4>
                      <p className="text-sm text-primary font-medium">{doctor.specialty}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
                      <Star className="w-4 h-4 text-yellow-600 fill-current" />
                      <span className="text-sm font-semibold text-yellow-700">{doctor.rating}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{doctor.distance} km away</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{doctor.phone}</span>
                    </div>
                    <div className="text-xs text-primary font-medium bg-primary/5 px-2 py-1 rounded w-fit">
                      ✓ {doctor.availability}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Map & Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="space-y-4 sticky top-6">
            {/* Mock Map */}
            <Card className="bg-gradient-to-br from-blue-100 to-teal-100 h-64 relative overflow-hidden">
              <CardContent className="p-0 h-full flex items-center justify-center text-center">
                <div className="space-y-2">
                  <Globe className="w-12 h-12 mx-auto text-primary opacity-50" />
                  <p className="text-sm text-gray-700">
                    {selectedDoctor ? `📍 ${selectedDoctor.name}` : "📍 Select a doctor to see location"}
                  </p>
                  <p className="text-xs text-gray-600">
                    {selectedDoctor ? selectedDoctor.address : "Map integration available"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Selected Doctor Details */}
            {selectedDoctor && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-primary/50 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-lg">{selectedDoctor.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3">
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">Specialty</p>
                        <p className="text-sm text-foreground">{selectedDoctor.specialty}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">Address</p>
                        <p className="text-sm text-foreground">{selectedDoctor.address}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">Next Available</p>
                        <p className="text-sm text-foreground">{selectedDoctor.availability}</p>
                      </div>
                    </div>

                    <Button className="w-full rounded-lg" data-testid="btn-book-appointment">
                      📅 Book Appointment
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full rounded-lg"
                      onClick={() => window.open(`tel:${selectedDoctor.phone}`)}
                      data-testid="btn-call-doctor"
                    >
                      ☎️ Call Now
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
