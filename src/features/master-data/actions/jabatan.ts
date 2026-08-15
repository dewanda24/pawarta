'use server';

import { db } from '@/db';
import { masterJabatan } from '@/db/schema';
import { eq, isNull, and, ilike, desc } from 'drizzle-orm';
import { InsertMasterJabatan } from '../types';
import { revalidatePath } from 'next/cache';
import { requireAuth, logActivity } from '@/lib/server-action';

export async function getJabatanList(params?: { search?: string; limit?: number; offset?: number }) {
  try {
    await requireAuth('MASTER_JABATAN_READ');
    
    const search = params?.search;
    const limit = params?.limit;
    const offset = params?.offset ?? 0;

    const whereClause = and(
      isNull(masterJabatan.deletedAt),
      search ? ilike(masterJabatan.nama, `%${search}%`) : undefined,
    );

    const data = await db.query.masterJabatan.findMany({
      where: whereClause,
      ...(limit ? { limit, offset } : {}),
      orderBy: [desc(masterJabatan.createdAt)],
    });

    if (limit) {
      const totalRecordsResult = await db.$count(masterJabatan, whereClause);
      const totalRecords = typeof totalRecordsResult === 'number' ? totalRecordsResult : 0;
      const totalPages = Math.ceil(totalRecords / limit);
      return { success: true, data, metadata: { totalRecords, totalPages, page: Math.floor(offset / limit) + 1, limit } };
    }

    return { success: true, data };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal mengambil data jabatan' };
  }
}

export async function createJabatan(data: InsertMasterJabatan) {
  try {
    const user = await requireAuth('MASTER_JABATAN_CREATE');
    const [inserted] = await db.insert(masterJabatan).values(data).returning();

    await logActivity({
      userId: user.id!,
      action: 'CREATE',
      entityType: 'MASTER_JABATAN',
      entityId: inserted.id,
      details: { nama: data.nama },
    });

    revalidatePath('/master/jabatan');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal membuat data jabatan' };
  }
}

export async function updateJabatan(id: string, data: Partial<InsertMasterJabatan>) {
  try {
    const user = await requireAuth('MASTER_JABATAN_UPDATE');
    await db
      .update(masterJabatan)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(masterJabatan.id, id));

    await logActivity({
      userId: user.id!,
      action: 'UPDATE',
      entityType: 'MASTER_JABATAN',
      entityId: id,
    });

    revalidatePath('/master/jabatan');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal mengubah data jabatan' };
  }
}

export async function deleteJabatan(id: string) {
  try {
    const user = await requireAuth('MASTER_JABATAN_DELETE');
    await db
      .update(masterJabatan)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(masterJabatan.id, id));

    await logActivity({
      userId: user.id!,
      action: 'DELETE',
      entityType: 'MASTER_JABATAN',
      entityId: id,
    });

    revalidatePath('/master/jabatan');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal menghapus data jabatan' };
  }
}

