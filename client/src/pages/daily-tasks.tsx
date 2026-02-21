import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Mic,
  Volume2,
  CheckCircle,
  Clock,
  ArrowLeft,
  RotateCcw,
  SkipForward,
  Trophy,
  TrendingUp,
  MessageSquare,
  Hand,
  Smile,
  Lightbulb,
  Play,
} from "lucide-react";
import { useLocation } from "wouter";

interface TaskHistory {
  date: string;
  taskId: string;
  completed: boolean;
  duration?: number;
  score?: number;
}

interface DailyTask {
  id: string;
  title: string;
  description: string;
  instruction: string;
  duration: number; // in seconds
  icon: React.ComponentType<any>;
  type: "voice" | "finger" | "hand" | "facial" | "cognitive";
  difficulty: "easy" | "medium" | "hard";
}

interface CompletionState {
  taskId: string;
  started: boolean;
  completed: boolean;
  score: number;
  feedback: string;
}

// Task templates
const TASK_TEMPLATES: Record<string, DailyTask> = {
  voice_sustain: {
    id: "voice_sustain",
    title: "Voice Sustain",
    description: "Hold a steady sound",
    instruction: "Say 'Aaah' and hold it for as long as you can",
    duration: 10,
    icon: Mic,
    type: "voice",
    difficulty: "easy",
  },
  finger_tapping: {
    id: "finger_tapping",
    title: "Finger Tapping",
    description: "Tap the screen rapidly",
    instruction: "Tap the screen as fast as you can",
    duration: 10,
    icon: Hand,
    type: "finger",
    difficulty: "easy",
  },
  hand_stability: {
    id: "hand_stability",
    title: "Hand Stability",
    description: "Hold your hand steady",
    instruction: "Hold your hand steady in front of the camera",
    duration: 10,
    icon: Hand,
    type: "hand",
    difficulty: "medium",
  },
  facial_expression: {
    id: "facial_expression",
    title: "Facial Expression",
    description: "Show different expressions",
    instruction: "Smile, blink, and relax your face",
    duration: 8,
    icon: Smile,
    type: "facial",
    difficulty: "easy",
  },
  cognitive_task: {
    id: "cognitive_task",
    title: "Cognitive Task",
    description: "Answer a quick question",
    instruction: "Listen to the question and respond",
    duration: 15,
    icon: Lightbulb,
    type: "cognitive",
    difficulty: "medium",
  },
};

const COGNITIVE_QUESTIONS = [
  "What is the capital of France?",
  "How many days are in a week?",
  "Name a fruit that is red",
  "What color is the sky on a clear day?",
  "How many fingers are on one hand?",
];

export default function DailyTasks() {
  const [, setLocation] = useLocation();
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [taskHistory, setTaskHistory] = useState<TaskHistory[]>([]);
  const [completionStates, setCompletionStates] = useState<
    Record<string, CompletionState>
  >({});
  const [showSummary, setShowSummary] = useState(false);
  const [allCompleted, setAllCompleted] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  const syntheticRef = useRef<SpeechSynthesis | null>(null);
  const recognitionRef = useRef<any>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    syntheticRef.current =
      window.speechSynthesis ||
      (window as any).webkitSpeechSynthesis ||
      undefined;

    // Initialize speech recognition for voice tasks
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
    }

    return () => {
      if (syntheticRef.current) {
        syntheticRef.current.cancel();
      }
    };
  }, []);

  // Load tasks on mount
  useEffect(() => {
    const loadDailyTasks = () => {
      const today = new Date().toDateString();
      const cachedDate = localStorage.getItem("daily_tasks_date");

      let tasks: DailyTask[] = [];

      if (cachedDate === today) {
        // Load cached tasks
        const cached = localStorage.getItem("daily_tasks");
        tasks = cached ? JSON.parse(cached) : [];
      } else {
        // Generate new tasks for the day
        tasks = generateDailyTasks();
        localStorage.setItem("daily_tasks", JSON.stringify(tasks));
        localStorage.setItem("daily_tasks_date", today);
      }

      setDailyTasks(tasks);
      loadTaskHistory();
      speakWelcome(tasks);
    };

    loadDailyTasks();
  }, []);

  const generateDailyTasks = (): DailyTask[] => {
    const taskIds = [
      "voice_sustain",
      "finger_tapping",
      "hand_stability",
      "facial_expression",
      "cognitive_task",
    ];

    // Shuffle and select 4-5 tasks
    const numTasks = Math.random() > 0.5 ? 4 : 5;
    const selected = taskIds
      .sort(() => Math.random() - 0.5)
      .slice(0, numTasks);

    return selected.map((id) => TASK_TEMPLATES[id]);
  };

  const loadTaskHistory = () => {
    const history = localStorage.getItem("task_history");
    const parsed = history ? JSON.parse(history) : [];
    setTaskHistory(parsed);
  };

  const saveTaskCompletion = (task: DailyTask, score: number) => {
    const today = new Date().toDateString();
    const newEntry: TaskHistory = {
      date: today,
      taskId: task.id,
      completed: true,
      score,
    };

    const updated = [...taskHistory, newEntry];
    localStorage.setItem("task_history", JSON.stringify(updated));
    setTaskHistory(updated);
  };

  const speakWelcome = (tasks: DailyTask[]) => {
    if (!syntheticRef.current) return;

    const message = `Welcome to your daily wellness check-in. Today you have ${tasks.length} simple tasks to complete. Let's get started!`;
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 1;
    utterance.pitch = 1;
    syntheticRef.current.speak(utterance);
  };

  const speakText = (text: string, callback?: () => void) => {
    if (!syntheticRef.current) return;

    syntheticRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;

    if (callback) {
      utterance.onend = callback;
    }

    syntheticRef.current.speak(utterance);
  };

  const startTask = (task: DailyTask) => {
    setCompletionStates((prev) => ({
      ...prev,
      [task.id]: {
        taskId: task.id,
        started: true,
        completed: false,
        score: 0,
        feedback: "Task starting...",
      },
    }));

    speakText(`Now starting ${task.title}. ${task.instruction}`);

    if (task.type === "finger") {
      startFingerTapping(task);
    } else if (task.type === "voice") {
      startVoiceTask(task);
    } else if (task.type === "cognitive") {
      startCognitiveTask(task);
    } else {
      // For hand and facial, manual completion
      setTimeout(() => {
        completeTask(task, 85);
      }, task.duration * 1000);
    }
  };

  const startFingerTapping = (task: DailyTask) => {
    setTapCount(0);
    let timeLeft = task.duration;

    const interval = setInterval(() => {
      timeLeft--;
      setCountdown(timeLeft);

      if (timeLeft === 0) {
        clearInterval(interval);
        const score = Math.min(100, 50 + tapCount / 2);
        completeTask(task, score);
      }
    }, 1000);

    tapTimerRef.current = interval;
  };

  const handleTap = (task: DailyTask) => {
    const state = completionStates[task.id];
    if (state?.started && !state?.completed) {
      setTapCount((prev) => prev + 1);
    }
  };

  const startVoiceTask = (task: DailyTask) => {
    setIsVoiceActive(true);
    let timeLeft = task.duration;

    const interval = setInterval(() => {
      timeLeft--;
      setCountdown(timeLeft);

      if (timeLeft === 0) {
        clearInterval(interval);
        setIsVoiceActive(false);
        completeTask(task, 80);
      }
    }, 1000);

    countdownIntervalRef.current = interval;
  };

  const startCognitiveTask = (task: DailyTask) => {
    const question =
      COGNITIVE_QUESTIONS[
        Math.floor(Math.random() * COGNITIVE_QUESTIONS.length)
      ];

    speakText(question, () => {
      // After asking, wait for response
      let timeLeft = task.duration;
      const interval = setInterval(() => {
        timeLeft--;
        setCountdown(timeLeft);

        if (timeLeft === 0) {
          clearInterval(interval);
          completeTask(task, 75);
        }
      }, 1000);

      countdownIntervalRef.current = interval;
    });
  };

  const completeTask = (task: DailyTask, score: number) => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    if (tapTimerRef.current) {
      clearInterval(tapTimerRef.current);
    }

    setCountdown(0);
    setTapCount(0);
    setIsVoiceActive(false);

    const feedback =
      score >= 80
        ? "Excellent work! Keep it up!"
        : score >= 60
          ? "Good effort! You're doing great!"
          : "Nice try! Every bit helps!";

    setCompletionStates((prev) => ({
      ...prev,
      [task.id]: {
        taskId: task.id,
        started: true,
        completed: true,
        score,
        feedback,
      },
    }));

    saveTaskCompletion(task, score);
    speakText(feedback);

    // Check if all tasks completed
    const allDone = dailyTasks.every((t) => completionStates[t.id]?.completed);
    if (allDone) {
      setAllCompleted(true);
      setTimeout(() => setShowSummary(true), 2000);
    } else {
      setTimeout(() => {
        setCurrentTaskIndex((prev) => prev + 1);
      }, 3000);
    }
  };

  const skipTask = (task: DailyTask) => {
    setCompletionStates((prev) => ({
      ...prev,
      [task.id]: {
        taskId: task.id,
        started: false,
        completed: false,
        score: 0,
        feedback: "Task skipped",
      },
    }));

    speakText("Task skipped. Moving to next task.");

    if (currentTaskIndex < dailyTasks.length - 1) {
      setCurrentTaskIndex((prev) => prev + 1);
    } else {
      setShowSummary(true);
    }
  };

  const retryTask = (task: DailyTask) => {
    setCompletionStates((prev) => ({
      ...prev,
      [task.id]: {
        taskId: task.id,
        started: false,
        completed: false,
        score: 0,
        feedback: "Ready to retry",
      },
    }));

    speakText(`Retrying ${task.title}. ${task.instruction}`);
    setTimeout(() => startTask(task), 1500);
  };

  const getDailyStreak = (): number => {
    let streak = 0;
    let currentDate = new Date();

    for (let i = 0; i < 30; i++) {
      const dateStr = currentDate.toDateString();
      const completedToday = taskHistory.filter(
        (h) => h.date === dateStr && h.completed
      );

      if (completedToday.length > 0) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const getAverageScore = (): number => {
    if (taskHistory.length === 0) return 0;
    const total = taskHistory.reduce((sum, h) => sum + (h.score || 0), 0);
    return Math.round(total / taskHistory.length);
  };

  const getTodayCompletionRate = (): number => {
    const today = new Date().toDateString();
    const todayTasks = completionStates;
    const completed = Object.values(todayTasks).filter((c) => c.completed).length;
    return Math.round((completed / dailyTasks.length) * 100);
  };

  if (showSummary) {
    const completionRate = getTodayCompletionRate();
    const streak = getDailyStreak();
    const avgScore = getAverageScore();

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-slate-900 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center mb-8"
          >
            <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-white mb-4">
              Great Work Today!
            </h1>
            <p className="text-xl text-gray-300">
              You've completed your daily wellness check-in
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-slate-800/50 border-slate-700 p-6 text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">
                {completionRate}%
              </div>
              <p className="text-gray-400">Tasks Completed</p>
              <Progress value={completionRate} className="h-2 mt-4" />
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-6 text-center">
              <div className="text-4xl font-bold text-orange-400 mb-2">
                {streak}
              </div>
              <p className="text-gray-400">Day Streak 🔥</p>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-6 text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">
                {avgScore}%
              </div>
              <p className="text-gray-400">Average Score</p>
            </Card>
          </div>

          <Card className="bg-slate-800/50 border-slate-700 p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Today's Performance
            </h2>
            <div className="space-y-4">
              {dailyTasks.map((task) => {
                const state = completionStates[task.id];
                const icon = task.icon;
                const Icon = icon;

                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between bg-slate-900/50 p-4 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Icon className="w-6 h-6 text-blue-400" />
                      <div>
                        <p className="font-semibold text-white">{task.title}</p>
                        <p className="text-sm text-gray-400">{task.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {state?.completed ? (
                        <div>
                          <CheckCircle className="w-6 h-6 text-green-400 inline-block mb-1" />
                          <p className="text-sm font-semibold text-green-400">
                            {state.score}%
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">Skipped</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Alert className="border-blue-300 bg-blue-900/20 mb-8">
            <MessageSquare className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-200">
              <strong>What These Tasks Help Monitor:</strong> Your daily tasks
              measure voice clarity, hand dexterity, facial mobility, and
              cognitive function. Tracking these over time helps identify trends
              and keeps you aware of your wellness journey.
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-4">
            <Button
              onClick={() => setLocation("/")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back Home
            </Button>
            <Button
              onClick={() => {
                setShowSummary(false);
                setCurrentTaskIndex(0);
                setCompletionStates({});
              }}
              variant="outline"
              className="border-blue-500 text-blue-400 py-6 text-lg hover:bg-blue-500/10"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Review Tasks
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (dailyTasks.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800/50 border-slate-700 p-8 max-w-md">
          <div className="text-center">
            <Clock className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Loading Your Tasks
            </h2>
            <p className="text-gray-400">Preparing today's wellness check-in...</p>
          </div>
        </Card>
      </div>
    );
  }

  const currentTask = dailyTasks[currentTaskIndex];
  const currentState = completionStates[currentTask.id];
  const TaskIcon = currentTask.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-slate-900 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="mb-4 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Daily Wellness Tasks
          </h1>
          <p className="text-xl text-gray-400">
            Simple tasks to support your daily wellness check-in
          </p>

          {/* Progress bar */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">
                Task {currentTaskIndex + 1} of {dailyTasks.length}
              </span>
              <span className="text-blue-400 font-semibold">
                {getTodayCompletionRate()}% Complete
              </span>
            </div>
            <Progress
              value={((currentTaskIndex + getTodayCompletionRate() / 100) / dailyTasks.length) * 100}
              className="h-3"
            />
          </div>
        </motion.div>

        {/* Task Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTask.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-slate-800/50 border-slate-700 p-8 mb-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-500/20 rounded-full">
                      <TaskIcon className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white">
                        {currentTask.title}
                      </h2>
                      <p className="text-gray-400">{currentTask.description}</p>
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 bg-purple-500/30 text-purple-200 rounded-full text-sm font-semibold">
                  {currentTask.difficulty.toUpperCase()}
                </span>
              </div>

              {/* Instructions */}
              <Alert className="border-blue-300 bg-blue-900/20 mb-8">
                <Volume2 className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-100 text-lg">
                  {currentTask.instruction}
                </AlertDescription>
              </Alert>

              {/* Task Content Area */}
              {currentState?.started ? (
                <div className="space-y-8">
                  {/* Countdown Timer */}
                  <div className="text-center">
                    <p className="text-gray-400 mb-4">
                      {countdown > 0 ? `Time remaining: ${countdown}s` : "Task Complete!"}
                    </p>
                    <div className="flex justify-center mb-6">
                      <motion.div
                        animate={{ scale: countdown > 0 ? 1.1 : 1 }}
                        className="text-7xl font-bold text-blue-400 font-mono"
                      >
                        {countdown}
                      </motion.div>
                    </div>

                    {/* Task-Specific Visualization */}
                    {currentTask.type === "finger" && (
                      <div
                        onClick={() => handleTap(currentTask)}
                        className="p-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 mb-6"
                      >
                        <p className="text-white text-center font-bold text-2xl">
                          TAP HERE<br />
                          <span className="text-5xl">{tapCount}</span>
                        </p>
                      </div>
                    )}

                    {currentTask.type === "voice" && (
                      <motion.div
                        animate={{ scale: isVoiceActive ? [1, 1.2, 1] : 1 }}
                        transition={{ duration: 0.5, repeat: isVoiceActive ? Infinity : 0 }}
                        className="p-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full w-fit mx-auto mb-6"
                      >
                        <Mic className="w-16 h-16 text-white" />
                      </motion.div>
                    )}

                    {(currentTask.type === "hand" || currentTask.type === "facial") && (
                      <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="p-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl mb-6"
                      >
                        <TaskIcon className="w-16 h-16 text-white mx-auto" />
                      </motion.div>
                    )}

                    {currentTask.type === "cognitive" && (
                      <div className="p-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-3xl mb-6">
                        <Lightbulb className="w-16 h-16 text-white mx-auto" />
                      </div>
                    )}
                  </div>

                  {/* Feedback */}
                  {currentState?.completed && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center p-6 bg-green-900/20 border border-green-500/50 rounded-lg"
                    >
                      <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
                      <p className="text-green-200 text-lg font-semibold">
                        {currentState.feedback}
                      </p>
                      <p className="text-green-300 text-2xl font-bold mt-2">
                        Score: {currentState.score}%
                      </p>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="p-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl mb-8 w-fit mx-auto"
                  >
                    <TaskIcon className="w-20 h-20 text-white" />
                  </motion.div>
                  <p className="text-gray-300 text-lg">
                    Ready to start? Click the button below when you're prepared.
                  </p>
                </div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          {!currentState?.started ? (
            <Button
              onClick={() => startTask(currentTask)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-12 py-6 text-lg font-semibold"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Task
            </Button>
          ) : currentState?.completed ? (
            <>
              {currentTaskIndex < dailyTasks.length - 1 ? (
                <Button
                  onClick={() => setCurrentTaskIndex((prev) => prev + 1)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-6 text-lg"
                >
                  <SkipForward className="w-5 h-5 mr-2" />
                  Next Task
                </Button>
              ) : (
                <Button
                  onClick={() => setShowSummary(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-6 text-lg"
                >
                  <Trophy className="w-5 h-5 mr-2" />
                  View Summary
                </Button>
              )}
              <Button
                onClick={() => retryTask(currentTask)}
                variant="outline"
                className="border-blue-500 text-blue-400 px-8 py-6"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Retry
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => skipTask(currentTask)}
                variant="outline"
                className="border-gray-500 text-gray-400 px-8 py-6"
              >
                <SkipForward className="w-5 h-5 mr-2" />
                Skip
              </Button>
            </>
          )}
        </div>

        {/* Tasks List Sidebar */}
        <div className="mt-12 grid md:grid-cols-3 gap-4">
          {dailyTasks.map((task, idx) => {
            const state = completionStates[task.id];
            const TaskIcon = task.icon;

            return (
              <motion.div
                key={task.id}
                whileHover={{ y: -5 }}
                onClick={() => setCurrentTaskIndex(idx)}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  idx === currentTaskIndex
                    ? "bg-blue-600 border border-blue-400 ring-2 ring-blue-400"
                    : state?.completed
                      ? "bg-green-900/30 border border-green-500/30"
                      : "bg-slate-800/30 border border-slate-600"
                }`}
              >
                <div className="flex items-center gap-3">
                  <TaskIcon className="w-5 h-5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">{task.title}</p>
                    {state?.completed && (
                      <p className="text-green-400 text-sm">{state.score}%</p>
                    )}
                  </div>
                  {state?.completed && (
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Educational Section */}
        <Card className="bg-slate-800/50 border-slate-700 p-6 mt-12">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            Why These Tasks Matter
          </h3>
          <div className="space-y-3 text-gray-300">
            <p>
              • <strong>Voice Sustain:</strong> Monitors vocal clarity and breath control
            </p>
            <p>
              • <strong>Finger Tapping:</strong> Tracks hand coordination and speed
            </p>
            <p>
              • <strong>Hand Stability:</strong> Assesses fine motor tremor patterns
            </p>
            <p>
              • <strong>Facial Expression:</strong> Measures facial mobility and expression
            </p>
            <p>
              • <strong>Cognitive Task:</strong> Evaluates quick thinking and response time
            </p>
            <p className="pt-3 text-blue-200 italic">
              Completing these daily helps you stay connected with your wellness journey and
              provides data patterns over time for discussions with your healthcare provider.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
