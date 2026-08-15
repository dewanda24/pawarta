'use server';

import { db } from '@/db';
import { masterJenisSurat } from '@/db/schema';
import { eq, isNull, and, ilike, desc } from 'drizzle-orm';
import { InsertMasterJenisSurat } from '../types';
import { revalidatePath } from 'next/cache';
import { requireAuth, logActivity } from '@/lib/server-action';

export async function getJenisSuratList(params?: { search?: string; limit?: number; offset?: number }) {
  try {
    await requireAuth('MASTER_JENIS_SURAT_READ');
    
    const search = params?.search;
    const limit = params?.limit;
    const offset = params?.offset ?? 0;

    const whereClause = and(
      isNull(masterJenisSurat.deletedAt),
      search ? ilike(masterJenisSurat.nama, `%${search}%`) : undefined,
    );

    const data = await db.query.masterJenisSurat.findMany({
      where: whereClause,
      ...(limit ? { limit, offset } : {}),
      orderBy: [desc(masterJenisSurat.createdAt)],
    });

    if (limit) {
      const totalRecordsResult = await db.$count(masterJenisSurat, whereClause);
      const totalRecords = typeof totalRecordsResult === 'number' ? totalRecordsResult : 0;
      const totalPages = Math.ceil(totalRecords / limit);
      return { success: true, data, metadata: { totalRecords, totalPages, page: Math.floor(offset / limit) + 1, limit } };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal mengambil data jenis surat' };
  }
}

export async function createJenisSurat(data: InsertMasterJenisSurat) {
  try {
    const user = await requireAuth('MASTER_JENIS_SURAT_CREATE');
    const [inserted] = await db.insert(masterJenisSurat).values(data).returning();

    await logActivity({
      userId: user.id!,
      action: 'CREATE',
      entityType: 'MASTER_JENIS_SURAT',
      entityId: inserted.id,
      details: { nama: data.nama },
    });

    revalidatePath('/master/jenis-surat');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal membuat data jenis surat' };
  }
}

export async function updateJenisSurat(id: string, data: Partial<InsertMasterJenisSurat>) {
  try {
    const user = await requireAuth('MASTER_JENIS_SURAT_UPDATE');
    await db
      .update(masterJenisSurat)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(masterJenisSurat.id, id));

    await logActivity({
      userId: user.id!,
      action: 'UPDATE',
      entityType: 'MASTER_JENIS_SURAT',
      entityId: id,
    });

    revalidatePath('/master/jenis-surat');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal mengubah data jenis surat' };
  }
}

export async function deleteJenisSurat(id: string) {
  try {
    const user = await requireAuth('MASTER_JENIS_SURAT_DELETE');
    await db
      .update(masterJenisSurat)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(masterJenisSurat.id, id));

    await logActivity({
      userId: user.id!,
      action: 'DELETE',
      entityType: 'MASTER_JENIS_SURAT',
      entityId: id,
    });

    revalidatePath('/master/jenis-surat');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal menghapus data jenis surat' };
  }
}
