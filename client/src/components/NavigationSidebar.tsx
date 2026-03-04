import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  BookOpen, 
  Sparkles,
  User,
  Brain,
  BarChart3,
  Mic,
  Hand,
  Activity,
  Wind,
  LogOut,
  Mail,
  ChevronLeft
} from "lucide-react";
import { useLocation } from "wouter";

type NavItem = {
  label: string;
  path: string;
  icon: React.ElementType;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    title: "OVERVIEW",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { label: "Education", path: "/education", icon: BookOpen },
      { label: "Chatbot", path: "/ai-chatbot", icon: Sparkles },
    ],
  },
  {
    title: "DIAGNOSTICS",
    items: [
      { label: "Patient Form", path: "/patient-form", icon: User },
      { label: "Prediction", path: "/prediction", icon: Brain },
      { label: "Analysis", path: "/analysis", icon: BarChart3 },
    ],
  },
  {
    title: "THERAPY HUB",
    items: [
      { label: "Speech Therapy", path: "/therapy/speech", icon: Mic },
      { label: "Hand Therapy", path: "/therapy/hand", icon: Hand },
      { label: "Spiral Therapy", path: "/therapy/spiral", icon: Activity },
      { label: "Breathing Therapy", path: "/therapy/breathing", icon: Wind },
    ],
  },
];

interface NavigationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  profileEmail: string;
  onSignOut: () => void;
}

export function NavigationSidebar({ isOpen, onClose, profileEmail, onSignOut }: NavigationSidebarProps) {
  const [location, setLocation] = useLocation();

  const handleNavigate = (path: string) => {
    setLocation(path);
    onClose();
  };

  const isActivePath = (path: string) => {
    if (path === "/") return location === "/";
    return location === path || location.startsWith(`${path}/`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed inset-y-0 left-0 z-50 flex w-[300px] flex-col"
            style={{
              background: "linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(5, 10, 30, 0.98) 100%)",
              backdropFilter: "blur(20px)",
              borderRight: "1px solid rgba(59, 130, 246, 0.2)",
              boxShadow: "4px 0 30px rgba(0, 0, 0, 0.5)"
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-blue-500/20">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                    boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)"
                  }}
                >
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-base font-bold text-white">NeuroScan AI</p>
                  <p className="text-[10px] text-blue-400 uppercase tracking-wider">Parkinson's Predictor</p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={onClose}
                className="h-9 w-9 rounded-lg p-0 text-slate-300 hover:text-white hover:bg-white/10"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {navSections.map((section, sectionIdx) => (
                <div key={section.title} className={sectionIdx > 0 ? "mt-6" : ""}>
                  <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400/70 px-2">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const active = isActivePath(item.path);
                      return (
                        <button
                          key={item.path}
                          onClick={() => handleNavigate(item.path)}
                          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left text-sm transition-all duration-200 ${
                            active
                              ? "bg-blue-500/20 text-blue-300 border-l-2 border-blue-400"
                              : "text-slate-300 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <item.icon className={`w-4 h-4 ${active ? "text-blue-400" : "text-slate-500"}`} />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-blue-500/20 px-4 py-4">
              <div className="flex items-center gap-2 mb-3 px-2">
                <Mail className="w-4 h-4 text-slate-500" />
                <span className="text-xs text-slate-400 truncate">{profileEmail}</span>
              </div>
              <Button
                variant="outline"
                onClick={onSignOut}
                className="w-full border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:text-red-200 text-sm py-2"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
