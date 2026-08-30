import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema';
import * as xlsx from 'xlsx';
import * as path from 'path';
import { eq, sql } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is missing in environment variables.');
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client, { schema });

// Daftar 17 Rombel SMPN 1 Ujungjaya
const ROMBELS = [
  // Kelas 7 (Tingkat 7)
  { kodeKelas: '7A', namaKelas: 'Kelas 7A', tingkat: 7, tahunAjaran: '2026/2027' },
  { kodeKelas: '7B', namaKelas: 'Kelas 7B', tingkat: 7, tahunAjaran: '2026/2027' },
  { kodeKelas: '7C', namaKelas: 'Kelas 7C', tingkat: 7, tahunAjaran: '2026/2027' },
  { kodeKelas: '7D', namaKelas: 'Kelas 7D', tingkat: 7, tahunAjaran: '2026/2027' },
  { kodeKelas: '7E', namaKelas: 'Kelas 7E', tingkat: 7, tahunAjaran: '2026/2027' },
  // Kelas 8 (Tingkat 8)
  { kodeKelas: '8A', namaKelas: 'Kelas 8A', tingkat: 8, tahunAjaran: '2026/2027' },
  { kodeKelas: '8B', namaKelas: 'Kelas 8B', tingkat: 8, tahunAjaran: '2026/2027' },
  { kodeKelas: '8C', namaKelas: 'Kelas 8C', tingkat: 8, tahunAjaran: '2026/2027' },
  { kodeKelas: '8D', namaKelas: 'Kelas 8D', tingkat: 8, tahunAjaran: '2026/2027' },
  { kodeKelas: '8E', namaKelas: 'Kelas 8E', tingkat: 8, tahunAjaran: '2026/2027' },
  { kodeKelas: '8F', namaKelas: 'Kelas 8F', tingkat: 8, tahunAjaran: '2026/2027' },
  // Kelas 9 (Tingkat 9)
  { kodeKelas: '9A', namaKelas: 'Kelas 9A', tingkat: 9, tahunAjaran: '2026/2027' },
  { kodeKelas: '9B', namaKelas: 'Kelas 9B', tingkat: 9, tahunAjaran: '2026/2027' },
  { kodeKelas: '9C', namaKelas: 'Kelas 9C', tingkat: 9, tahunAjaran: '2026/2027' },
  { kodeKelas: '9D', namaKelas: 'Kelas 9D', tingkat: 9, tahunAjaran: '2026/2027' },
  { kodeKelas: '9E', namaKelas: 'Kelas 9E', tingkat: 9, tahunAjaran: '2026/2027' },
  { kodeKelas: '9F', namaKelas: 'Kelas 9F', tingkat: 9, tahunAjaran: '2026/2027' },
];

function cleanString(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  const str = String(val).trim();
  if (str === '' || str === '-' || str.toLowerCase() === 'null') return null;
  return str;
}

function buildAddress(row: any[]): string {
  const alamat = cleanString(row[9]);
  const rt = cleanString(row[10]);
  const rw = cleanString(row[11]);
  const dusun = cleanString(row[12]);
  const desa = cleanString(row[13]);
  const kec = cleanString(row[14]);

  const parts: string[] = [];
  if (alamat) parts.push(alamat);

  const rtrw: string[] = [];
  if (rt) rtrw.push(`RT ${rt.padStart(2, '0')}`);
  if (rw) rtrw.push(`RW ${rw.padStart(2, '0')}`);
  if (rtrw.length > 0) parts.push(rtrw.join('/'));

  if (dusun && dusun !== alamat) parts.push(`Dsn. ${dusun}`);
  if (desa) parts.push(`Desa ${desa}`);
  if (kec) parts.push(kec.startsWith('Kec.') ? kec : `Kec. ${kec}`);

  return parts.join(', ') || 'Kabupaten Sumedang';
}

async function main() {
  console.log('================================================================');
  console.log('🚀 MEMULAI IMPOR 474 DATA SISWA RIIL SMPN 1 UJUNGJAYA');
  console.log('================================================================\n');

  const filePath = path.resolve('DATA SISWA SMPN 1 UJUNGJAYA.xlsx');
  console.log(`📖 Membaca file: ${filePath}`);
  const wb = xlsx.readFile(filePath);
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const data: any[][] = xlsx.utils.sheet_to_json(ws, { header: 1 });

  console.log(`📄 Sheet: ${sheetName}, Total Baris File: ${data.length}`);

  // 1. Sinkronisasi 17 Master Kelas
  console.log('\n🏫 1. Menyinkronkan 17 Master Kelas (7A-7E, 8A-8F, 9A-9F)...');
  const kelasMap: Record<string, string> = {};

  for (const rombel of ROMBELS) {
    const existing = await db.query.masterKelas.findFirst({
      where: eq(schema.masterKelas.kodeKelas, rombel.kodeKelas),
    });

    if (existing) {
      kelasMap[rombel.kodeKelas] = existing.id;
      await db
        .update(schema.masterKelas)
        .set({
          namaKelas: rombel.namaKelas,
          tingkat: rombel.tingkat,
          tahunAjaran: rombel.tahunAjaran,
          isAktif: true,
        })
        .where(eq(schema.masterKelas.id, existing.id));
    } else {
      const [inserted] = await db
        .insert(schema.masterKelas)
        .values({
          kodeKelas: rombel.kodeKelas,
          namaKelas: rombel.namaKelas,
          tingkat: rombel.tingkat,
          tahunAjaran: rombel.tahunAjaran,
          isAktif: true,
        })
        .returning();
      kelasMap[rombel.kodeKelas] = inserted.id;
    }
  }

  // Nonaktifkan kelas dummy lama (misal X-MIPA-1 dsb)
  await db
    .update(schema.masterKelas)
    .set({ isAktif: false })
    .where(
      sql`${schema.masterKelas.kodeKelas} NOT IN (${sql.join(
        ROMBELS.map((r) => sql`${r.kodeKelas}`),
        sql`, `
      )})`
    );

  console.log(`✅ 17 Kelas Berhasil Disinkronkan.`);

  // 2. Ekstraksi Data Siswa dari Excel
  console.log('\n👥 2. Mengekstrak dan memvalidasi data siswa dari baris data...');
  const studentsToInsert: Array<typeof schema.masterSiswa.$inferInsert> = [];

  let rowCount = 0;
  for (let i = 7; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[1] || !row[4]) continue; // Lewati jika nama atau NISN kosong

    const nama = String(row[1]).trim();
    const nis = cleanString(row[2]);
    const jkRaw = cleanString(row[3])?.toUpperCase() || 'L';
    const jenisKelamin = jkRaw.startsWith('P') ? 'P' : 'L';
    const nisn = String(row[4]).trim();
    const tempatLahir = cleanString(row[5]);
    const tanggalLahir = cleanString(row[6]);

    // Data Orang Tua: Prioritas Ayah -> Ibu -> Wali
    const namaAyah = cleanString(row[24]);
    const pekAyah = cleanString(row[27]);
    const namaIbu = cleanString(row[30]);
    const pekIbu = cleanString(row[33]);
    const namaWali = cleanString(row[36]);
    const pekWali = cleanString(row[39]);

    const namaOrtu = namaAyah || namaIbu || namaWali || `Orang Tua dari ${nama}`;
    const pekerjaanOrtu = pekAyah || pekIbu || pekWali || 'Wiraswasta / Lainnya';
    const noHpOrtu = cleanString(row[19]) || cleanString(row[18]) || '081234567890';
    const alamat = buildAddress(row);

    const rombelKode = cleanString(row[42]) || '7A';
    const kelasId = kelasMap[rombelKode] || kelasMap['7A'];

    studentsToInsert.push({
      nama,
      nis,
      nisn,
      jenisKelamin,
      tempatLahir,
      tanggalLahir,
      kelasId,
      namaOrtu,
      pekerjaanOrtu,
      noHpOrtu,
      alamat,
      status: 'Aktif',
      isAktif: true,
    });

    rowCount++;
  }

  console.log(`📦 Terkumpul: ${studentsToInsert.length} data siswa riil siap diimpor.`);

  // 3. Simpan / Upsert Data Siswa ke Database
  console.log('\n💾 3. Memasukkan data siswa ke tabel master_siswa...');
  let insertedCount = 0;
  let updatedCount = 0;

  for (const s of studentsToInsert) {
    const existing = await db.query.masterSiswa.findFirst({
      where: eq(schema.masterSiswa.nisn, s.nisn),
    });

    if (existing) {
      await db
        .update(schema.masterSiswa)
        .set({
          nama: s.nama,
          nis: s.nis,
          jenisKelamin: s.jenisKelamin,
          tempatLahir: s.tempatLahir,
          tanggalLahir: s.tanggalLahir,
          kelasId: s.kelasId,
          namaOrtu: s.namaOrtu,
          pekerjaanOrtu: s.pekerjaanOrtu,
          noHpOrtu: s.noHpOrtu,
          alamat: s.alamat,
          status: 'Aktif',
          isAktif: true,
        })
        .where(eq(schema.masterSiswa.id, existing.id));
      updatedCount++;
    } else {
      await db.insert(schema.masterSiswa).values(s);
      insertedCount++;
    }
  }

  // 4. Update Identitas Master Sekolah jika belum SMPN 1 Ujungjaya
  console.log('\n🏫 4. Memastikan Profil Satuan Pendidikan SMPN 1 Ujungjaya...');
  const sekolah = await db.query.masterSekolah.findFirst({
    where: eq(schema.masterSekolah.isAktif, true),
  });

  if (sekolah) {
    await db
      .update(schema.masterSekolah)
      .set({
        nama: 'SMP NEGERI 1 UJUNGJAYA',
        npsn: '20208399',
        jenjang: 'SMP',
        status: 'Negeri',
        alamat: 'Jl. Raden Ali Sadikin No. 36 Ujungjaya',
        desa: 'Ujungjaya',
        kecamatan: 'Ujungjaya',
        kabupaten: 'Sumedang',
        provinsi: 'Jawa Barat',
        kodePos: '45383',
        telepon: '(0261) 8801234',
        email: 'smpn1ujungjaya@gmail.com',
        website: 'https://smpn1ujungjaya.sch.id',
      })
      .where(eq(schema.masterSekolah.id, sekolah.id));
  }

  // 5. Statistik Akhir
  console.log('\n================================================================');
  console.log('🎉 PROSES IMPOR & SEEDING SELESAI DENGAN SUKSES!');
  console.log('================================================================');
  console.log(`• Total Siswa Baru Di-insert: ${insertedCount}`);
  console.log(`• Total Siswa Di-update      : ${updatedCount}`);
  console.log(`• Total Data Siswa di DB    : ${insertedCount + updatedCount}`);
  console.log(`• Total Rombel Aktif        : 17 Rombongan Belajar`);
  console.log('================================================================\n');

  // Breakdown per rombel
  for (const rombel of ROMBELS) {
    const count = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.masterSiswa)
      .where(eq(schema.masterSiswa.kelasId, kelasMap[rombel.kodeKelas]));
    console.log(`  - ${rombel.namaKelas} (${rombel.kodeKelas}): ${count[0]?.count || 0} Siswa`);
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Terjadi kesalahan saat seeding data siswa:', err);
    process.exit(1);
  });
