'use server';

import { db } from '@/db';
import { masterPegawai } from '@/db/schema';
import { eq, isNull, and, ilike, desc } from 'drizzle-orm';
import { InsertMasterPegawai } from '../types';
import { revalidatePath } from 'next/cache';

export async function getPegawaiList(search?: string) {
  try {
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
    await db.insert(masterPegawai).values(data);
    revalidatePath('/dashboard/master/pegawai');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gagal membuat data pegawai' };
  }
}

export async function updatePegawai(id: string, data: Partial<InsertMasterPegawai>) {
  try {
    await db
      .update(masterPegawai)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(masterPegawai.id, id));
    revalidatePath('/dashboard/master/pegawai');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gagal mengubah data pegawai' };
  }
}

export async function deletePegawai(id: string) {
  try {
    await db
      .update(masterPegawai)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(masterPegawai.id, id));
    revalidatePath('/dashboard/master/pegawai');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gagal menghapus data pegawai' };
  }
}
