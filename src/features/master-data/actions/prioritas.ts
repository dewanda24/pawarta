'use server';

import { db } from '@/db';
import { masterPrioritas } from '@/db/schema';
import { eq, isNull, and, ilike, desc } from 'drizzle-orm';
import { InsertMasterPrioritas } from '../types';
import { revalidatePath } from 'next/cache';
import { requireAuth, logActivity } from '@/lib/server-action';

export async function getPrioritasList(params?: { search?: string; limit?: number; offset?: number }) {
  try {
    await requireAuth('MASTER_PRIORITAS_READ');
    
    const search = params?.search;
    const limit = params?.limit;
    const offset = params?.offset ?? 0;

    const whereClause = and(
      isNull(masterPrioritas.deletedAt),
      search ? ilike(masterPrioritas.nama, `%${search}%`) : undefined,
    );

    const data = await db.query.masterPrioritas.findMany({
      where: whereClause,
      ...(limit ? { limit, offset } : {}),
      orderBy: [desc(masterPrioritas.createdAt)],
    });

    if (limit) {
      const totalRecordsResult = await db.$count(masterPrioritas, whereClause);
      const totalRecords = typeof totalRecordsResult === 'number' ? totalRecordsResult : 0;
      const totalPages = Math.ceil(totalRecords / limit);
      return { success: true, data, metadata: { totalRecords, totalPages, page: Math.floor(offset / limit) + 1, limit } };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal mengambil data prioritas' };
  }
}

export async function createPrioritas(data: InsertMasterPrioritas) {
  try {
    const user = await requireAuth('MASTER_PRIORITAS_CREATE');
    const [inserted] = await db.insert(masterPrioritas).values(data).returning();

    await logActivity({
      userId: user.id!,
      action: 'CREATE',
      entityType: 'MASTER_PRIORITAS',
      entityId: inserted.id,
      details: { nama: data.nama },
    });

    revalidatePath('/master/prioritas');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal membuat data prioritas' };
  }
}

export async function updatePrioritas(id: string, data: Partial<InsertMasterPrioritas>) {
  try {
    const user = await requireAuth('MASTER_PRIORITAS_UPDATE');
    await db
      .update(masterPrioritas)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(masterPrioritas.id, id));

    await logActivity({
      userId: user.id!,
      action: 'UPDATE',
      entityType: 'MASTER_PRIORITAS',
      entityId: id,
    });

    revalidatePath('/master/prioritas');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal mengubah data prioritas' };
  }
}

export async function deletePrioritas(id: string) {
  try {
    const user = await requireAuth('MASTER_PRIORITAS_DELETE');
    await db
      .update(masterPrioritas)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(masterPrioritas.id, id));

    await logActivity({
      userId: user.id!,
      action: 'DELETE',
      entityType: 'MASTER_PRIORITAS',
      entityId: id,
    });

    revalidatePath('/master/prioritas');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal menghapus data prioritas' };
  }
}
