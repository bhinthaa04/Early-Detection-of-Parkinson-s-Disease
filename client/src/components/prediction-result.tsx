import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, Activity, Brain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface PredictionResultProps {
  loading: boolean;
  result: {
    prediction: string;
    confidence: number;
    details: {
      imageScore: number;
      audioScore: number;
    };
  } | null;
}

export function PredictionResult({ loading, result }: PredictionResultProps) {
  if (loading) {
    return (
      <Card className="w-full glass-panel overflow-hidden border-primary/20">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
            <Activity className="w-16 h-16 text-primary animate-bounce relative z-10" />
          </div>
          <div className="space-y-2 max-w-md w-full">
            <h3 className="text-xl font-heading font-medium text-foreground">
              Analyzing Biomarkers
            </h3>
            <p className="text-muted-foreground text-sm">
              Processing spiral drawing patterns and voice frequency modulation features...
            </p>
            <Progress value={45} className="h-2 w-full mt-4 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) return null;

  const isPositive = result.prediction === "Parkinson's Detected";
  const colorClass = isPositive ? "text-rose-500" : "text-emerald-500";
  const bgClass = isPositive ? "bg-rose-500/10" : "bg-emerald-500/10";
  const borderClass = isPositive ? "border-rose-500/20" : "border-emerald-500/20";
  const Icon = isPositive ? AlertCircle : CheckCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={`w-full overflow-hidden border-2 ${borderClass} shadow-lg`}>
        <CardHeader className={`${bgClass} border-b ${borderClass} pb-6`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full bg-white shadow-sm ${colorClass}`}>
              <Icon className="w-8 h-8" />
            </div>
            <div>
              <CardTitle className="text-2xl font-heading font-bold text-foreground">
                {result.prediction}
              </CardTitle>
              <p className="text-muted-foreground">
                Confidence Score: {(result.confidence * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Brain className="w-4 h-4" /> Image Analysis (Spiral)
                </span>
                <span>{(result.details.imageScore * 100).toFixed(1)}%</span>
              </div>
              <Progress value={result.details.imageScore * 100} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Activity className="w-4 h-4" /> Audio Analysis (Voice)
                </span>
                <span>{(result.details.audioScore * 100).toFixed(1)}%</span>
              </div>
              <Progress value={result.details.audioScore * 100} className="h-2" />
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground">
            <h4 className="font-semibold text-foreground mb-2">Analysis Summary</h4>
            <p>
              {isPositive 
                ? "The multimodal model has detected patterns consistent with Parkinson's disease in both the spiral drawing test (tremors detected) and voice frequency analysis (jitter/shimmer anomalies)."
                : "No significant biomarkers for Parkinson's disease were detected. The spiral drawing shows steady motor control and voice frequency analysis falls within the healthy range."
              }
            </p>
            <div className="mt-4 pt-4 border-t border-border/50 text-xs">
              <p className="font-medium text-foreground">Disclaimer:</p>
              This is an AI-assisted screening tool, not a medical diagnosis. Please consult a neurologist for professional evaluation.
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
