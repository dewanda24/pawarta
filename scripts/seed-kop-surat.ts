import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function seedKopSurat() {
  console.log('Migrating & Seeding Document Header (KOP Surat)...');

  try {
    // Add columns if not exists
    await db.execute(
      sql`ALTER TABLE document_headers ADD COLUMN IF NOT EXISTS logo_kiri_url text;`,
    );
    await db.execute(
      sql`ALTER TABLE document_headers ADD COLUMN IF NOT EXISTS logo_kanan_url text;`,
    );
    await db.execute(
      sql`ALTER TABLE document_headers ADD COLUMN IF NOT EXISTS instansi_induk varchar(255);`,
    );

    // Check if default exists, if not insert SMPN 1 Ujungjaya template
    await db.execute(sql`
      INSERT INTO document_headers (
        nama_kop,
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
        is_aktif
      )
      SELECT 
        'KOP Resmi Dinas SMP Negeri 1 Ujungjaya',
        '/Lambang_Kabupaten_Sumedang.png',
        '/Lambang_Kabupaten_Sumedang.png',
        '/LOGO SMPN 1 UJUNGJAYA a (1).png',
        'PEMERINTAH DAERAH KABUPATEN SUMEDANG',
        'DINAS PENDIDIKAN',
        'SMP NEGERI 1 UJUNGJAYA',
        'Jalan Jaladustan Nomor 29 Ujungjaya Sumedang 45383',
        'e-mail : smpn1ujungjaya@gmail.com',
        'double_thick',
        true,
        true
      WHERE NOT EXISTS (SELECT 1 FROM document_headers WHERE nama_kop = 'KOP Resmi Dinas SMP Negeri 1 Ujungjaya');
    `);

    console.log('Document Header migration completed successfully!');
  } catch (err) {
    console.error('Error during migration:', err);
  } finally {
    process.exit(0);
  }
}

seedKopSurat().catch(console.error);
