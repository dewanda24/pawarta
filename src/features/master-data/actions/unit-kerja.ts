'use server';

import { db } from '@/db';
import { masterUnitKerja } from '@/db/schema';
import { eq, isNull, and, ilike, desc } from 'drizzle-orm';
import { InsertMasterUnitKerja } from '../types';
import { revalidatePath } from 'next/cache';
import { requireAuth, logActivity } from '@/lib/server-action';

export async function getUnitKerjaList(params?: { search?: string; limit?: number; offset?: number }) {
  try {
    await requireAuth('MASTER_UNIT_KERJA_READ');
    
    const search = params?.search;
    const limit = params?.limit;
    const offset = params?.offset ?? 0;

    const whereClause = and(
      isNull(masterUnitKerja.deletedAt),
      search ? ilike(masterUnitKerja.nama, `%${search}%`) : undefined,
    );

    const data = await db.query.masterUnitKerja.findMany({
      where: whereClause,
      ...(limit ? { limit, offset } : {}),
      orderBy: [desc(masterUnitKerja.createdAt)],
    });

    if (limit) {
      const totalRecordsResult = await db.$count(masterUnitKerja, whereClause);
      const totalRecords = typeof totalRecordsResult === 'number' ? totalRecordsResult : 0;
      const totalPages = Math.ceil(totalRecords / limit);
      return { success: true, data, metadata: { totalRecords, totalPages, page: Math.floor(offset / limit) + 1, limit } };
    }

    return { success: true, data };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal mengambil data unit kerja' };
  }
}

export async function createUnitKerja(data: InsertMasterUnitKerja) {
  try {
    const user = await requireAuth('MASTER_UNIT_KERJA_CREATE');
    const [inserted] = await db.insert(masterUnitKerja).values(data).returning();

    await logActivity({
      userId: user.id!,
      action: 'CREATE',
      entityType: 'MASTER_UNIT_KERJA',
      entityId: inserted.id,
      details: { nama: data.nama },
    });

    revalidatePath('/master/unit-kerja');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal membuat data unit kerja' };
  }
}

export async function updateUnitKerja(id: string, data: Partial<InsertMasterUnitKerja>) {
  try {
    const user = await requireAuth('MASTER_UNIT_KERJA_UPDATE');
    await db
      .update(masterUnitKerja)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(masterUnitKerja.id, id));

    await logActivity({
      userId: user.id!,
      action: 'UPDATE',
      entityType: 'MASTER_UNIT_KERJA',
      entityId: id,
    });

    revalidatePath('/master/unit-kerja');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal mengubah data unit kerja' };
  }
}

export async function deleteUnitKerja(id: string) {
  try {
    const user = await requireAuth('MASTER_UNIT_KERJA_DELETE');
    await db
      .update(masterUnitKerja)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(masterUnitKerja.id, id));

    await logActivity({
      userId: user.id!,
      action: 'DELETE',
      entityType: 'MASTER_UNIT_KERJA',
      entityId: id,
    });

    revalidatePath('/master/unit-kerja');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal menghapus data unit kerja' };
  }
}

