'use server';

import { db } from '@/db';
import { notificationChannels, notificationLogs } from '@/db/schema/system';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { requireAuth, logActivity } from '@/lib/server-action';

export interface ChannelInput {
  id?: string;
  nama: string;
  tipe: string;
  provider?: string;
  konfigurasi?: any;
  isDefault?: boolean;
  isAktif?: boolean;
}

export async function getNotificationChannels() {
  try {
    await requireAuth('SYSTEM_CONFIG_READ');
    const channels = await db.query.notificationChannels.findMany({
      orderBy: [desc(notificationChannels.isDefault), desc(notificationChannels.createdAt)],
    });
    return { success: true, data: channels };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal mengambil kanal notifikasi';
    return { success: false, error: msg };
  }
}

export async function saveNotificationChannel(input: ChannelInput) {
  try {
    const user = await requireAuth('SYSTEM_CONFIG_UPDATE');

    if (input.isDefault) {
      await db.update(notificationChannels).set({ isDefault: false });
    }

    if (input.id) {
      await db
        .update(notificationChannels)
        .set({
          nama: input.nama,
          tipe: input.tipe,
          provider: input.provider || null,
          konfigurasi: input.konfigurasi || {},
          isDefault: input.isDefault ?? false,
          isAktif: input.isAktif ?? true,
          updatedAt: new Date(),
        })
        .where(eq(notificationChannels.id, input.id));

      await logActivity({
        userId: user.id!,
        action: 'UPDATE_NOTIFICATION_CHANNEL',
        entityType: 'notification_channels',
        entityId: input.id,
        details: { nama: input.nama },
      });
    } else {
      const [inserted] = await db
        .insert(notificationChannels)
        .values({
          nama: input.nama,
          tipe: input.tipe,
          provider: input.provider || 'FONNTE',
          konfigurasi: input.konfigurasi || {},
          isDefault: input.isDefault ?? false,
          isAktif: input.isAktif ?? true,
        })
        .returning();

      await logActivity({
        userId: user.id!,
        action: 'CREATE_NOTIFICATION_CHANNEL',
        entityType: 'notification_channels',
        entityId: inserted.id,
        details: { nama: input.nama },
      });
    }

    revalidatePath('/settings/notifikasi');
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal menyimpan gateway notifikasi';
    return { success: false, error: msg };
  }
}

export async function deleteNotificationChannel(id: string) {
  try {
    const user = await requireAuth('SYSTEM_CONFIG_UPDATE');
    await db.delete(notificationChannels).where(eq(notificationChannels.id, id));

    await logActivity({
      userId: user.id!,
      action: 'DELETE_NOTIFICATION_CHANNEL',
      entityType: 'notification_channels',
      entityId: id,
    });

    revalidatePath('/settings/notifikasi');
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal menghapus kanal';
    return { success: false, error: msg };
  }
}

export async function sendTestMessage(channelId: string, recipient: string, pesan: string) {
  try {
    await requireAuth('SYSTEM_CONFIG_UPDATE');

    const channel = await db.query.notificationChannels.findFirst({
      where: eq(notificationChannels.id, channelId),
    });

    if (!channel) return { success: false, error: 'Kanal tidak ditemukan' };

    // Record to notification logs
    const [log] = await db
      .insert(notificationLogs)
      .values({
        channelId: channel.id,
        recipient,
        recipientName: 'Penerima Uji Coba',
        judul: 'Tes Notifikasi Gateway PAWARTA',
        pesan,
        status: 'SENT',
        sentAt: new Date(),
        responsePayload: { status: 200, message: 'Message queued and delivered (Simulation)' },
      })
      .returning();

    revalidatePath('/settings/notifikasi');
    return { success: true, data: log };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal mengirim pesan uji coba';
    return { success: false, error: msg };
  }
}

export async function getNotificationLogs() {
  try {
    await requireAuth('SYSTEM_CONFIG_READ');
    const logs = await db.query.notificationLogs.findMany({
      orderBy: [desc(notificationLogs.createdAt)],
      limit: 100,
    });
    return { success: true, data: logs };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal mengambil riwayat notifikasi';
    return { success: false, error: msg };
  }
}
