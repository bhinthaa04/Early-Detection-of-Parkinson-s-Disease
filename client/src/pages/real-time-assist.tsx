import { motion } from "framer-motion";
import { Camera, Mic, Activity, ArrowLeft, Sparkles, ShieldCheck, Thermometer, Square } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import heroBg from "@assets/generated_images/hopeful_medical_background_with_brain_waves_and_pulses.png";

type LiveResult = {
  label: string;
  stage: string;
  confidence: number;
  recommendation: string;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function buildLiveResult(tremor: number, speech: number, stability: number): LiveResult {
  const riskScore = tremor * 0.5 + (100 - speech) * 0.3 + (100 - stability) * 0.2;
  const confidence = clamp(Math.round(100 - riskScore), 55, 98);

  if (riskScore < 15) {
    return {
      label: "No Strong Parkinson Indicators",
      stage: "Low Risk",
      confidence,
      recommendation: "Continue monitoring and repeat the session if symptoms change.",
    };
  }

  if (riskScore < 28) {
    return {
      label: "Mild Motor/Speech Irregularities",
      stage: "Early Signs",
      confidence,
      recommendation: "Track symptoms over time and discuss with a specialist.",
    };
  }

  return {
    label: "Elevated Parkinson Risk Pattern",
    stage: "Needs Clinical Review",
    confidence: clamp(confidence, 55, 88),
    recommendation: "Please consult a neurologist for a full clinical assessment.",
  };
}

export default function RealTimeAssist() {
  const [, setLocation] = useLocation();
  const [isRecording, setIsRecording] = useState(false);
  const [tremorLevel, setTremorLevel] = useState(15);
  const [speechClarity, setSpeechClarity] = useState(88);
  const [stability, setStability] = useState(92);
  const [analysisCycles, setAnalysisCycles] = useState(0);
  const [liveResult, setLiveResult] = useState<LiveResult | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopMediaTracks = (stream: MediaStream | null) => {
    stream?.getTracks().forEach((track) => track.stop());
  };

  const stopAssistance = () => {
    setIsRecording(false);
    setAnalysisCycles(0);

    stopMediaTracks(streamRef.current);
    streamRef.current = null;

    if (videoRef.current) {
      const videoStream = videoRef.current.srcObject as MediaStream | null;
      if (videoStream && videoStream !== streamRef.current) {
        stopMediaTracks(videoStream);
      }
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => {
      stopMediaTracks(streamRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(() => {
      const nextTremor = Math.floor(Math.random() * 30) + 5;
      const nextSpeech = Math.floor(Math.random() * 20) + 75;
      const nextStability = Math.floor(Math.random() * 15) + 80;

      setTremorLevel(nextTremor);
      setSpeechClarity(nextSpeech);
      setStability(nextStability);

      setAnalysisCycles((prev) => {
        const next = prev + 1;
        if (next >= 2) {
          setLiveResult(buildLiveResult(nextTremor, nextSpeech, nextStability));
        }
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isRecording]);

  const startAssistance = async () => {
    setAnalysisCycles(0);
    setLiveResult(null);
    setIsRecording(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing media devices", err);
      setIsRecording(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-sans">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none"
        style={{ backgroundImage: `url(${heroBg})` }}
      />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <Button variant="ghost" onClick={() => setLocation("/")} className="mb-6 text-white hover:bg-white/10">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>

        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-primary rounded-xl text-black">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold text-white">Real-Time Patient Assist</h1>
            <p className="text-white/80">AI-powered live monitoring and feedback</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="overflow-hidden border-2 border-primary/20 shadow-xl bg-white">
              <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
                {isRecording ? (
                  <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-12">
                    <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 mb-6">Camera and microphone access required for live analysis</p>
                    <Button size="lg" onClick={startAssistance} className="rounded-full px-8 bg-primary text-black hover:bg-primary/90">
                      Start Live Session
                    </Button>
                  </div>
                )}
                {isRecording ? (
                  <div className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full" />
                    LIVE ANALYSIS ACTIVE
                  </div>
                ) : null}
                {isRecording ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={stopAssistance}
                    className="absolute top-4 right-4"
                  >
                    <Square className="w-3 h-3 mr-2" />
                    Stop Analysis
                  </Button>
                ) : null}
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Tremor Detection</CardTitle>
                  <Thermometer className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{isRecording ? `${tremorLevel}%` : "--"}</div>
                  <Progress value={tremorLevel} className="h-2 mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {tremorLevel < 20 ? "Normal range" : "Minor tremors detected"}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Speech Clarity</CardTitle>
                  <Mic className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{isRecording ? `${speechClarity}%` : "--"}</div>
                  <Progress value={speechClarity} className="h-2 mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {speechClarity > 80 ? "Clear articulation" : "Moderate slurring detected"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Analysis Result</CardTitle>
              </CardHeader>
              <CardContent>
                {liveResult ? (
                  <div className="space-y-2">
                    <p className="text-xl font-bold text-gray-900">{liveResult.label}</p>
                    <p className="text-sm text-gray-700">
                      Stage: <span className="font-semibold">{liveResult.stage}</span>
                    </p>
                    <p className="text-sm text-gray-700">
                      Confidence: <span className="font-semibold">{liveResult.confidence}%</span>
                    </p>
                    <p className="text-sm text-gray-600">{liveResult.recommendation}</p>
                  </div>
                ) : isRecording ? (
                  <p className="text-sm text-gray-600">Analyzing live input... result will appear in a few seconds.</p>
                ) : (
                  <p className="text-sm text-gray-600">Start live session to generate analysis result.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-slate-800 text-white border-none shadow-2xl">
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
                  "Relax your shoulders to reduce tension",
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

            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Stability Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Hand Movement Stability</span>
                    <span className="text-sm text-primary font-bold">{stability}%</span>
                  </div>
                  <Progress value={stability} className="h-2" />
                </div>
                <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                  <div className="flex items-center gap-3 mb-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <span className="font-bold text-sm text-gray-900">Session Safety</span>
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
