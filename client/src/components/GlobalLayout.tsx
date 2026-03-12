import { ReactNode, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Brain, Activity, TestTube, BookOpen, LayoutDashboard, ChevronDown, Stethoscope, Users, FileText, Mic, Hand, Wind, Gamepad2, Video, MessageSquare } from "lucide-react";

interface GlobalLayoutProps {
  children: ReactNode;
}

// Dropdown navigation data
const navDropdowns = [
  {
    id: "overview",
    label: "Overview",
    items: [
      { path: "/", label: "Home", icon: Brain },
      { path: "/education", label: "About Parkinson's", icon: BookOpen },
      { path: "/education#symptoms", label: "Symptoms Guide", icon: Activity },
    ]
  },
  {
    id: "diagnostics",
    label: "Diagnostics",
    items: [
      { path: "/take-test", label: "Take Test", icon: TestTube },
      { path: "/face-analysis", label: "Face Analysis", icon: Video },
      { path: "/spiral-analysis", label: "Spiral Drawing", icon: Hand },
      { path: "/voice-analysis", label: "Voice Analysis", icon: Mic },
    ]
  },
  {
    id: "therapy",
    label: "Therapy Hub",
    items: [
      { path: "/therapy-speech", label: "Speech Therapy", icon: Mic },
      { path: "/therapy/hand", label: "Hand Therapy", icon: Hand },
      { path: "/therapy-breathing", label: "Breathing Exercises", icon: Wind },
      { path: "/guidance-therapy", label: "Physical Therapy", icon: Activity },
      { path: "/brain-games", label: "Brain Games", icon: Gamepad2 },
    ]
  },
  {
    id: "provider",
    label: "Provider Portal",
    items: [
      { path: "/doctor-login", label: "Doctor Login", icon: Users },
      { path: "/doctor-dashboard", label: "Doctor Dashboard", icon: LayoutDashboard },
      { path: "/doctor-patient-view", label: "Patient Records", icon: FileText },
    ]
  },
  {
    id: "resources",
    label: "Resources",
    items: [
      { path: "/education", label: "Education", icon: BookOpen },
      { path: "/find-specialist", label: "Find Specialist", icon: Stethoscope },
      { path: "/ai-chatbot", label: "AI Chatbot", icon: MessageSquare },
    ]
  },
];

export default function GlobalLayout({ children }: GlobalLayoutProps) {
  const [location, setLocation] = useLocation();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const isActive = (path: string) => location === path;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Global Header - Sticky */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setLocation("/")}
            >
              <div className="p-2 bg-primary rounded-lg text-black">
                <Brain className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-white">NeuroScan AI</span>
            </motion.div>

            {/* Navigation Links with Dropdowns */}
            <nav className="hidden md:flex items-center gap-1">
              {navDropdowns.map((dropdown) => (
                <div 
                  key={dropdown.id}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(dropdown.id)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Button
                    variant="ghost"
                    className={`text-white hover:bg-white/10 transition-colors ${
                      openDropdown === dropdown.id ? "bg-white/10 text-primary" : ""
                    }`}
                  >
                    {dropdown.label}
                    <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${openDropdown === dropdown.id ? "rotate-180" : ""}`} />
                  </Button>
                  
                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {openDropdown === dropdown.id && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 mt-1 w-56 bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl overflow-hidden"
                      >
                        {dropdown.items.map((item) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.path}
                              onClick={() => setLocation(item.path)}
                              className={`w-full flex items-center gap-3 px-4 py-3 text-left text-white/80 hover:bg-white/10 hover:text-white transition-colors ${
                                isActive(item.path) ? "bg-white/10 text-primary" : ""
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              <span className="text-sm">{item.label}</span>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Mobile Menu Button - visible on small screens */}
            <Button
              variant="ghost"
              className="md:hidden text-white"
              onClick={() => setLocation("/")}
            >
              <Brain className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content with Glass Container */}
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Glass Container */}
          <div 
            className="rounded-3xl p-6 md:p-8"
            style={{
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.2)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
            }}
          >
            {children}
          </div>
        </div>
      </main>

      {/* Global Footer */}
      <footer className="bg-black/60 backdrop-blur-xl border-t border-white/10 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Logo and Tagline */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-white font-semibold">© 2026 NeuroScan AI</p>
                <p className="text-white/60 text-sm">AI-Powered Parkinson's Disease Detection</p>
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setLocation("/")}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                Home
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setLocation("/education")}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                Education
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setLocation("/find-specialist")}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                Find Specialist
              </Button>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-white/50 text-sm">
              All medical information is for educational purposes only. Always consult healthcare professionals for diagnosis and treatment.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
