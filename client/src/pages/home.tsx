import { motion } from "framer-motion";
import { 
  Video, Brain, Activity, Users, Heart, 
  Smile, BadgeCheck, Stethoscope, Sparkles, 
  Layout, MousePointer2, Languages, Book, 
  Download, FileText, Share2, Globe, NotebookPen,
  ChevronRight, Play, MessageSquare, Map
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  const sections = [
    {
      title: "Interactive Learning & Education",
      color: "bg-orange-50",
      icon: <Book className="text-orange-600" />,
      features: [
        { name: "Parkinson's Explained", icon: <Video />, desc: "Embedded educational videos" },
        { name: "3D Brain Model", icon: <Brain />, desc: "Interactive visualization" },
        { name: "Symptom Progression", icon: <Activity />, desc: "Early, Mid, Advanced tracking" },
        { name: "Body Map with Hotspots", icon: <Map />, desc: "Clickable symptom zones" },
        { name: "Stats Carousel", icon: <Layout />, desc: "Real-time prevalence data" },
      ]
    },
    {
      title: "Engagement & Empathy",
      color: "bg-indigo-50",
      icon: <Heart className="text-indigo-600" />,
      features: [
        { name: "Patient Stories", icon: <Users />, desc: "Personal journey highlights" },
        { name: "Hope Wall", icon: <MessageSquare />, desc: "Community encouragement" },
        { name: "Mood Tracker", icon: <Smile />, desc: "Daily emotional logging" },
        { name: "Daily Tips & Badges", icon: <BadgeCheck />, desc: "Gamified wellness goals" },
        { name: "Doctor Testimonials", icon: <Stethoscope />, desc: "Expert advice clips" },
      ]
    },
    {
      title: "Visual Appeal & Animations",
      color: "bg-rose-50",
      icon: <Sparkles className="text-rose-600" />,
      features: [
        { name: "Animated Background", icon: <Activity />, desc: "Neural pulse effects" },
        { name: "Emoji Stages", icon: <Smile />, desc: "Visual mood indicators" },
        { name: "Progress Meter", icon: <Activity />, desc: "75% completion goals" },
        { name: "Theme Switcher", icon: <Layout />, desc: "Dark/Light mode support" },
        { name: "Stage Slider", icon: <MousePointer2 />, desc: "Interactive timeline" },
      ]
    },
    {
      title: "Interactive Tools",
      color: "bg-teal-50",
      icon: <MousePointer2 className="text-teal-600" />,
      features: [
        { name: "Confidence Slider", icon: <Activity />, desc: "Symptom confidence index" },
        { name: "Symptom Quiz", icon: <FileText />, desc: "Yes/No quick screening" },
        { name: "Exercise Demos", icon: <Play />, desc: "Guided physical therapy" },
        { name: "Medication Reminders", icon: <Activity />, desc: "Personalized alerts" },
        { name: "Community Map", icon: <Globe />, desc: "Local support groups" },
      ]
    },
    {
      title: "PDF, Sharing & Accessibility",
      color: "bg-blue-50",
      icon: <Globe className="text-blue-600" />,
      features: [
        { name: "Download Report", icon: <Download />, desc: "Clinical PDF generation" },
        { name: "Wellness Guides", icon: <Book />, desc: "Healthy living resources" },
        { name: "Social Share", icon: <Share2 />, desc: "Connect with platforms" },
        { name: "Multilingual", icon: <Languages />, desc: "Global access support" },
        { name: "Patient Diary", icon: <NotebookPen />, desc: "Private daily logging" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans pb-20">
      {/* Header */}
      <header className="bg-white border-b py-8 text-center sticky top-0 z-50">
        <h1 className="text-4xl font-heading font-bold text-slate-900">Parkinson's Platform Features</h1>
        <p className="text-slate-500 mt-2">50 Creative Ideas in One Infographic</p>
      </header>

      <main className="container mx-auto px-4 mt-12 space-y-16">
        {sections.map((section, idx) => (
          <section key={idx} className={`${section.color} rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm`}>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-white rounded-2xl shadow-sm">
                {section.icon}
              </div>
              <h2 className="text-2xl font-bold text-slate-800">{section.title}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {section.features.map((feature, fIdx) => (
                <motion.div
                  key={fIdx}
                  whileHover={{ y: -5 }}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/50 flex flex-col items-center text-center group transition-all hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2 leading-tight">{feature.name}</h3>
                  <p className="text-xs text-slate-500">{feature.desc}</p>
                  
                  {/* Decorative element like in the image */}
                  <div className="mt-4 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="w-1/3 h-full bg-blue-400 opacity-50" />
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        ))}

        {/* Example Interactive Card Showcase */}
        <div className="grid md:grid-cols-2 gap-8 pt-12">
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Activity className="text-blue-400" /> Progress Meter
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative w-48 h-48 mb-8">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96" cy="96" r="80"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-white/10"
                  />
                  <circle
                    cx="96" cy="96" r="80"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 80}
                    strokeDashoffset={2 * Math.PI * 80 * 0.25}
                    className="text-blue-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold">
                  75%
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 w-full rounded-2xl py-6">View Detailed Report</Button>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-slate-900">
                <MousePointer2 className="text-orange-500" /> Stage Slider
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex justify-between items-center gap-4">
                <div className="flex-1 space-y-4">
                  <Slider defaultValue={[50]} max={100} step={1} className="py-4" />
                  <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <span>Early</span>
                    <span>Mid</span>
                    <span>Advanced</span>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-slate-600 italic">"Understanding where you are is the first step in taking control of your journey."</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Navigation Shortcut */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md px-6 py-4 rounded-full border shadow-2xl flex gap-4 items-center z-50">
        <Button variant="ghost" onClick={() => setLocation("/")} className="rounded-full">Overview</Button>
        <div className="w-px h-6 bg-slate-200" />
        <Button onClick={() => setLocation("/prediction")} className="rounded-full bg-slate-900 hover:bg-black text-white px-8">Try Diagnostic</Button>
      </div>
    </div>
  );
}
