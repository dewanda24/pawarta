'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RotateCcw, Check, PenTool, Wand2, Edit3, RefreshCw } from 'lucide-react';

interface SignaturePadProps {
  value?: string | null;
  onChange: (base64: string | null) => void;
  parentName?: string;
  height?: number;
}

type SignatureMode = 'DRAW' | 'AUTO';

const SIGNATURE_STYLES = [
  { id: 'style_1', name: 'Gaya 1 (Formal Script)', font: 'italic 34px "Brush Script MT", "Great Vibes", "Segoe Script", cursive', slant: 0.05 },
  { id: 'style_2', name: 'Gaya 2 (Eksekutif)', font: 'italic bold 30px "Dancing Script", "Segoe Script", "Lucida Handwriting", cursive', slant: 0.02 },
  { id: 'style_3', name: 'Gaya 3 (Elegan Modern)', font: 'italic 32px "Caveat", "Lucida Handwriting", cursive', slant: 0.08 },
  { id: 'style_4', name: 'Gaya 4 (Klasik Resmi)', font: 'italic bold 28px "Georgia", serif', slant: 0.04 },
];

export function SignaturePad({ value, onChange, parentName = '', height = 180 }: SignaturePadProps) {
  // Prioritas utama: DRAW (Tanda tangan gambar / gores langsung)
  const [mode, setMode] = useState<SignatureMode>('DRAW');
  const [selectedStyleIndex, setSelectedStyleIndex] = useState(0);
  const [customSignText, setCustomSignText] = useState(parentName || '');

  // Canvas Refs
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const autoCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Drawing state in Refs to eliminate render latency & dropped strokes
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const historyRef = useRef<ImageData[]>([]);
  const [historyCount, setHistoryCount] = useState(0);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Stable onChange ref so changing onChange prop doesn't re-trigger canvas re-inits
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Update text when parentName prop updates and in AUTO mode
  useEffect(() => {
    if (parentName && !customSignText) {
      setCustomSignText(parentName);
    }
  }, [parentName, customSignText]);

  // Setup Draw Canvas & High-DPI support
  const initDrawCanvas = useCallback((preserveContent = false) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const targetWidth = Math.round(rect.width * ratio);
    const targetHeight = Math.round(height * ratio);

    let previousImage: ImageData | null = null;
    if (preserveContent && canvas.width > 0 && canvas.height > 0) {
      const oldCtx = canvas.getContext('2d', { willReadFrequently: true });
      if (oldCtx) {
        try {
          previousImage = oldCtx.getImageData(0, 0, canvas.width, canvas.height);
        } catch {
          // ignore
        }
      }
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a'; // Deep slate ink
    ctx.lineWidth = 2.5;

    if (previousImage) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.putImageData(previousImage, 0, 0);
      ctx.restore();
    } else {
      const blankSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      historyRef.current = [blankSnapshot];
      setHistoryCount(1);
    }
  }, [height]);

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

    canvas.width = Math.round(w * ratio);
    canvas.height = Math.round(h * ratio);

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
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
    onChangeRef.current(dataUrl);
  }, [customSignText, parentName, selectedStyleIndex, height]);

  // Initialize DRAW canvas on mount and mode switch
  useEffect(() => {
    if (mode === 'DRAW') {
      const timer = setTimeout(() => {
        initDrawCanvas(false);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [mode, initDrawCanvas]);

  // Trigger auto generate when relevant state changes
  useEffect(() => {
    if (mode === 'AUTO') {
      const timer = setTimeout(() => {
        generateAutoSignature();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [mode, generateAutoSignature]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (mode === 'DRAW') {
        initDrawCanvas(true);
      } else {
        generateAutoSignature();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mode, initDrawCanvas, generateAutoSignature]);

  // Coordinates helper using client coordinates relative to canvas
  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // High-performance Pointer Events for DRAW mode
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const { x, y } = getCoordinates(e);
    isDrawingRef.current = true;
    lastPointRef.current = { x, y };

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;

    // Draw immediate dot for tap/click
    ctx.beginPath();
    ctx.arc(x, y, 1.25, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    if (!hasDrawn) {
      setHasDrawn(true);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !lastPointRef.current) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    lastPointRef.current = { x, y };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    lastPointRef.current = null;

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }

    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Save snapshot to history
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyRef.current = [...historyRef.current, snapshot];
    setHistoryCount(historyRef.current.length);

    // Export base64
    const dataUrl = canvas.toDataURL('image/png');
    onChangeRef.current(dataUrl);
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLCanvasElement>) => {
    handlePointerUp(e);
  };

  const handleClear = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const blank = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyRef.current = [blank];
    setHistoryCount(1);
    setHasDrawn(false);
    onChangeRef.current(null);
  };

  const handleUndo = () => {
    if (historyRef.current.length <= 1) {
      handleClear();
      return;
    }
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const newHistory = [...historyRef.current];
    newHistory.pop();
    historyRef.current = newHistory;
    setHistoryCount(newHistory.length);

    const previousSnapshot = newHistory[newHistory.length - 1];
    if (previousSnapshot && newHistory.length > 1) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.putImageData(previousSnapshot, 0, 0);
      ctx.restore();
      const dataUrl = canvas.toDataURL('image/png');
      onChangeRef.current(dataUrl);
    } else {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      setHasDrawn(false);
      onChangeRef.current(null);
    }
  };

  const switchToDrawMode = () => {
    setMode('DRAW');
    setTimeout(() => {
      initDrawCanvas(true);
      const canvas = drawCanvasRef.current;
      if (canvas && hasDrawn) {
        onChangeRef.current(canvas.toDataURL('image/png'));
      } else {
        onChangeRef.current(null);
      }
    }, 50);
  };

  const switchToAutoMode = () => {
    setMode('AUTO');
    setTimeout(() => {
      generateAutoSignature();
    }, 50);
  };

  return (
    <div className="space-y-3">
      {/* Tab Pilihan Mode Tanda Tangan */}
      <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
        <button
          type="button"
          onClick={switchToDrawMode}
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
          onClick={switchToAutoMode}
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
                onClick={handleUndo}
                disabled={historyCount <= 1}
                className="h-7 px-2 text-[11px] text-gray-600"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Urungkan
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClear}
                disabled={!hasDrawn}
                className="h-7 px-2 text-[11px] text-red-600 hover:bg-red-50"
              >
                Bersihkan
              </Button>
            </div>
          </div>

          <div className="relative border-2 border-dashed border-gray-300 rounded-2xl bg-white overflow-hidden shadow-inner select-none touch-none">
            <canvas
              ref={drawCanvasRef}
              style={{
                width: '100%',
                height: `${height}px`,
                display: 'block',
                touchAction: 'none',
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              onPointerLeave={handlePointerUp}
              className="cursor-crosshair w-full block touch-none select-none"
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
