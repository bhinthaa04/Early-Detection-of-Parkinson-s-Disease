import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, Video, FileText, ChevronRight, 
  Brain, Zap, Heart, Activity, ArrowLeft 
} from "lucide-react";
import { useLocation } from "wouter";
import { BackendConfigButton } from "@/components/backend-config";
import heroBg from "@assets/generated_images/hopeful_medical_background_with_brain_waves_and_pulses.png";

export default function Education() {
  const [, setLocation] = useLocation();

  const stages = [
    { 
      name: "Early Stage", 
      desc: "Mild symptoms, often overlooked. Tremors might start on one side of the body.",
      icon: "🟢",
      features: ["Mild tremor", "Change in walking", "Facial expression changes"]
    },
    { 
      name: "Mid Stage", 
      desc: "Symptoms become more obvious. Balance and coordination are increasingly affected.",
      icon: "🟠",
      features: ["Balance issues", "Slower movement", "Stiffness in limbs"]
    },
    { 
      name: "Advanced Stage", 
      desc: "Significant mobility issues. Usually requires a wheelchair or is bedridden.",
      icon: "🔴",
      features: ["Severe disability", "Cognitive changes", "Full-time care needed"]
    }
  ];

  return (
    <div className="min-h-screen relative font-sans overflow-hidden">
      {/* Dynamic Medical AI Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      
      {/* Animated Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div
          animate={{
            x: [-20, 20, -20],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[150px]"
        />
      </div>

      <BackendConfigButton />
      
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <div className="p-1.5 bg-primary rounded-lg text-black">
              <Brain className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold gradient-text">NeuroScan AI</span>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => setLocation("/")} data-testid="nav-home">Home</Button>
            <Button variant="ghost" onClick={() => setLocation("/prediction")} data-testid="nav-test">Test</Button>
            <Button variant="ghost" className="text-primary font-medium">Education</Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <Button 
            variant="ghost" 
            className="mb-4 -ml-2 text-gray-500 hover:text-primary"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Learn About <span className="text-primary">Parkinson's Disease</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Empowering patients and caregivers with knowledge about symptoms, progression, and management strategies.
          </p>
        </div>

        {/* Hero Content */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 overflow-hidden relative"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Video className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">Educational Overview</h2>
              </div>
              <div className="aspect-video bg-slate-100 rounded-2xl overflow-hidden mb-6 group cursor-pointer relative">
                <img 
                  src="https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=800" 
                  alt="Brain visualization"
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-black border-b-[10px] border-b-transparent ml-1" />
                  </div>
                </div>
              </div>
              <h3 className="font-bold text-lg mb-2">Understanding the Biological Basis</h3>
              <p className="text-slate-600 mb-4">A deep dive into how Parkinson's affects neural pathways and dopamine production.</p>
              <Button variant="outline" className="w-full">Watch Video Series</Button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-primary/5 rounded-3xl p-8 border border-primary/20 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/20 text-primary-foreground rounded-xl">
                  <FileText className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">Resource Center</h2>
              </div>
              <div className="space-y-4 mb-8">
                {[
                  "Complete Guide for Newly Diagnosed",
                  "Nutrition & Diet Recommendations",
                  "Exercise Routines for Mobility",
                  "Mental Health & Wellbeing"
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-transparent hover:border-primary/20">
                    <span className="font-medium text-slate-800">{item}</span>
                    <ChevronRight className="w-5 h-5 text-primary" />
                  </div>
                ))}
              </div>
            </div>
            <Button className="w-full py-6 text-lg">Download Full PDF Report</Button>
          </motion.div>
        </div>

        {/* Symptom Progression */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Symptom Progression</h2>
            <p className="text-slate-600">Parkinson's progresses differently for everyone, but generally follows these stages.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {stages.map((stage, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
              >
                <div className="text-4xl mb-4">{stage.icon}</div>
                <h3 className="text-2xl font-bold mb-3">{stage.name}</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">{stage.desc}</p>
                <div className="space-y-3">
                  {stage.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-500">
                      <Zap className="w-4 h-4 text-primary" />
                      {f}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Management & Lifestyle */}
        <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Heart className="w-64 h-64 text-white" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-4xl font-bold mb-6">Managing Daily Life</h2>
            <p className="text-slate-400 text-lg mb-8">
              While there is no cure yet, many effective treatments and lifestyle adjustments can help maintain a high quality of life.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { title: "Physical Activity", icon: Activity, desc: "Consistent exercise improves balance and strength." },
                { title: "Emotional Support", icon: Heart, iconColor: "text-red-400", desc: "Joining support groups can reduce isolation." }
              ].map((item, i) => (
                <div key={i} className="space-y-3">
                  <div className={`p-3 bg-white/10 rounded-2xl w-fit ${item.iconColor || 'text-primary'}`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-xl">{item.title}</h4>
                  <p className="text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            © 2025 NeuroScan AI. All medical information is for educational purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
}
