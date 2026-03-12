import { Switch, Route, useLocation } from "wouter";
import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import BackgroundAnimation from "@/components/BackgroundAnimation";
import { Menu } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { NavigationSidebar } from "@/components/NavigationSidebar";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Prediction from "@/pages/prediction";
import RealTimeAssist from "@/pages/real-time-assist";
import FuturisticAssessment from "@/pages/futuristic-assessment";
import CaregiverConnect from "@/pages/caregiver-connect";
import GuidanceTherapy from "@/pages/guidance-therapy";
import SpeechClarity from "@/pages/therapy-speech";
import HandStability from "@/pages/therapy-hand";
import BreathingRelaxation from "@/pages/therapy-breathing";
import MovementRoutine from "@/pages/therapy-movement";
import SpiralTest from "@/pages/therapy-spiral";
import BrainGames from "@/pages/brain-games";
import AIChatbot from "@/pages/ai-chatbot";
import DoctorLogin from "@/pages/doctor-login";
import DoctorDashboard from "@/pages/doctor-dashboard";
import DoctorPatientView from "@/pages/doctor-patient-view";
import ProgressionForecast from "@/pages/progression-forecast";
import Education from "@/pages/education";
import FindSpecialist from "@/pages/find-specialist";
import PosturalSwayAnalysis from "@/pages/postural-sway-analysis";
import DailyTasks from "@/pages/daily-tasks";
import NotFound from "@/pages/not-found";
import PatientForm from "@/pages/patient-form";
import FindNearbyDoctor from "@/pages/find-nearby-doctor";
import { MainFooter } from "@/components/main-footer";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/education" component={Education} />
      <Route path="/brain-games" component={BrainGames} />
      <Route path="/ai-chatbot" component={AIChatbot} />
      <Route path="/take-test" component={Prediction} />
      <Route path="/real-time-assist" component={RealTimeAssist} />
      <Route path="/futuristic-assessment" component={FuturisticAssessment} />
      <Route path="/caregiver-connect" component={CaregiverConnect} />
      <Route path="/guidance-therapy" component={GuidanceTherapy} />
      <Route path="/therapy-speech" component={SpeechClarity} />
      <Route path="/therapy-speech" component={SpeechClarity} />
      <Route path="/therapy/hand" component={HandStability} />
      <Route path="/therapy-breathing" component={BreathingRelaxation} />
      <Route path="/therapy/breathing" component={BreathingRelaxation} />
      <Route path="/therapy/movement" component={MovementRoutine} />
      <Route path="/therapy/spiral" component={SpiralTest} />
      <Route path="/doctor-login" component={DoctorLogin} />
      <Route path="/doctor-dashboard" component={DoctorDashboard} />
      <Route path="/doctor-patient-view" component={DoctorPatientView} />
      <Route path="/doctor-patient" component={DoctorPatientView} />
      <Route path="/progression-forecast" component={ProgressionForecast} />
      <Route path="/find-specialist" component={FindSpecialist} />
      <Route path="/postural-sway" component={PosturalSwayAnalysis} />
      <Route path="/daily-tasks" component={DailyTasks} />
      <Route path="/patient-history" component={Dashboard} />
      <Route path="/patient-form" component={PatientForm} />
      <Route path="/find-nearby-doctor" component={FindNearbyDoctor} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Note: Dashboard import is missing, we need to add it
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const footerHiddenPrefixes = [
    "/patient-form",
  ];
  const hideFooter = footerHiddenPrefixes.some(
    (prefix) => location === prefix || location.startsWith(`${prefix}/`),
  );
  const hideBackButton = location === "/";
  const hideSidebarTrigger = location === "/";

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <BackgroundAnimation />
          {!hideBackButton && <BackButton />}
          {!hideSidebarTrigger && (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="fixed right-4 top-4 z-50 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur transition hover:bg-white hover:text-slate-900"
              aria-label="Open navigation"
            >
              <Menu className="h-4 w-4" />
              Menu
            </button>
          )}
          <NavigationSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            profileEmail="support@neuroscan.ai"
            onSignOut={() => setLocation("/login")}
          />
          <div className="relative z-10 flex min-h-screen flex-col">
            <div className="flex-1">
              <Router />
            </div>
            {!hideFooter && <MainFooter />}
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;

