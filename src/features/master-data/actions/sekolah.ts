'use server';

import { db } from '@/db';
import { masterSekolah } from '@/db/schema';
import { eq, isNull, and, ilike, desc } from 'drizzle-orm';
import { InsertMasterSekolah } from '../types';
import { revalidatePath } from 'next/cache';
import { requireAuth, logActivity } from '@/lib/server-action';

export async function getSekolahList(params?: { search?: string; limit?: number; offset?: number }) {
  try {
    await requireAuth('MASTER_SEKOLAH_READ');
    
    const search = params?.search;
    const limit = params?.limit ?? 10;
    const offset = params?.offset ?? 0;

    const whereClause = and(
      isNull(masterSekolah.deletedAt),
      search ? ilike(masterSekolah.nama, `%${search}%`) : undefined,
    );

    const data = await db.query.masterSekolah.findMany({
      where: whereClause,
      with: {
        kepalaSekolah: true,
      },
      limit,
      offset,
      orderBy: [desc(masterSekolah.createdAt)],
    });

    const totalRecordsResult = await db.$count(masterSekolah, whereClause);
    const totalRecords = typeof totalRecordsResult === 'number' ? totalRecordsResult : 0;
    const totalPages = Math.ceil(totalRecords / limit);

    return { success: true, data, metadata: { totalRecords, totalPages, page: Math.floor(offset / limit) + 1, limit } };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal mengambil data sekolah' };
  }
}

export async function createSekolah(data: InsertMasterSekolah) {
  try {
    const user = await requireAuth('MASTER_SEKOLAH_CREATE');
    const [inserted] = await db.insert(masterSekolah).values(data).returning();

    await logActivity({
      userId: user.id!,
      action: 'CREATE',
      entityType: 'MASTER_SEKOLAH',
      entityId: inserted.id,
      details: { nama: data.nama },
    });

    revalidatePath('/dashboard/master/sekolah');
    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal membuat data sekolah' };
  }
}

export async function updateSekolah(id: string, data: Partial<InsertMasterSekolah>) {
  try {
    const user = await requireAuth('MASTER_SEKOLAH_UPDATE');
    await db
      .update(masterSekolah)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(masterSekolah.id, id));

    await logActivity({
      userId: user.id!,
      action: 'UPDATE',
      entityType: 'MASTER_SEKOLAH',
      entityId: id,
      details: { updatedFields: Object.keys(data) },
    });

    revalidatePath('/dashboard/master/sekolah');
    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal mengubah data sekolah' };
  }
}

export async function deleteSekolah(id: string) {
  try {
    const user = await requireAuth('MASTER_SEKOLAH_DELETE');
    await db
      .update(masterSekolah)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(masterSekolah.id, id));

    await logActivity({
      userId: user.id!,
      action: 'DELETE',
      entityType: 'MASTER_SEKOLAH',
      entityId: id,
    });

    revalidatePath('/dashboard/master/sekolah');
    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal menghapus data sekolah' };
  }
}
