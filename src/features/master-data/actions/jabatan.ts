'use server';

import { db } from '@/db';
import { masterJabatan } from '@/db/schema';
import { eq, isNull, and, ilike, desc } from 'drizzle-orm';
import { InsertMasterJabatan } from '../types';
import { revalidatePath } from 'next/cache';
import { requireAuth, logActivity } from '@/lib/server-action';

export async function getJabatanList(search?: string) {
  try {
    await requireAuth();
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
    const user = await requireAuth();
    const [inserted] = await db.insert(masterJabatan).values(data).returning();
    
    await logActivity({
      userId: user.id!,
      action: 'CREATE',
      entityType: 'MASTER_JABATAN',
      entityId: inserted.id,
      details: { nama: data.nama }
    });

    revalidatePath('/dashboard/master/jabatan');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gagal membuat jabatan' };
  }
}

export async function updateJabatan(id: string, data: Partial<InsertMasterJabatan>) {
  try {
    const user = await requireAuth();
    await db
      .update(masterJabatan)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(masterJabatan.id, id));

    await logActivity({
      userId: user.id!,
      action: 'UPDATE',
      entityType: 'MASTER_JABATAN',
      entityId: id,
    });

    revalidatePath('/dashboard/master/jabatan');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gagal mengubah jabatan' };
  }
}

export async function deleteJabatan(id: string) {
  try {
    const user = await requireAuth();
    await db
      .update(masterJabatan)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(masterJabatan.id, id));
      
    await logActivity({
      userId: user.id!,
      action: 'DELETE',
      entityType: 'MASTER_JABATAN',
      entityId: id,
    });

    revalidatePath('/dashboard/master/jabatan');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gagal menghapus jabatan' };
  }
}
