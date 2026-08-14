import { db } from '@/db';
import { archives, archiveCategories, retentionPolicies } from '@/db/schema/archive';
import { eq, desc, ilike, sql } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export const metadata = {
  title: 'Arsip Digital | PAWARTA',
};

export default async function ArsipDigitalPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || '';

  // Untuk FTS Drizzle, kita akan gunakan ilike sederhana pada searchVector
  // Dalam production asli, bisa gunakan sql`to_tsvector('indonesian', ${archives.searchVector}) @@ plainto_tsquery('indonesian', ${query})`
  const baseQuery = db
    .select({
      id: archives.id,
      nomorArsip: archives.nomorArsip,
      perihal: archives.perihal,
      kategori: archiveCategories.nama,
      tahun: archives.tahun,
      status: archives.status,
      lokasiFisik: archives.lokasiFisik,
      retensi: retentionPolicies.nama,
    })
    .from(archives)
    .leftJoin(archiveCategories, eq(archives.kategoriId, archiveCategories.id))
    .leftJoin(retentionPolicies, eq(archives.retentionPolicyId, retentionPolicies.id));

  const listArsip = await (query
    ? baseQuery.where(ilike(archives.searchVector, `%${query}%`)).orderBy(desc(archives.createdAt))
    : baseQuery.orderBy(desc(archives.createdAt)));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Arsip Digital</h1>
          <p className="text-muted-foreground">Penyimpanan dan pencarian dokumen digital terpusat.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Advanced Filter</Button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <form className="flex w-full max-w-sm items-center space-x-2">
          <Input name="q" defaultValue={query} placeholder="Pencarian Full-Text (Nomor, Perihal, dll)..." />
          <Button type="submit">Cari</Button>
        </form>
        <select className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
          <option>Semua Tahun</option>
          <option>2026</option>
          <option>2025</option>
        </select>
        <select className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
          <option>Semua Kategori</option>
          <option>Surat Masuk</option>
          <option>Surat Keluar</option>
        </select>
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">No. Arsip</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Perihal</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Kategori</th>
                <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Tahun</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Lokasi</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Retensi</th>
                <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {listArsip.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-muted-foreground">Tidak ada dokumen arsip ditemukan.</td>
                </tr>
              ) : (
                listArsip.map((item) => (
                  <tr key={item.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle font-medium">{item.nomorArsip}</td>
                    <td className="p-4 align-middle">{item.perihal}</td>
                    <td className="p-4 align-middle">{item.kategori || 'Umum'}</td>
                    <td className="p-4 align-middle text-center">{item.tahun}</td>
                    <td className="p-4 align-middle">{item.lokasiFisik || '-'}</td>
                    <td className="p-4 align-middle">{item.retensi || 'Permanen'}</td>
                    <td className="p-4 align-middle text-center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${item.status === 'AKTIF' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <Link href={`/arsip/${item.id}`}>
                        <Button variant="outline" size="sm">Buka</Button>
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
