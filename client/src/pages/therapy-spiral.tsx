import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PenTool, Info, ArrowLeft, RotateCcw } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useRef } from "react";
import heroBg from "@assets/generated_images/hopeful_medical_background_with_brain_waves_and_pulses.png";

export default function SpiralDrawing() {
  const [, setLocation] = useLocation();
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startDrawing = () => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0d9488';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
      }
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-sans">
      {/* Dynamic Medical AI Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-15 pointer-events-none"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      
      <div className="container mx-auto px-4 py-8 relative z-10 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/therapy")}
          className="mb-8 text-gray-700 hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Therapy
        </Button>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
              <PenTool className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-gray-900">Spiral Drawing Test</h1>
          </div>

          <div className="flex gap-3 p-4 bg-red-50 text-red-700 rounded-xl mb-8 border border-red-100">
            <Info className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">
              Drawing spirals helps analyze fine motor control and detect tremor patterns. Draw from the center outward in one continuous motion.
            </p>
          </div>

          <div className="space-y-8">
            <div className="relative aspect-square max-w-md mx-auto bg-slate-50 rounded-3xl overflow-hidden border-2 border-slate-200">
              <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className="w-full h-full touch-none"
                onMouseDown={startDrawing}
                onMouseMove={(e) => {
                  if (isDrawing && canvasRef.current) {
                    const ctx = canvasRef.current.getContext('2d');
                    if (ctx) {
                      const rect = canvasRef.current.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      ctx.lineTo(x, y);
                      ctx.stroke();
                    }
                  }
                }}
                onMouseUp={() => setIsDrawing(false)}
                onMouseLeave={() => setIsDrawing(false)}
              />
              {!isDrawing && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="text-gray-400 font-medium">Click and drag to draw</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-2xl font-bold text-gray-900">--</div>
                <div className="text-xs text-gray-500">Tremor Score</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-2xl font-bold text-gray-900">--</div>
                <div className="text-xs text-gray-500">Smoothness</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-2xl font-bold text-gray-900">--</div>
                <div className="text-xs text-gray-500">Consistency</div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={clearCanvas}
                variant="outline"
                className="flex-1 py-6 text-lg rounded-2xl border-slate-300 text-gray-700 hover:bg-slate-50"
              >
                <RotateCcw className="w-5 h-5 mr-2" /> Clear
              </Button>
              <Button
                className="flex-1 py-6 text-lg rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-lg"
              >
                Analyze Drawing
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
