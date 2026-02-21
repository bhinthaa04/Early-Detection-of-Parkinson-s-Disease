import { ReactNode } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Brain, Activity, TestTube, BookOpen, LayoutDashboard } from "lucide-react";

interface GlobalLayoutProps {
  children: ReactNode;
}

export default function GlobalLayout({ children }: GlobalLayoutProps) {
  const [location, setLocation] = useLocation();

  const navLinks = [
    { path: "/", label: "Home", icon: Brain },
    { path: "/prediction", label: "Test", icon: TestTube },
    { path: "/assessment", label: "Assessment", icon: Activity },
    { path: "/education", label: "Education", icon: BookOpen },
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

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

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Button
                    key={link.path}
                    variant="ghost"
                    onClick={() => setLocation(link.path)}
                    className={`text-white hover:bg-white/10 transition-colors ${
                      isActive(link.path) ? "bg-white/10 text-primary" : ""
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {link.label}
                  </Button>
                );
              })}
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
