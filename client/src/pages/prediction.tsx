import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileImage, FileAudio, Sparkles, Brain, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiService } from "@/lib/api-service";
import { StepProgress } from "@/components/step-progress";
import { BackendConfigButton } from "@/components/backend-config";
import heroBg from "@assets/generated_images/hopeful_medical_background_with_brain_waves_and_pulses.png";

export default function Prediction() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!imageFile || !audioFile) {
      toast({
        title: "Missing Files",
        description: "Please upload both an image and an audio file.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);

    // Navigate to analysis page immediately to show animation
    // We pass the files via state or just mock the upload for the prototype
    // Since we can't easily pass File objects via URL, we'll assume for this prototype
    // that the analysis page handles the API call or we do it here and redirect on success.
    // For better UX with the animation, let's do the API call here but redirect to analysis
    // which then redirects to result. 
    // OR: Redirect to analysis, and have analysis page trigger the API call.
    // Given the constraints and simplicity, let's trigger it here, wait for result, 
    // BUT to show the "Analysis" screen properly, we should probably redirect first.
    
    // BETTER APPROACH FOR PROTOTYPE:
    // 1. User clicks Analyze
    // 2. Redirect to /analysis
    // 3. /analysis page simulates delay (or actual call) then goes to /result
    // But we need the data in /result.
    // Let's keep the API call here, but maybe redirect to /analysis while "loading"?
    // No, that's complicated with React Router state.
    
    // Let's stick to: Call API -> Save to Session -> Redirect to Analysis -> Redirect to Result
    
    try {
      const result = await apiService.predict(imageFile, audioFile);
      
      // Save to local storage for history (as requested)
      const historyItem = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        prediction: result.prediction ? "Positive" : "Negative",
        confidence: Math.round(result.confidence * 100),
        stage: result.stage
      };
      
      const existingHistory = JSON.parse(localStorage.getItem('predictionHistory') || '[]');
      localStorage.setItem('predictionHistory', JSON.stringify([historyItem, ...existingHistory]));

      // Store result for result page
      sessionStorage.setItem('predictionResult', JSON.stringify(result));
      
      setLocation("/analysis");
    } catch (err) {
      setLoading(false);
      const errorMsg = err instanceof Error ? err.message : "Failed to analyze";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  const steps = [
    { id: 1, label: "Upload", icon: "📤" },
    { id: 2, label: "Analyze", icon: "🔬" },
    { id: 3, label: "Results", icon: "📊" },
    { id: 4, label: "Report", icon: "📄" },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden font-sans">
      {/* Dynamic Medical AI Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-30 pointer-events-none"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      
      <BackendConfigButton />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        <div className="mb-12">
          <StepProgress steps={steps} currentStep={1} />
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Brain className="w-4 h-4" />
            Test Your Results
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
            Submit Your <span className="gradient-text">Samples</span>
          </h1>
          <p className="text-lg text-black dark:text-black">
            Upload a spiral drawing image and a voice recording for analysis
          </p>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900 mb-1">Connection Error</p>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Upload Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full glass-panel hover:shadow-lg transition-all dark:bg-slate-800/50 dark:border-slate-700">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100/50 text-blue-600 rounded-lg dark:bg-blue-900/30 dark:text-blue-400">
                    <FileImage className="w-5 h-5" />
                  </div>
                  <CardTitle>Spiral Drawing</CardTitle>
                </div>
                <p className="text-xs text-black dark:text-black mt-2">PNG, JPG - Max 10MB</p>
              </CardHeader>
              <CardContent>
                <FileUpload
                  id="image"
                  accept="image/*"
                  label=""
                  icon={FileImage}
                  file={imageFile}
                  setFile={setImageFile}
                  data-testid="upload-image"
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full glass-panel hover:shadow-lg transition-all dark:bg-slate-800/50 dark:border-slate-700">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100/50 text-indigo-600 rounded-lg dark:bg-indigo-900/30 dark:text-indigo-400">
                    <FileAudio className="w-5 h-5" />
                  </div>
                  <CardTitle>Voice Recording</CardTitle>
                </div>
                <p className="text-xs text-black dark:text-black mt-2">WAV, MP3 - Max 10MB</p>
              </CardHeader>
              <CardContent>
                <FileUpload
                  id="audio"
                  accept="audio/*"
                  label=""
                  icon={FileAudio}
                  file={audioFile}
                  setFile={setAudioFile}
                  data-testid="upload-audio"
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-4 justify-center flex-wrap"
        >
          <Button
            size="lg"
            className="px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-primary/40"
            onClick={handleAnalyze}
            disabled={loading || !imageFile || !audioFile}
            data-testid="btn-analyze"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Start Analysis
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="px-8 py-6 text-lg rounded-full"
            onClick={() => {
              setImageFile(null);
              setAudioFile(null);
              setError(null);
            }}
            data-testid="btn-clear"
          >
            Clear Files
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
