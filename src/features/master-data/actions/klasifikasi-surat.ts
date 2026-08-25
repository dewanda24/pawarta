'use server';

import { db } from '@/db';
import { masterKlasifikasiSurat } from '@/db/schema';
import { eq, and, ilike, desc, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { requireAuth, logActivity } from '@/lib/server-action';

export interface KlasifikasiSuratInput {
  kode: string;
  nama: string;
  deskripsi?: string | null;
  level?: number;
  parentId?: string | null;
  isAktif?: boolean;
}

export async function getKlasifikasiSuratList(params?: { search?: string; limit?: number; offset?: number }) {
  try {
    await requireAuth('MASTER_SEKOLAH_READ');

    const search = params?.search;
    const limit = params?.limit;
    const offset = params?.offset ?? 0;

    const whereClause = search
      ? or(
          ilike(masterKlasifikasiSurat.kode, `%${search}%`),
          ilike(masterKlasifikasiSurat.nama, `%${search}%`),
        )
      : undefined;

    const data = await db.query.masterKlasifikasiSurat.findMany({
      where: whereClause,
      ...(limit ? { limit, offset } : {}),
      orderBy: [masterKlasifikasiSurat.kode],
    });

    if (limit) {
      const totalRecordsResult = await db.$count(masterKlasifikasiSurat, whereClause);
      const totalRecords = typeof totalRecordsResult === 'number' ? totalRecordsResult : 0;
      const totalPages = Math.ceil(totalRecords / limit);
      return { success: true, data, metadata: { totalRecords, totalPages, page: Math.floor(offset / limit) + 1, limit } };
    }

    return { success: true, data };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal mengambil data klasifikasi';
    return { success: false, error: msg };
  }
}

export async function createKlasifikasiSurat(data: KlasifikasiSuratInput) {
  try {
    const user = await requireAuth('MASTER_SEKOLAH_CREATE');

    const existing = await db.query.masterKlasifikasiSurat.findFirst({
      where: eq(masterKlasifikasiSurat.kode, data.kode),
    });

    if (existing) {
      return { success: false, error: `Kode klasifikasi '${data.kode}' sudah digunakan.` };
    }

    const [inserted] = await db
      .insert(masterKlasifikasiSurat)
      .values({
        kode: data.kode,
        nama: data.nama,
        deskripsi: data.deskripsi || null,
        level: data.level || 1,
        parentId: data.parentId || null,
        isAktif: data.isAktif !== undefined ? data.isAktif : true,
      })
      .returning();

    await logActivity({
      userId: user.id!,
      action: 'CREATE',
      entityType: 'MASTER_KLASIFIKASI_SURAT',
      entityId: inserted.id,
      details: { kode: data.kode, nama: data.nama },
    });

    revalidatePath('/master/klasifikasi');
    return { success: true, data: inserted };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal membuat klasifikasi surat';
    return { success: false, error: msg };
  }
}

export async function updateKlasifikasiSurat(id: string, data: Partial<KlasifikasiSuratInput>) {
  try {
    const user = await requireAuth('MASTER_SEKOLAH_UPDATE');

    if (data.kode) {
      const existing = await db.query.masterKlasifikasiSurat.findFirst({
        where: and(eq(masterKlasifikasiSurat.kode, data.kode)),
      });
      if (existing && existing.id !== id) {
        return { success: false, error: `Kode klasifikasi '${data.kode}' sudah digunakan oleh data lain.` };
      }
    }

    await db
      .update(masterKlasifikasiSurat)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(masterKlasifikasiSurat.id, id));

    await logActivity({
      userId: user.id!,
      action: 'UPDATE',
      entityType: 'MASTER_KLASIFIKASI_SURAT',
      entityId: id,
    });

    revalidatePath('/master/klasifikasi');
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal mengubah klasifikasi surat';
    return { success: false, error: msg };
  }
}

export async function deleteKlasifikasiSurat(id: string) {
  try {
    const user = await requireAuth('MASTER_SEKOLAH_DELETE');

    await db
      .delete(masterKlasifikasiSurat)
      .where(eq(masterKlasifikasiSurat.id, id));

    await logActivity({
      userId: user.id!,
      action: 'DELETE',
      entityType: 'MASTER_KLASIFIKASI_SURAT',
      entityId: id,
    });

    revalidatePath('/master/klasifikasi');
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal menghapus klasifikasi surat';
    return { success: false, error: msg };
  }
}
