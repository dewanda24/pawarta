'use server';

import { db } from '@/db';
import { masterUnitKerja } from '@/db/schema';
import { eq, isNull, and, ilike, desc } from 'drizzle-orm';
import { InsertMasterUnitKerja } from '../types';
import { revalidatePath } from 'next/cache';
import { requireAuth, logActivity } from '@/lib/server-action';

export async function getUnitKerjaList(search?: string) {
  try {
    await requireAuth();
    const data = await db.query.masterUnitKerja.findMany({
      where: and(
        isNull(masterUnitKerja.deletedAt),
        search ? ilike(masterUnitKerja.nama, `%${search}%`) : undefined
      ),
      orderBy: [desc(masterUnitKerja.createdAt)],
    });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Gagal mengambil data unit kerja' };
  }
}

export async function createUnitKerja(data: InsertMasterUnitKerja) {
  try {
    const user = await requireAuth();
    const [inserted] = await db.insert(masterUnitKerja).values(data).returning();
    
    await logActivity({
      userId: user.id!,
      action: 'CREATE',
      entityType: 'MASTER_UNIT_KERJA',
      entityId: inserted.id,
      details: { nama: data.nama }
    });

    revalidatePath('/dashboard/master/unit-kerja');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gagal membuat unit kerja' };
  }
}

export async function updateUnitKerja(id: string, data: Partial<InsertMasterUnitKerja>) {
  try {
    const user = await requireAuth();
    await db
      .update(masterUnitKerja)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(masterUnitKerja.id, id));

    await logActivity({
      userId: user.id!,
      action: 'UPDATE',
      entityType: 'MASTER_UNIT_KERJA',
      entityId: id,
    });

    revalidatePath('/dashboard/master/unit-kerja');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gagal mengubah unit kerja' };
  }
}

export async function deleteUnitKerja(id: string) {
  try {
    const user = await requireAuth();
    await db
      .update(masterUnitKerja)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(masterUnitKerja.id, id));
      
    await logActivity({
      userId: user.id!,
      action: 'DELETE',
      entityType: 'MASTER_UNIT_KERJA',
      entityId: id,
    });

    revalidatePath('/dashboard/master/unit-kerja');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gagal menghapus unit kerja' };
  }
}
