import { db } from '@/db';
import { incomingLetters } from '@/db/schema/incoming-letter';
import { masterInstansi, masterSifatSurat, masterPegawai, masterSekolah } from '@/db/schema/master';
import { documentHeaders } from '@/db/schema/document';
import { eq, and } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';
import { PrintButton } from '@/components/shared/PrintButton';
import { LetterheadView } from '@/components/shared/LetterheadView';
import { OfficialSignatureBlock } from '@/components/shared/OfficialSignatureBlock';
import { getSlaInfo } from '@/lib/sla-calculator';

export const metadata = {
  title: 'Lembar Disposisi Resmi | PAWARTA',
};

export default async function LembarDisposisiPage({
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
        deadlineSla: incomingLetters.deadlineSla,
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

  const sla = getSlaInfo(letter.tanggalDiterima || new Date(), letter.sifat, letter.deadlineSla);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Action Bar (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Lembar Disposisi Naskah Dinas</h1>
            <p className="text-xs text-gray-500">
              Surat Masuk: <span className="font-mono font-semibold">{letter.nomorSurat}</span> •
              Asal:{' '}
              <span className="font-medium text-gray-700">
                {letter.instansi || letter.pengirim}
              </span>
            </p>
          </div>
          <div
            className={`hidden md:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${sla.badgeColor}`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>SLA: {sla.durasiDeskripsi}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/surat-masuk/${letter.id}`}>
            <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs h-9">
              <ArrowLeft className="w-4 h-4" /> Kembali
            </Button>
          </Link>
          <PrintButton />
        </div>
      </div>

      {/* Printable Sheet (Formal Half HVS / F4 Box) */}
      <div className="bg-white p-6 sm:p-10 rounded-xl border-2 border-gray-800 shadow-sm print:border-none print:shadow-none print:p-0 text-gray-950 font-sans leading-tight">
        <LetterheadView header={kopSurat} fallbackSekolah={sekolah} />

        <div className="text-center my-3 pb-1 border-b border-gray-400">
          <h2 className="text-base font-bold uppercase tracking-wider underline">
            LEMBAR DISPOSISI
          </h2>
        </div>

        {/* Info Grid */}
        <div className="border border-gray-800 text-xs divide-y divide-gray-800">
          <div className="grid grid-cols-2 divide-x divide-gray-800">
            <div className="p-2 space-y-1">
              <p>
                <span className="w-28 inline-block font-semibold">Nomor Agenda</span>:{' '}
                <span className="font-mono font-bold">{letter.nomorAgenda || '-'}</span>
              </p>
              <p>
                <span className="w-28 inline-block font-semibold">Tanggal Diterima</span>:{' '}
                {letter.tanggalDiterima || '-'}
              </p>
              <p>
                <span className="w-28 inline-block font-semibold">Sifat Surat</span>:{' '}
                <span className="font-semibold">{letter.sifat || 'Biasa'}</span> (Target:{' '}
                {sla.durasiDeskripsi})
              </p>
            </div>
            <div className="p-2 space-y-1">
              <p>
                <span className="w-28 inline-block font-semibold">Nomor Surat</span>:{' '}
                <span className="font-mono font-semibold">{letter.nomorSurat}</span>
              </p>
              <p>
                <span className="w-28 inline-block font-semibold">Tanggal Surat</span>:{' '}
                {letter.tanggalSurat || '-'}
              </p>
              <p>
                <span className="w-28 inline-block font-semibold">Asal Surat</span>:{' '}
                <span className="font-semibold">{letter.instansi || letter.pengirim}</span>
              </p>
            </div>
          </div>

          <div className="p-2">
            <p>
              <span className="font-semibold">Hal / Ringkasan Isi:</span>
            </p>
            <p className="font-medium mt-0.5 text-gray-900">{letter.perihal}</p>
            {letter.ringkasanIsi && (
              <p className="text-[11px] text-gray-700 italic mt-0.5">{letter.ringkasanIsi}</p>
            )}
          </div>

          {/* Disposition Routing and Instructions Grid (Lampiran II.A.3) */}
          <div className="grid grid-cols-2 divide-x divide-gray-800">
            {/* Left: Diteruskan Kepada */}
            <div className="p-2.5 space-y-1.5">
              <p className="font-bold uppercase tracking-wider text-[11px] text-gray-800 border-b pb-1">
                Diteruskan kepada Sdr:
              </p>
              <div className="space-y-1 text-[11px] pt-1">
                <p>
                  <span className="inline-block w-4 h-4 border border-gray-600 mr-2 text-center"></span>{' '}
                  Waka Bidang Kurikulum
                </p>
                <p>
                  <span className="inline-block w-4 h-4 border border-gray-600 mr-2 text-center"></span>{' '}
                  Waka Bidang Kesiswaan
                </p>
                <p>
                  <span className="inline-block w-4 h-4 border border-gray-600 mr-2 text-center"></span>{' '}
                  Waka Bidang Sarpras & Humas
                </p>
                <p>
                  <span className="inline-block w-4 h-4 border border-gray-600 mr-2 text-center"></span>{' '}
                  Kepala Tata Usaha (KTU)
                </p>
                <p>
                  <span className="inline-block w-4 h-4 border border-gray-600 mr-2 text-center"></span>{' '}
                  Koordinator Guru / Wali Kelas
                </p>
                <p>
                  <span className="inline-block w-4 h-4 border border-gray-600 mr-2 text-center"></span>{' '}
                  Bendahara Sekolah
                </p>
                <p>
                  <span className="inline-block w-4 h-4 border border-gray-600 mr-2 text-center"></span>{' '}
                  ............................................
                </p>
              </div>
            </div>

            {/* Right: Dengan hormat harap (Baku Lampiran II.A.3 Perbup 9/2026) */}
            <div className="p-2.5 space-y-1.5">
              <p className="font-bold uppercase tracking-wider text-[11px] text-gray-800 border-b pb-1">
                Dengan hormat harap:
              </p>
              <div className="space-y-1 text-[11px] pt-1">
                <p>
                  <span className="inline-block w-4 h-4 border border-gray-600 mr-2 text-center"></span>{' '}
                  Tanggapan dan Saran
                </p>
                <p>
                  <span className="inline-block w-4 h-4 border border-gray-600 mr-2 text-center"></span>{' '}
                  Proses lebih lanjut
                </p>
                <p>
                  <span className="inline-block w-4 h-4 border border-gray-600 mr-2 text-center"></span>{' '}
                  Koordinasi / konfirmasikan
                </p>
                <p>
                  <span className="inline-block w-4 h-4 border border-gray-600 mr-2 text-center"></span>{' '}
                  Hadiri / Wakili
                </p>
                <p>
                  <span className="inline-block w-4 h-4 border border-gray-600 mr-2 text-center"></span>{' '}
                  Arsipkan / Untuk diketahui
                </p>
                <p>
                  <span className="inline-block w-4 h-4 border border-gray-600 mr-2 text-center"></span>{' '}
                  ............................................
                </p>
              </div>
            </div>
          </div>

          {/* Catatan Arahan Kepala Sekolah */}
          <div className="p-2.5 min-h-[85px]">
            <p className="font-bold text-[11px] uppercase tracking-wider text-gray-800">Catatan:</p>
            <p className="text-xs text-gray-900 mt-1 font-sans">
              {letter.catatan || '(Diisi arahan tertulis oleh Kepala Sekolah)'}
            </p>
          </div>
        </div>

        {/* Tanda Tangan / Paraf Kepala Sekolah */}
        <div className="mt-4 flex justify-end text-xs">
          <div className="text-left">
            <OfficialSignatureBlock
              jabatan="Nama Jabatan / Kepala Sekolah"
              nama={kepsek?.nama || 'Drs. H. Ahmad Wijaya, M.Pd.'}
              pangkatGolongan={kepsek?.pangkatGolongan || 'Pembina Tingkat I (IV/b)'}
              nip={kepsek?.nip || '197503122000031001'}
              tempatTanggal={`${sekolah?.kabupaten || 'Sumedang'}, ${new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}`}
              isTte={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
