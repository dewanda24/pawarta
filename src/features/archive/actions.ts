'use server';

import { db } from '@/db';
import {
  archives,
  archiveHistories,
  archiveBorrowings,
  documentHashes,
  documentVerifications,
  documentFavorites,
  retentionPolicies,
} from '@/db/schema/archive';
import { requireAuth, logActivity } from '@/lib/server-action';
import {
  archiveDocumentSchema,
  ArchiveDocumentFormValues,
  borrowArchiveSchema,
  BorrowArchiveFormValues,
} from './validations';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { eq, and, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

/**
 * Arsipkan dokumen ke modul Digital Archive
 */
export async function archiveDocument(data: ArchiveDocumentFormValues) {
  const user = await requireAuth();

  const validatedFields = archiveDocumentSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      error: 'Data tidak valid',
      details: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await db.transaction(async (tx) => {
      // 1. Hitung Tanggal Retensi jika ada Policy
      let tanggalRetensiBerakhir: Date | null = null;
      if (validatedFields.data.retentionPolicyId) {
        const [policy] = await tx
          .select()
          .from(retentionPolicies)
          .where(eq(retentionPolicies.id, validatedFields.data.retentionPolicyId));
        if (policy) {
          tanggalRetensiBerakhir = new Date();
          tanggalRetensiBerakhir.setFullYear(
            tanggalRetensiBerakhir.getFullYear() + policy.masaAktifTahun,
          );
        }
      }

      // 2. Generate Nomor Arsip unik
      const nomorArsip = `AR-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

      // 3. Create Archive
      const [newArchive] = await tx
        .insert(archives)
        .values({
          entityType: validatedFields.data.entityType,
          incomingLetterId:
            validatedFields.data.entityType === 'INCOMING' ? validatedFields.data.entityId : null,
          outgoingLetterId:
            validatedFields.data.entityType === 'OUTGOING' ? validatedFields.data.entityId : null,
          kategoriId: validatedFields.data.kategoriId,
          nomorArsip,
          perihal: validatedFields.data.perihal,
          tahun: validatedFields.data.tahun,
          lokasiFisik: validatedFields.data.lokasiFisik,
          folderVirtual: validatedFields.data.folderVirtual,
          retentionPolicyId: validatedFields.data.retentionPolicyId,
          tanggalRetensiBerakhir,
          metadata: validatedFields.data.metadata,
          searchVector: validatedFields.data.perihal, // Simple TSVector simulation for now
          createdBy: user.id,
        })
        .returning();

      // 4. Add History
      await tx.insert(archiveHistories).values({
        archiveId: newArchive.id,
        aktorId: user.id,
        aksi: 'DIBUAT',
        deskripsi: 'Dokumen berhasil diarsipkan ke Digital Archive.',
      });

      await logActivity({
        userId: user.id,
        action: 'ARCHIVE',
        entityType: 'archives',
        entityId: newArchive.id,
        details: { deskripsi: 'Mengarsipkan dokumen', nomorArsip },
      });

      return newArchive;
    });

    revalidatePath('/arsip');
    return { success: true, data: result };
  } catch (error: unknown) {
    console.error('Error archiveDocument:', error);
    return { error: 'Gagal mengarsipkan dokumen', message: error.message };
  }
}

/**
 * Pinjam Arsip (Fisik/Digital)
 */
export async function borrowArchive(data: BorrowArchiveFormValues) {
  const user = await requireAuth();

  const validatedFields = borrowArchiveSchema.safeParse(data);
  if (!validatedFields.success) {
    return { error: 'Data tidak valid' };
  }

  try {
    const result = await db.transaction(async (tx) => {
      // 1. Create Borrowing record
      const [borrowing] = await tx
        .insert(archiveBorrowings)
        .values({
          archiveId: validatedFields.data.archiveId,
          peminjamId: validatedFields.data.peminjamId,
          unitPeminjamId: validatedFields.data.unitPeminjamId,
          tanggalKembaliRencana: new Date(validatedFields.data.tanggalKembaliRencana),
          keperluan: validatedFields.data.keperluan,
          status: 'DIPINJAM', // Langsung dipinjam untuk demo
          createdBy: user.id,
        })
        .returning();

      // 2. Update Archive Status
      await tx
        .update(archives)
        .set({ status: 'DIPINJAM' })
        .where(eq(archives.id, validatedFields.data.archiveId));

      // 3. Add History
      await tx.insert(archiveHistories).values({
        archiveId: validatedFields.data.archiveId,
        aktorId: user.id,
        aksi: 'DIPINJAM',
        deskripsi: `Arsip dipinjam oleh user ID ${validatedFields.data.peminjamId}. Keperluan: ${validatedFields.data.keperluan}`,
      });

      return borrowing;
    });

    revalidatePath(`/arsip/${validatedFields.data.archiveId}`);
    revalidatePath('/peminjaman-arsip');
    return { success: true, data: result };
  } catch (error: unknown) {
    return { error: 'Gagal meminjam arsip', message: error.message };
  }
}

/**
 * Toggle Favorite Dokumen
 */
export async function toggleFavorite(archiveId: string) {
  const user = await requireAuth();

  try {
    const existing = await db
      .select()
      .from(documentFavorites)
      .where(
        and(eq(documentFavorites.userId, user.id), eq(documentFavorites.archiveId, archiveId)),
      );

    if (existing.length > 0) {
      await db
        .delete(documentFavorites)
        .where(
          and(eq(documentFavorites.userId, user.id), eq(documentFavorites.archiveId, archiveId)),
        );
      return { success: true, favorited: false };
    } else {
      await db.insert(documentFavorites).values({
        userId: user.id,
        archiveId: archiveId,
      });
      return { success: true, favorited: true };
    }
  } catch (error: unknown) {
    return { error: 'Gagal mengubah status favorit', message: error.message };
  }
}

/**
 * Verifikasi Dokumen via QR / Hash
 */
export async function verifyDocument(hashSha256: string) {
  try {
    const [docHash] = await db
      .select()
      .from(documentHashes)
      .where(eq(documentHashes.hashSha256, hashSha256));

    if (!docHash) {
      return { isValid: false, message: 'Dokumen tidak ditemukan atau palsu.' };
    }

    // Catat riwayat verifikasi
    await db.insert(documentVerifications).values({
      hashId: docHash.id,
      ipAddress: '127.0.0.1', // Mock IP
      userAgent: 'Browser',
      statusValidasi: true,
    });

    return {
      isValid: true,
      data: docHash,
    };
  } catch (error: unknown) {
    return { error: 'Gagal memverifikasi dokumen', message: error.message };
  }
}
