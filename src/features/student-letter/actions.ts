'use server';

import { db } from '@/db';
import {
  studentLetters,
  studentLetterParticipants,
  masterSiswa,
  masterPegawai,
  masterSekolah,
} from '@/db/schema';
import { eq, isNull, desc, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { requireAuth, logActivity } from '@/lib/server-action';

// ==========================================
// GET LIST — filter di DB level
// ==========================================
export async function getStudentLetters(params?: { tipeSurat?: string }) {
  try {
    await requireAuth();

    const whereClause = and(
      isNull(studentLetters.deletedAt),
      params?.tipeSurat ? eq(studentLetters.tipeSurat, params.tipeSurat) : undefined,
    );

    const data = await db.query.studentLetters.findMany({
      where: whereClause,
      with: {
        siswa: {
          with: { kelas: true },
        },
        kelas: true,
        guruPendamping: true,
        participants: {
          with: {
            siswa: {
              with: { kelas: true },
            },
          },
        },
      },
      orderBy: [desc(studentLetters.createdAt)],
    });

    return { success: true, data };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal mengambil surat siswa';
    return { success: false, error: msg };
  }
}

// ==========================================
// GET BY ID
// ==========================================
export async function getStudentLetterById(id: string) {
  try {
    await requireAuth();

    const letter = await db.query.studentLetters.findFirst({
      where: eq(studentLetters.id, id),
      with: {
        siswa: {
          with: { kelas: true },
        },
        kelas: true,
        guruPendamping: true,
        participants: {
          with: {
            siswa: {
              with: { kelas: true },
            },
          },
        },
      },
    });

    if (!letter) return { success: false, error: 'Surat tidak ditemukan' };

    const sekolah = await db.query.masterSekolah.findFirst({
      where: eq(masterSekolah.isAktif, true),
    });

    const kepsek = await db.query.masterPegawai.findFirst({
      where: eq(masterPegawai.isAktif, true),
    });

    return { success: true, data: letter, sekolah, kepsek };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal mengambil detail surat';
    return { success: false, error: msg };
  }
}

// ==========================================
// DELETE (SOFT DELETE)
// ==========================================
export async function deleteStudentLetter(id: string) {
  try {
    const user = await requireAuth();

    const existing = await db.query.studentLetters.findFirst({
      where: eq(studentLetters.id, id),
    });
    if (!existing) return { success: false, error: 'Surat tidak ditemukan' };

    await db
      .update(studentLetters)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(studentLetters.id, id));

    await logActivity({
      userId: user.id!,
      action: 'DELETE',
      entityType: 'SURAT_SISWA',
      entityId: id,
      details: { tipeSurat: existing.tipeSurat, nomorSurat: existing.nomorSurat },
    });

    revalidatePath('/surat-siswa');
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal menghapus surat';
    return { success: false, error: msg };
  }
}

// ==========================================
// CREATE DISPENSASI
// ==========================================
export interface CreateDispensasiInput {
  namaKegiatan: string;
  lokasiKegiatan: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  guruPendampingId?: string;
  keperluan: string;
  siswaIds: string[];
}

export async function createSuratDispensasi(input: CreateDispensasiInput) {
  try {
    const user = await requireAuth();

    const currentYear = new Date().getFullYear();
    const countTotal = await db.$count(studentLetters, isNull(studentLetters.deletedAt));
    const nextSeq = (countTotal + 1).toString().padStart(3, '0');
    const nomorSurat = `421.2/${nextSeq}/DISPEN/SMA-01/${currentYear}`;

    const [created] = await db
      .insert(studentLetters)
      .values({
        tipeSurat: 'DISPENSASI',
        nomorSurat,
        namaKegiatan: input.namaKegiatan,
        lokasiKegiatan: input.lokasiKegiatan,
        tanggalMulai: input.tanggalMulai,
        tanggalSelesai: input.tanggalSelesai,
        guruPendampingId: input.guruPendampingId || null,
        keperluan: input.keperluan,
        status: 'APPROVED',
      })
      .returning();

    if (input.siswaIds && input.siswaIds.length > 0) {
      await db.insert(studentLetterParticipants).values(
        input.siswaIds.map((sId) => ({
          studentLetterId: created.id,
          siswaId: sId,
          peran: 'Peserta Kegiatan',
        })),
      );
    }

    await logActivity({
      userId: user.id!,
      action: 'CREATE',
      entityType: 'SURAT_DISPENSASI',
      entityId: created.id,
      details: { nomorSurat, kegiatan: input.namaKegiatan },
    });

    revalidatePath('/surat-siswa');
    return { success: true, data: created };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal membuat surat dispensasi';
    return { success: false, error: msg };
  }
}

// ==========================================
// CREATE KETERANGAN AKTIF
// ==========================================
export interface CreateKeteranganAktifInput {
  siswaId: string;
  keperluan: string;
}

export async function createSuratKeteranganAktif(input: CreateKeteranganAktifInput) {
  try {
    const user = await requireAuth();

    const siswa = await db.query.masterSiswa.findFirst({
      where: eq(masterSiswa.id, input.siswaId),
    });

    if (!siswa) return { success: false, error: 'Siswa tidak ditemukan' };

    const currentYear = new Date().getFullYear();
    const countTotal = await db.$count(studentLetters, isNull(studentLetters.deletedAt));
    const nextSeq = (countTotal + 1).toString().padStart(3, '0');
    const nomorSurat = `421.2/${nextSeq}/KET-AKTIF/SMA-01/${currentYear}`;

    const [created] = await db
      .insert(studentLetters)
      .values({
        tipeSurat: 'KETERANGAN_AKTIF',
        nomorSurat,
        siswaId: input.siswaId,
        kelasId: siswa.kelasId,
        keperluan: input.keperluan,
        status: 'APPROVED',
      })
      .returning();

    await logActivity({
      userId: user.id!,
      action: 'CREATE',
      entityType: 'SURAT_KET_AKTIF',
      entityId: created.id,
      details: { nomorSurat, siswa: siswa.nama },
    });

    revalidatePath('/surat-siswa');
    return { success: true, data: created };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal membuat surat keterangan aktif';
    return { success: false, error: msg };
  }
}

// ==========================================
// CREATE PANGGILAN ORTU
// ==========================================
export interface CreatePanggilanOrtuInput {
  siswaId: string;
  waktuMenghadap: string;
  menghadapKepada: string;
  ruangan: string;
  keperluan: string;
  catatanKhusus?: string;
}

export async function createSuratPanggilanOrtu(input: CreatePanggilanOrtuInput) {
  try {
    const user = await requireAuth();

    const siswa = await db.query.masterSiswa.findFirst({
      where: eq(masterSiswa.id, input.siswaId),
    });

    if (!siswa) return { success: false, error: 'Siswa tidak ditemukan' };

    const currentYear = new Date().getFullYear();
    const countTotal = await db.$count(studentLetters, isNull(studentLetters.deletedAt));
    const nextSeq = (countTotal + 1).toString().padStart(3, '0');
    const nomorSurat = `421.2/${nextSeq}/PANGGILAN-ORTU/SMA-01/${currentYear}`;

    const [created] = await db
      .insert(studentLetters)
      .values({
        tipeSurat: 'PANGGILAN_ORTU',
        nomorSurat,
        siswaId: input.siswaId,
        kelasId: siswa.kelasId,
        waktuMenghadap: input.waktuMenghadap,
        menghadapKepada: input.menghadapKepada,
        ruangan: input.ruangan,
        keperluan: input.keperluan,
        catatanKhusus: input.catatanKhusus,
        status: 'APPROVED',
      })
      .returning();

    await logActivity({
      userId: user.id!,
      action: 'CREATE',
      entityType: 'SURAT_PANGGILAN_ORTU',
      entityId: created.id,
      details: { nomorSurat, siswa: siswa.nama },
    });

    revalidatePath('/surat-siswa');
    return { success: true, data: created };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal membuat surat panggilan';
    return { success: false, error: msg };
  }
}
