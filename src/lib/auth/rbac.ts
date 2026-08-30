import { db } from '@/db';
import { eq } from 'drizzle-orm';
import { auth } from './index';
import { userRoles, rolePermissions, permissions } from '@/db/schema';
import { ROLES, type RoleName } from './permissions';

/**
 * Mengambil semua permission yang dimiliki seorang user berdasarkan Role-nya.
 * Mendukung multi-role: jika user memiliki lebih dari 1 role, permission digabung.
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  const userPerms = await db
    .select({ permissionName: permissions.nama })
    .from(userRoles)
    .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(userRoles.userId, userId));

  // Set otomatis menghilangkan duplikat dari multi-role
  return Array.from(new Set(userPerms.map((p) => p.permissionName)));
}

/**
 * Mengambil semua nama role yang dimiliki user.
 */
export async function getUserRoles(userId: string): Promise<RoleName[]> {
  const data = await db.query.userRoles.findMany({
    where: eq(userRoles.userId, userId),
    with: { role: true },
  });
  return data.map((ur) => ur.role.namaRole as RoleName);
}

/**
 * Cek apakah user saat ini adalah Super Admin.
 * Super Admin bypass semua pengecekan permission.
 */
export async function isSuperAdmin(userId?: string): Promise<boolean> {
  const session = await auth();
  const id = userId ?? session?.user?.id;
  if (!id) return false;

  const roles = await getUserRoles(id);
  return roles.includes(ROLES.SUPER_ADMIN);
}

/**
 * Mengecek apakah user saat ini memiliki permission tertentu.
 * Super Admin selalu lolos tanpa pengecekan permission.
 * Bisa digunakan di Server Components.
 */
export async function hasPermission(permission: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;

  // Super Admin bypass
  if (await isSuperAdmin(session.user.id)) return true;

  const userPerms = await getUserPermissions(session.user.id);
  return userPerms.includes(permission);
}

/**
 * Server Action Guard: Wajibkan permission tertentu.
 * Melempar error jika user tidak login atau tidak punya permission.
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

