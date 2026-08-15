'use server';

import { db } from '@/db';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { users, userRoles, loginLogs, sessions } from '@/db/schema';
import { eq, and, ilike, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { requireAuth, logActivity } from '@/lib/server-action';
import bcrypt from 'bcryptjs';

export async function getUserList(params?: { search?: string; limit?: number; offset?: number }) {
  try {
    await requireAuth('IAM_USERS_READ');
    
    const search = params?.search;
    const limit = params?.limit;
    const offset = params?.offset ?? 0;

    const whereClause = and(
      search ? ilike(users.nama, `%${search}%`) : undefined
    );

    const data = await db.query.users.findMany({
      where: whereClause,
      ...(limit ? { limit, offset } : {}),
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

    if (limit) {
      const totalRecordsResult = await db.$count(users, whereClause);
      const totalRecords = typeof totalRecordsResult === 'number' ? totalRecordsResult : 0;
      const totalPages = Math.ceil(totalRecords / limit);
      return { success: true, data, metadata: { totalRecords, totalPages, page: Math.floor(offset / limit) + 1, limit } };
    }

    return { success: true, data };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal mengambil data pengguna' };
  }
}

export async function createUser(data: any, roleId: string) {
  try {
    const currentUser = await requireAuth('IAM_USERS_CREATE');
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
      nama: data.nama,
      username: data.username || data.email.split('@')[0],
      email: data.email,
      passwordHash: hashedPassword,
      pegawaiId: data.pegawaiId || null,
      status: data.status || 'Aktif',
    });

    if (roleId) {
      await db.insert(userRoles).values({
        userId: id,
        roleId,
      });
    }

    await logActivity({
      userId: currentUser.id!,
      action: 'CREATE',
      entityType: 'IAM_USER',
      entityId: id,
      details: { email: data.email },
    });

    revalidatePath('/iam/users');
    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal membuat pengguna' };
  }
}

export async function updateUser(id: string, data: any, roleId?: string) {
  try {
    const currentUser = await requireAuth('IAM_USERS_UPDATE');
    const updateData: any = { 
      nama: data.nama, 
      email: data.email,
      status: data.status,
      pegawaiId: data.pegawaiId || null
    };
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

    revalidatePath('/iam/users');
    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal mengubah pengguna' };
  }
}

export async function deleteUser(id: string) {
  try {
    const currentUser = await requireAuth('IAM_USERS_DELETE');
    await db.delete(users).where(eq(users.id, id));

    await logActivity({
      userId: currentUser.id!,
      action: 'DELETE',
      entityType: 'IAM_USER',
      entityId: id,
    });

    revalidatePath('/iam/users');
    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal menghapus pengguna' };
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
