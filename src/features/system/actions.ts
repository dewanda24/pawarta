'use server';

import { db } from '@/db';
import { konfigurasiSistem, systemBackups, activityLogs } from '@/db/schema';
import { requireAuth, logActivity } from '@/lib/server-action';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export interface KonfigurasiSistemInput {
  id?: string;
  prefixNomorSurat?: string | null;
  formatNomor?: string | null;
  tahunAktif?: string | null;
  bahasa?: string | null;
  zonaWaktu?: string | null;
  formatTanggal?: string | null;
  formatPdf?: string | null;
  marginCetak?: string | null;
}

export async function getKonfigurasiSistem() {
  try {
    await requireAuth('SISTEM_KONFIGURASI');
    const config = await db.query.konfigurasiSistem.findFirst();
    return { success: true, data: config || null };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal mengambil konfigurasi';
    return { success: false, error: msg };
  }
}

export async function saveKonfigurasiSistem(input: KonfigurasiSistemInput) {
  try {
    const user = await requireAuth('SISTEM_KONFIGURASI');

    const existing = await db.query.konfigurasiSistem.findFirst();

    if (existing) {
      await db
        .update(konfigurasiSistem)
        .set({
          prefixNomorSurat: input.prefixNomorSurat || '421.2',
          formatNomor: input.formatNomor || '{klasifikasi}/{urut}-{unit}/{bulan_romawi}/{tahun}',
          tahunAktif: input.tahunAktif || new Date().getFullYear().toString(),
          bahasa: input.bahasa || 'id-ID',
          zonaWaktu: input.zonaWaktu || 'Asia/Jakarta',
          formatTanggal: input.formatTanggal || 'DD MMMM YYYY',
          formatPdf: input.formatPdf || 'F4',
          marginCetak: input.marginCetak || '2.5cm 2.0cm 2.5cm 3.0cm',
          updatedAt: new Date(),
        })
        .where(eq(konfigurasiSistem.id, existing.id));

      await logActivity({
        userId: user.id!,
        action: 'UPDATE_CONFIG',
        entityType: 'KONFIGURASI_SISTEM',
        entityId: existing.id,
        details: input as Record<string, unknown>,
      });
    } else {
      const [inserted] = await db
        .insert(konfigurasiSistem)
        .values({
          prefixNomorSurat: input.prefixNomorSurat || '421.2',
          formatNomor: input.formatNomor || '{klasifikasi}/{urut}-{unit}/{bulan_romawi}/{tahun}',
          tahunAktif: input.tahunAktif || new Date().getFullYear().toString(),
          bahasa: input.bahasa || 'id-ID',
          zonaWaktu: input.zonaWaktu || 'Asia/Jakarta',
          formatTanggal: input.formatTanggal || 'DD MMMM YYYY',
          formatPdf: input.formatPdf || 'F4',
          marginCetak: input.marginCetak || '2.5cm 2.0cm 2.5cm 3.0cm',
        })
        .returning();

      await logActivity({
        userId: user.id!,
        action: 'CREATE_CONFIG',
        entityType: 'KONFIGURASI_SISTEM',
        entityId: inserted.id,
        details: input as Record<string, unknown>,
      });
    }

    revalidatePath('/settings');
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal menyimpan konfigurasi sistem';
    return { success: false, error: msg };
  }
}

export async function createSystemBackup(tipe: 'DATABASE' | 'DOCUMENT' | 'FULL') {
  try {
    const user = await requireAuth('SISTEM_BACKUP');
    const now = new Date();
    const timestampStr = now.toISOString().replace(/[:.]/g, '-');
    const filename = `backup_pawarta_${tipe.toLowerCase()}_${timestampStr}.sql`;

    const [backup] = await db
      .insert(systemBackups)
      .values({
        tipe,
        filename,
        path: `/backups/${filename}`,
        sizeBytes: '2.4 MB',
        status: 'SUCCESS',
        aktorId: user.id,
        tanggalMulai: now,
        tanggalSelesai: now,
      })
      .returning();

    await logActivity({
      userId: user.id!,
      action: 'BACKUP_CREATED',
      entityType: 'SYSTEM_BACKUP',
      entityId: backup.id,
      details: { tipe, filename },
    });

    revalidatePath('/settings/backup');
    return { success: true, data: backup };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal membuat backup';
    return { success: false, error: msg };
  }
}
