'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { SignaturePad } from './SignaturePad';
import {
  getPublicStudentsByClass,
  checkStudentConsentStatus,
  submitParentConsent,
} from '@/features/student-letter/consent-actions';
import {
  GraduationCap,
  User,
  CheckCircle2,
  FileCheck2,
  AlertCircle,
  Loader2,
  Info,
  Clock,
  Sparkles,
  Phone,
  Briefcase,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface ClassItem {
  id: string;
  kodeKelas: string;
  namaKelas: string;
  tingkat: number;
}

interface StudentItem {
  id: string;
  nis: string | null;
  nisn: string;
  nama: string;
  jenisKelamin: string | null;
  namaOrtu: string | null;
  pekerjaanOrtu: string | null;
  noHpOrtu: string | null;
  alamat: string | null;
  kelasId: string | null;
}

interface ParentConsentFormProps {
  classList: ClassItem[];
  defaultKelasId?: string;
}

export function ParentConsentForm({ classList, defaultKelasId }: ParentConsentFormProps) {
  const router = useRouter();

  // State Step & Form
  const [selectedKelasId, setSelectedKelasId] = useState<string>(defaultKelasId || '');
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  // Sinkronkan jika defaultKelasId dari URL berubah
  useEffect(() => {
    if (defaultKelasId && defaultKelasId !== selectedKelasId) {
      setSelectedKelasId(defaultKelasId);
    }
  }, [defaultKelasId]);

  // Existing status
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [existingConsent, setExistingConsent] = useState<{
    id: string;
    nomorSurat: string | null;
    namaOrtu: string;
    statusPersetujuan: string;
    signedAt: Date | string;
    siswaNama?: string;
  } | null>(null);

  // Form Fields
  const [namaOrtu, setNamaOrtu] = useState('');
  const [hubungan, setHubungan] = useState('Orang Tua Kandung');
  const [noHpOrtu, setNoHpOrtu] = useState('');
  const [pekerjaanOrtu, setPekerjaanOrtu] = useState('');
  const [alamatOrtu, setAlamatOrtu] = useState('');
  const [statusPersetujuan, setStatusPersetujuan] = useState<'SETUJU' | 'TIDAK_SETUJU'>('SETUJU');
  const [alasanPenolakan, setAlasanPenolakan] = useState('');

  // Fasilitas checkboxes
  const [bekalMakan, setBekalMakan] = useState(true);
  const [transportasi, setTransportasi] = useState(true);
  const [ibadah, setIbadah] = useState(true);
  const [pendampinganBelajar, setPendampinganBelajar] = useState(true);

  // Signature & Submission
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [isAgreedTerms, setIsAgreedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load students when class changes
  useEffect(() => {
    if (!selectedKelasId) {
      setStudents([]);
      setSelectedStudentId('');
      setSelectedStudent(null);
      setExistingConsent(null);
      setStudentSearchQuery('');
      return;
    }

    async function loadStudents() {
      setLoadingStudents(true);
      const res = await getPublicStudentsByClass(selectedKelasId);
      if (res.success && res.data) {
        setStudents(res.data as StudentItem[]);
      } else {
        toast.error('Gagal memuat daftar siswa kelas');
      }
      setLoadingStudents(false);
    }

    loadStudents();
  }, [selectedKelasId]);

  // When student is selected, autofill & check existing consent
  const handleSelectStudent = async (studentId: string) => {
    setSelectedStudentId(studentId);
    const found = students.find((s) => s.id === studentId) || null;
    setSelectedStudent(found);

    if (found) {
      // Autofill fields if empty
      if (found.namaOrtu) setNamaOrtu(found.namaOrtu);
      if (found.noHpOrtu) setNoHpOrtu(found.noHpOrtu);
      if (found.pekerjaanOrtu) setPekerjaanOrtu(found.pekerjaanOrtu);
      if (found.alamat) setAlamatOrtu(found.alamat);

      // Check existing consent
      setCheckingStatus(true);
      const statusRes = await checkStudentConsentStatus(studentId, '5_HARI_KERJA');
      if (statusRes.hasConsent && statusRes.consent) {
        setExistingConsent(statusRes.consent as any);
      } else {
        setExistingConsent(null);
      }
      setCheckingStatus(false);
    } else {
      setExistingConsent(null);
    }
  };

  const filteredStudents = students.filter((s) => {
    if (!studentSearchQuery.trim()) return true;
    const q = studentSearchQuery.toLowerCase();
    return s.nama.toLowerCase().includes(q) || (s.nisn && s.nisn.includes(q)) || (s.nis && s.nis.includes(q));
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudentId) {
      toast.error('Pilih nama siswa terlebih dahulu');
      return;
    }

    if (!namaOrtu.trim()) {
      toast.error('Nama orang tua / wali wajib diisi');
      return;
    }

    if (!noHpOrtu.trim()) {
      toast.error('Nomor WhatsApp / HP wajib diisi untuk konfirmasi');
      return;
    }

    if (statusPersetujuan === 'TIDAK_SETUJU' && !alasanPenolakan.trim()) {
      toast.error('Mohon tuliskan alasan jika tidak menyetujui program');
      return;
    }

    if (!signatureData) {
      toast.error('Goreskan tanda tangan digital Anda pada area tanda tangan');
      return;
    }

    if (!isAgreedTerms) {
      toast.error('Centang kotak pernyataan keabsahan sebelum mengirim');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitParentConsent({
        kategori: '5_HARI_KERJA',
        siswaId: selectedStudentId,
        kelasId: selectedKelasId,
        namaOrtu: namaOrtu.trim(),
        hubungan,
        noHpOrtu: noHpOrtu.trim(),
        pekerjaanOrtu: pekerjaanOrtu.trim(),
        alamatOrtu: alamatOrtu.trim(),
        statusPersetujuan,
        alasanPenolakan: statusPersetujuan === 'TIDAK_SETUJU' ? alasanPenolakan.trim() : undefined,
        kesiapanFasilitas: {
          bekalMakan,
          transportasi,
          ibadah,
          pendampinganBelajar,
        },
        ttdDigital: signatureData,
      });

      if (res.success && res.data) {
        toast.success('Surat Persetujuan berhasil diterbitkan!');
        router.push(`/persetujuan-ortu/sukses/${res.data.id}`);
      } else {
        toast.error(res.error || 'Gagal menyimpan persetujuan');
      }
    } catch (err: unknown) {
      console.error('Submit parent consent error:', err);
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses data';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-gray-900">
      {/* 1. BAGIAN DATA SISWA */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">Identitas Siswa</h3>
            <p className="text-xs text-gray-500">Pilih kelas dan nama putra/putri Anda</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-800">
              Kelas Siswa <span className="text-red-500">*</span>
            </Label>
            <Select value={selectedKelasId} onValueChange={(val) => setSelectedKelasId(val)}>
              <SelectTrigger className="h-11 bg-white border-gray-300 text-gray-900 font-medium shadow-xs">
                <SelectValue placeholder="-- Pilih Kelas --" />
              </SelectTrigger>
              <SelectContent className="bg-white text-gray-900 border-gray-200 shadow-lg">
                {classList.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="text-gray-900 hover:bg-blue-50 font-medium">
                    {c.namaKelas} ({c.kodeKelas})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-800">
              Nama Lengkap Siswa <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedStudentId}
              onValueChange={handleSelectStudent}
              disabled={!selectedKelasId || loadingStudents}
            >
              <SelectTrigger className="h-11 bg-white border-gray-300 text-gray-900 font-medium shadow-xs">
                <SelectValue
                  placeholder={
                    !selectedKelasId
                      ? 'Pilih kelas terlebih dahulu'
                      : loadingStudents
                        ? 'Memuat siswa...'
                        : '-- Pilih Nama Siswa --'
                  }
                />
              </SelectTrigger>
              <SelectContent className="bg-white text-gray-900 border-gray-200 shadow-lg max-h-64">
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="text-gray-900 hover:bg-blue-50 font-medium">
                    {s.nama} {s.nisn ? `(NISN: ${s.nisn})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Live Search Box for Instant Student Filter */}
        {selectedKelasId && students.length > 0 && (
          <div className="space-y-2 pt-1 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-gray-600">
                🔍 Pencarian Cepat Nama / NISN di Kelas Ini
              </Label>
              {studentSearchQuery && (
                <button
                  type="button"
                  onClick={() => setStudentSearchQuery('')}
                  className="text-[11px] text-blue-600 hover:underline"
                >
                  Reset Cari
                </button>
              )}
            </div>
            <Input
              type="text"
              value={studentSearchQuery}
              onChange={(e) => setStudentSearchQuery(e.target.value)}
              placeholder="Ketik 2-3 huruf nama anak atau NISN..."
              className="h-10 text-xs bg-gray-50 border-gray-200"
            />
            {studentSearchQuery.trim() && (
              <div className="max-h-40 overflow-y-auto border border-blue-200 rounded-xl p-1.5 bg-blue-50/50 space-y-1">
                {filteredStudents.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-2">
                    Tidak ditemukan siswa dengan kata kunci &ldquo;{studentSearchQuery}&rdquo;
                  </p>
                ) : (
                  filteredStudents.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => {
                        handleSelectStudent(s.id);
                        setStudentSearchQuery('');
                      }}
                      className={`p-2 rounded-lg text-xs cursor-pointer flex items-center justify-between transition-colors ${
                        selectedStudentId === s.id
                          ? 'bg-blue-600 text-white font-bold'
                          : 'bg-white text-gray-900 hover:bg-blue-100/70 border border-gray-200'
                      }`}
                    >
                      <span className="font-semibold">{s.nama}</span>
                      <span className="font-mono text-[11px] opacity-80">NISN: {s.nisn || '-'}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}


        {/* Informasi Siswa Terpilih (Autofilled Card) */}
        {selectedStudent && (
          <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-900 text-sm">{selectedStudent.nama}</span>
                <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded font-mono text-[11px]">
                  NISN: {selectedStudent.nisn || '-'}
                </span>
              </div>
              <p className="text-blue-700">
                NIS: {selectedStudent.nis || '-'} • Jenis Kelamin:{' '}
                {selectedStudent.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
              </p>
            </div>
            <div className="text-right sm:text-right">
              <span className="text-[11px] text-emerald-700 bg-emerald-100 font-semibold px-2 py-1 rounded-md border border-emerald-300 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Data Siswa Terverifikasi
              </span>
            </div>
          </div>
        )}

        {/* Existing Consent Notification */}
        {existingConsent && (
          <div className="bg-emerald-50 border-2 border-emerald-300 p-4 rounded-xl text-xs text-emerald-900 space-y-2 animate-in fade-in-50">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-sm">Surat Persetujuan Sudah Pernah Diterbitkan</p>
                <p className="text-emerald-800 mt-0.5">
                  Persetujuan untuk <strong>{existingConsent.siswaNama}</strong> telah tercatat pada{' '}
                  <strong>
                    {new Date(existingConsent.signedAt).toLocaleDateString('id-ID', {
                      dateStyle: 'full',
                    })}
                  </strong>{' '}
                  oleh {existingConsent.namaOrtu} dengan status:{' '}
                  <span className="font-bold underline">{existingConsent.statusPersetujuan}</span>.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-emerald-200">
              <Link href={`/persetujuan-ortu/sukses/${existingConsent.id}`}>
                <Button
                  type="button"
                  size="sm"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs h-8"
                >
                  <FileCheck2 className="w-3.5 h-3.5 mr-1" /> Unduh Dokumen PDF Resmi
                </Button>
              </Link>
              <span className="text-[11px] text-emerald-700 italic">
                (Isi ulang di bawah jika Anda ingin memperbarui data persetujuan)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. BAGIAN DATA ORANG TUA / WALI */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">Identitas Orang Tua / Wali Murid</h3>
            <p className="text-xs text-gray-500">Lengkapi data diri penanggung jawab siswa</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-800">
              Nama Lengkap Orang Tua / Wali <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <Input
                value={namaOrtu}
                onChange={(e) => setNamaOrtu(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="pl-9 h-11 bg-white text-gray-900 border-gray-300 placeholder:text-gray-400 font-medium"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-800">
              Hubungan dengan Siswa <span className="text-red-500">*</span>
            </Label>
            <Select value={hubungan} onValueChange={(val) => setHubungan(val)}>
              <SelectTrigger className="h-11 bg-white border-gray-300 text-gray-900 font-medium shadow-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white text-gray-900 border-gray-200 shadow-lg">
                <SelectItem value="Ayah Kandung" className="text-gray-900 hover:bg-blue-50 font-medium">Ayah Kandung</SelectItem>
                <SelectItem value="Ibu Kandung" className="text-gray-900 hover:bg-blue-50 font-medium">Ibu Kandung</SelectItem>
                <SelectItem value="Wali Murid" className="text-gray-900 hover:bg-blue-50 font-medium">Wali Murid</SelectItem>
                <SelectItem value="Keluarga / Kerabat" className="text-gray-900 hover:bg-blue-50 font-medium">Keluarga / Kerabat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-800">
              Nomor WhatsApp / HP Aktif <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <Input
                value={noHpOrtu}
                onChange={(e) => setNoHpOrtu(e.target.value)}
                placeholder="081234567890"
                type="tel"
                className="pl-9 h-11 bg-white text-gray-900 border-gray-300 placeholder:text-gray-400 font-mono font-medium"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-800">Pekerjaan Orang Tua / Wali</Label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <Input
                value={pekerjaanOrtu}
                onChange={(e) => setPekerjaanOrtu(e.target.value)}
                placeholder="Contoh: Wiraswasta / PNS / Karyawan"
                className="pl-9 h-11 bg-white text-gray-900 border-gray-300 placeholder:text-gray-400 font-medium"
              />
            </div>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label className="text-xs font-semibold text-gray-800">Alamat Domisili</Label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <Textarea
                value={alamatOrtu}
                onChange={(e) => setAlamatOrtu(e.target.value)}
                placeholder="Alamat lengkap tempat tinggal"
                className="pl-9 bg-white text-gray-900 border-gray-300 placeholder:text-gray-400 font-medium min-h-[70px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. BAGIAN SIKAP PERSETUJUAN & KESEPAKATAN PROGRAM 5 HARI KERJA */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">Pernyataan & Sikap Persetujuan</h3>
            <p className="text-xs text-gray-500">
              Pelaksanaan Program 5 Hari Sekolah (Senin s.d. Jumat)
            </p>
          </div>
        </div>

        {/* Info Box Mengenai Regulasi & Jam Belajar */}
        <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-950">
            <Clock className="w-4 h-4 text-amber-700" />
            Ketentuan Program 5 Hari Sekolah (FDK):
          </div>
          <ul className="list-disc pl-5 space-y-1 text-amber-900">
            <li>Kegiatan Belajar Mengajar (KBM) berlangsung dari hari <strong>Senin s.d. Jumat</strong>.</li>
            <li>Hari <strong>Sabtu dan Minggu</strong> dipergunakan untuk kegiatan penguatan keluarga dan istirahat siswa di rumah.</li>
            <li>Alokasi jam belajar disesuaikan dengan kurikulum nasional dengan penambahan waktu istirahat dan ibadah siang.</li>
          </ul>
        </div>

        {/* Pilihan Radio Setuju / Tidak Setuju */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold text-gray-800">
            Pernyataan Sikap Orang Tua / Wali <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                statusPersetujuan === 'SETUJU'
                  ? 'border-blue-600 bg-blue-50/40 text-blue-900 shadow-xs'
                  : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
              }`}
            >
              <input
                type="radio"
                name="statusPersetujuan"
                value="SETUJU"
                checked={statusPersetujuan === 'SETUJU'}
                onChange={() => setStatusPersetujuan('SETUJU')}
                className="mt-1 w-4 h-4 text-blue-600"
              />
              <div>
                <span className="font-bold text-sm block text-blue-950">MENYETUJUI</span>
                <span className="text-xs text-gray-600 block mt-0.5">
                  Saya menyetujui putra/putri saya mengikuti program 5 hari kerja di sekolah.
                </span>
              </div>
            </label>

            <label
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                statusPersetujuan === 'TIDAK_SETUJU'
                  ? 'border-red-500 bg-red-50/40 text-red-900 shadow-xs'
                  : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
              }`}
            >
              <input
                type="radio"
                name="statusPersetujuan"
                value="TIDAK_SETUJU"
                checked={statusPersetujuan === 'TIDAK_SETUJU'}
                onChange={() => setStatusPersetujuan('TIDAK_SETUJU')}
                className="mt-1 w-4 h-4 text-red-600"
              />
              <div>
                <span className="font-bold text-sm block text-red-950">TIDAK MENYETUJUI</span>
                <span className="text-xs text-gray-600 block mt-0.5">
                  Saya memiliki pertimbangan lain dan tidak menyetujui program ini.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Form Alasan jika tidak setuju */}
        {statusPersetujuan === 'TIDAK_SETUJU' && (
          <div className="space-y-1.5 p-4 rounded-xl bg-red-50/60 border border-red-200 animate-in fade-in-50">
            <Label className="text-xs font-semibold text-red-900">
              Alasan Tidak Menyetujui <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={alasanPenolakan}
              onChange={(e) => setAlasanPenolakan(e.target.value)}
              placeholder="Tuliskan kendala atau alasan Anda (misal: jarak transportasi, kegiatan keagamaan sore hari, dsb.)"
              className="bg-white text-gray-900 border-red-300 placeholder:text-gray-400 font-medium min-h-[80px] text-xs"
              required
            />
          </div>
        )}

        {/* Checkbox Kesiapan jika Setuju */}
        {statusPersetujuan === 'SETUJU' && (
          <div className="space-y-2.5 pt-2">
            <Label className="text-xs font-semibold text-gray-800">
              Ketentuan Komitmen dan Tanggung Jawab Orang Tua/Wali:
            </Label>
            <div className="space-y-2.5 text-xs text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bekalMakan}
                  onChange={(e) => setBekalMakan(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600"
                />
                <span className="text-gray-800 font-medium">
                  1. Mendukung dan mematuhi tata tertib serta jadwal Kegiatan Belajar Mengajar (KBM) dari hari Senin sampai dengan Jumat.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={transportasi}
                  onChange={(e) => setTransportasi(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600"
                />
                <span className="text-gray-800 font-medium">
                  2. Aktif menjalin komunikasi dengan pihak sekolah serta menghadiri kegiatan/pertemuan orang tua yang diselenggarakan sekolah.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ibadah}
                  onChange={(e) => setIbadah(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600"
                />
                <span className="text-gray-800 font-medium">
                  3. Memastikan kedisiplinan kehadiran anak dan menyelesaikan kewajiban administrasi sekolah tepat waktu.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pendampinganBelajar}
                  onChange={(e) => setPendampinganBelajar(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600"
                />
                <span className="text-gray-800 font-medium">
                  4. Melakukan pengawasan, pendampingan belajar mandiri, dan penguatan pendidikan karakter anak dalam lingkungan keluarga pada hari Sabtu dan Minggu.
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* 4. BAGIAN TANDA TANGAN DIGITAL */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
            4
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">Tanda Tangan Digital Orang Tua / Wali</h3>
            <p className="text-xs text-gray-500">
              Goreskan tanda tangan langsung pada kotak di bawah sebagai bukti persetujuan resmi
            </p>
          </div>
        </div>

        <SignaturePad
          value={signatureData}
          onChange={(val) => setSignatureData(val)}
          height={200}
        />

        {/* Checkbox Legal Disclaimer */}
        <div className="pt-3 border-t border-gray-100">
          <label className="flex items-start gap-3 cursor-pointer select-none bg-blue-50/50 p-3.5 rounded-xl border border-blue-200 text-xs text-blue-950">
            <input
              type="checkbox"
              checked={isAgreedTerms}
              onChange={(e) => setIsAgreedTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-blue-600"
              required
            />
            <span className="leading-relaxed">
              Dengan ini saya menyatakan bahwa data yang saya masukkan adalah benar dan saya secara sadar
              menandatangani surat persetujuan orang tua ini untuk dipergunakan oleh pihak sekolah
              sebagaimana mestinya.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-3">
          <Button
            type="submit"
            disabled={isSubmitting || !signatureData || !isAgreedTerms}
            className="w-full h-12 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-bold text-sm sm:text-base rounded-xl shadow-md flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Menerbitkan Surat Persetujuan...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Kirim & Terbitkan Surat Persetujuan Resmi</span>
              </>
            )}
          </Button>
          <p className="text-center text-[11px] text-gray-400 mt-2">
            Surat resmi dalam format PDF akan langsung diterbitkan beserta QR Code verifikasi dokumen PAWARTA.
          </p>
        </div>
      </div>
    </form>
  );
}
