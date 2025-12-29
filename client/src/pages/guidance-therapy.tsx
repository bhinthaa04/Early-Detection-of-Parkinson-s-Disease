import { motion } from "framer-motion";
import { 
  ArrowLeft, BookOpen, Activity, Heart, 
  Sparkles, CheckCircle2, ChevronRight, 
  Wind, PlayCircle, Star, Mic, Hand, PenTool
} from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import therapyBg from "@assets/generated_images/calming_neuroscience_background_pattern.png";

export default function GuidanceTherapy() {
  const [, setLocation] = useLocation();

  const sessions = [
    { title: "Speech Clarity Exercise", duration: "10 mins", category: "Speech", icon: Mic, path: "/therapy/speech", color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Hand Stability Training", duration: "15 mins", category: "Motor", icon: Hand, path: "/therapy/hand", color: "text-teal-600", bg: "bg-teal-50" },
    { title: "Breathing & Relaxation", duration: "5 mins", category: "Mental", icon: Wind, path: "/therapy/breathing", color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Daily Movement Routine", duration: "20 mins", category: "Mobility", icon: Activity, path: "/therapy/movement", color: "text-green-600", bg: "bg-green-50" },
    { title: "Spiral Drawing Test", duration: "5 mins", category: "Motor", icon: PenTool, path: "/therapy/spiral", color: "text-red-600", bg: "bg-red-50" },
    { title: "Awareness & Learning", duration: "Ongoing", category: "Education", icon: BookOpen, path: "/therapy/awareness", color: "text-indigo-600", bg: "bg-indigo-50" }
  ];

  return (
    <div 
      className="min-h-screen bg-fixed bg-cover font-sans"
      style={{ backgroundImage: `url(${therapyBg})` }}
    >
      <div className="min-h-screen bg-white/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => setLocation("/")} className="mb-6 hover:bg-white/50">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>

          <div className="flex items-center gap-4 mb-12">
            <div className="p-3 bg-white/80 backdrop-blur shadow-sm rounded-2xl text-slate-800 border border-white">
              <Heart className="w-8 h-8 text-red-500 animate-pulse" />
            </div>
            <div>
              <h1 className="text-4xl font-heading font-bold text-slate-900">Therapeutic Guidance</h1>
              <p className="text-slate-600">Personalized AI exercises for Parkinson's wellness</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Therapy Modules
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {sessions.map((session, i) => (
                    <Card 
                      key={i} 
                      onClick={() => setLocation(session.path)}
                      className="hover:shadow-xl transition-all cursor-pointer group border-white/50 bg-white/40 backdrop-blur-md"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-4 ${session.bg} rounded-2xl ${session.color} group-hover:scale-110 transition-transform`}>
                              <session.icon className="w-7 h-7" />
                            </div>
                            <div>
                              <p className="font-bold text-lg text-slate-900 leading-tight">{session.title}</p>
                              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{session.duration} • {session.category}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-900 transition-colors" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              <section className="bg-slate-900 rounded-[2rem] p-10 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px]" />
                <div className="relative z-10">
                  <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold rounded-full mb-4">AI ANALYTICS ACTIVE</span>
                  <h3 className="text-3xl font-bold mb-4">Patient Progress Overview</h3>
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-xs text-blue-300 uppercase font-bold mb-1">Motor Stability</p>
                      <p className="text-2xl font-bold">+12% Improved</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-xs text-blue-300 uppercase font-bold mb-1">Vocal Clarity</p>
                      <p className="text-2xl font-bold">Stable</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-xs text-blue-300 uppercase font-bold mb-1">Consistency</p>
                      <p className="text-2xl font-bold">5 Day Streak</p>
                    </div>
                  </div>
                  <Button className="bg-white text-slate-900 hover:bg-blue-50 px-8 rounded-xl font-bold">View Detailed Report</Button>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <Card className="bg-white/40 backdrop-blur-md border-white/50">
                <CardHeader>
                  <CardTitle className="text-xl">Educational Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    "Managing 'Off' Periods",
                    "Dopamine-Friendly Diet",
                    "Adaptive Living Tips",
                    "Stress & Tremors"
                  ].map((title, i) => (
                    <div key={i} className="flex items-center justify-between p-4 hover:bg-white/60 rounded-xl cursor-pointer transition-all border border-transparent hover:border-white group">
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">{title}</span>
                      <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="p-8 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] text-white shadow-xl">
                <h4 className="font-bold mb-2">Weekly Goal</h4>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-4">
                  <div className="w-[65%] h-full bg-white" />
                </div>
                <p className="text-sm opacity-90 mb-6">You've completed 4 out of 7 daily therapy sessions this week. Keep it up!</p>
                <Button className="w-full bg-white/20 hover:bg-white/30 border-none">Update Goals</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

