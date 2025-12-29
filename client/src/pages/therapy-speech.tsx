import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mic, Info, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

export default function SpeechClarity() {
  const [, setLocation] = useLocation();
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/therapy")}
          className="mb-8 hover:bg-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Therapy
        </Button>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
              <Mic className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-slate-900">Speech Clarity Exercise</h1>
          </div>

          <div className="flex gap-3 p-4 bg-blue-50 text-blue-700 rounded-xl mb-8 border border-blue-100">
            <Info className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">
              Parkinson's can cause "hypophonia" (soft speech). This exercise helps you maintain vocal volume and articulation through sustained vowel sounds and rhythmic phrases.
            </p>
          </div>

          <div className="space-y-12">
            <div className="text-center p-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <p className="text-xl font-medium text-slate-600 mb-8">Press the button and say "Aaaah" for as long as you can</p>
              
              <div className="relative inline-block">
                {isRecording && (
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.2, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-blue-400 rounded-full"
                  />
                )}
                <Button 
                  size="lg"
                  className={`relative w-24 h-24 rounded-full shadow-xl transition-all ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                  onClick={() => setIsRecording(!isRecording)}
                >
                  <Mic className="w-8 h-8 text-white" />
                </Button>
              </div>
              
              <div className="mt-8 flex justify-center gap-1 h-12 items-center">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={isRecording ? { height: [10, 40, 10] } : { height: 10 }}
                    transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                    className="w-1.5 bg-blue-400 rounded-full"
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-2">Volume Level</h3>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    animate={isRecording ? { width: "75%" } : { width: "0%" }}
                    className="bg-green-500 h-full"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2 text-right">Target: 70dB</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-2">Clarity Score</h3>
                <div className="text-3xl font-bold text-blue-600">--</div>
                <p className="text-xs text-slate-500 mt-1">Analyzing pronunciation...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
