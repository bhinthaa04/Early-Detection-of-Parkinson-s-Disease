import { motion } from "framer-motion";
import { Brain, Activity, Scan } from "lucide-react";

export function AIAnalysisScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="relative w-64 h-64 mb-12">
        {/* Pulsing Background */}
        <motion.div
          className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Rotating Rings */}
        <motion.div
          className="absolute inset-0 border-4 border-dashed border-primary/30 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-4 border-4 border-dashed border-secondary/30 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />

        {/* Brain Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Brain className="w-32 h-32 text-primary" />
          </motion.div>
        </div>

        {/* Scanning Effect */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-100"
          animate={{
            top: ["0%", "100%", "0%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <motion.h2
        className="text-3xl font-heading font-bold mb-4 gradient-text"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        AI Analysis in Progress
      </motion.h2>

      <div className="space-y-2 text-black dark:text-black">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
          className="flex items-center gap-2"
        >
          <Activity className="w-4 h-4 text-green-500" />
          <span>Processing voice patterns (MFCC features)...</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 2 }}
          className="flex items-center gap-2"
        >
          <Scan className="w-4 h-4 text-blue-500" />
          <span>Analyzing spiral drawing kinematics...</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 3 }}
          className="flex items-center gap-2"
        >
          <Brain className="w-4 h-4 text-purple-500" />
          <span>Neural network inference...</span>
        </motion.div>
      </div>
    </div>
  );
}
