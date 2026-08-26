import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema';
import { calculateSlaDeadline } from '../src/lib/sla-calculator';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is missing in environment variables.');
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client, { schema });

async function seedSchoolEnhancement() {
  console.log('--- Migrating & Seeding School Enhancements (Perbup Sumedang 9/2026) ---');

  try {
    // 1. Alter tables
    console.log('1. Memperbarui skema tabel master_pegawai dan incoming_letters...');
    await db.execute(sql`
      ALTER TABLE master_pegawai 
        ADD COLUMN IF NOT EXISTS pangkat_golongan varchar(100) DEFAULT 'Pembina Tingkat I (IV/b)';
    `);

    await db.execute(sql`
      ALTER TABLE incoming_letters 
        ADD COLUMN IF NOT EXISTS deadline_sla timestamp;
    `);

    // 2. Update Pegawai Sekolah & Kepala Sekolah dengan Pangkat/Golongan
    console.log('2. Memperbarui data pegawai dan kepala sekolah...');
    await db.execute(sql`
      UPDATE master_pegawai
      SET pangkat_golongan = 'Pembina Tingkat I (IV/b)'
      WHERE pangkat_golongan IS NULL;
    `);

    // 3. Update SLA pada Surat Masuk
    console.log('3. Menghitung dan menyelaraskan SLA surat masuk...');
    const letters = await db.select().from(schema.incomingLetters);
    for (const l of letters) {
      const deadline = calculateSlaDeadline(l.tanggalDiterima || new Date(), 'Biasa');
      await db.execute(sql`
        UPDATE incoming_letters
        SET deadline_sla = ${deadline.toISOString()}
        WHERE id = ${l.id} AND deadline_sla IS NULL;
      `);
    }

    console.log('\n--- Berhasil melakukan migrasi dan penyelarasan lingkungan sekolah! ---');
  } catch (error) {
    console.error('Error saat migrasi lingkungan sekolah:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seedSchoolEnhancement();
