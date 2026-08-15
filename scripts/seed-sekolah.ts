import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema';
import * as dotenv from 'dotenv';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

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

    // 1. Master Unit Kerja
    console.log('1. Membuat Master Unit Kerja...');
    const [unitTU] = await db
      .insert(schema.masterUnitKerja)
      .values({
        kode: 'TU-01',
        nama: 'Tata Usaha / Subag Persuratan',
        isAktif: true,
        ...defaultFields,
      })
      .onConflictDoUpdate({
        target: schema.masterUnitKerja.kode,
        set: { nama: 'Tata Usaha / Subag Persuratan' },
      })
      .returning();

    const [unitKurikulum] = await db
      .insert(schema.masterUnitKerja)
      .values({
        kode: 'KUR-01',
        nama: 'Bidang Kurikulum',
        isAktif: true,
        ...defaultFields,
      })
      .onConflictDoUpdate({
        target: schema.masterUnitKerja.kode,
        set: { nama: 'Bidang Kurikulum' },
      })
      .returning();

    const [unitKesiswaan] = await db
      .insert(schema.masterUnitKerja)
      .values({
        kode: 'KES-01',
        nama: 'Bidang Kesiswaan & OSIS',
        isAktif: true,
        ...defaultFields,
      })
      .onConflictDoUpdate({
        target: schema.masterUnitKerja.kode,
        set: { nama: 'Bidang Kesiswaan & OSIS' },
      })
      .returning();

    const unitTUId = unitTU.id;
    const unitKurikulumId = unitKurikulum.id;
    const unitKesiswaanId = unitKesiswaan.id;

    // 2. Master Jabatan
    console.log('2. Membuat Master Jabatan...');
    const [jabKepsek] = await db
      .insert(schema.masterJabatan)
      .values({
        nama: 'Kepala Sekolah',
        isAktif: true,
        ...defaultFields,
      })
      .onConflictDoUpdate({ target: schema.masterJabatan.nama, set: { isAktif: true } })
      .returning();

    const [jabWakasek] = await db
      .insert(schema.masterJabatan)
      .values({
        nama: 'Wakil Kepala Sekolah',
        isAktif: true,
        ...defaultFields,
      })
      .onConflictDoUpdate({ target: schema.masterJabatan.nama, set: { isAktif: true } })
      .returning();

    const [jabKaTU] = await db
      .insert(schema.masterJabatan)
      .values({
        nama: 'Kepala Tata Usaha',
        isAktif: true,
        ...defaultFields,
      })
      .onConflictDoUpdate({ target: schema.masterJabatan.nama, set: { isAktif: true } })
      .returning();

    const [jabGuru] = await db
      .insert(schema.masterJabatan)
      .values({
        nama: 'Guru Mata Pelajaran',
        isAktif: true,
        ...defaultFields,
      })
      .onConflictDoUpdate({ target: schema.masterJabatan.nama, set: { isAktif: true } })
      .returning();

    const jabKepsekId = jabKepsek.id;
    const jabWakasekId = jabWakasek.id;
    const jabKaTUId = jabKaTU.id;
    const jabGuruId = jabGuru.id;

    // 3. Master Pegawai (Guru & Staf)
    console.log('3. Membuat Master Pegawai...');
    const pegKepsekId = crypto.randomUUID();
    const pegWakasekId = crypto.randomUUID();
    const pegStaffTUId = crypto.randomUUID();
    const pegGuruBKId = crypto.randomUUID();

    await db
      .insert(schema.masterPegawai)
      .values([
        {
          id: pegKepsekId,
          nama: 'Drs. H. Ahmad Wijaya, M.Pd',
          nip: '197503122000031001',
          email: 'kepsek@sekolah.sch.id',
          noHp: '081234567890',
          unitKerjaId: unitTUId,
          jabatanId: jabKepsekId,
          statusAsn: 'PNS',
          isAktif: true,
          ...defaultFields,
        },
        {
          id: pegWakasekId,
          nama: 'Siti Rahmawati, S.Pd',
          nip: '198207152006042003',
          email: 'wakasek@sekolah.sch.id',
          noHp: '081234567891',
          unitKerjaId: unitKurikulumId,
          jabatanId: jabWakasekId,
          statusAsn: 'PNS',
          isAktif: true,
          ...defaultFields,
        },
        {
          id: pegStaffTUId,
          nama: 'Rina Kartika, A.Md',
          nip: '199011202018012005',
          email: 'tu@sekolah.sch.id',
          noHp: '081234567892',
          unitKerjaId: unitTUId,
          jabatanId: jabKaTUId,
          statusAsn: 'PPPK',
          isAktif: true,
          ...defaultFields,
        },
        {
          id: pegGuruBKId,
          nama: 'Budi Hermawan, S.Kom',
          nip: '199304102022031004',
          email: 'budi.guru@sekolah.sch.id',
          noHp: '081234567893',
          unitKerjaId: unitKesiswaanId,
          jabatanId: jabGuruId,
          statusAsn: 'PNS',
          isAktif: true,
          ...defaultFields,
        },
      ])
      .onConflictDoNothing();

    // 4. User Logins (Pengguna Sistem)
    console.log('4. Membuat Akun Logins (Admin, Kepsek, Wakasek, Guru)...');
    const userAdminId = crypto.randomUUID();
    const userKepsekId = crypto.randomUUID();
    const userWakasekId = crypto.randomUUID();
    const userGuruId = crypto.randomUUID();

    await db
      .insert(schema.users)
      .values([
        {
          id: userAdminId,
          username: 'admin',
          email: 'admin@sekolah.sch.id',
          nama: 'Admin TU Sekolah',
          passwordHash: hashedPassword,
          status: 'Aktif',
          pegawaiId: pegStaffTUId,
          ...defaultFields,
        },
        {
          id: userKepsekId,
          username: 'kepsek',
          email: 'kepsek@sekolah.sch.id',
          nama: 'Drs. H. Ahmad Wijaya, M.Pd (Kepsek)',
          passwordHash: hashedPassword,
          status: 'Aktif',
          pegawaiId: pegKepsekId,
          ...defaultFields,
        },
        {
          id: userWakasekId,
          username: 'wakasek',
          email: 'wakasek@sekolah.sch.id',
          nama: 'Siti Rahmawati, S.Pd (Wakasek Kurikulum)',
          passwordHash: hashedPassword,
          status: 'Aktif',
          pegawaiId: pegWakasekId,
          ...defaultFields,
        },
        {
          id: userGuruId,
          username: 'guru',
          email: 'guru@sekolah.sch.id',
          nama: 'Budi Hermawan, S.Kom (Guru)',
          passwordHash: hashedPassword,
          status: 'Aktif',
          pegawaiId: pegGuruBKId,
          ...defaultFields,
        },
      ])
      .onConflictDoNothing();

    // 5. Master Klasifikasi Surat Dinas Sekolah (Format Kode Baku 421.x)
    console.log('5. Membuat Master Kode Klasifikasi Surat Dinas Sekolah...');
    const klasKurikulumId = crypto.randomUUID();
    const klasKesiswaanId = crypto.randomUUID();
    const klasKeuanganId = crypto.randomUUID();
    const klasKepegawaianId = crypto.randomUUID();

    await db
      .insert(schema.masterKlasifikasiSurat)
      .values([
        {
          id: klasKurikulumId,
          kode: '421.1',
          nama: 'Kurikulum & Pengajaran',
          deskripsi: 'Surat terkait jadwal, ujian, dan kurikulum',
          isAktif: true,
          ...defaultFields,
        },
        {
          id: klasKesiswaanId,
          kode: '421.2',
          nama: 'Kesiswaan & Ekstrakurikuler',
          deskripsi: 'Surat edaran wali murid, osis, beasiswa',
          isAktif: true,
          ...defaultFields,
        },
        {
          id: klasKeuanganId,
          kode: '421.3',
          nama: 'Keuangan & Komite',
          deskripsi: 'SPP, sumbangan komite, bantuan operasional',
          isAktif: true,
          ...defaultFields,
        },
        {
          id: klasKepegawaianId,
          kode: '421.5',
          nama: 'Kepegawaian & Tata Usaha',
          deskripsi: 'Surat tugas guru, izin operasional, SK',
          isAktif: true,
          ...defaultFields,
        },
      ])
      .onConflictDoNothing();

    // 6. Master Jenis Surat
    console.log('6. Membuat Master Jenis Surat...');
    const jenisUndanganId = crypto.randomUUID();
    const jenisTugasId = crypto.randomUUID();
    const jenisEdaranId = crypto.randomUUID();
    const jenisSKId = crypto.randomUUID();

    await db
      .insert(schema.masterJenisSurat)
      .values([
        {
          id: jenisUndanganId,
          kode: 'SU',
          nama: 'Surat Undangan',
          isAktif: true,
          ...defaultFields,
        },
        { id: jenisTugasId, kode: 'ST', nama: 'Surat Tugas', isAktif: true, ...defaultFields },
        { id: jenisEdaranId, kode: 'SE', nama: 'Surat Edaran', isAktif: true, ...defaultFields },
        {
          id: jenisSKId,
          kode: 'SK',
          nama: 'Surat Keputusan (SK)',
          isAktif: true,
          ...defaultFields,
        },
      ])
      .onConflictDoNothing();

    // 7. Master Prioritas & Sifat Surat
    console.log('7. Membuat Master Prioritas & Sifat Surat...');
    const prioritasBiasaId = crypto.randomUUID();
    const prioritasSegeraId = crypto.randomUUID();

    await db
      .insert(schema.masterPrioritas)
      .values([
        { id: prioritasBiasaId, nama: 'Biasa', isAktif: true, ...defaultFields },
        { id: prioritasSegeraId, nama: 'Segera / Penting', isAktif: true, ...defaultFields },
      ])
      .onConflictDoNothing();

    const sifatBiasaId = crypto.randomUUID();
    const sifatRahasiaId = crypto.randomUUID();

    await db
      .insert(schema.masterSifatSurat)
      .values([
        { id: sifatBiasaId, nama: 'Biasa', isAktif: true, ...defaultFields },
        { id: sifatRahasiaId, nama: 'Rahasia / Terbatas', isAktif: true, ...defaultFields },
      ])
      .onConflictDoNothing();

    // 8. Master Instansi Relasi
    console.log('8. Membuat Master Instansi Relasi...');
    const instansiDinasId = crypto.randomUUID();
    const instansiPuskesmasId = crypto.randomUUID();

    await db
      .insert(schema.masterInstansi)
      .values([
        {
          id: instansiDinasId,
          nama: 'Dinas Pendidikan & Kebudayaan Provinsi',
          jenis: 'Instansi Pemerintah',
          kota: 'Kota Utama',
          email: 'disdik@provinsi.go.id',
          isAktif: true,
          ...defaultFields,
        },
        {
          id: instansiPuskesmasId,
          nama: 'Puskesmas Kecamatan Pembina',
          jenis: 'Fasilitas Kesehatan',
          kota: 'Kota Utama',
          email: 'puskesmas@kota.go.id',
          isAktif: true,
          ...defaultFields,
        },
      ])
      .onConflictDoNothing();

    // 9. Sample Data Surat Masuk
    console.log('9. Membuat Contoh Data Surat Masuk...');
    const suratMasuk1Id = crypto.randomUUID();
    const suratMasuk2Id = crypto.randomUUID();

    await db
      .insert(schema.incomingLetters)
      .values([
        {
          id: suratMasuk1Id,
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
        },
        {
          id: suratMasuk2Id,
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
        },
      ])
      .onConflictDoNothing();

    // 10. Sample Disposisi untuk Surat Masuk 1
    console.log('10. Membuat Contoh Disposisi Kepsek...');
    await db
      .insert(schema.incomingDispositions)
      .values([
        {
          id: crypto.randomUUID(),
          suratId: suratMasuk1Id,
          pemberiDisposisiId: userKepsekId,
          penerimaDisposisiId: userWakasekId,
          instruksi: 'Harap hadir dampingi saya dan siapkan berkas laporan kurikulum sekolah.',
          status: 'MENUNGGU',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])
      .onConflictDoNothing();

    // 11. Sample Data Surat Keluar
    console.log('11. Membuat Contoh Data Surat Keluar...');
    await db
      .insert(schema.outgoingLetters)
      .values([
        {
          id: crypto.randomUUID(),
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
        },
        {
          id: crypto.randomUUID(),
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
        },
      ])
      .onConflictDoNothing();

    console.log('✅ SEEDING DATA DUMMY SEKOLAH BERHASIL!');
    console.log('\n--- AKUN UNTUK UJI COBA (PASSWORD SAMA: password123) ---');
    console.log('1. Admin TU        : username = admin    | password = password123');
    console.log('2. Kepala Sekolah  : username = kepsek   | password = password123');
    console.log('3. Wakasek         : username = wakasek  | password = password123');
    console.log('4. Guru / Staf     : username = guru     | password = password123');
    console.log('------------------------------------------------------------\n');
  } catch (error) {
    console.error('❌ Error saat seeding data dummy:', error);
  } finally {
    process.exit(0);
  }
}

main();
