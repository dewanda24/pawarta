import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL missing in .env.local');
}

const client = postgres(connectionString);

async function run() {
  console.log('🔧 Memperbaiki kolom parent_consents di Supabase...');

  try {
    // Ubah tipe kolom created_by dan updated_by menjadi varchar(255) dengan default 'system'
    await client.unsafe(`
      ALTER TABLE IF EXISTS parent_consents 
        ALTER COLUMN created_by TYPE varchar(255) USING coalesce(created_by::text, 'system'),
        ALTER COLUMN created_by SET DEFAULT 'system',
        ALTER COLUMN updated_by TYPE varchar(255) USING coalesce(updated_by::text, 'system'),
        ALTER COLUMN updated_by SET DEFAULT 'system';
    `);

    console.log('✅ Berhasil memperbaiki kolom created_by & updated_by di parent_consents.');
  } catch (err) {
    console.error('❌ Gagal:', err);
  } finally {
    await client.end();
  }
}

run();
