import { db } from '@/db';
import { outgoingLetters } from '@/db/schema/outgoing-letter';
import { masterPegawai, masterSekolah } from '@/db/schema/master';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ApproveLetterButton } from '@/components/features/outgoing-letter/ApproveLetterButton';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

export default async function SuratKeluarDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams?.id;

  if (!id) return notFound();

  const letter = await db.query.outgoingLetters.findFirst({
    where: eq(outgoingLetters.id, id),
    with: {
      jenisSurat: true,
      klasifikasi: true,
      pembuat: true,
      penandatangan: true,
      unitKerja: true,
    },
  });

  if (!letter) return notFound();

  const sekolah = await db.query.masterSekolah.findFirst({
    where: eq(masterSekolah.isAktif, true),
  });

  const kepsek = await db.query.masterPegawai.findFirst({
    where: eq(masterPegawai.isAktif, true),
  });

  const ttdNama = letter.penandatangan?.nama || kepsek?.nama || 'Kepala Sekolah';
  const ttdNip = letter.penandatangan?.nip || kepsek?.nip || '-';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Action Header (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase">
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
              {letter.jenisSurat?.nama || 'Surat Keluar'}
            </span>
            <span>•</span>
            <span
              className={`px-2 py-0.5 rounded font-semibold ${
                letter.status === 'APPROVED' || letter.status === 'PUBLISHED'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {letter.status}
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 mt-1">{letter.perihal}</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Tujuan: <span className="font-medium text-gray-700">{letter.tujuanSurat}</span> • No:{' '}
            <span className="font-semibold text-blue-700">
              {letter.nomorSurat || 'Draft (Belum terbit)'}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/surat-keluar">
            <Button variant="outline" className="flex items-center gap-1.5 text-xs h-9">
              <ArrowLeft className="w-4 h-4" /> Kembali
            </Button>
          </Link>
          <ApproveLetterButton suratId={letter.id} status={letter.status} />
        </div>
      </div>

      {/* Official School Letterhead Format (Visible & Print-Ready) */}
      <div className="bg-white p-8 sm:p-12 rounded-xl border border-gray-200 shadow-sm print:border-none print:shadow-none print:p-0">
        {/* Kop Surat */}
        <div className="border-b-4 border-double border-gray-900 pb-4 text-center">
          <h3 className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-gray-600">
            PEMERINTAH PROVINSI JAWA TIMUR • DINAS PENDIDIKAN
          </h3>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-gray-950 uppercase mt-0.5">
            {sekolah?.nama || 'SMA NEGERI CONTOH UTAMA'}
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            {sekolah?.alamat || 'Jl. Pendidikan No. 45 Kota Utama'} • NPSN:{' '}
            {sekolah?.npsn || '20512345'} • Email: {sekolah?.email || 'info@sekolah.sch.id'}
          </p>
        </div>

        {/* Nomor & Tanggal */}
        <div className="mt-6 flex justify-between items-start text-sm">
          <div className="space-y-1">
            <p>
              <span className="w-20 inline-block text-gray-600">Nomor</span>:{' '}
              <span className="font-bold text-gray-900">
                {letter.nomorSurat || '... / ... / SMA-01 / 2026'}
              </span>
            </p>
            <p>
              <span className="w-20 inline-block text-gray-600">Lampiran</span>: -
            </p>
            <p>
              <span className="w-20 inline-block text-gray-600">Perihal</span>:{' '}
              <span className="font-semibold">{letter.perihal}</span>
            </p>
          </div>
          <div className="text-right text-gray-700">
            <p>
              {sekolah?.kabupaten || 'Kota Utama'},{' '}
              {letter.tanggalSurat
                ? new Date(letter.tanggalSurat).toLocaleDateString('id-ID', { dateStyle: 'long' })
                : new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}
            </p>
          </div>
        </div>

        {/* Tujuan Surat */}
        <div className="mt-6 text-sm text-gray-800 space-y-1">
          <p>Kepada Yth.</p>
          <p className="font-bold text-gray-950">{letter.tujuanSurat}</p>
          <p>di Tempat</p>
        </div>

        {/* Isi Surat */}
        <div className="mt-6 text-sm leading-relaxed text-gray-900 space-y-4">
          <p>Dengan hormat,</p>
          <p className="text-justify indent-8">
            Sehubungan dengan agenda kegiatan sekolah dan dalam rangka pelaksanaan tugas kedinasan,
            dengan ini kami sampaikan mengenai <strong>{letter.perihal}</strong>.
          </p>
          <p className="text-justify indent-8">
            {letter.catatanTambahan ||
              'Demikian surat dinas ini kami sampaikan, atas perhatian dan kerjasama yang baik kami ucapkan terima kasih.'}
          </p>
        </div>

        {/* Tanda Tangan & QR Code */}
        <div className="mt-12 flex justify-end text-sm">
          <div className="w-64 text-center space-y-2">
            <p className="text-gray-700">Kepala Sekolah,</p>

            {letter.status === 'APPROVED' || letter.status === 'PUBLISHED' ? (
              <div className="py-2 flex flex-col items-center">
                <div className="w-20 h-20 bg-gray-50 border-2 border-emerald-600/60 rounded-lg flex flex-col items-center justify-center p-1 text-[9px] text-emerald-800 font-bold shadow-xs">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-0.5" />
                  <span>TTE VALID</span>
                  <span className="font-mono text-[8px] text-gray-500">PAWARTA BSrE</span>
                </div>
                <span className="text-[10px] text-gray-400 mt-1">Ditandatangani Elektronik</span>
              </div>
            ) : (
              <div className="h-20 flex items-center justify-center text-xs text-gray-400 italic">
                (Menunggu Tanda Tangan)
              </div>
            )}

            <div>
              <p className="font-bold underline text-gray-950">{ttdNama}</p>
              <p className="text-xs text-gray-600">NIP. {ttdNip}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
