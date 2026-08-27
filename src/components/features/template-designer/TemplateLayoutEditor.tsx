'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  PaperSettings,
  PaperSize,
  PaperOrientation,
  MARGIN_PRESETS,
  DEFAULT_PAPER_SETTINGS,
} from '@/features/master-data/types/template-surat';
import { PaperSimulator, SampleDocType } from './PaperSimulator';
import { saveDocumentTemplate } from '@/features/master-data/actions/template-surat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  FileText,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Save,
  Sliders,
  Type,
  Sparkles,
  ArrowLeft,
  Info,
  Check,
} from 'lucide-react';
import Link from 'next/link';

interface TemplateLayoutEditorProps {
  initialData?: {
    id?: string;
    kode?: string;
    nama?: string;
    kategoriId?: string | null;
    jenisSuratId?: string;
    deskripsi?: string | null;
    isAktif?: boolean;
    headerId?: string | null;
    kontenHtml?: string;
    pengaturanKertas?: PaperSettings;
  };
  headersList: Array<{
    id: string;
    namaKop: string;
    instansiUtama?: string | null;
    namaSekolah?: string | null;
    alamat?: string | null;
    kontak?: string | null;
    website?: string | null;
    logoUrl?: string | null;
    logoKiriUrl?: string | null;
    logoKananUrl?: string | null;
    tipeGaris?: string | null;
    tipeKop?: string | null;
    isDefault: boolean;
  }>;
  jenisSuratList: Array<{
    id: string;
    nama: string;
    kode?: string | null;
  }>;
  kategoriList: Array<{
    id: string;
    nama: string;
  }>;
  sekolah?: {
    nama?: string | null;
    alamat?: string | null;
    npsn?: string | null;
    email?: string | null;
    telepon?: string | null;
    kabupaten?: string | null;
  } | null;
  kepsek?: {
    nama?: string | null;
    nip?: string | null;
    pangkatGolongan?: string | null;
  } | null;
}

export function TemplateLayoutEditor({
  initialData,
  headersList,
  jenisSuratList,
  kategoriList,
  sekolah,
  kepsek,
}: TemplateLayoutEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Template basic info
  const [kode, setKode] = useState(initialData?.kode || 'TMPL-01');
  const [nama, setNama] = useState(initialData?.nama || 'Template Surat Dinas Standar');
  const [jenisSuratId, setJenisSuratId] = useState(
    initialData?.jenisSuratId || jenisSuratList[0]?.id || '',
  );
  const [kategoriId, setKategoriId] = useState(
    initialData?.kategoriId || kategoriList[0]?.id || '',
  );
  const [deskripsi, setDeskripsi] = useState(
    initialData?.deskripsi || 'Format naskah dinas resmi sesuai Perbup Tata Naskah Dinas.',
  );
  const [isAktif, setIsAktif] = useState(initialData?.isAktif ?? true);

  // Selected Kop Surat / Header
  const defaultHeader =
    headersList.find((h) => h.id === initialData?.headerId) ||
    headersList.find((h) => h.isDefault) ||
    headersList[0] ||
    null;
  const [selectedHeaderId, setSelectedHeaderId] = useState<string>(defaultHeader?.id || '');

  // Paper & Layout settings state
  const [paperSettings, setPaperSettings] = useState<PaperSettings>(
    initialData?.pengaturanKertas || DEFAULT_PAPER_SETTINGS,
  );

  // Live preview tools
  const [sampleType, setSampleType] = useState<SampleDocType>('UNDANGAN_DINAS');
  const [zoom, setZoom] = useState<number>(0.85); // Default comfortable 85% scale
  const [activeTab, setActiveTab] = useState<'kertas' | 'margin' | 'tipografi' | 'info'>('margin');

  const currentHeader = headersList.find((h) => h.id === selectedHeaderId) || defaultHeader;

  // Margin quick apply
  const applyPreset = (presetKey: keyof typeof MARGIN_PRESETS) => {
    const preset = MARGIN_PRESETS[presetKey];
    if (preset) {
      setPaperSettings((prev) => ({
        ...prev,
        margin: { ...preset.margin },
      }));
      toast.success(`Preset diterapkan: ${preset.nama}`);
    }
  };

  // Handle margin change
  const handleMarginChange = (side: 'top' | 'right' | 'bottom' | 'left', value: number) => {
    setPaperSettings((prev) => ({
      ...prev,
      margin: {
        ...prev.margin,
        [side]: Math.max(0.5, Math.min(10, value)),
      },
    }));
  };

  // Handle saving
  const handleSave = () => {
    if (!kode.trim() || !nama.trim() || !jenisSuratId) {
      toast.error('Mohon lengkapi kode template, nama, dan jenis surat');
      return;
    }

    startTransition(async () => {
      try {
        const res = await saveDocumentTemplate({
          id: initialData?.id,
          kode,
          nama,
          jenisSuratId,
          kategoriId: kategoriId || null,
          deskripsi,
          isAktif,
          headerId: selectedHeaderId || null,
          pengaturanKertas: paperSettings,
        });

        if (res.success) {
          toast.success('Template dan format margin berhasil disimpan!');
          router.push('/master/template-surat');
          router.refresh();
        } else {
          toast.error(res.error || 'Gagal menyimpan template');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
        toast.error(msg);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/master/template-surat">
            <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-lg">
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded">
                Layout & Margin Studio
              </span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs font-medium text-gray-600">
                Kertas: {paperSettings.ukuran} ({paperSettings.orientasi})
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mt-0.5">{nama}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 h-9"
          >
            <Printer className="w-4 h-4 text-gray-600" /> Cetak / PDF
          </Button>
          <Button
            size="sm"
            disabled={isPending}
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 h-9 shadow-xs"
          >
            <Save className="w-4 h-4" />
            {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </div>

      {/* Main Grid: Control Panel (Left) & Live Canvas (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT CONTROLS ================= */}
        <div className="lg:col-span-4 space-y-4 print:hidden">
          {/* Tabs Selector */}
          <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-2xs flex">
            <button
              onClick={() => setActiveTab('margin')}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'margin'
                  ? 'bg-blue-50 text-blue-700 shadow-2xs font-bold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" /> Margin
            </button>
            <button
              onClick={() => setActiveTab('kertas')}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'kertas'
                  ? 'bg-blue-50 text-blue-700 shadow-2xs font-bold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Kertas
            </button>
            <button
              onClick={() => setActiveTab('tipografi')}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'tipografi'
                  ? 'bg-blue-50 text-blue-700 shadow-2xs font-bold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Type className="w-3.5 h-3.5" /> Tipografi
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'info'
                  ? 'bg-blue-50 text-blue-700 shadow-2xs font-bold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Template
            </button>
          </div>

          {/* TAB 1: MARGIN CONTROLS */}
          {activeTab === 'margin' && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-5">
              <div>
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-blue-600" /> Pengaturan Margin Kertas
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tentukan jarak tepi kertas ke naskah dokumen dalam satuan Centimeter (cm).
                </p>
              </div>

              {/* Quick Presets */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-700">Preset Margin Cepat</Label>
                <div className="grid grid-cols-1 gap-1.5">
                  {Object.entries(MARGIN_PRESETS).map(([key, item]) => {
                    const isMatch =
                      paperSettings.margin.top === item.margin.top &&
                      paperSettings.margin.left === item.margin.left &&
                      paperSettings.margin.right === item.margin.right &&
                      paperSettings.margin.bottom === item.margin.bottom;

                    return (
                      <button
                        key={key}
                        onClick={() => applyPreset(key as keyof typeof MARGIN_PRESETS)}
                        className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                          isMatch
                            ? 'bg-blue-50/80 border-blue-300 text-blue-900 font-medium'
                            : 'bg-gray-50/60 border-gray-200 hover:bg-gray-100/80 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{item.nama}</span>
                          {isMatch && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                          {item.deskripsi}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Visual Margin Box & Sliders */}
              <div className="space-y-4 pt-2 border-t border-gray-100">
                <Label className="text-xs font-semibold text-gray-700">
                  Kustomisasi Margin Manual (cm)
                </Label>

                {/* Top Margin */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-gray-600">Margin Atas (Top)</span>
                    <span className="font-bold text-blue-700">
                      {paperSettings.margin.top} {paperSettings.margin.unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="6"
                      step="0.1"
                      value={paperSettings.margin.top}
                      onChange={(e) => handleMarginChange('top', parseFloat(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                    <Input
                      type="number"
                      min="1"
                      max="6"
                      step="0.1"
                      value={paperSettings.margin.top}
                      onChange={(e) => handleMarginChange('top', parseFloat(e.target.value) || 2)}
                      className="w-16 h-8 text-xs text-center"
                    />
                  </div>
                </div>

                {/* Left Margin (Garis lubang jilid) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-gray-600 flex items-center gap-1">
                      Margin Kiri (Left / Jilid)
                      <span className="text-[10px] text-amber-600 bg-amber-50 px-1 rounded">
                        Min. 3 cm
                      </span>
                    </span>
                    <span className="font-bold text-blue-700">
                      {paperSettings.margin.left} {paperSettings.margin.unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="6"
                      step="0.1"
                      value={paperSettings.margin.left}
                      onChange={(e) => handleMarginChange('left', parseFloat(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                    <Input
                      type="number"
                      min="1"
                      max="6"
                      step="0.1"
                      value={paperSettings.margin.left}
                      onChange={(e) => handleMarginChange('left', parseFloat(e.target.value) || 3)}
                      className="w-16 h-8 text-xs text-center"
                    />
                  </div>
                </div>

                {/* Right Margin */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-gray-600">Margin Kanan (Right)</span>
                    <span className="font-bold text-blue-700">
                      {paperSettings.margin.right} {paperSettings.margin.unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="6"
                      step="0.1"
                      value={paperSettings.margin.right}
                      onChange={(e) => handleMarginChange('right', parseFloat(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                    <Input
                      type="number"
                      min="1"
                      max="6"
                      step="0.1"
                      value={paperSettings.margin.right}
                      onChange={(e) => handleMarginChange('right', parseFloat(e.target.value) || 2)}
                      className="w-16 h-8 text-xs text-center"
                    />
                  </div>
                </div>

                {/* Bottom Margin */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-gray-600">Margin Bawah (Bottom)</span>
                    <span className="font-bold text-blue-700">
                      {paperSettings.margin.bottom} {paperSettings.margin.unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="6"
                      step="0.1"
                      value={paperSettings.margin.bottom}
                      onChange={(e) => handleMarginChange('bottom', parseFloat(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                    <Input
                      type="number"
                      min="1"
                      max="6"
                      step="0.1"
                      value={paperSettings.margin.bottom}
                      onChange={(e) =>
                        handleMarginChange('bottom', parseFloat(e.target.value) || 2.5)
                      }
                      className="w-16 h-8 text-xs text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Visual Guide Switch */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-semibold text-gray-800">
                    Tampilkan Garis Panduan Margin
                  </Label>
                  <p className="text-[11px] text-gray-500">
                    Garis putus-putus biru di kanvas preview (tidak ikut dicetak).
                  </p>
                </div>
                <Switch
                  checked={paperSettings.tampilkanGarisBatasMargin}
                  onCheckedChange={(checked) =>
                    setPaperSettings((prev) => ({
                      ...prev,
                      tampilkanGarisBatasMargin: checked,
                    }))
                  }
                />
              </div>
            </div>
          )}

          {/* TAB 2: KERTAS & ORIENTASI */}
          {activeTab === 'kertas' && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-5">
              <div>
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" /> Ukuran & Orientasi Kertas
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Pilih ukuran standar yang digunakan untuk mencetak naskah surat dinas.
                </p>
              </div>

              {/* Paper Size Radio Grid */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-700">Ukuran Kertas</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'A4', label: 'A4', dim: '210 x 297 mm' },
                    { id: 'F4', label: 'F4 / Folio', dim: '215 x 330 mm' },
                    { id: 'Letter', label: 'Letter', dim: '215.9 x 279.4 mm' },
                    { id: 'Legal', label: 'Legal', dim: '215.9 x 355.6 mm' },
                  ].map((p) => {
                    const isSelected = paperSettings.ukuran === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() =>
                          setPaperSettings((prev) => ({
                            ...prev,
                            ukuran: p.id as PaperSize,
                          }))
                        }
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-bold text-xs text-gray-900">{p.label}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{p.dim}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Orientation */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <Label className="text-xs font-semibold text-gray-700">Orientasi Kertas</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'portrait', label: 'Tegak (Portrait)' },
                    { id: 'landscape', label: 'Mendatar (Landscape)' },
                  ].map((o) => {
                    const isSelected = paperSettings.orientasi === o.id;
                    return (
                      <button
                        key={o.id}
                        onClick={() =>
                          setPaperSettings((prev) => ({
                            ...prev,
                            orientasi: o.id as PaperOrientation,
                          }))
                        }
                        className={`py-2 px-3 rounded-xl border text-center text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/60 text-blue-700 font-bold'
                            : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Header Selection */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <Label className="text-xs font-semibold text-gray-700">Kop Surat (Header)</Label>
                <select
                  value={selectedHeaderId}
                  onChange={(e) => setSelectedHeaderId(e.target.value)}
                  className="w-full h-9 rounded-xl border border-gray-200 text-xs px-3 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {headersList.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.namaKop} {h.isDefault ? '(Default)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* TAB 3: TIPOGRAFI & SPASI */}
          {activeTab === 'tipografi' && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-5">
              <div>
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <Type className="w-4 h-4 text-blue-600" /> Tipografi & Spasi Paragraf
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Standar jenis huruf dan kerapatan paragraf naskah dinas.
                </p>
              </div>

              {/* Font Family */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-700">Jenis Huruf (Font)</Label>
                <select
                  value={paperSettings.tipografi.fontFamily}
                  onChange={(e) =>
                    setPaperSettings((prev) => ({
                      ...prev,
                      tipografi: {
                        ...prev.tipografi,
                        fontFamily: e.target.value as PaperSettings['tipografi']['fontFamily'],
                      },
                    }))
                  }
                  className="w-full h-9 rounded-xl border border-gray-200 text-xs px-3 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="Arial">Arial (Standar Naskah Dinas Perbup)</option>
                  <option value="Bookman Old Style">Bookman Old Style (Naskah Keputusan/SK)</option>
                  <option value="Times New Roman">Times New Roman (Klasik / Akademik)</option>
                  <option value="Calibri">Calibri (Modern)</option>
                  <option value="Tahoma">Tahoma (Jelas & Tegas)</option>
                </select>
              </div>

              {/* Font Size & Line Height */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-700">Ukuran Huruf (pt)</Label>
                  <select
                    value={paperSettings.tipografi.fontSizePt}
                    onChange={(e) =>
                      setPaperSettings((prev) => ({
                        ...prev,
                        tipografi: {
                          ...prev.tipografi,
                          fontSizePt: parseInt(e.target.value) || 11,
                        },
                      }))
                    }
                    className="w-full h-9 rounded-xl border border-gray-200 text-xs px-3 bg-white"
                  >
                    <option value={10}>10 pt (Padat)</option>
                    <option value={11}>11 pt (Standar Dinas)</option>
                    <option value={12}>12 pt (Besar / Nyaman)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-700">Jarak Baris (Spasi)</Label>
                  <select
                    value={paperSettings.tipografi.lineHeight}
                    onChange={(e) =>
                      setPaperSettings((prev) => ({
                        ...prev,
                        tipografi: {
                          ...prev.tipografi,
                          lineHeight: parseFloat(e.target.value) || 1.15,
                        },
                      }))
                    }
                    className="w-full h-9 rounded-xl border border-gray-200 text-xs px-3 bg-white"
                  >
                    <option value={1.0}>1.0 (Single)</option>
                    <option value={1.15}>1.15 (Standar)</option>
                    <option value={1.5}>1.5 (Longgar)</option>
                  </select>
                </div>
              </div>

              {/* Indentasi & Spasi Antar Paragraf */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-700">
                    Indentasi Baris 1 (cm)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max="3"
                    step="0.25"
                    value={paperSettings.tipografi.firstLineIndentCm}
                    onChange={(e) =>
                      setPaperSettings((prev) => ({
                        ...prev,
                        tipografi: {
                          ...prev.tipografi,
                          firstLineIndentCm: parseFloat(e.target.value) || 1.0,
                        },
                      }))
                    }
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-700">Spasi Paragraf (pt)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="20"
                    step="2"
                    value={paperSettings.tipografi.paragraphSpacingPt}
                    onChange={(e) =>
                      setPaperSettings((prev) => ({
                        ...prev,
                        tipografi: {
                          ...prev.tipografi,
                          paragraphSpacingPt: parseInt(e.target.value) || 8,
                        },
                      }))
                    }
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TEMPLATE METADATA */}
          {activeTab === 'info' && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" /> Identitas Template
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Pengaturan kode dan nama untuk memudahkan staf memilih template.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-semibold text-gray-700">Kode Template</Label>
                  <Input
                    value={kode}
                    onChange={(e) => setKode(e.target.value)}
                    placeholder="Contoh: TMPL-DINAS-01"
                    className="h-9 text-xs mt-1 font-mono uppercase"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-gray-700">Nama Template</Label>
                  <Input
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Contoh: Surat Undangan Rapat Dinas Standar"
                    className="h-9 text-xs mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-gray-700">Jenis Surat</Label>
                  <select
                    value={jenisSuratId}
                    onChange={(e) => setJenisSuratId(e.target.value)}
                    className="w-full h-9 rounded-xl border border-gray-200 text-xs px-3 bg-white mt-1"
                  >
                    {jenisSuratList.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.nama} {j.kode ? `(${j.kode})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-gray-700">Kategori</Label>
                  <select
                    value={kategoriId}
                    onChange={(e) => setKategoriId(e.target.value)}
                    className="w-full h-9 rounded-xl border border-gray-200 text-xs px-3 bg-white mt-1"
                  >
                    {kategoriList.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-gray-700">Deskripsi / Catatan</Label>
                  <Textarea
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    rows={2}
                    placeholder="Catatan penggunaan template ini..."
                    className="text-xs mt-1"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <Label className="text-xs font-semibold text-gray-800">Status Aktif</Label>
                  <Switch checked={isAktif} onCheckedChange={setIsAktif} />
                </div>
              </div>
            </div>
          )}

          {/* Quick Info Box */}
          <div className="bg-blue-50/70 border border-blue-200/80 p-4 rounded-2xl text-xs text-blue-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Info className="w-4 h-4 text-blue-700" />
              <span>Standar Perbup Sumedang No. 9/2026:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-blue-800">
              Naskah dinas resmi menggunakan jenis huruf <strong>Arial (11 pt)</strong> dengan
              margin kiri <strong>3,0 cm</strong> dan jarak baris 1 s.d. 1,15 spasi.
            </p>
          </div>
        </div>

        {/* ================= RIGHT LIVE PREVIEW CANVAS ================= */}
        <div className="lg:col-span-8 space-y-4">
          {/* Canvas Floating Toolbar */}
          <div className="bg-gray-900 text-white p-3 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-3 print:hidden">
            {/* Sample Letter Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400">Contoh Naskah:</span>
              <select
                value={sampleType}
                onChange={(e) => setSampleType(e.target.value as SampleDocType)}
                className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-blue-400"
              >
                <option value="UNDANGAN_DINAS">Surat Undangan Dinas</option>
                <option value="SURAT_TUGAS">Surat Perintah Tugas</option>
                <option value="KETERANGAN_SISWA">Surat Keterangan Siswa Aktif</option>
              </select>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1.5 bg-gray-800 px-2 py-1 rounded-lg border border-gray-700">
              <button
                onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.1).toFixed(2))))}
                className="p-1 hover:bg-gray-700 rounded text-gray-300 hover:text-white"
                title="Perkecil"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-mono w-12 text-center text-gray-200">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(1.4, Number((z + 0.1).toFixed(2))))}
                className="p-1 hover:bg-gray-700 rounded text-gray-300 hover:text-white"
                title="Perbesar"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <div className="w-[1px] h-3 bg-gray-700 mx-1" />
              <button
                onClick={() => setZoom(0.85)}
                className="text-[11px] text-gray-400 hover:text-white px-1"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3 h-3 inline mr-1" />
                85%
              </button>
              <button
                onClick={() => setZoom(1.0)}
                className="text-[11px] text-gray-400 hover:text-white px-1"
                title="100% Ukuran Nyata"
              >
                100%
              </button>
            </div>
          </div>

          {/* Canvas Scroll Area with Dark Backdrop */}
          <div className="bg-stone-200/80 p-4 sm:p-8 rounded-2xl border border-stone-300 min-h-[750px] overflow-auto flex justify-center items-start shadow-inner">
            <PaperSimulator
              settings={paperSettings}
              header={currentHeader}
              fallbackSekolah={sekolah}
              kepsek={kepsek}
              sampleType={sampleType}
              zoom={zoom}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
