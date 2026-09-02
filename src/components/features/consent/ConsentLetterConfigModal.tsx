'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ConsentLetterConfig,
  DEFAULT_CONSENT_LETTER_CONFIG,
  DEFAULT_LAMPIRAN_JADWAL_KBM,
  HARI_LIST,
  JadwalKbmItem,
} from '@/features/student-letter/consent-config';
import {
  saveConsentLetterConfig,
  resetConsentLetterConfig,
} from '@/features/student-letter/consent-actions';
import {
  Settings2,
  FileText,
  UserCheck,
  Eye,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Loader2,
  CheckCircle2,
  Sparkles,
  Type,
  CalendarDays,
  Copy,
  Coffee,
  BookOpen,
  ArrowRight,
  Layers,
  Search,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { toast } from 'sonner';

interface PegawaiItem {
  id: string;
  nama: string;
  nip: string | null;
  pangkatGolongan?: string | null;
  jabatan?: { nama: string } | null;
  unitKerja?: { nama: string } | null;
}

interface ConsentLetterConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialConfig: ConsentLetterConfig;
  availablePegawai: PegawaiItem[];
  sekolahNama?: string;
  sekolahKabupaten?: string;
  onSaved?: (updated: ConsentLetterConfig) => void;
}

export function ConsentLetterConfigModal({
  open,
  onOpenChange,
  initialConfig,
  availablePegawai,
  sekolahNama = 'SMPN 1 UJUNGJAYA',
  sekolahKabupaten = 'Sumedang',
  onSaved,
}: ConsentLetterConfigModalProps) {
  const [activeTab, setActiveTab] = useState<'redaksi' | 'jadwal' | 'penandatangan' | 'preview'>(
    'redaksi',
  );
  const [config, setConfig] = useState<ConsentLetterConfig>(
    initialConfig || DEFAULT_CONSENT_LETTER_CONFIG,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Filter & Utilitas Jadwal
  const [jadwalDayFilter, setJadwalDayFilter] = useState<string>('ALL');
  const [searchKegiatan, setSearchKegiatan] = useState<string>('');
  const [showCopyPanel, setShowCopyPanel] = useState<boolean>(false);
  const [copySourceDay, setCopySourceDay] = useState<string>('Selasa');
  const [copyTargetDay, setCopyTargetDay] = useState<string>('Rabu');

  const [prevInitial, setPrevInitial] = useState(initialConfig);
  if (initialConfig !== prevInitial) {
    setPrevInitial(initialConfig);
    setConfig({
      ...initialConfig,
      lampiranJadwal: {
        judul:
          initialConfig.lampiranJadwal?.judul ||
          DEFAULT_CONSENT_LETTER_CONFIG.lampiranJadwal?.judul,
        subjudul:
          initialConfig.lampiranJadwal?.subjudul ||
          DEFAULT_CONSENT_LETTER_CONFIG.lampiranJadwal?.subjudul,
        items:
          initialConfig.lampiranJadwal?.items && initialConfig.lampiranJadwal.items.length > 0
            ? initialConfig.lampiranJadwal.items
            : DEFAULT_LAMPIRAN_JADWAL_KBM,
      },
    });
  }

  const scheduleItems: JadwalKbmItem[] =
    config.lampiranJadwal?.items && config.lampiranJadwal.items.length > 0
      ? config.lampiranJadwal.items
      : DEFAULT_LAMPIRAN_JADWAL_KBM;

  const handleSelectPegawai = (pegawaiId: string) => {
    const selected = availablePegawai.find((p) => p.id === pegawaiId);
    if (!selected) return;

    setConfig((prev) => ({
      ...prev,
      penandatangan: {
        ...prev.penandatangan,
        pegawaiId: selected.id,
        nama: selected.nama,
        nip: selected.nip || '',
        pangkatGolongan: selected.pangkatGolongan || prev.penandatangan.pangkatGolongan || '',
        jabatan: selected.jabatan?.nama
          ? `${selected.jabatan.nama} ${sekolahNama}`
          : prev.penandatangan.jabatan || `Kepala ${sekolahNama}`,
      },
    }));
  };

  const handleAddKomitmen = () => {
    setConfig((prev) => ({
      ...prev,
      komitmenPoin: [...prev.komitmenPoin, 'Poin komitmen baru...'],
    }));
  };

  const handleRemoveKomitmen = (index: number) => {
    if (config.komitmenPoin.length <= 1) {
      toast.error('Minimal harus ada 1 butir komitmen');
      return;
    }
    setConfig((prev) => ({
      ...prev,
      komitmenPoin: prev.komitmenPoin.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateKomitmen = (index: number, val: string) => {
    setConfig((prev) => {
      const next = [...prev.komitmenPoin];
      next[index] = val;
      return { ...prev, komitmenPoin: next };
    });
  };

  // =========================================================================
  // HANDLERS EDIT JADWAL KBM
  // =========================================================================
  const handleUpdateLampiranHeader = (field: 'judul' | 'subjudul', val: string) => {
    setConfig((prev) => ({
      ...prev,
      lampiranJadwal: {
        judul:
          prev.lampiranJadwal?.judul || DEFAULT_CONSENT_LETTER_CONFIG.lampiranJadwal?.judul || '',
        subjudul:
          prev.lampiranJadwal?.subjudul ||
          DEFAULT_CONSENT_LETTER_CONFIG.lampiranJadwal?.subjudul ||
          '',
        items: prev.lampiranJadwal?.items || DEFAULT_LAMPIRAN_JADWAL_KBM,
        [field]: val,
      },
    }));
  };

  const handleUpdateJadwalItem = (
    globalIndex: number,
    field: keyof JadwalKbmItem,
    val: JadwalKbmItem[keyof JadwalKbmItem],
  ) => {
    setConfig((prev) => {
      const currentItems = [...(prev.lampiranJadwal?.items || DEFAULT_LAMPIRAN_JADWAL_KBM)];
      if (currentItems[globalIndex]) {
        currentItems[globalIndex] = {
          ...currentItems[globalIndex],
          [field]: val,
        };
      }
      return {
        ...prev,
        lampiranJadwal: {
          judul:
            prev.lampiranJadwal?.judul || DEFAULT_CONSENT_LETTER_CONFIG.lampiranJadwal?.judul || '',
          subjudul:
            prev.lampiranJadwal?.subjudul ||
            DEFAULT_CONSENT_LETTER_CONFIG.lampiranJadwal?.subjudul ||
            '',
          items: currentItems,
        },
      };
    });
  };

  const handleAddJadwalItem = (hariPreset?: string) => {
    setConfig((prev) => {
      const currentItems = [...(prev.lampiranJadwal?.items || DEFAULT_LAMPIRAN_JADWAL_KBM)];
      const targetHari =
        hariPreset && hariPreset !== 'ALL'
          ? hariPreset
          : jadwalDayFilter !== 'ALL'
            ? jadwalDayFilter
            : 'Senin';

      const itemsForHari = currentItems.filter((it) => it.hari === targetHari);
      let nextJam = '07.00–07.40';
      const nonBreakCount = itemsForHari.filter(
        (i) => !i.isIstirahat && i.kegiatan?.toLowerCase().includes('jam pelajaran'),
      ).length;
      const nextKegiatan = `Jam Pelajaran ke-${nonBreakCount + 1}`;

      if (itemsForHari.length > 0) {
        const lastItem = itemsForHari[itemsForHari.length - 1];
        const parts = lastItem.jam.split('–');
        if (parts.length === 2 && parts[1].trim()) {
          const endJam = parts[1].trim();
          nextJam = `${endJam}–...`;
        }
      }

      const newItem: JadwalKbmItem = {
        hari: targetHari,
        jam: nextJam,
        kegiatan: nextKegiatan,
        isIstirahat: false,
      };

      // Cari indeks terakhir untuk hari tersebut agar rapi
      let lastIndexForDay = -1;
      for (let i = currentItems.length - 1; i >= 0; i--) {
        if (currentItems[i].hari === targetHari) {
          lastIndexForDay = i;
          break;
        }
      }

      if (lastIndexForDay !== -1) {
        currentItems.splice(lastIndexForDay + 1, 0, newItem);
      } else {
        currentItems.push(newItem);
      }

      return {
        ...prev,
        lampiranJadwal: {
          judul:
            prev.lampiranJadwal?.judul || DEFAULT_CONSENT_LETTER_CONFIG.lampiranJadwal?.judul || '',
          subjudul:
            prev.lampiranJadwal?.subjudul ||
            DEFAULT_CONSENT_LETTER_CONFIG.lampiranJadwal?.subjudul ||
            '',
          items: currentItems,
        },
      };
    });
    toast.success('Sesi baru berhasil ditambahkan');
  };

  const handleDeleteJadwalItem = (globalIndex: number) => {
    setConfig((prev) => {
      const currentItems = [...(prev.lampiranJadwal?.items || DEFAULT_LAMPIRAN_JADWAL_KBM)];
      currentItems.splice(globalIndex, 1);
      return {
        ...prev,
        lampiranJadwal: {
          judul:
            prev.lampiranJadwal?.judul || DEFAULT_CONSENT_LETTER_CONFIG.lampiranJadwal?.judul || '',
          subjudul:
            prev.lampiranJadwal?.subjudul ||
            DEFAULT_CONSENT_LETTER_CONFIG.lampiranJadwal?.subjudul ||
            '',
          items: currentItems,
        },
      };
    });
    toast.success('Sesi jadwal dihapus');
  };

  const handleDuplicateJadwalItem = (globalIndex: number) => {
    setConfig((prev) => {
      const currentItems = [...(prev.lampiranJadwal?.items || DEFAULT_LAMPIRAN_JADWAL_KBM)];
      const target = currentItems[globalIndex];
      if (target) {
        const cloned: JadwalKbmItem = {
          ...target,
          kegiatan: `${target.kegiatan || 'Sesi'} (Salinan)`,
        };
        currentItems.splice(globalIndex + 1, 0, cloned);
      }
      return {
        ...prev,
        lampiranJadwal: {
          judul:
            prev.lampiranJadwal?.judul || DEFAULT_CONSENT_LETTER_CONFIG.lampiranJadwal?.judul || '',
          subjudul:
            prev.lampiranJadwal?.subjudul ||
            DEFAULT_CONSENT_LETTER_CONFIG.lampiranJadwal?.subjudul ||
            '',
          items: currentItems,
        },
      };
    });
    toast.success('Sesi berhasil diduplikasi');
  };

  const handleMoveJadwalItem = (globalIndex: number, direction: 'UP' | 'DOWN') => {
    setConfig((prev) => {
      const currentItems = [...(prev.lampiranJadwal?.items || DEFAULT_LAMPIRAN_JADWAL_KBM)];
      const targetIndex = direction === 'UP' ? globalIndex - 1 : globalIndex + 1;
      if (targetIndex < 0 || targetIndex >= currentItems.length) return prev;

      const temp = currentItems[globalIndex];
      currentItems[globalIndex] = currentItems[targetIndex];
      currentItems[targetIndex] = temp;

      return {
        ...prev,
        lampiranJadwal: {
          judul:
            prev.lampiranJadwal?.judul || DEFAULT_CONSENT_LETTER_CONFIG.lampiranJadwal?.judul || '',
          subjudul:
            prev.lampiranJadwal?.subjudul ||
            DEFAULT_CONSENT_LETTER_CONFIG.lampiranJadwal?.subjudul ||
            '',
          items: currentItems,
        },
      };
    });
  };

  const handleResetJadwalOnly = () => {
    if (
      !confirm(
        'Kembalikan seluruh tabel jadwal KBM 5 hari ke standar default resmi sekolah (47 sesi)?',
      )
    ) {
      return;
    }

    setConfig((prev) => ({
      ...prev,
      lampiranJadwal: {
        judul: DEFAULT_CONSENT_LETTER_CONFIG.lampiranJadwal?.judul || '',
        subjudul: DEFAULT_CONSENT_LETTER_CONFIG.lampiranJadwal?.subjudul || '',
        items: [...DEFAULT_LAMPIRAN_JADWAL_KBM],
      },
    }));
    toast.success('Tabel jadwal KBM dikembalikan ke standar 47 sesi resmi');
  };

  const handleCopyDaySchedule = () => {
    if (copySourceDay === copyTargetDay) {
      toast.error('Pilih hari sumber dan tujuan yang berbeda');
      return;
    }

    if (
      !confirm(
        `Salin semua sesi dari hari ${copySourceDay} ke hari ${copyTargetDay}? Sesi pada hari ${copyTargetDay} saat ini akan digantikan.`,
      )
    ) {
      return;
    }

    setConfig((prev) => {
      const currentItems = [...(prev.lampiranJadwal?.items || DEFAULT_LAMPIRAN_JADWAL_KBM)];
      const sourceItems = currentItems.filter((it) => it.hari === copySourceDay);
      if (sourceItems.length === 0) {
        toast.error(`Tidak ada sesi pada hari ${copySourceDay}`);
        return prev;
      }

      // Hapus sesi target yang ada
      const withoutTarget = currentItems.filter((it) => it.hari !== copyTargetDay);

      // Buat salinan sesi dengan hari target
      const copiedItems = sourceItems.map((it) => ({
        ...it,
        hari: copyTargetDay,
      }));

      // Tentukan posisi penyisipan berdasarkan urutan baku hari
      const dayOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
      const targetDayIdx = dayOrder.indexOf(copyTargetDay);

      let insertIdx = withoutTarget.length;
      for (let i = 0; i < withoutTarget.length; i++) {
        const currentDayIdx = dayOrder.indexOf(withoutTarget[i].hari);
        if (currentDayIdx > targetDayIdx) {
          insertIdx = i;
          break;
        }
      }

      withoutTarget.splice(insertIdx, 0, ...copiedItems);

      return {
        ...prev,
        lampiranJadwal: {
          judul:
            prev.lampiranJadwal?.judul || DEFAULT_CONSENT_LETTER_CONFIG.lampiranJadwal?.judul || '',
          subjudul:
            prev.lampiranJadwal?.subjudul ||
            DEFAULT_CONSENT_LETTER_CONFIG.lampiranJadwal?.subjudul ||
            '',
          items: withoutTarget,
        },
      };
    });

    setShowCopyPanel(false);
    toast.success(`Jadwal hari ${copySourceDay} berhasil disalin ke hari ${copyTargetDay}`);
  };

  // =========================================================================
  // SIMPAN & RESET GLOBAL
  // =========================================================================
  const handleSave = async () => {
    if (!config.nomorSurat.trim()) {
      toast.error('Nomor surat wajib diisi');
      return;
    }
    if (!config.penandatangan.nama.trim()) {
      toast.error('Nama penandatangan wajib diisi');
      return;
    }
    if (!config.penandatangan.jabatan.trim()) {
      toast.error('Jabatan penandatangan wajib diisi');
      return;
    }

    setIsSaving(true);
    try {
      const res = await saveConsentLetterConfig(config);
      if (res.success) {
        toast.success('Pengaturan surat & jadwal 5 hari kerja berhasil disimpan!');
        if (onSaved) onSaved(config);
        onOpenChange(false);
      } else {
        toast.error(res.error || 'Gagal menyimpan pengaturan');
      }
    } catch {
      toast.error('Terjadi kesalahan saat menyimpan pengaturan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (
      !confirm(
        'Kembalikan seluruh teks, jadwal, dan penandatangan surat ke format standar resmi sekolah?',
      )
    ) {
      return;
    }

    setIsResetting(true);
    try {
      const res = await resetConsentLetterConfig();
      if (res.success) {
        setConfig(DEFAULT_CONSENT_LETTER_CONFIG);
        toast.success('Konfigurasi berhasil dikembalikan ke standar default');
        if (onSaved) onSaved(DEFAULT_CONSENT_LETTER_CONFIG);
      } else {
        toast.error(res.error || 'Gagal mereset konfigurasi');
      }
    } catch {
      toast.error('Terjadi kesalahan saat mereset konfigurasi');
    } finally {
      setIsResetting(false);
    }
  };

  const previewFont =
    config.fontSurat === 'Times New Roman'
      ? '"Times New Roman", Times, serif'
      : config.fontSurat === 'Bookman Old Style'
        ? '"Bookman Old Style", Georgia, serif'
        : config.fontSurat === 'Garamond'
          ? 'Garamond, "EB Garamond", serif'
          : config.fontSurat === 'Georgia'
            ? 'Georgia, serif'
            : config.fontSurat === 'Calibri'
              ? 'Calibri, Candara, Segoe, "Segoe UI", sans-serif'
              : config.fontSurat === 'Tahoma'
                ? 'Tahoma, Geneva, sans-serif'
                : config.fontSurat === 'Courier New'
                  ? '"Courier New", Courier, monospace'
                  : 'Arial, Helvetica, sans-serif';

  // Sesi yang difilter untuk editor jadwal
  const filteredScheduleWithGlobalIndex = scheduleItems
    .map((item, idx) => ({ item, globalIndex: idx }))
    .filter(({ item }) => {
      const matchDay = jadwalDayFilter === 'ALL' || item.hari === jadwalDayFilter;
      const matchSearch =
        !searchKegiatan.trim() ||
        (item.kegiatan || '').toLowerCase().includes(searchKegiatan.toLowerCase()) ||
        item.jam.toLowerCase().includes(searchKegiatan.toLowerCase());
      return matchDay && matchSearch;
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[94vh] flex flex-col p-0 rounded-2xl overflow-hidden shadow-2xl border-gray-200">
        {/* Modal Header */}
        <DialogHeader className="p-5 sm:p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold">
                <Settings2 className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Pengaturan Surat & Jadwal KBM 5 Hari Kerja
                </DialogTitle>
                <p className="text-xs text-blue-200 mt-0.5">
                  Sesuaikan redaksi surat, rincian jadwal jam belajar harian, dan penandatangan sah
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs (4 Tab Lengkap) */}
          <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-white/15 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActiveTab('redaksi')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'redaksi'
                  ? 'bg-white text-blue-950 shadow-xs font-bold'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>1. Redaksi & Naskah Dinas</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('jadwal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'jadwal'
                  ? 'bg-white text-blue-950 shadow-xs font-bold'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 text-blue-400" />
              <span>2. Lampiran Jadwal KBM</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/30 text-white font-mono">
                {scheduleItems.length} Sesi
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('penandatangan')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'penandatangan'
                  ? 'bg-white text-blue-950 shadow-xs font-bold'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>3. Hak Penandatangan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'preview'
                  ? 'bg-white text-blue-950 shadow-xs font-bold'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-amber-300" />
              <span>4. Live Preview Dokumen</span>
            </button>
          </div>
        </DialogHeader>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-gray-50/60 text-gray-900">
          {/* ========================================================================= */}
          {/* TAB 1: REDAKSI & KETENTUAN SURAT                                         */}
          {/* ========================================================================= */}
          {activeTab === 'redaksi' && (
            <div className="space-y-6 animate-in fade-in-50">
              {/* Bagian 1: Identitas & Klasifikasi Naskah */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-blue-900 border-b border-gray-100 pb-2">
                  A. Identitas Naskah Dinas (Halaman 1)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-700">
                      Nomor Surat Resmi <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={config.nomorSurat}
                      onChange={(e) => setConfig({ ...config, nomorSurat: e.target.value })}
                      placeholder="B/382/400.3.5.1/VIII/2026"
                      className="h-9 font-mono text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-700">Sifat Surat</Label>
                    <Input
                      value={config.sifatSurat}
                      onChange={(e) => setConfig({ ...config, sifatSurat: e.target.value })}
                      placeholder="Penting"
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-700">Lampiran</Label>
                    <Input
                      value={config.lampiranSurat}
                      onChange={(e) => setConfig({ ...config, lampiranSurat: e.target.value })}
                      placeholder="1 Lembar Lampiran Jadwal KBM"
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <Label className="text-xs font-semibold text-gray-700">Perihal Surat</Label>
                    <Input
                      value={config.perihalSurat}
                      onChange={(e) => setConfig({ ...config, perihalSurat: e.target.value })}
                      placeholder="Pemberitahuan & Persetujuan Pembelajaran 5 (Lima) Hari"
                      className="h-9 text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-700">Tempat Penerbitan</Label>
                    <Input
                      value={config.tempatSurat}
                      onChange={(e) => setConfig({ ...config, tempatSurat: e.target.value })}
                      placeholder="Sumedang"
                      className="h-9 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Bagian: Tipografi & Jenis Huruf */}
              <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
                    <Type className="w-4 h-4 text-blue-700" />
                    Format Tipografi & Jenis Huruf Naskah Surat
                  </h4>
                  <span className="text-[11px] text-blue-700 font-medium">
                    Berlaku untuk Surat Sekolah & Lembar Cetak Orang Tua
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Pilihan Font Family */}
                  <div className="sm:col-span-2 space-y-2 bg-white p-3.5 rounded-xl border border-blue-100">
                    <Label className="text-xs font-bold text-gray-800">
                      Jenis Font Naskah Surat (Font Family)
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                      {[
                        {
                          id: 'Times New Roman',
                          label: 'Times New Roman',
                          fontClass: "'Times New Roman', serif",
                        },
                        { id: 'Arial', label: 'Arial (Sans)', fontClass: 'Arial, sans-serif' },
                        {
                          id: 'Bookman Old Style',
                          label: 'Bookman',
                          fontClass: '"Bookman Old Style", serif',
                        },
                        { id: 'Garamond', label: 'Garamond', fontClass: 'Garamond, serif' },
                        { id: 'Georgia', label: 'Georgia', fontClass: 'Georgia, serif' },
                        { id: 'Calibri', label: 'Calibri', fontClass: 'Calibri, sans-serif' },
                        { id: 'Tahoma', label: 'Tahoma', fontClass: 'Tahoma, sans-serif' },
                        {
                          id: 'Courier New',
                          label: 'Courier New',
                          fontClass: '"Courier New", monospace',
                        },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setConfig({ ...config, fontSurat: item.id })}
                          style={{ fontFamily: item.fontClass }}
                          className={`p-2 rounded-lg border text-xs text-left transition-all ${
                            (config.fontSurat || 'Arial') === item.id
                              ? 'bg-blue-100/70 border-blue-600 font-bold text-blue-950 ring-1 ring-blue-500'
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <span className="truncate block">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pilihan Ukuran & Spasi */}
                  <div className="space-y-3 bg-white p-3.5 rounded-xl border border-blue-100">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-gray-800">Ukuran Huruf Naskah</Label>
                      <select
                        value={config.ukuranFontSurat || 11}
                        onChange={(e) =>
                          setConfig({ ...config, ukuranFontSurat: parseFloat(e.target.value) })
                        }
                        className="w-full h-8 px-2 rounded-md border border-gray-300 text-xs bg-white font-semibold text-gray-800"
                      >
                        <option value="10">10 pt (Kompak)</option>
                        <option value="10.5">10.5 pt</option>
                        <option value="11">11 pt (Standar Resmi)</option>
                        <option value="11.5">11.5 pt</option>
                        <option value="12">12 pt (Besar / Klasik)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-gray-800">Jarak Baris (Spasi)</Label>
                      <select
                        value={config.spasiSurat || '1.5'}
                        onChange={(e) => setConfig({ ...config, spasiSurat: e.target.value })}
                        className="w-full h-8 px-2 rounded-md border border-gray-300 text-xs bg-white font-semibold text-gray-800"
                      >
                        <option value="1.0">1.0 (Single Spasi)</option>
                        <option value="1.15">1.15 (Rapat Elegan)</option>
                        <option value="1.5">1.5 Spasi (Standar Naskah Dinas)</option>
                        <option value="2.0">2.0 (Double Spasi)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bagian 2: Teks Redaksi Pembuka & Ketentuan Pelaksanaan */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-blue-900 border-b border-gray-100 pb-2">
                  B. Redaksi Pemberitahuan & Tabel Ketentuan KBM 5 Hari
                </h4>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-700">
                    Teks Paragraf Pembuka:
                  </Label>
                  <Textarea
                    value={config.teksPembuka}
                    onChange={(e) => setConfig({ ...config, teksPembuka: e.target.value })}
                    rows={3}
                    className="text-xs text-gray-800 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-700">Mulai Berlaku:</Label>
                    <Input
                      value={config.ketentuan.mulaiBerlaku}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          ketentuan: { ...config.ketentuan, mulaiBerlaku: e.target.value },
                        })
                      }
                      placeholder="Tahun Pelajaran 2026/2027"
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-700">Hari Belajar:</Label>
                    <Input
                      value={config.ketentuan.hariBelajar}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          ketentuan: { ...config.ketentuan, hariBelajar: e.target.value },
                        })
                      }
                      placeholder="Senin s.d. Jumat"
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-700">Hari Libur:</Label>
                    <Input
                      value={config.ketentuan.hariLibur}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          ketentuan: { ...config.ketentuan, hariLibur: e.target.value },
                        })
                      }
                      placeholder="Sabtu dan Minggu"
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-700">
                      Keterangan Jam Belajar:
                    </Label>
                    <Input
                      value={config.ketentuan.jamBelajar}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          ketentuan: { ...config.ketentuan, jamBelajar: e.target.value },
                        })
                      }
                      placeholder="06.30 s.d. 14.00 WIB (Senin–Kamis) & 06.30 s.d. 11.30 WIB (Jumat)"
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <Label className="text-xs font-semibold text-gray-700">
                    Paragraf Tujuan Program:
                  </Label>
                  <Textarea
                    value={config.paragrafTujuan}
                    onChange={(e) => setConfig({ ...config, paragrafTujuan: e.target.value })}
                    rows={2}
                    className="text-xs text-gray-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-700">Teks Penutup Surat:</Label>
                  <Input
                    value={config.teksPenutup}
                    onChange={(e) => setConfig({ ...config, teksPenutup: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>

                {/* Banner Arahkan ke Tab Jadwal */}
                <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl text-xs space-y-2 text-blue-900 mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="font-bold flex items-center gap-1.5 text-blue-950">
                      <CalendarDays className="w-4 h-4 text-blue-700" />
                      Rincian Tabel Jam Pelajaran (Lampiran Jadwal KBM)
                    </p>
                    <p className="text-[11px] text-blue-800">
                      Terdapat <strong>{scheduleItems.length} sesi jam belajar</strong> yang dapat
                      Anda sesuaikan per hari, jam, kegiatan, dan waktu istirahat pada tab khusus.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('jadwal')}
                    className="shrink-0 text-xs bg-white text-blue-800 border-blue-300 hover:bg-blue-100 font-bold flex items-center gap-1.5 h-8"
                  >
                    <span>Buka Editor Jadwal KBM</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Bagian 3: Butir Komitmen Orang Tua (Halaman 2) */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-blue-900">
                    C. Butir Komitmen dan Tanggung Jawab Orang Tua / Wali (Halaman 2)
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddKomitmen}
                    className="text-xs h-7 text-blue-700 border-blue-200 hover:bg-blue-50 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Tambah Butir
                  </Button>
                </div>

                <div className="space-y-2.5">
                  {config.komitmenPoin.map((poin, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="w-6 h-9 rounded-lg bg-gray-100 text-gray-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <Textarea
                        value={poin}
                        onChange={(e) => handleUpdateKomitmen(idx, e.target.value)}
                        rows={2}
                        className="text-xs flex-1 bg-gray-50/70 border-gray-200"
                        placeholder="Isi klausul komitmen..."
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveKomitmen(idx)}
                        className="h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                        title="Hapus Butir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: LAMPIRAN JADWAL KBM (EDITOR INTERAKTIF JADWAL 5 HARI)              */}
          {/* ========================================================================= */}
          {activeTab === 'jadwal' && (
            <div className="space-y-5 animate-in fade-in-50">
              {/* Box 1: Judul & Subjudul Lampiran Dokumen */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-700" />
                    Header Lampiran Jadwal Dokumen
                  </h4>
                  <span className="text-[11px] text-gray-500">
                    Ditampilkan di bagian atas tabel jadwal lampiran
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-700">Judul Lampiran:</Label>
                    <Input
                      value={
                        config.lampiranJadwal?.judul ??
                        DEFAULT_CONSENT_LETTER_CONFIG.lampiranJadwal?.judul ??
                        ''
                      }
                      onChange={(e) => handleUpdateLampiranHeader('judul', e.target.value)}
                      placeholder="LAMPIRAN: JADWAL KEGIATAN BELAJAR MENGAJAR (KBM)"
                      className="h-9 text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-700">
                      Subjudul / Nama Program:
                    </Label>
                    <Input
                      value={
                        config.lampiranJadwal?.subjudul ??
                        DEFAULT_CONSENT_LETTER_CONFIG.lampiranJadwal?.subjudul ??
                        ''
                      }
                      onChange={(e) => handleUpdateLampiranHeader('subjudul', e.target.value)}
                      placeholder={`SISTEM PEMBELAJARAN 5 HARI KERJA — ${sekolahNama}`}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Box 2: Filter Hari, Pencarian, & Aksi Cepat */}
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                  {/* Day Filter Pills */}
                  <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                    <button
                      type="button"
                      onClick={() => setJadwalDayFilter('ALL')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        jadwalDayFilter === 'ALL'
                          ? 'bg-blue-900 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Semua Hari</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          jadwalDayFilter === 'ALL'
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        {scheduleItems.length}
                      </span>
                    </button>

                    {HARI_LIST.map((h) => {
                      const count = scheduleItems.filter((i) => i.hari === h).length;
                      return (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setJadwalDayFilter(h)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                            jadwalDayFilter === h
                              ? 'bg-blue-900 text-white shadow-xs font-bold'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <span>{h}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                              jadwalDayFilter === h
                                ? 'bg-white/20 text-white'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Toolbar Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCopyPanel(!showCopyPanel)}
                      className={`text-xs h-8 flex items-center gap-1.5 ${
                        showCopyPanel
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold'
                          : 'text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Jadwal Hari</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResetJadwalOnly}
                      className="text-xs h-8 text-amber-700 border-amber-300 hover:bg-amber-50 flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Jadwal</span>
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleAddJadwalItem()}
                      className="text-xs h-8 bg-blue-700 hover:bg-blue-800 text-white font-bold flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Tambah Sesi</span>
                    </Button>
                  </div>
                </div>

                {/* Panel Salin Jadwal Antar Hari (Expandable) */}
                {showCopyPanel && (
                  <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-xl space-y-3 animate-in fade-in-50">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-xs uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                        <Copy className="w-3.5 h-3.5 text-indigo-700" />
                        Salin Struktur Jadwal Antar Hari
                      </h5>
                      <span className="text-[11px] text-indigo-700">
                        Mempercepat pembuatan jadwal jika hari lain memiliki jam yang sama
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Salin dari:</span>
                        <select
                          value={copySourceDay}
                          onChange={(e) => setCopySourceDay(e.target.value)}
                          className="h-8 px-2.5 rounded-lg border border-indigo-200 bg-white font-bold text-indigo-950 text-xs shadow-xs"
                        >
                          {HARI_LIST.map((h) => (
                            <option key={h} value={h}>
                              Hari {h} ({scheduleItems.filter((i) => i.hari === h).length} sesi)
                            </option>
                          ))}
                        </select>
                      </div>

                      <ArrowRight className="w-4 h-4 text-indigo-500 hidden sm:block" />

                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Terapkan ke:</span>
                        <select
                          value={copyTargetDay}
                          onChange={(e) => setCopyTargetDay(e.target.value)}
                          className="h-8 px-2.5 rounded-lg border border-indigo-200 bg-white font-bold text-indigo-950 text-xs shadow-xs"
                        >
                          {HARI_LIST.map((h) => (
                            <option key={h} value={h}>
                              Hari {h}
                            </option>
                          ))}
                        </select>
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        onClick={handleCopyDaySchedule}
                        className="h-8 text-xs bg-indigo-700 hover:bg-indigo-800 text-white font-bold shadow-xs ml-auto"
                      >
                        Terapkan Salinan
                      </Button>
                    </div>
                  </div>
                )}

                {/* Pencarian Sesi */}
                <div className="flex items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                    <Input
                      value={searchKegiatan}
                      onChange={(e) => setSearchKegiatan(e.target.value)}
                      placeholder="Cari jam / kegiatan pelajaran..."
                      className="h-8 pl-8 text-xs bg-gray-50/70 border-gray-200"
                    />
                  </div>

                  <div className="text-[11px] text-gray-500 font-medium">
                    Menampilkan <strong>{filteredScheduleWithGlobalIndex.length}</strong> dari{' '}
                    <strong>{scheduleItems.length}</strong> sesi
                  </div>
                </div>

                {/* Tabel / Daftar Baris Jadwal */}
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-100/90 text-gray-800 border-b border-gray-200 font-bold">
                          <th className="py-2.5 px-3 w-12 text-center">No</th>
                          <th className="py-2.5 px-3 w-28">Hari</th>
                          <th className="py-2.5 px-3 w-36">Waktu / Jam</th>
                          <th className="py-2.5 px-3">Uraian Kegiatan / Mata Pelajaran</th>
                          <th className="py-2.5 px-3 w-32 text-center">Jenis Sesi</th>
                          <th className="py-2.5 px-3 w-36 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredScheduleWithGlobalIndex.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-gray-400">
                              <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-40 text-gray-400" />
                              <p className="font-semibold text-xs text-gray-600">
                                Tidak ada sesi jadwal ditemukan
                              </p>
                              <p className="text-[11px] text-gray-400 mt-0.5">
                                Klik tombol <strong>+ Tambah Sesi</strong> untuk menambahkan jadwal
                                baru.
                              </p>
                            </td>
                          </tr>
                        ) : (
                          filteredScheduleWithGlobalIndex.map(({ item, globalIndex }, listIdx) => (
                            <tr
                              key={globalIndex}
                              className={`transition-colors ${
                                item.isIstirahat
                                  ? 'bg-amber-50/60 hover:bg-amber-50'
                                  : listIdx % 2 === 1
                                    ? 'bg-gray-50/40 hover:bg-blue-50/40'
                                    : 'bg-white hover:bg-blue-50/40'
                              }`}
                            >
                              {/* Kolom No Urut */}
                              <td className="py-2 px-3 text-center text-gray-500 font-mono text-[11px]">
                                {listIdx + 1}
                              </td>

                              {/* Kolom Hari */}
                              <td className="py-2 px-3">
                                <select
                                  value={item.hari}
                                  onChange={(e) =>
                                    handleUpdateJadwalItem(globalIndex, 'hari', e.target.value)
                                  }
                                  className="h-8 px-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-900 bg-white shadow-2xs w-full"
                                >
                                  {HARI_LIST.map((h) => (
                                    <option key={h} value={h}>
                                      {h}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              {/* Kolom Waktu / Jam */}
                              <td className="py-2 px-3">
                                <Input
                                  value={item.jam}
                                  onChange={(e) =>
                                    handleUpdateJadwalItem(globalIndex, 'jam', e.target.value)
                                  }
                                  placeholder="07.00–07.40"
                                  className="h-8 font-mono text-xs font-bold text-gray-800 bg-white"
                                />
                              </td>

                              {/* Kolom Uraian Kegiatan */}
                              <td className="py-2 px-3">
                                <Input
                                  value={item.kegiatan || ''}
                                  onChange={(e) =>
                                    handleUpdateJadwalItem(globalIndex, 'kegiatan', e.target.value)
                                  }
                                  placeholder="Contoh: Jam Pelajaran ke-1 / Upacara / Literasi"
                                  className={`h-8 text-xs bg-white ${
                                    item.isIstirahat ? 'font-bold text-amber-950' : 'text-gray-900'
                                  }`}
                                />
                              </td>

                              {/* Kolom Jenis Sesi (Toggle Istirahat) */}
                              <td className="py-2 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateJadwalItem(
                                      globalIndex,
                                      'isIstirahat',
                                      !item.isIstirahat,
                                    )
                                  }
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
                                    item.isIstirahat
                                      ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs'
                                      : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                                  }`}
                                  title="Klik untuk mengubah jenis sesi KBM / Istirahat"
                                >
                                  {item.isIstirahat ? (
                                    <>
                                      <Coffee className="w-3 h-3 text-amber-700" />
                                      <span>Istirahat</span>
                                    </>
                                  ) : (
                                    <>
                                      <BookOpen className="w-3 h-3 text-blue-600" />
                                      <span>KBM</span>
                                    </>
                                  )}
                                </button>
                              </td>

                              {/* Kolom Aksi */}
                              <td className="py-2 px-3">
                                <div className="flex items-center justify-center gap-1">
                                  {/* Naikkan */}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    disabled={globalIndex === 0}
                                    onClick={() => handleMoveJadwalItem(globalIndex, 'UP')}
                                    className="h-7 w-7 p-0 text-gray-500 hover:text-blue-700 hover:bg-blue-50"
                                    title="Pindahkan ke atas"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </Button>

                                  {/* Turunkan */}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    disabled={globalIndex === scheduleItems.length - 1}
                                    onClick={() => handleMoveJadwalItem(globalIndex, 'DOWN')}
                                    className="h-7 w-7 p-0 text-gray-500 hover:text-blue-700 hover:bg-blue-50"
                                    title="Pindahkan ke bawah"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </Button>

                                  {/* Duplikat */}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDuplicateJadwalItem(globalIndex)}
                                    className="h-7 w-7 p-0 text-gray-500 hover:text-indigo-700 hover:bg-indigo-50"
                                    title="Duplikat sesi ini"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </Button>

                                  {/* Hapus */}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteJadwalItem(globalIndex)}
                                    className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    title="Hapus sesi ini"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-gray-500">
                    💡 Perubahan jadwal ini otomatis disinkronkan ke dokumen naskah dinas dan form
                    persetujuan orang tua.
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleAddJadwalItem()}
                    className="text-xs h-8 bg-blue-700 hover:bg-blue-800 text-white font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Sesi Jadwal</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: HAK PENANDATANGAN SURAT                                            */}
          {/* ========================================================================= */}
          {activeTab === 'penandatangan' && (
            <div className="space-y-6 animate-in fade-in-50">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-blue-900">
                    Pilih Pejabat yang Berhak Menandatangani Surat
                  </h4>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700">
                    Pilih dari Master Pegawai / Penandatangan Sekolah:
                  </Label>
                  <Select
                    value={config.penandatangan.pegawaiId || ''}
                    onValueChange={handleSelectPegawai}
                  >
                    <SelectTrigger className="h-10 text-xs font-medium">
                      <SelectValue placeholder="-- Pilih Pegawai Penandatangan --" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePegawai.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="text-xs">
                          {p.nama} {p.nip ? `(NIP. ${p.nip})` : ''} - {p.jabatan?.nama || 'Pegawai'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-700">
                      Nama Lengkap & Gelar:
                    </Label>
                    <Input
                      value={config.penandatangan.nama}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          penandatangan: { ...config.penandatangan, nama: e.target.value },
                        })
                      }
                      placeholder="Drs. H. Dedi Kusnadi, M.Pd."
                      className="h-9 text-xs font-bold text-gray-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-700">NIP Pegawai:</Label>
                    <Input
                      value={config.penandatangan.nip}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          penandatangan: { ...config.penandatangan, nip: e.target.value },
                        })
                      }
                      placeholder="19680512 199403 1 005"
                      className="h-9 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-700">
                      Jabatan Penandatangan:
                    </Label>
                    <Input
                      value={config.penandatangan.jabatan}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          penandatangan: { ...config.penandatangan, jabatan: e.target.value },
                        })
                      }
                      placeholder={`Kepala ${sekolahNama}`}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-700">
                      Pangkat / Golongan Ruang:
                    </Label>
                    <Input
                      value={config.penandatangan.pangkatGolongan || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          penandatangan: {
                            ...config.penandatangan,
                            pangkatGolongan: e.target.value,
                          },
                        })
                      }
                      placeholder="Pembina Tingkat I (IV/b)"
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={config.penandatangan.tampilkanQr}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          penandatangan: { ...config.penandatangan, tampilkanQr: e.target.checked },
                        })
                      }
                      className="rounded text-blue-600"
                    />
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Sertakan QR-Code Verifikasi Dokumen & TTE</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={config.penandatangan.tampilkanTtdDigital}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          penandatangan: {
                            ...config.penandatangan,
                            tampilkanTtdDigital: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-blue-600"
                    />
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Aktifkan Validasi Stempel / Tanda Tangan Sah</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: LIVE PREVIEW DOKUMEN                                               */}
          {/* ========================================================================= */}
          {activeTab === 'preview' && (
            <div className="space-y-6 animate-in fade-in-50">
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-blue-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Sparkles className="w-4 h-4 text-blue-600" /> Pratinjau Real-Time Dokumen Naskah
                  Dinas & Lampiran Jadwal
                </span>
                <span className="text-[11px] bg-blue-200 text-blue-900 px-2 py-0.5 rounded font-mono font-bold">
                  Ukuran: HVS F4
                </span>
              </div>

              {/* Box Pratinjau Naskah Dinas */}
              <div
                className="bg-white p-6 sm:p-8 rounded-xl border border-gray-300 shadow-md space-y-4 text-gray-900"
                style={{
                  fontFamily: previewFont,
                  fontSize: config.ukuranFontSurat ? `${config.ukuranFontSurat}pt` : '11pt',
                  lineHeight: config.spasiSurat || '1.5',
                }}
              >
                {/* Kop Surat Sederhana */}
                <div
                  className="border-b-2 border-black pb-2 text-center space-y-0.5"
                  style={{ fontFamily: previewFont }}
                >
                  <h3 className="font-bold text-xs uppercase">
                    PEMERINTAH DAERAH KABUPATEN {sekolahKabupaten.toUpperCase()}
                  </h3>
                  <h4 className="font-bold text-xs uppercase">DINAS PENDIDIKAN</h4>
                  <h2 className="font-black text-sm uppercase text-gray-900">{sekolahNama}</h2>
                  <p className="text-[10px] text-gray-600">
                    Jalan Raya Ujungjaya No. 123, Kabupaten {sekolahKabupaten}, Jawa Barat
                  </p>
                </div>

                <div className="flex justify-between items-start font-sans text-xs pt-1">
                  <table className="text-xs">
                    <tbody>
                      <tr>
                        <td className="w-16 font-semibold py-0.5">Nomor</td>
                        <td className="w-3">:</td>
                        <td className="font-mono font-bold py-0.5">{config.nomorSurat}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold py-0.5">Sifat</td>
                        <td>:</td>
                        <td className="py-0.5">{config.sifatSurat}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold py-0.5">Lampiran</td>
                        <td>:</td>
                        <td className="py-0.5">{config.lampiranSurat}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold py-0.5">Perihal</td>
                        <td>:</td>
                        <td className="font-bold py-0.5">{config.perihalSurat}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="text-right font-sans text-xs">
                    <p>
                      {config.tempatSurat},{' '}
                      {new Date().toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="font-sans text-xs pt-1">
                  <p className="font-semibold">Kepada Yth.,</p>
                  <p className="font-bold">{config.penerimaSurat}</p>
                  <p className="italic text-gray-600">di Tempat</p>
                </div>

                <div className="space-y-2 text-justify text-xs leading-normal">
                  <p>Dengan hormat,</p>
                  <p className="indent-6">{config.teksPembuka}</p>

                  <div className="pl-6 font-sans text-xs my-2">
                    <table className="w-full text-xs">
                      <tbody>
                        <tr>
                          <td className="w-28 py-0.5 font-medium">Mulai Berlaku</td>
                          <td className="w-3">:</td>
                          <td className="font-semibold py-0.5">{config.ketentuan.mulaiBerlaku}</td>
                        </tr>
                        <tr>
                          <td className="py-0.5 font-medium">Hari Belajar</td>
                          <td>:</td>
                          <td className="font-semibold py-0.5">{config.ketentuan.hariBelajar}</td>
                        </tr>
                        <tr>
                          <td className="py-0.5 font-medium">Jam Belajar</td>
                          <td>:</td>
                          <td className="font-semibold py-0.5">{config.ketentuan.jamBelajar}</td>
                        </tr>
                        <tr>
                          <td className="py-0.5 font-medium">Hari Libur</td>
                          <td>:</td>
                          <td className="font-semibold py-0.5">{config.ketentuan.hariLibur}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p className="indent-6">{config.paragrafTujuan}</p>
                  <p className="indent-6">{config.teksPenutup}</p>
                </div>

                {/* Tanda Tangan Sekolah */}
                <div className="flex justify-end pt-3 font-sans text-xs">
                  <div className="text-center w-60 space-y-0.5">
                    <p>Hormat kami,</p>
                    <p className="font-bold">{config.penandatangan.jabatan}</p>
                    <div className="h-12 flex items-center justify-center my-1">
                      {config.penandatangan.tampilkanQr ? (
                        <div className="w-11 h-11 border border-gray-300 rounded flex items-center justify-center bg-gray-50 text-[9px] font-mono text-gray-500">
                          [QR TTE]
                        </div>
                      ) : (
                        <div className="h-10" />
                      )}
                    </div>
                    <p className="font-bold">{config.penandatangan.nama}</p>
                    <p className="text-gray-600 font-mono text-[10px]">
                      NIP. {config.penandatangan.nip || '-'}
                    </p>
                  </div>
                </div>

                {/* Sekat Lampiran pada Pratinjau Admin */}
                <div className="pt-6 mt-6 border-t-2 border-dashed border-gray-300">
                  <div className="flex justify-between items-start text-[11px] pb-2 mb-2 font-sans border-b border-gray-200">
                    <span className="font-bold uppercase bg-blue-50 text-blue-900 px-2 py-0.5 rounded border border-blue-200 text-[10px]">
                      Lampiran Surat Pemberitahuan
                    </span>
                    <div className="text-right text-[10px] font-mono text-gray-600">
                      <p>Nomor : {config.nomorSurat}</p>
                      <p>Perihal : {config.perihalSurat}</p>
                    </div>
                  </div>

                  <div className="text-center my-3 space-y-0.5">
                    <h5 className="font-bold text-xs uppercase tracking-tight text-gray-900">
                      {config.lampiranJadwal?.judul || 'JADWAL KEGIATAN BELAJAR MENGAJAR (KBM)'}
                    </h5>
                    <p className="font-semibold text-[11px] uppercase text-gray-600">
                      {config.lampiranJadwal?.subjudul ||
                        `SISTEM PEMBELAJARAN 5 HARI KERJA — ${sekolahNama || 'SMPN 1 UJUNGJAYA'}`}
                    </p>
                  </div>

                  <div className="overflow-x-auto my-3">
                    <table className="w-full border-collapse border border-gray-700 text-[11px]">
                      <thead>
                        <tr className="bg-gray-100 text-gray-900 border-b border-gray-700 text-center font-bold">
                          <th className="border border-gray-700 px-2 py-1 w-20">Hari</th>
                          <th className="border border-gray-700 px-2 py-1 w-28">Waktu</th>
                          <th className="border border-gray-700 px-2 py-1 text-left">
                            Uraian Kegiatan
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(
                          scheduleItems.reduce((acc: Record<string, JadwalKbmItem[]>, item) => {
                            if (!acc[item.hari]) acc[item.hari] = [];
                            acc[item.hari].push(item);
                            return acc;
                          }, {}),
                        ).map(([hariName, sesiList]) =>
                          sesiList.map((sesi, idx) => (
                            <tr
                              key={`${hariName}-${sesi.jam}-${idx}`}
                              className={
                                sesi.isIstirahat
                                  ? 'bg-amber-50/80 font-medium'
                                  : idx % 2 === 1
                                    ? 'bg-gray-50/60'
                                    : 'bg-white'
                              }
                            >
                              {idx === 0 && (
                                <td
                                  rowSpan={sesiList.length}
                                  className="border border-gray-700 px-2 py-1 font-bold text-center align-top bg-white"
                                >
                                  <span>{hariName}</span>
                                </td>
                              )}
                              <td className="border border-gray-700 px-2 py-0.5 text-center font-mono text-[10px] font-semibold text-gray-800 whitespace-nowrap">
                                {sesi.jam}
                              </td>
                              <td className="border border-gray-700 px-2 py-0.5 text-gray-900 text-[10.5px]">
                                <span
                                  className={sesi.isIstirahat ? 'text-amber-900 font-bold' : ''}
                                >
                                  {sesi.kegiatan ||
                                    (sesi.isIstirahat ? 'Istirahat' : `Jam Pelajaran ${idx + 1}`)}
                                </span>
                              </td>
                            </tr>
                          )),
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end pt-2 font-sans text-xs">
                    <div className="text-center w-56 space-y-0.5">
                      <p>Hormat kami,</p>
                      <p className="font-bold">{config.penandatangan.jabatan}</p>
                      <div className="h-10 flex items-center justify-center my-0.5">
                        {config.penandatangan.tampilkanQr ? (
                          <div className="w-9 h-9 border border-gray-300 rounded flex items-center justify-center bg-gray-50 text-[8px] font-mono text-gray-500">
                            [QR TTE]
                          </div>
                        ) : (
                          <div className="h-8" />
                        )}
                      </div>
                      <p className="font-bold">{config.penandatangan.nama}</p>
                      <p className="text-gray-600 font-mono text-[9px]">
                        NIP. {config.penandatangan.nip || '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isResetting || isSaving}
            className="text-xs text-amber-700 border-amber-300 hover:bg-amber-50 flex items-center gap-1.5 w-full sm:w-auto"
          >
            {isResetting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5" />
            )}
            <span>Reset ke Standar Resmi</span>
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs text-gray-600"
            >
              Tutup
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={isSaving || isResetting}
              className="text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white shadow-xs flex items-center gap-1.5"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>Simpan Pengaturan Surat & Jadwal</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
