import { auth } from '@/lib/auth';
import { db } from '@/db';
import { activityLogs } from '@/db/schema';

/**
 * Utilitas untuk mendapatkan User Session aktif.
 * Melempar error jika tidak terautentikasi.
 */
export async function requireAuth() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    throw new Error('Unauthorized: Anda harus login untuk melakukan aksi ini.');
  }

  return { ...session.user, id: session.user.id };
}

/**
 * Utilitas untuk mencatat log aktivitas sistem secara otomatis.
 */
export async function logActivity(params: {
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
}) {
  try {
    await db.insert(activityLogs).values({
      userId: params.userId,
      aksi: params.action,
      modul: params.entityType,
      detailAktivitas: `Entity ID: ${params.entityId || 'N/A'}. Details: ${JSON.stringify(params.details || {})}`,
      ipAddress: 'Unknown', // Di masa depan bisa diambil dari request headers middleware
      metadata: params.details,
    });
  } catch (error) {
    console.error('Failed to write activity log:', error);
  }
}
