import { db } from '@/db';
import { systemBackups, users } from '@/db/schema';
import { requireAuth } from '@/lib/server-action';
import { BackupClient } from './BackupClient';
import { HardDrive } from 'lucide-react';
import { eq, desc } from 'drizzle-orm';

export const metadata = {
  title: 'Backup & Restore Sistem | PAWARTA',
};

export default async function BackupPage() {
  await requireAuth('SISTEM_BACKUP');

  const backups = await db
    .select({
      id: systemBackups.id,
      tipe: systemBackups.tipe,
      filename: systemBackups.filename,
      path: systemBackups.path,
      sizeBytes: systemBackups.sizeBytes,
      status: systemBackups.status,
      tanggalMulai: systemBackups.tanggalMulai,
      aktorNama: users.nama,
    })
    .from(systemBackups)
    .leftJoin(users, eq(systemBackups.aktorId, users.id))
    .orderBy(desc(systemBackups.tanggalMulai))
    .limit(50);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
              Backup & Pemulihan Sistem
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Pencadangan snapshot basis data PostgreSQL, arsip digital berkas lampiran, dan ekspor data
            </p>
          </div>
        </div>
      </div>

      <BackupClient backups={backups} />
    </div>
  );
}
