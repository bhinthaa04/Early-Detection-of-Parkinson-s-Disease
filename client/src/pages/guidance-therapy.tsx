import { motion } from "framer-motion";
import { 
  ArrowLeft, BookOpen, Activity, Heart, 
  Sparkles, CheckCircle2, ChevronRight, 
  Wind, PlayCircle, Star
} from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GuidanceTherapy() {
  const [, setLocation] = useLocation();

  const sessions = [
    { title: "Speech Clarity Exercise", duration: "10 mins", category: "Speech", icon: PlayCircle },
    { title: "Hand Stability Training", duration: "15 mins", category: "Motor", icon: Activity },
    { title: "Breathing & Relaxation", duration: "5 mins", category: "Mental", icon: Wind },
    { title: "Daily Movement Routine", duration: "20 mins", category: "Mobility", icon: Sparkles }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => setLocation("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>

        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-primary rounded-xl text-black">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold">Guidance & Therapy</h1>
            <p className="text-gray-600">Improving daily quality of life through AI therapy</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                Your Recommended Sessions
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {sessions.map((session, i) => (
                  <Card key={i} className="hover:border-primary/50 transition-colors cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                            <session.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground">{session.title}</p>
                            <p className="text-xs text-gray-400">{session.duration} • {session.category}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4">Daily Wellness Task</h3>
                <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl border border-white/10 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-black font-bold">!</div>
                  <p className="text-lg">Practice the "Spiral Drawing" exercise for 5 minutes today to track hand stability.</p>
                </div>
                <Button className="w-full md:w-auto px-8 rounded-full">Start Activity</Button>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Awareness & Learning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  "Understanding Dopamine Loss",
                  "Nutrition for Neuro-Health",
                  "Importance of Daily Exercise",
                  "Mental Wellness Strategies"
                ].map((title, i) => (
                  <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200">
                    <span className="text-sm font-medium">{title}</span>
                    <BookOpen className="w-4 h-4 text-gray-300" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-border">
                  <span className="text-sm">Weekly Goals</span>
                  <span className="text-sm font-bold text-primary">4/7 Completed</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-border">
                  <span className="text-sm">Current Streak</span>
                  <span className="text-sm font-bold text-primary">3 Days</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
