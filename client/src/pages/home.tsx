import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, Brain, Activity, Shield, TrendingUp, 
  BarChart3, Info, AlertTriangle, ChevronDown, 
  ChevronUp, HeartPulse, User, MapPin, 
  Play, Pause, Volume2, X
} from "lucide-react";
import { useLocation } from "wouter";
import { BackendConfigButton } from "@/components/backend-config";
import heroBg from "@assets/generated_images/abstract_medical_ai_network_background.png";
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-cyan-50 to-teal-50 relative overflow-hidden font-sans">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl animate-pulse" />
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
            <Button variant="ghost" onClick={() => setLocation("/")} data-testid="nav-home">Home</Button>
            <Button variant="ghost" onClick={() => setLocation("/prediction")} data-testid="nav-predict">Test</Button>
            <Button variant="ghost" onClick={() => setLocation("/dashboard")} data-testid="nav-dashboard">Dashboard</Button>
          </div>
        </motion.nav>

        {/* Hero Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center py-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                🚀 AI-Powered Healthcare Innovation
              </div>
              <h1 className="text-5xl md:text-7xl font-heading font-bold text-foreground leading-tight mb-4">
                Early Detection of <span className="gradient-text">Parkinson's Disease</span>
              </h1>
              <p className="text-lg text-black leading-relaxed">
                Harness the power of artificial intelligence for early and accurate detection of Parkinson's disease using multimodal analysis.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="px-8 py-6 text-lg shadow-lg hover:shadow-primary/40 rounded-full"
                onClick={() => setLocation("/prediction")}
                data-testid="btn-cta-predict"
              >
                Start Detection
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-6 text-lg rounded-full"
                onClick={() => setShowVideo(true)}
                data-testid="btn-watch-video"
              >
                <Play className="w-5 h-5 mr-2 fill-current" />
                Watch Overview
              </Button>
            </div>

            <AnimatePresence>
              {showVideo && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl"
                  >
                    <button 
                      onClick={() => setShowVideo(false)}
                      className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <video 
                      src={parkinsonsVideo} 
                      controls 
                      autoPlay 
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-2 text-sm text-black">
              <Shield className="w-5 h-5 text-primary" />
              <span>Secure, private, and HIPAA-compliant testing</span>
            </div>
          </motion.div>

          {/* Hero Image / 3D Model */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="hidden md:block h-[500px] relative"
          >
            <div className="absolute inset-0 bg-primary/5 rounded-3xl overflow-hidden shadow-2xl">
              <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <BrainModel />
                <OrbitControls enableZoom={false} />
              </Canvas>
              <div className="absolute bottom-4 left-4 right-4 bg-white/80 backdrop-blur p-4 rounded-xl text-xs text-center border border-primary/20">
                Interactive 3D Neural Visualization - Rotate to explore
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
