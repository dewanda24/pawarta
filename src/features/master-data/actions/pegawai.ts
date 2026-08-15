'use server';

import { db } from '@/db';
import { masterPegawai } from '@/db/schema';
import { eq, isNull, and, ilike, desc } from 'drizzle-orm';
import { InsertMasterPegawai } from '../types';
import { revalidatePath } from 'next/cache';
import { requireAuth, logActivity } from '@/lib/server-action';

export async function getPegawaiList(params?: { search?: string; limit?: number; offset?: number }) {
  try {
    await requireAuth('MASTER_PEGAWAI_READ');

    const search = params?.search;
    const limit = params?.limit ?? 10;
    const offset = params?.offset ?? 0;

    const whereClause = and(
      isNull(masterPegawai.deletedAt),
      search ? ilike(masterPegawai.nama, `%${search}%`) : undefined,
    );

    const data = await db.query.masterPegawai.findMany({
      where: whereClause,
      with: {
        unitKerja: true,
        jabatan: true,
      },
      limit,
      offset,
      orderBy: [desc(masterPegawai.createdAt)],
    });

    const totalRecordsResult = await db.$count(masterPegawai, whereClause);
    const totalRecords = typeof totalRecordsResult === 'number' ? totalRecordsResult : 0;
    const totalPages = Math.ceil(totalRecords / limit);

    return { success: true, data, metadata: { totalRecords, totalPages, page: Math.floor(offset / limit) + 1, limit } };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal mengambil data pegawai' };
  }
}

export async function createPegawai(data: InsertMasterPegawai) {
  try {
    const user = await requireAuth('MASTER_PEGAWAI_CREATE');
    const [inserted] = await db.insert(masterPegawai).values(data).returning();

    await logActivity({
      userId: user.id!,
      action: 'CREATE',
      entityType: 'MASTER_PEGAWAI',
      entityId: inserted.id,
      details: { nama: data.nama },
    });

    revalidatePath('/master/pegawai');
    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal membuat data pegawai' };
  }
}

export async function updatePegawai(id: string, data: Partial<InsertMasterPegawai>) {
  try {
    const user = await requireAuth('MASTER_PEGAWAI_UPDATE');
    await db
      .update(masterPegawai)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(masterPegawai.id, id));

    await logActivity({
      userId: user.id!,
      action: 'UPDATE',
      entityType: 'MASTER_PEGAWAI',
      entityId: id,
    });

    revalidatePath('/master/pegawai');
    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal mengubah data pegawai' };
  }
}

export async function deletePegawai(id: string) {
  try {
    const user = await requireAuth('MASTER_PEGAWAI_DELETE');
    await db
      .update(masterPegawai)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(masterPegawai.id, id));

    await logActivity({
      userId: user.id!,
      action: 'DELETE',
      entityType: 'MASTER_PEGAWAI',
      entityId: id,
    });

    revalidatePath('/master/pegawai');
    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal menghapus data pegawai' };
  }
}
