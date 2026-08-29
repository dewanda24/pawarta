'use server';

import { db } from '@/db';
import { incomingLetters } from '@/db/schema/incoming-letter';
import { outgoingLetters } from '@/db/schema/outgoing-letter';
import { studentLetters } from '@/db/schema/student-letter';
import { masterPegawai, masterSiswa } from '@/db/schema/master';
import { requireAuth } from '@/lib/server-action';
import { and, isNull, ilike, or, desc } from 'drizzle-orm';

export interface GlobalSearchResultItem {
  id: string;
  category: 'Surat Masuk' | 'Surat Keluar' | 'Surat Siswa' | 'Pegawai & Guru' | 'Data Siswa';
  title: string;
  subtitle: string;
  route: string;
}

export async function executeGlobalSearch(query: string): Promise<{ success: boolean; data: GlobalSearchResultItem[] }> {
  try {
    await requireAuth();

    if (!query || query.trim().length < 2) {
      return { success: true, data: [] };
    }

    const q = query.trim();
    const results: GlobalSearchResultItem[] = [];

    const [masuk, keluar, siswaLetters, pegawai, siswa] = await Promise.all([
      // Surat Masuk
      db.query.incomingLetters.findMany({
        where: and(
          isNull(incomingLetters.deletedAt),
          or(
            ilike(incomingLetters.perihal, `%${q}%`),
            ilike(incomingLetters.nomorSurat, `%${q}%`),
            ilike(incomingLetters.pengirim, `%${q}%`),
          )
        ),
        limit: 4,
        orderBy: [desc(incomingLetters.createdAt)],
      }),

      // Surat Keluar
      db.query.outgoingLetters.findMany({
        where: and(
          isNull(outgoingLetters.deletedAt),
          or(
            ilike(outgoingLetters.perihal, `%${q}%`),
            ilike(outgoingLetters.nomorSurat, `%${q}%`),
            ilike(outgoingLetters.tujuanSurat, `%${q}%`),
          )
        ),
        limit: 4,
        orderBy: [desc(outgoingLetters.createdAt)],
      }),

      // Surat Siswa
      db.query.studentLetters.findMany({
        where: and(
          isNull(studentLetters.deletedAt),
          or(
            ilike(studentLetters.nomorSurat, `%${q}%`),
            ilike(studentLetters.keperluan, `%${q}%`),
            ilike(studentLetters.namaKegiatan, `%${q}%`),
          )
        ),
        with: { siswa: true },
        limit: 4,
        orderBy: [desc(studentLetters.createdAt)],
      }),

      // Pegawai
      db.query.masterPegawai.findMany({
        where: and(
          isNull(masterPegawai.deletedAt),
          or(
            ilike(masterPegawai.nama, `%${q}%`),
            ilike(masterPegawai.nip, `%${q}%`),
          )
        ),
        with: { jabatan: true },
        limit: 3,
      }),

      // Siswa
      db.query.masterSiswa.findMany({
        where: and(
          isNull(masterSiswa.deletedAt),
          or(
            ilike(masterSiswa.nama, `%${q}%`),
            ilike(masterSiswa.nisn, `%${q}%`),
            ilike(masterSiswa.nis, `%${q}%`),
          )
        ),
        with: { kelas: true },
        limit: 3,
      }),
    ]);

    masuk.forEach((m) => {
      results.push({
        id: `masuk-${m.id}`,
        category: 'Surat Masuk',
        title: m.perihal || 'Surat Masuk',
        subtitle: `No: ${m.nomorSurat} • Pengirim: ${m.pengirim}`,
        route: `/surat-masuk/${m.id}`,
      });
    });

    keluar.forEach((k) => {
      results.push({
        id: `keluar-${k.id}`,
        category: 'Surat Keluar',
        title: k.perihal || 'Surat Keluar',
        subtitle: `No: ${k.nomorSurat || 'Draft'} • Tujuan: ${k.tujuanSurat}`,
        route: `/surat-keluar/${k.id}`,
      });
    });

    siswaLetters.forEach((sl) => {
      results.push({
        id: `siswa-letter-${sl.id}`,
        category: 'Surat Siswa',
        title: sl.keperluan || sl.namaKegiatan || 'Surat Kesiswaan',
        subtitle: `No: ${sl.nomorSurat || '-'} • Siswa: ${sl.siswa?.nama || 'Peserta'}`,
        route: `/surat-siswa`,
      });
    });

    pegawai.forEach((p) => {
      results.push({
        id: `pegawai-${p.id}`,
        category: 'Pegawai & Guru',
        title: p.nama,
        subtitle: `NIP: ${p.nip || '-'} • ${p.jabatan?.nama || 'Pegawai'}`,
        route: `/master/pegawai`,
      });
    });

    siswa.forEach((s) => {
      results.push({
        id: `siswa-${s.id}`,
        category: 'Data Siswa',
        title: s.nama,
        subtitle: `NISN: ${s.nisn || '-'} • Kelas: ${s.kelas?.namaKelas || '-'}`,
        route: `/master/siswa`,
      });
    });

    return { success: true, data: results };
  } catch (error: unknown) {
    return { success: true, data: [] };
  }
}
