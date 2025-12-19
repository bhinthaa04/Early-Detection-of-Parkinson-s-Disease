import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Activity, Shield, TrendingUp, BarChart3, Info, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";
import { BackendConfigButton } from "@/components/backend-config";
import heroBg from "@assets/generated_images/abstract_medical_ai_network_background.png";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-cyan-50 to-teal-50 relative overflow-hidden font-sans">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl" />
      </div>

      <BackendConfigButton />

      <div className="container mx-auto px-4 relative z-10">
        {/* Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-6 flex justify-between items-center"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg text-black">
              <Brain className="w-6 h-6" />
            </div>
            <span className="text-2xl font-heading font-bold gradient-text">NeuroScan AI</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="ghost" onClick={() => setLocation("/")} data-testid="nav-home">Home</Button>
            <Button variant="ghost" onClick={() => setLocation("/prediction")} data-testid="nav-predict">Test</Button>
            <Button variant="ghost" onClick={() => setLocation("/dashboard")} data-testid="nav-dashboard">Dashboard</Button>
          </div>
        </motion.nav>

        {/* Hero Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center py-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                🚀 AI-Powered Healthcare Innovation
              </div>
              <h1 className="text-5xl md:text-7xl font-heading font-bold text-foreground leading-tight mb-4">
                Early Detection of <span className="gradient-text">Parkinson's Disease</span>
              </h1>
              <p className="text-lg text-black dark:text-black leading-relaxed">
                Harness the power of artificial intelligence for early and accurate detection of Parkinson's disease using multimodal analysis of spiral drawings and voice patterns.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="px-8 py-6 text-lg shadow-lg hover:shadow-primary/40 rounded-full"
                onClick={() => setLocation("/prediction")}
                data-testid="btn-cta-predict"
              >
                Start Detection
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-6 text-lg rounded-full"
                onClick={() => setLocation("/dashboard")}
                data-testid="btn-view-dashboard"
              >
                View History
              </Button>
            </div>

            <div className="flex items-center gap-2 text-sm text-black dark:text-black">
              <Shield className="w-5 h-5 text-primary" />
              <span>Secure, private, and HIPAA-compliant testing</span>
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="hidden md:block"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={heroBg} 
                alt="Medical AI" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 mix-blend-overlay" />
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid md:grid-cols-4 gap-6 py-12"
        >
          {[
            {
              icon: Brain,
              title: 'AI Analysis',
              desc: 'Advanced neural network for accurate predictions',
            },
            {
              icon: Activity,
              title: 'Multimodal Input',
              desc: 'Spiral drawing + voice analysis combined',
            },
            {
              icon: TrendingUp,
              title: 'Disease Stage',
              desc: 'Early, Mid, or Advanced classification',
            },
            {
              icon: BarChart3,
              title: 'Dashboard',
              desc: 'Track history and visualize trends',
            },
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + idx * 0.1 }}
                className="p-6 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-border hover:shadow-md transition-all"
              >
                <div className="p-3 bg-primary/10 text-primary rounded-lg w-fit mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-black dark:text-black">{feature.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Educational Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="py-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-foreground mb-4">Understanding Parkinson's Disease</h2>
            <p className="text-black dark:text-black max-w-2xl mx-auto">
              Early detection is crucial for better management and quality of life. Learn about the signs and why regular screening matters.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-border">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
                <Info className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">What is Parkinson's?</h3>
              <p className="text-black dark:text-black leading-relaxed">
                A progressive nervous system disorder that affects movement. Symptoms start gradually, sometimes starting with a barely noticeable tremor in just one hand.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-border">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-6 text-orange-600 dark:text-orange-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Common Symptoms</h3>
              <ul className="space-y-2 text-black dark:text-black">
                <li>• Tremors or shaking</li>
                <li>• Slowed movement (bradykinesia)</li>
                <li>• Rigid muscles</li>
                <li>• Impaired posture and balance</li>
                <li>• Loss of automatic movements</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-border">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 text-green-600 dark:text-green-400">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Why Early Detection?</h3>
              <p className="text-black dark:text-black leading-relaxed">
                While there is no cure, medications might significantly improve symptoms. Detecting it early allows for lifestyle changes and treatments that can delay progression.
              </p>
            </div>
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 md:p-12 my-12 border border-primary/20"
        >
          <h2 className="text-3xl font-heading font-bold mb-6 text-foreground">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="text-4xl font-heading font-bold text-primary">1</div>
              <h3 className="font-heading font-semibold text-lg text-foreground">Upload Samples</h3>
              <p className="text-black dark:text-black">Submit a spiral drawing image and a voice recording.</p>
            </div>
            <div className="space-y-3">
              <div className="text-4xl font-heading font-bold text-primary">2</div>
              <h3 className="font-heading font-semibold text-lg text-foreground">AI Analysis</h3>
              <p className="text-black dark:text-black">Our model analyzes patterns for Parkinson's markers.</p>
            </div>
            <div className="space-y-3">
              <div className="text-4xl font-heading font-bold text-primary">3</div>
              <h3 className="font-heading font-semibold text-lg text-foreground">Get Results</h3>
              <p className="text-black dark:text-black">Receive comprehensive analysis and recommendations.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
