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
  FileText,
  ChevronDown,
  ChevronUp,
  Search,
  Users,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  ConsentLetterConfig,
  DEFAULT_CONSENT_LETTER_CONFIG,
} from '@/features/student-letter/consent-config';
import { LetterheadView } from '@/components/shared/LetterheadView';
import { stripNomorPrefix } from '@/lib/nomor-surat-generator';
import { toRomanGrade, formatNamaKelasRomawi, extractTingkat } from '@/lib/format-kelas';

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
  config?: ConsentLetterConfig;
  sekolah?: any;
  kopSurat?: any;
}

export function ParentConsentForm({
  classList,
  defaultKelasId,
  config = DEFAULT_CONSENT_LETTER_CONFIG,
  sekolah,
  kopSurat,
}: ParentConsentFormProps) {
  const router = useRouter();

  // Daftar Jenjang / Tingkat Kelas (7, 8, 9, dst.)
  const availableGrades = React.useMemo(() => {
    const grades = Array.from(
      new Set(classList.map((c) => extractTingkat(c))),
    ).sort((a, b) => a - b);
    return grades.length > 0 ? grades : [7, 8, 9];
  }, [classList]);

  const [selectedTingkat, setSelectedTingkat] = useState<number>(() => {
    if (defaultKelasId) {
      const found = classList.find((c) => c.id === defaultKelasId);
      if (found) return extractTingkat(found);
    }
    const firstGrade = classList.length > 0 ? extractTingkat(classList[0]) : 7;
    return availableGrades.includes(firstGrade) ? firstGrade : (availableGrades[0] || 7);
  });

  // State Step & Form
  const [selectedKelasId, setSelectedKelasId] = useState<string>(defaultKelasId || '');
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  // Handler memilih kelas / rombel
  const handleSelectKelas = (kelasId: string) => {
    setSelectedKelasId(kelasId);
    // Reset seleksi siswa saat berganti rombel agar tidak tertukar
    setSelectedStudentId('');
    setSelectedStudent(null);
    setExistingConsent(null);
    setStudentSearchQuery('');

    if (kelasId) {
      const found = classList.find((c) => c.id === kelasId);
      if (found) {
        const grade = extractTingkat(found);
        if (grade !== selectedTingkat) {
          setSelectedTingkat(grade);
        }
      }
    }
  };

  // Handler memilih jenjang tingkat kelas
  const handleSelectTingkat = (grade: number) => {
    setSelectedTingkat(grade);
    const classesInGrade = classList.filter((c) => extractTingkat(c) === grade);
    if (classesInGrade.length > 0) {
      // Jika kelas terpilih saat ini bukan di tingkat ini, auto-pilih rombel pertama di tingkat ini
      if (!classesInGrade.some((c) => c.id === selectedKelasId)) {
        handleSelectKelas(classesInGrade[0].id);
      }
    } else {
      handleSelectKelas('');
    }
  };

  // Sinkronkan jika defaultKelasId dari URL berubah
  useEffect(() => {
    if (defaultKelasId && defaultKelasId !== selectedKelasId) {
      handleSelectKelas(defaultKelasId);
      const found = classList.find((c) => c.id === defaultKelasId);
      if (found) setSelectedTingkat(extractTingkat(found));
    }
  }, [defaultKelasId, classList]);

  // Sinkronkan selectedTingkat jika selectedKelasId berganti
  useEffect(() => {
    if (selectedKelasId) {
      const found = classList.find((c) => c.id === selectedKelasId);
      if (found) {
        const grade = extractTingkat(found);
        if (grade !== selectedTingkat) {
          setSelectedTingkat(grade);
        }
      }
    }
  }, [selectedKelasId, classList, selectedTingkat]);

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
  const handleSignatureChange = React.useCallback((val: string | null) => {
    setSignatureData(val);
  }, []);
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

        // Siapkan pesan dan URL WhatsApp ke nomor 085795579158
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://pawarta.smpn1ujungjaya.sch.id';
        const pdfUrl = `${baseUrl}/persetujuan-ortu/cetak/${res.data.id}`;
        const cleanNomor = stripNomorPrefix(res.data.nomorSurat) || 'B/382/400.3.5.1/VIII/2026';

        const waText =
          `*SURAT PERSETUJUAN ORANG TUA - PAWARTA*\n` +
          `*${sekolah?.nama || 'SMPN 1 UJUNGJAYA'}*\n\n` +
          `Telah diisi & ditandatangani secara sah:\n\n` +
          `• *Nama Siswa*: ${selectedStudent?.nama || '-'}\n` +
          `• *NISN / NIS*: ${selectedStudent?.nisn || '-'} / ${selectedStudent?.nis || '-'}\n` +
          `• *Kelas*: Kelas ${toRomanGrade(selectedTingkat)}\n` +
          `• *Nama Orang Tua*: ${namaOrtu.trim()} (${hubungan})\n` +
          `• *No. WhatsApp*: ${noHpOrtu.trim()}\n` +
          `• *Pernyataan Sikap*: ${statusPersetujuan === 'SETUJU' ? 'MENYETUJUI PROGRAM 5 HARI SEKOLAH' : 'TIDAK MENYETUJUI'}\n` +
          `• *Nomor Surat*: ${cleanNomor}\n\n` +
          `📄 *Lampiran Berkas Dokumen PDF Resmi (Cetak / Unduh)*:\n` +
          `${pdfUrl}\n\n` +
          `_Pesan ini diterbitkan resmi melalui Sistem Persuratan Digital PAWARTA._`;

        const waUrl = `https://api.whatsapp.com/send?phone=6285795579158&text=${encodeURIComponent(waText)}`;

        try {
          window.open(waUrl, '_blank');
        } catch {
          // Popup blocked fallback
        }

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

  const [showSchoolLetter, setShowSchoolLetter] = useState(false);

  return (
    <div className="space-y-6 sm:space-y-8 text-gray-900">
      {/* 0. SURAT PEMBERITAHUAN RESMI DARI SEKOLAH (DISIMPAN DI FORM PUBLIK - KOMPAK & FLEKSIBEL) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all">
        <div
          onClick={() => setShowSchoolLetter(!showSchoolLetter)}
          className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none hover:opacity-95 transition-opacity"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-bold text-white shrink-0">
              <FileText className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-bold text-sm sm:text-base tracking-tight text-white">
                  Surat Pemberitahuan Resmi Sekolah
                </h2>
                <span className="text-[10px] bg-blue-500/30 text-blue-200 font-semibold px-2 py-0.5 rounded border border-blue-400/30">
                  DOKUMEN RESMI
                </span>
              </div>
              <p className="text-[11px] text-blue-200 mt-0.5 line-clamp-1">
                Program Pembelajaran 5 Hari Sekolah (FDK) • Nomor: {stripNomorPrefix(config.nomorSurat) || 'B/382/400.3.5.1/VIII/2026'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-blue-200 hidden sm:inline font-medium">
              {showSchoolLetter ? 'Tutup Naskah' : 'Lihat Naskah Lengkap'}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/15 h-8 w-8 p-0"
            >
              {showSchoolLetter ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {showSchoolLetter && (
          <div
            className="p-6 sm:p-10 md:p-12 bg-white text-[13px] text-gray-950 space-y-4 border-t border-gray-100 animate-in fade-in-50"
            style={{
              fontFamily:
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
                              : 'Arial, Helvetica, sans-serif',
              lineHeight: config.spasiSurat || '1.5',
              fontSize: config.ukuranFontSurat ? `${config.ukuranFontSurat}pt` : '11pt',
            }}
          >
            {/* Kop Surat Resmi */}
            <LetterheadView header={kopSurat} fallbackSekolah={sekolah} />

            {/* Header Naskah Dinas */}
            <div className="mt-4 mb-3 space-y-2 pt-1 text-[13px]">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                <table className="text-[13px]">
                  <tbody>
                    <tr>
                      <td className="w-24 font-semibold py-0.5 align-top">Nomor</td>
                      <td className="w-3 align-top">:</td>
                      <td className="font-semibold py-0.5 align-top">
                        {stripNomorPrefix(config.nomorSurat) || 'B/382/400.3.5.1/VIII/2026'}
                      </td>
                    </tr>
                    <tr>
                      <td className="font-semibold py-0.5 align-top">Sifat</td>
                      <td className="align-top">:</td>
                      <td className="py-0.5 align-top">{config.sifatSurat || 'Penting'}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold py-0.5 align-top">Lampiran</td>
                      <td className="align-top">:</td>
                      <td className="py-0.5 align-top">{config.lampiranSurat || '1 Lembar (Lembar Persetujuan)'}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold py-0.5 align-top">Perihal</td>
                      <td className="align-top">:</td>
                      <td className="font-bold py-0.5 align-top">
                        {config.perihalSurat || 'Pemberitahuan & Persetujuan Pembelajaran 5 (Lima) Hari'}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="text-left sm:text-right text-[13px] shrink-0">
                  <p>
                    {config.tempatSurat || sekolah?.kabupaten || 'Sumedang'},{' '}
                    {config.tanggalSurat && config.tanggalSurat !== 'OTOMATIS'
                      ? config.tanggalSurat
                      : new Date().toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                  </p>
                </div>
              </div>

              <div className="pt-3">
                <p>Kepada Yth.,</p>
                <p className="font-bold">{config.penerimaSurat || 'Bapak/Ibu Orang Tua / Wali Murid'}</p>
                <p>di Tempat</p>
              </div>
            </div>

            {/* Isi Surat Pemberitahuan */}
            <div className="space-y-3 text-justify leading-[1.6]">
              <p>Dengan hormat,</p>
              <p className="indent-8">
                {config.teksPembuka ||
                  `Sehubungan dengan upaya peningkatan mutu pendidikan, penguatan karakter peserta didik, serta regulasi pemerintah terkait efisiensi hari belajar efektif, dengan ini kami beritahukan bahwa ${sekolah?.nama || 'SMPN 1 UJUNGJAYA'} akan menerapkan sistem Pembelajaran 5 (Lima) Hari Sekolah.`}
              </p>

              {/* Ketentuan Formal Tanpa Card & Tanpa Bullet */}
              <div className="pl-6 sm:pl-10 my-2.5">
                <p className="mb-1.5 font-medium">
                  Adapun ketentuan pelaksanaan sistem tersebut sebagai berikut:
                </p>
                <table className="w-full text-[13px]">
                  <tbody>
                    <tr>
                      <td className="w-36 py-1 font-medium">Mulai Berlaku</td>
                      <td className="w-3">:</td>
                      <td className="font-semibold py-1">
                        {config.ketentuan?.mulaiBerlaku || 'Tahun Pelajaran 2026/2027'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 font-medium">Hari Belajar</td>
                      <td>:</td>
                      <td className="font-semibold py-1">
                        {config.ketentuan?.hariBelajar || 'Senin s.d. Jumat'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 font-medium">Jam Belajar</td>
                      <td>:</td>
                      <td className="font-semibold py-1">
                        {config.ketentuan?.jamBelajar ||
                          '07.00 s.d. 15.00 WIB (disesuaikan alokasi kurikulum & jadwal KBM)'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 font-medium">Hari Libur</td>
                      <td>:</td>
                      <td className="font-semibold py-1">
                        {config.ketentuan?.hariLibur || 'Sabtu dan Minggu'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="indent-8">
                {config.paragrafTujuan ||
                  'Penerapan sistem ini bertujuan agar peserta didik memiliki waktu lebih leluasa di akhir pekan untuk penguatan pendidikan karakter bersama keluarga secara mandiri dan terarah.'}
              </p>

              <p className="indent-8">
                Demi kelancaran program ini, kami memohon kesediaan Bapak/Ibu untuk mengisi dan menandatangani lembar
                pernyataan persetujuan pada formulir di bawah ini.
              </p>

              <p className="indent-8">
                {config.teksPenutup ||
                  'Demikian pemberitahuan ini disampaikan. Atas perhatian dan kerja sama Bapak/Ibu, kami ucapkan terima kasih.'}
              </p>
            </div>

            {/* Pengesahan Pejabat Sekolah Formal */}
            <div className="flex justify-end pt-4 text-[13px]">
              <div className="text-center w-64 space-y-1">
                <p>Hormat kami,</p>
                <p className="font-bold">{config.penandatangan?.jabatan || `Kepala ${sekolah?.nama || 'SMPN 1 UJUNGJAYA'}`}</p>
                <div className="h-16 flex items-center justify-center my-1">
                  {config.penandatangan?.tampilkanQr !== false ? (
                    <div className="w-14 h-14 border border-gray-300 rounded flex items-center justify-center bg-gray-50 text-[10px] font-mono text-gray-500">
                      [QR TTE]
                    </div>
                  ) : (
                    <div className="h-14" />
                  )}
                </div>
                <p className="font-bold underline">
                  {config.penandatangan?.nama || 'Drs. H. Dedi Kusnadi, M.Pd.'}
                </p>
                <p className="font-mono text-[11px] text-gray-800">
                  {config.penandatangan?.nip ? `NIP. ${config.penandatangan.nip}` : '-'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
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

        {/* 1. SELEKSI KELAS & ROMBEL SECARA VISUAL (2-TIER SEGMENTED PILLS) */}
        <div className="space-y-4">
          {/* Langkah 1.A: Pilih Jenjang / Tingkat Kelas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                1. Pilih Tingkat / Jenjang Kelas <span className="text-red-500">*</span>
              </Label>
              <span className="text-[10px] text-gray-500">Ketuk jenjang kelas</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {availableGrades.map((grade) => {
                const roman = toRomanGrade(grade);
                const isSelected = selectedTingkat === grade;
                const countClassInGrade = classList.filter((c) => extractTingkat(c) === grade).length;

                return (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => handleSelectTingkat(grade)}
                    className={`py-2.5 px-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                      isSelected
                        ? 'bg-blue-800 text-white border-blue-900 shadow-md ring-2 ring-blue-600/30 font-bold'
                        : 'bg-gray-50/80 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xs font-black tracking-wide">Kelas {roman}</span>
                    <span className={`text-[10px] font-normal ${isSelected ? 'text-blue-200' : 'text-gray-400'}`}>
                      {countClassInGrade} Rombel
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Langkah 1.B: Pilih Rombel Kelas (1-Tap Fast Selection) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-600" />
                2. Pilih Rombel Kelas {toRomanGrade(selectedTingkat)} <span className="text-red-500">*</span>
              </Label>
              <span className="text-[10px] text-gray-500">Pilih salah satu rombel di bawah</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {classList
                .filter((c) => extractTingkat(c) === selectedTingkat)
                .map((c) => {
                  const isSelected = selectedKelasId === c.id;
                  const rawLabel = c.kodeKelas || c.namaKelas || '';
                  const cleanLabel = rawLabel.replace(/^Kelas\s+/i, '');
                  const displayLabel = formatNamaKelasRomawi(cleanLabel);

                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectKelas(c.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-700 shadow-sm ring-2 ring-blue-500/20 font-bold'
                          : 'bg-white text-gray-800 border-gray-200 hover:bg-blue-50/60 hover:border-blue-300 font-semibold'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                      <span className="text-xs tracking-tight">{displayLabel}</span>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Langkah 1.C: Pilih / Cari Nama Siswa */}
          <div className="space-y-2 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-700" />
                3. Pilih Nama Lengkap Siswa <span className="text-red-500">*</span>
              </Label>
              {students.length > 0 && (
                <span className="text-[11px] text-gray-500 font-medium">
                  {students.length} Siswa Terdaftar
                </span>
              )}
            </div>

            {/* Live Fast Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                value={studentSearchQuery}
                onChange={(e) => setStudentSearchQuery(e.target.value)}
                placeholder={
                  !selectedKelasId
                    ? 'Pilih rombel di atas terlebih dahulu...'
                    : 'Ketik nama anak atau NISN untuk mencari cepat...'
                }
                disabled={!selectedKelasId || loadingStudents}
                className="pl-9 pr-20 h-11 text-xs bg-gray-50/70 border-gray-300 font-medium focus:bg-white"
              />
              {studentSearchQuery && (
                <button
                  type="button"
                  onClick={() => setStudentSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-blue-700 hover:underline font-semibold"
                >
                  Reset
                </button>
              )}
            </div>

            {/* List / Grid Siswa Interaktif */}
            {loadingStudents ? (
              <div className="flex items-center justify-center py-6 gap-2 text-xs text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Memuat daftar siswa kelas...</span>
              </div>
            ) : !selectedKelasId ? (
              <div className="text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-xs text-gray-500">
                👆 Silakan pilih rombel kelas di atas untuk menampilkan daftar siswa.
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-xs text-gray-500">
                Tidak ditemukan siswa dengan kata kunci &ldquo;{studentSearchQuery}&rdquo; di kelas ini.
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto border border-gray-200 rounded-xl p-2 bg-gray-50/50 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredStudents.map((s) => {
                  const isSelected = selectedStudentId === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => handleSelectStudent(s.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-700 shadow-xs ring-2 ring-blue-500/20'
                          : 'bg-white text-gray-900 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                          {s.nama}
                        </p>
                        <p className={`text-[10px] font-mono mt-0.5 ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                          NISN: {s.nisn || '-'} • NIS: {s.nis || '-'}
                        </p>
                      </div>
                      {isSelected ? (
                        <span className="w-5 h-5 rounded-full bg-white text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                          ✓
                        </span>
                      ) : (
                        <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-semibold border border-blue-200 shrink-0">
                          Pilih
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>


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
            <li>
              Hari Belajar:{' '}
              <strong>{config.ketentuan.hariBelajar || 'Senin s.d. Jumat'}</strong>.
            </li>
            <li>
              Jam Belajar:{' '}
              <strong>{config.ketentuan.jamBelajar || '07.00 s.d. 15.00 WIB'}</strong>.
            </li>
            <li>
              Hari Libur Siswa:{' '}
              <strong>{config.ketentuan.hariLibur || 'Sabtu dan Minggu'}</strong> (kegiatan penguatan keluarga di rumah).
            </li>
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
              {(config.komitmenPoin && config.komitmenPoin.length > 0
                ? config.komitmenPoin
                : DEFAULT_CONSENT_LETTER_CONFIG.komitmenPoin
              ).map((poin, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-gray-800 font-medium leading-relaxed">
                    {poin}
                  </span>
                </div>
              ))}
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
              Pilih tanda tangan otomatis sesuai nama atau goreskan tanda tangan sendiri
            </p>
          </div>
        </div>

        <SignaturePad
          value={signatureData}
          onChange={handleSignatureChange}
          parentName={namaOrtu}
          height={180}
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
  </div>
);
}
