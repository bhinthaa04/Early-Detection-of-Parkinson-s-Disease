import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface Step {
  id: number;
  label: string;
  icon: string;
}

interface StepProgressProps {
  steps: Step[];
  currentStep: number;
}

export function StepProgress({ steps, currentStep }: StepProgressProps) {
  return (
    <div className="w-full">
      <div className="relative flex justify-between items-center max-w-2xl mx-auto">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 transform -translate-y-1/2 rounded-full" />
        <div
          className="absolute top-1/2 left-0 h-1 bg-blue-600 -z-10 transform -translate-y-1/2 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div key={step.id} className="flex flex-col items-center gap-2 px-1">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                  isCompleted
                    ? "bg-blue-600 border-blue-600 text-white"
                    : isCurrent
                    ? "bg-white border-blue-600 text-blue-600 shadow-sm"
                    : "bg-white border-slate-300 text-slate-500"
                }`}
                initial={false}
                animate={{
                  scale: isCurrent ? 1.2 : 1,
                }}
              >
                {isCompleted ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <span className="text-lg">{step.icon}</span>
                )}
              </motion.div>
              <span
                className={`text-xs font-semibold ${
                  isCurrent ? "text-blue-600" : "text-slate-600"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
