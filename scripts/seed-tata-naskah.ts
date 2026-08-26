import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema';
import { DAFTAR_JENIS_NASKAH_DINAS } from '../src/config/tata-naskah-dinas';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is missing in environment variables (.env.local).');
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client, { schema });

async function seedTataNaskahDinas() {
  console.log('--- Migrating & Seeding Tata Naskah Dinas (Perbup Sumedang No. 9/2026) ---');

  try {
    // 1. Tambahkan kolom baru pada master_jenis_surat jika belum ada
    console.log('1. Memeriksa dan memperbarui struktur tabel master_jenis_surat...');
    await db.execute(sql`
      ALTER TABLE master_jenis_surat 
        ADD COLUMN IF NOT EXISTS kategori varchar(100) DEFAULT 'Naskah Dinas Korespondensi',
        ADD COLUMN IF NOT EXISTS sub_kategori varchar(100) DEFAULT 'Internal',
        ADD COLUMN IF NOT EXISTS font_family varchar(100) DEFAULT 'Arial',
        ADD COLUMN IF NOT EXISTS font_size integer DEFAULT 12,
        ADD COLUMN IF NOT EXISTS line_spacing varchar(20) DEFAULT '1.15',
        ADD COLUMN IF NOT EXISTS margin_kiri varchar(20) DEFAULT '3.0cm',
        ADD COLUMN IF NOT EXISTS margin_kanan varchar(20) DEFAULT '2.0cm',
        ADD COLUMN IF NOT EXISTS margin_atas varchar(20) DEFAULT '2.5cm',
        ADD COLUMN IF NOT EXISTS margin_bawah varchar(20) DEFAULT '2.5cm',
        ADD COLUMN IF NOT EXISTS ukuran_kertas varchar(50) DEFAULT 'F4';
    `);

    // 2. Seeding / Upsert daftar jenis naskah dinas
    console.log(
      `2. Melakukan seeding ${DAFTAR_JENIS_NASKAH_DINAS.length} jenis naskah dinas standar...`,
    );
    for (const item of DAFTAR_JENIS_NASKAH_DINAS) {
      await db.execute(sql`
        INSERT INTO master_jenis_surat (
          id,
          kode,
          nama,
          kategori,
          sub_kategori,
          font_family,
          font_size,
          line_spacing,
          margin_kiri,
          margin_kanan,
          margin_atas,
          margin_bawah,
          ukuran_kertas,
          deskripsi,
          is_aktif,
          created_at,
          updated_at
        ) VALUES (
          gen_random_uuid(),
          ${item.kode},
          ${item.nama},
          ${item.kategori},
          ${item.subKategori},
          ${item.fontFamily},
          ${item.fontSize},
          ${item.lineSpacing},
          ${item.marginKiri},
          ${item.marginKanan},
          ${item.marginAtas},
          ${item.marginBawah},
          ${item.ukuranKertas},
          ${item.deskripsi},
          true,
          NOW(),
          NOW()
        )
        ON CONFLICT (kode) DO UPDATE SET
          nama = EXCLUDED.nama,
          kategori = EXCLUDED.kategori,
          sub_kategori = EXCLUDED.sub_kategori,
          font_family = EXCLUDED.font_family,
          font_size = EXCLUDED.font_size,
          line_spacing = EXCLUDED.line_spacing,
          margin_kiri = EXCLUDED.margin_kiri,
          margin_kanan = EXCLUDED.margin_kanan,
          margin_atas = EXCLUDED.margin_atas,
          margin_bawah = EXCLUDED.margin_bawah,
          ukuran_kertas = EXCLUDED.ukuran_kertas,
          deskripsi = EXCLUDED.deskripsi,
          updated_at = NOW();
      `);
      console.log(`  ✓ [${item.kode}] ${item.nama} (${item.kategori} - ${item.subKategori})`);
    }

    console.log('\n--- Berhasil melakukan migrasi dan seeding standar Tata Naskah Dinas! ---');
  } catch (error) {
    console.error('Error saat seeding Tata Naskah Dinas:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seedTataNaskahDinas();
