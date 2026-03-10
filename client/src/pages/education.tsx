import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Points, PointMaterial, Float } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import {
  Volume2,
  VolumeX,
  Headphones,
  Waves,
  Sparkles,
  Radio,
  Play,
  Pause,
  Cpu,
  ArrowRight,
  Brain,
  Activity,
  Shield,
  Timer,
  MessageSquare,
  ChevronRight,
  Lightbulb,
  Trophy,
  Cast,
  Scan,
  X,
} from "lucide-react";
import { useLocation } from "wouter";
import { BackendConfigButton } from "@/components/backend-config";

// ---------- 3D BRAIN ----------
function BrainCore({ tremor }: { tremor: number }) {
  const ref = useRef<any>(null);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.y = t * 0.2;
      ref.current.rotation.x = 0.2 + Math.sin(t * 0.5) * 0.05;
      ref.current.scale.setScalar(1 + tremor * 0.01 * Math.sin(t * 6));
    }
  });
  return (
    <Float speed={2} rotationIntensity={0.6} floatIntensity={0.9}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[1.4, 3]} />
        <meshStandardMaterial
          color="#2563eb"
          emissive="#2563eb"
          emissiveIntensity={0.8}
          metalness={0.5}
          roughness={0.25}
        />
      </mesh>
    </Float>
  );
}

function SubstantiaNigraPulse() {
  const ref = useRef<any>(null);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
      const scale = 0.22 + 0.05 * Math.sin(t * 4);
      ref.current.scale.setScalar(scale);
      ref.current.material.emissiveIntensity = 1 + 0.8 * Math.sin(t * 4);
    }
  });
  return (
    <mesh ref={ref} position={[0.2, -0.15, 0.1]}>
      <sphereGeometry args={[0.2, 32, 32]} />
      <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.2} />
    </mesh>
  );
}

function NeuralParticles() {
  const count = 500;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      arr[i] = (Math.random() - 0.5) * 8;
    }
    return arr;
  }, []);
  return (
    <Points positions={positions} stride={3}>
      <PointMaterial transparent color="#60a5fa" size={0.03} sizeAttenuation depthWrite={false} />
    </Points>
  );
}

// ---------- DATA ----------
const storyScenes = [
  {
    title: "Healthy Brain",
    desc: "Signals flow smoothly to guide steady movement.",
    color: "#34d399",
  },
  {
    title: "Early Parkinson’s",
    desc: "Some cells slow down, so signals get softer.",
    color: "#f59e0b",
  },
  {
    title: "Movement Changes",
    desc: "Shaking and stiffness appear as signals get noisy.",
    color: "#ef4444",
  },
];

const microCards = [
  { title: "Why does shaking happen?", body: "Some brain cells slow down, so signals to the hand are not smooth." },
  { title: "Why does walking slow?", body: "Lower signal strength makes steps shorter and slower." },
  { title: "Why does voice change?", body: "Weaker signals to voice muscles can make speech soft or shaky." },
];

const quizQuestions = [
  { q: "Which chemical helps control movement?", options: ["Dopamine", "Calcium", "Salt", "Sugar"], answer: 0 },
  { q: "Which area slows down in Parkinson’s?", options: ["Substantia Nigra", "Skin", "Lungs", "Stomach"], answer: 0 },
  { q: "An early sign can be?", options: ["Shaking at rest", "High fever", "Back rash", "Tooth pain"], answer: 0 },
  { q: "Voice may become?", options: ["Softer or monotone", "Very loud", "High-pitched", "Auto-tuned"], answer: 0 },
  { q: "Parkinson’s mainly affects?", options: ["Movement control", "Hair color", "Vision sharpness", "Blood type"], answer: 0 },
];

// ---------- COMPONENT ----------
export default function Education() {
  const [, setLocation] = useLocation();
  const [voiceOn, setVoiceOn] = useState(false);
  const [narrationIndex, setNarrationIndex] = useState(0);
  const [showARHint, setShowARHint] = useState(false);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [tremor, setTremor] = useState(20);
  const [speech, setSpeech] = useState(20);
  const [posture, setPosture] = useState(20);
  const [dopamineMode, setDopamineMode] = useState<"healthy" | "parkinson">("healthy");
  const [quizStep, setQuizStep] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [timeline, setTimeline] = useState(0);
  const [chatOpen, setChatOpen] = useState(true);
  const explanationRef = useRef<HTMLDivElement | null>(null);
  const [sectionGlow, setSectionGlow] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const glowIntensity = useTransform(useMotionValue(tremor), [0, 100], [0.4, 1.4]);

  const speak = (text: string) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 1;
    utter.voice = speechSynthesis.getVoices().find((v) => v.lang.startsWith("en")) || null;
    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
  };

  // simple narration using Web Speech
  useEffect(() => {
    if (!voiceOn) return;
    speak(storyScenes[narrationIndex]?.desc || "Parkinson's Learning Lab");
    return () => speechSynthesis.cancel();
  }, [voiceOn, narrationIndex]);

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === quizQuestions[quizStep].answer) setScore((s) => s + 20);
    setTimeout(() => {
      setSelected(null);
      setQuizStep((s) => Math.min(s + 1, quizQuestions.length - 1));
    }, 900);
  };

  const progress = ((quizStep + (selected !== null ? 1 : 0)) / quizQuestions.length) * 100;

  const handleRegionClick = () => {
    setNarrationIndex(1);
    setVoiceOn(true);
    speak("This area helps control movement. In Parkinson’s it slows down, so signals become softer.");
    if (explanationRef.current) {
      explanationRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      setSectionGlow(true);
      setTimeout(() => setSectionGlow(false), 2200);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white relative overflow-hidden">
      <BackendConfigButton />

      {/* Animated neuron network background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: [0.15, 0.25, 0.15], rotate: [0, 360] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          style={{
            background:
              "radial-gradient(circle at 20% 30%, rgba(37,99,235,0.12), transparent 45%), radial-gradient(circle at 80% 70%, rgba(52,211,153,0.12), transparent 40%)",
          }}
        />
      </div>

      {/* Voice toggle */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-2">
        <Button
          variant="outline"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          onClick={() => setVoiceOn((v) => !v)}
        >
          {voiceOn ? <Volume2 className="w-4 h-4 mr-2" /> : <VolumeX className="w-4 h-4 mr-2" />}
          Narration
        </Button>
        {voiceOn && (
          <div className="flex gap-1">
            {[0, 1, 2].map((b) => (
              <motion.span
                key={b}
                className="w-1.5 rounded-full bg-cyan-300"
                animate={{ height: [6, 18, 10, 16] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: b * 0.15 }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Hero */}
      <section className="relative grid lg:grid-cols-2 gap-10 items-center px-6 lg:px-16 pt-16 pb-10">
        <div className="relative h-[480px] rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb]/20 via-transparent to-[#34d399]/10 blur-3xl" />
          <Canvas camera={{ position: [0, 0, 5] }}>
            <ambientLight intensity={0.6} />
            <pointLight position={[5, 5, 5]} intensity={1.2} color="#60a5fa" />
            <pointLight position={[-4, -3, -2]} intensity={0.8} color="#ef4444" />
            <NeuralParticles />
            <BrainCore tremor={tremor} />
            <mesh onClick={handleRegionClick}>
              <SubstantiaNigraPulse />
            </mesh>
            <OrbitControls enablePan={false} enableDamping dampingFactor={0.08} />
          </Canvas>
          <div className="absolute bottom-4 left-4 right-4 text-center text-sm text-gray-200">
            Click the softly glowing spot to learn how it affects movement.
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-200 text-sm">
            <Sparkles className="w-4 h-4" />
            Parkinson’s Learning Lab
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
            Understanding Parkinson’s Through Interactive AI Visualization
          </h1>
          <p className="text-gray-300 text-lg">
            Learn in simple words how Parkinson’s affects movement, with calm visuals and easy steps.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              className="bg-[#2563eb] hover:bg-[#1f4fc4] px-6"
              onClick={() => setNarrationIndex((i) => (i + 1) % storyScenes.length)}
            >
              Start Learning
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              className="border-white/20 text-white"
              onClick={() => setShowARHint(true)}
            >
              <Cast className="w-4 h-4 mr-2" />
              View Brain in Your Space
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Video explainer */}
      <section className="px-6 lg:px-16 pb-12">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Video: Understanding Parkinson’s</h3>
            <span className="text-sm text-gray-400">YouTube • NAfQoviLFR8</span>
          </div>
          {!showVideo ? (
            <button
              onClick={() => setShowVideo(true)}
              className="relative w-full aspect-video bg-black text-left"
            >
              <img
                src="https://img.youtube.com/vi/NAfQoviLFR8/hqdefault.jpg"
                alt="Parkinson’s video thumbnail"
                className="absolute inset-0 w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-lg">
                  <Play className="w-7 h-7 text-[#2563eb] ml-1" />
                </div>
              </div>
              <div className="absolute bottom-3 right-3 text-xs text-white/80 bg-black/50 px-2 py-1 rounded-full">
                Tap to play
              </div>
            </button>
          ) : (
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <iframe
                className="absolute inset-0 w-full h-full rounded-b-3xl"
                src="https://www.youtube.com/embed/NAfQoviLFR8?autoplay=1"
                title="Parkinson's Education Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          )}
          <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-300">
            <span>If playback is blocked, open on YouTube.</span>
            <a
              href="https://youtu.be/NAfQoviLFR8"
              target="_blank"
              rel="noreferrer"
              className="text-[#2563eb] hover:underline"
            >
              Open in YouTube
            </a>
          </div>
        </div>
      </section>

      {/* AR hint overlay */}
      <AnimatePresence>
        {showARHint && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowARHint(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-slate-900/90 p-6 rounded-2xl max-w-md text-center border border-white/10"
            >
              <h3 className="text-xl font-semibold mb-2">AR Mode</h3>
              <p className="text-gray-300 mb-4">
                Move your phone to detect a surface, then place the 3D brain model. Lighting will match the labâ€™s blue glow.
              </p>
              <Button className="w-full bg-[#2563eb]" onClick={() => setShowARHint(false)}>
                Launch AR (Quick Look / WebXR)
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Storytelling */}
      <section className="px-6 lg:px-16 py-12 space-y-6">
        <div className="flex items-center gap-3">
          <Radio className="text-cyan-300" />
          <h2 className="text-2xl font-semibold">Scroll Story</h2>
        </div>
        <div className="grid lg:grid-cols-3 gap-4">
          {storyScenes.map((scene, idx) => (
            <motion.div
              key={scene.title}
              className={`p-5 rounded-2xl border border-white/10 bg-white/5 cursor-pointer`}
              onMouseEnter={() => {
                setSceneIndex(idx);
                setNarrationIndex(idx);
              }}
              animate={{ scale: sceneIndex === idx ? 1.02 : 1 }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Scene {idx + 1}</span>
                <span className="w-2 h-2 rounded-full" style={{ background: scene.color }} />
              </div>
              <h3 className="text-xl font-semibold mt-2">{scene.title}</h3>
              <p className="text-gray-300 text-sm mt-2">{scene.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Symptom simulator */}
      <section className="px-6 lg:px-16 py-10 grid lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Interactive Symptom Simulator</h2>
          <p className="text-gray-300">
            Move the sliders to see a gentle demo of shaking hands, softer voice, and stiff posture. This is only for learning.
          </p>
          {[
            { label: "Tremor Level", value: tremor, setter: setTremor },
            { label: "Speech Difficulty", value: speech, setter: setSpeech },
            { label: "Posture Instability", value: posture, setter: setPosture },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-sm mb-1">
                <span>{item.label}</span>
                <span className="text-gray-400">{item.value}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={item.value}
                onChange={(e) => item.setter(parseInt(e.target.value))}
                className="w-full accent-[#2563eb]"
              />
            </div>
          ))}
        </div>
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4">
          <div className="flex items-center gap-3">
            <Activity className="text-cyan-300" />
            <span className="text-lg font-semibold">Response Preview</span>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 text-sm text-gray-300">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              Brain Glow
              <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full bg-[#2563eb]"
                  animate={{ width: `${glowIntensity.get() * 60}%` }}
                  transition={{ type: "spring", stiffness: 120 }}
                />
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              Voice Stability
              <motion.div
                className="mt-3 flex gap-1"
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {[0, 1, 2, 3].map((b) => (
                  <span
                    key={b}
                    className="w-2 bg-cyan-300 rounded-full"
                    style={{ height: `${12 + speech * 0.1 * (b + 1)}px` }}
                  />
                ))}
              </motion.div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              Posture Drift
              <motion.div
                className="mt-2 h-16 w-1 bg-white/20 mx-auto relative"
                animate={{ rotate: `${(posture - 50) * 0.3}deg` }}
              >
                <span className="absolute -left-2 -top-3 w-4 h-4 rounded-full bg-[#34d399]" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Dopamine flow */}
      <section className="px-6 lg:px-16 py-10 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-2xl font-semibold">Dopamine Flow Visualization</h2>
          <p
            ref={explanationRef}
            className={`text-gray-300 mt-2 transition shadow-none ${
              sectionGlow ? "ring-2 ring-[#34d399] ring-offset-2 ring-offset-[#0f172a] rounded-xl" : ""
            }`}
          >
            Toggle between healthy and Parkinson’s states to see how dopamine pathways are disrupted.
          </p>
          <div className="flex gap-3 mt-4">
            <Button
              variant={dopamineMode === "healthy" ? "default" : "outline"}
              className="bg-[#2563eb] hover:bg-[#1f4fc4]"
              onClick={() => setDopamineMode("healthy")}
            >
              Healthy Flow
            </Button>
            <Button
              variant={dopamineMode === "parkinson" ? "default" : "outline"}
              className="border-[#ef4444] text-[#ef4444]"
              onClick={() => setDopamineMode("parkinson")}
            >
              Parkinson’s Mode
            </Button>
          </div>
        </div>
        <div className="relative p-6 rounded-2xl border border-white/10 bg-white/5">
          <svg viewBox="0 0 400 220" className="w-full h-full">
            <defs>
              <linearGradient id="dopamine" x1="0%" x2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
            </defs>
            {[0, 1, 2].map((row) => (
              <motion.path
                key={row}
                d={`M30 ${60 + row * 40} C 140 ${30 + row * 50}, 260 ${90 - row * 30}, 370 ${60 + row * 40}`}
                stroke="url(#dopamine)"
                strokeWidth="4"
                fill="none"
                strokeDasharray="8 10"
                animate={{
                  strokeDashoffset: dopamineMode === "healthy" ? [0, -80] : [0, -20, -5],
                  opacity: dopamineMode === "healthy" ? 1 : [0.5, 0.2, 0.6],
                }}
                transition={{ duration: dopamineMode === "healthy" ? 2 : 1, repeat: Infinity, ease: "linear" }}
              />
            ))}
            {dopamineMode === "parkinson" && (
              <motion.circle
                cx="220"
                cy="110"
                r="14"
                fill="#ef4444"
                animate={{ scale: [1, 1.3, 0.9], opacity: [0.9, 0.4, 0.9] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            )}
          </svg>
        </div>
      </section>

      {/* Micro learning cards */}
      <section className="px-6 lg:px-16 py-10">
        <div className="flex items-center gap-3 mb-6">
          <Lightbulb className="text-cyan-300" />
          <h2 className="text-2xl font-semibold">Micro Learning</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {microCards.map((card, idx) => (
            <motion.div
              key={card.title}
              className="p-5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-lg"
              whileHover={{ y: -6, boxShadow: "0 20px 60px rgba(0,0,0,0.35)" }}
              transition={{ type: "spring", stiffness: 140 }}
            >
              <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
                <span>Insight {idx + 1}</span>
                <Sparkles className="w-4 h-4 text-cyan-300" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
              <p className="text-gray-200 text-sm">{card.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Timeline slider */}
      <section className="px-6 lg:px-16 py-10 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-2xl font-semibold">Time Progression</h2>
          <p className="text-gray-300 mt-2">Slide through years to see how symptoms can slowly increase.</p>
          <input
            type="range"
            min={0}
            max={10}
            value={timeline}
            onChange={(e) => setTimeline(parseInt(e.target.value))}
            className="w-full mt-4 accent-[#2563eb]"
          />
          <div className="flex justify-between text-sm text-gray-400 mt-2">
            <span>Year 0</span>
            <span>Year 5</span>
            <span>Year 10</span>
          </div>
        </div>
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-3">
          <div className="flex items-center gap-2">
            <Timer className="text-cyan-300" />
            <div className="text-lg font-semibold">Year {timeline}</div>
          </div>
          <div className="text-sm text-gray-200">
            Brain signal strength:{" "}
            <span className="text-[#34d399]">{Math.max(20, 100 - timeline * 6)}%</span>
          </div>
          <div className="text-sm text-gray-200">
            Tremor probability: <span className="text-[#ef4444]">{timeline * 6 + 10}%</span>
          </div>
          <div className="text-sm text-gray-200">
            AI note: {timeline < 3 ? "Early: symptoms are mild." : timeline < 7 ? "Middle: daily tasks feel slower." : "Advanced: more help is useful."}
          </div>
        </div>
      </section>

      {/* Quiz */}
      <section className="px-6 lg:px-16 py-10 grid lg:grid-cols-2 gap-10 items-start">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="text-cyan-300" />
            <h2 className="text-2xl font-semibold">AI Knowledge Quiz</h2>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-sm text-gray-300 mb-3">Question {quizStep + 1} / {quizQuestions.length}</div>
            <h3 className="text-lg font-semibold mb-4">{quizQuestions[quizStep].q}</h3>
            <div className="space-y-3">
              {quizQuestions[quizStep].options.map((opt, idx) => {
                const isCorrect = idx === quizQuestions[quizStep].answer;
                const isSelected = selected === idx;
                return (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(idx)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition ${
                      isSelected
                        ? isCorrect
                          ? "border-[#34d399] bg-[#34d399]/20 text-white"
                          : "border-[#ef4444] bg-[#ef4444]/20 text-white"
                        : "border-white/10 bg-white/5 text-gray-100 hover:border-white/30"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <svg width="220" height="220" viewBox="0 0 220 220">
            <circle cx="110" cy="110" r="94" stroke="white" strokeWidth="10" opacity={0.1} fill="none" />
            <motion.circle
              cx="110"
              cy="110"
              r="94"
              stroke="url(#quiz)"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              initial={false}
              animate={{ pathLength: progress / 100 }}
              style={{ rotate: -90, transformOrigin: "50% 50%" }}
            />
            <defs>
              <linearGradient id="quiz" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
            <text x="110" y="118" textAnchor="middle" fill="white" fontSize="32" fontWeight="700">
              {score}%
            </text>
          </svg>
          {score >= 80 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="px-4 py-2 rounded-full bg-[#34d399]/20 border border-[#34d399]/40 text-[#34d399] flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Neuro Explorer Badge Unlocked
            </motion.div>
          )}
        </div>
      </section>

      {/* AI Chat Assistant */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="rounded-full bg-[#2563eb] text-white p-4 shadow-lg"
          onClick={() => setChatOpen((o) => !o)}
        >
          <MessageSquare className="w-5 h-5" />
        </motion.button>
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-3 w-80 rounded-2xl bg-slate-900/95 border border-white/10 shadow-2xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-cyan-300" />
                  <span className="text-sm font-semibold">AI Explainer</span>
                </div>
                <span className="text-[10px] text-gray-400">Context-aware</span>
              </div>
              <div className="space-y-2 text-sm text-gray-200 max-h-48 overflow-y-auto">
                <div className="p-2 rounded-xl bg-white/5">
                  {sceneIndex === 1
                    ? "Some brain cells slow down, so movement messages get softer."
                    : sceneIndex === 2
                      ? "Shaking happens when messages become uneven. Gentle therapy can help."
                      : "Strong, even signals keep movement steady and smooth."}
                </div>
                <div className="flex items-center gap-2 text-cyan-200 text-xs">
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full bg-cyan-300"
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                  Typing...
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Final CTA */}
      <section className="px-6 lg:px-16 py-14 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div>
          <div className="text-sm text-gray-400 mb-2">Ready to act</div>
          <h3 className="text-3xl font-semibold">Try AI Screening</h3>
          <p className="text-gray-300 mt-2 max-w-xl">
            Run the multimodal Parkinson’s screening to generate instant insights and a clinician-ready summary.
          </p>
        </div>
        <Button
          size="lg"
          className="bg-[#2563eb] hover:bg-[#1f4fc4] px-6"
          onClick={() => setLocation("/patient-form")}
        >
          Start AI Screening
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </section>
    </div>
  );
}

