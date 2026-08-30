'use server';

import { db } from '@/db';
import {
  outgoingLetters,
  masterUnitKerja,
  masterPegawai,
  masterSekolah,
  documentHeaders,
  letterAttachments,
  masterPenandatangan,
} from '@/db/schema';
import { eq, isNull, and, ilike, desc, or } from 'drizzle-orm';
import { InsertOutgoingLetter } from '../types';
import { revalidatePath } from 'next/cache';
import { requireAuth, logActivity } from '@/lib/server-action';
import { generateNomorNaskahDinas } from '@/lib/nomor-surat-generator';

export async function getSuratKeluarList(params?: {
  search?: string;
  limit?: number;
  offset?: number;
  status?: string;
}) {
  try {
    await requireAuth('SURAT_KELUAR_READ');

    const search = params?.search;
    const limit = params?.limit;
    const offset = params?.offset ?? 0;
    const status = params?.status;

    const whereClause = and(
      isNull(outgoingLetters.deletedAt),
      status ? eq(outgoingLetters.status, status) : undefined,
      search
        ? or(
            ilike(outgoingLetters.perihal, `%${search}%`),
            ilike(outgoingLetters.nomorSurat, `%${search}%`),
            ilike(outgoingLetters.tujuanSurat, `%${search}%`),
          )
        : undefined,
    );

    const data = await db.query.outgoingLetters.findMany({
      where: whereClause,
      with: {
        jenisSurat: true,
        instansiTujuan: true,
        pembuat: true,
        penandatangan: true,
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
    
    // Cegah edit konten jika sudah APPROVED / SIGNED tanpa pembatalan/revisi resmi
    const existing = await db.query.outgoingLetters.findFirst({
      where: eq(outgoingLetters.id, id),
    });

    if (existing && (existing.status === 'APPROVED' || existing.status === 'PUBLISHED') && !data.status) {
      return { success: false, error: 'Dokumen yang telah disetujui / diterbitkan bersifat immutable dan tidak dapat diubah langsung.' };
    }

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
    revalidatePath(`/surat-keluar/${id}`);
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal mengubah surat keluar';
    return { success: false, error: msg };
  }
}

/**
 * Pengajuan Surat Keluar ke Tahap Pemeriksaan (Review)
 */
export async function submitSuratKeluarForReview(id: string) {
  try {
    const user = await requireAuth('SURAT_KELUAR_UPDATE');
    await db
      .update(outgoingLetters)
      .set({ status: 'DIAJUKAN', statusDetail: 'Diajukan untuk verifikasi redaksi KTU', updatedAt: new Date() })
      .where(eq(outgoingLetters.id, id));

    await logActivity({
      userId: user.id!,
      action: 'SUBMIT_REVIEW',
      entityType: 'SURAT_KELUAR',
      entityId: id,
    });

    revalidatePath(`/surat-keluar/${id}`);
    revalidatePath('/surat-keluar');
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal mengajukan surat keluar';
    return { success: false, error: msg };
  }
}

/**
 * Verifikasi Redaksi oleh KTU (Menyetujui redaksi & meneruskan ke Kepala Sekolah untuk TTE)
 */
export async function verifySuratKeluar(id: string) {
  try {
    const user = await requireAuth('SURAT_KELUAR_APPROVE');
    await db
      .update(outgoingLetters)
      .set({
        status: 'DIPERIKSA',
        statusDetail: 'Redaksi disetujui KTU, menunggu TTE Kepala Sekolah',
        updatedAt: new Date(),
      })
      .where(eq(outgoingLetters.id, id));

    await logActivity({
      userId: user.id!,
      action: 'VERIFY_REVIEW',
      entityType: 'SURAT_KELUAR',
      entityId: id,
    });

    revalidatePath(`/surat-keluar/${id}`);
    revalidatePath('/surat-keluar');
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal memverifikasi redaksi surat';
    return { success: false, error: msg };
  }
}

/**
 * Pengembalian Surat untuk Revisi oleh KTU / Kepala Sekolah
 */
export async function requestRevisionSuratKeluar(id: string, catatanRevisi?: string) {
  try {
    const user = await requireAuth('SURAT_KELUAR_APPROVE');
    await db
      .update(outgoingLetters)
      .set({
        status: 'REVISI',
        statusDetail: catatanRevisi || 'Perlu perbaikan redaksi atau format naskah',
        updatedAt: new Date(),
      })
      .where(eq(outgoingLetters.id, id));

    await logActivity({
      userId: user.id!,
      action: 'REQUEST_REVISION',
      entityType: 'SURAT_KELUAR',
      entityId: id,
      details: { catatan: catatanRevisi },
    });

    revalidatePath(`/surat-keluar/${id}`);
    revalidatePath('/surat-keluar');
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal meminta revisi surat';
    return { success: false, error: msg };
  }
}


/**
 * Persetujuan & Penandatanganan Surat Keluar (Menghasilkan Nomor Resmi & Document Snapshot Immutable)
 */
export async function approveSuratKeluar(id: string) {
  try {
    const user = await requireAuth('SURAT_KELUAR_APPROVE');

    const letter = await db.query.outgoingLetters.findFirst({
      where: and(eq(outgoingLetters.id, id), isNull(outgoingLetters.deletedAt)),
      with: {
        klasifikasi: true,
        jenisSurat: true,
        unitKerja: true,
        instansiTujuan: true,
        pembuat: true,
        penandatangan: true,
      },
    });

    if (!letter) {
      return { success: false, error: 'Surat keluar tidak ditemukan atau sudah dihapus' };
    }

    const currentYear = new Date().getFullYear();
    const countThisYear = await db.$count(
      outgoingLetters,
      and(
        isNull(outgoingLetters.deletedAt),
        ilike(outgoingLetters.nomorAgenda, `%/SK/${currentYear}`)
      )
    );
    const nextSeq = (countThisYear + 1).toString().padStart(3, '0');

    // Generate nomor surat resmi sesuai standar Perbup Sumedang No. 9/2026
    const nomorSuratGenerated =
      letter.nomorSurat ||
      generateNomorNaskahDinas({
        kodeJenisSurat: letter.jenisSurat?.kode || 'SD',
        nomorUrut: countThisYear + 1,
        kodeKlasifikasi: letter.klasifikasi?.kode || '000',
        kodePerangkatDaerah: 'Disdik',
        kodeBagianBidang: letter.unitKerja?.kode || 'TU',
        derajatKeamanan: 'B',
        tanggal: letter.tanggalSurat || new Date(),
      });

    const jenisKode = letter.jenisSurat?.kode || 'SK';
    const nomorAgendaGenerated = letter.nomorAgenda || `${nextSeq}/${jenisKode}/${currentYear}`;
    const tanggalTerbitStr = new Date().toISOString().split('T')[0];
    const now = new Date();

    // Ambil Data Master untuk Pembuatan Snapshot Historis
    const [sekolah, kopSurat, penandatanganAktif] = await Promise.all([
      db.query.masterSekolah.findFirst({ where: eq(masterSekolah.isAktif, true) }),
      db.query.documentHeaders.findFirst({
        where: and(eq(documentHeaders.isDefault, true), eq(documentHeaders.isAktif, true)),
      }),
      db.query.masterPenandatangan.findFirst({
        where: and(eq(masterPenandatangan.isAktif, true)),
        with: { pegawai: true, jabatan: true },
      }),
    ]);

    const signerPegawai = letter.penandatangan || penandatanganAktif?.pegawai;
    const signerName = signerPegawai?.nama || 'Kepala Sekolah';
    const signerNip = penandatanganAktif?.nipLabel || (signerPegawai?.nip ? `NIP. ${signerPegawai.nip}` : '-');
    const signerTitle = penandatanganAktif?.jabatanDokumen || signerPegawai?.jabatanId || 'Kepala Sekolah';

    const signerSnapshot = {
      nama: signerName,
      nip: signerNip,
      jabatanDokumen: signerTitle,
      pangkatGolongan: signerPegawai?.pangkatGolongan || null,
      jenisTtd: penandatanganAktif?.jenisTtd || 'DIGITAL_LOCAL',
      signedAt: now.toISOString(),
      signedByUserId: user.id,
    };

    const documentSnapshot = {
      nomorSurat: nomorSuratGenerated,
      nomorAgenda: nomorAgendaGenerated,
      tanggalSurat: letter.tanggalSurat,
      tanggalTerbit: tanggalTerbitStr,
      perihal: letter.perihal,
      tujuanSurat: letter.tujuanSurat,
      instansiTujuan: letter.instansiTujuan?.nama || null,
      jenisSurat: letter.jenisSurat?.nama || 'Surat Dinas',
      kodeKlasifikasi: letter.klasifikasi?.kode || '000',
      namaKlasifikasi: letter.klasifikasi?.nama || 'Umum',
      sekolah: {
        nama: kopSurat?.namaSekolah || sekolah?.nama || 'SMP NEGERI 1 UJUNGJAYA',
        npsn: sekolah?.npsn || null,
        alamat: kopSurat?.alamat || sekolah?.alamat || null,
        kontak: kopSurat?.kontak || sekolah?.telepon || null,
        website: kopSurat?.website || sekolah?.website || null,
        logoKiri: kopSurat?.logoKiriUrl || kopSurat?.logoUrl || null,
        logoKanan: kopSurat?.logoKananUrl || null,
        instansiUtama: kopSurat?.instansiUtama || 'PEMERINTAH DAERAH KABUPATEN SUMEDANG',
        instansiInduk: kopSurat?.instansiInduk || 'DINAS PENDIDIKAN',
      },
      signer: signerSnapshot,
      approvedAt: now.toISOString(),
    };

    await db
      .update(outgoingLetters)
      .set({
        nomorSurat: nomorSuratGenerated,
        nomorAgenda: nomorAgendaGenerated,
        status: 'APPROVED',
        tanggalTerbit: tanggalTerbitStr,
        signedAt: now,
        signerSnapshot,
        documentSnapshot,
        updatedAt: now,
      })
      .where(eq(outgoingLetters.id, id));

    await logActivity({
      userId: user.id!,
      action: 'APPROVE',
      entityType: 'SURAT_KELUAR',
      entityId: id,
      details: { nomorSurat: nomorSuratGenerated, signer: signerName },
    });

    revalidatePath(`/surat-keluar/${id}`);
    revalidatePath('/surat-keluar');
    revalidatePath('/agenda-digital');
    revalidatePath('/dashboard');
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
