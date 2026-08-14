'use server';

import { db } from '@/db';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { users, userRoles, loginLogs, sessions } from '@/db/schema';
import { eq, and, ilike, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { requireAuth, logActivity } from '@/lib/server-action';
import bcrypt from 'bcryptjs';

export async function getUserList(search?: string) {
  try {
    await requireAuth();
    const data = await db.query.users.findMany({
      where: and(search ? ilike(users.nama, `%${search}%`) : undefined),
      with: {
        pegawai: {
          with: { unitKerja: true },
        },
        userRoles: {
          with: { role: true },
        },
      },
      orderBy: [desc(users.createdAt)],
    });
    return { success: true, data };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { success: false, error: 'Gagal mengambil data pengguna' };
  }
}

export async function createUser(data: any, roleId: string) {
  try {
    const currentUser = await requireAuth();
    // Validasi email
    const existing = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    });

    if (existing) {
      return { success: false, error: 'Email sudah terdaftar' };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const id = crypto.randomUUID();

    await db.insert(users).values({
      id,
      nama: data.name,
      username: data.username || data.email.split('@')[0],
      email: data.email,
      passwordHash: hashedPassword,
    });

    await db.insert(userRoles).values({
      userId: id,
      roleId,
    });

    await logActivity({
      userId: currentUser.id!,
      action: 'CREATE',
      entityType: 'IAM_USER',
      entityId: id,
      details: { email: data.email },
    });

    revalidatePath('/dashboard/iam/users');
    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { success: false, error: 'Gagal membuat pengguna' };
  }
}

export async function updateUser(id: string, data: any, roleId?: string) {
  try {
    const currentUser = await requireAuth();
    const updateData: any = { nama: data.name, email: data.email };
    if (data.username) updateData.username = data.username;

    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    await db.update(users).set(updateData).where(eq(users.id, id));

    if (roleId) {
      // Update role (hapus yang lama, insert yang baru)
      await db.delete(userRoles).where(eq(userRoles.userId, id));
      await db.insert(userRoles).values({ userId: id, roleId });
    }

    await logActivity({
      userId: currentUser.id!,
      action: 'UPDATE',
      entityType: 'IAM_USER',
      entityId: id,
    });

    revalidatePath('/dashboard/iam/users');
    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { success: false, error: 'Gagal mengubah pengguna' };
  }
}

export async function deleteUser(id: string) {
  try {
    const currentUser = await requireAuth();
    await db.delete(users).where(eq(users.id, id));

    await logActivity({
      userId: currentUser.id!,
      action: 'DELETE',
      entityType: 'IAM_USER',
      entityId: id,
    });

    revalidatePath('/dashboard/iam/users');
    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { success: false, error: 'Gagal menonaktifkan pengguna' };
  }
}

export async function getUserActiveSessions(userId: string) {
  try {
    const data = await db.query.sessions.findMany({
      where: eq(sessions.userId, userId),
      orderBy: [desc(sessions.createdAt)],
    });
    return { success: true, data };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { success: false, error: 'Gagal mengambil sesi aktif' };
  }
}
