'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RotateCcw, Check, PenTool, Sparkles, Wand2, Edit3, RefreshCw } from 'lucide-react';

interface SignaturePadProps {
  value?: string | null;
  onChange: (base64: string | null) => void;
  parentName?: string;
  height?: number;
}

type SignatureMode = 'AUTO' | 'DRAW';

const SIGNATURE_STYLES = [
  { id: 'style_1', name: 'Gaya 1 (Formal Script)', font: 'italic 34px "Brush Script MT", "Great Vibes", cursive', slant: 0.05, underline: true },
  { id: 'style_2', name: 'Gaya 2 (Eksekutif)', font: 'italic bold 30px "Dancing Script", "Segoe Script", cursive', slant: 0.02, underline: true },
  { id: 'style_3', name: 'Gaya 3 (Elegan Modern)', font: 'italic 32px "Caveat", "Lucida Handwriting", cursive', slant: 0.08, underline: false },
  { id: 'style_4', name: 'Gaya 4 (Klasik Resmi)', font: 'italic bold 28px "Georgia", serif', slant: 0.04, underline: true },
];

export function SignaturePad({ value, onChange, parentName = '', height = 180 }: SignaturePadProps) {
  const [mode, setMode] = useState<SignatureMode>('AUTO');
  const [selectedStyleIndex, setSelectedStyleIndex] = useState(0);
  const [customSignText, setCustomSignText] = useState(parentName || '');

  // Canvas Refs
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const autoCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);

  // Update text when parentName prop updates and in AUTO mode
  useEffect(() => {
    if (parentName && !customSignText) {
      setCustomSignText(parentName);
    }
  }, [parentName, customSignText]);

  // Setup Draw Canvas & High-DPI support
  const initDrawCanvas = useCallback(() => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
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

    // Snapshot awal
    const blankSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([blankSnapshot]);
  }, []);

  useEffect(() => {
    if (mode === 'DRAW') {
      initDrawCanvas();
    }
    const handleResize = () => {
      if (mode === 'DRAW') initDrawCanvas();
      else generateAutoSignature();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mode, initDrawCanvas]);

  // Generate Auto Signature from Name
  const generateAutoSignature = useCallback(() => {
    const canvas = autoCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const textToDraw = customSignText || parentName || 'Tanda Tangan';
    const style = SIGNATURE_STYLES[selectedStyleIndex] || SIGNATURE_STYLES[0];

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const rect = canvas.getBoundingClientRect();
    const w = rect.width || 400;
    const h = height;

    canvas.width = w * ratio;
    canvas.height = h * ratio;

    ctx.scale(ratio, ratio);
    ctx.clearRect(0, 0, w, h);

    // Tinta Tanda Tangan (Biru Tua / Hitam Elegan Formal)
    ctx.fillStyle = '#0f2452';
    ctx.strokeStyle = '#0f2452';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Apply Slant / Rotasi Tanda Tangan
    ctx.save();
    ctx.translate(w / 2, h / 2 - 5);
    ctx.rotate(style.slant);

    // Font Tanda Tangan
    ctx.font = style.font;
    ctx.fillText(textToDraw, 0, 0);

    // Goresan Garis Bawah / Underline Artistik Khas Tanda Tangan
    if (style.underline) {
      const textMetrics = ctx.measureText(textToDraw);
      const textWidth = Math.min(textMetrics.width, w * 0.85);
      const startX = -textWidth / 2 - 10;
      const endX = textWidth / 2 + 15;
      const underlineY = 18;

      ctx.beginPath();
      ctx.lineWidth = 2.2;
      ctx.moveTo(startX, underlineY);
      // Lengkungan kurva tanda tangan natural
      ctx.quadraticCurveTo(0, underlineY + 6, endX, underlineY - 2);
      ctx.stroke();

      // Titik dekoratif di ujung tanda tangan
      ctx.beginPath();
      ctx.arc(endX + 6, underlineY - 1, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // Export to base64
    const dataUrl = canvas.toDataURL('image/png');
    onChange(dataUrl);
  }, [customSignText, parentName, selectedStyleIndex, height, onChange]);

  // Trigger auto generate when relevant state changes
  useEffect(() => {
    if (mode === 'AUTO') {
      generateAutoSignature();
    }
  }, [mode, customSignText, parentName, selectedStyleIndex, generateAutoSignature]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
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
      e.preventDefault();
    }
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
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
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev, currentData]);

    const dataUrl = canvas.toDataURL('image/png');
    onChange(dataUrl);
  };

  const clear = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
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
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop();
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
    <div className="space-y-3">
      {/* Tab Pilihan Mode Tanda Tangan */}
      <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
        <button
          type="button"
          onClick={() => {
            setMode('AUTO');
          }}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            mode === 'AUTO'
              ? 'bg-white text-blue-900 shadow-xs border border-gray-200/80'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5 text-blue-600" />
          <span>Buat Otomatis Sistem</span>
          <span className="hidden sm:inline text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-medium">
            Praktis
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMode('DRAW');
            setTimeout(initDrawCanvas, 50);
          }}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            mode === 'DRAW'
              ? 'bg-white text-blue-900 shadow-xs border border-gray-200/80'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
          <span>Tanda Tangan Sendiri</span>
          <span className="hidden sm:inline text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.2 rounded font-medium">
            Layar Sentuh / Mouse
          </span>
        </button>
      </div>

      {/* MODE 1: OTOMATIS OLEH SISTEM */}
      {mode === 'AUTO' && (
        <div className="space-y-3">
          {/* Pilihan Gaya Tanda Tangan Kaligrafi */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SIGNATURE_STYLES.map((style, idx) => (
              <button
                key={style.id}
                type="button"
                onClick={() => setSelectedStyleIndex(idx)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedStyleIndex === idx
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-900">Gaya {idx + 1}</span>
                  {selectedStyleIndex === idx && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5 truncate">{style.name}</p>
              </button>
            ))}
          </div>

          {/* Kotak Tanda Tangan Otomatis */}
          <div className="relative border-2 border-solid border-blue-200 rounded-xl bg-linear-to-b from-blue-50/20 to-white shadow-xs overflow-hidden">
            <canvas
              ref={autoCanvasRef}
              style={{ height: `${height}px` }}
              className="w-full block"
            />

            <div className="absolute bottom-3 left-4 right-4 border-t border-gray-200/80 pointer-events-none flex justify-between items-center pt-1">
              <span className="text-[9px] text-gray-400 font-mono tracking-wider">
                E-SIGNATURE DIGITAL RESMI
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <Check className="w-3 h-3" /> Otomatis Terverifikasi
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <Label htmlFor="customSign" className="text-[11px] font-semibold shrink-0 text-gray-700">
                Nama di Tanda Tangan:
              </Label>
              <Input
                id="customSign"
                value={customSignText}
                onChange={(e) => setCustomSignText(e.target.value)}
                placeholder="Ketik nama untuk tanda tangan"
                className="h-7 text-xs bg-white flex-1 sm:w-48"
              />
            </div>

            <div className="flex items-center gap-1 text-[11px] text-blue-700 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dibuat Otomatis Sesuai Nama</span>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: GORES TANDA TANGAN SENDIRI */}
      {mode === 'DRAW' && (
        <div className="space-y-2">
          <div className="relative border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors rounded-xl bg-white shadow-xs overflow-hidden">
            {!hasDrawn && !value && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-gray-400 select-none">
                <PenTool className="w-6 h-6 mb-1 text-gray-300 animate-bounce" />
                <span className="text-xs font-medium">Goreskan Tanda Tangan Orang Tua / Wali di sini</span>
                <span className="text-[10px] text-gray-400 mt-0.5">
                  Dapat menggunakan jari di layar sentuh HP atau mouse di PC
                </span>
              </div>
            )}

            <canvas
              ref={drawCanvasRef}
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

            <div className="absolute bottom-4 left-6 right-6 border-b border-gray-200 pointer-events-none flex justify-between items-end pb-1">
              <span className="text-[10px] text-gray-400 font-mono tracking-wider">TANDA TANGAN RESMI</span>
              {hasDrawn && (
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  <Check className="w-3 h-3" /> Terekam
                </span>
              )}
            </div>
          </div>

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
              <span>Canvas Touch Signature</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
