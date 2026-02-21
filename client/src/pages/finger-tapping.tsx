import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Keyboard, Play, Square, RotateCcw, AlertTriangle, TrendingUp, Clock, Target } from "lucide-react";
import { useLocation } from "wouter";

const useKeyboardDynamics = () => {
  const [isActive, setIsActive] = useState(false);
  const [tappingData, setTappingData] = useState({
    interTapIntervals: [] as number[],
    holdTimes: [] as number[],
    rhythmConsistency: 0,
    bradykinesiaScore: 0
  });
  const keyPressTimes = useRef<{ [key: string]: number }>({});
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

const FingerTapping = () => {
  const [, setLocation] = useLocation();
  const keyboard = useKeyboardDynamics();
  const [testDuration, setTestDuration] = useState(30); // seconds
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            keyboard.stopTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, keyboard]);

  const startTest = () => {
    keyboard.startTest();
    setTimeLeft(testDuration);
    setIsRunning(true);
  };

  const stopTest = () => {
    setIsRunning(false);
    keyboard.stopTest();
  };

  const resetTest = () => {
    setIsRunning(false);
    setTimeLeft(0);
    keyboard.startTest();
    keyboard.stopTest();
  };

  const getBradykinesiaLevel = (score: number) => {
    if (score < 20) return { level: "Low", color: "bg-green-100 text-green-800" };
    if (score < 50) return { level: "Moderate", color: "bg-yellow-100 text-yellow-800" };
    return { level: "High", color: "bg-red-100 text-red-800" };
  };

  const bradykinesiaInfo = getBradykinesiaLevel(keyboard.tappingData.bradykinesiaScore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Keyboard className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Finger Tapping Test
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Assess motor function by alternating taps between 'A' and 'L' keys.
            This test measures bradykinesia (slowness) and rhythm consistency.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Test Control */}
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Target className="w-5 h-5" />
                Test Instructions
              </CardTitle>
              <CardDescription>
                Alternate tapping between 'A' and 'L' keys as quickly and consistently as possible
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-6xl font-mono font-bold text-blue-600 mb-2">
                  {timeLeft}s
                </div>
                <p className="text-gray-600">Time Remaining</p>
              </div>

              <div className="flex gap-3 justify-center">
                {!isRunning && !keyboard.isActive && (
                  <Button onClick={startTest} size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <Play className="w-4 h-4 mr-2" />
                    Start Test
                  </Button>
                )}
                {isRunning && (
                  <Button onClick={stopTest} variant="destructive" size="lg">
                    <Square className="w-4 h-4 mr-2" />
                    Stop Test
                  </Button>
                )}
                <Button onClick={resetTest} variant="outline" size="lg">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Test Duration: {testDuration} seconds
                </label>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={testDuration}
                  onChange={(e) => setTestDuration(Number(e.target.value))}
                  className="w-full"
                  disabled={isRunning}
                />
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <Keyboard className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Focus on the screen and tap alternately between 'A' and 'L' keys.
                  Maintain a steady rhythm throughout the test.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="bg-white/80 backdrop-blur-sm border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <TrendingUp className="w-5 h-5" />
                Test Results
              </CardTitle>
              <CardDescription>
                Real-time analysis of tapping patterns and motor function
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {keyboard.tappingData.interTapIntervals.length}
                  </div>
                  <p className="text-sm text-gray-600">Total Taps</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {(keyboard.tappingData.holdTimes.length > 0
                      ? (keyboard.tappingData.holdTimes.reduce((a, b) => a + b, 0) / keyboard.tappingData.holdTimes.length).toFixed(0)
                      : 0) + 'ms'}
                  </div>
                  <p className="text-sm text-gray-600">Avg Hold Time</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Rhythm Consistency</span>
                  <span className="text-sm font-bold text-green-600">
                    {keyboard.tappingData.rhythmConsistency.toFixed(1)}%
                  </span>
                </div>
                <Progress value={keyboard.tappingData.rhythmConsistency} className="h-3" />
                <p className="text-xs text-gray-500 mt-1">
                  Higher scores indicate more consistent tapping rhythm
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Bradykinesia Score</span>
                  <Badge className={bradykinesiaInfo.color}>
                    {bradykinesiaInfo.level}
                  </Badge>
                </div>
                <Progress value={keyboard.tappingData.bradykinesiaScore} className="h-3" />
                <p className="text-xs text-gray-500 mt-1">
                  Percentage of slow taps (intervals &gt; 300ms)
                </p>
              </div>

              {keyboard.tappingData.interTapIntervals.length > 0 && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800 text-sm">
                    <strong>Clinical Note:</strong> Bradykinesia scores above 50% may indicate
                    motor slowing associated with Parkinson's disease. Consult a healthcare professional
                    for proper diagnosis.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
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
      </div>
    </div>
  );
};

export default FingerTapping;
