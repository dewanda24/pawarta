'use server';

import { db } from '@/db';
import { notifications } from '@/db/schema/workspace';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '@/lib/server-action';

export async function getUserNotifications() {
  try {
    const user = await requireAuth();
    const data = await db.query.notifications.findMany({
      where: eq(notifications.userId, user.id),
      orderBy: [desc(notifications.createdAt)],
      limit: 10,
    });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const user = await requireAuth();
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, user.id));
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
