'use server';

import { db } from '@/db';
import { masterSekolah } from '@/db/schema';
import { eq, isNull, and, ilike, desc } from 'drizzle-orm';
import { InsertMasterSekolah } from '../types';
import { revalidatePath } from 'next/cache';
import { requireAuth, logActivity } from '@/lib/server-action';

export async function getSekolahList(search?: string) {
  try {
    await requireAuth();
    const data = await db.query.masterSekolah.findMany({
      where: and(
        isNull(masterSekolah.deletedAt),
        search ? ilike(masterSekolah.nama, `%${search}%`) : undefined,
      ),
      with: {
        kepalaSekolah: true,
      },
      orderBy: [desc(masterSekolah.createdAt)],
    });
    return { success: true, data };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { success: false, error: 'Gagal mengambil data sekolah' };
  }
}

export async function createSekolah(data: InsertMasterSekolah) {
  try {
    const user = await requireAuth();
    const [inserted] = await db.insert(masterSekolah).values(data).returning();

    await logActivity({
      userId: user.id!,
      action: 'CREATE',
      entityType: 'MASTER_SEKOLAH',
      entityId: inserted.id,
      details: { nama: data.nama },
    });

    revalidatePath('/dashboard/master/sekolah');
    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { success: false, error: 'Gagal membuat data sekolah' };
  }
}

export async function updateSekolah(id: string, data: Partial<InsertMasterSekolah>) {
  try {
    const user = await requireAuth();
    await db
      .update(masterSekolah)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(masterSekolah.id, id));

    await logActivity({
      userId: user.id!,
      action: 'UPDATE',
      entityType: 'MASTER_SEKOLAH',
      entityId: id,
      details: { updatedFields: Object.keys(data) },
    });

    revalidatePath('/dashboard/master/sekolah');
    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { success: false, error: 'Gagal mengubah data sekolah' };
  }
}

export async function deleteSekolah(id: string) {
  try {
    const user = await requireAuth();
    await db
      .update(masterSekolah)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(masterSekolah.id, id));

    await logActivity({
      userId: user.id!,
      action: 'DELETE',
      entityType: 'MASTER_SEKOLAH',
      entityId: id,
    });

    revalidatePath('/dashboard/master/sekolah');
    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { success: false, error: 'Gagal menghapus data sekolah' };
  }
}
