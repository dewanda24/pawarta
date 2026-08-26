import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is missing in environment variables.');
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client, { schema });

async function seedKopSurat() {
  console.log('--- Migrating & Seeding Document Header (KOP Surat) Perbup Sumedang 9/2026 ---');

  try {
    // 1. Add columns if not exists
    await db.execute(
      sql`ALTER TABLE document_headers ADD COLUMN IF NOT EXISTS logo_kiri_url text;`,
    );
    await db.execute(
      sql`ALTER TABLE document_headers ADD COLUMN IF NOT EXISTS logo_kanan_url text;`,
    );
    await db.execute(
      sql`ALTER TABLE document_headers ADD COLUMN IF NOT EXISTS instansi_induk varchar(255);`,
    );
    await db.execute(
      sql`ALTER TABLE document_headers ADD COLUMN IF NOT EXISTS tipe_kop varchar(50) DEFAULT 'PERANGKAT_DAERAH';`,
    );

    // 2. Insert Standard Templates
    const templates = [
      {
        namaKop: 'KOP Standar SMP Negeri 1 Ujungjaya',
        tipeKop: 'PERANGKAT_DAERAH',
        logoUrl: '/Lambang_Kabupaten_Sumedang.png',
        logoKiriUrl: '/Lambang_Kabupaten_Sumedang.png',
        logoKananUrl: '/LOGO SMPN 1 UJUNGJAYA a (1).png',
        instansiUtama: 'PEMERINTAH KABUPATEN SUMEDANG',
        instansiInduk: 'DINAS PENDIDIKAN',
        namaSekolah: 'SMP NEGERI 1 UJUNGJAYA',
        alamat: 'Jalan Jaladustan Nomor 29 Ujungjaya Sumedang 45383',
        kontak: 'Pos-el: smpn1ujungjaya@gmail.com',
        tipeGaris: 'double_thick',
        isDefault: true,
      },
      {
        namaKop: 'KOP Dinas Pendidikan Kabupaten Sumedang',
        tipeKop: 'PERANGKAT_DAERAH',
        logoUrl: '/Lambang_Kabupaten_Sumedang.png',
        logoKiriUrl: '/Lambang_Kabupaten_Sumedang.png',
        logoKananUrl: null,
        instansiUtama: 'PEMERINTAH KABUPATEN SUMEDANG',
        instansiInduk: null,
        namaSekolah: 'DINAS PENDIDIKAN',
        alamat: 'Jl. Cut Nyak Dien No. 48 Sumedang 45311',
        kontak: 'Telp: (0261) 201258 • Pos-el: disdik@sumedangkab.go.id',
        tipeGaris: 'double_thick',
        isDefault: false,
      },
      {
        namaKop: 'KOP Jabatan Bupati Sumedang',
        tipeKop: 'JABATAN_BUPATI',
        logoUrl: '/garuda-emas.png',
        logoKiriUrl: '/garuda-emas.png',
        logoKananUrl: null,
        instansiUtama: null,
        instansiInduk: null,
        namaSekolah: 'BUPATI SUMEDANG',
        alamat: 'Jl. Prabu Gajah Agung No. 9 Sumedang 45311',
        kontak: 'Telp: (0261) 201001 • Pos-el: bupati@sumedangkab.go.id',
        tipeGaris: 'double_thick',
        isDefault: false,
      },
      {
        namaKop: 'KOP Atas Nama Bupati (Sekretariat Daerah)',
        tipeKop: 'ATAS_NAMA_BUPATI',
        logoUrl: '/garuda-emas.png',
        logoKiriUrl: '/garuda-emas.png',
        logoKananUrl: null,
        instansiUtama: null,
        instansiInduk: null,
        namaSekolah: 'KABUPATEN SUMEDANG',
        alamat: 'Jl. Prabu Gajah Agung No. 9 Sumedang 45311',
        kontak: 'Telp: (0261) 201001 • Pos-el: setda@sumedangkab.go.id',
        tipeGaris: 'double_thick',
        isDefault: false,
      },
    ];

    for (const t of templates) {
      await db.execute(sql`
        INSERT INTO document_headers (
          id,
          nama_kop,
          tipe_kop,
          logo_url,
          logo_kiri_url,
          logo_kanan_url,
          instansi_utama,
          instansi_induk,
          nama_sekolah,
          alamat,
          kontak,
          tipe_garis,
          is_default,
          is_aktif,
          created_at,
          updated_at
        ) VALUES (
          gen_random_uuid(),
          ${t.namaKop},
          ${t.tipeKop},
          ${t.logoUrl},
          ${t.logoKiriUrl},
          ${t.logoKananUrl},
          ${t.instansiUtama},
          ${t.instansiInduk},
          ${t.namaSekolah},
          ${t.alamat},
          ${t.kontak},
          ${t.tipeGaris},
          ${t.isDefault},
          true,
          NOW(),
          NOW()
        )
        ON CONFLICT DO NOTHING;
      `);
      console.log(`  ✓ ${t.namaKop} (${t.tipeKop})`);
    }

    console.log('\n--- Berhasil melakukan migrasi dan seeding KOP Surat! ---');
  } catch (err) {
    console.error('Error during migration:', err);
  } finally {
    process.exit(0);
  }
}

seedKopSurat().catch(console.error);
