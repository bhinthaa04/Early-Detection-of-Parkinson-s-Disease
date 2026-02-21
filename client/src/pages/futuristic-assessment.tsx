import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Eye, Brain, Zap, AlertTriangle, Shield, Camera, CameraOff,
  Activity, TrendingUp, Clock, Target, Sparkles, Wifi, WifiOff
} from "lucide-react";

// Custom hook for eye-tracking and blink analysis
const useEyeTracking = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [blinkData, setBlinkData] = useState({
    blinkRate: 0,
    blinkPattern: [] as number[],
    eyeMovement: 0,
    pupilDilation: 0
  });
  const [lastBlinkTime, setLastBlinkTime] = useState(0);

  const startEyeTracking = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
        analyzeEyeMovements();
      }
    } catch (error) {
      console.error('Eye tracking access denied:', error);
    }
  };

  const stopEyeTracking = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsActive(false);
    }
  };

  const analyzeEyeMovements = () => {
    // Simulate eye tracking analysis - in real implementation, use computer vision
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastBlink = now - lastBlinkTime;

      // Simulate blink detection (random blinks every 2-8 seconds)
      if (Math.random() < 0.1 && timeSinceLastBlink > 2000) {
        setLastBlinkTime(now);
        setBlinkData(prev => ({
          ...prev,
          blinkRate: prev.blinkRate + 1,
          blinkPattern: [...prev.blinkPattern.slice(-9), now] // Keep last 10 blinks
        }));
      }

      setBlinkData(prev => ({
        ...prev,
        eyeMovement: Math.random() * 100,
        pupilDilation: 20 + Math.random() * 60
      }));
    }, 100);

    return () => clearInterval(interval);
  };

  return { videoRef, canvasRef, isActive, blinkData, startEyeTracking, stopEyeTracking };
};

// Custom hook for simulated brain signals
const useBrainSignals = () => {
  const [brainData, setBrainData] = useState({
    alpha: 0, // Relaxation
    beta: 0,  // Active thinking
    theta: 0, // Drowsiness
    delta: 0, // Deep sleep
    connectivity: 0
  });
  const [isConnected, setIsConnected] = useState(false);

  const connectBrainInterface = () => {
    setIsConnected(true);
    // Simulate brain signal acquisition
    const interval = setInterval(() => {
      setBrainData({
        alpha: Math.random() * 100,
        beta: Math.random() * 100,
        theta: Math.random() * 100,
        delta: Math.random() * 100,
        connectivity: 60 + Math.random() * 40
      });
    }, 500);

    return () => clearInterval(interval);
  };

  const disconnectBrainInterface = () => {
    setIsConnected(false);
  };

  return { brainData, isConnected, connectBrainInterface, disconnectBrainInterface };
};

// Brain wave visualization component
const BrainWaveVisualization = ({ brainData }: { brainData: any }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw brain waves
    const waves = [
      { name: 'Alpha', color: '#10b981', data: brainData.alpha },
      { name: 'Beta', color: '#f59e0b', data: brainData.beta },
      { name: 'Theta', color: '#8b5cf6', data: brainData.theta },
      { name: 'Delta', color: '#ef4444', data: brainData.delta }
    ];

    waves.forEach((wave, index) => {
      ctx.strokeStyle = wave.color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      const yOffset = 50 + index * 40;
      const amplitude = wave.data / 2;

      for (let x = 0; x < canvas.width; x++) {
        const y = yOffset + Math.sin(x * 0.05 + Date.now() * 0.005) * amplitude;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();
    });
  }, [brainData]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={200}
      className="w-full h-32 bg-gray-900 rounded-lg"
    />
  );
};

const FuturisticAssessment = () => {
  const eyeTracking = useEyeTracking();
  const brainSignals = useBrainSignals();

  const [assessmentPhase, setAssessmentPhase] = useState<'disclaimer' | 'eye-test' | 'brain-test' | 'results'>('disclaimer');
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false);
  const [riskScore, setRiskScore] = useState(0);

  const startAssessment = () => {
    if (acceptedDisclaimer) {
      setAssessmentPhase('eye-test');
    }
  };

  const nextPhase = () => {
    if (assessmentPhase === 'eye-test') setAssessmentPhase('brain-test');
    else if (assessmentPhase === 'brain-test') setAssessmentPhase('results');
  };

  const calculateRisk = () => {
    // Experimental risk calculation based on eye and brain data
    const eyeRisk = (eyeTracking.blinkData.blinkRate > 20 ? 80 : eyeTracking.blinkData.blinkRate > 10 ? 50 : 20);
    const brainRisk = (100 - brainSignals.brainData.connectivity) * 0.5;
    const totalRisk = (eyeRisk * 0.6 + brainRisk * 0.4);
    setRiskScore(Math.min(100, Math.max(0, totalRisk)));
  };

  useEffect(() => {
    if (assessmentPhase === 'results') {
      calculateRisk();
    }
  }, [assessmentPhase]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl font-bold text-white">
              Futuristic Neural Assessment
            </h1>
            <Sparkles className="w-8 h-8 text-cyan-400" />
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experimental eye-tracking and brain signal analysis for advanced Parkinson's detection
          </p>
          <Badge variant="destructive" className="mt-4 text-sm">
            <AlertTriangle className="w-4 h-4 mr-2" />
            RESEARCH-LEVEL ONLY - NOT CLINICALLY APPROVED
          </Badge>
        </motion.div>

        {/* Disclaimer Phase */}
        {assessmentPhase === 'disclaimer' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="bg-red-900/20 border-red-500/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-400">
                  <Shield className="w-6 h-6" />
                  Critical Research Disclaimer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-red-500/50 bg-red-900/10">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-200">
                    This assessment uses experimental technologies including eye-tracking and simulated brain signal analysis.
                    Results are for research purposes only and should not be used for medical diagnosis or treatment decisions.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3 text-gray-300">
                  <p>• <strong>Eye-tracking:</strong> Webcam-based blink analysis may not be as accurate as clinical eye-tracking equipment.</p>
                  <p>• <strong>Brain signals:</strong> Simulated neural data for demonstration - not actual brain activity measurement.</p>
                  <p>• <strong>Risk assessment:</strong> Algorithm is experimental and may produce inaccurate results.</p>
                  <p>• <strong>Privacy:</strong> Video data is processed locally and not stored or transmitted.</p>
                  <p>• <strong>Medical advice:</strong> Always consult qualified healthcare professionals for diagnosis and treatment.</p>
                </div>

                <div className="flex items-center space-x-2 pt-4">
                  <input
                    type="checkbox"
                    id="disclaimer-accept"
                    checked={acceptedDisclaimer}
                    onChange={(e) => setAcceptedDisclaimer(e.target.checked)}
                    className="w-4 h-4 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500"
                  />
                  <label htmlFor="disclaimer-accept" className="text-sm text-gray-300">
                    I understand this is experimental research and will not use results for medical decisions
                  </label>
                </div>

                <Button
                  onClick={startAssessment}
                  disabled={!acceptedDisclaimer}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                  size="lg"
                >
                  Proceed to Experimental Assessment
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Eye Tracking Test Phase */}
        {assessmentPhase === 'eye-test' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-slate-800/50 border-cyan-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyan-400">
                  <Eye className="w-5 h-5" />
                  Eye-Tracking Analysis
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Experimental blink detection and eye movement tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  <video
                    ref={eyeTracking.videoRef}
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={eyeTracking.startEyeTracking}
                    disabled={eyeTracking.isActive}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Start Eye Tracking
                  </Button>
                  <Button
                    onClick={eyeTracking.stopEyeTracking}
                    disabled={!eyeTracking.isActive}
                    variant="outline"
                    className="border-cyan-500/50 text-cyan-400"
                  >
                    <CameraOff className="w-4 h-4 mr-2" />
                    Stop Tracking
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-cyan-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-cyan-400">Eye Movement Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Blink Rate (per minute)</span>
                    <span className="text-cyan-400 font-bold">{eyeTracking.blinkData.blinkRate}</span>
                  </div>
                  <Progress value={Math.min(100, eyeTracking.blinkData.blinkRate * 5)} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Eye Movement Activity</span>
                    <span className="text-cyan-400 font-bold">{eyeTracking.blinkData.eyeMovement.toFixed(1)}%</span>
                  </div>
                  <Progress value={eyeTracking.blinkData.eyeMovement} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Pupil Dilation</span>
                    <span className="text-cyan-400 font-bold">{eyeTracking.blinkData.pupilDilation.toFixed(1)}%</span>
                  </div>
                  <Progress value={eyeTracking.blinkData.pupilDilation} className="h-2" />
                </div>

                <Alert className="border-yellow-500/50 bg-yellow-900/20">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <AlertDescription className="text-yellow-200 text-sm">
                    Experimental feature - blink detection may be inaccurate
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Brain Signal Test Phase */}
        {assessmentPhase === 'brain-test' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-400">
                  <Brain className="w-5 h-5" />
                  Neural Interface
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Simulated brain signal analysis for cognitive assessment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center p-8 bg-gray-900 rounded-lg">
                  {brainSignals.isConnected ? (
                    <div className="text-center">
                      <Wifi className="w-12 h-12 text-green-400 mx-auto mb-4" />
                      <p className="text-green-400 font-bold">Neural Interface Connected</p>
                      <p className="text-gray-400 text-sm">Simulating brain signal acquisition</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <WifiOff className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">Neural interface disconnected</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={brainSignals.connectBrainInterface}
                    disabled={brainSignals.isConnected}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Connect Neural Interface
                  </Button>
                  <Button
                    onClick={brainSignals.disconnectBrainInterface}
                    disabled={!brainSignals.isConnected}
                    variant="outline"
                    className="border-purple-500/50 text-purple-400"
                  >
                    Disconnect
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-purple-400">Brain Wave Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <BrainWaveVisualization brainData={brainSignals.brainData} />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300 text-sm">Alpha (Relaxation)</span>
                      <span className="text-purple-400 font-bold text-sm">{brainSignals.brainData.alpha.toFixed(1)}%</span>
                    </div>
                    <Progress value={brainSignals.brainData.alpha} className="h-1" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300 text-sm">Beta (Active)</span>
                      <span className="text-purple-400 font-bold text-sm">{brainSignals.brainData.beta.toFixed(1)}%</span>
                    </div>
                    <Progress value={brainSignals.brainData.beta} className="h-1" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300 text-sm">Theta (Drowsy)</span>
                      <span className="text-purple-400 font-bold text-sm">{brainSignals.brainData.theta.toFixed(1)}%</span>
                    </div>
                    <Progress value={brainSignals.brainData.theta} className="h-1" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300 text-sm">Connectivity</span>
                      <span className="text-purple-400 font-bold text-sm">{brainSignals.brainData.connectivity.toFixed(1)}%</span>
                    </div>
                    <Progress value={brainSignals.brainData.connectivity} className="h-1" />
                  </div>
                </div>

                <Alert className="border-yellow-500/50 bg-yellow-900/20">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <AlertDescription className="text-yellow-200 text-sm">
                    Simulated brain signals - not actual neural data
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Phase */}
        {assessmentPhase === 'results' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <Card className="bg-slate-800/50 border-cyan-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-center text-2xl text-white">
                  Experimental Assessment Results
                </CardTitle>
                <CardDescription className="text-center text-gray-400">
                  Research-level analysis combining eye-tracking and neural signals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl font-bold mb-2 text-cyan-400">
                    {riskScore.toFixed(1)}%
                  </div>
                  <p className="text-xl font-semibold text-gray-300">
                    Experimental Risk Indicator
                  </p>
                  <Badge variant="outline" className="mt-2 border-yellow-500/50 text-yellow-400">
                    RESEARCH DATA ONLY
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-cyan-900/20 rounded-lg border border-cyan-500/30">
                    <Eye className="w-8 h-8 mx-auto mb-2 text-cyan-400" />
                    <p className="font-semibold text-cyan-400">Eye Tracking Risk</p>
                    <p className="text-2xl font-bold text-cyan-400">
                      {(eyeTracking.blinkData.blinkRate > 20 ? 80 : eyeTracking.blinkData.blinkRate > 10 ? 50 : 20).toFixed(1)}%
                    </p>
                  </div>

                  <div className="text-center p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
                    <Brain className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                    <p className="font-semibold text-purple-400">Neural Risk</p>
                    <p className="text-2xl font-bold text-purple-400">
                      {((100 - brainSignals.brainData.connectivity) * 0.5).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <Alert className="border-red-500/50 bg-red-900/20">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-200">
                    <strong>IMPORTANT:</strong> This is experimental research data only. Do not use for medical diagnosis.
                    Results may be inaccurate and should not influence healthcare decisions. Consult a qualified physician.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-4 justify-center">
                  <Button onClick={() => setAssessmentPhase('disclaimer')} variant="outline" className="border-gray-500 text-gray-400">
                    Retake Assessment
                  </Button>
                  <Button className="bg-cyan-600 hover:bg-cyan-700">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Research Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Navigation */}
        {assessmentPhase !== 'disclaimer' && assessmentPhase !== 'results' && (
          <div className="flex justify-center mt-8">
            <Button onClick={nextPhase} size="lg" className="bg-cyan-600 hover:bg-cyan-700">
              Next Phase
            </Button>
          </div>
        )}

        {/* Status Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 right-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-cyan-500/30"
        >
          <h4 className="font-semibold mb-2 text-cyan-400 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Experimental Systems
          </h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${eyeTracking.isActive ? 'bg-green-400' : 'bg-gray-500'}`} />
              <span className="text-gray-300">Eye Tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${brainSignals.isConnected ? 'bg-green-400' : 'bg-gray-500'}`} />
              <span className="text-gray-300">Neural Interface</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FuturisticAssessment;
