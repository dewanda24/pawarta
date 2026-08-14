import { db } from '@/db';
import { eq, and } from 'drizzle-orm';
import { auth } from './index';
import { userRoles, rolePermissions, permissions } from '@/db/schema';

/**
 * Mengambil semua permission yang dimiliki seorang user berdasarkan Role-nya.
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  // Query untuk mendapatkan semua permission dari role yang dimiliki user
  const userPerms = await db
    .select({
      permissionName: permissions.nama,
    })
    .from(userRoles)
    .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(userRoles.userId, userId));

  // Menggunakan Set untuk menghilangkan duplikat jika user memiliki >1 role dengan permission yang sama
  const permissionSet = new Set(userPerms.map((p) => p.permissionName));
  return Array.from(permissionSet);
}

/**
 * Mengecek apakah user saat ini memiliki permission tertentu.
 * Bisa digunakan di Server Components.
 */
export async function hasPermission(permission: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;

  const userPerms = await getUserPermissions(session.user.id);
  return userPerms.includes(permission);
}

/**
 * Server Action Guard: Wajibkan permission tertentu.
 * Akan melempar error jika user tidak memiliki permission (atau belum login).
 */
export async function requirePermission(permission: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized: Anda harus login untuk mengakses fitur ini.');
  }

  const isAllowed = await hasPermission(permission);
  if (!isAllowed) {
    throw new Error(`Forbidden: Anda tidak memiliki akses (${permission}).`);
  }
}
