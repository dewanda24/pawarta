'use server';

import { db } from '@/db';
import { roles, rolePermissions } from '@/db/schema';
import { eq, ilike, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { requireAuth, logActivity } from '@/lib/server-action';

export async function getRoleList(search?: string) {
  try {
    await requireAuth();
    const data = await db.query.roles.findMany({
      where: search ? ilike(roles.namaRole, `%${search}%`) : undefined,
      orderBy: [desc(roles.urutan)],
      with: {
        rolePermissions: {
          with: { permission: true },
        },
      },
    });
    return { success: true, data };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { success: false, error: 'Gagal mengambil data role' };
  }
}

export async function createRole(data: unknown) {
  try {
    const user = await requireAuth();
    const [inserted] = await db.insert(roles).values(data).returning();

    await logActivity({
      userId: user.id!,
      action: 'CREATE',
      entityType: 'IAM_ROLE',
      entityId: inserted.id,
      details: { name: data.name },
    });

    revalidatePath('/dashboard/iam/roles');
    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { success: false, error: 'Gagal membuat role' };
  }
}

export async function updateRole(id: string, data: unknown) {
  try {
    const user = await requireAuth();
    await db.update(roles).set(data).where(eq(roles.id, id));

    await logActivity({
      userId: user.id!,
      action: 'UPDATE',
      entityType: 'IAM_ROLE',
      entityId: id,
    });

    revalidatePath('/dashboard/iam/roles');
    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { success: false, error: 'Gagal mengubah role' };
  }
}

export async function deleteRole(id: string) {
  try {
    const user = await requireAuth();
    await db.delete(roles).where(eq(roles.id, id));

    await logActivity({
      userId: user.id!,
      action: 'DELETE',
      entityType: 'IAM_ROLE',
      entityId: id,
    });

    revalidatePath('/dashboard/iam/roles');
    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { success: false, error: 'Gagal menonaktifkan role' };
  }
}

export async function assignPermissionsToRole(roleId: string, permissionIds: string[]) {
  try {
    const user = await requireAuth();
    // Hapus relasi lama
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));

    // Insert yang baru
    if (permissionIds.length > 0) {
      const values = permissionIds.map((pid) => ({ roleId, permissionId: pid }));
      await db.insert(rolePermissions).values(values);
    }

    await logActivity({
      userId: user.id!,
      action: 'UPDATE_PERMISSIONS',
      entityType: 'IAM_ROLE',
      entityId: roleId,
      details: { count: permissionIds.length },
    });

    revalidatePath('/dashboard/iam/roles');
    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { success: false, error: 'Gagal menyimpan role permission' };
  }
}
