'use server';

import { db } from '@/db';
import { menus, permissions } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { getUserPermissions, isSuperAdmin } from '@/lib/auth/rbac';
import { auth } from '@/lib/auth';

export interface MenuItem {
  id: string;
  nama: string;
  icon?: string | null;
  route?: string | null;
  parentId?: string | null;
  permissionName?: string | null;
  children: MenuItem[];
}

/**
 * Mengambil menu dari database yang sesuai dengan hak akses (permission) user saat ini.
 * Super Admin mendapat akses ke semua menu.
 * Menu grup hanya tampil jika memiliki minimal 1 sub-menu yang diizinkan (atau memiliki route sendiri).
 */
export async function getAuthorizedMenus(): Promise<MenuItem[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const userId = session.user.id;
  const isAdmin = await isSuperAdmin(userId);
  const userPerms = isAdmin ? [] : await getUserPermissions(userId);

  // Ambil semua menu yang aktif diurutkan berdasarkan urutan
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

  // Cek apakah suatu menu memiliki izin
  const isMenuAllowed = (menu: { permissionName?: string | null }) => {
    if (isAdmin) return true;
    if (!menu.permissionName) return true;
    return userPerms.includes(menu.permissionName);
  };


  // Buat map semua menu dengan array children kosong
  const menuMap = new Map<string, MenuItem>();
  allMenus.forEach((menu) => {
    menuMap.set(menu.id, {
      ...menu,
      children: [],
    });
  });

  // Susun struktur tree
  const rootMenus: MenuItem[] = [];

  allMenus.forEach((menu) => {
    const currentItem = menuMap.get(menu.id)!;
    if (menu.parentId) {
      const parent = menuMap.get(menu.parentId);
      if (parent) {
        parent.children.push(currentItem);
      }
    } else {
      rootMenus.push(currentItem);
    }
  });

  // Filter root menu dan children berdasarkan permission
  const filterAuthorized = (items: MenuItem[]): MenuItem[] => {
    return items
      .map((item) => {
        const filteredChildren = filterAuthorized(item.children);
        const itemAllowed = isMenuAllowed(item);

        // Jika menu punya anak: tampilkan jika anak-anaknya ada yang diizinkan ATAU menu induknya diizinkan
        if (item.children.length > 0) {
          if (filteredChildren.length > 0) {
            return { ...item, children: filteredChildren };
          }
          // Jika tidak ada anak yang lolos tapi induk punya route dan lolos permission
          if (itemAllowed && item.route) {
            return { ...item, children: [] };
          }
          return null;
        }

        // Jika menu tunggal (tidak punya anak)
        return itemAllowed ? item : null;
      })
      .filter((item): item is MenuItem => item !== null);
  };

  return filterAuthorized(rootMenus);
}

