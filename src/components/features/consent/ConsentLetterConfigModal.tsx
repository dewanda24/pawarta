'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  QrCode,
  Sparkles,
  Type,
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
  const [activeTab, setActiveTab] = useState<'redaksi' | 'penandatangan' | 'preview'>('redaksi');
  const [config, setConfig] = useState<ConsentLetterConfig>(initialConfig || DEFAULT_CONSENT_LETTER_CONFIG);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Sync state if initialConfig updates
  React.useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    }
  }, [initialConfig]);

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
      komitmenPoin: [
        ...prev.komitmenPoin,
        'Poin komitmen baru...',
      ],
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
        toast.success('Pengaturan surat 5 hari kerja berhasil disimpan!');
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
    if (!confirm('Kembalikan seluruh teks dan penandatangan surat ke format standar sekolah?')) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[92vh] flex flex-col p-0 rounded-2xl overflow-hidden shadow-2xl border-gray-200">
        {/* Modal Header */}
        <DialogHeader className="p-5 sm:p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold">
                <Settings2 className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Pengaturan Isi & Penandatangan Surat 5 Hari Kerja
                </DialogTitle>
                <p className="text-xs text-blue-200 mt-0.5">
                  Sesuaikan redaksi naskah dinas, ketentuan jam belajar, dan pejabat penandatangan sah
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-white/15">
            <button
              type="button"
              onClick={() => setActiveTab('redaksi')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'redaksi'
                  ? 'bg-white text-blue-950 shadow-xs'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>1. Redaksi & Ketentuan Surat</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('penandatangan')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'penandatangan'
                  ? 'bg-white text-blue-950 shadow-xs'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>2. Hak Penandatangan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'preview'
                  ? 'bg-white text-blue-950 shadow-xs'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>3. Live Preview Dokumen</span>
            </button>
          </div>
        </DialogHeader>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-gray-50/60 text-gray-900">
          {/* TAB 1: REDAKSI & KETENTUAN SURAT */}
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
                      placeholder="1 Lembar (Lembar Persetujuan)"
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

              {/* Bagian Baru: Pengaturan Tipografi & Jenis Font Naskah Surat */}
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
                        { id: 'Times New Roman', label: 'Times New Roman', fontClass: "'Times New Roman', serif" },
                        { id: 'Arial', label: 'Arial (Sans)', fontClass: 'Arial, sans-serif' },
                        { id: 'Bookman Old Style', label: 'Bookman', fontClass: '"Bookman Old Style", serif' },
                        { id: 'Garamond', label: 'Garamond', fontClass: 'Garamond, serif' },
                        { id: 'Georgia', label: 'Georgia', fontClass: 'Georgia, serif' },
                        { id: 'Calibri', label: 'Calibri', fontClass: 'Calibri, sans-serif' },
                        { id: 'Tahoma', label: 'Tahoma', fontClass: 'Tahoma, sans-serif' },
                        { id: 'Courier New', label: 'Courier New', fontClass: '"Courier New", monospace' },
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
                        onChange={(e) => setConfig({ ...config, ukuranFontSurat: parseFloat(e.target.value) })}
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
                  <Label className="text-xs font-semibold text-gray-700">Teks Paragraf Pembuka:</Label>
                  <Textarea
                    value={config.teksPembuka}
                    onChange={(e) => setConfig({ ...config, teksPembuka: e.target.value })}
                    rows={3}
                    className="text-xs text-gray-800 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-700">• Mulai Berlaku:</Label>
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
                    <Label className="text-xs font-semibold text-gray-700">• Hari Belajar:</Label>
                    <Input
                      value={config.ketentuan.hariBelajar}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          ketentuan: { ...config.ketentuan, hariBelajar: e.target.value },
                        })
                      }
                      placeholder="Senin s.d. Jumat"
                      className="h-9 text-xs font-semibold text-blue-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-700">• Jam Belajar Efektif:</Label>
                    <Input
                      value={config.ketentuan.jamBelajar}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          ketentuan: { ...config.ketentuan, jamBelajar: e.target.value },
                        })
                      }
                      placeholder="07.00 s.d. 15.00 WIB (disesuaikan jadwal KBM)"
                      className="h-9 text-xs font-semibold text-blue-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-700">• Hari Libur Siswa:</Label>
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
                </div>

                <div className="space-y-1.5 pt-2">
                  <Label className="text-xs font-semibold text-gray-700">Paragraf Tujuan Program:</Label>
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

          {/* TAB 2: HAK PENANDATANGAN SURAT */}
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
                  <p className="text-[11px] text-gray-500">
                    Memilih dari daftar akan mengisikan nama lengkap, NIP, dan jabatan secara otomatis.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-700">
                      Nama Lengkap Pejabat (beserta Gelar) <span className="text-red-500">*</span>
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
                      className="h-9 text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-700">
                      Nomor Induk Pegawai (NIP)
                    </Label>
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
                      Jabatan yang Tertera di Dokumen <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={config.penandatangan.jabatan}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          penandatangan: { ...config.penandatangan, jabatan: e.target.value },
                        })
                      }
                      placeholder="Kepala SMPN 1 UJUNGJAYA / Plt. Kepala Sekolah"
                      className="h-9 text-xs font-semibold text-blue-900"
                    />
                    <p className="text-[10px] text-gray-400">
                      Misal: <em>Kepala SMPN 1 Ujungjaya</em> atau <em>Plt. Kepala SMPN 1 Ujungjaya</em>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-700">Pangkat / Golongan</Label>
                    <Input
                      value={config.penandatangan.pangkatGolongan || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          penandatangan: { ...config.penandatangan, pangkatGolongan: e.target.value },
                        })
                      }
                      placeholder="Pembina Tingkat I (IV/b)"
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer bg-gray-50 p-3 rounded-xl border border-gray-200 flex-1">
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
                    <QrCode className="w-4 h-4 text-blue-600" />
                    <span>Sertakan QR Code Verifikasi Digital PAWARTA</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer bg-gray-50 p-3 rounded-xl border border-gray-200 flex-1">
                    <input
                      type="checkbox"
                      checked={config.penandatangan.tampilkanTtdDigital}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          penandatangan: { ...config.penandatangan, tampilkanTtdDigital: e.target.checked },
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

          {/* TAB 3: LIVE PREVIEW DOKUMEN */}
          {activeTab === 'preview' && (
            <div className="space-y-6 animate-in fade-in-50">
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-blue-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Sparkles className="w-4 h-4 text-blue-600" /> Pratinjau Real-Time Dokumen Naskah Dinas
                </span>
                <span className="text-[11px] bg-blue-200 text-blue-900 px-2 py-0.5 rounded font-mono">
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
                <div className="border-b-2 border-black pb-2 text-center space-y-0.5" style={{ fontFamily: previewFont }}>
                  <h3 className="font-bold text-xs uppercase">PEMERINTAH DAERAH KABUPATEN SUMEDANG</h3>
                  <h4 className="font-bold text-xs uppercase">DINAS PENDIDIKAN</h4>
                  <h2 className="font-black text-sm uppercase text-gray-900">{sekolahNama}</h2>
                  <p className="text-[10px] text-gray-600">
                    Jalan Raya Ujungjaya No. 123, Kabupaten Sumedang, Jawa Barat
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
                    <p>{config.tempatSurat}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
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
                          <td className="w-28 py-0.5 font-medium">• Mulai Berlaku</td>
                          <td className="w-3">:</td>
                          <td className="font-semibold py-0.5">{config.ketentuan.mulaiBerlaku}</td>
                        </tr>
                        <tr>
                          <td className="py-0.5 font-medium">• Hari Belajar</td>
                          <td>:</td>
                          <td className="font-semibold py-0.5">{config.ketentuan.hariBelajar}</td>
                        </tr>
                        <tr>
                          <td className="py-0.5 font-medium">• Jam Belajar</td>
                          <td>:</td>
                          <td className="font-semibold py-0.5">{config.ketentuan.jamBelajar}</td>
                        </tr>
                        <tr>
                          <td className="py-0.5 font-medium">• Hari Libur</td>
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
            {isResetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
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
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Simpan Pengaturan Surat</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
