'use server';

import { db } from '@/db';
import { masterJabatan } from '@/db/schema';
import { eq, isNull, and, ilike, desc } from 'drizzle-orm';
import { InsertMasterJabatan } from '../types';
import { revalidatePath } from 'next/cache';

export async function getJabatanList(search?: string) {
  try {
    const data = await db.query.masterJabatan.findMany({
      where: and(
        isNull(masterJabatan.deletedAt),
        search ? ilike(masterJabatan.nama, `%${search}%`) : undefined
      ),
      orderBy: [desc(masterJabatan.createdAt)],
    });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Gagal mengambil data jabatan' };
  }
}

export async function createJabatan(data: InsertMasterJabatan) {
  try {
    await db.insert(masterJabatan).values(data);
    revalidatePath('/dashboard/master/jabatan');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gagal membuat jabatan' };
  }
}

export async function updateJabatan(id: string, data: Partial<InsertMasterJabatan>) {
  try {
    await db
      .update(masterJabatan)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(masterJabatan.id, id));
    revalidatePath('/dashboard/master/jabatan');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gagal mengubah jabatan' };
  }
}

export async function deleteJabatan(id: string) {
  try {
    await db
      .update(masterJabatan)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(masterJabatan.id, id));
    revalidatePath('/dashboard/master/jabatan');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gagal menghapus jabatan' };
  }
}
