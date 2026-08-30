import { auth } from '@/lib/auth';
import { db } from '@/db';
import { activityLogs } from '@/db/schema';
import { isSuperAdmin, getUserPermissions } from '@/lib/auth/rbac';

/**
 * Utilitas untuk mendapatkan User Session aktif.
 * Melempar error jika tidak terautentikasi atau tidak punya permission.
 * Super Admin bypass semua pengecekan permission.
 */
export async function requireAuth(requiredPermission?: string) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    throw new Error('Unauthorized: Anda harus login untuk melakukan aksi ini.');
  }

  const userId = session.user.id;

  if (requiredPermission) {
    // Super Admin bypass semua permission
    const isAdmin = await isSuperAdmin(userId);
    if (!isAdmin) {
      const userPerms = await getUserPermissions(userId);
      if (!userPerms.includes(requiredPermission)) {
        throw new Error(`Forbidden: Anda tidak memiliki akses untuk ${requiredPermission}.`);
      }
    }
  }

  return { ...session.user, id: userId };
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
