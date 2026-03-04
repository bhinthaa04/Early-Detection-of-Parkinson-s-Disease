import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Brain, Mail, Lock, Eye, EyeOff, 
  ArrowRight, Shield, Activity, Hospital,
  Sparkles, CheckCircle, AlertCircle, User, UserPlus
} from "lucide-react";
import { useLocation } from "wouter";

declare global {
  interface Window {
    google?: any;
  }
}

// Animated background particles
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: Math.random() * 100 + "%",
            opacity: Math.random() * 0.5 + 0.2
          }}
          animate={{
            y: [null, "-100%"],
            opacity: [null, 0]
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      ))}
    </div>
  );
}

// Rotating health tips
const healthTips = [
  "Early detection saves lives",
  "Your data is private & secure",
  "AI-powered neurological screening",
  "Parkinson's affects 10M worldwide",
  "Movement disorders are treatable",
  "Quality of life can be improved"
];

// User count
const totalUsers = 127;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export default function Login() {
  const [, setLocation] = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentTip, setCurrentTip] = useState(0);
  const [googleReady, setGoogleReady] = useState(false);

  // Rotate tips
  useState(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % healthTips.length);
    }, 3000);
    return () => clearInterval(interval);
  });

  // Load Google Identity Services script once
  useEffect(() => {
    if (window.google?.accounts?.id) {
      setGoogleReady(true);
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>('script[src=\"https://accounts.google.com/gsi/client\"]');
    if (existing) {
      existing.addEventListener("load", () => setGoogleReady(true), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleReady(true);
    script.onerror = () => setError("Google Sign-In failed to load. Check your network.");
    document.head.appendChild(script);
  }, []);

  const decodeJwt = (token: string) => {
    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
      return decoded;
    } catch {
      return {};
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Demo validation - accept any email with password length > 3
    if (password.length >= 4 && email.includes("@")) {
      // Save user to session
      sessionStorage.setItem("userEmail", email);
      sessionStorage.setItem("userName", name || "User");
      setLocation("/");
    } else {
      setError("Please enter a valid email and password (min 4 characters)");
    }

    setIsLoading(false);
  };

  const handleGoogle = () => {
    setError("");
    if (!GOOGLE_CLIENT_ID) {
      setError("Google Sign-In is not configured. Add VITE_GOOGLE_CLIENT_ID.");
      return;
    }
    if (!googleReady || !window.google?.accounts?.id) {
      setError("Google Sign-In is still loading. Please try again in a moment.");
      return;
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: any) => {
        const payload = decodeJwt(response?.credential || "");
        const userEmail = payload.email || "google-user@neuroscan.ai";
        const userName = payload.name || payload.given_name || "Google User";
        sessionStorage.setItem("userEmail", userEmail);
        sessionStorage.setItem("userName", userName);
        setLocation("/");
      },
      ux_mode: "popup",
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        setError("Google account chooser was closed or blocked. Please try again.");
      }
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-sans flex items-center justify-center">
      {/* Dark gradient background */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: "linear-gradient(135deg, #0a0f2c 0%, #1a1f4e 50%, #0d1526 100%)"
        }}
      />

      {/* Animated neural network background */}
      <svg className="absolute inset-0 z-0 opacity-20">
        <defs>
          <linearGradient id="neuralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        {[...Array(8)].map((_, i) => (
          <motion.circle
            key={i}
            cx="50%"
            cy="50%"
            r={100 + i * 50}
            stroke="url(#neuralGrad)"
            strokeWidth="0.5"
            fill="none"
            initial={{ scale: 0.8, opacity: 0.3 }}
            animate={{ 
              scale: [0.8, 1.2],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: 8 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5
            }}
          />
        ))}
      </svg>

      {/* Floating particles */}
      <FloatingParticles />

      {/* Pulsing glow behind card */}
      <motion.div
        className="absolute z-0 w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)"
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{
          duration: 4,
          repeat: Infinity
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          {/* Glassmorphism Card */}
          <div 
            className="relative backdrop-blur-xl rounded-3xl p-8"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
            }}
          >
            {/* Logo */}
            <div className="text-center mb-6">
              <motion.div 
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                style={{
                  background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
                  boxShadow: "0 8px 32px rgba(6,182,212,0.4)"
                }}
                whileHover={{ scale: 1.05 }}
              >
                <Brain className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="text-cyan-400 text-sm mt-1">
                AI-Based Parkinson's Screening Platform
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label htmlFor="name" className="text-white/80">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    />
                  </div>
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-red-300 text-sm">{error}</p>
                </motion.div>
              )}

              {isLogin && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-white/60 cursor-pointer">
                    <input type="checkbox" className="rounded border-white/20 bg-white/5" />
                    <span className="text-xs">Remember me</span>
                  </label>
                  <a href="#" className="text-cyan-400 hover:text-cyan-300 text-xs">
                    Forgot password?
                  </a>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 font-medium"
                style={{
                  background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
                  boxShadow: "0 4px 15px rgba(6,182,212,0.3)"
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>{isLogin ? "Sign In" : "Create Account"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 text-white/40 bg-transparent">or</span>
              </div>
            </div>

            {/* Google Sign-In Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogle}
              className="w-full border-white/20 text-white/70 hover:bg-white/10 hover:text-white"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-5 h-5 mr-2"
              />
              Continue with Google
            </Button>

            {/* Toggle Login/Signup */}
            <p className="text-center text-white/60 text-sm mt-6">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="text-cyan-400 hover:text-cyan-300 font-medium"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>

          {/* Rotating Health Tips */}
          <motion.div
            key={currentTip}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center mt-6"
          >
            <p className="text-white/50 text-sm italic">
              "{healthTips[currentTip]}"
            </p>
          </motion.div>

          {/* Security & Trust Badges */}
          <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
            <div className="flex items-center gap-1 text-white/40 text-xs">
              <Shield className="w-3 h-3" />
              <span>Encrypted</span>
            </div>
            <div className="flex items-center gap-1 text-white/40 text-xs">
              <Activity className="w-3 h-3" />
              <span>AI Powered</span>
            </div>
            <div className="flex items-center gap-1 text-white/40 text-xs">
              <Hospital className="w-3 h-3" />
              <span>Medical Grade</span>
            </div>
          </div>

          {/* User Count */}
          <div className="text-center mt-4">
            <p className="text-white/30 text-xs">
              Trusted by {totalUsers}+ users worldwide
            </p>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-white/20 text-xs">
              NeuroScan AI — Secure Parkinson's Disease Screening Platform
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
