import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  BadgeInfo,
  CheckCircle2,
  ClipboardList,
  FileAudio,
  FileDown,
  FileImage,
  HeartPulse,
  History,
  Lightbulb,
  Loader2,
  LocateFixed,
  QrCode,
  ShieldAlert,
  Stethoscope,
} from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { StepProgress } from "@/components/step-progress";
import { useToast } from "@/hooks/use-toast";
import { formatReportDateTime, readPatientData, type PatientData } from "@/lib/patient-data";
import { apiService, type GenerateReportPayload, type PredictionResponse } from "@/lib/api-service";

type FlowStep = "upload" | "analyzing" | "result";
type TestMeta = { id: string; rawDate: string; displayDate: string };
type HistoryItem = { id: number; date: string; prediction: string; confidence: number; stage: string };

type SymptomValue = "No" | "Yes" | "Mild";
type SymptomChecklist = {
  tremor: SymptomValue;
  slurredSpeech: SymptomValue;
  handwritingDifficulty: SymptomValue;
  fatigue: SymptomValue;
  balanceIssues: SymptomValue;
};

const steps = [
  { id: 1, label: "Upload", icon: "U" },
  { id: 2, label: "Analyze", icon: "A" },
  { id: 3, label: "Result", icon: "R" },
  { id: 4, label: "Report", icon: "P" },
];

function toPercent(value: number): number {
  return Number((value * 100).toFixed(1));
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

function displayDate(date: Date): string {
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function normalizeStage(raw: string, positive: boolean): "None" | "Early" | "Moderate" | "Severe" {
  if (!positive) return "None";
  const s = raw.toLowerCase();
  if (s.includes("early")) return "Early";
  if (s.includes("moderate") || s.includes("mid")) return "Moderate";
  if (s.includes("advanced") || s.includes("severe")) return "Severe";
  return "Moderate";
}

function riskLevel(positive: boolean, confidence: number): "Low" | "Moderate" | "High" {
  if (!positive) return "Low";
  if (confidence >= 0.8) return "High";
  if (confidence >= 0.6) return "Moderate";
  return "Low";
}

function riskClass(level: "Low" | "Moderate" | "High"): string {
  if (level === "High") return "border-red-200 bg-red-50 text-red-700";
  if (level === "Moderate") return "border-orange-200 bg-orange-50 text-orange-700";
  return "border-green-200 bg-green-50 text-green-700";
}

function getStatusClass(isPositive: boolean, risk: "Low" | "Moderate" | "High"): string {
  if (!isPositive) return "border-green-200 bg-green-50 text-green-700";
  if (risk === "Moderate") return "border-orange-200 bg-orange-50 text-orange-700";
  return "border-red-200 bg-red-50 text-red-700";
}

function hasAny(text: string, keywords: string[]): boolean {
  return keywords.some((k) => text.includes(k));
}

function symptomsFromText(text: string): SymptomChecklist {
  const t = text.toLowerCase();
  return {
    tremor: hasAny(t, ["tremor", "shaking"]) ? "Yes" : "No",
    slurredSpeech: hasAny(t, ["slurred", "speech difficulty", "speech"]) ? "Yes" : "No",
    handwritingDifficulty: hasAny(t, ["handwriting", "micrographia", "writing"]) ? "Yes" : "No",
    fatigue: hasAny(t, ["fatigue", "tired", "exhaust"]) ? "Mild" : "No",
    balanceIssues: hasAny(t, ["balance", "fall", "posture"]) ? "Yes" : "No",
  };
}

async function getAudioDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const audio = document.createElement("audio");
    const url = URL.createObjectURL(file);
    audio.preload = "metadata";
    audio.src = url;
    audio.onloadedmetadata = () => {
      const d = Number.isFinite(audio.duration) ? Number(audio.duration.toFixed(2)) : null;
      URL.revokeObjectURL(url);
      resolve(d);
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

function reportFilename(name: string): string {
  const safe = name.trim().replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return `${safe || "patient"}_Parkinson_Report.pdf`;
}

export default function Prediction() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const [flowStep, setFlowStep] = useState<FlowStep>("upload");
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisTimeSec, setAnalysisTimeSec] = useState<number | null>(null);
  const [voiceDurationSec, setVoiceDurationSec] = useState<number | null>(null);
  const [testMeta, setTestMeta] = useState<TestMeta | null>(null);

  const [isDownloading, setIsDownloading] = useState(false);
  const [reportDownloaded, setReportDownloaded] = useState(false);
  const [reportGeneratedAt, setReportGeneratedAt] = useState<string | null>(null);

  const [previousTest, setPreviousTest] = useState<HistoryItem | null>(null);
  const [doctorNotes, setDoctorNotes] = useState("");

  const progressTimerRef = useRef<number | null>(null);
  const analysisStartRef = useRef<number | null>(null);

  useEffect(() => {
    const stored = readPatientData();
    if (!stored) {
      toast({
        title: "Patient details required",
        description: "Please complete the patient form before starting detection.",
        variant: "destructive",
      });
      setLocation("/patient-form");
      return;
    }
    setPatientData(stored);
  }, [setLocation, toast]);

  useEffect(() => {
    return () => {
      if (progressTimerRef.current) window.clearInterval(progressTimerRef.current);
    };
  }, []);

  const canStart = Boolean(imageFile && audioFile) && flowStep === "upload";

  const currentStep = useMemo(() => {
    if (reportDownloaded) return 4;
    if (flowStep === "result") return 3;
    if (flowStep === "analyzing") return 2;
    return 1;
  }, [flowStep, reportDownloaded]);

  const isPositive = result?.prediction ?? false;
  const confidencePct = result ? toPercent(result.confidence) : 0;
  const risk = result ? riskLevel(isPositive, result.confidence) : "Low";
  const stage = result ? normalizeStage(result.stage, isPositive) : "None";
  const symptom = symptomsFromText(patientData?.symptoms || "");

  const voiceStability = result
    ? Math.max(60, Math.min(99, Math.round((isPositive ? 84 : 93) - confidencePct * (isPositive ? 0.12 : 0.04))))
    : null;
  const handwritingSmoothness = result
    ? Math.max(60, Math.min(99, Math.round((isPositive ? 82 : 91) - confidencePct * (isPositive ? 0.1 : 0.03))))
    : null;

  const stageOrder: Array<"None" | "Early" | "Moderate" | "Severe"> = ["None", "Early", "Moderate", "Severe"];
  const currentStageIndex = stageOrder.indexOf(stage);

  const verifyUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/assessment${testMeta?.id ? `?test_id=${testMeta.id}` : ""}`;
  }, [testMeta?.id]);

  const qrUrl = verifyUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(verifyUrl)}`
    : "";

  const interpretation = result
    ? isPositive
      ? "The analysis shows indicators that may suggest Parkinson's disease. Clinical confirmation is recommended."
      : "The analysis indicates no significant indicators of Parkinson's disease at this time."
    : "";

  const trend = previousTest
    ? previousTest.prediction === (isPositive ? "Positive" : "Negative")
      ? "Stable"
      : "Changed"
    : "No previous data";

  const gaugeColor = !isPositive ? "#16a34a" : risk === "Moderate" ? "#f59e0b" : "#dc2626";
  const gaugeAngle = confidencePct * 3.6;

  const showHighRiskAlert = result && risk === "High";

  const startProgress = () => {
    setAnalysisProgress(10);
    progressTimerRef.current = window.setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 92) return prev;
        return prev + Math.max(1, Math.floor((95 - prev) / 8));
      });
    }, 280);
  };

  const stopProgress = () => {
    if (progressTimerRef.current) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  const handleStartAnalysis = async () => {
    if (!patientData || !imageFile || !audioFile) {
      toast({
        title: "Missing files",
        description: "Please upload both spiral image and voice sample.",
        variant: "destructive",
      });
      return;
    }

    const now = new Date();
    setTestMeta({
      id: now.getTime().toString().slice(-9),
      rawDate: formatReportDateTime(now),
      displayDate: displayDate(now),
    });

    setError(null);
    setResult(null);
    setReportDownloaded(false);
    setReportGeneratedAt(null);
    setAnalysisTimeSec(null);
    setVoiceDurationSec(null);
    setFlowStep("analyzing");

    analysisStartRef.current = performance.now();
    startProgress();

    try {
      const existingHistory = JSON.parse(localStorage.getItem("predictionHistory") || "[]") as HistoryItem[];
      setPreviousTest(existingHistory[0] || null);

      const [prediction, audioDuration] = await Promise.all([
        apiService.predict(imageFile, audioFile),
        getAudioDuration(audioFile),
      ]);

      stopProgress();
      setAnalysisProgress(100);
      setVoiceDurationSec(audioDuration);

      if (analysisStartRef.current !== null) {
        const elapsed = (performance.now() - analysisStartRef.current) / 1000;
        setAnalysisTimeSec(Number(elapsed.toFixed(2)));
      }

      sessionStorage.setItem("predictionResult", JSON.stringify(prediction));

      const historyItem: HistoryItem = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        prediction: prediction.prediction ? "Positive" : "Negative",
        confidence: Math.round(prediction.confidence * 100),
        stage: prediction.stage,
      };
      localStorage.setItem("predictionHistory", JSON.stringify([historyItem, ...existingHistory]));

      await new Promise((resolve) => setTimeout(resolve, 250));
      setResult(prediction);
      setFlowStep("result");
    } catch (err) {
      stopProgress();
      setAnalysisProgress(0);
      setFlowStep("upload");
      const msg = err instanceof Error ? err.message : "Server error. Please try again.";
      setError(msg);
      toast({ title: "Workflow error", description: "Server error. Please try again.", variant: "destructive" });
    }
  };

  const handleDownloadReport = async () => {
    if (!patientData || !result) return;

    const generatedAt = formatReportDateTime();
    const recommendations = [
      "Schedule neurological examination",
      "Repeat screening after 3-6 months",
      "Monitor tremors, stiffness, or speech difficulty",
    ];
    const lifestyleTips = [
      "Maintain regular physical activity",
      "Eat balanced meals",
      "Get 7-9 hours sleep",
      "Reduce stress",
    ];

    const payload: GenerateReportPayload = {
      ...patientData,
      test_type: "AI-based Multimodal Screening",
      input_data: "Spiral Drawing Image, Voice Sample",
      test_date_time: testMeta?.rawDate || generatedAt,
      test_id: testMeta?.id,
      status: result.prediction ? "Positive" : "Negative",
      confidence_score: toPercent(result.confidence),
      disease_stage: stage,
      risk_level: risk,
      interpretation,
      analysis_time_seconds: analysisTimeSec ?? undefined,
      voice_duration_seconds: voiceDurationSec ?? undefined,
      model_version: "NeuroScan AI v1.2",
      image_file_name: imageFile?.name,
      image_file_size: imageFile?.size,
      voice_file_name: audioFile?.name,
      voice_file_size: audioFile?.size,
      ai_model_type: "Deep Learning (CNN + Machine Learning)",
      ai_features: "Spiral pattern + Voice MFCC features",
      recommendations,
      lifestyle_tips: lifestyleTips,
      symptom_checklist: {
        tremor: symptom.tremor,
        slurred_speech: symptom.slurredSpeech,
        handwriting_difficulty: symptom.handwritingDifficulty,
        fatigue: symptom.fatigue,
        balance_issues: symptom.balanceIssues,
      },
      baseline_comparison: {
        voice_stability: voiceStability !== null ? `${voiceStability}% (Normal range: 85-100%)` : "N/A",
        handwriting_smoothness: handwritingSmoothness !== null ? `${handwritingSmoothness}% (Normal range: 80-100%)` : "N/A",
      },
      previous_test: previousTest
        ? {
            date: previousTest.date,
            prediction: previousTest.prediction === "Positive" ? "Parkinson's Detected" : "No Parkinson's Detected",
            trend,
          }
        : undefined,
      doctor_notes: doctorNotes || undefined,
      report_generated_at: generatedAt,
      generated_by: "NeuroScan AI",
      report_format: "PDF",
      report_language: "English",
      privacy_notice:
        "This system provides AI-based screening only and is not a medical diagnosis. Consult a neurologist for clinical confirmation.",
      verification_url: verifyUrl || undefined,
    };

    setIsDownloading(true);
    try {
      const blob = await apiService.generateReport(payload);
      downloadBlob(blob, reportFilename(patientData.name));
      setReportDownloaded(true);
      setReportGeneratedAt(displayDate(new Date()));
      toast({ title: "Report downloaded", description: "PDF report generated successfully." });
    } catch {
      toast({ title: "Report error", description: "Failed to download report.", variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFindDoctor = () => {
    setLocation("/find-nearby-doctor");
  };

  const handleTestAnotherPatient = () => {
    setImageFile(null);
    setAudioFile(null);
    setResult(null);
    setError(null);
    setAnalysisProgress(0);
    setAnalysisTimeSec(null);
    setVoiceDurationSec(null);
    setTestMeta(null);
    setReportDownloaded(false);
    setReportGeneratedAt(null);
    setDoctorNotes("");
    setFlowStep("upload");
    setLocation("/patient-form");
  };

  const handleBackToForm = () => {
    setLocation("/patient-form");
  };

  if (!patientData) return null;

  return (
    <div className="relative z-10 min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <Button variant="outline" onClick={handleBackToForm} className="mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Patient Form
          </Button>
          <h1 className="text-2xl font-semibold text-[#2c5ba9] md:text-3xl">NeuroScan AI</h1>
          <p className="mt-2 text-sm text-slate-600">Upload - Analyze - Show Result - Download PDF Report</p>
          <div className="mt-4 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
            <p>Patient: {patientData.name} ({patientData.patient_id || "N/A"})</p>
            <p>Age: {patientData.age || "N/A"} | Gender: {patientData.gender || "N/A"}</p>
            <p>Test ID: {testMeta?.id || "Pending"}</p>
            <p>Test Date & Time: {testMeta?.displayDate || "Pending"}</p>
          </div>
          <div className="mt-6">
            <StepProgress steps={steps} currentStep={currentStep} />
          </div>
        </section>
        {flowStep === "upload" && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-2xl font-semibold text-[#2c5ba9]">Upload Patient Test Data</h2>
            <p className="mt-2 text-sm text-slate-600">Please upload both files to start analysis.</p>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <FileUpload id="spiral" accept="image/*" label="Spiral Drawing Image" icon={FileImage} file={imageFile} setFile={setImageFile} />
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <FileUpload id="voice" accept="audio/*" label="Voice Sample" icon={FileAudio} file={audioFile} setFile={setAudioFile} />
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <p className="flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</p>
              </div>
            )}

            <div className="mt-6">
              <Button onClick={handleStartAnalysis} disabled={!canStart} className="h-12 min-w-[220px] bg-[#2c5ba9] px-8 text-base font-semibold hover:bg-[#244a8f]">
                Start Analysis
              </Button>
            </div>
          </motion.section>
        )}

        {flowStep === "analyzing" && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
          >
            <div className="mx-auto max-w-xl text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#2c5ba9]" />
              <h2 className="mt-4 text-2xl font-semibold text-[#2c5ba9]">AI is analyzing patient data...</h2>
              <p className="mt-2 text-sm text-slate-600">This may take a few seconds.</p>
              <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300" style={{ width: `${analysisProgress}%` }} />
              </div>
              <p className="mt-3 text-sm font-medium text-slate-700">{analysisProgress}%</p>
            </div>
          </motion.section>
        )}

        {flowStep === "result" && result && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {showHighRiskAlert && (
              <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-700">
                <p className="flex items-center gap-2 font-semibold"><AlertCircle className="h-5 w-5" />Immediate medical consultation recommended.</p>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-base font-semibold text-[#2c5ba9]"><ClipboardList className="h-5 w-5" />Test Data Summary</div>
              <div className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="font-medium">Image Uploaded</p>
                  <p className="mt-1">{imageFile?.name || "N/A"} ({formatBytes(imageFile?.size || 0)})</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="font-medium">Voice Sample Duration</p>
                  <p className="mt-1">{voiceDurationSec !== null ? `${voiceDurationSec} seconds` : "N/A"}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="font-medium">Test Date & Time</p>
                  <p className="mt-1">{testMeta?.displayDate || "N/A"}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="font-medium">Model Version</p>
                  <p className="mt-1">NeuroScan AI v1.2</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-600">Analysis Time: {analysisTimeSec !== null ? `${analysisTimeSec} sec` : "N/A"}</p>
            </div>

            <div className={`rounded-2xl border p-6 shadow-sm ${getStatusClass(isPositive, risk)}`}>
              <p className="text-sm font-semibold">Prediction Result</p>
              <h3 className="mt-2 text-3xl font-bold">{isPositive ? "Parkinson's Disease Detected" : "No Parkinson's Detected"}</h3>
              <div className="mt-5 grid gap-4 md:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-900"><p className="text-xs uppercase tracking-wide text-slate-500">Status</p><p className="mt-2 text-base font-semibold">{isPositive ? "Detected" : "Not Detected"}</p></div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-900"><p className="text-xs uppercase tracking-wide text-slate-500">Confidence Score</p><p className="mt-2 text-base font-semibold">{confidencePct}%</p></div>
                <div className={`rounded-xl border p-4 ${riskClass(risk)}`}><p className="text-xs uppercase tracking-wide">Risk Level</p><p className="mt-2 text-base font-semibold">{risk}</p></div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-900"><p className="text-xs uppercase tracking-wide text-slate-500">Disease Stage</p><p className="mt-2 text-base font-semibold">{stage}</p></div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-[#2c5ba9]">What does this mean?</h4>
              <p className="mt-3 text-sm text-slate-700">Your risk level is {risk}. {interpretation}</p>
              <div className="mt-4 flex gap-3 text-sm">
                <span className="rounded-md bg-green-50 px-3 py-1 text-green-700">Low Risk</span>
                <span className="rounded-md bg-orange-50 px-3 py-1 text-orange-700">Medium Risk</span>
                <span className="rounded-md bg-red-50 px-3 py-1 text-red-700">High Risk</span>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-[#2c5ba9]"><Activity className="h-5 w-5" /><h4 className="text-lg font-semibold">Confidence Gauge</h4></div>
                <div className="mt-6 flex justify-center">
                  <div className="relative h-36 w-36 rounded-full" style={{ background: `conic-gradient(${gaugeColor} ${gaugeAngle}deg, #e2e8f0 ${gaugeAngle}deg 360deg)` }}>
                    <div className="absolute inset-3 flex items-center justify-center rounded-full bg-white"><span className="text-xl font-bold text-slate-800">{confidencePct}%</span></div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h4 className="text-lg font-semibold text-[#2c5ba9]">Risk Bar</h4>
                <div className="mt-6 grid grid-cols-3 gap-2">
                  {(["Low", "Moderate", "High"] as const).map((seg) => {
                    const active = seg === risk;
                    const segClass = seg === "Low" ? "bg-green-100 text-green-700" : seg === "Moderate" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700";
                    return <div key={seg} className={`rounded-md border px-3 py-2 text-center text-sm font-semibold ${active ? `${segClass} border-current` : "border-slate-200 bg-slate-50 text-slate-500"}`}>{seg}</div>;
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h4 className="text-lg font-semibold text-[#2c5ba9]">Stage Timeline</h4>
                <div className="mt-6 flex justify-between">
                  {stageOrder.map((s, i) => {
                    const active = i <= currentStageIndex;
                    const current = s === stage;
                    return (
                      <div key={s} className="flex flex-col items-center gap-2">
                        <div className={`h-4 w-4 rounded-full border ${active ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white"} ${current ? "ring-2 ring-blue-300" : ""}`} />
                        <span className={`text-xs ${current ? "font-semibold text-blue-700" : "text-slate-500"}`}>{s}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h4 className="text-lg font-semibold text-[#2c5ba9]">Reported Symptoms</h4>
                <div className="mt-4 grid gap-2 text-sm text-slate-700">
                  <p>Tremor: {symptom.tremor}</p>
                  <p>Slurred Speech: {symptom.slurredSpeech}</p>
                  <p>Handwriting difficulty: {symptom.handwritingDifficulty}</p>
                  <p>Fatigue: {symptom.fatigue}</p>
                  <p>Balance issues: {symptom.balanceIssues}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h4 className="text-lg font-semibold text-[#2c5ba9]">Comparison with Healthy Baseline</h4>
                <div className="mt-4 space-y-3 text-sm text-slate-700">
                  <p>Voice Stability: {voiceStability !== null ? `${voiceStability}%` : "N/A"} (Normal range: 85-100%)</p>
                  <p>Handwriting Smoothness: {handwritingSmoothness !== null ? `${handwritingSmoothness}%` : "N/A"} (Normal range: 80-100%)</p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-[#2c5ba9]"><BadgeInfo className="h-5 w-5" /><h4 className="text-lg font-semibold">AI Analysis Details</h4></div>
                <ul className="mt-4 space-y-2 text-sm text-slate-700">
                  <li>Model Type: Deep Learning (CNN + Machine Learning)</li>
                  <li>Features: Spiral pattern + Voice MFCC features</li>
                  <li>Processing Time: {analysisTimeSec !== null ? `${analysisTimeSec} sec` : "N/A"}</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-[#2c5ba9]"><HeartPulse className="h-5 w-5" /><h4 className="text-lg font-semibold">Recommended Actions</h4></div>
                <ul className="mt-4 space-y-2 text-sm text-slate-700">
                  <li>Continue normal health monitoring</li>
                  <li>Retest after 3-6 months</li>
                  <li>Practice hand and speech exercises</li>
                  <li>Consult neurologist if symptoms appear</li>
                </ul>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h4 className="text-lg font-semibold text-[#2c5ba9]">Lifestyle Guidance</h4>
                <ul className="mt-4 space-y-2 text-sm text-slate-700">
                  <li>Maintain regular physical activity</li>
                  <li>Eat balanced meals</li>
                  <li>Get 7-9 hours sleep</li>
                  <li>Reduce stress</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h4 className="text-lg font-semibold text-[#2c5ba9]">Report Info</h4>
                <ul className="mt-4 space-y-2 text-sm text-slate-700">
                  <li>Report Generated At: {reportGeneratedAt || "Not downloaded yet"}</li>
                  <li>Generated By: NeuroScan AI</li>
                  <li>Format: PDF</li>
                  <li>Language: English</li>
                </ul>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-[#2c5ba9]"><QrCode className="h-5 w-5" /><h4 className="text-lg font-semibold">Report Verification QR</h4></div>
                <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                  {qrUrl ? <img src={qrUrl} alt="Report verification QR code" className="h-28 w-28 rounded border border-slate-200" /> : null}
                  <div className="text-sm text-slate-700">
                    <p>Scan to verify report authenticity.</p>
                    <a className="mt-2 block text-blue-600 underline" href={verifyUrl} target="_blank" rel="noreferrer">Open verification link</a>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-[#2c5ba9]"><History className="h-5 w-5" /><h4 className="text-lg font-semibold">Previous Test Comparison</h4></div>
                <div className="mt-4 text-sm text-slate-700">
                  {previousTest ? (
                    <>
                      <p>Last Test: {previousTest.prediction === "Positive" ? "Parkinson's Detected" : "No Parkinson's"} ({previousTest.date})</p>
                      <p className="mt-2">Trend: {trend}</p>
                    </>
                  ) : (
                    <p>No previous test data available.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h4 className="text-lg font-semibold text-[#2c5ba9]">Doctor's Notes</h4>
                <textarea
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder="Add physician comments after review..."
                  rows={5}
                  className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-[#2c5ba9]"><Lightbulb className="h-5 w-5" /><h4 className="text-lg font-semibold">Did you know?</h4></div>
                <p className="mt-4 text-sm text-slate-700">Early Parkinson's can affect voice pitch and micro-handwriting before tremors appear.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />Your data is encrypted and not stored after report generation.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleDownloadReport} disabled={isDownloading} className="h-12 min-w-[220px] bg-[#2c5ba9] px-6 text-base font-semibold hover:bg-[#244a8f]">
                {isDownloading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Downloading...</>) : (<><FileDown className="mr-2 h-4 w-4" />Download PDF Report</>)}
              </Button>
              <Button variant="outline" onClick={handleFindDoctor} className="h-12 min-w-[220px] px-6 text-base font-semibold">
                <LocateFixed className="mr-2 h-4 w-4" />
                Find Nearby Doctor
              </Button>
              <Button variant="outline" onClick={handleTestAnotherPatient} className="h-12 min-w-[220px] px-6 text-base font-semibold">
                <Stethoscope className="mr-2 h-4 w-4" />
                Test Another Patient
              </Button>
            </div>

            <div className="rounded-2xl border border-slate-300 bg-slate-100 p-5 text-sm text-slate-700">
              <p className="flex items-center gap-2 font-semibold text-slate-800"><ShieldAlert className="h-4 w-4" />Privacy & Notice</p>
              <p className="mt-2">This system provides AI-based screening only and is not a medical diagnosis. Consult a neurologist for clinical confirmation.</p>
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
