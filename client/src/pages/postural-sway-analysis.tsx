import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Smartphone, Activity, TrendingUp, BarChart3, AlertTriangle,
  ArrowLeft, Play, Pause, RotateCcw, Info, CheckCircle, XCircle
} from "lucide-react";
import { useLocation } from "wouter";

interface SensorData {
  timestamp: number;
  acceleration: { x: number; y: number; z: number };
  rotationRate: { alpha: number; beta: number; gamma: number };
}

interface SwayMetrics {
  totalSway: number;
  swayX: number;
  swayY: number;
  swayZ: number;
  tremorsDetected: boolean;
  tremorFrequency: number;
  dominantFrequencies: Array<{ frequency: number; power: number }>;
  balance: "good" | "fair" | "poor";
  riskLevel: "low" | "moderate" | "high";
}

export default function PosturalSwayAnalysis() {
  const [, setLocation] = useLocation();
  const [testPhase, setTestPhase] = useState<'intro' | 'preparing' | 'testing' | 'results'>('intro');
  const [countdown, setCountdown] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isSupported, setIsSupported] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [metrics, setMetrics] = useState<SwayMetrics | null>(null);

  const sensorDataRef = useRef<SensorData[]>([]);
  const testDurationRef = useRef(30000); // 30 seconds in ms
  const startTimeRef = useRef<number | null>(null);
  const testIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const accelerometerRef = useRef<any>(null);
  const gyroscopeRef = useRef<any>(null);

  useEffect(() => {
    // Check for Generic Sensor API or DeviceMotionEvent
    const hasGenericSensor = 'Accelerometer' in window || 'Gyroscope' in window;
    const hasDeviceMotion = 'ondevicemotion' in window;

    if (!hasGenericSensor && !hasDeviceMotion) {
      setIsSupported(false);
    }
  }, []);

  const requestSensorPermission = async () => {
    try {
      // Try Generic Sensor API first (Chrome, Edge)
      if ('Accelerometer' in window && 'Gyroscope' in window) {
        // @ts-ignore
        const permission = await navigator.permissions.query({ name: 'accelerometer' });
        if (permission.state === 'granted' || permission.state === 'prompt') {
          // @ts-ignore
          accelerometerRef.current = new Accelerometer({ frequency: 100 });
          // @ts-ignore
          gyroscopeRef.current = new Gyroscope({ frequency: 100 });

          accelerometerRef.current.onreading = () => {
            if (testPhase === 'testing' && startTimeRef.current) {
              sensorDataRef.current.push({
                timestamp: Date.now() - startTimeRef.current,
                acceleration: {
                  x: accelerometerRef.current.x,
                  y: accelerometerRef.current.y,
                  z: accelerometerRef.current.z
                },
                rotationRate: {
                  alpha: gyroscopeRef.current?.alpha || 0,
                  beta: gyroscopeRef.current?.beta || 0,
                  gamma: gyroscopeRef.current?.gamma || 0
                }
              });
            }
          };

          accelerometerRef.current.start();
          if (gyroscopeRef.current) {
            gyroscopeRef.current.start();
          }

          setHasPermission(true);
          return true;
        }
      }
      // Fallback to DeviceMotionEvent
      else if ('ondevicemotion' in window) {
        const handleMotion = (event: DeviceMotionEvent) => {
          if (testPhase === 'testing' && startTimeRef.current) {
            sensorDataRef.current.push({
              timestamp: Date.now() - startTimeRef.current,
              acceleration: {
                x: event.acceleration?.x || 0,
                y: event.acceleration?.y || 0,
                z: event.acceleration?.z || 0
              },
              rotationRate: {
                alpha: event.rotationRate?.alpha || 0,
                beta: event.rotationRate?.beta || 0,
                gamma: event.rotationRate?.gamma || 0
              }
            });
          }
        };

        window.addEventListener('devicemotion', handleMotion);
        setHasPermission(true);
        return true;
      }
    } catch (error) {
      console.error('Sensor permission error:', error);
    }

    return false;
  };

  const startTest = async () => {
    if (!hasPermission) {
      const granted = await requestSensorPermission();
      if (!granted) {
        alert('Unable to access device sensors. Please check device settings.');
        return;
      }
    }

    setTestPhase('preparing');
    setCountdown(5);

    // Countdown for user to get into position
    let count = 5;
    const countdownInterval = setInterval(() => {
      count--;
      setCountdown(count);
      if (count === 0) {
        clearInterval(countdownInterval);
        beginTest();
      }
    }, 1000);
  };

  const beginTest = () => {
    sensorDataRef.current = [];
    startTimeRef.current = Date.now();
    setTestPhase('testing');
    setProgress(0);

    const testStart = Date.now();
    testIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - testStart;
      const progressPercent = Math.min((elapsed / testDurationRef.current) * 100, 100);
      setProgress(progressPercent);

      if (elapsed >= testDurationRef.current) {
        clearInterval(testIntervalRef.current!);
        completeTest();
      }
    }, 100);
  };

  const completeTest = () => {
    // Stop sensor listening
    if (accelerometerRef.current) {
      accelerometerRef.current.stop();
    }
    if (gyroscopeRef.current) {
      gyroscopeRef.current.stop();
    }

    // Calculate metrics
    if (sensorDataRef.current.length > 0) {
      const calculatedMetrics = calculateSwayMetrics(sensorDataRef.current);
      setMetrics(calculatedMetrics);
    }

    setTestPhase('results');
  };

  const calculateSwayMetrics = (data: SensorData[]): SwayMetrics => {
    if (data.length === 0) {
      return {
        totalSway: 0,
        swayX: 0,
        swayY: 0,
        swayZ: 0,
        tremorsDetected: false,
        tremorFrequency: 0,
        dominantFrequencies: [],
        balance: 'good',
        riskLevel: 'low'
      };
    }

    // Calculate standard deviation for each axis (sway measure)
    const accelerations = {
      x: data.map(d => d.acceleration.x),
      y: data.map(d => d.acceleration.y),
      z: data.map(d => d.acceleration.z)
    };

    const calculateStdDev = (values: number[]) => {
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const squaredDifferences = values.map(v => Math.pow(v - mean, 2));
      const variance = squaredDifferences.reduce((a, b) => a + b, 0) / values.length;
      return Math.sqrt(variance);
    };

    const swayX = calculateStdDev(accelerations.x);
    const swayY = calculateStdDev(accelerations.y);
    const swayZ = calculateStdDev(accelerations.z);
    const totalSway = Math.sqrt(swayX ** 2 + swayY ** 2 + swayZ ** 2);

    // FFT-like analysis for tremor frequency detection
    const dominantFrequencies = analyzeFrequencyContent(accelerations.x, 100); // 100 Hz sampling assumed

    // Detect tremors in 4-6 Hz range
    const parkinsonsRange = dominantFrequencies.filter(
      f => f.frequency >= 4 && f.frequency <= 6
    );
    const tremorsDetected = parkinsonsRange.length > 0;
    const tremorFrequency = parkinsonsRange.length > 0 ? parkinsonsRange[0].frequency : 0;

    // Determine balance quality
    let balance: 'good' | 'fair' | 'poor' = 'good';
    let riskLevel: 'low' | 'moderate' | 'high' = 'low';

    if (totalSway > 1.5) {
      balance = 'poor';
      riskLevel = 'high';
    } else if (totalSway > 0.8) {
      balance = 'fair';
      riskLevel = 'moderate';
    }

    if (tremorsDetected) {
      riskLevel = riskLevel === 'low' ? 'moderate' : 'high';
    }

    return {
      totalSway,
      swayX,
      swayY,
      swayZ,
      tremorsDetected,
      tremorFrequency,
      dominantFrequencies,
      balance,
      riskLevel
    };
  };

  const analyzeFrequencyContent = (
    signal: number[],
    samplingRate: number
  ): Array<{ frequency: number; power: number }> => {
    // Simplified frequency analysis
    const frequencies: Array<{ frequency: number; power: number }> = [];

    for (let freq = 1; freq <= 15; freq += 0.5) {
      let power = 0;
      const omega = (2 * Math.PI * freq) / samplingRate;

      for (let i = 0; i < signal.length; i++) {
        power += signal[i] * Math.cos(omega * i);
      }

      power = Math.abs(power) / signal.length;
      frequencies.push({ frequency: freq, power });
    }

    // Sort by power and return top frequencies
    return frequencies.sort((a, b) => b.power - a.power).slice(0, 5);
  };

  const resetTest = () => {
    sensorDataRef.current = [];
    startTimeRef.current = null;
    setTestPhase('intro');
    setCountdown(0);
    setProgress(0);
    setMetrics(null);
  };

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-6">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>

          <Card className="border-red-200 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-6 h-6" />
                Device Not Supported
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Unfortunately, your device does not have the required motion sensors to perform postural sway analysis.
              </p>
              <p className="text-gray-600 text-sm">
                <strong>Required:</strong> Accelerometer and Gyroscope sensors
              </p>
              <p className="text-gray-600 text-sm">
                <strong>Supported Devices:</strong> Most modern smartphones and tablets running iOS or Android
              </p>
              <Button onClick={() => setLocation("/")} className="w-full">
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>

          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary rounded-xl text-black">
              <Smartphone className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Postural Sway Analysis</h1>
              <p className="text-gray-600">Measure balance and tremor using your device's sensors</p>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {testPhase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-900">
                  <strong>How it works:</strong> This test measures your postural sway (balance) and detects tremors using your device's built-in motion sensors. The test takes 30 seconds to complete.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    Test Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-black flex items-center justify-center font-bold">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Find a Safe Location</h4>
                        <p className="text-sm text-gray-600">Stand in an open area away from obstacles or stairs.</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-black flex items-center justify-center font-bold">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Position Your Device</h4>
                        <p className="text-sm text-gray-600">Place the phone in your shirt pocket or hold it against your chest with both hands.</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-black flex items-center justify-center font-bold">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Stand Still</h4>
                        <p className="text-sm text-gray-600">After the countdown, stand as still as possible for 30 seconds. Keep your feet shoulder-width apart.</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-black flex items-center justify-center font-bold">
                        4
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Receive Results</h4>
                        <p className="text-sm text-gray-600">Get detailed analysis of your balance and tremor patterns.</p>
                      </div>
                    </div>
                  </div>

                  <Alert className="border-orange-200 bg-orange-50 mt-4">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-900 text-sm">
                      <strong>Safety:</strong> Ensure you have a safe space to stand. Do not perform this test near stairs or on unstable surfaces.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    What We Measure
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">Center of Pressure (CoP) Sway</h4>
                    <p className="text-sm text-gray-600">Measures micro-movements in your posture. Higher values may indicate balance issues.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Tremor Frequency</h4>
                    <p className="text-sm text-gray-600">Parkinson's tremors typically occur at 4-6 Hz. We detect and measure frequency patterns.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Balance Assessment</h4>
                    <p className="text-sm text-gray-600">Overall rating of your postural stability: Good, Fair, or Poor.</p>
                  </div>
                </CardContent>
              </Card>

              <motion.div whileHover={{ scale: 1.02 }}>
                <Button
                  size="lg"
                  className="w-full px-8 py-6 text-lg bg-primary hover:bg-primary/90 text-black font-semibold"
                  onClick={startTest}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Test
                </Button>
              </motion.div>
            </motion.div>
          )}

          {testPhase === 'preparing' && (
            <motion.div
              key="preparing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-6"
            >
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-8">
                  <div className="text-center space-y-6">
                    <Smartphone className="w-16 h-16 mx-auto text-blue-600 animate-pulse" />
                    <div>
                      <p className="text-lg font-semibold text-gray-900 mb-2">
                        Get Ready for Testing
                      </p>
                      <p className="text-gray-600 mb-4">
                        Position your device now and prepare to stand still
                      </p>
                    </div>

                    <div className="text-6xl font-bold text-primary animate-bounce">
                      {countdown}
                    </div>

                    <p className="text-sm text-gray-600">
                      The test will begin when the countdown reaches zero
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {testPhase === 'testing' && (
            <motion.div
              key="testing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-6"
            >
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-8">
                  <div className="text-center space-y-6">
                    <Activity className="w-16 h-16 mx-auto text-green-600 animate-bounce" />
                    <div>
                      <p className="text-lg font-semibold text-gray-900 mb-2">
                        Test in Progress
                      </p>
                      <p className="text-gray-600">
                        Stand still and remain stationary
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="text-4xl font-bold text-primary">
                        {Math.round(progress)}%
                      </div>
                      <Progress value={progress} className="h-3" />
                      <p className="text-sm text-gray-600">
                        {Math.round((progress / 100) * 30)} / 30 seconds
                      </p>
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Keep your device in position and remain as still as possible
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {testPhase === 'results' && metrics && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Card className={`border-l-4 ${
                metrics.riskLevel === 'low' ? 'border-green-500 bg-green-50' :
                metrics.riskLevel === 'moderate' ? 'border-orange-500 bg-orange-50' :
                'border-red-500 bg-red-50'
              }`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {metrics.riskLevel === 'low' ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : metrics.riskLevel === 'moderate' ? (
                      <AlertTriangle className="w-6 h-6 text-orange-600" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    )}
                    Test Complete
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">
                    Risk Level: <span className={
                      metrics.riskLevel === 'low' ? 'text-green-600' :
                      metrics.riskLevel === 'moderate' ? 'text-orange-600' :
                      'text-red-600'
                    }>
                      {metrics.riskLevel.toUpperCase()}
                    </span>
                  </p>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Activity className="w-5 h-5" />
                      Balance Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Overall Balance</p>
                      <p className="text-3xl font-bold capitalize text-primary">
                        {metrics.balance}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Total Sway</p>
                      <p className="text-2xl font-bold">{metrics.totalSway.toFixed(3)} m/s²</p>
                      <p className="text-xs text-gray-500">
                        {metrics.totalSway > 1.5 ? 'High sway detected' :
                         metrics.totalSway > 0.8 ? 'Moderate sway' :
                         'Low sway - Good stability'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="w-5 h-5" />
                      Tremor Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Tremors Detected</p>
                      <p className="text-xl font-bold">
                        {metrics.tremorsDetected ? (
                          <span className="text-orange-600 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Yes (Parkinsons Range)
                          </span>
                        ) : (
                          <span className="text-green-600 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            No
                          </span>
                        )}
                      </p>
                    </div>
                    {metrics.tremorsDetected && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Tremor Frequency</p>
                        <p className="text-2xl font-bold">{metrics.tremorFrequency.toFixed(2)} Hz</p>
                        <p className="text-xs text-gray-500">
                          Normal Parkinsons range: 4-6 Hz
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="w-5 h-5" />
                    Detailed Sway Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">X-Axis Sway</p>
                      <p className="text-xl font-bold text-primary">{metrics.swayX.toFixed(3)}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Y-Axis Sway</p>
                      <p className="text-xl font-bold text-primary">{metrics.swayY.toFixed(3)}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Z-Axis Sway</p>
                      <p className="text-xl font-bold text-primary">{metrics.swayZ.toFixed(3)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-4">
                    Sway values represent acceleration standard deviation on each axis (m/s²). Lower values indicate more stable posture.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5" />
                    Frequency Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {metrics.dominantFrequencies.length > 0 ? (
                    <div className="space-y-2">
                      {metrics.dominantFrequencies.map((freq, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium">{freq.frequency.toFixed(2)} Hz</span>
                          <div className="flex-1 mx-4 h-2 bg-gray-200 rounded overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${(freq.power / metrics.dominantFrequencies[0].power) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 w-12 text-right">
                            {(freq.power * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No significant frequency components detected</p>
                  )}
                </CardContent>
              </Card>

              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-900 text-sm">
                  <strong>Disclaimer:</strong> These results are for informational purposes only and should not be used for medical diagnosis. Please consult with a healthcare professional for proper evaluation and diagnosis of Parkinson's disease or other neurological conditions.
                </AlertDescription>
              </Alert>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={resetTest}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Run Test Again
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setLocation("/")}
                >
                  Return Home
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
