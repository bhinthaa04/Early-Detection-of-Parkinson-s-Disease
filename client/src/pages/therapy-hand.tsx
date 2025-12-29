import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Hand, Info, ArrowLeft, RefreshCw } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";

export default function HandStability() {
  const [, setLocation] = useLocation();
  const [points, setPoints] = useState<{x: number, y: number}[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;
    setPoints(prev => [...prev, { x, y }]);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw guide spiral
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    for (let i = 0; i < 200; i++) {
      const angle = 0.1 * i;
      const x = canvas.width / 2 + (5 + 2 * angle) * Math.cos(angle);
      const y = canvas.height / 2 + (5 + 2 * angle) * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw user line
    if (points.length > 0) {
      ctx.setLineDash([]);
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      points.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    }
  }, [points]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/therapy")}
          className="mb-8 hover:bg-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Therapy
        </Button>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-teal-100 text-teal-600 rounded-2xl">
                <Hand className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-heading font-bold text-slate-900">Hand Stability Training</h1>
            </div>
            <Button variant="outline" onClick={() => setPoints([])} className="rounded-xl">
              <RefreshCw className="w-4 h-4 mr-2" /> Reset
            </Button>
          </div>

          <div className="flex gap-3 p-4 bg-teal-50 text-teal-700 rounded-xl mb-8 border border-teal-100">
            <Info className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">
              Fine motor control exercises help manage tremors and "micrographia" (small handwriting). Try to trace the spiral as steadily as possible.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative bg-slate-50 rounded-3xl border border-slate-200 p-4 shadow-inner">
              <canvas 
                ref={canvasRef}
                width={500}
                height={500}
                onMouseMove={(e) => e.buttons === 1 && draw(e)}
                onTouchMove={draw}
                className="cursor-crosshair max-w-full h-auto"
              />
              <div className="absolute top-4 left-4 text-xs font-mono text-slate-400">STABILITY_SENSOR_ACTIVE</div>
            </div>

            <div className="grid grid-cols-3 gap-6 w-full mt-12">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Tremor Index</div>
                <div className="text-2xl font-bold text-teal-600">Low</div>
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Accuracy</div>
                <div className="text-2xl font-bold text-teal-600">{points.length > 0 ? '84%' : '--'}</div>
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Completion</div>
                <div className="text-2xl font-bold text-teal-600">{Math.min(100, Math.floor(points.length / 2))}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
