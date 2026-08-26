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

    // Update existing headers if any
    await db.execute(
      sql`UPDATE document_headers SET logo_kiri_url = logo_url WHERE logo_kiri_url IS NULL AND logo_url IS NOT NULL;`,
    );

    console.log('Document Header migration completed successfully!');
  } catch (err) {
    console.error('Error during migration:', err);
  } finally {
    process.exit(0);
  }
}

seedKopSurat().catch(console.error);
