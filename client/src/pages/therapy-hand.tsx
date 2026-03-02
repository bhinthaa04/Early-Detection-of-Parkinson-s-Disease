import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Hand, Info, ArrowLeft, Target } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import heroBg from "@assets/generated_images/hopeful_medical_background_with_brain_waves_and_pulses.png";

export default function HandStability() {
  const [, setLocation] = useLocation();
  const [isActive, setIsActive] = useState(false);

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
            <div className="p-3 bg-teal-100 text-teal-600 rounded-2xl">
              <Hand className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-gray-900">Hand Stability Training</h1>
          </div>

          <div className="flex gap-3 p-4 bg-teal-50 text-teal-700 rounded-xl mb-8 border border-teal-100">
            <Info className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">
              Hand exercises improve fine motor control and reduce tremors. Follow the target precisely to strengthen hand-eye coordination and dexterity.
            </p>
          </div>

          <div className="space-y-8">
            <div className="relative aspect-square max-w-md mx-auto bg-slate-100 rounded-3xl overflow-hidden border-2 border-slate-200">
              {isActive && (
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="absolute inset-0 bg-teal-500/10"
                />
              )}
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <Target className="w-48 h-48 text-teal-500 opacity-50" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={isActive ? { x: [0, 50, -30, 20, 0], y: [0, -20, 30, -10, 0] } : { x: 0, y: 0 }}
                      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                      className="w-6 h-6 bg-red-500 rounded-full shadow-lg"
                    />
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <p className="text-sm font-medium text-gray-600">
                  {isActive ? "Follow the red dot with your finger" : "Tap to start the exercise"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-2xl font-bold text-gray-900">--</div>
                <div className="text-xs text-gray-500">Reaction Time</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-2xl font-bold text-gray-900">--</div>
                <div className="text-xs text-gray-500">Accuracy</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-2xl font-bold text-gray-900">--</div>
                <div className="text-xs text-gray-500">Stability</div>
              </div>
            </div>

            <Button
              size="lg"
              onClick={() => setIsActive(!isActive)}
              className={`w-full py-8 text-lg rounded-2xl shadow-lg ${isActive ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-teal-600 hover:bg-teal-700 text-white'}`}
            >
              {isActive ? "Stop Exercise" : "Start Hand Exercise"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
