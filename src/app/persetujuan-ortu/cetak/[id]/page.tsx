import { getConsentDetailById } from '@/features/student-letter/consent-actions';
import { notFound } from 'next/navigation';
import { PrintButton } from '@/components/shared/PrintButton';
import { LetterheadView } from '@/components/shared/LetterheadView';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Cetak Surat Persetujuan Orang Tua | PAWARTA',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CetakPersetujuanPage({ params }: PageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const res = await getConsentDetailById(id);
  if (!res.success || !res.data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl max-w-md w-full shadow-lg border border-gray-200 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Dokumen Tidak Ditemukan</h2>
          <p className="text-xs text-gray-500">
            {res.error || 'Dokumen surat persetujuan tidak dapat dimuat.'}
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
  const kopSurat = res.kopSurat;
  const kepsek = res.kepsek;

  const tanggalTtd = consent.signedAt
    ? new Date(consent.signedAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

  const fasilitas = (consent.kesiapanFasilitas as any) || {};

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Bar (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase">
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
              Surat Pernyataan Orang Tua
            </span>
            <span>•</span>
            <span
              className={`px-2 py-0.5 rounded font-semibold border ${
                consent.statusPersetujuan === 'SETUJU'
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : 'text-red-700 bg-red-50 border-red-200'
              }`}
            >
              {consent.statusPersetujuan === 'SETUJU' ? 'DISETUJUI' : 'DITOLAK'}
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 mt-1">
            No: {consent.nomorSurat || 'SPERT/421.3/' + consent.id.slice(0, 8)}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Siswa: <strong>{consent.siswa?.nama}</strong> (Kelas: {consent.siswa?.kelas?.namaKelas || consent.siswa?.kelas?.kodeKelas})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/persetujuan-ortu/sukses/${consent.id}`}>
            <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs h-9">
              <ArrowLeft className="w-4 h-4" /> Kembali
            </Button>
          </Link>
          <PrintButton />
        </div>
      </div>

      {/* Official Printable Sheet (A4 / F4) */}
      <div className="bg-white p-6 sm:p-12 md:p-14 rounded-2xl border border-gray-200 shadow-sm print:border-none print:shadow-none print:p-0 text-gray-950 font-serif leading-relaxed text-sm">
        {/* Kop Surat Resmi Dinamis */}
        <LetterheadView header={kopSurat} fallbackSekolah={sekolah} />

        {/* Judul Naskah */}
        <div className="text-center space-y-1 my-6">
          <h2 className="font-bold text-base sm:text-lg uppercase tracking-wider underline">
            SURAT PERNYATAAN / PERSETUJUAN ORANG TUA / WALI
          </h2>
          <p className="font-bold text-xs uppercase tracking-wide">
            PELAKSANAAN PROGRAM 5 HARI SEKOLAH (SENIN - JUMAT)
          </p>
          <p className="text-xs font-mono text-gray-800">
            Nomor: {consent.nomorSurat || 'SPERT/421.3/' + consent.id.slice(0, 8)}
          </p>
        </div>

        {/* Pembuka */}
        <p className="text-justify indent-8 mb-4">
          Yang bertanda tangan di bawah ini, selaku orang tua / wali murid dari siswa {sekolah?.nama || 'Sekolah'}:
        </p>

        {/* Data Orang Tua */}
        <div className="pl-6 sm:pl-10 space-y-1.5 mb-4 text-xs sm:text-sm">
          <div className="grid grid-cols-12 gap-1">
            <span className="col-span-4 sm:col-span-3 font-semibold">Nama Lengkap</span>
            <span className="col-span-1">:</span>
            <span className="col-span-7 sm:col-span-8 font-bold">{consent.namaOrtu}</span>
          </div>
          <div className="grid grid-cols-12 gap-1">
            <span className="col-span-4 sm:col-span-3 font-semibold">Hubungan</span>
            <span className="col-span-1">:</span>
            <span className="col-span-7 sm:col-span-8">{consent.hubungan || 'Orang Tua Kandung'}</span>
          </div>
          <div className="grid grid-cols-12 gap-1">
            <span className="col-span-4 sm:col-span-3 font-semibold">Pekerjaan</span>
            <span className="col-span-1">:</span>
            <span className="col-span-7 sm:col-span-8">{consent.pekerjaanOrtu || '-'}</span>
          </div>
          <div className="grid grid-cols-12 gap-1">
            <span className="col-span-4 sm:col-span-3 font-semibold">No. Telepon / WhatsApp</span>
            <span className="col-span-1">:</span>
            <span className="col-span-7 sm:col-span-8 font-mono">{consent.noHpOrtu}</span>
          </div>
          <div className="grid grid-cols-12 gap-1">
            <span className="col-span-4 sm:col-span-3 font-semibold">Alamat Domisili</span>
            <span className="col-span-1">:</span>
            <span className="col-span-7 sm:col-span-8">{consent.alamatOrtu || '-'}</span>
          </div>
        </div>

        <p className="text-justify indent-8 mb-4">
          Dengan ini menyatakan dan memberikan persetujuan terhadap putra/putri kami:
        </p>

        {/* Data Siswa */}
        <div className="pl-6 sm:pl-10 space-y-1.5 mb-5 text-xs sm:text-sm">
          <div className="grid grid-cols-12 gap-1">
            <span className="col-span-4 sm:col-span-3 font-semibold">Nama Siswa</span>
            <span className="col-span-1">:</span>
            <span className="col-span-7 sm:col-span-8 font-bold uppercase">
              {consent.siswa?.nama || (consent.documentSnapshot as any)?.siswa?.nama || '-'}
            </span>
          </div>
          <div className="grid grid-cols-12 gap-1">
            <span className="col-span-4 sm:col-span-3 font-semibold">NIS / NISN</span>
            <span className="col-span-1">:</span>
            <span className="col-span-7 sm:col-span-8 font-mono">
              {consent.siswa?.nis || (consent.documentSnapshot as any)?.siswa?.nis || '-'} /{' '}
              {consent.siswa?.nisn || (consent.documentSnapshot as any)?.siswa?.nisn || '-'}
            </span>
          </div>
          <div className="grid grid-cols-12 gap-1">
            <span className="col-span-4 sm:col-span-3 font-semibold">Kelas / Tingkat</span>
            <span className="col-span-1">:</span>
            <span className="col-span-7 sm:col-span-8">
              {consent.siswa?.kelas?.namaKelas ||
                consent.kelas?.namaKelas ||
                (consent.documentSnapshot as any)?.siswa?.kelas ||
                '-'}
            </span>
          </div>
        </div>

        {/* Pernyataan Persetujuan */}
        <div className="p-4 rounded-lg bg-gray-50 border border-gray-300 my-4 space-y-2">
          <p className="font-bold text-center uppercase tracking-wide text-xs sm:text-sm">
            STATUS PERNYATAAN:{' '}
            <span className={consent.statusPersetujuan === 'SETUJU' ? 'text-blue-900 underline' : 'text-red-700 underline'}>
              {consent.statusPersetujuan === 'SETUJU'
                ? 'MENYETUJUI PELAKSANAAN PROGRAM 5 HARI SEKOLAH'
                : 'TIDAK MENYETUJUI PELAKSANAAN PROGRAM 5 HARI SEKOLAH'}
            </span>
          </p>

          {consent.statusPersetujuan === 'SETUJU' ? (
            <div className="text-xs space-y-1 pt-2 border-t border-gray-300">
              <p className="font-semibold">Dengan kesiapan dan komitmen sebagai berikut:</p>
              <ol className="list-decimal pl-5 space-y-0.5">
                <li>Mendukung dan mematuhi jadwal Kegiatan Belajar Mengajar (KBM) hari Senin s.d. Jumat.</li>
                <li>Menyiapkan bekal konsumsi makan siang dan perlengkapan ibadah anak di sekolah.</li>
                <li>Mengkondisikan sarana transportasi serta kepulangan anak secara aman dan tepat waktu.</li>
                <li>Mendampingi serta memantau kegiatan belajar mandiri siswa pada hari Sabtu dan Minggu di rumah.</li>
              </ol>
            </div>
          ) : (
            <div className="text-xs pt-2 border-t border-gray-300">
              <p className="font-semibold">Alasan Tidak Menyetujui:</p>
              <p className="italic bg-white p-2 rounded border border-gray-200 mt-1">
                {consent.alasanPenolakan || 'Tidak menyetujui pelaksanaan program.'}
              </p>
            </div>
          )}
        </div>

        <p className="text-justify indent-8 my-5">
          Demikian surat pernyataan persetujuan ini saya buat dengan sebenarnya dalam keadaan sadar dan tanpa
          paksaan dari pihak manapun untuk dapat dipergunakan oleh pihak sekolah sebagaimana mestinya.
        </p>

        {/* Blok Tanda Tangan Ganda (Orang Tua & Mengetahui Kepala Sekolah) */}
        <div className="grid grid-cols-2 gap-4 mt-8 pt-4 font-sans text-xs sm:text-sm">
          {/* Mengetahui Kepala Sekolah */}
          <div className="text-left space-y-1">
            <p className="text-gray-600">Mengetahui,</p>
            <p className="font-semibold text-gray-950">Kepala {sekolah?.nama || 'Sekolah'},</p>
            <div className="h-20 flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/v1/verifikasi/qr/${consent.id}`}
                alt="QR Code Verifikasi"
                className="w-16 h-16 object-contain border border-gray-200 p-0.5 rounded"
              />
            </div>
            <p className="font-bold underline text-gray-950">
              {kepsek?.nama || 'Drs. H. Ahmad Wijaya, M.Pd'}
            </p>
            <p className="text-gray-700 font-mono text-[11px]">
              NIP. {kepsek?.nip || '197503122000031001'}
            </p>
          </div>

          {/* Yang Menyatakan (Orang Tua / Wali) */}
          <div className="text-right space-y-1">
            <p className="text-gray-700">
              {sekolah?.kabupaten || 'Sumedang'}, {tanggalTtd}
            </p>
            <p className="font-semibold text-gray-950">Yang Membuat Pernyataan,</p>
            <div className="h-20 flex items-center justify-end">
              {consent.ttdDigital ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={consent.ttdDigital}
                  alt="Tanda Tangan Orang Tua"
                  className="max-h-16 max-w-[140px] object-contain"
                />
              ) : (
                <div className="h-16" />
              )}
            </div>
            <p className="font-bold underline text-gray-950">{consent.namaOrtu}</p>
            <p className="text-gray-600 text-[11px]">
              Orang Tua / Wali ({consent.hubungan || 'Wali Murid'})
            </p>
          </div>
        </div>

        {/* Footer Catatan Tembusan */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-[10px] text-gray-500 font-sans flex items-center justify-between">
          <div>
            <p className="font-semibold">Tembusan:</p>
            <p>1. Wali Kelas yang bersangkutan</p>
            <p>2. Arsip Kesiswaan Sekolah</p>
          </div>
          <div className="text-right font-mono">
            <p>PAWARTA Smart Correspondence</p>
            <p>ID: {consent.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
