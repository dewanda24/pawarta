import { db } from '@/db';
import { outgoingLetters, letterAttachments } from '@/db/schema/outgoing-letter';
import { masterPegawai, masterSekolah } from '@/db/schema/master';
import { documentHeaders } from '@/db/schema/document';
import { eq, desc, and } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ApproveLetterButton } from '@/components/features/outgoing-letter/ApproveLetterButton';
import { AttachmentSection } from '@/components/shared/AttachmentSection';
import { LetterheadView } from '@/components/shared/LetterheadView';
import { OfficialSignatureBlock } from '@/components/shared/OfficialSignatureBlock';
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

  const snapshot = (letter.documentSnapshot as any) || null;
  const signerSnap = snapshot?.signer || (letter.signerSnapshot as any) || null;
  const sekolahSnap = snapshot?.sekolah || null;

  const [sekolah, kepsek, kopSurat, attachments] = await Promise.all([
    db.query.masterSekolah.findFirst({
      where: eq(masterSekolah.isAktif, true),
    }),
    db.query.masterPegawai.findFirst({
      where: eq(masterPegawai.isAktif, true),
    }),
    db.query.documentHeaders.findFirst({
      where: and(eq(documentHeaders.isDefault, true), eq(documentHeaders.isAktif, true)),
    }),
    db
      .select()
      .from(letterAttachments)
      .where(eq(letterAttachments.suratId, letter.id))
      .orderBy(desc(letterAttachments.createdAt)),
  ]);

  const displayKop = snapshot?.kopSurat || kopSurat;
  const displaySekolah = sekolahSnap || sekolah;
  const ttdNama = signerSnap?.nama || letter.penandatangan?.nama || kepsek?.nama || 'Kepala Sekolah';
  const ttdNip = signerSnap?.nip || (letter.penandatangan?.nip ? `NIP. ${letter.penandatangan.nip}` : kepsek?.nip ? `NIP. ${kepsek.nip}` : '-');
  const ttdJabatan = signerSnap?.jabatanDokumen || 'Kepala Sekolah';
  const ttdPangkat = signerSnap?.pangkatGolongan || letter.penandatangan?.pangkatGolongan || kepsek?.pangkatGolongan || 'Pembina Tingkat I (IV/b)';

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
        {/* Kop Surat Dinamis */}
        <LetterheadView header={displayKop} fallbackSekolah={displaySekolah} />

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
              {displaySekolah?.kabupaten || 'Kabupaten Sumedang'},{' '}
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

        {/* Tanda Tangan & QR Code Resmi Sesuai Perbup Sumedang 9/2026 */}
        <div className="mt-12 flex justify-end text-sm">
          <div className="text-left">
            <OfficialSignatureBlock
              jabatan={ttdJabatan}
              nama={ttdNama}
              pangkatGolongan={ttdPangkat}
              nip={ttdNip}
              isTte={letter.status === 'APPROVED' || letter.status === 'PUBLISHED'}
              qrCodeUrl={`/api/v1/verifikasi/qr/${letter.id}`}
            />
          </div>
        </div>
      </div>

      {/* Attachments Section (Hidden on Print) */}
      <div className="print:hidden">
        <AttachmentSection suratId={letter.id} tipeSurat="OUTGOING" attachments={attachments} />
      </div>
    </div>
  );
}
