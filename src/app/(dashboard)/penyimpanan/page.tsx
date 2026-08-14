import { db } from '@/db';
import { storageFiles } from '@/db/schema/system';
import { users } from '@/db/schema/iam';
import { eq, desc } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const metadata = {
  title: 'File Storage | PAWARTA',
};

export default async function StoragePage() {
  const files = await db
    .select({
      id: storageFiles.id,
      kategori: storageFiles.kategori,
      originalName: storageFiles.originalName,
      mimeType: storageFiles.mimeType,
      sizeBytes: storageFiles.sizeBytes,
      tanggalUpload: storageFiles.tanggalUpload,
      uploader: users.nama,
    })
    .from(storageFiles)
    .leftJoin(users, eq(storageFiles.uploadedBy, users.id))
    .orderBy(desc(storageFiles.tanggalUpload));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">File Storage Manager</h1>
          <p className="text-muted-foreground">Pusat pengelolaan file statis, dokumen, lampiran, dan aset aplikasi.</p>
        </div>
        <Button>Upload File Baru</Button>
      </div>

      <div className="flex gap-4 items-center">
        <form className="flex w-full max-w-sm items-center space-x-2">
          <Input name="q" placeholder="Cari nama file..." />
          <Button type="submit" variant="secondary">Cari</Button>
        </form>
        <select className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
          <option>Semua Kategori</option>
          <option>Dokumen</option>
          <option>Lampiran</option>
          <option>TTD & Paraf</option>
        </select>
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto max-h-[600px]">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b bg-muted/50 sticky top-0 z-10">
              <tr className="border-b transition-colors hover:bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Preview / Kategori</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nama File</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Ukuran</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Diunggah Oleh</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Tgl Upload</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {files.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-muted-foreground">Belum ada file di penyimpanan.</td>
                </tr>
              ) : (
                files.map((file) => (
                  <tr key={file.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle">
                      <span className="inline-flex items-center rounded-md px-2 py-1 text-[10px] font-semibold bg-primary/10 text-primary uppercase">
                        {file.kategori}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      <span className="font-medium block">{file.originalName}</span>
                      <span className="text-xs text-muted-foreground">{file.mimeType}</span>
                    </td>
                    <td className="p-4 align-middle">{file.sizeBytes}</td>
                    <td className="p-4 align-middle">{file.uploader || 'Sistem'}</td>
                    <td className="p-4 align-middle">{new Date(file.tanggalUpload).toLocaleDateString('id-ID')}</td>
                    <td className="p-4 align-middle text-right">
                      <Button variant="ghost" size="sm" className="mr-2 text-blue-600">Download</Button>
                      <Button variant="ghost" size="sm" className="text-red-600">Hapus</Button>
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
