'use server';

import { db } from '@/db';
import { masterInstansi } from '@/db/schema';
import { eq, isNull, and, ilike, desc } from 'drizzle-orm';
import { InsertMasterInstansi } from '../types';
import { revalidatePath } from 'next/cache';
import { requireAuth, logActivity } from '@/lib/server-action';

export async function getInstansiList(params?: { search?: string; limit?: number; offset?: number }) {
  try {
    await requireAuth('MASTER_INSTANSI_READ');
    
    const search = params?.search;
    const limit = params?.limit;
    const offset = params?.offset ?? 0;

    const whereClause = and(
      isNull(masterInstansi.deletedAt),
      search ? ilike(masterInstansi.nama, `%${search}%`) : undefined,
    );

    const data = await db.query.masterInstansi.findMany({
      where: whereClause,
      ...(limit ? { limit, offset } : {}),
      orderBy: [desc(masterInstansi.createdAt)],
    });

    if (limit) {
      const totalRecordsResult = await db.$count(masterInstansi, whereClause);
      const totalRecords = typeof totalRecordsResult === 'number' ? totalRecordsResult : 0;
      const totalPages = Math.ceil(totalRecords / limit);
      return { success: true, data, metadata: { totalRecords, totalPages, page: Math.floor(offset / limit) + 1, limit } };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal mengambil data instansi' };
  }
}

export async function createInstansi(data: InsertMasterInstansi) {
  try {
    const user = await requireAuth('MASTER_INSTANSI_CREATE');
    const [inserted] = await db.insert(masterInstansi).values(data).returning();

    await logActivity({
      userId: user.id!,
      action: 'CREATE',
      entityType: 'MASTER_INSTANSI',
      entityId: inserted.id,
      details: { nama: data.nama },
    });

    revalidatePath('/master/instansi');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal membuat data instansi' };
  }
}

export async function updateInstansi(id: string, data: Partial<InsertMasterInstansi>) {
  try {
    const user = await requireAuth('MASTER_INSTANSI_UPDATE');
    await db
      .update(masterInstansi)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(masterInstansi.id, id));

    await logActivity({
      userId: user.id!,
      action: 'UPDATE',
      entityType: 'MASTER_INSTANSI',
      entityId: id,
    });

    revalidatePath('/master/instansi');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal mengubah data instansi' };
  }
}

export async function deleteInstansi(id: string) {
  try {
    const user = await requireAuth('MASTER_INSTANSI_DELETE');
    await db
      .update(masterInstansi)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(masterInstansi.id, id));

    await logActivity({
      userId: user.id!,
      action: 'DELETE',
      entityType: 'MASTER_INSTANSI',
      entityId: id,
    });

    revalidatePath('/master/instansi');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal menghapus data instansi' };
  }
}
