import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mic, MicOff, Camera, CameraOff, Volume2, VolumeX, Brain, Activity, AlertTriangle, TrendingUp, Keyboard, Smile } from "lucide-react";

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  timeStamp: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  start(): void;
  stop(): void;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

// Custom hooks for Web APIs
const useWebcam = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [gestureData, setGestureData] = useState({ tremor: 0, posture: 0, movement: 0 });

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
        analyzeGestures();
      }
    } catch (error) {
      console.error('Webcam access denied:', error);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsActive(false);
    }
  };

  const analyzeGestures = () => {
    // Simulate gesture analysis - in real implementation, use ML models
    const interval = setInterval(() => {
      setGestureData({
        tremor: Math.random() * 100,
        posture: Math.random() * 100,
        movement: Math.random() * 100
      });
    }, 1000);

    return () => clearInterval(interval);
  };

  return { videoRef, canvasRef, isActive, gestureData, startWebcam, stopWebcam };
};

const useVoiceAnalysis = () => {
  const [isListening, setIsListening] = useState(false);
  const [emotionData, setEmotionData] = useState({ happiness: 0, stress: 0, confidence: 0 });
  const [speechRate, setSpeechRate] = useState(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        // Analyze speech patterns for Parkinson's indicators
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');

        // Simulate emotion and speech analysis
        setEmotionData({
          happiness: Math.random() * 100,
          stress: Math.random() * 100,
          confidence: Math.random() * 100
        });
        setSpeechRate(transcript.length / (event.timeStamp / 1000));
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return { isListening, emotionData, speechRate, startListening, stopListening };
};

const useEnvironmentalMonitoring = () => {
  const [environmentData, setEnvironmentData] = useState({
    noise: 0,
    lighting: 0,
    temperature: 0,
    humidity: 0
  });

  useEffect(() => {
    // Simulate environmental monitoring
    const interval = setInterval(() => {
      setEnvironmentData({
        noise: Math.random() * 100,
        lighting: Math.random() * 100,
        temperature: 20 + Math.random() * 10,
        humidity: 40 + Math.random() * 30
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return environmentData;
};

const useKeyboardDynamics = () => {
  const [isActive, setIsActive] = useState(false);
  const [tappingData, setTappingData] = useState({
    interTapIntervals: [] as number[],
    holdTimes: [] as number[],
    rhythmConsistency: 0,
    bradykinesiaScore: 0
  });
  const keyPressTimes = useRef<{ [key: string]: number }>({});
  const keyReleaseTimes = useRef<{ [key: string]: number }>({});
  const tapIntervals = useRef<number[]>([]);
  const holdDurations = useRef<number[]>([]);

  const startTest = useCallback(() => {
    setIsActive(true);
    tapIntervals.current = [];
    holdDurations.current = [];
    setTappingData({
      interTapIntervals: [],
      holdTimes: [],
      rhythmConsistency: 0,
      bradykinesiaScore: 0
    });
  }, []);

  const stopTest = useCallback(() => {
    setIsActive(false);
    analyzeTapping();
  }, []);

  const analyzeTapping = () => {
    const intervals = tapIntervals.current;
    const holds = holdDurations.current;

    if (intervals.length < 2) return;

    // Calculate rhythm consistency (coefficient of variation)
    const meanInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((a, b) => a + Math.pow(b - meanInterval, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / meanInterval; // Coefficient of variation

    // Bradykinesia score based on slow tapping (intervals > 300ms indicate slowness)
    const slowTaps = intervals.filter(interval => interval > 300).length;
    const bradykinesiaScore = (slowTaps / intervals.length) * 100;

    setTappingData({
      interTapIntervals: intervals,
      holdTimes: holds,
      rhythmConsistency: Math.max(0, 100 - cv * 100), // Higher consistency = lower CV
      bradykinesiaScore
    });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isActive) return;

      const key = event.key.toLowerCase();
      if (key === 'a' || key === 'l') {
        const now = Date.now();
        keyPressTimes.current[key] = now;

        // Track inter-tap interval
        if (tapIntervals.current.length > 0) {
          const lastTap = tapIntervals.current[tapIntervals.current.length - 1];
          const interval = now - lastTap;
          tapIntervals.current.push(interval);
        } else {
          tapIntervals.current.push(now);
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!isActive) return;

      const key = event.key.toLowerCase();
      if ((key === 'a' || key === 'l') && keyPressTimes.current[key]) {
        const now = Date.now();
        const holdTime = now - keyPressTimes.current[key];
        holdDurations.current.push(holdTime);
        delete keyPressTimes.current[key];
      }
    };

    if (isActive) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isActive]);

  return { isActive, tappingData, startTest, stopTest };
};

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
        const blinkRate = (blinkCount.current / (timeSinceLastBlink / 60000));
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

      setFaceData({
        blinkRate: Math.min(60, blinkCount.current * 6), // Approximate blinks per minute
        smileRange: avgSmileRange,
        hypomimiaScore,
        facialSymmetry
      });
    }, 1000);

    return () => clearInterval(interval);
  };

  return { videoRef, canvasRef, isActive, faceData, startAnalysis, stopAnalysis };
};

const MultiModalAssessment = () => {
  const webcam = useWebcam();
  const voice = useVoiceAnalysis();
  const environment = useEnvironmentalMonitoring();
  const keyboard = useKeyboardDynamics();
  const face = useFaceAnalysis();

  const [assessmentPhase, setAssessmentPhase] = useState<'setup' | 'voice-test' | 'gesture-test' | 'keyboard-test' | 'face-test' | 'cognitive-test' | 'results'>('setup');
  const [voiceChallenges, setVoiceChallenges] = useState([
    { text: "The quick brown fox jumps over the lazy dog", completed: false },
    { text: "Peter Piper picked a peck of pickled peppers", completed: false },
    { text: "She sells seashells by the seashore", completed: false }
  ]);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [cognitiveScore, setCognitiveScore] = useState(0);
  const [overallRisk, setOverallRisk] = useState(0);

  const startAssessment = () => {
    setAssessmentPhase('voice-test');
  };

  const nextPhase = () => {
    if (assessmentPhase === 'voice-test') setAssessmentPhase('gesture-test');
    else if (assessmentPhase === 'gesture-test') setAssessmentPhase('keyboard-test');
    else if (assessmentPhase === 'keyboard-test') setAssessmentPhase('face-test');
    else if (assessmentPhase === 'face-test') setAssessmentPhase('cognitive-test');
    else if (assessmentPhase === 'cognitive-test') setAssessmentPhase('results');
  };

  const completeVoiceChallenge = () => {
    const updated = [...voiceChallenges];
    updated[currentChallenge].completed = true;
    setVoiceChallenges(updated);

    if (currentChallenge < voiceChallenges.length - 1) {
      setCurrentChallenge(currentChallenge + 1);
    } else {
      nextPhase();
    }
  };

  const calculateRisk = () => {
    // Multi-modal risk calculation combining all data streams
    const gestureRisk = (webcam.gestureData.tremor + webcam.gestureData.posture) / 2;
    const voiceRisk = (voice.emotionData.stress + (150 - voice.speechRate)) / 2;
    const keyboardRisk = keyboard.tappingData.bradykinesiaScore;
    const faceRisk = face.faceData.hypomimiaScore;
    const environmentRisk = environment.noise > 70 ? 80 : environment.noise > 40 ? 50 : 20;
    const cognitiveRisk = 100 - cognitiveScore;

    const totalRisk = (gestureRisk * 0.2 + voiceRisk * 0.2 + keyboardRisk * 0.15 + faceRisk * 0.15 + environmentRisk * 0.15 + cognitiveRisk * 0.15);
    setOverallRisk(Math.min(100, Math.max(0, totalRisk)));
  };

  useEffect(() => {
    if (assessmentPhase === 'results') {
      calculateRisk();
    }
  }, [assessmentPhase]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Multi-Modal Parkinson's Assessment
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Revolutionary real-time assessment combining voice, gesture, and environmental analysis
            for comprehensive Parkinson's evaluation
          </p>
        </motion.div>
        {(() => {
          switch (assessmentPhase) {
            case 'setup':
              return (
                <div className="text-center">
                  <Button onClick={startAssessment} size="lg" className="px-8 py-4 text-lg">
                    Start Multi-Modal Assessment
                  </Button>
                </div>
              );
            case 'voice-test':
              return <div>Voice Test Phase</div>;
            case 'gesture-test':
              return <div>Gesture Test Phase</div>;
            case 'keyboard-test':
              return <div>Keyboard Test Phase</div>;
            case 'face-test':
              return <div>Face Test Phase</div>;
            case 'cognitive-test':
              return <div>Cognitive Test Phase</div>;
            case 'results':
              return <div>Results Phase</div>;
            default:
              return null;
          }
        })()}

        {/* Navigation */}
        {assessmentPhase !== 'setup' && assessmentPhase !== 'results' && (
          <div className="flex justify-center mt-8">
            <Button onClick={nextPhase} size="lg">
              Next Phase
            </Button>
          </div>
        )}

        {/* Environmental Monitoring Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg"
        >
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Environment
          </h4>
          <div className="space-y-1 text-sm">
            <div>Noise: {environment.noise.toFixed(1)}%</div>
            <div>Light: {environment.lighting.toFixed(1)}%</div>
            <div>Temp: {environment.temperature.toFixed(1)}°C</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MultiModalAssessment;