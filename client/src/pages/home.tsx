import { useState } from "react";
import { FileUpload } from "@/components/file-upload";
import { PredictionResult } from "@/components/prediction-result";
import { Button } from "@/components/ui/button";
import { FileImage, FileAudio, Sparkles, Stethoscope, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import heroBg from "@assets/generated_images/abstract_medical_ai_network_background.png";

export default function Home() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handlePredict = async () => {
    if (!imageFile || !audioFile) {
      toast({
        title: "Missing Files",
        description: "Please upload both an image and an audio file to proceed.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    // Simulate API call and processing delay
    setTimeout(() => {
      // Mock logic: 
      // If image file name contains "positive", return positive.
      // Else random, but weighted towards healthy for demo unless specified.
      const isPositive = Math.random() > 0.5;
      
      const mockResult = {
        prediction: isPositive ? "Parkinson's Detected" : "Healthy Control",
        confidence: 0.85 + Math.random() * 0.14,
        details: {
          imageScore: isPositive ? 0.8 + Math.random() * 0.1 : 0.1 + Math.random() * 0.2,
          audioScore: isPositive ? 0.75 + Math.random() * 0.15 : 0.15 + Math.random() * 0.2,
        }
      };

      setResult(mockResult);
      setLoading(false);
      
      toast({
        title: "Analysis Complete",
        description: "The multimodal model has finished processing your inputs.",
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div 
        className="absolute inset-0 z-[-10] opacity-30"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mixBlendMode: 'multiply'
        }}
      />
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-50/80 to-transparent z-[-5]" />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 backdrop-blur-sm border border-primary/20">
            <Stethoscope className="w-4 h-4" />
            <span>AI-Powered Diagnostics Prototype</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-bold tracking-tight text-foreground drop-shadow-sm">
            NeuroScan <span className="gradient-text">AI</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Early detection of Parkinson's Disease using multimodal deep learning analysis of spiral drawings and voice patterns.
          </p>
        </motion.div>

        {/* Main Interface */}
        <div className="grid gap-8 mb-12">
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="glass-panel rounded-2xl p-6 h-full hover:shadow-primary/5 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100/50 text-blue-600 rounded-lg">
                    <FileImage className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold">Spiral Drawing</h3>
                    <p className="text-xs text-muted-foreground">Upload spiral test image</p>
                  </div>
                </div>
                <FileUpload
                  id="image-upload"
                  accept="image/*"
                  label=""
                  icon={FileImage}
                  file={imageFile}
                  setFile={setImageFile}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="glass-panel rounded-2xl p-6 h-full hover:shadow-primary/5 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-100/50 text-indigo-600 rounded-lg">
                    <FileAudio className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold">Voice Recording</h3>
                    <p className="text-xs text-muted-foreground">Upload voice sample (wav/mp3)</p>
                  </div>
                </div>
                <FileUpload
                  id="audio-upload"
                  accept="audio/*"
                  label=""
                  icon={FileAudio}
                  file={audioFile}
                  setFile={setAudioFile}
                />
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center"
          >
            <Button
              size="lg"
              className="px-8 py-6 text-lg font-medium shadow-lg hover:shadow-primary/20 transition-all rounded-full min-w-[200px] cursor-pointer"
              onClick={handlePredict}
              disabled={loading || (!imageFile && !audioFile)}
              data-testid="button-analyze"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Run Analysis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </motion.div>
        </div>

        {/* Results Section */}
        <div className="max-w-2xl mx-auto">
          <PredictionResult loading={loading} result={result} />
        </div>
      </div>
    </div>
  );
}
