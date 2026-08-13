'use server';

import { db } from '@/db';
import { masterSekolah } from '@/db/schema';
import { eq, isNull, and, ilike, desc } from 'drizzle-orm';
import { InsertMasterSekolah } from '../types';
import { revalidatePath } from 'next/cache';

export async function getSekolahList(search?: string) {
  try {
    const data = await db.query.masterSekolah.findMany({
      where: and(
        isNull(masterSekolah.deletedAt),
        search ? ilike(masterSekolah.nama, `%${search}%`) : undefined
      ),
      with: {
        kepalaSekolah: true,
      },
      orderBy: [desc(masterSekolah.createdAt)],
    });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Gagal mengambil data sekolah' };
  }
}

export async function createSekolah(data: InsertMasterSekolah) {
  try {
    await db.insert(masterSekolah).values(data);
    revalidatePath('/dashboard/master/sekolah');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gagal membuat data sekolah' };
  }
}

export async function updateSekolah(id: string, data: Partial<InsertMasterSekolah>) {
  try {
    await db
      .update(masterSekolah)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(masterSekolah.id, id));
    revalidatePath('/dashboard/master/sekolah');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gagal mengubah data sekolah' };
  }
}

export async function deleteSekolah(id: string) {
  try {
    await db
      .update(masterSekolah)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(masterSekolah.id, id));
    revalidatePath('/dashboard/master/sekolah');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gagal menghapus data sekolah' };
  }
}
