import { db } from '@/db';
import { archiveBorrowings, archives } from '@/db/schema/archive';
import { users } from '@/db/schema/iam';
import { masterUnitKerja } from '@/db/schema/master';
import { eq, desc } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
  title: 'Peminjaman Arsip | PAWARTA',
};

export default async function PeminjamanArsipPage() {
  const borrowings = await db
    .select({
      id: archiveBorrowings.id,
      archiveId: archiveBorrowings.archiveId,
      nomorArsip: archives.nomorArsip,
      perihal: archives.perihal,
      peminjam: users.nama,
      unit: masterUnitKerja.nama,
      tanggalPinjam: archiveBorrowings.tanggalPinjam,
      tanggalKembaliRencana: archiveBorrowings.tanggalKembaliRencana,
      status: archiveBorrowings.status,
    })
    .from(archiveBorrowings)
    .innerJoin(archives, eq(archiveBorrowings.archiveId, archives.id))
    .innerJoin(users, eq(archiveBorrowings.peminjamId, users.id))
    .leftJoin(masterUnitKerja, eq(archiveBorrowings.unitPeminjamId, masterUnitKerja.id))
    .orderBy(desc(archiveBorrowings.tanggalPinjam));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Peminjaman Arsip</h1>
          <p className="text-muted-foreground">Kelola permintaan peminjaman arsip fisik dan digital.</p>
        </div>
        <Button>Buat Permintaan Pinjam</Button>
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Tgl Pinjam</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Peminjam</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">No. Arsip / Perihal</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Tgl Kembali (Rencana)</th>
                <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {borrowings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-muted-foreground">Belum ada riwayat peminjaman arsip.</td>
                </tr>
              ) : (
                borrowings.map((item) => (
                  <tr key={item.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle font-medium">{new Date(item.tanggalPinjam).toLocaleDateString('id-ID')}</td>
                    <td className="p-4 align-middle">
                      {item.peminjam}
                      <span className="block text-xs text-muted-foreground">{item.unit || '-'}</span>
                    </td>
                    <td className="p-4 align-middle">
                      <Link href={`/arsip/${item.archiveId}`} className="font-medium text-blue-600 hover:underline">
                        {item.nomorArsip}
                      </Link>
                      <span className="block text-xs text-muted-foreground truncate max-w-[300px]">{item.perihal}</span>
                    </td>
                    <td className="p-4 align-middle text-red-600 font-medium">{new Date(item.tanggalKembaliRencana).toLocaleDateString('id-ID')}</td>
                    <td className="p-4 align-middle text-center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${item.status === 'DIKEMBALIKAN' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-right">
                      {item.status === 'DIPINJAM' && (
                        <Button variant="outline" size="sm" className="mr-2">Terima Pengembalian</Button>
                      )}
                      <Button variant="ghost" size="sm">Detail</Button>
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
