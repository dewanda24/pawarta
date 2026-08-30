'use server';

import { db } from '@/db';
import {
  parentConsents,
  masterSiswa,
  masterKelas,
  masterSekolah,
  masterPegawai,
  documentHeaders,
} from '@/db/schema';
import { eq, isNull, desc, and, sql, ilike } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { requireAuth, logActivity } from '@/lib/server-action';
import { generateNomorNaskahDinas } from '@/lib/nomor-surat-generator';

// ============================================================================
// 1. PUBLIC ACTIONS (Tanpa Login — Untuk Orang Tua / Wali)
// ============================================================================

/**
 * Mendapatkan daftar seluruh kelas aktif untuk dropdown publik
 */
export async function getPublicClasses() {
  try {
    const classes = await db.query.masterKelas.findMany({
      where: and(eq(masterKelas.isAktif, true), isNull(masterKelas.deletedAt)),
      orderBy: [masterKelas.tingkat, masterKelas.namaKelas],
    });
    return { success: true, data: classes };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal memuat daftar kelas';
    return { success: false, error: msg, data: [] };
  }
}

/**
 * Mendapatkan daftar siswa aktif berdasarkan kelas untuk dropdown dan autofill
 */
export async function getPublicStudentsByClass(kelasId: string) {
  try {
    if (!kelasId) return { success: true, data: [] };

    const students = await db.query.masterSiswa.findMany({
      where: and(
        eq(masterSiswa.kelasId, kelasId),
        eq(masterSiswa.isAktif, true),
        isNull(masterSiswa.deletedAt),
      ),
      orderBy: [masterSiswa.nama],
      columns: {
        id: true,
        nis: true,
        nisn: true,
        nama: true,
        jenisKelamin: true,
        namaOrtu: true,
        pekerjaanOrtu: true,
        noHpOrtu: true,
        alamat: true,
        kelasId: true,
      },
    });

    return { success: true, data: students };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal memuat daftar siswa';
    return { success: false, error: msg, data: [] };
  }
}

/**
 * Memeriksa status persetujuan yang sudah ada untuk seorang siswa
 */
export async function checkStudentConsentStatus(siswaId: string, kategori = '5_HARI_KERJA') {
  try {
    if (!siswaId) return { hasConsent: false };

    const existing = await db.query.parentConsents.findFirst({
      where: and(
        eq(parentConsents.siswaId, siswaId),
        eq(parentConsents.kategori, kategori),
        isNull(parentConsents.deletedAt),
      ),
      with: {
        siswa: {
          with: { kelas: true },
        },
      },
      orderBy: [desc(parentConsents.createdAt)],
    });

    if (existing) {
      return {
        hasConsent: true,
        consent: {
          id: existing.id,
          nomorSurat: existing.nomorSurat,
          namaOrtu: existing.namaOrtu,
          statusPersetujuan: existing.statusPersetujuan,
          signedAt: existing.signedAt,
          siswaNama: existing.siswa?.nama,
          kelasNama: existing.siswa?.kelas?.namaKelas,
        },
      };
    }

    return { hasConsent: false };
  } catch (error: unknown) {
    console.error('Error checking student consent:', error);
    return { hasConsent: false };
  }
}

export interface SubmitParentConsentInput {
  kategori?: string;
  siswaId: string;
  kelasId?: string;
  namaOrtu: string;
  pekerjaanOrtu?: string;
  noHpOrtu: string;
  alamatOrtu?: string;
  hubungan?: string;
  statusPersetujuan: 'SETUJU' | 'TIDAK_SETUJU';
  alasanPenolakan?: string;
  kesiapanFasilitas?: {
    bekalMakan?: boolean;
    transportasi?: boolean;
    ibadah?: boolean;
    pendampinganBelajar?: boolean;
  };
  ttdDigital: string; // Base64 data URL
}

/**
 * Menyimpan Surat Persetujuan Orang Tua dari form publik
 */
export async function submitParentConsent(input: SubmitParentConsentInput) {
  try {
    if (!input.siswaId) throw new Error('Identitas siswa wajib dipilih');
    if (!input.namaOrtu?.trim()) throw new Error('Nama orang tua / wali wajib diisi');
    if (!input.noHpOrtu?.trim()) throw new Error('Nomor WhatsApp / HP wajib diisi');
    if (!input.ttdDigital?.trim()) throw new Error('Tanda tangan digital wajib digoreskan');

    const kategori = input.kategori || '5_HARI_KERJA';

    // 1. Ambil data Siswa, Sekolah, Kop Surat, dan Kepala Sekolah untuk snapshot
    const [siswa, sekolah, kepsek] = await Promise.all([
      db.query.masterSiswa.findFirst({
        where: eq(masterSiswa.id, input.siswaId),
        with: { kelas: true },
      }),
      db.query.masterSekolah.findFirst({
        where: eq(masterSekolah.isAktif, true),
      }),
      db.query.masterPegawai.findFirst({
        where: eq(masterPegawai.isAktif, true),
      }),
    ]);

    let kopSurat = await db.query.documentHeaders.findFirst({
      where: and(eq(documentHeaders.isDefault, true), eq(documentHeaders.isAktif, true)),
    });
    if (!kopSurat) {
      kopSurat = await db.query.documentHeaders.findFirst({
        where: eq(documentHeaders.isAktif, true),
        orderBy: [desc(documentHeaders.isDefault), desc(documentHeaders.createdAt)],
      });
    }

    if (!siswa) throw new Error('Data siswa tidak ditemukan dalam sistem');

    // 2. Cek apakah sudah pernah mengisi
    const existing = await db.query.parentConsents.findFirst({
      where: and(
        eq(parentConsents.siswaId, input.siswaId),
        eq(parentConsents.kategori, kategori),
        isNull(parentConsents.deletedAt),
      ),
    });

    const now = new Date();

    // Hitung nomor urut surat
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(parentConsents)
      .where(isNull(parentConsents.deletedAt));

    const totalCount = Number(countResult[0]?.count || 0) + 1;

    // Nomor Surat Resmi Persetujuan 5 Hari Kerja sesuai Naskah Dinas Sekolah
    const nomorSurat =
      kategori === '5_HARI_KERJA'
        ? 'B/382/400.3.5.1/VIII/2026'
        : generateNomorNaskahDinas({
            kodeJenisSurat: 'SPERT', // Surat Pernyataan / Persetujuan
            nomorUrut: totalCount,
            kodeKlasifikasi: '400.3.5.1',
            kodePerangkatDaerah: 'SMPN-1-UJJ',
            tanggal: now,
          });


    const documentSnapshot = {
      kopSurat: kopSurat
        ? {
            instansiUtama: kopSurat.instansiUtama,
            instansiInduk: kopSurat.instansiInduk,
            namaSekolah: kopSurat.namaSekolah,
            alamat: kopSurat.alamat,
            kontak: kopSurat.kontak,
            logoUrl: kopSurat.logoUrl,
            logoKiriUrl: kopSurat.logoKiriUrl,
            logoKananUrl: kopSurat.logoKananUrl,
          }
        : null,
      sekolah: sekolah
        ? {
            nama: sekolah.nama,
            npsn: sekolah.npsn,
            alamat: sekolah.alamat,
            kabupaten: sekolah.kabupaten,
            provinsi: sekolah.provinsi,
          }
        : null,
      kepsek: kepsek
        ? {
            nama: kepsek.nama,
            nip: kepsek.nip,
            pangkatGolongan: kepsek.pangkatGolongan,
          }
        : null,
      siswa: {
        nama: siswa.nama,
        nis: siswa.nis,
        nisn: siswa.nisn,
        kelas: siswa.kelas?.namaKelas || siswa.kelas?.kodeKelas,
      },
      createdAt: now.toISOString(),
    };

    let resultId: string;

    if (existing) {
      // Update record yang sudah ada
      const [updated] = await db
        .update(parentConsents)
        .set({
          kelasId: input.kelasId || siswa.kelasId || null,
          namaOrtu: input.namaOrtu.trim(),
          pekerjaanOrtu: input.pekerjaanOrtu?.trim() || null,
          noHpOrtu: input.noHpOrtu.trim(),
          alamatOrtu: input.alamatOrtu?.trim() || null,
          hubungan: input.hubungan || 'Orang Tua Kandung',
          statusPersetujuan: input.statusPersetujuan,
          alasanPenolakan: input.alasanPenolakan?.trim() || null,
          kesiapanFasilitas: input.kesiapanFasilitas || null,
          ttdDigital: input.ttdDigital,
          signedAt: now,
          documentSnapshot,
          updatedAt: now,
        })
        .where(eq(parentConsents.id, existing.id))
        .returning();

      resultId = updated.id;
    } else {
      // Insert baru
      const [created] = await db
        .insert(parentConsents)
        .values({
          kategori,
          siswaId: input.siswaId,
          kelasId: input.kelasId || siswa.kelasId || null,
          namaOrtu: input.namaOrtu.trim(),
          pekerjaanOrtu: input.pekerjaanOrtu?.trim() || null,
          noHpOrtu: input.noHpOrtu.trim(),
          alamatOrtu: input.alamatOrtu?.trim() || null,
          hubungan: input.hubungan || 'Orang Tua Kandung',
          statusPersetujuan: input.statusPersetujuan,
          alasanPenolakan: input.alasanPenolakan?.trim() || null,
          kesiapanFasilitas: input.kesiapanFasilitas || null,
          ttdDigital: input.ttdDigital,
          signedAt: now,
          nomorSurat,
          documentSnapshot,
        })
        .returning();

      resultId = created.id;
    }

    try {
      revalidatePath('/surat-siswa/persetujuan-5-hari-kerja');
    } catch {
      // Safe outside Next.js request context
    }
    return {
      success: true,
      data: {
        id: resultId,
        nomorSurat,
      },
    };
  } catch (error: unknown) {
    console.error('Error in submitParentConsent:', error);
    const msg = error instanceof Error ? error.message : 'Gagal memproses surat persetujuan';
    return { success: false, error: msg };
  }
}

/**
 * Mendapatkan detail surat persetujuan untuk halaman sukses / cetak (bisa diakses publik)
 */
export async function getConsentDetailById(id: string) {
  try {
    if (!id || typeof id !== 'string') {
      return { success: false, error: 'ID dokumen tidak valid' };
    }

    const cleanId = id.trim();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
    if (!isUuid) {
      return { success: false, error: 'Format ID dokumen tidak valid' };
    }

    const consent = await db.query.parentConsents.findFirst({
      where: and(eq(parentConsents.id, cleanId), isNull(parentConsents.deletedAt)),
      with: {
        siswa: {
          with: {
            kelas: {
              with: { waliKelas: true },
            },
          },
        },
        kelas: true,
      },
    });

    if (!consent) return { success: false, error: 'Dokumen persetujuan tidak ditemukan' };

    const sekolah = await db.query.masterSekolah.findFirst({
      where: eq(masterSekolah.isAktif, true),
    });

    const kepsek = await db.query.masterPegawai.findFirst({
      where: eq(masterPegawai.isAktif, true),
    });

    let kopSurat = await db.query.documentHeaders.findFirst({
      where: and(eq(documentHeaders.isDefault, true), eq(documentHeaders.isAktif, true)),
    });
    if (!kopSurat) {
      kopSurat = await db.query.documentHeaders.findFirst({
        where: eq(documentHeaders.isAktif, true),
        orderBy: [desc(documentHeaders.isDefault), desc(documentHeaders.createdAt)],
      });
    }

    return {
      success: true,
      data: consent,
      sekolah,
      kepsek,
      kopSurat,
    };
  } catch (error: unknown) {
    console.error('Error in getConsentDetailById:', error);
    const msg = error instanceof Error ? error.message : 'Gagal memuat dokumen persetujuan';
    return { success: false, error: msg };
  }
}

// ============================================================================
// 2. ADMIN DASHBOARD ACTIONS (Memerlukan Login Petugas Sekolah)
// ============================================================================

export interface GetConsentListParams {
  kelasId?: string;
  statusPersetujuan?: string;
  search?: string;
  kategori?: string;
}

/**
 * Mendapatkan daftar seluruh respon persetujuan untuk dashboard admin
 */
export async function getConsentListAdmin(params?: GetConsentListParams) {
  try {
    await requireAuth();

    const kategori = params?.kategori || '5_HARI_KERJA';

    const whereClause = and(
      isNull(parentConsents.deletedAt),
      eq(parentConsents.kategori, kategori),
      params?.kelasId ? eq(parentConsents.kelasId, params.kelasId) : undefined,
      params?.statusPersetujuan ? eq(parentConsents.statusPersetujuan, params.statusPersetujuan) : undefined,
    );

    const list = await db.query.parentConsents.findMany({
      where: whereClause,
      orderBy: [desc(parentConsents.signedAt)],
      with: {
        siswa: {
          with: { kelas: true },
        },
        kelas: true,
      },
    });

    // Client-side / in-memory search filter jika ada parameter search (Nama Siswa / Nama Ortu / NISN)
    let filteredList = list;
    if (params?.search?.trim()) {
      const q = params.search.trim().toLowerCase();
      filteredList = list.filter(
        (c) =>
          c.siswa?.nama?.toLowerCase().includes(q) ||
          c.siswa?.nisn?.toLowerCase().includes(q) ||
          c.namaOrtu.toLowerCase().includes(q) ||
          c.nomorSurat?.toLowerCase().includes(q),
      );
    }

    return { success: true, data: filteredList };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal memuat data rekapitulasi persetujuan';
    return { success: false, error: msg, data: [] };
  }
}

/**
 * Mendapatkan ringkasan statistik dan progres pengisian per kelas
 */
export async function getConsentSummaryStats(kategori = '5_HARI_KERJA') {
  try {
    await requireAuth();

    // 1. Ambil seluruh siswa aktif
    const allStudents = await db.query.masterSiswa.findMany({
      where: and(eq(masterSiswa.isAktif, true), isNull(masterSiswa.deletedAt)),
      with: { kelas: true },
    });

    // 2. Ambil seluruh kelas aktif
    const allClasses = await db.query.masterKelas.findMany({
      where: and(eq(masterKelas.isAktif, true), isNull(masterKelas.deletedAt)),
      orderBy: [masterKelas.tingkat, masterKelas.namaKelas],
    });

    // 3. Ambil seluruh persetujuan yang masuk
    const consents = await db.query.parentConsents.findMany({
      where: and(eq(parentConsents.kategori, kategori), isNull(parentConsents.deletedAt)),
    });

    const totalStudents = allStudents.length;
    const totalSubmitted = consents.length;
    const totalSetuju = consents.filter((c) => c.statusPersetujuan === 'SETUJU').length;
    const totalTidakSetuju = consents.filter((c) => c.statusPersetujuan === 'TIDAK_SETUJU').length;
    const totalBelum = Math.max(0, totalStudents - totalSubmitted);
    const overallPercentage = totalStudents > 0 ? Math.round((totalSubmitted / totalStudents) * 100) : 0;

    // Breakdown per kelas
    const consentByStudentId = new Map(consents.map((c) => [c.siswaId, c]));

    const classStats = allClasses.map((k) => {
      const classStudents = allStudents.filter((s) => s.kelasId === k.id);
      const totalSiswaKelas = classStudents.length;

      let submitted = 0;
      let setuju = 0;
      let tidakSetuju = 0;

      for (const s of classStudents) {
        const c = consentByStudentId.get(s.id);
        if (c) {
          submitted++;
          if (c.statusPersetujuan === 'SETUJU') setuju++;
          else tidakSetuju++;
        }
      }

      const belum = Math.max(0, totalSiswaKelas - submitted);
      const percentage = totalSiswaKelas > 0 ? Math.round((submitted / totalSiswaKelas) * 100) : 0;

      return {
        kelasId: k.id,
        kodeKelas: k.kodeKelas,
        namaKelas: k.namaKelas,
        tingkat: k.tingkat,
        totalSiswa: totalSiswaKelas,
        totalSubmitted: submitted,
        totalSetuju: setuju,
        totalTidakSetuju: tidakSetuju,
        totalBelum: belum,
        percentage,
      };
    });

    return {
      success: true,
      data: {
        totalStudents,
        totalSubmitted,
        totalSetuju,
        totalTidakSetuju,
        totalBelum,
        overallPercentage,
        classStats,
      },
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal memuat statistik persetujuan';
    return {
      success: false,
      error: msg,
      data: {
        totalStudents: 0,
        totalSubmitted: 0,
        totalSetuju: 0,
        totalTidakSetuju: 0,
        totalBelum: 0,
        overallPercentage: 0,
        classStats: [],
      },
    };
  }
}

/**
 * Hapus data persetujuan orang tua (Admin Only)
 */
export async function deleteConsentAdmin(id: string) {
  try {
    const user = await requireAuth();

    const [deleted] = await db
      .update(parentConsents)
      .set({
        deletedAt: new Date(),
        updatedBy: user.id || undefined,
      })
      .where(eq(parentConsents.id, id))
      .returning();

    if (!deleted) throw new Error('Data persetujuan tidak ditemukan');

    await logActivity({
      userId: user.id!,
      action: 'DELETE',
      entityType: 'PARENT_CONSENT',
      entityId: id,
      details: { nomorSurat: deleted.nomorSurat, namaOrtu: deleted.namaOrtu },
    });

    revalidatePath('/surat-siswa/persetujuan-5-hari-kerja');
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal menghapus data persetujuan';
    return { success: false, error: msg };
  }
}
