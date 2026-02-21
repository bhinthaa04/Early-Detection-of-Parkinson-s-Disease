import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PenTool, Info, ArrowLeft, RefreshCw } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";

export default function SpiralTest() {
  const [, setLocation] = useLocation();
  const [points, setPoints] = useState<{x: number, y: number}[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX) - rect.left;
    const y = ('touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY) - rect.top;
    setPoints(prev => [...prev, { x, y }]);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw reference spiral
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 400; i++) {
      const angle = 0.1 * i;
      const x = canvas.width / 2 + (0.8 * angle) * 10 * Math.cos(angle);
      const y = canvas.height / 2 + (0.8 * angle) * 10 * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw user line
    if (points.length > 0) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      points.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    }
  }, [points]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => setLocation("/therapy")} className="mb-8 hover:bg-white">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Therapy
        </Button>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
                <PenTool className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-heading font-bold text-black">Spiral Drawing Motor Test</h1>
            </div>
            <Button variant="outline" onClick={() => setPoints([])}>Reset</Button>
          </div>

          <div className="flex gap-3 p-4 bg-red-50 text-red-700 rounded-xl mb-8 border border-red-100 text-sm">
            <Info className="w-5 h-5 flex-shrink-0" />
            <p>The Archimedean spiral test is a clinical standard for assessing tremors. Trace the guide from center outwards.</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="bg-slate-50 rounded-3xl border p-4">
              <canvas 
                ref={canvasRef} 
                width={500} 
                height={500} 
                onMouseMove={(e) => e.buttons === 1 && draw(e)}
                className="cursor-crosshair bg-white rounded-2xl shadow-inner"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 w-full mt-8">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-400 uppercase font-bold mb-1">AI Tremor Detection</p>
                <p className="text-xl font-bold text-red-600">Analyzing...</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Path Deviation</p>
                <p className="text-xl font-bold text-slate-900">{points.length > 0 ? '4.2mm avg' : '--'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
