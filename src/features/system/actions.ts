'use server';

import { db } from '@/db';
import { systemBackups, storageFiles } from '@/db/schema/system';
import { requireAuth, logActivity } from '@/lib/server-action';
import { revalidatePath } from 'next/cache';

// ==========================================
// Backup & Restore
// ==========================================
export async function backupSystem(tipe: string) {
  const user = await requireAuth();

  try {
    // Simulasi proses backup (karena tidak ada akses shell pg_dump real di container demo)
    const filename = `backup_${tipe.toLowerCase()}_${Date.now()}.sql`;

    const [backup] = await db
      .insert(systemBackups)
      .values({
        tipe,
        filename,
        path: `/backups/${filename}`,
        sizeBytes: '25 MB',
        status: 'SUCCESS', // Simulasi langsung sukses
        aktorId: user.id,
        tanggalSelesai: new Date(),
      })
      .returning();

    await logActivity({
      userId: user.id,
      action: 'SYSTEM_BACKUP',
      entityType: 'system_backups',
      entityId: backup.id,
      details: { tipe, filename },
    });

    revalidatePath('/sistem/backup');
    return { success: true, backup };
  } catch (error: any) {
    return { error: 'Gagal melakukan backup', message: error.message };
  }
}

// ==========================================
// Storage Upload (Simulated)
// ==========================================
export async function uploadStorageFile(data: {
  originalName: string;
  kategori: string;
  mimeType: string;
  sizeBytes: string;
}) {
  const user = await requireAuth();

  try {
    // Simulasi upload file
    const [file] = await db
      .insert(storageFiles)
      .values({
        kategori: data.kategori,
        originalName: data.originalName,
        path: `/storage/uploads/${Date.now()}_${data.originalName}`,
        mimeType: data.mimeType,
        sizeBytes: data.sizeBytes,
        uploadedBy: user.id,
      })
      .returning();

    revalidatePath('/penyimpanan');
    return { success: true, file };
  } catch (error: any) {
    return { error: 'Gagal mengupload file', message: error.message };
  }
}
