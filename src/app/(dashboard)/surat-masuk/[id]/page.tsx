import { db } from '@/db';

import {
  incomingLetters,
  incomingTimelines,
  incomingLetterAttachments,
} from '@/db/schema/incoming-letter';

import {
  masterInstansi,
  masterJenisSurat,
  masterKlasifikasiSurat,
  masterPrioritas,
  masterSifatSurat,
  masterPegawai,
  masterUnitKerja,
} from '@/db/schema/master';
import { users } from '@/db/schema/iam';
import { eq, desc, and, isNull } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

import { LetterActions } from '@/components/features/incoming-letter/LetterActions';
import { AttachmentSection } from '@/components/shared/AttachmentSection';
import { Printer, ArrowLeft } from 'lucide-react';
import { requireAuth } from '@/lib/server-action';
import { hasPermission } from '@/lib/auth/rbac';
import { PERM } from '@/lib/auth/permissions';

export const metadata = {
  title: 'Detail Surat Masuk | PAWARTA',
};

export default async function DetailSuratMasukPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  await requireAuth('SURAT_MASUK_READ');

  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams?.id;

  if (!id) {
    notFound();
  }

  const [canDisposisi, canDistribusi, canEdit] = await Promise.all([
    hasPermission(PERM.SURAT_MASUK_DISPOSISI),
    hasPermission(PERM.SURAT_MASUK_DISTRIBUSI),
    hasPermission(PERM.SURAT_MASUK_UPDATE),
  ]);

  const [letter] = await db
    .select({
      id: incomingLetters.id,
      nomorAgenda: incomingLetters.nomorAgenda,
      nomorSurat: incomingLetters.nomorSurat,
      pengirim: incomingLetters.pengirim,
      instansi: masterInstansi.nama,
      perihal: incomingLetters.perihal,
      ringkasanIsi: incomingLetters.ringkasanIsi,
      jenis: masterJenisSurat.nama,
      klasifikasi: masterKlasifikasiSurat.nama,
      prioritas: masterPrioritas.nama,
      sifat: masterSifatSurat.nama,
      tanggalSurat: incomingLetters.tanggalSurat,
      tanggalDiterima: incomingLetters.tanggalDiterima,
      status: incomingLetters.status,
      catatan: incomingLetters.catatan,
    })
    .from(incomingLetters)
    .leftJoin(masterInstansi, eq(incomingLetters.instansiPengirimId, masterInstansi.id))
    .leftJoin(masterJenisSurat, eq(incomingLetters.jenisSuratId, masterJenisSurat.id))
    .leftJoin(masterKlasifikasiSurat, eq(incomingLetters.klasifikasiId, masterKlasifikasiSurat.id))
    .leftJoin(masterPrioritas, eq(incomingLetters.prioritasId, masterPrioritas.id))
    .leftJoin(masterSifatSurat, eq(incomingLetters.sifatSuratId, masterSifatSurat.id))
    .where(and(eq(incomingLetters.id, id), isNull(incomingLetters.deletedAt)));

  if (!letter) {
    notFound();
  }

  const timelines = await db
    .select({
      id: incomingTimelines.id,
      aktivitas: incomingTimelines.aktivitas,
      deskripsi: incomingTimelines.deskripsi,
      tanggal: incomingTimelines.tanggal,
      aktor: users.nama,
    })
    .from(incomingTimelines)
    .leftJoin(users, eq(incomingTimelines.aktorId, users.id))
    .where(eq(incomingTimelines.suratId, letter.id))
    .orderBy(desc(incomingTimelines.tanggal));

  const [pegawaiOpts, unitKerjaOpts, userOpts, attachments] = await Promise.all([
    db
      .select({ id: masterPegawai.id, nama: masterPegawai.nama })
      .from(masterPegawai)
      .where(eq(masterPegawai.isAktif, true)),
    db
      .select({ id: masterUnitKerja.id, nama: masterUnitKerja.nama })
      .from(masterUnitKerja)
      .where(eq(masterUnitKerja.isAktif, true)),
    db
      .select({ id: users.id, nama: users.nama, username: users.username })
      .from(users)
      .where(eq(users.status, 'Aktif')),
    db
      .select({
        id: incomingLetterAttachments.id,
        namaFile: incomingLetterAttachments.namaFile,
        tipeMime: incomingLetterAttachments.tipeMime,
        ukuranBytes: incomingLetterAttachments.ukuranBytes,
        fileUrl: incomingLetterAttachments.fileUrl,
      })
      .from(incomingLetterAttachments)
      .where(eq(incomingLetterAttachments.suratId, letter.id)),
  ]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
            {letter.perihal}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Dari: <span className="font-semibold text-gray-700">{letter.pengirim}</span>{' '}
            {letter.instansi ? `(${letter.instansi})` : ''} • No. Surat:{' '}
            <span className="font-semibold text-blue-700">{letter.nomorSurat}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Link href="/surat-masuk">
            <Button variant="outline" size="sm" className="h-9 text-xs flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali
            </Button>
          </Link>
          <Link href={`/surat-masuk/${letter.id}/disposisi`}>
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs font-semibold text-blue-700 border-blue-200 hover:bg-blue-50 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> Cetak Lembar Disposisi
            </Button>
          </Link>
          <LetterActions
            suratId={letter.id}
            status={letter.status}
            pegawaiOpts={pegawaiOpts}
            unitKerjaOpts={unitKerjaOpts}
            userOpts={userOpts}
            canDisposisi={canDisposisi}
            canDistribusi={canDistribusi}
            canEdit={canEdit}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-md border p-6 space-y-4">
            <h2 className="text-lg font-semibold">Informasi Surat</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Nomor Agenda</p>
                <p className="font-medium">{letter.nomorAgenda || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Nomor Surat</p>
                <p className="font-medium">{letter.nomorSurat}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tanggal Surat</p>
                <p className="font-medium">
                  {letter.tanggalSurat ? new Date(letter.tanggalSurat).toLocaleDateString('id-ID') : '-'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Tanggal Diterima</p>
                <p className="font-medium">
                  {letter.tanggalDiterima ? new Date(letter.tanggalDiterima).toLocaleDateString('id-ID') : '-'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Pengirim</p>
                <p className="font-medium">
                  {letter.pengirim} {letter.instansi ? `(${letter.instansi})` : ''}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Perihal</p>
                <p className="font-medium">{letter.perihal}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Ringkasan Isi</p>
                <p className="font-medium">{letter.ringkasanIsi || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Jenis</p>
                <p className="font-medium">{letter.jenis}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Klasifikasi</p>
                <p className="font-medium">{letter.klasifikasi}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Prioritas</p>
                <p className="font-medium">{letter.prioritas}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Sifat</p>
                <p className="font-medium">{letter.sifat}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium">{letter.status}</p>
              </div>
            </div>
          </div>

          <AttachmentSection
            suratId={letter.id}
            tipeSurat="INCOMING"
            attachments={attachments}
          />
        </div>

        <div className="space-y-6">
          <div className="rounded-md border p-6 space-y-4">
            <h2 className="text-lg font-semibold">Timeline & Riwayat</h2>
            <div className="space-y-4">
              {timelines.map((timeline) => (
                <div
                  key={timeline.id}
                  className="relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-[-1rem] before:w-[2px] before:bg-muted last:before:hidden"
                >
                  <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 border-primary bg-background"></div>
                  <div className="text-sm">
                    <p className="font-medium">{timeline.aktivitas}</p>
                    <p className="text-muted-foreground">{timeline.deskripsi}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {timeline.tanggal ? new Date(timeline.tanggal).toLocaleString('id-ID') : '-'} -{' '}
                      {timeline.aktor || 'Sistem'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

