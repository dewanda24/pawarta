import { db } from '@/db';
import { incomingAgendas, incomingLetters, agendaBooks } from '@/db/schema/incoming-letter';
import { eq, desc } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const metadata = {
  title: 'Buku Agenda Digital | PAWARTA',
};

export default async function AgendaDigitalPage() {
  const agendas = await db
    .select({
      id: incomingAgendas.id,
      nomorUrut: incomingAgendas.nomorUrut,
      tanggalCatat: incomingAgendas.tanggalCatat,
      buku: agendaBooks.namaBuku,
      nomorAgenda: incomingLetters.nomorAgenda,
      nomorSurat: incomingLetters.nomorSurat,
      pengirim: incomingLetters.pengirim,
      perihal: incomingLetters.perihal,
    })
    .from(incomingAgendas)
    .innerJoin(agendaBooks, eq(incomingAgendas.bukuAgendaId, agendaBooks.id))
    .innerJoin(incomingLetters, eq(incomingAgendas.suratId, incomingLetters.id))
    .orderBy(desc(incomingAgendas.tanggalCatat));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda Digital</h1>
          <p className="text-muted-foreground">Buku agenda surat masuk dan keluar.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Cetak PDF</Button>
          <Button variant="outline">Export Excel</Button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <Input placeholder="Cari nomor agenda, nomor surat..." className="max-w-sm" />
        <select className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
          <option>Semua Tahun</option>
          <option>2026</option>
          <option>2025</option>
        </select>
        <select className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
          <option>Semua Bulan</option>
          <option>Agustus</option>
          <option>Juli</option>
        </select>
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-16">No</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Buku Agenda</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">No. Agenda</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Tgl Catat</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Isi Ringkas / Perihal</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Asal Surat</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">No. Surat</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {agendas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-muted-foreground">Data agenda masih kosong.</td>
                </tr>
              ) : (
                agendas.map((item, index) => (
                  <tr key={item.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle text-center">{index + 1}</td>
                    <td className="p-4 align-middle">{item.buku}</td>
                    <td className="p-4 align-middle font-medium">{item.nomorAgenda || '-'}</td>
                    <td className="p-4 align-middle">{new Date(item.tanggalCatat).toLocaleDateString('id-ID')}</td>
                    <td className="p-4 align-middle">{item.perihal}</td>
                    <td className="p-4 align-middle">{item.pengirim}</td>
                    <td className="p-4 align-middle">{item.nomorSurat}</td>
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
