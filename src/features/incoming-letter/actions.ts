'use server';

import { db } from '@/db';
import {
  incomingLetters,
  incomingTimelines,
  incomingLogs,
  incomingDistributions,
  incomingDispositions,
  incomingLetterAttachments,
} from '@/db/schema/incoming-letter';
import { notifications } from '@/db/schema/workspace';
import { requireAuth, logActivity } from '@/lib/server-action';
import {
  incomingLetterSchema,
  IncomingLetterFormValues,
  distributeLetterSchema,
  DistributeLetterFormValues,
  dispositionLetterSchema,
  DispositionLetterFormValues,
} from './validations';
import { eq, desc, and, isNull, ilike, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// ==========================================
// HELPER: Kirim notifikasi ke user
// ==========================================
async function sendNotification(params: {
  userId: string;
  judul: string;
  pesan: string;
  tipe?: string;
  linkUrl?: string;
  kategori?: string;
}) {
  try {
    await db.insert(notifications).values({
      userId: params.userId,
      judul: params.judul,
      pesan: params.pesan,
      tipe: params.tipe || 'Info',
      linkUrl: params.linkUrl,
      kategori: params.kategori,
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

// ==========================================
// GET LIST — search berfungsi
// ==========================================
export async function getIncomingLetters(params?: {
  search?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    await requireAuth('SURAT_MASUK_READ');

    const search = params?.search;
    const limit = params?.limit;
    const offset = params?.offset ?? 0;

    const whereClause = and(
      isNull(incomingLetters.deletedAt),
      search
        ? or(
            ilike(incomingLetters.nomorSurat, `%${search}%`),
            ilike(incomingLetters.pengirim, `%${search}%`),
            ilike(incomingLetters.perihal, `%${search}%`),
          )
        : undefined,
    );

    const data = await db.query.incomingLetters.findMany({
      where: whereClause,
      ...(limit ? { limit, offset } : {}),
      with: {
        instansiPengirim: true,
        jenisSurat: true,
      },
      orderBy: [desc(incomingLetters.createdAt)],
    });

    if (limit) {
      const totalRecordsResult = await db.$count(incomingLetters, whereClause);
      const totalRecords = typeof totalRecordsResult === 'number' ? totalRecordsResult : 0;
      const totalPages = Math.ceil(totalRecords / limit);
      return {
        success: true,
        data,
        metadata: {
          totalRecords,
          totalPages,
          page: Math.floor(offset / limit) + 1,
          limit,
        },
      };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal mengambil data surat masuk' };
  }
}

// ==========================================
// GET BY ID
// ==========================================
export async function getIncomingLetterById(id: string) {
  try {
    await requireAuth('SURAT_MASUK_READ');
    const data = await db.query.incomingLetters.findFirst({
      where: eq(incomingLetters.id, id),
      with: {
        instansiPengirim: true,
        jenisSurat: true,
        klasifikasi: true,
        prioritas: true,
        sifatSurat: true,
        tujuanUnit: true,
        penerima: true,
      },
    });
    if (!data) return { success: false, error: 'Surat tidak ditemukan' };
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal mengambil data' };
  }
}

// ==========================================
// CREATE (REGISTER) — auto nomor agenda
// ==========================================
export async function registerIncomingLetter(data: IncomingLetterFormValues) {
  const user = await requireAuth();

  const validatedFields = incomingLetterSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      error: 'Data tidak valid',
      details: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await db.transaction(async (tx) => {
      // Generate nomor agenda otomatis
      const year = new Date().getFullYear();
      const countExisting = await tx.$count(incomingLetters, isNull(incomingLetters.deletedAt));
      const nextSeq = (countExisting + 1).toString().padStart(3, '0');
      const nomorAgenda = `${nextSeq}/SM/${year}`;

      const [newLetter] = await tx
        .insert(incomingLetters)
        .values({
          ...validatedFields.data,
          nomorAgenda,
          status: 'REGISTERED',
          createdBy: user.id,
        })
        .returning();

      await tx.insert(incomingTimelines).values({
        suratId: newLetter.id,
        aktorId: user.id,
        aktivitas: 'Registrasi',
        deskripsi: `Surat masuk diregistrasi. Nomor Agenda: ${nomorAgenda}`,
      });

      await tx.insert(incomingLogs).values({
        suratId: newLetter.id,
        aktorId: user.id,
        aksi: 'CREATE',
        keterangan: 'Registrasi surat masuk baru',
        dataBaru: newLetter,
      });

      await logActivity({
        userId: user.id,
        action: 'CREATE',
        entityType: 'incoming_letters',
        entityId: newLetter.id,
        details: { nomorSurat: newLetter.nomorSurat, nomorAgenda },
      });

      return newLetter;
    });

    revalidatePath('/surat-masuk');
    revalidatePath('/agenda-digital');
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error registerIncomingLetter:', error);
    return { error: 'Gagal meregistrasi surat', message: error.message };
  }
}

// ==========================================
// UPDATE (EDIT)
// ==========================================
export async function updateIncomingLetter(id: string, data: IncomingLetterFormValues) {
  const user = await requireAuth();

  const validatedFields = incomingLetterSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      error: 'Data tidak valid',
      details: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const existing = await db.query.incomingLetters.findFirst({
      where: eq(incomingLetters.id, id),
    });
    if (!existing) return { error: 'Surat tidak ditemukan' };

    await db.transaction(async (tx) => {
      await tx
        .update(incomingLetters)
        .set({ ...validatedFields.data, updatedAt: new Date() })
        .where(eq(incomingLetters.id, id));

      await tx.insert(incomingTimelines).values({
        suratId: id,
        aktorId: user.id,
        aktivitas: 'Edit',
        deskripsi: 'Data surat masuk diperbarui.',
      });

      await tx.insert(incomingLogs).values({
        suratId: id,
        aktorId: user.id,
        aksi: 'UPDATE',
        keterangan: 'Pembaruan data surat masuk',
        dataLama: existing,
        dataBaru: validatedFields.data,
      });

      await logActivity({
        userId: user.id,
        action: 'UPDATE',
        entityType: 'incoming_letters',
        entityId: id,
      });
    });

    revalidatePath('/surat-masuk');
    revalidatePath(`/surat-masuk/${id}`);
    return { success: true };
  } catch (error: any) {
    return { error: 'Gagal memperbarui surat', message: error.message };
  }
}

// ==========================================
// DELETE (SOFT DELETE)
// ==========================================
export async function deleteIncomingLetter(id: string) {
  const user = await requireAuth();

  try {
    const existing = await db.query.incomingLetters.findFirst({
      where: eq(incomingLetters.id, id),
    });
    if (!existing) return { error: 'Surat tidak ditemukan' };

    await db
      .update(incomingLetters)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(incomingLetters.id, id));

    await logActivity({
      userId: user.id,
      action: 'DELETE',
      entityType: 'incoming_letters',
      entityId: id,
      details: { nomorSurat: existing.nomorSurat },
    });

    revalidatePath('/surat-masuk');
    return { success: true };
  } catch (error: any) {
    return { error: 'Gagal menghapus surat', message: error.message };
  }
}

// ==========================================
// DISTRIBUTE
// ==========================================
export async function distributeIncomingLetter(
  suratId: string,
  data: DistributeLetterFormValues,
) {
  const user = await requireAuth();

  const validatedFields = distributeLetterSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      error: 'Data tidak valid',
      details: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await db.transaction(async (tx) => {
      await tx
        .update(incomingLetters)
        .set({ status: 'DISTRIBUTED' })
        .where(eq(incomingLetters.id, suratId));

      const [newDistribution] = await tx
        .insert(incomingDistributions)
        .values({
          ...validatedFields.data,
          suratId,
          pengirimId: user.id,
          status: 'TERKIRIM',
          createdBy: user.id,
          deadline: validatedFields.data.deadline ? new Date(validatedFields.data.deadline) : null,
        })
        .returning();

      await tx.insert(incomingTimelines).values({
        suratId,
        aktorId: user.id,
        aktivitas: 'Distribusi',
        deskripsi: `Surat didistribusikan ke ${validatedFields.data.tujuanUnitId ? 'Unit Kerja' : 'Pegawai'}`,
      });

      await logActivity({
        userId: user.id,
        action: 'DISTRIBUTE',
        entityType: 'incoming_letters',
        entityId: suratId,
      });

      return newDistribution;
    });

    revalidatePath(`/surat-masuk/${suratId}`);
    return { success: true, data: result };
  } catch (error: any) {
    return { error: 'Gagal mendistribusikan surat', message: error.message };
  }
}

// ==========================================
// DISPOSISI — CREATE
// ==========================================
export async function createInitialDisposition(
  suratId: string,
  data: DispositionLetterFormValues,
) {
  const user = await requireAuth();

  const validatedFields = dispositionLetterSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      error: 'Data tidak valid',
      details: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await db.transaction(async (tx) => {
      await tx
        .update(incomingLetters)
        .set({ status: 'DISPOSITIONED' })
        .where(eq(incomingLetters.id, suratId));

      const [newDisposition] = await tx
        .insert(incomingDispositions)
        .values({
          suratId,
          pemberiDisposisiId: user.id,
          penerimaDisposisiId: validatedFields.data.penerimaDisposisiId,
          instruksi: validatedFields.data.instruksi,
          catatan: validatedFields.data.catatan,
          status: 'MENUNGGU',
          createdBy: user.id,
          deadline: validatedFields.data.deadline ? new Date(validatedFields.data.deadline) : null,
        })
        .returning();

      await tx.insert(incomingTimelines).values({
        suratId,
        aktorId: user.id,
        aktivitas: 'Disposisi',
        deskripsi: `Disposisi diberikan. Instruksi: ${validatedFields.data.instruksi}`,
      });

      await logActivity({
        userId: user.id,
        action: 'DISPOSITION',
        entityType: 'incoming_letters',
        entityId: suratId,
      });

      return newDisposition;
    });

    // Kirim notifikasi ke penerima disposisi
    await sendNotification({
      userId: validatedFields.data.penerimaDisposisiId,
      judul: 'Disposisi Surat Masuk Baru',
      pesan: `Anda mendapatkan disposisi baru. Instruksi: ${validatedFields.data.instruksi}`,
      tipe: 'Info',
      linkUrl: `/surat-masuk/${suratId}`,
      kategori: 'Disposisi',
    });

    revalidatePath(`/surat-masuk/${suratId}`);
    revalidatePath('/disposisi-saya');
    return { success: true, data: result };
  } catch (error: any) {
    return { error: 'Gagal membuat disposisi', message: error.message };
  }
}

// ==========================================
// DISPOSISI — UPDATE STATUS
// ==========================================
export async function updateDispositionStatus(
  dispositionId: string,
  status: 'PROSES' | 'SELESAI',
  catatan?: string,
) {
  const user = await requireAuth();

  try {
    const existing = await db.query.incomingDispositions.findFirst({
      where: eq(incomingDispositions.id, dispositionId),
    });

    if (!existing) return { error: 'Disposisi tidak ditemukan' };

    if (existing.penerimaDisposisiId !== user.id) {
      return { error: 'Hanya penerima disposisi yang dapat memperbarui status ini' };
    }

    await db.transaction(async (tx) => {
      await tx
        .update(incomingDispositions)
        .set({
          status,
          catatan: catatan ?? existing.catatan,
          updatedAt: new Date(),
        })
        .where(eq(incomingDispositions.id, dispositionId));

      if (status === 'SELESAI') {
        await tx
          .update(incomingLetters)
          .set({ status: 'COMPLETED', updatedAt: new Date() })
          .where(eq(incomingLetters.id, existing.suratId));
      }

      await tx.insert(incomingTimelines).values({
        suratId: existing.suratId,
        aktorId: user.id,
        aktivitas: status === 'SELESAI' ? 'Selesai' : 'Diproses',
        deskripsi:
          status === 'SELESAI'
            ? `Disposisi diselesaikan.${catatan ? ` Catatan: ${catatan}` : ''}`
            : 'Disposisi sedang diproses.',
      });

      await logActivity({
        userId: user.id,
        action: `DISPOSITION_${status}`,
        entityType: 'incoming_dispositions',
        entityId: dispositionId,
      });
    });

    revalidatePath(`/surat-masuk/${existing.suratId}`);
    revalidatePath('/disposisi-saya');
    return { success: true };
  } catch (error: any) {
    return { error: 'Gagal memperbarui status disposisi', message: error.message };
  }
}

// ==========================================
// GET DISPOSISI SAYA
// ==========================================
export async function getMyDispositions(params?: {
  status?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    const user = await requireAuth();

    const whereClause = and(
      eq(incomingDispositions.penerimaDisposisiId, user.id),
      params?.status ? eq(incomingDispositions.status, params.status) : undefined,
    );

    const data = await db.query.incomingDispositions.findMany({
      where: whereClause,
      with: {
        surat: {
          with: {
            instansiPengirim: true,
            jenisSurat: true,
          },
        },
        pemberiDisposisi: true,
      },
      orderBy: [desc(incomingDispositions.createdAt)],
      ...(params?.limit ? { limit: params.limit, offset: params?.offset ?? 0 } : {}),
    });

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal mengambil data disposisi' };
  }
}

// ==========================================
// DELETE ATTACHMENT
// ==========================================
export async function deleteIncomingAttachment(attachmentId: string) {
  try {
    const user = await requireAuth('SURAT_MASUK_WRITE');
    const existing = await db.query.incomingLetterAttachments.findFirst({
      where: eq(incomingLetterAttachments.id, attachmentId),
    });

    if (!existing) return { success: false, error: 'Lampiran tidak ditemukan' };

    await db.delete(incomingLetterAttachments).where(eq(incomingLetterAttachments.id, attachmentId));

    await logActivity({
      userId: user.id,
      action: 'DELETE_ATTACHMENT',
      entityType: 'incoming_letter_attachments',
      entityId: attachmentId,
      details: { namaFile: existing.namaFile },
    });

    revalidatePath(`/surat-masuk/${existing.suratId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal menghapus lampiran' };
  }
}

