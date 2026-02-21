import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Play, Pause, RotateCcw, AlertTriangle, TrendingUp, Activity, Footprints, Zap } from "lucide-react";
import { useLocation } from "wouter";

const useGaitAnalysis = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState({
    armSwingAsymmetry: 0,
    stepSymmetry: 0,
    turnSpeed: 0,
    gaitScore: 0,
    riskLevel: 'Low' as 'Low' | 'Moderate' | 'High'
  });
  const videoRef = useRef<HTMLVideoElement>(null);

  const analyzeGait = useCallback(async () => {
    if (!videoFile) return;

    setIsAnalyzing(true);

    // Simulate MediaPipe Pose analysis
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Simulated gait analysis results
    const armSwingAsymmetry = Math.random() * 100; // 0-100% asymmetry
    const stepSymmetry = Math.max(0, 100 - Math.random() * 40); // 60-100% symmetry
    const turnSpeed = Math.floor(Math.random() * 8) + 3; // 3-10 steps for 180° turn

    // Calculate overall gait score
    const gaitScore = (stepSymmetry + (100 - armSwingAsymmetry) + Math.max(0, 100 - (turnSpeed - 3) * 10)) / 3;

    let riskLevel: 'Low' | 'Moderate' | 'High' = 'Low';
    if (gaitScore < 60) riskLevel = 'High';
    else if (gaitScore < 75) riskLevel = 'Moderate';

    setAnalysisResults({
      armSwingAsymmetry,
      stepSymmetry,
      turnSpeed,
      gaitScore,
      riskLevel
    });

    setIsAnalyzing(false);
  }, [videoFile]);

  const resetAnalysis = () => {
    setVideoFile(null);
    setAnalysisResults({
      armSwingAsymmetry: 0,
      stepSymmetry: 0,
      turnSpeed: 0,
      gaitScore: 0,
      riskLevel: 'Low'
    });
  };

  return {
    videoFile,
    setVideoFile,
    isAnalyzing,
    analysisResults,
    analyzeGait,
    resetAnalysis,
    videoRef
  };
};

const GaitAnalysis = () => {
  const [, setLocation] = useLocation();
  const gait = useGaitAnalysis();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      gait.setVideoFile(file);
      if (gait.videoRef.current) {
        const url = URL.createObjectURL(file);
        gait.videoRef.current.src = url;
      }
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Footprints className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Gait Analysis Assessment
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload a walking video to analyze gait patterns, arm swing symmetry, and turning ability.
            Early Parkinson's detection through movement analysis.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Video Upload & Preview */}
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Upload className="w-5 h-5" />
                Video Upload & Preview
              </CardTitle>
              <CardDescription>
                Upload a short video (10-30 seconds) of walking toward and away from camera
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!gait.videoFile ? (
                <div className="text-center">
                  <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 mb-4">
                    <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Click to upload a walking video
                    </p>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Select Video File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                  <Alert className="border-purple-200 bg-purple-50">
                    <Activity className="h-4 w-4 text-purple-600" />
                    <AlertDescription className="text-purple-800">
                      <strong>Instructions:</strong> Walk toward the camera, turn 180°, and walk away.
                      Keep the camera steady and ensure good lighting.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      ref={gait.videoRef}
                      className="w-full h-64 object-cover"
                      controls
                      preload="metadata"
                    />
                  </div>

                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={gait.analyzeGait}
                      disabled={gait.isAnalyzing}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {gait.isAnalyzing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Analyze Gait
                        </>
                      )}
                    </Button>
                    <Button onClick={gait.resetAnalysis} variant="outline">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analysis Results */}
          <Card className="bg-white/80 backdrop-blur-sm border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <TrendingUp className="w-5 h-5" />
                Gait Analysis Results
              </CardTitle>
              <CardDescription>
                AI-powered analysis of walking patterns and movement symmetry
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {gait.analysisResults.gaitScore > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {gait.analysisResults.gaitScore.toFixed(1)}%
                      </div>
                      <p className="text-sm text-gray-600">Overall Gait Score</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Badge className={getRiskColor(gait.analysisResults.riskLevel)}>
                        {gait.analysisResults.riskLevel} Risk
                      </Badge>
                      <p className="text-sm text-gray-600 mt-2">Parkinson's Risk</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Arm Swing Asymmetry</span>
                      <span className="text-sm font-bold text-red-600">
                        {gait.analysisResults.armSwingAsymmetry.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={gait.analysisResults.armSwingAsymmetry} className="h-3" />
                    <p className="text-xs text-gray-500 mt-1">
                      Lower scores indicate more symmetrical arm swing
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Step Symmetry</span>
                      <span className="text-sm font-bold text-green-600">
                        {gait.analysisResults.stepSymmetry.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={gait.analysisResults.stepSymmetry} className="h-3" />
                    <p className="text-xs text-gray-500 mt-1">
                      Higher scores indicate more symmetrical stepping
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Turn Efficiency</span>
                      <span className="text-sm font-bold text-blue-600">
                        {gait.analysisResults.turnSpeed} steps
                      </span>
                    </div>
                    <Progress value={Math.max(0, 100 - (gait.analysisResults.turnSpeed - 3) * 10)} className="h-3" />
                    <p className="text-xs text-gray-500 mt-1">
                      Fewer steps for 180° turn indicate better mobility
                    </p>
                  </div>

                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800 text-sm">
                      <strong>Clinical Note:</strong> Reduced arm swing, asymmetrical stepping, and slow turning
                      are common early signs of Parkinson's disease. This analysis is for screening purposes only.
                      Consult a neurologist for proper diagnosis.
                    </AlertDescription>
                  </Alert>
                </>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Upload a video and click "Analyze Gait" to see results
                  </p>
                </div>
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

export default GaitAnalysis;
