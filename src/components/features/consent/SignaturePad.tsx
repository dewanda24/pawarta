'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Check, PenTool, Sparkles } from 'lucide-react';

interface SignaturePadProps {
  value?: string | null;
  onChange: (base64: string | null) => void;
  height?: number;
}

export function SignaturePad({ value, onChange, height = 180 }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);

  // Setup Canvas & High-DPI support
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;

    ctx.scale(ratio, ratio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a'; // Slate-900 dark ink
    ctx.lineWidth = 2.5;

    // Simpan snapshot kosong awal
    const blankSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([blankSnapshot]);
  }, []);

  useEffect(() => {
    initCanvas();
    const handleResize = () => {
      // Resize with debounce
      initCanvas();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initCanvas]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if ('touches' in e) {
      // Prevent scrolling on touch screens when drawing
      e.preventDefault();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    if ('touches' in e) {
      e.preventDefault();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simpan history snapshot untuk undo
    const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev, currentData]);

    // Export transparent PNG base64
    const dataUrl = canvas.toDataURL('image/png');
    onChange(dataUrl);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    ctx.clearRect(0, 0, canvas.width / ratio, canvas.height / ratio);
    setHasDrawn(false);
    setHistory([]);
    onChange(null);
  };

  const undo = () => {
    if (history.length <= 1) {
      clear();
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // Buang yang terakhir
    const previousSnapshot = newHistory[newHistory.length - 1];

    if (previousSnapshot) {
      ctx.putImageData(previousSnapshot, 0, 0);
      setHistory(newHistory);
      const dataUrl = canvas.toDataURL('image/png');
      onChange(dataUrl);
    } else {
      clear();
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors rounded-xl bg-white shadow-xs overflow-hidden">
        {/* Placeholder Watermark jika belum tanda tangan */}
        {!hasDrawn && !value && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-gray-400 select-none">
            <PenTool className="w-6 h-6 mb-1 text-gray-300 animate-bounce" />
            <span className="text-xs font-medium">Goreskan Tanda Tangan Orang Tua / Wali di sini</span>
            <span className="text-[10px] text-gray-400 mt-0.5">Dapat menggunakan jari di layar sentuh HP atau mouse di PC</span>
          </div>
        )}

        {/* Canvas Element */}
        <canvas
          ref={canvasRef}
          style={{ height: `${height}px`, touchAction: 'none' }}
          className="w-full cursor-crosshair block"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />

        {/* Bottom Baseline Indicator */}
        <div className="absolute bottom-6 left-6 right-6 border-b border-gray-200 pointer-events-none flex justify-between items-end pb-1">
          <span className="text-[10px] text-gray-400 font-mono tracking-wider">TANDA TANGAN RESMI</span>
          {hasDrawn && (
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              <Check className="w-3 h-3" /> Terekam
            </span>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clear}
            className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            disabled={!hasDrawn && !value}
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Bersihkan
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={undo}
            className="h-8 text-xs text-gray-600 hover:bg-gray-100"
            disabled={history.length <= 1}
          >
            Urungkan (Undo)
          </Button>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-blue-700 font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>E-Signature PAWARTA</span>
        </div>
      </div>
    </div>
  );
}
