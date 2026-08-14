'use server';

import { db } from '@/db';
import { dashboardWidgets, userDashboard, userPreferences, notifications } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// ==========================================
// User Preferences
// ==========================================
export async function getUserPreferences(userId: string) {
  try {
    const data = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId),
    });
    return { success: true, data };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { success: false, error: 'Gagal memuat preferensi' };
  }
}

export async function saveUserPreferences(userId: string, data: any) {
  try {
    const existing = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId),
    });

    if (existing) {
      await db
        .update(userPreferences)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(userPreferences.id, existing.id));
    } else {
      await db.insert(userPreferences).values({ userId, ...data });
    }
    revalidatePath('/dashboard');
    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { success: false, error: 'Gagal menyimpan preferensi' };
  }
}

// ==========================================
// Dashboard Widgets
// ==========================================
export async function getAvailableWidgets() {
  try {
    const data = await db.query.dashboardWidgets.findMany({
      where: eq(dashboardWidgets.isAktif, true),
    });
    return { success: true, data };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { success: false, error: 'Gagal memuat widget' };
  }
}

export async function getUserDashboard(userId: string) {
  try {
    const data = await db.query.userDashboard.findMany({
      where: and(eq(userDashboard.userId, userId), eq(userDashboard.isHidden, false)),
      with: {
        widget: true,
      },
      orderBy: (ud, { asc }) => [asc(ud.posisi)],
    });
    return { success: true, data };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { success: false, error: 'Gagal memuat dashboard' };
  }
}

// ==========================================
// Notifications
// ==========================================
export async function getUnreadNotifications(userId: string) {
  try {
    const data = await db.query.notifications.findMany({
      where: and(eq(notifications.userId, userId), eq(notifications.isRead, false)),
      orderBy: (n, { desc }) => [desc(n.createdAt)],
    });
    return { success: true, data };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { success: false, error: 'Gagal memuat notifikasi' };
  }
}

export async function markNotificationAsRead(id: string) {
  try {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
    revalidatePath('/dashboard');
    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { success: false, error: 'Gagal mengupdate notifikasi' };
  }
}

// ==========================================
// Global Search
// ==========================================
export async function globalSearch(query: string) {
  // Sementara mock pencarian karena tabel surat belum ada
  return {
    success: true,
    data: [
      { id: '1', title: 'Manajemen Pengguna', type: 'Menu', url: '/dashboard/iam/users' },
      { id: '2', title: 'Master Data Instansi', type: 'Menu', url: '/dashboard/master-data' },
    ].filter((item) => item.title.toLowerCase().includes(query.toLowerCase())),
  };
}
