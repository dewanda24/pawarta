'use server';

import { db } from '@/db';
import { permissions } from '@/db/schema';
import { eq, ilike } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { requireAuth, logActivity } from '@/lib/server-action';

export async function getPermissionList(search?: string) {
  try {
    await requireAuth();
    const data = await db.query.permissions.findMany({
      where: search ? ilike(permissions.nama, `%${search}%`) : undefined,
    });
    return { success: true, data };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { success: false, error: 'Gagal mengambil data permission' };
  }
}

export async function createPermission(data: any) {
  try {
    const user = await requireAuth();
    const [inserted] = await db.insert(permissions).values(data).returning();

    await logActivity({
      userId: user.id!,
      action: 'CREATE',
      entityType: 'IAM_PERMISSION',
      entityId: inserted.id,
      details: { kode: data.kode },
    });

    revalidatePath('/dashboard/iam/permissions');
    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { success: false, error: 'Gagal membuat permission' };
  }
}

export async function updatePermission(id: string, data: any) {
  try {
    const user = await requireAuth();
    await db
      .update(permissions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(permissions.id, id));

    await logActivity({
      userId: user.id!,
      action: 'UPDATE',
      entityType: 'IAM_PERMISSION',
      entityId: id,
    });

    revalidatePath('/dashboard/iam/permissions');
    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { success: false, error: 'Gagal mengubah permission' };
  }
}

export async function deletePermission(id: string) {
  try {
    const user = await requireAuth();
    // Permission biasanya tidak disoft-delete tapi bisa langsung didelete atau diberi status inactive
    // Kita hapus permanen karena ini internal system configuration
    await db.delete(permissions).where(eq(permissions.id, id));

    await logActivity({
      userId: user.id!,
      action: 'DELETE',
      entityType: 'IAM_PERMISSION',
      entityId: id,
    });

    revalidatePath('/dashboard/iam/permissions');
    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { success: false, error: 'Gagal menghapus permission (kemungkinan masih dipakai)' };
  }
}
