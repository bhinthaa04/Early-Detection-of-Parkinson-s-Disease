import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import BackgroundAnimation from "@/components/BackgroundAnimation";
import Home from "@/pages/home";
import Education from "@/pages/education";
import Prediction from "@/pages/prediction";
import Result from "@/pages/result";
import Dashboard from "@/pages/dashboard";
import Analysis from "@/pages/analysis";
import RealTimeAssist from "@/pages/real-time-assist";
import MultiModalAssessment from "@/pages/multi-modal-assessment";
import FuturisticAssessment from "@/pages/futuristic-assessment";
import CaregiverConnect from "@/pages/caregiver-connect";
import GuidanceTherapy from "@/pages/guidance-therapy";
import SpeechClarity from "@/pages/therapy-speech";
import HandStability from "@/pages/therapy-hand";
import BreathingRelaxation from "@/pages/therapy-breathing";
import MovementRoutine from "@/pages/therapy-movement";
import AwarenessLearning from "@/pages/therapy-awareness";
import SpiralTest from "@/pages/therapy-spiral";
import BrainGames from "@/pages/brain-games";
import AIChatbot from "@/pages/ai-chatbot";
import FindSpecialist from "@/pages/find-specialist";
import PosturalSwayAnalysis from "@/pages/postural-sway-analysis";
import DailyTasks from "@/pages/daily-tasks";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/education" component={Education} />
      <Route path="/prediction" component={Prediction} />
      <Route path="/analysis" component={Analysis} />
      <Route path="/result" component={Result} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/assist" component={RealTimeAssist} />
      <Route path="/assessment" component={MultiModalAssessment} />
      <Route path="/futuristic-assessment" component={FuturisticAssessment} />
      <Route path="/caregiver" component={CaregiverConnect} />
      <Route path="/therapy" component={GuidanceTherapy} />
      <Route path="/therapy/speech" component={SpeechClarity} />
      <Route path="/therapy/hand" component={HandStability} />
      <Route path="/therapy/breathing" component={BreathingRelaxation} />
      <Route path="/therapy/movement" component={MovementRoutine} />
      <Route path="/therapy/awareness" component={AwarenessLearning} />
      <Route path="/therapy/spiral" component={SpiralTest} />
      <Route path="/brain-games" component={BrainGames} />
      <Route path="/ai-chatbot" component={AIChatbot} />
      <Route path="/find-specialist" component={FindSpecialist} />
      <Route path="/postural-sway" component={PosturalSwayAnalysis} />
      <Route path="/daily-tasks" component={DailyTasks} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <BackgroundAnimation />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
