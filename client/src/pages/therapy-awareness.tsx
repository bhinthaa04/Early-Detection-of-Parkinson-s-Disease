import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Brain, Info, ArrowLeft, BookOpen } from "lucide-react";
import { useLocation } from "wouter";
import heroBg from "@assets/generated_images/hopeful_medical_background_with_brain_waves_and_pulses.png";

const topics = [
  { title: "Understanding Dopamine", desc: "How this neurotransmitter affects movement and mood." },
  { title: "Nutrition & Health", desc: "Best foods to support brain health and medication efficacy." },
  { title: "Medication Management", desc: "Timing, dosages, and managing side effects effectively." },
  { title: "Exercise Benefits", desc: "Why physical activity is crucial for Parkinson's patients." },
  { title: "Sleep Quality", desc: "Improving rest and managing sleep disorders." },
  { title: "Emotional Wellbeing", desc: "Coping strategies for anxiety and depression." }
];

export default function AwarenessLearning() {
  const [, setLocation] = useLocation();

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
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
              <Brain className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-gray-900">Parkinson's Awareness</h1>
          </div>

          <div className="flex gap-3 p-4 bg-indigo-50 text-indigo-700 rounded-xl mb-8 border border-indigo-100">
            <Info className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">
              Education is key to managing Parkinson's. Learn about the disease, treatment options, and lifestyle modifications that can improve quality of life.
            </p>
          </div>

          <div className="grid gap-4">
            {topics.map((topic, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-200 transition-colors">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{topic.title}</h3>
                    <p className="text-gray-600 text-sm">{topic.desc}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-100">
                    Read More
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 p-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl text-white text-center">
            <h2 className="text-2xl font-bold mb-2">Knowledge is Power</h2>
            <p className="opacity-90 mb-6">Understanding Parkinson's helps you make informed decisions about your care.</p>
            <Button variant="secondary" className="bg-white text-indigo-600 hover:bg-gray-100 font-bold">
              View All Resources
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
