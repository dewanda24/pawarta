'use server';

import { db } from '@/db';
import { masterSifatSurat } from '@/db/schema';
import { eq, isNull, and, ilike, desc } from 'drizzle-orm';
import { InsertMasterSifatSurat } from '../types';
import { revalidatePath } from 'next/cache';
import { requireAuth, logActivity } from '@/lib/server-action';

export async function getSifatSuratList(params?: { search?: string; limit?: number; offset?: number }) {
  try {
    await requireAuth('MASTER_SIFAT_SURAT_READ');
    
    const search = params?.search;
    const limit = params?.limit;
    const offset = params?.offset ?? 0;

    const whereClause = and(
      isNull(masterSifatSurat.deletedAt),
      search ? ilike(masterSifatSurat.nama, `%${search}%`) : undefined,
    );

    const data = await db.query.masterSifatSurat.findMany({
      where: whereClause,
      ...(limit ? { limit, offset } : {}),
      orderBy: [desc(masterSifatSurat.createdAt)],
    });

    if (limit) {
      const totalRecordsResult = await db.$count(masterSifatSurat, whereClause);
      const totalRecords = typeof totalRecordsResult === 'number' ? totalRecordsResult : 0;
      const totalPages = Math.ceil(totalRecords / limit);
      return { success: true, data, metadata: { totalRecords, totalPages, page: Math.floor(offset / limit) + 1, limit } };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal mengambil data sifat surat' };
  }
}

export async function createSifatSurat(data: InsertMasterSifatSurat) {
  try {
    const user = await requireAuth('MASTER_SIFAT_SURAT_CREATE');
    const [inserted] = await db.insert(masterSifatSurat).values(data).returning();

    await logActivity({
      userId: user.id!,
      action: 'CREATE',
      entityType: 'MASTER_SIFAT_SURAT',
      entityId: inserted.id,
      details: { nama: data.nama },
    });

    revalidatePath('/master/sifat-surat');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal membuat data sifat surat' };
  }
}

export async function updateSifatSurat(id: string, data: Partial<InsertMasterSifatSurat>) {
  try {
    const user = await requireAuth('MASTER_SIFAT_SURAT_UPDATE');
    await db
      .update(masterSifatSurat)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(masterSifatSurat.id, id));

    await logActivity({
      userId: user.id!,
      action: 'UPDATE',
      entityType: 'MASTER_SIFAT_SURAT',
      entityId: id,
    });

    revalidatePath('/master/sifat-surat');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal mengubah data sifat surat' };
  }
}

export async function deleteSifatSurat(id: string) {
  try {
    const user = await requireAuth('MASTER_SIFAT_SURAT_DELETE');
    await db
      .update(masterSifatSurat)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(masterSifatSurat.id, id));

    await logActivity({
      userId: user.id!,
      action: 'DELETE',
      entityType: 'MASTER_SIFAT_SURAT',
      entityId: id,
    });

    revalidatePath('/master/sifat-surat');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal menghapus data sifat surat' };
  }
}
