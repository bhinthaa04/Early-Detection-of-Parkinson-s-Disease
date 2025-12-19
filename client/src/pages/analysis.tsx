import { useEffect } from "react";
import { useLocation } from "wouter";
import { AIAnalysisScreen } from "@/components/ai-analysis-screen";
import { StepProgress } from "@/components/step-progress";

export default function Analysis() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Simulate analysis completion after 5-8 seconds
    const timeout = setTimeout(() => {
      setLocation("/result");
    }, 6000 + Math.random() * 2000);

    return () => clearTimeout(timeout);
  }, [setLocation]);

  const steps = [
    { id: 1, label: "Upload", icon: "📤" },
    { id: 2, label: "Analyze", icon: "🔬" },
    { id: 3, label: "Results", icon: "📊" },
    { id: 4, label: "Report", icon: "📄" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-cyan-50 to-teal-50 relative overflow-hidden font-sans">
      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        <div className="mb-12">
          <StepProgress steps={steps} currentStep={2} />
        </div>
        <AIAnalysisScreen />
      </div>
    </div>
  );
}
