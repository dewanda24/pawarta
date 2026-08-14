import { db } from '@/db';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {
  incomingRegisters,
  incomingLetters,
  registerBooks,
  incomingDispositions,
} from '@/db/schema/incoming-letter';
import { eq, desc } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { users } from '@/db/schema/iam';

export const metadata = {
  title: 'Register Surat | PAWARTA',
};

export default async function RegisterSuratPage() {
  const registers = await db
    .select({
      id: incomingRegisters.id,
      nomorUrut: incomingRegisters.nomorUrut,
      tanggalCatat: incomingRegisters.tanggalCatat,
      buku: registerBooks.namaRegister,
      nomorAgenda: incomingLetters.nomorAgenda,
      nomorSurat: incomingLetters.nomorSurat,
      pengirim: incomingLetters.pengirim,
      perihal: incomingLetters.perihal,
      tanggalDiterima: incomingLetters.tanggalDiterima,
    })
    .from(incomingRegisters)
    .innerJoin(registerBooks, eq(incomingRegisters.bukuRegisterId, registerBooks.id))
    .innerJoin(incomingLetters, eq(incomingRegisters.suratId, incomingLetters.id))
    .orderBy(desc(incomingRegisters.tanggalCatat));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Register Surat & Disposisi</h1>
          <p className="text-muted-foreground">
            Pencatatan register digital untuk surat dan disposisi.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Cetak PDF</Button>
          <Button variant="outline">Export Excel</Button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <Input placeholder="Cari di register..." className="max-w-sm" />
        <select className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
          <option>Semua Register</option>
          <option>Register Surat Masuk</option>
          <option>Register Disposisi</option>
        </select>
        <select className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
          <option>Bulan Ini</option>
          <option>Semua Waktu</option>
        </select>
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-16">
                  No
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Buku Register
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  No. Agenda
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Tgl Catat
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Perihal
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Asal Surat
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Tgl Diterima
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {registers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-muted-foreground">
                    Data register masih kosong.
                  </td>
                </tr>
              ) : (
                registers.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle text-center">{index + 1}</td>
                    <td className="p-4 align-middle">{item.buku}</td>
                    <td className="p-4 align-middle font-medium">{item.nomorAgenda || '-'}</td>
                    <td className="p-4 align-middle">
                      {new Date(item.tanggalCatat).toLocaleDateString('id-ID')}
                    </td>
                    <td className="p-4 align-middle">{item.perihal}</td>
                    <td className="p-4 align-middle">{item.pengirim}</td>
                    <td className="p-4 align-middle">
                      {new Date(item.tanggalDiterima).toLocaleDateString('id-ID')}
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
