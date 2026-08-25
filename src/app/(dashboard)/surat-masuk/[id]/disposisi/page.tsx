import { db } from '@/db';
import { incomingLetters } from '@/db/schema/incoming-letter';
import { documentHeaders } from '@/db/schema/document';
import { masterInstansi, masterSifatSurat, masterPegawai, masterSekolah } from '@/db/schema/master';
import { eq, and } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PrintButton } from '@/components/shared/PrintButton';
import { LetterheadView } from '@/components/shared/LetterheadView';

export const metadata = {
  title: 'Lembar Disposisi Surat Masuk | PAWARTA',
};

export default async function CetakLembarDisposisiPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams?.id;

  if (!id) notFound();

  const [letter, kopSurat, kepsek, sekolah] = await Promise.all([
    db
      .select({
        id: incomingLetters.id,
        nomorAgenda: incomingLetters.nomorAgenda,
        nomorSurat: incomingLetters.nomorSurat,
        pengirim: incomingLetters.pengirim,
        instansi: masterInstansi.nama,
        perihal: incomingLetters.perihal,
        ringkasanIsi: incomingLetters.ringkasanIsi,
        sifat: masterSifatSurat.nama,
        tanggalSurat: incomingLetters.tanggalSurat,
        tanggalDiterima: incomingLetters.tanggalDiterima,
        catatan: incomingLetters.catatan,
      })
      .from(incomingLetters)
      .leftJoin(masterInstansi, eq(incomingLetters.instansiPengirimId, masterInstansi.id))
      .leftJoin(masterSifatSurat, eq(incomingLetters.sifatSuratId, masterSifatSurat.id))
      .where(eq(incomingLetters.id, id))
      .then((res) => res[0]),
    db.query.documentHeaders.findFirst({
      where: and(eq(documentHeaders.isDefault, true), eq(documentHeaders.isAktif, true)),
    }),
    db.query.masterPegawai.findFirst({
      where: eq(masterPegawai.isAktif, true),
    }),
    db.query.masterSekolah.findFirst({
      where: eq(masterSekolah.isAktif, true),
    }),
  ]);

  if (!letter) notFound();

  const ttdNama = kepsek?.nama || 'Drs. H. Ahmad Wijaya, M.Pd';
  const ttdNip = kepsek?.nip || '197503122000031001';

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      {/* Top Action Bar (Hidden on Print) */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden bg-white p-5 rounded-xl border border-gray-200 shadow-xs'>
        <div>
          <span className='text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200'>
            Format Cetak 1/2 HVS Resmi
          </span>
          <h1 className='text-xl font-bold text-gray-900 mt-1'>
            Lembar Disposisi Surat Masuk
          </h1>
          <p className='text-xs text-gray-500'>
            No. Agenda: <span className='font-mono font-bold text-gray-800'>{letter.nomorAgenda || '-'}</span> • No. Surat: {letter.nomorSurat}
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <Link href={`/surat-masuk/${letter.id}`}>
            <Button variant='outline' size='sm' className='flex items-center gap-1.5 text-xs h-9'>
              <ArrowLeft className='w-4 h-4' /> Kembali
            </Button>
          </Link>
          <PrintButton />
        </div>
      </div>

      {/* Printable Sheet (Formal Half HVS / A5 Box) */}
      <div className='bg-white p-6 sm:p-10 rounded-xl border-2 border-gray-800 shadow-sm print:border-none print:shadow-none print:p-0 text-gray-950 font-serif leading-tight'>
        <LetterheadView header={kopSurat} fallbackSekolah={sekolah} />

        <div className='text-center my-3 pb-1 border-b border-gray-400'>
          <h2 className='text-base font-bold uppercase tracking-wider underline'>
            LEMBAR DISPOSISI
          </h2>
        </div>

        {/* Info Grid */}
        <div className='border border-gray-800 text-xs divide-y divide-gray-800'>
          <div className='grid grid-cols-2 divide-x divide-gray-800'>
            <div className='p-2 space-y-1'>
              <p><span className='w-28 inline-block font-semibold'>Nomor Agenda</span>: <span className='font-mono font-bold'>{letter.nomorAgenda || '-'}</span></p>
              <p><span className='w-28 inline-block font-semibold'>Tanggal Diterima</span>: {letter.tanggalDiterima || '-'}</p>
              <p><span className='w-28 inline-block font-semibold'>Tingkat Keamanan</span>: <span className='font-semibold'>{letter.sifat || 'Biasa'}</span></p>
            </div>
            <div className='p-2 space-y-1'>
              <p><span className='w-28 inline-block font-semibold'>Nomor Surat</span>: <span className='font-mono font-semibold'>{letter.nomorSurat}</span></p>
              <p><span className='w-28 inline-block font-semibold'>Tanggal Surat</span>: {letter.tanggalSurat || '-'}</p>
              <p><span className='w-28 inline-block font-semibold'>Asal Surat</span>: <span className='font-semibold'>{letter.pengirim}</span></p>
            </div>
          </div>

          <div className='p-2'>
            <p><span className='font-semibold'>Perihal / Isi Ringkas:</span></p>
            <p className='font-medium mt-0.5 text-gray-900'>{letter.perihal}</p>
            {letter.ringkasanIsi && (
              <p className='text-[11px] text-gray-700 italic mt-0.5'>{letter.ringkasanIsi}</p>
            )}
          </div>

          {/* Disposition Routing and Instructions Grid */}
          <div className='grid grid-cols-2 divide-x divide-gray-800'>
            {/* Left: Diteruskan Kepada */}
            <div className='p-2.5 space-y-1.5'>
              <p className='font-bold uppercase tracking-wider text-[11px] text-gray-800 border-b pb-1'>
                Diteruskan Kepada Yth:
              </p>
              <div className='space-y-1 text-[11px] pt-1'>
                <p><span className='inline-block w-4 h-4 border border-gray-600 mr-2 text-center'></span> Waka Bidang Kurikulum</p>
                <p><span className='inline-block w-4 h-4 border border-gray-600 mr-2 text-center'></span> Waka Bidang Kesiswaan</p>
                <p><span className='inline-block w-4 h-4 border border-gray-600 mr-2 text-center'></span> Waka Bidang Sarpras</p>
                <p><span className='inline-block w-4 h-4 border border-gray-600 mr-2 text-center'></span> Waka Bidang Humas</p>
                <p><span className='inline-block w-4 h-4 border border-gray-600 mr-2 text-center'></span> Kepala Tata Usaha (KTU)</p>
                <p><span className='inline-block w-4 h-4 border border-gray-600 mr-2 text-center'></span> Koordinator Guru / Wali Kelas</p>
                <p><span className='inline-block w-4 h-4 border border-gray-600 mr-2 text-center'></span> Bendahara Sekolah</p>
                <p><span className='inline-block w-4 h-4 border border-gray-600 mr-2 text-center'></span> ............................................</p>
              </div>
            </div>

            {/* Right: Petunjuk / Instruksi */}
            <div className='p-2.5 space-y-1.5'>
              <p className='font-bold uppercase tracking-wider text-[11px] text-gray-800 border-b pb-1'>
                Petunjuk / Isi Disposisi:
              </p>
              <div className='space-y-1 text-[11px] pt-1'>
                <p><span className='inline-block w-4 h-4 border border-gray-600 mr-2 text-center'></span> Tindak lanjuti segera</p>
                <p><span className='inline-block w-4 h-4 border border-gray-600 mr-2 text-center'></span> Hadiri / Wakili</p>
                <p><span className='inline-block w-4 h-4 border border-gray-600 mr-2 text-center'></span> Pelajari / Kaji</p>
                <p><span className='inline-block w-4 h-4 border border-gray-600 mr-2 text-center'></span> Buatkan konsep jawaban/balasan</p>
                <p><span className='inline-block w-4 h-4 border border-gray-600 mr-2 text-center'></span> Koordinasikan bersama tim</p>
                <p><span className='inline-block w-4 h-4 border border-gray-600 mr-2 text-center'></span> Arsipkan / Simpan</p>
                <p><span className='inline-block w-4 h-4 border border-gray-600 mr-2 text-center'></span> Bicarakan dengan saya</p>
                <p><span className='inline-block w-4 h-4 border border-gray-600 mr-2 text-center'></span> ............................................</p>
              </div>
            </div>
          </div>

          {/* Catatan Arahan Kepala Sekolah */}
          <div className='p-2.5 min-h-[90px]'>
            <p className='font-bold text-[11px] uppercase tracking-wider text-gray-800'>
              Catatan / Arahan Khusus Kepala Sekolah:
            </p>
            <p className='text-xs text-gray-900 mt-1 font-sans'>
              {letter.catatan || '(Diisi arahan tertulis oleh Kepala Sekolah)'}
            </p>
          </div>
        </div>

        {/* Tanda Tangan Kepala Sekolah */}
        <div className='mt-4 flex justify-end text-xs'>
          <div className='w-60 text-center space-y-1'>
            <p className='text-gray-600'>
              {sekolah?.kabupaten || 'Kota Utama'}, {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}
            </p>
            <p className='font-bold'>Kepala Sekolah,</p>
            <div className='h-16 flex items-end justify-center'>
              <p className='text-[10px] text-gray-400 italic'>(Tanda Tangan / Paraf)</p>
            </div>
            <p className='font-bold underline'>{ttdNama}</p>
            <p className='text-gray-600'>NIP. {ttdNip}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
