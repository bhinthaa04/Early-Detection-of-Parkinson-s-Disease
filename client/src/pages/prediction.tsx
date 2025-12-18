import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileImage, FileAudio, Sparkles, Brain, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiService } from "@/lib/api-service";

export default function Prediction() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
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
    setProgress(10);
    setError(null);

    try {
      setProgress(30);
      const result = await apiService.predict(imageFile, audioFile);
      setProgress(100);

      // Store result and navigate to results page
      sessionStorage.setItem('predictionResult', JSON.stringify(result));
      
      setTimeout(() => {
        setLocation("/result");
      }, 500);
    } catch (err) {
      setLoading(false);
      setProgress(0);
      const errorMsg = err instanceof Error ? err.message : "Failed to analyze";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 relative overflow-hidden font-sans">
      {/* Background */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl relative z-10">
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
          <p className="text-lg text-gray-700">
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
              <p className="text-xs text-red-700 mt-2">
                💡 <strong>Fix:</strong> Click the settings icon (⚙️) at bottom-right to configure your backend URL
              </p>
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
            <Card className="h-full glass-panel hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100/50 text-blue-600 rounded-lg">
                    <FileImage className="w-5 h-5" />
                  </div>
                  <CardTitle>Spiral Drawing</CardTitle>
                </div>
                <p className="text-xs text-gray-600 mt-2">PNG, JPG - Max 10MB</p>
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
            <Card className="h-full glass-panel hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100/50 text-indigo-600 rounded-lg">
                    <FileAudio className="w-5 h-5" />
                  </div>
                  <CardTitle>Voice Recording</CardTitle>
                </div>
                <p className="text-xs text-gray-600 mt-2">WAV, MP3 - Max 10MB</p>
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

        {/* Progress Bar */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-foreground">Processing...</span>
                <span className="text-gray-600">{progress}%</span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-linear-to-r from-primary to-secondary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </motion.div>
        )}

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
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Analyze Now
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

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-border"
        >
          <h3 className="font-heading font-semibold text-foreground mb-4">Instructions</h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">1.</span>
              <span>Draw a spiral pattern on paper and take a clear image of it</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">2.</span>
              <span>Record yourself saying a standard phrase or reading a paragraph for 10-15 seconds</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">3.</span>
              <span>Upload both files using the upload areas above</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">4.</span>
              <span>Click "Analyze Now" and wait for results (usually 2-5 seconds)</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
