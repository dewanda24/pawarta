import { auth } from '@/lib/auth';
import { db } from '@/db';
import { activityLogs } from '@/db/schema';

/**
 * Utilitas untuk mendapatkan User Session aktif.
 * Melempar error jika tidak terautentikasi.
 */
export async function requireAuth(requiredPermission?: string) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    throw new Error('Unauthorized: Anda harus login untuk melakukan aksi ini.');
  }

  const userId = session.user.id;

  if (requiredPermission) {
    // Cek permission dari userRoles -> roles -> rolePermissions -> permissions
    const hasAccess = await db.query.userRoles.findFirst({
      where: (ur, { eq }) => eq(ur.userId, userId),
      with: {
        role: {
          with: {
            rolePermissions: {
              with: {
                permission: true
              }
            }
          }
        }
      }
    });

    if (!hasAccess) {
      throw new Error(`Forbidden: Anda tidak memiliki role.`);
    }

    // Karena Drizzle relations kadang mengembalikan array, kita cek apakah ada permission yang cocok
    const permissions = hasAccess.role.rolePermissions.map((rp: any) => rp.permission?.nama);
    if (!permissions.includes(requiredPermission)) {
       throw new Error(`Forbidden: Anda tidak memiliki akses untuk ${requiredPermission}.`);
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
