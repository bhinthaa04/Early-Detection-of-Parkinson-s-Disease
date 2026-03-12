import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  BookOpen,
  Sparkles,
  Brain,
  Mic,
  Hand,
  Activity,
  Wind,
  LogOut,
  Mail,
  ChevronLeft,
  ChevronDown,
  Home,
  Stethoscope,
  TrendingUp,
  Gamepad2,
  Heart,
  ClipboardList,
  UserCog,
  MapPin,
  Search,
  GraduationCap,
  TestTube,
  HeartPulse,
  type LucideIcon,
} from "lucide-react";
import { useLocation } from "wouter";

type NavItem = {
  label: string;
  path: string;
  icon: LucideIcon;
};

type NavSection = {
  title: string;
  icon: LucideIcon;
  items?: NavItem[];
  path?: string;
};

const navSections: NavSection[] = [
  {
    title: "Home",
    icon: Home,
    path: "/",
  },
  {
    title: "Patient Assessment",
    icon: TestTube,
    items: [
      { label: "Take Test", path: "/take-test", icon: ClipboardList },
      { label: "Real-Time Assist", path: "/real-time-assist", icon: Activity },
      { label: "Futuristic Assessment", path: "/futuristic-assessment", icon: Brain },
      { label: "Postural Sway", path: "/postural-sway", icon: TrendingUp },
    ],
  },
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        items: [
          { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
          { label: "Patient History", path: "/patient-history", icon: History },
          { label: "Progression Forecast", path: "/progression-forecast", icon: TrendingUp },
        ],
      },
  {
    title: "Education & Learning",
    icon: GraduationCap,
    items: [
      { label: "Education", path: "/education", icon: BookOpen },
      { label: "Brain Games", path: "/brain-games", icon: Gamepad2 },
      { label: "AI Chatbot", path: "/ai-chatbot", icon: Sparkles },
    ],
  },
  {
    title: "Therapy & Rehabilitation",
    icon: HeartPulse,
    items: [
      { label: "Guidance Therapy", path: "/guidance-therapy", icon: Stethoscope },
      { label: "Therapy Speech", path: "/therapy-speech", icon: Mic },
      { label: "Therapy Hand", path: "/therapy/hand", icon: Hand },
      { label: "Therapy Breathing", path: "/therapy/breathing", icon: Wind },
      { label: "Therapy Movement", path: "/therapy/movement", icon: Activity },
      { label: "Therapy Spiral", path: "/therapy/spiral", icon: Activity },
    ],
  },
  {
    title: "Patient Support",
    icon: Heart,
    items: [
      { label: "Caregiver Connect", path: "/caregiver-connect", icon: Heart },
      { label: "Daily Tasks", path: "/daily-tasks", icon: ClipboardList },
    ],
  },
  {
    title: "Doctor Portal",
    icon: UserCog,
    items: [
      { label: "Doctor Login", path: "/doctor-login", icon: UserCog },
      { label: "Doctor Dashboard", path: "/doctor-dashboard", icon: LayoutDashboard },
      { label: "Doctor Patient View", path: "/doctor-patient-view", icon: UserCog },
    ],
  },
  {
    title: "Medical Services",
    icon: Stethoscope,
    items: [
      { label: "Find Specialist", path: "/find-specialist", icon: Search },
      { label: "Find Nearby Doctor", path: "/find-nearby-doctor", icon: MapPin },
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
  const [openSection, setOpenSection] = useState<string | null>(null);

  const handleNavigate = (path: string) => {
    setLocation(path);
    onClose();
  };

  const isActivePath = (path: string) => {
    if (path === "/") return location === "/";
    return location === path || location.startsWith(`${path}/`);
  };

  const toggleSection = (title: string) => {
    setOpenSection((current) => (current === title ? null : title));
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
                  {(() => {
                    const hasItems = Boolean(section.items && section.items.length > 0);
                    const isOpen = openSection === section.title;
                    const isActive = hasItems
                      ? section.items?.some((item) => isActivePath(item.path))
                      : section.path
                        ? isActivePath(section.path)
                        : false;

                    return (
                      <>
                        <button
                          onClick={() => {
                            if (hasItems) {
                              toggleSection(section.title);
                            } else if (section.path) {
                              handleNavigate(section.path);
                            }
                          }}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.2em] transition-all ${
                            isActive
                              ? "bg-blue-500/15 text-blue-200"
                              : "text-blue-400/80 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <section.icon className={`h-4 w-4 ${isActive ? "text-blue-300" : "text-blue-500/70"}`} />
                            <span>{section.title}</span>
                          </div>
                          {hasItems ? (
                            <ChevronDown
                              className={`h-4 w-4 text-blue-300/80 transition-transform ${isOpen ? "rotate-180" : ""}`}
                            />
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
                                <div className="mt-2 space-y-1 pl-7">
                                  {section.items?.map((item) => {
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
                              </motion.div>
                            ) : null}
                          </AnimatePresence>
                        ) : null}
                      </>
                    );
                  })()}
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

