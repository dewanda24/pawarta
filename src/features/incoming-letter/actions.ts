'use server';

import { db } from '@/db';
import {
  incomingLetters,
  incomingTimelines,
  incomingLogs,
  incomingDistributions,
  incomingDispositions,
} from '@/db/schema/incoming-letter';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getIncomingLetters(params?: { search?: string; limit?: number; offset?: number }) {
  try {
    await requireAuth('SURAT_MASUK_READ');
    
    const search = params?.search;
    const limit = params?.limit;
    const offset = params?.offset ?? 0;

    const whereClause = undefined; // You can add search filter later

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
      return { success: true, data, metadata: { totalRecords, totalPages, page: Math.floor(offset / limit) + 1, limit } };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal mengambil data surat masuk' };
  }
}

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
      // 1. Create Letter
      const [newLetter] = await tx
        .insert(incomingLetters)
        .values({
          ...validatedFields.data,
          status: 'REGISTERED',
          createdBy: user.id,
        })
        .returning();

      // 2. Add to Timeline
      await tx.insert(incomingTimelines).values({
        suratId: newLetter.id,
        aktorId: user.id,
        aktivitas: 'Registrasi',
        deskripsi: 'Surat masuk berhasil diregistrasi ke dalam sistem.',
      });

      // 3. Add to Logs
      await tx.insert(incomingLogs).values({
        suratId: newLetter.id,
        aktorId: user.id,
        aksi: 'CREATE',
        keterangan: 'Registrasi surat masuk baru',
        dataBaru: newLetter,
      });

      // 4. Global Activity Log
      await logActivity({
        userId: user.id,
        action: 'CREATE',
        entityType: 'incoming_letters',
        entityId: newLetter.id,
        details: { deskripsi: 'Registrasi surat masuk baru', nomorSurat: newLetter.nomorSurat },
      });

      return newLetter;
    });

    revalidatePath('/surat-masuk');
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error registerIncomingLetter:', error);
    return { error: 'Gagal meregistrasi surat', message: error.message };
  }
}

export async function distributeIncomingLetter(suratId: string, data: DistributeLetterFormValues) {
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
      // 1. Update Status
      await tx
        .update(incomingLetters)
        .set({ status: 'DISTRIBUTED' })
        .where(eq(incomingLetters.id, suratId));

      // 2. Create Distribution
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

      // 3. Add Timeline
      await tx.insert(incomingTimelines).values({
        suratId,
        aktorId: user.id,
        aktivitas: 'Distribusi',
        deskripsi: `Surat didistribusikan ke ${validatedFields.data.tujuanUnitId ? 'Unit' : 'Pegawai'}`,
      });

      // 4. Log
      await logActivity({
        userId: user.id,
        action: 'DISTRIBUTE',
        entityType: 'incoming_letters',
        entityId: suratId,
        details: { deskripsi: 'Mendistribusikan surat masuk' },
      });

      return newDistribution;
    });

    revalidatePath(`/surat-masuk/${suratId}`);
    return { success: true, data: result };
  } catch (error: any) {
    return { error: 'Gagal mendistribusikan surat', message: error.message };
  }
}

export async function createInitialDisposition(suratId: string, data: DispositionLetterFormValues) {
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
      // 1. Update Status
      await tx
        .update(incomingLetters)
        .set({ status: 'DISPOSITIONED' })
        .where(eq(incomingLetters.id, suratId));

      // 2. Create Disposition
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

      // 3. Add Timeline
      await tx.insert(incomingTimelines).values({
        suratId,
        aktorId: user.id,
        aktivitas: 'Disposisi',
        deskripsi: `Disposisi awal diberikan`,
      });

      // 4. Log
      await logActivity({
        userId: user.id,
        action: 'DISPOSITION',
        entityType: 'incoming_letters',
        entityId: suratId,
        details: { deskripsi: 'Membuat disposisi awal' },
      });

      return newDisposition;
    });

    revalidatePath(`/surat-masuk/${suratId}`);
    return { success: true, data: result };
  } catch (error: any) {
    return { error: 'Gagal membuat disposisi', message: error.message };
  }
}
