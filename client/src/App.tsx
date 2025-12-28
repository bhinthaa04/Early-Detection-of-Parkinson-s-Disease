import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import Home from "@/pages/home";
import Prediction from "@/pages/prediction";
import Result from "@/pages/result";
import Dashboard from "@/pages/dashboard";
import Analysis from "@/pages/analysis";
import RealTimeAssist from "@/pages/real-time-assist";
import CaregiverConnect from "@/pages/caregiver-connect";
import GuidanceTherapy from "@/pages/guidance-therapy";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/prediction" component={Prediction} />
      <Route path="/analysis" component={Analysis} />
      <Route path="/result" component={Result} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/assist" component={RealTimeAssist} />
      <Route path="/caregiver" component={CaregiverConnect} />
      <Route path="/therapy" component={GuidanceTherapy} />
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
