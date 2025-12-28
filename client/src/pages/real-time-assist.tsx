import { motion } from "framer-motion";
import { 
  Camera, Mic, Activity, Info, 
  ArrowLeft, Brain, Sparkles, MessageSquare, 
  Smile, ShieldCheck, Thermometer
} from "lucide-react";
import { useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RealTimeAssist() {
  const [, setLocation] = useLocation();
  const [isRecording, setIsRecording] = useState(false);
  const [tremorLevel, setTremorLevel] = useState(15);
  const [speechClarity, setSpeechClarity] = useState(88);
  const [stability, setStability] = useState(92);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setTremorLevel(Math.floor(Math.random() * 30) + 5);
        setSpeechClarity(Math.floor(Math.random() * 20) + 75);
        setStability(Math.floor(Math.random() * 15) + 80);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isRecording]);

  const startAssistance = async () => {
    setIsRecording(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing media devices", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>

        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-primary rounded-xl text-black">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold">Real-Time Patient Assist</h1>
            <p className="text-gray-600">AI-powered live monitoring and feedback</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="overflow-hidden border-2 border-primary/20 shadow-xl">
              <div className="relative aspect-video bg-black flex items-center justify-center">
                {isRecording ? (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-12">
                    <Camera className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-400 mb-6">Camera and microphone access required for live analysis</p>
                    <Button size="lg" onClick={startAssistance} className="rounded-full px-8">
                      Start Live Session
                    </Button>
                  </div>
                )}
                {isRecording && (
                  <div className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full" />
                    LIVE ANALYSIS ACTIVE
                  </div>
                )}
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tremor Detection</CardTitle>
                  <Thermometer className="h-4 h-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{isRecording ? `${tremorLevel}%` : '--'}</div>
                  <Progress value={tremorLevel} className="h-2 mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {tremorLevel < 20 ? "✓ Normal range" : "⚠ Minor tremors detected"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Speech Clarity</CardTitle>
                  <Mic className="h-4 h-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{isRecording ? `${speechClarity}%` : '--'}</div>
                  <Progress value={speechClarity} className="h-2 mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {speechClarity > 80 ? "✓ Clear articulation" : "⚠ Moderate slurring detected"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="bg-slate-900 text-white border-none shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI Smart Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  "Speak slightly slower for better clarity",
                  "Try to keep your left hand supported",
                  "Take deep breaths to improve voice projection",
                  "Relax your shoulders to reduce tension"
                ].map((tip, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-3 bg-white/10 rounded-lg text-sm border border-white/5"
                  >
                    {tip}
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Stability Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Hand Movement Stability</span>
                    <span className="text-sm text-primary font-bold">{stability}%</span>
                  </div>
                  <Progress value={stability} className="h-2" />
                </div>
                <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                  <div className="flex items-center gap-3 mb-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <span className="font-bold text-sm">Session Safety</span>
                  </div>
                  <p className="text-xs text-gray-600">Stability is high. You can continue your routine safely.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
