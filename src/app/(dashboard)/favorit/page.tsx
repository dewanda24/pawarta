import { db } from '@/db';
import { documentFavorites, documentRecents, archives } from '@/db/schema/archive';
import { requireAuth } from '@/lib/server-action';
import { eq, desc } from 'drizzle-orm';
import Link from 'next/link';

export const metadata = {
  title: 'Favorit & Terbaru | PAWARTA',
};

export default async function FavoritPage() {
  const user = await requireAuth();

  const favorites = await db
    .select({
      id: archives.id,
      nomorArsip: archives.nomorArsip,
      perihal: archives.perihal,
      tanggalDitambahkan: documentFavorites.tanggalDitambahkan,
    })
    .from(documentFavorites)
    .innerJoin(archives, eq(documentFavorites.archiveId, archives.id))
    .where(eq(documentFavorites.userId, user.id))
    .orderBy(desc(documentFavorites.tanggalDitambahkan));

  const recents = await db
    .select({
      id: archives.id,
      nomorArsip: archives.nomorArsip,
      perihal: archives.perihal,
      tanggalAkses: documentRecents.tanggalAkses,
    })
    .from(documentRecents)
    .innerJoin(archives, eq(documentRecents.archiveId, archives.id))
    .where(eq(documentRecents.userId, user.id))
    .orderBy(desc(documentRecents.tanggalAkses))
    .limit(10); // Ambil 10 terakhir

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dokumen Favorit & Terbaru</h1>
        <p className="text-muted-foreground">Akses cepat ke dokumen penting Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            ⭐ Dokumen Favorit
          </h2>
          <div className="rounded-md border p-0">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <tbody className="[&_tr:last-child]:border-0">
                  {favorites.length === 0 ? (
                    <tr>
                      <td className="p-4 text-center text-muted-foreground">Belum ada dokumen favorit.</td>
                    </tr>
                  ) : (
                    favorites.map((item) => (
                      <tr key={item.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle">
                          <Link href={`/arsip/${item.id}`} className="font-medium text-blue-600 hover:underline block">
                            {item.nomorArsip}
                          </Link>
                          <span className="text-xs text-muted-foreground truncate max-w-[250px] inline-block">{item.perihal}</span>
                        </td>
                        <td className="p-4 align-middle text-right text-xs text-muted-foreground">
                          {new Date(item.tanggalDitambahkan).toLocaleDateString('id-ID')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            🕒 Terakhir Diakses
          </h2>
          <div className="rounded-md border p-0">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <tbody className="[&_tr:last-child]:border-0">
                  {recents.length === 0 ? (
                    <tr>
                      <td className="p-4 text-center text-muted-foreground">Belum ada riwayat akses dokumen.</td>
                    </tr>
                  ) : (
                    recents.map((item) => (
                      <tr key={item.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle">
                          <Link href={`/arsip/${item.id}`} className="font-medium text-blue-600 hover:underline block">
                            {item.nomorArsip}
                          </Link>
                          <span className="text-xs text-muted-foreground truncate max-w-[250px] inline-block">{item.perihal}</span>
                        </td>
                        <td className="p-4 align-middle text-right text-xs text-muted-foreground">
                          {new Date(item.tanggalAkses).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
