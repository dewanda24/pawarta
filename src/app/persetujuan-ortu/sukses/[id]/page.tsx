import { getConsentDetailById } from '@/features/student-letter/consent-actions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Printer,
  FileCheck,
  ArrowLeft,
  Calendar,
  User,
  GraduationCap,
  ShieldCheck,
  Phone,
  Building,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';

export const metadata = {
  title: 'Surat Persetujuan Berhasil Diterbitkan | PAWARTA',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PersetujuanSuksesPage({ params }: PageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const res = await getConsentDetailById(id);
  if (!res.success || !res.data) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white text-slate-900 p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <FileCheck className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Dokumen Belum Ditemukan</h2>
          <p className="text-xs text-gray-500">
            {res.error || 'Data persetujuan orang tua sedang diproses atau tidak ditemukan.'}
          </p>
          <Link href="/persetujuan-ortu">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2">
              Kembali ke Formulir
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const consent = res.data;
  const sekolah = res.sekolah;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Header */}
      <header className="max-w-2xl w-full mx-auto flex items-center justify-between py-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
            P
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight">PAWARTA</span>
            <span className="block text-[10px] text-blue-200">Surat Persetujuan Orang Tua</span>
          </div>
        </div>

        <Link href="/persetujuan-ortu">
          <Button variant="ghost" size="sm" className="text-xs text-slate-300 hover:text-white hover:bg-white/10">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Formulir Baru
          </Button>
        </Link>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl w-full mx-auto my-8 space-y-6">
        {/* Success Card */}
        <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
          {/* Header Status */}
          <div className="text-center space-y-2 pb-4 border-b border-gray-100">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              Surat Pernyataan Berhasil Disimpan & Diterbitkan!
            </h1>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Terima kasih telah menandatangani surat persetujuan program 5 hari sekolah untuk{' '}
              <strong className="text-slate-800">{sekolah?.nama || 'Sekolah'}</strong>.
            </p>
          </div>

          {/* Details Overview */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-gray-500">Nomor Registrasi Surat</span>
              <span className="font-mono font-bold text-blue-800 text-xs sm:text-sm">
                {consent.nomorSurat || 'SPERT/421.3/' + consent.id.slice(0, 8)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-gray-500 block text-[11px]">Nama Siswa:</span>
                <span className="font-bold text-slate-900 text-sm">{consent.siswa?.nama}</span>
                <span className="block text-[11px] text-gray-500">
                  NISN: {consent.siswa?.nisn || '-'} • Kelas: {consent.siswa?.kelas?.namaKelas || consent.siswa?.kelas?.kodeKelas}
                </span>
              </div>

              <div>
                <span className="text-gray-500 block text-[11px]">Nama Orang Tua / Wali:</span>
                <span className="font-bold text-slate-900 text-sm">{consent.namaOrtu}</span>
                <span className="block text-[11px] text-gray-500">
                  Hubungan: {consent.hubungan} • No. HP: {consent.noHpOrtu}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-gray-500 block text-[11px]">Sikap Persetujuan:</span>
                <span
                  className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${
                    consent.statusPersetujuan === 'SETUJU'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}
                >
                  {consent.statusPersetujuan === 'SETUJU'
                    ? '✓ MENYETUJUI PROGRAM 5 HARI SEKOLAH'
                    : '✕ TIDAK MENYETUJUI PROGRAM'}
                </span>
              </div>

              <div className="text-right sm:text-right">
                <span className="text-gray-500 block text-[11px]">Waktu Penandatanganan:</span>
                <span className="font-semibold text-slate-800 text-[11px]">
                  {consent.signedAt
                    ? new Date(consent.signedAt).toLocaleDateString('id-ID', {
                        dateStyle: 'full',
                        timeStyle: 'short',
                      })
                    : '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Signature Preview */}
          {consent.ttdDigital && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center space-y-2">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Bukti Tanda Tangan Digital Terverifikasi
              </span>
              <div className="w-48 h-20 relative bg-gray-50/50 rounded border border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={consent.ttdDigital}
                  alt="Tanda Tangan Orang Tua"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <span className="text-[10px] text-gray-400 font-mono">
                {consent.namaOrtu} ({consent.hubungan})
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href={`/persetujuan-ortu/cetak/${consent.id}`} target="_blank" className="flex-1">
              <Button className="w-full h-11 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md">
                <Printer className="w-4 h-4" />
                <span>Cetak / Unduh Surat Resmi (PDF)</span>
              </Button>
            </Link>

            <Link href="/persetujuan-ortu" className="flex-1">
              <Button
                variant="outline"
                className="w-full h-11 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-xs sm:text-sm rounded-xl"
              >
                Isi Formulir Siswa Lain
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 py-4">
        © {new Date().getFullYear()} {sekolah?.nama || 'PAWARTA'}. Seluruh tanda tangan terekam secara aman.
      </footer>
    </div>
  );
}
