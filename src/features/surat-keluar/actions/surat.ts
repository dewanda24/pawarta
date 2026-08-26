'use server';

import { db } from '@/db';
import { outgoingLetters, masterUnitKerja, letterAttachments } from '@/db/schema';
import { eq, isNull, and, ilike, desc } from 'drizzle-orm';
import { InsertOutgoingLetter } from '../types';
import { revalidatePath } from 'next/cache';
import { requireAuth, logActivity } from '@/lib/server-action';
import { generateNomorNaskahDinas } from '@/lib/nomor-surat-generator';

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

export type CreateSuratKeluarInput = Partial<InsertOutgoingLetter> & {
  perihal: string;
  tujuanSurat: string;
  jenisSuratId: string;
  klasifikasiId: string;
};

export async function createSuratKeluar(data: CreateSuratKeluarInput) {
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

export async function approveSuratKeluar(id: string) {
  try {
    const user = await requireAuth();

    const letter = await db.query.outgoingLetters.findFirst({
      where: eq(outgoingLetters.id, id),
      with: { klasifikasi: true, jenisSurat: true, unitKerja: true },
    });

    if (!letter) {
      return { success: false, error: 'Surat keluar tidak ditemukan' };
    }

    const currentYear = new Date().getFullYear();
    const countTotal = await db.$count(outgoingLetters, isNull(outgoingLetters.deletedAt));
    const nextSeq = (countTotal + 1).toString().padStart(3, '0');

    // Generate nomor surat resmi sesuai standar Perbup Sumedang No. 9/2026
    const nomorSuratGenerated =
      letter.nomorSurat ||
      generateNomorNaskahDinas({
        kodeJenisSurat: letter.jenisSurat?.kode || 'SD',
        nomorUrut: countTotal + 1,
        kodeKlasifikasi: letter.klasifikasi?.kode || '000',
        kodePerangkatDaerah: 'Disdik',
        kodeBagianBidang: letter.unitKerja?.kode || 'TU',
        derajatKeamanan: 'B',
        tanggal: letter.tanggalSurat || new Date(),
      });

    const jenisKode = letter.jenisSurat?.kode || 'SK';
    const nomorAgendaGenerated = letter.nomorAgenda || `${nextSeq}/${jenisKode}/${currentYear}`;
    const tanggalTerbitStr = new Date().toISOString().split('T')[0];

    await db
      .update(outgoingLetters)
      .set({
        nomorSurat: nomorSuratGenerated,
        nomorAgenda: nomorAgendaGenerated,
        status: 'APPROVED',
        tanggalTerbit: tanggalTerbitStr,
        updatedAt: new Date(),
      })
      .where(eq(outgoingLetters.id, id));

    await logActivity({
      userId: user.id!,
      action: 'APPROVE',
      entityType: 'SURAT_KELUAR',
      entityId: id,
      details: { nomorSurat: nomorSuratGenerated },
    });

    revalidatePath(`/surat-keluar/${id}`);
    revalidatePath('/surat-keluar');
    revalidatePath('/agenda-digital');
    return { success: true, nomorSurat: nomorSuratGenerated };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal menyetujui surat keluar';
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

export async function deleteOutgoingAttachment(attachmentId: string) {
  try {
    const user = await requireAuth('SURAT_KELUAR_UPDATE');
    const existing = await db.query.letterAttachments.findFirst({
      where: eq(letterAttachments.id, attachmentId),
    });

    if (!existing) return { success: false, error: 'Lampiran tidak ditemukan' };

    await db.delete(letterAttachments).where(eq(letterAttachments.id, attachmentId));

    await logActivity({
      userId: user.id!,
      action: 'DELETE_ATTACHMENT',
      entityType: 'letter_attachments',
      entityId: attachmentId,
      details: { namaFile: existing.namaFile },
    });

    revalidatePath(`/surat-keluar/${existing.suratId}`);
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal menghapus lampiran';
    return { success: false, error: msg };
  }
}
