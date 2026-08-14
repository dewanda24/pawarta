'use server';

import { db } from '@/db';
import { menus, permissions } from '@/db/schema';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { eq, isNull, and, asc } from 'drizzle-orm';
import { getUserPermissions } from '@/lib/auth/rbac';
import { auth } from '@/lib/auth';

/**
 * Mengambil menu dari database yang sesuai dengan hak akses (permission) user saat ini.
 */
export async function getAuthorizedMenus() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const userPerms = await getUserPermissions(session.user.id);

  // Ambil semua menu yang aktif
  const allMenus = await db
    .select({
      id: menus.id,
      nama: menus.nama,
      icon: menus.icon,
      route: menus.route,
      parentId: menus.parentId,
      permissionName: permissions.nama,
    })
    .from(menus)
    .leftJoin(permissions, eq(menus.permissionId, permissions.id))
    .where(eq(menus.isAktif, true))
    .orderBy(asc(menus.urutan));

  // Filter berdasarkan permission
  const authorizedMenus = allMenus.filter((menu) => {
    // Jika tidak butuh permission, semua boleh akses
    if (!menu.permissionName) return true;
    // Jika butuh, cek apakah user punya
    return userPerms.includes(menu.permissionName);
  });

  // Susun menjadi hirarki (Tree)
  const menuMap = new Map();
  const rootMenus: unknown[] = [];

  // Inisialisasi map
  authorizedMenus.forEach((menu) => {
    menuMap.set(menu.id, { ...menu, children: [] });
  });

  // Build tree
  authorizedMenus.forEach((menu) => {
    if (menu.parentId) {
      const parent = menuMap.get(menu.parentId);
      if (parent) {
        parent.children.push(menuMap.get(menu.id));
      }
    } else {
      rootMenus.push(menuMap.get(menu.id));
    }
  });

  return rootMenus;
}
