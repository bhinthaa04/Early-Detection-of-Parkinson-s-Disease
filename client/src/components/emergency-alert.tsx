import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertOctagon, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmergencyAlertProps {
  confidence: number;
  prediction: boolean;
  onClose: () => void;
}

export function EmergencyAlert({ confidence, prediction, onClose }: EmergencyAlertProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (confidence > 0.85 && prediction) {
      setIsVisible(true);
    }
  }, [confidence, prediction]);

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={handleClose}
          />

          {/* Alert Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -50 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
          >
            <div className="bg-red-50 border-4 border-red-500 rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-red-500 text-black px-6 py-4 flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                >
                  <AlertOctagon className="w-8 h-8" />
                </motion.div>
                <h2 className="text-xl font-heading font-bold">⚠️ HIGH CONFIDENCE ALERT</h2>
                <button
                  onClick={handleClose}
                  className="ml-auto p-1 hover:bg-red-600 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-red-900">
                    Confidence Score: <span className="text-red-600">{(confidence * 100).toFixed(1)}%</span>
                  </p>
                  <p className="text-black">
                    Your test results show a high confidence score for Parkinson's disease. 
                    Immediate medical consultation is strongly recommended.
                  </p>
                </div>

                <div className="bg-white border-l-4 border-red-500 p-4 rounded">
                  <h3 className="font-semibold text-gray-900 mb-2">Recommended Actions:</h3>
                  <ul className="space-y-1 text-sm text-black">
                    <li>✓ Contact a neurologist within 24 hours</li>
                    <li>✓ Download and review your medical report</li>
                    <li>✓ Schedule a professional neurological evaluation</li>
                    <li>✓ Inform your primary care physician</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 text-black rounded-lg py-6 text-base font-semibold"
                    onClick={() => window.open("tel:911")}
                    data-testid="btn-emergency-911"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Call Emergency Services
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full rounded-lg py-6 text-base"
                    onClick={handleClose}
                    data-testid="btn-dismiss-alert"
                  >
                    Dismiss & Continue
                  </Button>
                </div>

                <p className="text-xs text-black text-center">
                  This alert is for informational purposes. Always consult with a healthcare professional.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
