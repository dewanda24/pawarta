'use server';

import { db } from '@/db';
import { masterPenandatangan } from '@/db/schema';
import { eq, isNull, and, desc } from 'drizzle-orm';
import { InsertMasterPenandatangan } from '../types';
import { revalidatePath } from 'next/cache';
import { requireAuth, logActivity } from '@/lib/server-action';

export async function getPenandatanganList(params?: { limit?: number; offset?: number }) {
  try {
    await requireAuth('MASTER_PENANDATANGAN_READ');
    
    const limit = params?.limit;
    const offset = params?.offset ?? 0;

    const whereClause = isNull(masterPenandatangan.deletedAt);

    const data = await db.query.masterPenandatangan.findMany({
      where: whereClause,
      with: {
        pegawai: {
          with: {
            jabatan: true,
            unitKerja: true,
          },
        },
        jabatan: true,
      },
      ...(limit ? { limit, offset } : {}),
      orderBy: [desc(masterPenandatangan.createdAt)],
    });

    if (limit) {
      const totalRecordsResult = await db.$count(masterPenandatangan, whereClause);
      const totalRecords = typeof totalRecordsResult === 'number' ? totalRecordsResult : 0;
      const totalPages = Math.ceil(totalRecords / limit);
      return { success: true, data, metadata: { totalRecords, totalPages, page: Math.floor(offset / limit) + 1, limit } };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal mengambil data penandatangan' };
  }
}

export async function createPenandatangan(data: InsertMasterPenandatangan) {
  try {
    const user = await requireAuth('MASTER_PENANDATANGAN_CREATE');
    const [inserted] = await db.insert(masterPenandatangan).values(data).returning();

    await logActivity({
      userId: user.id!,
      action: 'CREATE',
      entityType: 'MASTER_PENANDATANGAN',
      entityId: inserted.id,
    });

    revalidatePath('/master/penandatangan');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal membuat data penandatangan' };
  }
}

export async function updatePenandatangan(id: string, data: Partial<InsertMasterPenandatangan>) {
  try {
    const user = await requireAuth('MASTER_PENANDATANGAN_UPDATE');
    await db
      .update(masterPenandatangan)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(masterPenandatangan.id, id));

    await logActivity({
      userId: user.id!,
      action: 'UPDATE',
      entityType: 'MASTER_PENANDATANGAN',
      entityId: id,
    });

    revalidatePath('/master/penandatangan');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal mengubah data penandatangan' };
  }
}

export async function deletePenandatangan(id: string) {
  try {
    const user = await requireAuth('MASTER_PENANDATANGAN_DELETE');
    await db
      .update(masterPenandatangan)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(masterPenandatangan.id, id));

    await logActivity({
      userId: user.id!,
      action: 'DELETE',
      entityType: 'MASTER_PENANDATANGAN',
      entityId: id,
    });

    revalidatePath('/master/penandatangan');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal menghapus data penandatangan' };
  }
}
