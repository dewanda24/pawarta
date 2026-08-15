'use server';

import { db } from '@/db';
import { masterKelas, masterPegawai } from '@/db/schema';
import { eq, isNull, and, ilike, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { requireAuth, logActivity } from '@/lib/server-action';

export async function getKelasList(params?: { search?: string; limit?: number; offset?: number }) {
  try {
    await requireAuth();

    const search = params?.search;
    const limit = params?.limit;
    const offset = params?.offset ?? 0;

    const whereClause = and(
      isNull(masterKelas.deletedAt),
      search ? ilike(masterKelas.namaKelas, `%${search}%`) : undefined,
    );

    const data = await db.query.masterKelas.findMany({
      where: whereClause,
      with: {
        waliKelas: true,
        siswa: true,
      },
      ...(limit ? { limit, offset } : {}),
      orderBy: [desc(masterKelas.tingkat), desc(masterKelas.kodeKelas)],
    });

    if (limit) {
      const totalRecordsResult = await db.$count(masterKelas, whereClause);
      const totalRecords = typeof totalRecordsResult === 'number' ? totalRecordsResult : 0;
      const totalPages = Math.ceil(totalRecords / limit);
      return {
        success: true,
        data,
        metadata: { totalRecords, totalPages, page: Math.floor(offset / limit) + 1, limit },
      };
    }

    return { success: true, data };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal mengambil data kelas';
    return { success: false, error: msg };
  }
}

export async function createKelas(data: typeof masterKelas.$inferInsert) {
  try {
    const user = await requireAuth();

    const [inserted] = await db
      .insert(masterKelas)
      .values({
        ...data,
        isAktif: data.isAktif ?? true,
      })
      .returning();

    await logActivity({
      userId: user.id!,
      action: 'CREATE',
      entityType: 'MASTER_KELAS',
      entityId: inserted.id,
      details: { namaKelas: data.namaKelas, kodeKelas: data.kodeKelas },
    });

    revalidatePath('/master/kelas');
    return { success: true, data: inserted };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal membuat data kelas';
    return { success: false, error: msg };
  }
}

export async function updateKelas(id: string, data: Partial<typeof masterKelas.$inferInsert>) {
  try {
    const user = await requireAuth();

    await db
      .update(masterKelas)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(masterKelas.id, id));

    await logActivity({
      userId: user.id!,
      action: 'UPDATE',
      entityType: 'MASTER_KELAS',
      entityId: id,
    });

    revalidatePath('/master/kelas');
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal mengubah data kelas';
    return { success: false, error: msg };
  }
}

export async function deleteKelas(id: string) {
  try {
    const user = await requireAuth();

    await db
      .update(masterKelas)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(masterKelas.id, id));

    await logActivity({
      userId: user.id!,
      action: 'DELETE',
      entityType: 'MASTER_KELAS',
      entityId: id,
    });

    revalidatePath('/master/kelas');
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal menghapus data kelas';
    return { success: false, error: msg };
  }
}
