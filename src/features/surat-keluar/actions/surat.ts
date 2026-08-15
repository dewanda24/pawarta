'use server';

import { db } from '@/db';
import { outgoingLetters, masterUnitKerja } from '@/db/schema';
import { eq, isNull, and, ilike, desc } from 'drizzle-orm';
import { InsertOutgoingLetter } from '../types';
import { revalidatePath } from 'next/cache';
import { requireAuth, logActivity } from '@/lib/server-action';

export async function getSuratKeluarList(params?: {
  search?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    await requireAuth('SURAT_KELUAR_READ');

    const search = params?.search;
    const limit = params?.limit;
    const offset = params?.offset ?? 0;

    const whereClause = and(
      isNull(outgoingLetters.deletedAt),
      search ? ilike(outgoingLetters.perihal, `%${search}%`) : undefined,
    );

    const data = await db.query.outgoingLetters.findMany({
      where: whereClause,
      with: {
        jenisSurat: true,
        instansiTujuan: true,
        pembuat: true,
      },
      ...(limit ? { limit, offset } : {}),
      orderBy: [desc(outgoingLetters.createdAt)],
    });

    if (limit) {
      const totalRecordsResult = await db.$count(outgoingLetters, whereClause);
      const totalRecords = typeof totalRecordsResult === 'number' ? totalRecordsResult : 0;
      const totalPages = Math.ceil(totalRecords / limit);
      return {
        success: true,
        data,
        metadata: { totalRecords, totalPages, page: Math.floor(offset / limit) + 1, limit },
      };
    }

    return { success: true, data };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal mengambil data surat keluar';
    return { success: false, error: msg };
  }
}

export async function createSuratKeluar(data: InsertOutgoingLetter) {
  try {
    const user = await requireAuth('SURAT_KELUAR_CREATE');

    // Pastikan pembuatId terisi dari user login jika belum diset
    const pembuatId = data.pembuatId || user.id;

    // Jika unitKerjaId tidak diset, cari unit kerja default
    let unitKerjaId = data.unitKerjaId;
    if (!unitKerjaId) {
      const firstUnit = await db.query.masterUnitKerja.findFirst({
        where: eq(masterUnitKerja.isAktif, true),
      });
      if (firstUnit) {
        unitKerjaId = firstUnit.id;
      }
    }

    if (!unitKerjaId) {
      return {
        success: false,
        error: 'Silakan tentukan Unit Kerja atau pastikan Master Unit Kerja sudah ada.',
      };
    }

    const [inserted] = await db
      .insert(outgoingLetters)
      .values({
        ...data,
        pembuatId,
        unitKerjaId,
        status: data.status || 'DRAFT',
      })
      .returning();

    await logActivity({
      userId: user.id!,
      action: 'CREATE',
      entityType: 'SURAT_KELUAR',
      entityId: inserted.id,
      details: { perihal: data.perihal },
    });

    revalidatePath('/surat-keluar');
    return { success: true, data: inserted };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal membuat surat keluar';
    return { success: false, error: msg };
  }
}

export async function updateSuratKeluar(id: string, data: Partial<InsertOutgoingLetter>) {
  try {
    const user = await requireAuth('SURAT_KELUAR_UPDATE');
    await db
      .update(outgoingLetters)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(outgoingLetters.id, id));

    await logActivity({
      userId: user.id!,
      action: 'UPDATE',
      entityType: 'SURAT_KELUAR',
      entityId: id,
    });

    revalidatePath('/surat-keluar');
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal mengubah surat keluar';
    return { success: false, error: msg };
  }
}

export async function deleteSuratKeluar(id: string) {
  try {
    const user = await requireAuth('SURAT_KELUAR_DELETE');
    await db
      .update(outgoingLetters)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(outgoingLetters.id, id));

    await logActivity({
      userId: user.id!,
      action: 'DELETE',
      entityType: 'SURAT_KELUAR',
      entityId: id,
    });

    revalidatePath('/surat-keluar');
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal menghapus surat keluar';
    return { success: false, error: msg };
  }
}
