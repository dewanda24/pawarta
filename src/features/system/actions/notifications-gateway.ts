'use server';

import { db } from '@/db';
import { notificationChannels, notificationLogs } from '@/db/schema/system';
import { eq, desc, and } from 'drizzle-orm';
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

export async function sendAutomatedWhatsApp({
  recipient,
  recipientName,
  title,
  message,
  fileUrl,
}: {
  recipient: string;
  recipientName?: string;
  title?: string;
  message: string;
  fileUrl?: string;
}) {
  try {
    const channel = await db.query.notificationChannels.findFirst({
      where: and(eq(notificationChannels.tipe, 'WHATSAPP'), eq(notificationChannels.isAktif, true)),
      orderBy: [desc(notificationChannels.isDefault), desc(notificationChannels.createdAt)],
    });

    if (!channel) return { success: false, error: 'Tidak ada kanal WhatsApp aktif' };

    const apiKey = (channel.konfigurasi as any)?.apiKey;
    let status = 'SENT';
    let responsePayload: any = { message: 'Message sent' };

    if (apiKey && channel.provider === 'FONNTE') {
      try {
        const formData = new URLSearchParams();
        const formattedRecipient = recipient.replace(/[^0-9]/g, '').startsWith('0')
          ? `62${recipient.replace(/[^0-9]/g, '').slice(1)}`
          : recipient.replace(/[^0-9]/g, '');

        formData.append('target', formattedRecipient);
        formData.append('message', message);
        if (fileUrl) {
          formData.append('url', fileUrl);
        }

        const res = await fetch('https://api.fonnte.com/send', {
          method: 'POST',
          headers: {
            Authorization: apiKey,
          },
          body: formData,
        });
        const resJson = await res.json();
        responsePayload = resJson;
        if (!res.ok || resJson.status === false) {
          status = 'FAILED';
        }
      } catch (err: any) {
        status = 'FAILED';
        responsePayload = { error: err.message };
      }
    }

    // Insert log
    await db.insert(notificationLogs).values({
      channelId: channel.id,
      recipient,
      recipientName: recipientName || 'Admin / Wali',
      judul: title || 'Notifikasi Persetujuan Orang Tua',
      pesan: message,
      status: status as any,
      sentAt: new Date(),
      responsePayload,
    });

    return { success: status === 'SENT' };
  } catch (error) {
    console.error('Error sending automated WhatsApp:', error);
    return { success: false, error };
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
