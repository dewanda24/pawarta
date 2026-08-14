import { db } from '@/db';
import { systemBackups } from '@/db/schema/system';
import { users } from '@/db/schema/iam';
import { eq, desc } from 'drizzle-orm';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Backup & Restore | PAWARTA',
};

export default async function BackupRestorePage() {
  const backups = await db
    .select({
      id: systemBackups.id,
      tipe: systemBackups.tipe,
      filename: systemBackups.filename,
      sizeBytes: systemBackups.sizeBytes,
      status: systemBackups.status,
      tanggalSelesai: systemBackups.tanggalSelesai,
      aktor: users.nama,
    })
    .from(systemBackups)
    .leftJoin(users, eq(systemBackups.aktorId, users.id))
    .orderBy(desc(systemBackups.tanggalMulai));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Backup & Restore</h1>
          <p className="text-muted-foreground">Kelola pencadangan dan pemulihan data sistem.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Backup Dokumen</Button>
          <Button>Backup Database (Full)</Button>
        </div>
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Waktu Backup</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Tipe</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nama File</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Ukuran</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Dieksekusi Oleh</th>
                <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {backups.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-muted-foreground">Belum ada riwayat backup.</td>
                </tr>
              ) : (
                backups.map((backup) => (
                  <tr key={backup.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle">{backup.tanggalSelesai ? new Date(backup.tanggalSelesai).toLocaleString('id-ID') : 'In Progress'}</td>
                    <td className="p-4 align-middle font-medium">{backup.tipe}</td>
                    <td className="p-4 align-middle text-muted-foreground font-mono text-xs">{backup.filename}</td>
                    <td className="p-4 align-middle">{backup.sizeBytes}</td>
                    <td className="p-4 align-middle">{backup.aktor || 'Sistem (Auto)'}</td>
                    <td className="p-4 align-middle text-center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        backup.status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                        backup.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {backup.status}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <Button variant="outline" size="sm" className="mr-2">Download</Button>
                      <Button variant="destructive" size="sm">Restore</Button>
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
