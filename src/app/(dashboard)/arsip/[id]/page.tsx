import { db } from '@/db';
import { archives, archiveHistories, retentionPolicies } from '@/db/schema/archive';
import { users } from '@/db/schema/iam';
import { eq, desc } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
  title: 'Detail Arsip | PAWARTA',
};

export default async function DetailArsipPage({ params }: { params: { id: string } }) {
  const [archive] = await db
    .select({
      id: archives.id,
      nomorArsip: archives.nomorArsip,
      perihal: archives.perihal,
      tahun: archives.tahun,
      lokasiFisik: archives.lokasiFisik,
      folderVirtual: archives.folderVirtual,
      status: archives.status,
      tanggalRetensiBerakhir: archives.tanggalRetensiBerakhir,
      statusRetensi: archives.statusRetensi,
      retensi: retentionPolicies.nama,
    })
    .from(archives)
    .leftJoin(retentionPolicies, eq(archives.retentionPolicyId, retentionPolicies.id))
    .where(eq(archives.id, params.id));

  if (!archive) {
    notFound();
  }

  const histories = await db
    .select({
      id: archiveHistories.id,
      aksi: archiveHistories.aksi,
      deskripsi: archiveHistories.deskripsi,
      tanggal: archiveHistories.tanggal,
      aktor: users.nama,
    })
    .from(archiveHistories)
    .leftJoin(users, eq(archiveHistories.aktorId, users.id))
    .where(eq(archiveHistories.archiveId, archive.id))
    .orderBy(desc(archiveHistories.tanggal));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Detail Arsip Digital</h1>
          <p className="text-muted-foreground">{archive.nomorArsip}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/arsip">
            <Button variant="outline">Kembali</Button>
          </Link>
          <Button variant="secondary">Pinjam Arsip</Button>
          <Button>Download Berkas</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-md border p-6 space-y-4 bg-card">
            <h2 className="text-lg font-semibold">Metadata Arsip</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Nomor Arsip</p>
                <p className="font-medium">{archive.nomorArsip}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tahun</p>
                <p className="font-medium">{archive.tahun}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Perihal / Judul Dokumen</p>
                <p className="font-medium">{archive.perihal}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status Arsip</p>
                <p className="font-medium">{archive.status}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Lokasi Fisik</p>
                <p className="font-medium">{archive.lokasiFisik || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Jadwal Retensi (JRA)</p>
                <p className="font-medium">{archive.retensi || 'Permanen'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tanggal Retensi Berakhir</p>
                <p className="font-medium">
                  {archive.tanggalRetensiBerakhir 
                    ? new Date(archive.tanggalRetensiBerakhir).toLocaleDateString('id-ID') 
                    : '-'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Status Retensi</p>
                <p className="font-medium">{archive.statusRetensi}</p>
              </div>
            </div>
          </div>

          <div className="rounded-md border p-6 space-y-4 bg-muted/30">
            <h2 className="text-lg font-semibold">Preview Dokumen (PDF/Gambar)</h2>
            <div className="aspect-video bg-muted flex items-center justify-center rounded border">
              <p className="text-muted-foreground">Document Viewer Placeholder</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-md border p-6 space-y-4">
            <h2 className="text-lg font-semibold">Riwayat Dokumen</h2>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {histories.map((history) => (
                <div key={history.id} className="relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-[-1rem] before:w-[2px] before:bg-muted last:before:hidden">
                  <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 border-primary bg-background"></div>
                  <div className="text-sm">
                    <p className="font-medium">{history.aksi}</p>
                    <p className="text-muted-foreground">{history.deskripsi}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(history.tanggal).toLocaleString('id-ID')} - {history.aktor || 'Sistem'}
                    </p>
                  </div>
                </div>
              ))}
              {histories.length === 0 && (
                <p className="text-sm text-muted-foreground">Belum ada riwayat.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
