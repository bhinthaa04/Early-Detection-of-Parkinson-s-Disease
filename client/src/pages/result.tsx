import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, FileDown, Home, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { DiseaseStageCard } from "@/components/disease-stage-card";
import { Precautions } from "@/components/precautions";
import { DoctorCTA } from "@/components/doctor-cta";
import { EmergencyAlert } from "@/components/emergency-alert";
import { apiService, PredictionResponse } from "@/lib/api-service";
import { StepProgress } from "@/components/step-progress";
import { BackendConfigButton } from "@/components/backend-config";
import heroBg from "@assets/generated_images/hopeful_medical_background_with_brain_waves_and_pulses.png";

export default function Result() {
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const storedResult = sessionStorage.getItem('predictionResult');
    if (storedResult) {
      try {
        setResult(JSON.parse(storedResult));
      } catch {
        setLocation("/prediction");
      }
    } else {
      setLocation("/prediction");
    }
  }, [setLocation]);

  const handleDownloadReport = async () => {
    if (!result) return;
    
    setDownloadingReport(true);
    try {
      const blob = await apiService.downloadReport(result);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `parkinson-report-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "Report downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download report",
        variant: "destructive",
      });
    } finally {
      setDownloadingReport(false);
    }
  };

  if (!result) {
    return null;
  }

  const isPositive = result.prediction;
  const confidencePercent = Math.round(result.confidence * 100);
  const Icon = isPositive ? AlertCircle : CheckCircle;
  const colorClass = isPositive ? 'text-red-600' : 'text-green-600';
  const bgClass = isPositive ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20';
  const borderClass = isPositive ? 'border-red-200 dark:border-red-800' : 'border-green-200 dark:border-green-800';

  const steps = [
    { id: 1, label: "Upload", icon: "📤" },
    { id: 2, label: "Analyze", icon: "🔬" },
    { id: 3, label: "Results", icon: "📊" },
    { id: 4, label: "Report", icon: "📄" },
  ];

  // Timeline stages
  const stages = ["Healthy", "Early", "Mid", "Advanced"];
  const currentStageIndex = stages.indexOf(result.stage === "Healthy" && !isPositive ? "Healthy" : result.stage);

  return (
    <div className="min-h-screen relative overflow-hidden font-sans">
      {/* Dynamic Medical AI Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-30 pointer-events-none"
        style={{ backgroundImage: `url(${heroBg})` }}
      />

      <BackendConfigButton />
      <EmergencyAlert 
        confidence={result.confidence} 
        prediction={isPositive}
        onClose={() => setShowEmergencyAlert(true)}
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        <div className="mb-12">
          <StepProgress steps={steps} currentStep={3} />
        </div>

        {/* Result Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={`border-2 ${bgClass} ${borderClass} mb-8 shadow-lg`}>
            <CardContent className="p-8">
              <div className="flex items-start gap-6 mb-8">
                <div className={`p-4 ${colorClass} bg-white dark:bg-slate-800 rounded-full shadow-lg`}>
                  <Icon className="w-12 h-12" />
                </div>
                <div className="flex-1">
                  <h1 className={`text-4xl font-heading font-bold ${colorClass} mb-2`}>
                    {isPositive ? "Parkinson's Detected" : "Healthy Control"}
                  </h1>
                  <p className="text-lg text-gray-200">
                    {isPositive
                      ? "The analysis has detected indicators consistent with Parkinson's disease."
                      : "The analysis shows no significant indicators of Parkinson's disease."}
                  </p>
                </div>
              </div>

              {/* Confidence Gauge & Timeline */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Gauge */}
                <div className="bg-white/90 dark:bg-slate-800/90 rounded-xl p-6 border border-white/20 shadow-sm text-center">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">AI CONFIDENCE SCORE</p>
                  <div className="relative w-48 h-24 mx-auto mb-4 overflow-hidden">
                    <div className="absolute w-48 h-48 rounded-full border-[12px] border-gray-100 dark:border-slate-700 box-border top-0 left-0" />
                    <motion.div 
                      className={`absolute w-48 h-48 rounded-full border-[12px] border-transparent box-border top-0 left-0 ${isPositive ? 'border-t-red-500 border-r-red-500' : 'border-t-green-500 border-r-green-500'}`}
                      style={{ rotate: -45 }}
                      initial={{ rotate: -135 }}
                      animate={{ rotate: -135 + (confidencePercent * 1.8) }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
                      <span className="text-4xl font-bold">{confidencePercent}%</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">Probability of accuracy based on model training</p>
                </div>

                {/* Timeline */}
                <div className="bg-white/90 dark:bg-slate-800/90 rounded-xl p-6 border border-white/20 shadow-sm">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-6">DISEASE PROGRESSION STAGE</p>
                  <div className="relative pt-4">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 transform -translate-y-1/2 rounded-full" />
                    <div className="flex justify-between relative z-10">
                      {stages.map((stage, idx) => {
                         const isActive = stage === result.stage || (result.stage === "Healthy" && stage === "Healthy");
                         const isPast = stages.indexOf(result.stage) >= idx;
                         
                         return (
                          <div key={stage} className="flex flex-col items-center gap-2">
                            <motion.div
                              className={`w-4 h-4 rounded-full border-2 ${isActive ? 'bg-primary border-primary scale-125' : isPast ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}
                              initial={{ scale: 0 }}
                              animate={{ scale: isActive ? 1.25 : 1 }}
                              transition={{ delay: 0.5 + (idx * 0.1) }}
                            />
                            <span className={`text-xs font-medium ${isActive ? 'text-primary font-bold' : 'text-gray-700'}`}>
                              {stage}
                            </span>
                          </div>
                         )
                      })}
                    </div>
                  </div>
                  <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-300 text-center font-medium">
                      Current Assessment: {result.stage} Stage
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 flex-wrap justify-center border-t border-border/50 pt-8">
                <Button
                  size="lg"
                  className="rounded-full px-8 shadow-md"
                  onClick={handleDownloadReport}
                  disabled={downloadingReport}
                  data-testid="btn-download-report"
                >
                  <FileDown className="w-5 h-5 mr-2" />
                  {downloadingReport ? 'Generating PDF...' : 'Download Medical Report'}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8"
                  onClick={() => setLocation("/prediction")}
                  data-testid="btn-new-test"
                >
                  Run Another Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

{/* Disease Stage Card */}
        {isPositive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            {/* Cast stage to the specific subset the component expects */}
            <DiseaseStageCard stage={result.stage as "Early" | "Mid" | "Advanced"} />
          </motion.div>
        )}

        {/* Precautions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          {/* If isPositive is false, result.stage is "Healthy". 
              We use a ternary to pass "Early" as a fallback or cast it if we know it's positive */}
          <Precautions stage={isPositive ? (result.stage as "Early" | "Mid" | "Advanced") : "Early"} />
        </motion.div>

        {/* Doctor CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <DoctorCTA 
            stage={isPositive ? (result.stage as "Early" | "Mid" | "Advanced") : "Early"} 
            urgency={result.confidence > 0.85} 
          />
        </motion.div>
      </div>
    </div>
  );
}
