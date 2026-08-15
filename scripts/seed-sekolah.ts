import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL missing in .env.local');
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client, { schema });

async function main() {
  console.log('🚀 Memulai Seeding Data Dummy Sekolah...');

  try {
    const defaultFields = {
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Helper to get or create
    // 1. Master Unit Kerja
    console.log('1. Sinkronisasi Master Unit Kerja...');
    async function getOrCreateUnit(kode: string, nama: string) {
      const existing = await db.query.masterUnitKerja.findFirst({
        where: eq(schema.masterUnitKerja.kode, kode),
      });
      if (existing) return existing.id;
      const [created] = await db
        .insert(schema.masterUnitKerja)
        .values({
          kode,
          nama,
          isAktif: true,
          ...defaultFields,
        })
        .returning();
      return created.id;
    }

    const unitTUId = await getOrCreateUnit('TU-01', 'Tata Usaha / Subag Persuratan');
    const unitKurikulumId = await getOrCreateUnit('KUR-01', 'Bidang Kurikulum');
    const unitKesiswaanId = await getOrCreateUnit('KES-01', 'Bidang Kesiswaan & OSIS');

    // 2. Master Jabatan
    console.log('2. Sinkronisasi Master Jabatan...');
    async function getOrCreateJabatan(nama: string) {
      const existing = await db.query.masterJabatan.findFirst({
        where: eq(schema.masterJabatan.nama, nama),
      });
      if (existing) return existing.id;
      const [created] = await db
        .insert(schema.masterJabatan)
        .values({
          nama,
          isAktif: true,
          ...defaultFields,
        })
        .returning();
      return created.id;
    }

    const jabKepsekId = await getOrCreateJabatan('Kepala Sekolah');
    const jabWakasekId = await getOrCreateJabatan('Wakil Kepala Sekolah');
    const jabKaTUId = await getOrCreateJabatan('Kepala Tata Usaha');
    const jabGuruId = await getOrCreateJabatan('Guru Mata Pelajaran');

    // 3. Master Pegawai (Guru & Staf)
    console.log('3. Sinkronisasi Master Pegawai...');
    async function getOrCreatePegawai(nip: string, data: typeof schema.masterPegawai.$inferInsert) {
      const existing = await db.query.masterPegawai.findFirst({
        where: eq(schema.masterPegawai.nip, nip),
      });
      if (existing) return existing.id;
      const [created] = await db.insert(schema.masterPegawai).values(data).returning();
      return created.id;
    }

    const pegKepsekId = await getOrCreatePegawai('197503122000031001', {
      nama: 'Drs. H. Ahmad Wijaya, M.Pd',
      nip: '197503122000031001',
      email: 'kepsek@sekolah.sch.id',
      noHp: '081234567890',
      unitKerjaId: unitTUId,
      jabatanId: jabKepsekId,
      statusAsn: 'PNS',
      isAktif: true,
      ...defaultFields,
    });

    const pegWakasekId = await getOrCreatePegawai('198207152006042003', {
      nama: 'Siti Rahmawati, S.Pd',
      nip: '198207152006042003',
      email: 'wakasek@sekolah.sch.id',
      noHp: '081234567891',
      unitKerjaId: unitKurikulumId,
      jabatanId: jabWakasekId,
      statusAsn: 'PNS',
      isAktif: true,
      ...defaultFields,
    });

    const pegStaffTUId = await getOrCreatePegawai('199011202018012005', {
      nama: 'Rina Kartika, A.Md',
      nip: '199011202018012005',
      email: 'tu@sekolah.sch.id',
      noHp: '081234567892',
      unitKerjaId: unitTUId,
      jabatanId: jabKaTUId,
      statusAsn: 'PPPK',
      isAktif: true,
      ...defaultFields,
    });

    const pegGuruBKId = await getOrCreatePegawai('199304102022031004', {
      nama: 'Budi Hermawan, S.Kom',
      nip: '199304102022031004',
      email: 'budi.guru@sekolah.sch.id',
      noHp: '081234567893',
      unitKerjaId: unitKesiswaanId,
      jabatanId: jabGuruId,
      statusAsn: 'PNS',
      isAktif: true,
      ...defaultFields,
    });

    // 4. User Logins (Pengguna Sistem)
    console.log('4. Sinkronisasi Akun Pengguna (Admin, Kepsek, Wakasek, Guru)...');
    async function getOrCreateUser(username: string, data: typeof schema.users.$inferInsert) {
      const existing = await db.query.users.findFirst({
        where: eq(schema.users.username, username),
      });
      if (existing) return existing.id;
      const [created] = await db.insert(schema.users).values(data).returning();
      return created.id;
    }

    const userAdminId = await getOrCreateUser('admin', {
      username: 'admin',
      email: 'admin@sekolah.sch.id',
      nama: 'Admin TU Sekolah',
      passwordHash: hashedPassword,
      status: 'Aktif',
      pegawaiId: pegStaffTUId,
      ...defaultFields,
    });

    const userKepsekId = await getOrCreateUser('kepsek', {
      username: 'kepsek',
      email: 'kepsek@sekolah.sch.id',
      nama: 'Drs. H. Ahmad Wijaya, M.Pd (Kepsek)',
      passwordHash: hashedPassword,
      status: 'Aktif',
      pegawaiId: pegKepsekId,
      ...defaultFields,
    });

    const userWakasekId = await getOrCreateUser('wakasek', {
      username: 'wakasek',
      email: 'wakasek@sekolah.sch.id',
      nama: 'Siti Rahmawati, S.Pd (Wakasek Kurikulum)',
      passwordHash: hashedPassword,
      status: 'Aktif',
      pegawaiId: pegWakasekId,
      ...defaultFields,
    });

    await getOrCreateUser('guru', {
      username: 'guru',
      email: 'guru@sekolah.sch.id',
      nama: 'Budi Hermawan, S.Kom (Guru)',
      passwordHash: hashedPassword,
      status: 'Aktif',
      pegawaiId: pegGuruBKId,
      ...defaultFields,
    });

    // 5. Master Klasifikasi Surat Dinas Sekolah
    console.log('5. Sinkronisasi Master Kode Klasifikasi Surat...');
    async function getOrCreateKlasifikasi(kode: string, nama: string, deskripsi: string) {
      const existing = await db.query.masterKlasifikasiSurat.findFirst({
        where: eq(schema.masterKlasifikasiSurat.kode, kode),
      });
      if (existing) return existing.id;
      const [created] = await db
        .insert(schema.masterKlasifikasiSurat)
        .values({
          kode,
          nama,
          deskripsi,
          isAktif: true,
          ...defaultFields,
        })
        .returning();
      return created.id;
    }

    const klasKurikulumId = await getOrCreateKlasifikasi(
      '421.1',
      'Kurikulum & Pengajaran',
      'Surat terkait jadwal, ujian, dan kurikulum',
    );
    const klasKesiswaanId = await getOrCreateKlasifikasi(
      '421.2',
      'Kesiswaan & Ekstrakurikuler',
      'Surat edaran wali murid, osis, beasiswa',
    );
    await getOrCreateKlasifikasi(
      '421.3',
      'Keuangan & Komite',
      'SPP, sumbangan komite, bantuan operasional',
    );
    const klasKepegawaianId = await getOrCreateKlasifikasi(
      '421.5',
      'Kepegawaian & Tata Usaha',
      'Surat tugas guru, izin operasional, SK',
    );

    // 6. Master Jenis Surat
    console.log('6. Sinkronisasi Master Jenis Surat...');
    async function getOrCreateJenis(kode: string, nama: string) {
      const existing = await db.query.masterJenisSurat.findFirst({
        where: eq(schema.masterJenisSurat.kode, kode),
      });
      if (existing) return existing.id;
      const [created] = await db
        .insert(schema.masterJenisSurat)
        .values({
          kode,
          nama,
          isAktif: true,
          ...defaultFields,
        })
        .returning();
      return created.id;
    }

    const jenisUndanganId = await getOrCreateJenis('SU', 'Surat Undangan');
    const jenisTugasId = await getOrCreateJenis('ST', 'Surat Tugas');
    const jenisEdaranId = await getOrCreateJenis('SE', 'Surat Edaran');
    await getOrCreateJenis('SK', 'Surat Keputusan (SK)');

    // 7. Master Prioritas & Sifat Surat
    console.log('7. Sinkronisasi Master Prioritas & Sifat Surat...');
    async function getOrCreatePrioritas(nama: string) {
      const existing = await db.query.masterPrioritas.findFirst({
        where: eq(schema.masterPrioritas.nama, nama),
      });
      if (existing) return existing.id;
      const [created] = await db
        .insert(schema.masterPrioritas)
        .values({
          nama,
          isAktif: true,
          ...defaultFields,
        })
        .returning();
      return created.id;
    }

    const prioritasBiasaId = await getOrCreatePrioritas('Biasa');
    const prioritasSegeraId = await getOrCreatePrioritas('Segera / Penting');

    async function getOrCreateSifat(nama: string) {
      const existing = await db.query.masterSifatSurat.findFirst({
        where: eq(schema.masterSifatSurat.nama, nama),
      });
      if (existing) return existing.id;
      const [created] = await db
        .insert(schema.masterSifatSurat)
        .values({
          nama,
          isAktif: true,
          ...defaultFields,
        })
        .returning();
      return created.id;
    }

    const sifatBiasaId = await getOrCreateSifat('Biasa');
    await getOrCreateSifat('Rahasia / Terbatas');

    // 8. Master Instansi Relasi
    console.log('8. Sinkronisasi Master Instansi Relasi...');
    async function getOrCreateInstansi(
      nama: string,
      data: typeof schema.masterInstansi.$inferInsert,
    ) {
      const existing = await db.query.masterInstansi.findFirst({
        where: eq(schema.masterInstansi.nama, nama),
      });
      if (existing) return existing.id;
      const [created] = await db.insert(schema.masterInstansi).values(data).returning();
      return created.id;
    }

    const instansiDinasId = await getOrCreateInstansi('Dinas Pendidikan & Kebudayaan Provinsi', {
      nama: 'Dinas Pendidikan & Kebudayaan Provinsi',
      jenis: 'Instansi Pemerintah',
      kota: 'Kota Utama',
      email: 'disdik@provinsi.go.id',
      isAktif: true,
      ...defaultFields,
    });

    const instansiPuskesmasId = await getOrCreateInstansi('Puskesmas Kecamatan Pembina', {
      nama: 'Puskesmas Kecamatan Pembina',
      jenis: 'Fasilitas Kesehatan',
      kota: 'Kota Utama',
      email: 'puskesmas@kota.go.id',
      isAktif: true,
      ...defaultFields,
    });

    // 9. Sample Data Surat Masuk
    console.log('9. Membuat Contoh Data Surat Masuk...');
    let suratMasuk1 = await db.query.incomingLetters.findFirst({
      where: eq(schema.incomingLetters.nomorAgenda, '001/SM/2026'),
    });

    if (!suratMasuk1) {
      const [created] = await db
        .insert(schema.incomingLetters)
        .values({
          nomorAgenda: '001/SM/2026',
          nomorSurat: '005/DISDIK/IV/2026',
          tanggalSurat: '2026-08-01',
          tanggalDiterima: '2026-08-03',
          pengirim: 'Drs. H. Supriyadi (Kadisdik)',
          instansiPengirimId: instansiDinasId,
          perihal: 'Undangan Rapat Koordinasi Penerapan Kurikulum Merdeka 2026/2027',
          ringkasanIsi:
            'Mewajibkan Kepala Sekolah dan Wakasek Kurikulum hadir rapat di Dinas Pendidikan.',
          jenisSuratId: jenisUndanganId,
          klasifikasiId: klasKurikulumId,
          prioritasId: prioritasSegeraId,
          sifatSuratId: sifatBiasaId,
          status: 'DISPOSITIONED',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      suratMasuk1 = created;
    }

    const suratMasuk2 = await db.query.incomingLetters.findFirst({
      where: eq(schema.incomingLetters.nomorAgenda, '002/SM/2026'),
    });

    if (!suratMasuk2) {
      await db.insert(schema.incomingLetters).values({
        nomorAgenda: '002/SM/2026',
        nomorSurat: '112/PKM/VIII/2026',
        tanggalSurat: '2026-08-05',
        tanggalDiterima: '2026-08-06',
        pengirim: 'dr. Endang Sri (Kepala Puskesmas)',
        instansiPengirimId: instansiPuskesmasId,
        perihal: 'Permohonan Pelaksanaan Pemeriksaan Kesehatan Remaja & DPT',
        ringkasanIsi: 'Jadwal pemeriksaan kesehatan gratis untuk siswa kelas X.',
        jenisSuratId: jenisUndanganId,
        klasifikasiId: klasKesiswaanId,
        prioritasId: prioritasBiasaId,
        sifatSuratId: sifatBiasaId,
        status: 'REGISTERED',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // 10. Sample Disposisi untuk Surat Masuk 1
    if (suratMasuk1) {
      console.log('10. Membuat Contoh Disposisi Kepsek...');
      const existingDisp = await db.query.incomingDispositions.findFirst({
        where: eq(schema.incomingDispositions.suratId, suratMasuk1.id),
      });

      if (!existingDisp) {
        await db.insert(schema.incomingDispositions).values({
          suratId: suratMasuk1.id,
          pemberiDisposisiId: userKepsekId,
          penerimaDisposisiId: userWakasekId,
          instruksi: 'Harap hadir dampingi saya dan siapkan berkas laporan kurikulum sekolah.',
          status: 'MENUNGGU',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    // 11. Sample Data Surat Keluar
    console.log('11. Membuat Contoh Data Surat Keluar...');
    const suratKeluar1 = await db.query.outgoingLetters.findFirst({
      where: eq(schema.outgoingLetters.nomorAgenda, '001/SK/2026'),
    });

    if (!suratKeluar1) {
      await db.insert(schema.outgoingLetters).values({
        nomorAgenda: '001/SK/2026',
        nomorSurat: '421.2/012/SMA-01/2026',
        jenisSuratId: jenisEdaranId,
        klasifikasiId: klasKesiswaanId,
        prioritasId: prioritasBiasaId,
        sifatSuratId: sifatBiasaId,
        perihal: 'Surat Edaran Pelaksanaan Penilaian Tengah Semester (PTS) Ganjil',
        tujuanSurat: 'Seluruh Orang Tua / Wali Murid Kelas X, XI, XII',
        pembuatId: userAdminId,
        unitKerjaId: unitTUId,
        penandatanganId: pegKepsekId,
        tanggalSurat: '2026-08-10',
        tanggalTerbit: '2026-08-10',
        status: 'PUBLISHED',
        catatanTambahan: 'Telah ditandatangani dan dibagikan via grup sekolah & cetak.',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const suratKeluar2 = await db.query.outgoingLetters.findFirst({
      where: eq(schema.outgoingLetters.nomorAgenda, '002/SK/2026'),
    });

    if (!suratKeluar2) {
      await db.insert(schema.outgoingLetters).values({
        nomorAgenda: '002/SK/2026',
        nomorSurat: '421.5/018/SMA-01/2026',
        jenisSuratId: jenisTugasId,
        klasifikasiId: klasKepegawaianId,
        prioritasId: prioritasSegeraId,
        sifatSuratId: sifatBiasaId,
        perihal: 'Surat Tugas Pendampingan Kontingen Lomba Bahasa & Seni',
        tujuanSurat: 'Budi Hermawan, S.Kom (Guru Pembina)',
        pembuatId: userAdminId,
        unitKerjaId: unitKesiswaanId,
        penandatanganId: pegKepsekId,
        tanggalSurat: '2026-08-12',
        tanggalTerbit: '2026-08-12',
        status: 'APPROVED',
        catatanTambahan: 'Pelaksanaan tugas tanggal 18-20 Agustus 2026.',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    console.log('\n🎉 SEEDING DATA DUMMY SEKOLAH BERHASIL DILAKUKAN!');
    console.log('============================================================');
    console.log('AKUN UJI COBA (PASSWORD SAMA: password123)');
    console.log('1. Admin TU        : username = admin    | password = password123');
    console.log('2. Kepala Sekolah  : username = kepsek   | password = password123');
    console.log('3. Wakasek         : username = wakasek  | password = password123');
    console.log('4. Guru / Staf     : username = guru     | password = password123');
    console.log('============================================================\n');
  } catch (error) {
    console.error('❌ Error saat seeding data dummy:', error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

main();
