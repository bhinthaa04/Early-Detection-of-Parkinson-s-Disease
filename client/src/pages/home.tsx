import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, Brain, Activity, Shield, TrendingUp, 
  BarChart3, Info, AlertTriangle, ChevronDown, 
  ChevronUp, HeartPulse, User, MapPin, 
  Play, Pause, Volume2, X, Sparkles, Users, BookOpen
} from "lucide-react";
import { useLocation } from "wouter";
import { BackendConfigButton } from "@/components/backend-config";
import heroBg from "@assets/generated_images/community_support_and_healthcare_unity.png";
import parkinsonsBrainImg from "@assets/generated_images/3d_parkinsons_brain_visualization.png";
import medicalInfographic from "@assets/generated_images/medical_brain_infographic.png";
import { useState, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Sphere, MeshDistortMaterial } from "@react-three/drei";
import parkinsonsVideo from "@assets/generated_videos/parkinsons_edu.mp4";

function BrainModel() {
  const meshRef = useRef<any>();
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 100, 100]} scale={1.5}>
        <MeshDistortMaterial
          color="hsl(150, 70%, 45%)"
          attach="material"
          distort={0.4}
          speed={1.5}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [severity, setSeverity] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const stages = [
    { label: "Early Stage", color: "text-green-500", icon: "🟢", desc: "Mild symptoms, often overlooked. Tremors might start." },
    { label: "Mid Stage", color: "text-orange-500", icon: "🟠", desc: "Symptoms become more obvious. Balance and coordination affected." },
    { label: "Advanced Stage", color: "text-red-500", icon: "🔴", desc: "Significant mobility issues. Requires assistance for daily tasks." }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden font-sans bg-slate-50">
      {/* Subtle Background Neural Pattern */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{ 
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Soft Gradient Overlays */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/50 via-transparent to-beige-50/30" />
      </div>

      <BackendConfigButton />

      <div className="container mx-auto px-4 relative z-10">
        {/* Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-6 flex justify-between items-center"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg text-black">
              <Brain className="w-6 h-6" />
            </div>
            <span className="text-2xl font-heading font-bold gradient-text">NeuroScan AI</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="ghost" onClick={() => setLocation("/")} data-testid="nav-home" className="text-slate-600 hover:text-primary">Home</Button>
            <Button variant="ghost" onClick={() => setLocation("/education")} data-testid="nav-education" className="text-slate-600 hover:text-primary">About Parkinson's</Button>
            <Button variant="ghost" onClick={() => setLocation("/prediction")} data-testid="nav-predict" className="text-slate-600 hover:text-primary">Detection Tool</Button>
            <Button variant="ghost" onClick={() => setLocation("/therapy")} data-testid="nav-therapy" className="text-slate-600 hover:text-primary">Awareness</Button>
          </div>
        </motion.nav>

        {/* Hero Section */}
        <div className="relative rounded-[2.5rem] overflow-hidden mb-20 shadow-2xl min-h-[600px] flex items-center">
          <div className="absolute inset-0 z-0">
            <img 
              src={heroBg} 
              alt="Together We Move Better" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-transparent" />
          </div>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative z-10 container mx-auto px-8 md:px-16 max-w-3xl"
          >
            <div className="space-y-8">
              <div>
                <div className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-blue-100 text-sm font-medium mb-4 backdrop-blur-sm border border-white/10">
                  🤝 United in Care & Support
                </div>
                <h1 className="text-5xl md:text-7xl font-heading font-bold text-white leading-tight mb-6">
                  Together We <span className="text-secondary">Move Better</span>
                </h1>
                <p className="text-xl text-blue-50/90 leading-relaxed font-light">
                  A classic, compassionate approach to Parkinson's care. We combine advanced AI detection with a community-focused mission to empower every journey.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white px-10 py-7 text-lg shadow-xl rounded-full transition-all hover:scale-105"
                  onClick={() => setLocation("/prediction")}
                  data-testid="btn-cta-predict"
                >
                  Detection Tool
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white/10 hover:bg-white/20 border-white/30 text-white px-10 py-7 text-lg rounded-full backdrop-blur-md transition-all hover:scale-105"
                  onClick={() => setLocation("/education")}
                  data-testid="btn-education"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Severity Slider Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="bg-white/50 backdrop-blur rounded-3xl p-8 md:p-12 mb-20 border border-primary/10"
        >
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-heading font-bold mb-8">Symptom Severity Preview</h2>
            <div className="mb-12">
              <input 
                type="range" 
                min="0" 
                max="2" 
                step="1" 
                value={severity} 
                onChange={(e) => setSeverity(parseInt(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between mt-4">
                {stages.map((s, i) => (
                  <span key={i} className={`text-sm font-bold ${severity === i ? s.color : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                ))}
              </div>
            </div>
            <motion.div 
              key={severity}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl"
            >
              <div className="text-5xl mb-4">{stages[severity].icon}</div>
              <h3 className={`text-2xl font-bold mb-4 ${stages[severity].color}`}>{stages[severity].label}</h3>
              <p className="text-gray-200 text-lg">{stages[severity].desc}</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-4 gap-6 py-12">
          {[
            { icon: Brain, title: 'AI Analysis', desc: 'Advanced neural network predictions' },
            { icon: Activity, title: 'Multimodal', desc: 'Spiral + Voice combined' },
            { icon: TrendingUp, title: 'Stage Tracking', desc: 'Progression classification' },
            { icon: BarChart3, title: 'Analytics', desc: 'Visualize health trends' },
          ].map((feature, idx) => (
            <div key={idx} className="p-6 rounded-xl bg-slate-800 border border-slate-700 hover:scale-105 transition-transform">
              <div className="p-3 bg-primary/20 text-primary rounded-lg w-fit mb-4">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-200">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Interactive Symptom Map */}
        <div className="py-20">
          <h2 className="text-3xl font-heading font-bold text-center mb-12">Interactive Symptom Guide</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-square max-w-md mx-auto bg-primary/5 rounded-full flex items-center justify-center border border-primary/10">
              <User className="w-64 h-64 text-primary/20" strokeWidth={1} />
              <div className="absolute top-1/4 right-1/4 animate-bounce">
                <div className="group relative">
                  <div className="w-4 h-4 bg-red-500 rounded-full shadow-lg cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-800 rounded-lg text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl">
                    <p className="font-bold mb-1">Hand Tremors</p>
                    <p className="text-gray-300">Involuntary shaking, often starting in a single hand while at rest.</p>
                  </div>
                </div>
              </div>
              <div className="absolute top-1/2 left-1/3">
                <div className="group relative">
                  <div className="w-4 h-4 bg-orange-500 rounded-full shadow-lg cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-800 rounded-lg text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl">
                    <p className="font-bold mb-1">Posture Issues</p>
                    <p className="text-gray-300">Stooped posture or balance problems that increase fall risk.</p>
                  </div>
                </div>
              </div>
              <div className="absolute top-1/3 left-1/2">
                <div className="group relative">
                  <div className="w-4 h-4 bg-blue-500 rounded-full shadow-lg cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-800 rounded-lg text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl">
                    <p className="font-bold mb-1">Speech Changes</p>
                    <p className="text-gray-300">Soft speaking, slurring, or hesitating before talking.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-foreground">Hover to Explore Symptoms</h3>
              <p className="text-lg text-black">Parkinson's affects various parts of the body differently. Use the interactive map to understand key symptoms and their impact.</p>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { label: "Tremors", color: "bg-red-500" },
                  { label: "Posture", color: "bg-orange-500" },
                  { label: "Speech", color: "bg-blue-500" }
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-border">
                    <div className={`w-3 h-3 rounded-full ${s.color}`} />
                    <span className="font-semibold">{s.label} Indicator</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="py-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-heading font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "What is the average age of onset?", a: "Most people develop symptoms after age 60, but about 5-10% experience 'early-onset' before age 50." },
              { q: "Is Parkinson's hereditary?", a: "While most cases are not directly inherited, genetics can play a role in about 10-15% of cases." },
              { q: "Can diet help manage symptoms?", a: "Yes, a healthy diet rich in antioxidants, fiber, and hydration can significantly help manage symptoms and improve medication efficacy." }
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-lg">{item.q}</span>
                  {openFaq === idx ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6 text-gray-600"
                    >
                      {item.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Infographic Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mb-20 overflow-hidden rounded-3xl bg-white shadow-xl border border-border"
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="p-8 md:p-12 space-y-6">
              <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-bold uppercase tracking-wider">
                Clinical Insight
              </div>
              <h2 className="text-4xl font-heading font-bold text-foreground leading-tight">
                Anatomical Impact & <span className="text-primary">Neuro-Degeneration</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Parkinson's primarily affects the substantia nigra, where dopamine-producing neurons are lost. This visualization highlights the critical pathways and regions monitored by our AI models.
              </p>
              <ul className="space-y-4">
                {[
                  { title: "Substantia Nigra", desc: "Primary site of dopamine cell loss" },
                  { title: "Neural Pathways", desc: "Disrupted signaling affecting motor control" },
                  { title: "Dopamine Levels", desc: "Chemical imbalance leading to tremors" }
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{item.title}</h4>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative h-full min-h-[400px]">
              <img 
                src={medicalInfographic} 
                alt="Medical Brain Infographic" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/5 to-white/40 md:to-transparent" />
            </div>
          </div>
        </motion.div>

        {/* New Advanced Feature Access */}
        <div className="py-20">
          <h2 className="text-3xl font-heading font-bold text-center mb-12">Patient Support Ecosystem</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -10 }}
              onClick={() => setLocation("/assist")}
              className="p-8 bg-slate-900 text-white rounded-3xl border border-white/5 shadow-2xl cursor-pointer group"
            >
              <div className="p-4 bg-primary rounded-2xl w-fit mb-6 text-black group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Real-Time Assist</h3>
              <p className="text-gray-400 mb-6">Live tremor detection, voice feedback, and AI-powered movement coaching.</p>
              <Button className="w-full bg-white/10 hover:bg-white/20 border-white/10 group-hover:bg-primary group-hover:text-black">
                Launch Assist
              </Button>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              onClick={() => setLocation("/caregiver")}
              className="p-8 bg-white rounded-3xl border border-border shadow-xl cursor-pointer group"
            >
              <div className="p-4 bg-blue-100 rounded-2xl w-fit mb-6 text-blue-600 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">Caregiver Connect</h3>
              <p className="text-gray-500 mb-6">Share reports, setup emergency alerts, and sync with your medical team.</p>
              <Button variant="outline" className="w-full border-primary text-primary group-hover:bg-primary group-hover:text-black">
                Open Connect
              </Button>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              onClick={() => setLocation("/therapy")}
              className="p-8 bg-primary/10 rounded-3xl border border-primary/20 shadow-xl cursor-pointer group"
            >
              <div className="p-4 bg-primary rounded-2xl w-fit mb-6 text-black group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">Guidance & Therapy</h3>
              <p className="text-gray-600 mb-6">AI-guided speech therapy, hand exercises, and daily wellness tasks.</p>
              <Button className="w-full group-hover:bg-black group-hover:text-white transition-colors">
                Start Therapy
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Motivational Section */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          className="bg-primary text-black rounded-3xl p-12 text-center mb-20 shadow-2xl"
        >
          <Volume2 className="w-12 h-12 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-heading font-bold mb-4">"Parkinson's can be managed, stay active and positive."</h2>
          <p className="text-lg opacity-90 max-w-xl mx-auto">Early detection and proactive lifestyle changes make a world of difference. You are not alone on this journey.</p>
        </motion.div>
      </div>
    </div>
  );
}
