import { getStudentLetterById } from '@/features/student-letter/actions';
import { db } from '@/db';
import { documentHeaders } from '@/db/schema/document';
import { eq, and } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { PrintButton } from '@/components/shared/PrintButton';
import { LetterheadView } from '@/components/shared/LetterheadView';

export const metadata = {
  title: 'Cetak Surat Kesiswaan | PAWARTA',
};

export default async function DetailSuratSiswaPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams?.id;

  if (!id) {
    notFound();
  }
  const [res, kopSurat] = await Promise.all([
    getStudentLetterById(id),
    db.query.documentHeaders.findFirst({
      where: and(eq(documentHeaders.isDefault, true), eq(documentHeaders.isAktif, true)),
    }),
  ]);

  if (!res.success || !res.data) {
    notFound();
  }

  const letter = res.data;
  const sekolah = res.sekolah;
  const kepsek = res.kepsek;

  const ttdNama = kepsek?.nama || 'Drs. H. Ahmad Wijaya, M.Pd';
  const ttdNip = kepsek?.nip || '197503122000031001';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Bar (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase">
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
              {letter.tipeSurat === 'DISPENSASI'
                ? 'Surat Dispensasi Siswa'
                : letter.tipeSurat === 'KETERANGAN_AKTIF'
                  ? 'Surat Keterangan Siswa Aktif'
                  : 'Surat Panggilan Orang Tua'}
            </span>
            <span>•</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
              {letter.status}
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 mt-1">
            No: {letter.nomorSurat}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Diterbitkan pada:{' '}
            {letter.createdAt
              ? new Date(letter.createdAt).toLocaleDateString('id-ID', { dateStyle: 'full' })
              : '-'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/surat-siswa">
            <Button variant="outline" className="flex items-center gap-1.5 text-xs h-9">
              <ArrowLeft className="w-4 h-4" /> Kembali
            </Button>
          </Link>
          <PrintButton />
        </div>
      </div>

      {/* Official Printable Document Container */}
      <div className="bg-white p-4 sm:p-10 md:p-14 rounded-xl border border-gray-200 shadow-sm print:border-none print:shadow-none print:p-0 text-gray-950 font-serif leading-relaxed overflow-x-auto">
        {/* Kop Surat Resmi Dinamis */}
        <LetterheadView header={kopSurat} fallbackSekolah={sekolah} />

        {/* 1. KONTEN SURAT DISPENSASI */}
        {letter.tipeSurat === 'DISPENSASI' && (
          <div className="mt-6 space-y-5 text-sm">
            <div className="text-center space-y-1">
              <h3 className="font-bold text-base uppercase tracking-wider underline">
                SURAT IZIN DISPENSASI SISWA
              </h3>
              <p className="text-xs font-mono">Nomor: {letter.nomorSurat}</p>
            </div>

            <p className="indent-8 text-justify">
              Yang bertanda tangan di bawah ini, Kepala {sekolah?.nama || 'SMA Negeri Contoh Utama'}
              , dengan ini menerangkan dan memberikan izin dispensasi kepada siswa-siswi tersebut di
              bawah ini:
            </p>

            {/* Tabel Peserta Dispensasi */}
            <div className="overflow-x-auto my-3">
              <table className="w-full text-xs text-left border-collapse border border-gray-800">
                <thead className="bg-gray-100 font-bold border-b border-gray-800">
                  <tr>
                    <th className="p-2 text-center w-10 border border-gray-800">No</th>
                    <th className="p-2 border border-gray-800">Nama Lengkap Siswa</th>
                    <th className="p-2 border border-gray-800">NISN</th>
                    <th className="p-2 border border-gray-800">Kelas</th>
                    <th className="p-2 border border-gray-800">Keterangan / Peran</th>
                  </tr>
                </thead>
                <tbody>
                  {letter.participants && letter.participants.length > 0 ? (
                    letter.participants.map((part, idx) => (
                      <tr key={part.id}>
                        <td className="p-2 text-center border border-gray-800">{idx + 1}</td>
                        <td className="p-2 font-bold border border-gray-800">{part.siswa?.nama}</td>
                        <td className="p-2 font-mono border border-gray-800">{part.siswa?.nisn}</td>
                        <td className="p-2 border border-gray-800">
                          {part.siswa?.kelas?.kodeKelas || '-'}
                        </td>
                        <td className="p-2 border border-gray-800">
                          {part.peran || 'Peserta Kegiatan'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-2 text-center">
                        Data peserta tidak ditemukan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="space-y-1.5">
              <p>Untuk tidak mengikuti Kegiatan Belajar Mengajar (KBM) di sekolah dikarenakan:</p>
              <div className="pl-6 space-y-1">
                <p>
                  <span className="w-32 inline-block font-semibold">Kegiatan</span>:{' '}
                  {letter.namaKegiatan}
                </p>
                <p>
                  <span className="w-32 inline-block font-semibold">Waktu / Tanggal</span>:{' '}
                  {letter.tanggalMulai} s/d {letter.tanggalSelesai}
                </p>
                <p>
                  <span className="w-32 inline-block font-semibold">Tempat</span>:{' '}
                  {letter.lokasiKegiatan || 'Sesuai agenda panitia'}
                </p>
                {letter.guruPendamping && (
                  <p>
                    <span className="w-32 inline-block font-semibold">Guru Pendamping</span>:{' '}
                    {letter.guruPendamping.nama}
                  </p>
                )}
              </div>
            </div>

            <p className="indent-8 text-justify">
              {letter.catatanKhusus ||
                'Demikian surat dispensasi ini diberikan agar dapat dipergunakan sebagaimana mestinya, dan kepada para siswa yang bersangkutan tetap berkewajiban menyelesaikan tugas-tugas pelajaran yang ditinggalkan.'}
            </p>
          </div>
        )}

        {/* 2. KONTEN SURAT KETERANGAN SISWA AKTIF */}
        {letter.tipeSurat === 'KETERANGAN_AKTIF' && (
          <div className="mt-6 space-y-5 text-sm">
            <div className="text-center space-y-1">
              <h3 className="font-bold text-base uppercase tracking-wider underline">
                SURAT KETERANGAN SISWA AKTIF
              </h3>
              <p className="text-xs font-mono">Nomor: {letter.nomorSurat}</p>
            </div>

            <p className="indent-8 text-justify">
              Yang bertanda tangan di bawah ini, Kepala {sekolah?.nama || 'SMA Negeri Contoh Utama'}
              , Kabupaten {sekolah?.kabupaten || 'Kota Utama'}, dengan ini menerangkan dengan
              sebenarnya bahwa:
            </p>

            <div className="pl-8 space-y-2">
              <p>
                <span className="w-44 inline-block font-semibold">Nama Siswa</span>:{' '}
                <span className="font-bold uppercase">{letter.siswa?.nama}</span>
              </p>
              <p>
                <span className="w-44 inline-block font-semibold">NIS / NISN</span>:{' '}
                {letter.siswa?.nis || '-'} / {letter.siswa?.nisn}
              </p>
              <p>
                <span className="w-44 inline-block font-semibold">Tempat, Tanggal Lahir</span>:{' '}
                {letter.siswa?.tempatLahir || 'Kota Utama'}, {letter.siswa?.tanggalLahir || '-'}
              </p>
              <p>
                <span className="w-44 inline-block font-semibold">Jenis Kelamin</span>:{' '}
                {letter.siswa?.jenisKelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}
              </p>
              <p>
                <span className="w-44 inline-block font-semibold">Kelas / Rombel</span>:{' '}
                {letter.siswa?.kelas?.namaKelas || letter.kelas?.namaKelas || '-'}
              </p>
              <p>
                <span className="w-44 inline-block font-semibold">Nama Orang Tua / Wali</span>:{' '}
                {letter.siswa?.namaOrtu || '-'}
              </p>
              <p>
                <span className="w-44 inline-block font-semibold">Pekerjaan Orang Tua</span>:{' '}
                {letter.siswa?.pekerjaanOrtu || '-'}
              </p>
              <p>
                <span className="w-44 inline-block font-semibold">Alamat Tempat Tinggal</span>:{' '}
                {letter.siswa?.alamat || '-'}
              </p>
            </div>

            <p className="indent-8 text-justify">
              Adalah benar yang bersangkutan merupakan peserta didik yang terdaftar aktif mengikuti
              proses pembelajaran di {sekolah?.nama || 'SMA Negeri Contoh Utama'} pada Tahun
              Pelajaran 2026/2027.
            </p>

            <p className="indent-8 text-justify">
              Surat keterangan ini diterbitkan dan diberikan kepada yang bersangkutan untuk
              keperluan: <strong>{letter.keperluan}</strong>.
            </p>

            <p className="indent-8 text-justify">
              Demikian surat keterangan ini kami buat dengan sebenarnya agar dapat dipergunakan
              sebagaimana mestinya.
            </p>
          </div>
        )}

        {/* 3. KONTEN SURAT PANGGILAN ORANG TUA */}
        {letter.tipeSurat === 'PANGGILAN_ORTU' && (
          <div className="mt-6 space-y-5 text-sm">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p>
                  <span className="w-20 inline-block text-gray-600">Nomor</span>:{' '}
                  {letter.nomorSurat}
                </p>
                <p>
                  <span className="w-20 inline-block text-gray-600">Lampiran</span>: -
                </p>
                <p>
                  <span className="w-20 inline-block text-gray-600">Perihal</span>:{' '}
                  <strong>Panggilan Orang Tua / Wali Murid</strong>
                </p>
              </div>
              <div className="text-right">
                <p>
                  {sekolah?.kabupaten || 'Kota Utama'},{' '}
                  {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-1">
              <p>Kepada Yth.</p>
              <p className="font-bold">Bapak / Ibu Orang Tua / Wali dari: {letter.siswa?.nama}</p>
              <p>Kelas: {letter.siswa?.kelas?.namaKelas || letter.kelas?.namaKelas || '-'}</p>
              <p>di Tempat</p>
            </div>

            <p className="indent-8 text-justify">
              Dengan hormat, sehubungan dengan perlunya koordinasi dan konsultasi mengenai
              perkembangan belajar serta pembinaan putra/putri Bapak/Ibu di sekolah, maka dengan ini
              kami mengharap kehadiran Bapak/Ibu pada:
            </p>

            <div className="pl-8 space-y-2">
              <p>
                <span className="w-40 inline-block font-semibold">Hari, Tanggal & Waktu</span>:{' '}
                <span className="font-bold">{letter.waktuMenghadap}</span>
              </p>
              <p>
                <span className="w-40 inline-block font-semibold">Tempat / Ruangan</span>:{' '}
                {letter.ruangan || 'Ruang Bimbingan Konseling (BK)'}
              </p>
              <p>
                <span className="w-40 inline-block font-semibold">Menghadap Kepada</span>:{' '}
                {letter.menghadapKepada || 'Guru BK / Wali Kelas'}
              </p>
              <p>
                <span className="w-40 inline-block font-semibold">Perihal</span>: {letter.keperluan}
              </p>
            </div>

            <p className="indent-8 text-justify">
              {letter.catatanKhusus ||
                'Mengingat pentingnya koordinasi ini demi kebaikan dan kelancaran pendidikan putra/putri Bapak/Ibu, kehadiran tepat pada waktunya sangat kami harapkan.'}
            </p>

            <p className="indent-8 text-justify">
              Atas perhatian dan kerjasama yang baik dari Bapak/Ibu, kami sampaikan terima kasih.
            </p>
          </div>
        )}

        {/* Tanda Tangan Resmi Kepala Sekolah & QR Code Verifikasi */}
        <div className="mt-12 flex justify-end">
          <div className="w-64 text-center space-y-2">
            <p className="text-xs text-gray-600">
              {sekolah?.kabupaten || 'Kota Utama'},{' '}
              {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}
            </p>
            <p className="font-semibold text-sm">Kepala Sekolah,</p>

            <div className="py-2 flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-50 border-2 border-emerald-600/60 rounded-lg flex flex-col items-center justify-center p-1 text-[9px] text-emerald-800 font-bold shadow-xs">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-0.5" />
                <span>TTE VALID</span>
                <span className="font-mono text-[8px] text-gray-500">PAWARTA BSrE</span>
              </div>
              <span className="text-[10px] text-gray-400 mt-1 font-sans">
                Dokumen Resmi Ditandatangani Elektronik
              </span>
            </div>

            <div>
              <p className="font-bold underline text-sm">{ttdNama}</p>
              <p className="text-xs text-gray-600 font-sans">NIP. {ttdNip}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
