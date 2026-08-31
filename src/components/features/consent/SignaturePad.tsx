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

type SignatureMode = 'DRAW' | 'AUTO';

const SIGNATURE_STYLES = [
  { id: 'style_1', name: 'Gaya 1 (Formal Script)', font: 'italic 34px "Brush Script MT", "Great Vibes", cursive', slant: 0.05, underline: false },
  { id: 'style_2', name: 'Gaya 2 (Eksekutif)', font: 'italic bold 30px "Dancing Script", "Segoe Script", cursive', slant: 0.02, underline: false },
  { id: 'style_3', name: 'Gaya 3 (Elegan Modern)', font: 'italic 32px "Caveat", "Lucida Handwriting", cursive', slant: 0.08, underline: false },
  { id: 'style_4', name: 'Gaya 4 (Klasik Resmi)', font: 'italic bold 28px "Georgia", serif', slant: 0.04, underline: false },
];

export function SignaturePad({ value, onChange, parentName = '', height = 180 }: SignaturePadProps) {
  // Prioritas utama: DRAW (Tanda tangan gambar / gores langsung)
  const [mode, setMode] = useState<SignatureMode>('DRAW');
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

  // Generate Auto Signature from Name (Tanpa Garis Bawah)
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

    // Styling Tanda Tangan
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(style.slant);

    // Font Tanda Tangan
    ctx.font = style.font;
    ctx.fillText(textToDraw, 0, 0);

    ctx.restore();

    // Export to base64
    const dataUrl = canvas.toDataURL('image/png');
    onChange(dataUrl);
  }, [customSignText, parentName, selectedStyleIndex, height, onChange]);

  useEffect(() => {
    if (mode === 'DRAW') {
      initDrawCanvas();
    } else {
      generateAutoSignature();
    }
    const handleResize = () => {
      if (mode === 'DRAW') initDrawCanvas();
      else generateAutoSignature();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mode, initDrawCanvas, generateAutoSignature]);

  // Trigger auto generate when relevant state changes
  useEffect(() => {
    if (mode === 'AUTO') {
      generateAutoSignature();
    }
  }, [mode, selectedStyleIndex, customSignText, parentName, generateAutoSignature]);

  // Handle Manual Drawing Coordinates
  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
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

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
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

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    if ('touches' in e) {
      e.preventDefault(); // Prevent page scroll on touch
    }

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

    // Save snapshot to history
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev, snapshot]);

    // Export base64
    const dataUrl = canvas.toDataURL('image/png');
    onChange(dataUrl);
  };

  const clear = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    const blankSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([blankSnapshot]);
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
            setMode('DRAW');
            setTimeout(initDrawCanvas, 50);
          }}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            mode === 'DRAW'
              ? 'bg-white text-blue-900 shadow-xs border border-gray-200/80'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5 text-blue-600" />
          <span>Tanda Tangan Gambar (Gores Sendiri)</span>
          <span className="hidden sm:inline text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-medium">
            Utama
          </span>
        </button>

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
          <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
          <span>Otomatis Sistem</span>
          <span className="hidden sm:inline text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.2 rounded font-medium">
            Alternatif
          </span>
        </button>
      </div>

      {/* MODE 1: GORES SENDIRI (UTAMA) */}
      {mode === 'DRAW' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Goreskan tanda tangan menggunakan jari / mouse:</span>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={undo}
                disabled={history.length <= 1}
                className="h-7 px-2 text-[11px] text-gray-600"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Urungkan
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clear}
                disabled={!hasDrawn}
                className="h-7 px-2 text-[11px] text-red-600 hover:bg-red-50"
              >
                Bersihkan
              </Button>
            </div>
          </div>

          <div className="relative border-2 border-dashed border-gray-300 rounded-2xl bg-white overflow-hidden shadow-inner touch-none">
            <canvas
              ref={drawCanvasRef}
              style={{ width: '100%', height: `${height}px`, display: 'block' }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="cursor-crosshair"
            />
            {!hasDrawn && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-gray-400 gap-1 select-none">
                <PenTool className="w-6 h-6 stroke-[1.5] text-gray-300" />
                <span className="text-xs font-medium">Area Goresan Tanda Tangan Orang Tua / Wali</span>
                <span className="text-[10px] text-gray-400">Gunakan layar sentuh HP atau kursor mouse</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 2: OTOMATIS OLEH SISTEM (ALTERNATIF) */}
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
                  <span className="text-[11px] font-bold text-gray-800">{style.name}</span>
                  {selectedStyleIndex === idx && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5 truncate">
                  {customSignText || parentName || 'Ttd'}
                </p>
              </button>
            ))}
          </div>

          {/* Kotak Edit Nama/Inisial Ttd */}
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-gray-700">
              Teks / Nama Tanda Tangan:
            </Label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={customSignText}
                onChange={(e) => setCustomSignText(e.target.value)}
                placeholder="Nama pada tanda tangan..."
                className="h-9 text-xs bg-white"
              />
              {parentName && customSignText !== parentName && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCustomSignText(parentName)}
                  className="h-9 text-xs px-2.5 text-blue-600"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  Sesuai Nama
                </Button>
              )}
            </div>
          </div>

          {/* Kanvas Pratinjau Tanda Tangan Otomatis */}
          <div className="relative border-2 border-blue-200 rounded-2xl bg-gradient-to-b from-blue-50/20 to-white overflow-hidden shadow-2xs">
            <canvas
              ref={autoCanvasRef}
              style={{ width: '100%', height: `${height}px`, display: 'block' }}
            />
            <div className="absolute bottom-2 right-3 pointer-events-none text-[10px] text-blue-600/70 font-semibold bg-white/80 px-2 py-0.5 rounded-full border border-blue-100">
              ✓ Dihasilkan Otomatis Oleh Sistem (Tanpa Garis Bawah)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
