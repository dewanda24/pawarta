import { db } from '@/db';

import { incomingLetters, incomingTimelines } from '@/db/schema/incoming-letter';

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
import { eq, desc } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

import { LetterActions } from '@/components/features/incoming-letter/LetterActions';

export const metadata = {
  title: 'Detail Surat Masuk | PAWARTA',
};

export default async function DetailSuratMasukPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams?.id;

  if (!id) {
    notFound();
  }

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
    .where(eq(incomingLetters.id, id));

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

  const [pegawaiOpts, unitKerjaOpts] = await Promise.all([
    db
      .select({ id: masterPegawai.id, nama: masterPegawai.nama })
      .from(masterPegawai)
      .where(eq(masterPegawai.isAktif, true)),
    db
      .select({ id: masterUnitKerja.id, nama: masterUnitKerja.nama })
      .from(masterUnitKerja)
      .where(eq(masterUnitKerja.isAktif, true)),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Detail Surat Masuk</h1>
          <p className="text-muted-foreground">{letter.nomorSurat}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/surat-masuk">
            <Button variant="outline">Kembali</Button>
          </Link>
          <LetterActions
            suratId={letter.id}
            pegawaiOpts={pegawaiOpts}
            unitKerjaOpts={unitKerjaOpts}
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
                  {new Date(letter.tanggalSurat).toLocaleDateString('id-ID')}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Tanggal Diterima</p>
                <p className="font-medium">
                  {new Date(letter.tanggalDiterima).toLocaleDateString('id-ID')}
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

          <div className="rounded-md border p-6 space-y-4">
            <h2 className="text-lg font-semibold">Lampiran (Placeholder)</h2>
            <p className="text-sm text-muted-foreground">
              Upload file belum diimplementasikan di versi preview ini.
            </p>
          </div>
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
                      {new Date(timeline.tanggal).toLocaleString('id-ID')} -{' '}
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
