import { db } from '@/db';
import { incomingLetters } from '@/db/schema/incoming-letter';
import { masterInstansi, masterJenisSurat } from '@/db/schema/master';
import { eq, desc } from 'drizzle-orm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Surat Masuk | PAWARTA',
};

export default async function SuratMasukPage() {
  const letters = await db
    .select({
      id: incomingLetters.id,
      nomorAgenda: incomingLetters.nomorAgenda,
      nomorSurat: incomingLetters.nomorSurat,
      pengirim: incomingLetters.pengirim,
      instansi: masterInstansi.nama,
      perihal: incomingLetters.perihal,
      jenis: masterJenisSurat.nama,
      tanggalDiterima: incomingLetters.tanggalDiterima,
      status: incomingLetters.status,
    })
    .from(incomingLetters)
    .leftJoin(masterInstansi, eq(incomingLetters.instansiPengirimId, masterInstansi.id))
    .leftJoin(masterJenisSurat, eq(incomingLetters.jenisSuratId, masterJenisSurat.id))
    .orderBy(desc(incomingLetters.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Surat Masuk</h1>
          <p className="text-muted-foreground">Kelola semua surat masuk dan disposisi.</p>
        </div>
        <Link href="/surat-masuk/tambah">
          <Button>Registrasi Surat Masuk</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">No. Agenda</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">No. Surat</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Pengirim</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Perihal</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Tgl Diterima</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {letters.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-muted-foreground">Belum ada surat masuk.</td>
                </tr>
              ) : (
                letters.map((letter) => (
                  <tr key={letter.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle">{letter.nomorAgenda || '-'}</td>
                    <td className="p-4 align-middle font-medium">{letter.nomorSurat}</td>
                    <td className="p-4 align-middle">
                      {letter.pengirim}
                      {letter.instansi && <span className="block text-xs text-muted-foreground">{letter.instansi}</span>}
                    </td>
                    <td className="p-4 align-middle">{letter.perihal}</td>
                    <td className="p-4 align-middle">{new Date(letter.tanggalDiterima).toLocaleDateString('id-ID')}</td>
                    <td className="p-4 align-middle">{letter.status}</td>
                    <td className="p-4 align-middle text-right">
                      <Link href={`/surat-masuk/${letter.id}`}>
                        <Button variant="outline" size="sm">Detail</Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
