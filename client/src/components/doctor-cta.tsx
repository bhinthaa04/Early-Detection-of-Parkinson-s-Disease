import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, MapPin, Clock } from "lucide-react";

interface DoctorCTAProps {
  stage: 'Early' | 'Mid' | 'Advanced';
  urgency?: boolean;
}

export function DoctorCTA({ stage, urgency }: DoctorCTAProps) {
  const isAdvanced = stage === 'Advanced' || urgency;
  const bgClass = isAdvanced ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200';
  const textClass = isAdvanced ? 'text-red-700' : 'text-blue-700';
  const buttonClass = isAdvanced ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary/90';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
    >
      <Card className={`border-2 ${bgClass}`}>
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <div>
              <h3 className={`text-2xl font-heading font-bold ${textClass} mb-2`}>
                {isAdvanced ? '⚠️ Immediate Medical Attention Required' : 'Consult a Healthcare Professional'}
              </h3>
              <p className="text-gray-700">
                {isAdvanced
                  ? 'Your test results indicate advanced-stage Parkinson\'s. Please contact a neurologist immediately.'
                  : 'Schedule an appointment with a neurologist for comprehensive evaluation and personalized treatment plan.'}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center justify-center gap-2 p-4 bg-white rounded-lg">
                <Phone className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <p className="text-xs text-gray-600">Emergency</p>
                  <p className="font-semibold">911 (if needed)</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 p-4 bg-white rounded-lg">
                <Clock className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <p className="text-xs text-gray-600">Book Within</p>
                  <p className="font-semibold">{isAdvanced ? '24 Hours' : '1-2 Weeks'}</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 p-4 bg-white rounded-lg">
                <MapPin className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <p className="text-xs text-gray-600">Specialist</p>
                  <p className="font-semibold">Neurologist</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center flex-wrap">
              <Button 
                className={`${buttonClass} text-white`}
                size="lg"
                onClick={() => alert('Redirect to doctor booking platform')}
                data-testid="btn-find-doctor"
              >
                Find Nearby Doctor
              </Button>
              <Button 
                variant="outline"
                size="lg"
                data-testid="btn-call-emergency"
              >
                Emergency Contacts
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
