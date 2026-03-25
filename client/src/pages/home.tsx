import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, Brain, Activity, Shield, TrendingUp, 
  BarChart3, Info, AlertTriangle, ChevronDown, 
  ChevronUp, HeartPulse, User, MapPin, 
  Play, X, Sparkles, Users, BookOpen, Menu,
  Home as HomeIcon, TestTube, GraduationCap, Stethoscope, UserCog, Search, ClipboardList, MessageSquare, ClipboardCheck, History, LayoutDashboard
} from "lucide-react";

import { useLocation } from "wouter";
import { BackendConfigButton } from "@/components/backend-config";
import heroBg from "@assets/generated_images/hopeful_medical_background_with_brain_waves_and_pulses.png";
import parkinsonsBrainImg from "@assets/generated_images/3d_parkinsons_brain_visualization.png";
import medicalInfographic from "@assets/generated_images/medical_brain_infographic.png";
import { useState, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Sphere, MeshDistortMaterial } from "@react-three/drei";
import parkinsonsVideo from "@assets/generated_videos/parkinsons_edu.mp4";

function BrainModel() {
  const meshRef = useRef<any>(null);
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 100, 100]} scale={1.5}>
        <MeshDistortMaterial
          color="hsl(154, 61%, 37%)"
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
  const [location, setLocation] = useLocation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [severity, setSeverity] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSidebarSection, setOpenSidebarSection] = useState<string | null>(null);

  const sidebarSections = [
    {
      title: "Home",
      icon: HomeIcon,
      path: "/",
    },
    {
      title: "Patient Assessment",
      icon: TestTube,
      items: [
        { label: "Take Test", path: "/take-test" },
        { label: "Real-Time Assist", path: "/real-time-assist" },
        { label: "Futuristic Assessment", path: "/futuristic-assessment" },
      ],
    },
    {
      title: "Dashboard",
      icon: BarChart3,
      items: [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Progression Forecast", path: "/progression-forecast" },
      ],
    },
    {
      title: "Education & Learning",
      icon: GraduationCap,
      items: [
        { label: "Education", path: "/education" },
        { label: "Brain Games", path: "/brain-games" },
        { label: "AI Chatbot", path: "/ai-chatbot" },
      ],
    },
    {
      title: "Therapy & Rehabilitation",
      icon: HeartPulse,
      items: [
        { label: "Guidance Therapy", path: "/guidance-therapy" },
        { label: "Therapy Speech", path: "/therapy-speech" },
        { label: "Therapy Hand", path: "/therapy/hand" },
        { label: "Therapy Breathing", path: "/therapy/breathing" },
        { label: "Therapy Movement", path: "/therapy/movement" },
        { label: "Therapy Spiral", path: "/therapy/spiral" },
      ],
    },
    {
      title: "Patient Support",
      icon: Users,
      items: [
        { label: "Caregiver Connect", path: "/caregiver-connect" },
        { label: "Daily Tasks", path: "/daily-tasks" },
      ],
    },
    {
      title: "Doctor Portal",
      icon: UserCog,
      items: [
        { label: "Doctor Login", path: "/doctor-login" },
        { label: "Doctor Dashboard", path: "/doctor-dashboard" },
        { label: "Doctor Patient View", path: "/doctor-patient-view" },
      ],
    },
    {
      title: "Medical Services",
      icon: Stethoscope,
      items: [
        { label: "Find Nearby Doctor", path: "/find-nearby-doctor" },
      ],
    },
  ];

  const toggleSidebarSection = (title: string) => {
    setOpenSidebarSection((current) => (current === title ? null : title));
  };

  const isActivePath = (path: string) => {
    if (path === "/") return location === "/";
    return location === path || location.startsWith(`${path}/`);
  };

  const stages = [
    { label: "Early Stage", color: "text-green-500", icon: "🟢", desc: "Mild symptoms, often overlooked. Tremors might start." },
    { label: "Mid Stage", color: "text-orange-500", icon: "🟠", desc: "Symptoms become more obvious. Balance and coordination affected." },
    { label: "Advanced Stage", color: "text-red-500", icon: "🔴", desc: "Significant mobility issues. Requires assistance for daily tasks." }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden font-sans flex flex-col">
      {/* Dynamic Medical AI Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 transition-opacity duration-1000"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      
      {/* Animated Medical Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: [0, 50, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -30, 0],
            opacity: [0.05, 0.2, 0.05],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-400/10 rounded-full blur-[100px]"
        />
        
        {/* Floating ECG/Wave lines (SVG Overlays) */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <motion.path
            d="M0 100 Q 250 50 500 100 T 1000 100"
            stroke="currentColor"
            strokeWidth="1"
            fill="transparent"
            className="text-primary"
            animate={{
              x: [-20, 20, -20],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </svg>
      </div>

      <BackendConfigButton />

      <div className="container mx-auto px-4 relative z-10 flex-1">
        {/* Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-6 flex justify-between items-center sticky top-0 z-50 backdrop-blur bg-slate-900/60 rounded-2xl px-4"
        >
          <div className="flex items-center gap-3">
            <button
              className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary rounded-lg text-white">
                <Brain className="w-6 h-6" />
              </div>
              <span className="text-2xl font-heading font-bold text-cyan-300">
                NeuroScan AI
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-white/10" onClick={() => setLocation("/ai-chatbot")} data-testid="nav-ai-chatbot">
              <MessageSquare className="h-4 w-4" />
              AI Chat
            </Button>
            <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-white/10" onClick={() => setLocation("/take-test")} data-testid="nav-predict">
              <ClipboardCheck className="h-4 w-4" />
              Take Test
            </Button>
            <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-white/10" onClick={() => setLocation("/patient-history")}>
              <History className="h-4 w-4" />
              Patient History
            </Button>
            <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-white/10" onClick={() => setLocation("/dashboard")} data-testid="nav-dashboard">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
          </div>
        </motion.nav>

        {/* Sidebar overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-black/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                className="fixed top-0 left-0 z-50 h-full w-80 bg-slate-900/95 backdrop-blur-xl border-r border-white/10 p-6 overflow-y-auto"
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-white">
                    <Brain className="w-5 h-5 text-cyan-300" />
                    <span className="font-heading font-semibold">All Navigation</span>
                  </div>
                  <button
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Close sidebar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-5">
                  {sidebarSections.map((section) => {
                    const hasItems = Boolean(section.items && section.items.length > 0);
                    const isOpen = openSidebarSection === section.title;
                    const isActive = hasItems
                      ? section.items?.some((item) => isActivePath(item.path))
                      : section.path
                        ? isActivePath(section.path)
                        : false;
                    const Icon = section.icon;

                    return (
                      <div key={section.title}>
                        <button
                          onClick={() => {
                            if (hasItems) {
                              toggleSidebarSection(section.title);
                            } else if (section.path) {
                              setLocation(section.path);
                              setSidebarOpen(false);
                            }
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] transition ${
                            isActive
                              ? "bg-cyan-400/15 text-cyan-200 border border-cyan-300/30"
                              : "bg-white/5 text-cyan-200/80 border border-white/5 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <Icon className="h-4 w-4 text-cyan-200/90" />
                            {section.title}
                          </span>
                          {hasItems ? (
                            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                          ) : null}
                        </button>

                        {hasItems ? (
                          <AnimatePresence initial={false}>
                            {isOpen ? (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="overflow-hidden"
                              >
                                <div className="mt-2 space-y-2 pl-5">
                                  {section.items?.map((item) => {
                                    const activeItem = isActivePath(item.path);
                                    return (
                                      <button
                                        key={item.path}
                                        onClick={() => {
                                          setLocation(item.path);
                                          setSidebarOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition ${
                                          activeItem
                                            ? "bg-cyan-400/15 text-white border border-cyan-300/30"
                                            : "bg-white/5 text-white/80 border border-white/5 hover:bg-white/10 hover:text-white"
                                        }`}
                                      >
                                        {item.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            ) : null}
                          </AnimatePresence>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Hero Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center py-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-cyan-200 text-sm font-medium mb-4">
                🚀 AI-Powered Healthcare Innovation
              </div>
              <h1 className="text-5xl md:text-7xl font-heading font-bold text-white leading-tight mb-4">
                Early Detection of <span className="text-cyan-300">Parkinson's Disease</span>
              </h1>
              <p className="text-lg text-gray-200 leading-relaxed">
                Harness the power of artificial intelligence for early and accurate detection of Parkinson's disease using multimodal analysis.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="px-8 py-6 text-lg shadow-lg hover:shadow-primary/40 rounded-full"
                onClick={() => setLocation("/patient-form")}
                data-testid="btn-cta-predict"
              >
                Start Detection
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-6 text-lg rounded-full bg-white text-blue-900 border-white hover:bg-blue-50"
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

            <div className="flex items-center gap-2 text-sm text-gray-200">
              <Shield className="w-5 h-5 text-primary" />
              <span>Secure, private, and HIPAA-compliant testing</span>
            </div>
          </motion.div>

          {/* Hero Image / Brain Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="hidden md:block h-[500px] relative"
          >
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl border border-primary/20">
              <img 
                src={parkinsonsBrainImg} 
                alt="3D Parkinson's Brain" 
                className="w-full h-full object-contain p-8 animate-float"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white/80 backdrop-blur p-4 rounded-xl text-xs text-center border border-primary/20">
                AI Visualization of Substantia Nigra Degeneration
              </div>
            </div>
          </motion.div>
        </div>

        {/* Severity Slider Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="bg-gray-100 rounded-3xl p-8 md:p-12 mb-20 border border-gray-300 shadow-lg"
        >
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-heading font-bold mb-8 text-gray-800">Symptom Severity Preview</h2>
            <div className="mb-12">
              <input 
                type="range" 
                min="0" 
                max="2" 
                step="1" 
                value={severity} 
                onChange={(e) => setSeverity(parseInt(e.target.value))}
                className="w-full h-3 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between mt-4">
                {stages.map((s, i) => (
                  <span key={i} className={`text-sm font-bold ${severity === i ? s.color : 'text-gray-500'}`}>
                    {s.label}
                  </span>
                ))}
              </div>
            </div>
            <motion.div 
              key={severity}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 bg-white rounded-2xl border border-gray-200 shadow-xl"
            >
              <div className="text-5xl mb-4">{stages[severity].icon}</div>
              <h3 className={`text-2xl font-bold mb-4 ${stages[severity].color}`}>{stages[severity].label}</h3>
              <p className="text-gray-700 text-lg">{stages[severity].desc}</p>
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
          <h2 className="text-3xl font-heading font-bold text-center mb-12 text-white">Interactive Symptom Guide</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-square max-w-md mx-auto rounded-full flex items-center justify-center border border-white/80 bg-white/90 shadow-2xl backdrop-blur-sm">
              <div className="absolute inset-6 rounded-full border border-slate-300/80" />
              <User className="relative z-10 w-64 h-64 text-slate-500/70" strokeWidth={1.2} />
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
              <h3 className="text-2xl font-bold text-white">Hover to Explore Symptoms</h3>
              <p className="text-lg text-gray-300">Parkinson's affects various parts of the body differently. Use the interactive map to understand key symptoms and their impact.</p>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { label: "Tremors", color: "bg-red-500" },
                  { label: "Posture", color: "bg-orange-500" },
                  { label: "Speech", color: "bg-blue-500" }
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-3 p-4 bg-slate-800 rounded-xl shadow-sm border border-slate-700">
                    <div className={`w-3 h-3 rounded-full ${s.color}`} />
                    <span className="font-semibold text-white">{s.label} Indicator</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="py-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-heading font-bold text-center mb-12 text-white">Frequently Asked Questions</h2>
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
          <h2 className="text-3xl font-heading font-bold text-center mb-12 text-white">Patient Support Ecosystem</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -10 }}
              onClick={() => setLocation("/real-time-assist")}
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
              onClick={() => setLocation("/caregiver-connect")}
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
              onClick={() => setLocation("/guidance-therapy")}
              className="p-8 bg-slate-900 rounded-3xl border border-white/10 shadow-xl cursor-pointer group"
            >
              <div className="p-4 bg-primary rounded-2xl w-fit mb-6 text-black group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Guidance & Therapy</h3>
              <p className="text-gray-300 mb-6">AI-guided speech therapy, hand exercises, and daily wellness tasks.</p>
              <Button className="w-full bg-white text-black hover:bg-blue-600 hover:text-white transition-colors">
                Start Therapy
              </Button>
            </motion.div>
          </div>
        </div>

      </div>
    </div>
  );
}

