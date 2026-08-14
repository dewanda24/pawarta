'use server';

import { db } from '@/db';
import { masterPegawai } from '@/db/schema';
import { eq, isNull, and, ilike, desc } from 'drizzle-orm';
import { InsertMasterPegawai } from '../types';
import { revalidatePath } from 'next/cache';
import { requireAuth, logActivity } from '@/lib/server-action';

export async function getPegawaiList(search?: string) {
  try {
    await requireAuth();
    const data = await db.query.masterPegawai.findMany({
      where: and(
        isNull(masterPegawai.deletedAt),
        search ? ilike(masterPegawai.nama, `%${search}%`) : undefined
      ),
      with: {
        unitKerja: true,
        jabatan: true,
      },
      orderBy: [desc(masterPegawai.createdAt)],
    });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Gagal mengambil data pegawai' };
  }
}

export async function createPegawai(data: InsertMasterPegawai) {
  try {
    const user = await requireAuth();
    const [inserted] = await db.insert(masterPegawai).values(data).returning();
    
    await logActivity({
      userId: user.id!,
      action: 'CREATE',
      entityType: 'MASTER_PEGAWAI',
      entityId: inserted.id,
      details: { nama: data.nama }
    });

    revalidatePath('/dashboard/master/pegawai');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gagal membuat data pegawai' };
  }
}

export async function updatePegawai(id: string, data: Partial<InsertMasterPegawai>) {
  try {
    const user = await requireAuth();
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

    revalidatePath('/dashboard/master/pegawai');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gagal mengubah data pegawai' };
  }
}

export async function deletePegawai(id: string) {
  try {
    const user = await requireAuth();
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

    revalidatePath('/dashboard/master/pegawai');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gagal menghapus data pegawai' };
  }
}
