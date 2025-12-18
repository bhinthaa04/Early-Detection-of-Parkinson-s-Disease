import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, FileDown, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { DiseaseStageCard } from "@/components/disease-stage-card";
import { Precautions } from "@/components/precautions";
import { DoctorCTA } from "@/components/doctor-cta";
import { apiService, PredictionResponse } from "@/lib/api-service";

export default function Result() {
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [downloadingReport, setDownloadingReport] = useState(false);
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
  const confidencePercent = (result.confidence * 100).toFixed(1);
  const Icon = isPositive ? AlertCircle : CheckCircle;
  const colorClass = isPositive ? 'text-red-600' : 'text-green-600';
  const bgClass = isPositive ? 'bg-red-50' : 'bg-green-50';
  const borderClass = isPositive ? 'border-red-200' : 'border-green-200';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 relative overflow-hidden font-sans">
      {/* Background */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl relative z-10">
        {/* Result Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={`border-2 ${bgClass} ${borderClass} mb-8 shadow-lg`}>
            <CardContent className="p-8">
              <div className="flex items-start gap-6 mb-6">
                <div className={`p-4 ${colorClass} bg-white rounded-full shadow-lg`}>
                  <Icon className="w-12 h-12" />
                </div>
                <div className="flex-1">
                  <h1 className={`text-4xl font-heading font-bold ${colorClass} mb-2`}>
                    {isPositive ? "Parkinson's Detected" : "Healthy"}
                  </h1>
                  <p className="text-lg text-gray-700">
                    {isPositive
                      ? "The analysis has detected indicators consistent with Parkinson's disease."
                      : "The analysis shows no significant indicators of Parkinson's disease."}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg p-6 border border-border">
                  <p className="text-sm text-gray-600 mb-2">Confidence Score</p>
                  <div className="flex items-end gap-3">
                    <span className="text-4xl font-heading font-bold text-foreground">
                      {confidencePercent}%
                    </span>
                    <div className="flex-1 h-12 bg-muted rounded-lg overflow-hidden">
                      <motion.div
                        className={`h-full ${isPositive ? 'bg-red-500' : 'bg-green-500'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${result.confidence * 100}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-border">
                  <p className="text-sm text-gray-600 mb-2">Predicted Stage</p>
                  <div className="text-3xl font-heading font-bold text-primary">
                    {result.stage} Stage
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {result.stage === 'Early' && 'Early symptoms detected'}
                    {result.stage === 'Mid' && 'Progressive symptoms present'}
                    {result.stage === 'Advanced' && 'Advanced progression detected'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 flex-wrap">
                <Button
                  className="rounded-full px-6"
                  onClick={handleDownloadReport}
                  disabled={downloadingReport}
                  data-testid="btn-download-report"
                >
                  <FileDown className="w-5 h-5 mr-2" />
                  {downloadingReport ? 'Downloading...' : 'Download Report'}
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full px-6"
                  onClick={() => setLocation("/prediction")}
                  data-testid="btn-new-test"
                >
                  Run Another Test
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full px-6"
                  onClick={() => setLocation("/")}
                  data-testid="btn-home"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Back to Home
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
            <DiseaseStageCard stage={result.stage} />
          </motion.div>
        )}

        {/* Precautions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Precautions stage={result.stage} />
        </motion.div>

        {/* Doctor CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <DoctorCTA stage={result.stage} urgency={result.confidence > 0.85} />
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-sm text-gray-700"
        >
          <p className="font-semibold text-yellow-900 mb-2">⚠️ Medical Disclaimer</p>
          <p>
            This AI analysis is a screening tool and not a substitute for professional medical diagnosis. 
            Results should be discussed with a qualified healthcare provider. Always consult with a neurologist 
            for definitive diagnosis and treatment recommendations.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
