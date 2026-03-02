import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Wind, Info, ArrowLeft, Play, Pause } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import heroBg from "@assets/generated_images/hopeful_medical_background_with_brain_waves_and_pulses.png";

export default function BreathingRelaxation() {
  const [, setLocation] = useLocation();
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");

  useEffect(() => {
    let timer: any;
    if (isActive) {
      const runCycle = () => {
        setPhase("Inhale");
        timer = setTimeout(() => {
          setPhase("Hold");
          timer = setTimeout(() => {
            setPhase("Exhale");
            timer = setTimeout(runCycle, 4000);
          }, 4000);
        }, 4000);
      };
      runCycle();
    }
    return () => clearTimeout(timer);
  }, [isActive]);

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
            <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl">
              <Wind className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-gray-900">Breathing & Relaxation</h1>
          </div>

          <div className="flex gap-3 p-4 bg-purple-50 text-purple-700 rounded-xl mb-8 border border-purple-100">
            <Info className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">
              Deep, controlled breathing reduces stress-induced tremors and improves oxygenation. This guided session uses the 4-4-4 technique to calm the nervous system.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative w-64 h-64 flex items-center justify-center">
              <motion.div
                animate={isActive ? {
                  scale: phase === "Inhale" ? 1.5 : phase === "Hold" ? 1.5 : 1,
                  opacity: phase === "Inhale" ? 0.8 : phase === "Hold" ? 1 : 0.4
                } : { scale: 1, opacity: 0.2 }}
                transition={{ duration: 4, ease: "easeInOut" }}
                className="absolute inset-0 bg-purple-200 rounded-full blur-3xl"
              />
              <motion.div
                animate={isActive ? {
                  scale: phase === "Inhale" ? 1.5 : phase === "Hold" ? 1.5 : 1,
                } : { scale: 1 }}
                transition={{ duration: 4, ease: "easeInOut" }}
                className="w-48 h-48 border-4 border-purple-500 rounded-full flex items-center justify-center bg-white shadow-2xl z-10"
              >
                <span className="text-2xl font-bold text-purple-600">
                  {isActive ? phase : "Ready?"}
                </span>
              </motion.div>
            </div>

            <Button
              size="lg"
              onClick={() => setIsActive(!isActive)}
              className={`mt-16 px-12 py-8 text-lg rounded-full shadow-lg ${isActive ? 'bg-slate-200 text-gray-800 hover:bg-slate-300' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
            >
              {isActive ? (
                <><Pause className="w-5 h-5 mr-2" /> Stop Session</>
              ) : (
                <><Play className="w-5 h-5 mr-2" /> Start Guided Breathing</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
