import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, CameraOff, Smile, Eye, AlertTriangle, TrendingUp, Target, Play, Square } from "lucide-react";
import { useLocation } from "wouter";

const useFaceAnalysis = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [faceData, setFaceData] = useState({
    blinkRate: 0,
    smileRange: 0,
    hypomimiaScore: 0,
    facialSymmetry: 0
  });
  const blinkCount = useRef(0);
  const lastBlinkTime = useRef(Date.now());
  const smileMeasurements = useRef<number[]>([]);

  const startAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
        analyzeFace();
      }
    } catch (error) {
      console.error('Camera access denied:', error);
    }
  };

  const stopAnalysis = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsActive(false);
    }
  };

  const analyzeFace = () => {
    // Simulate face analysis - in real implementation, use MediaPipe or similar
    const interval = setInterval(() => {
      // Simulate blink detection
      if (Math.random() < 0.1) { // Random blink simulation
        blinkCount.current++;
        const now = Date.now();
        const timeSinceLastBlink = now - lastBlinkTime.current;
        lastBlinkTime.current = now;

        // Calculate blink rate (blinks per minute)
        const blinkRate = Math.min(60, (blinkCount.current / (timeSinceLastBlink / 60000)));
        setFaceData(prev => ({ ...prev, blinkRate }));
      }

      // Simulate smile range measurement
      const smileRange = Math.random() * 100; // 0-100% smile intensity
      smileMeasurements.current.push(smileRange);

      // Keep only last 10 measurements
      if (smileMeasurements.current.length > 10) {
        smileMeasurements.current.shift();
      }

      // Calculate hypomimia score (reduced facial expression)
      const avgSmileRange = smileMeasurements.current.reduce((a, b) => a + b, 0) / smileMeasurements.current.length;
      const hypomimiaScore = Math.max(0, 100 - avgSmileRange); // Higher score = more hypomimia

      // Simulate facial symmetry
      const facialSymmetry = 50 + Math.random() * 50; // 50-100% symmetry

      setFaceData(prev => ({
        ...prev,
        smileRange: avgSmileRange,
        hypomimiaScore,
        facialSymmetry
      }));
    }, 1000);

    return () => clearInterval(interval);
  };

  return { videoRef, canvasRef, isActive, faceData, startAnalysis, stopAnalysis };
};

const FaceAnalysis = () => {
  const [, setLocation] = useLocation();
  const faceAnalysis = useFaceAnalysis();
  const [testPhase, setTestPhase] = useState<'instructions' | 'neutral' | 'smile' | 'results'>('instructions');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            faceAnalysis.stopAnalysis();
            nextPhase();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const startPhase = () => {
    faceAnalysis.startAnalysis();
    setTimeLeft(10); // 10 seconds per phase
    setIsRunning(true);
  };

  const nextPhase = () => {
    if (testPhase === 'neutral') setTestPhase('smile');
    else if (testPhase === 'smile') setTestPhase('results');
  };

  const getHypomimiaLevel = (score: number) => {
    if (score < 20) return { level: "Low", color: "bg-green-100 text-green-800" };
    if (score < 50) return { level: "Moderate", color: "bg-yellow-100 text-yellow-800" };
    return { level: "High", color: "bg-red-100 text-red-800" };
  };

  const hypomimiaInfo = getHypomimiaLevel(faceAnalysis.faceData.hypomimiaScore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Camera className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Face Analysis Test
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Webcam-based facial expression analysis to detect hypomimia (masked face),
            a common Parkinson's symptom involving reduced facial expressions.
          </p>
        </motion.div>

        {testPhase === 'instructions' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <Target className="w-5 h-5" />
                  Test Instructions
                </CardTitle>
                <CardDescription>
                  This test analyzes your facial expressions to detect signs of hypomimia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-900">Phase 1: Neutral Expression</h3>
                    <p className="text-gray-600">
                      Maintain a neutral facial expression while looking at the camera.
                      The system will analyze your baseline facial symmetry and blink rate.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-900">Phase 2: Smile Test</h3>
                    <p className="text-gray-600">
                      Smile naturally at the camera. The system will measure your smile range
                      and facial movement to assess hypomimia (reduced facial expressions).
                    </p>
                  </div>
                </div>

                <Alert className="border-purple-200 bg-purple-50">
                  <Camera className="h-4 w-4 text-purple-600" />
                  <AlertDescription className="text-purple-800">
                    <strong>Camera Access Required:</strong> This test requires webcam access to analyze
                    facial expressions. Your video data is processed locally and not stored or transmitted.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-center">
                  <Button onClick={() => setTestPhase('neutral')} size="lg" className="bg-purple-600 hover:bg-purple-700">
                    Start Face Analysis Test
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {(testPhase === 'neutral' || testPhase === 'smile') && (
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <Camera className="w-5 h-5" />
                  {testPhase === 'neutral' ? 'Neutral Expression' : 'Smile Test'}
                </CardTitle>
                <CardDescription>
                  {testPhase === 'neutral'
                    ? 'Maintain a neutral facial expression'
                    : 'Smile naturally at the camera'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  <video
                    ref={faceAnalysis.videoRef}
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="text-center">
                  <div className="text-4xl font-mono font-bold text-purple-600 mb-2">
                    {timeLeft}s
                  </div>
                  <p className="text-gray-600">Time Remaining</p>
                </div>

                <div className="flex gap-3 justify-center">
                  {!faceAnalysis.isActive && (
                    <Button onClick={startPhase} size="lg" className="bg-purple-600 hover:bg-purple-700">
                      <Play className="w-4 h-4 mr-2" />
                      Start {testPhase === 'neutral' ? 'Neutral' : 'Smile'} Phase
                    </Button>
                  )}
                  {faceAnalysis.isActive && (
                    <Button onClick={faceAnalysis.stopAnalysis} variant="destructive" size="lg">
                      <Square className="w-4 h-4 mr-2" />
                      Stop Analysis
                    </Button>
                  )}
                </div>

                {testPhase === 'smile' && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <Smile className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      Smile as naturally as possible. The system is measuring your facial movement range.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <TrendingUp className="w-5 h-5" />
                  Real-time Analysis
                </CardTitle>
                <CardDescription>
                  Live facial expression metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {faceAnalysis.faceData.blinkRate.toFixed(1)}
                    </div>
                    <p className="text-sm text-gray-600">Blink Rate (per min)</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {faceAnalysis.faceData.smileRange.toFixed(1)}%
                    </div>
                    <p className="text-sm text-gray-600">Smile Range</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Facial Symmetry</span>
                    <span className="text-sm font-bold text-green-600">
                      {faceAnalysis.faceData.facialSymmetry.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={faceAnalysis.faceData.facialSymmetry} className="h-3" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Hypomimia Score</span>
                    <Badge className={hypomimiaInfo.color}>
                      {hypomimiaInfo.level}
                    </Badge>
                  </div>
                  <Progress value={faceAnalysis.faceData.hypomimiaScore} className="h-3" />
                  <p className="text-xs text-gray-500 mt-1">
                    Higher scores indicate reduced facial expressions (hypomimia)
                  </p>
                </div>

                <Alert className="border-blue-200 bg-blue-50">
                  <Eye className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-sm">
                    <strong>Note:</strong> This is a simulated analysis. For clinical accuracy,
                    professional facial recognition software like MediaPipe would be used.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        )}

        {testPhase === 'results' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
              <CardHeader>
                <CardTitle className="text-center text-2xl text-gray-900">
                  Face Analysis Results
                </CardTitle>
                <CardDescription className="text-center text-gray-600">
                  Assessment of facial expressions and hypomimia indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200">
                    <Eye className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <p className="font-semibold text-purple-600">Blink Rate</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {faceAnalysis.faceData.blinkRate.toFixed(1)}
                    </p>
                    <p className="text-sm text-gray-600">per minute</p>
                  </div>

                  <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                    <Smile className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <p className="font-semibold text-green-600">Smile Range</p>
                    <p className="text-3xl font-bold text-green-600">
                      {faceAnalysis.faceData.smileRange.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">expression intensity</p>
                  </div>

                  <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-600" />
                    <p className="font-semibold text-red-600">Hypomimia Score</p>
                    <p className="text-3xl font-bold text-red-600">
                      {faceAnalysis.faceData.hypomimiaScore.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">reduced expression</p>
                  </div>
                </div>

                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <strong>Clinical Context:</strong> Hypomimia (masked face) is a common Parkinson's symptom
                    characterized by reduced facial expressions and blinking. Scores above 50% may indicate
                    hypomimia. Always consult healthcare professionals for proper diagnosis.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-4 justify-center">
                  <Button onClick={() => setTestPhase('instructions')} variant="outline">
                    Retake Test
                  </Button>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Detailed Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Navigation */}
        {testPhase !== 'instructions' && testPhase !== 'results' && (
          <div className="flex justify-center mt-8">
            <Button onClick={nextPhase} size="lg" className="bg-purple-600 hover:bg-purple-700">
              Next Phase
            </Button>
          </div>
        )}

        {testPhase === 'results' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center mt-8"
          >
            <Button
              variant="outline"
              onClick={() => setLocation("/")}
              className="rounded-full px-6"
            >
              Back to Home
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FaceAnalysis;
