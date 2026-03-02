import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Activity, Info, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import heroBg from "@assets/generated_images/hopeful_medical_background_with_brain_waves_and_pulses.png";

export default function MovementRoutine() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);

  const exercises = [
    { title: "Shoulder Rolls", desc: "Roll your shoulders back in a circular motion 10 times.", duration: "1 min" },
    { title: "Finger Tapping", desc: "Tap each finger to your thumb as fast as you can accurately.", duration: "2 min" },
    { title: "Leg Lifts", desc: "While seated, lift one leg at a time and hold for 3 seconds.", duration: "3 min" }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden font-sans">
      {/* Dynamic Medical AI Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-15 pointer-events-none"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      
      <div className="container mx-auto px-4 py-8 relative z-10 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/therapy")}
          className="mb-8 text-gray-700 hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Therapy
        </Button>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-green-100 text-green-600 rounded-2xl">
              <Activity className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-gray-900">Daily Movement Routine</h1>
          </div>

          <div className="flex gap-3 p-4 bg-green-50 text-green-700 rounded-xl mb-8 border border-green-100">
            <Info className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">
              Consistent physical activity helps maintain range of motion and reduces muscle rigidity. Follow these gentle movements designed for Parkinson's care.
            </p>
          </div>

          <div className="space-y-6">
            {exercises.map((ex, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-6 rounded-2xl border transition-all ${currentStep === idx ? 'border-green-500 bg-green-50 ring-4 ring-green-500/10' : 'border-slate-200 bg-slate-50 opacity-80'}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1 block">Exercise {idx + 1}</span>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{ex.title}</h3>
                    <p className="text-gray-600">{ex.desc}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">{ex.duration}</span>
                    {idx < currentStep && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                  </div>
                </div>
                {currentStep === idx && (
                  <Button 
                    onClick={() => setCurrentStep(idx + 1)}
                    className="mt-6 bg-green-600 hover:bg-green-700 w-full md:w-auto"
                  >
                    Mark as Complete
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
          
          {currentStep === exercises.length && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-12 p-8 bg-green-600 rounded-3xl text-white text-center"
            >
              <h2 className="text-3xl font-bold mb-2">Well Done!</h2>
              <p className="opacity-90">You've completed your daily routine. Consistency is key to mobility.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
