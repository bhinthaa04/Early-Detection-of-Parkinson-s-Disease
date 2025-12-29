import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BookOpen, Info, ArrowLeft, Brain } from "lucide-react";
import { useLocation } from "wouter";

export default function AwarenessLearning() {
  const [, setLocation] = useLocation();

  const lessons = [
    { title: "Understanding Dopamine", desc: "How this neurotransmitter affects movement and mood." },
    { title: "Nutrition & Health", desc: "Best foods to support brain health and medication efficacy." },
    { title: "Sleep Hygiene", desc: "Strategies for better rest and night-time symptom management." }
  ];

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
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
              <BookOpen className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-slate-900">Awareness & Learning</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <div className="p-6 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100">
                <Info className="w-5 h-5 mb-3" />
                <p className="text-sm font-medium">
                  Knowledge is power. Understanding the physiological changes in the brain helps in managing symptoms and expectations.
                </p>
              </div>

              <div className="space-y-4">
                {lessons.map((lesson, i) => (
                  <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-400 cursor-pointer transition-colors group">
                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{lesson.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{lesson.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
              <Brain className="absolute -bottom-12 -right-12 w-48 h-48 text-white/5" />
              <h2 className="text-2xl font-bold mb-6 relative z-10">Daily Brain Tip</h2>
              <p className="text-blue-200 text-lg mb-8 relative z-10">
                "Small, frequent movements throughout the day are often more beneficial than one long session. Keep moving!"
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700 w-full">Mark as Read</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
