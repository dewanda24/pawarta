import { Metadata } from 'next';
import { db } from '@/db';
import { outgoingLetters } from '@/db/schema/outgoing-letter';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { desc, eq, isNull } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Surat Keluar | PAWARTA',
};

export default async function SuratKeluarPage() {
  const letters = await db
    .select()
    .from(outgoingLetters)
    .where(isNull(outgoingLetters.deletedAt))
    .orderBy(desc(outgoingLetters.createdAt));

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Surat Keluar</h2>
        <div className="flex items-center space-x-2">
          <Link href="/surat-keluar/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Buat Surat
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-md border p-4 bg-white shadow-sm">
        {/* Placeholder for complex DataTable */}
        <p className="text-sm text-muted-foreground mb-4">
          Menampilkan {letters.length} data surat keluar.
        </p>

        {letters.length === 0 ? (
          <div className="text-center py-10">Belum ada surat keluar. Silakan buat draft baru.</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-muted">
              <tr>
                <th className="p-3">Perihal</th>
                <th className="p-3">Tujuan</th>
                <th className="p-3">Status</th>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {letters.map((l) => (
                <tr key={l.id} className="border-b">
                  <td className="p-3 font-medium">{l.perihal}</td>
                  <td className="p-3">{l.tujuanSurat}</td>
                  <td className="p-3">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                      {l.status}
                    </span>
                  </td>
                  <td className="p-3">{l.createdAt?.toLocaleDateString()}</td>
                  <td className="p-3">
                    <Link href={`/surat-keluar/${l.id}`}>
                      <Button variant="outline" size="sm">
                        Detail
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
