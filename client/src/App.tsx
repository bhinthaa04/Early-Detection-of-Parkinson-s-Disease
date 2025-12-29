import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import Home from "@/pages/home";
import Education from "@/pages/education";
import Prediction from "@/pages/prediction";
import Result from "@/pages/result";
import Dashboard from "@/pages/dashboard";
import Analysis from "@/pages/analysis";
import RealTimeAssist from "@/pages/real-time-assist";
import CaregiverConnect from "@/pages/caregiver-connect";
import GuidanceTherapy from "@/pages/guidance-therapy";
import SpeechClarity from "@/pages/therapy-speech";
import HandStability from "@/pages/therapy-hand";
import BreathingRelaxation from "@/pages/therapy-breathing";
import MovementRoutine from "@/pages/therapy-movement";
import AwarenessLearning from "@/pages/therapy-awareness";
import SpiralTest from "@/pages/therapy-spiral";
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
      <Route path="/caregiver" component={CaregiverConnect} />
      <Route path="/therapy" component={GuidanceTherapy} />
      <Route path="/therapy/speech" component={SpeechClarity} />
      <Route path="/therapy/hand" component={HandStability} />
      <Route path="/therapy/breathing" component={BreathingRelaxation} />
      <Route path="/therapy/movement" component={MovementRoutine} />
      <Route path="/therapy/awareness" component={AwarenessLearning} />
      <Route path="/therapy/spiral" component={SpiralTest} />
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
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
