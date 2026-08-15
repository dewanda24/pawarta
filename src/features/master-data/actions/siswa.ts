'use server';

import { db } from '@/db';
import { masterSiswa, masterKelas } from '@/db/schema';
import { eq, isNull, and, ilike, desc, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { requireAuth, logActivity } from '@/lib/server-action';

export async function getSiswaList(params?: {
  search?: string;
  kelasId?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    await requireAuth();

    const search = params?.search;
    const kelasId = params?.kelasId;
    const limit = params?.limit;
    const offset = params?.offset ?? 0;

    const whereClause = and(
      isNull(masterSiswa.deletedAt),
      kelasId ? eq(masterSiswa.kelasId, kelasId) : undefined,
      search
        ? or(
            ilike(masterSiswa.nama, `%${search}%`),
            ilike(masterSiswa.nisn, `%${search}%`),
            ilike(masterSiswa.nis, `%${search}%`),
          )
        : undefined,
    );

    const data = await db.query.masterSiswa.findMany({
      where: whereClause,
      with: {
        kelas: true,
      },
      ...(limit ? { limit, offset } : {}),
      orderBy: [desc(masterSiswa.createdAt)],
    });

    if (limit) {
      const totalRecordsResult = await db.$count(masterSiswa, whereClause);
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
    const msg = error instanceof Error ? error.message : 'Gagal mengambil data siswa';
    return { success: false, error: msg };
  }
}

export async function createSiswa(data: typeof masterSiswa.$inferInsert) {
  try {
    const user = await requireAuth();

    const [inserted] = await db
      .insert(masterSiswa)
      .values({
        ...data,
        isAktif: data.isAktif ?? true,
      })
      .returning();

    await logActivity({
      userId: user.id!,
      action: 'CREATE',
      entityType: 'MASTER_SISWA',
      entityId: inserted.id,
      details: { nama: data.nama, nisn: data.nisn },
    });

    revalidatePath('/master/siswa');
    return { success: true, data: inserted };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal membuat data siswa';
    return { success: false, error: msg };
  }
}

export async function updateSiswa(id: string, data: Partial<typeof masterSiswa.$inferInsert>) {
  try {
    const user = await requireAuth();

    await db
      .update(masterSiswa)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(masterSiswa.id, id));

    await logActivity({
      userId: user.id!,
      action: 'UPDATE',
      entityType: 'MASTER_SISWA',
      entityId: id,
    });

    revalidatePath('/master/siswa');
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal mengubah data siswa';
    return { success: false, error: msg };
  }
}

export async function deleteSiswa(id: string) {
  try {
    const user = await requireAuth();

    await db
      .update(masterSiswa)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(masterSiswa.id, id));

    await logActivity({
      userId: user.id!,
      action: 'DELETE',
      entityType: 'MASTER_SISWA',
      entityId: id,
    });

    revalidatePath('/master/siswa');
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal menghapus data siswa';
    return { success: false, error: msg };
  }
}
