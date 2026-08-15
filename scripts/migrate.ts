import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL missing in .env.local');
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

async function run() {
  console.log('⏳ Menjalankan migrasi database ke Supabase/PostgreSQL...');
  try {
    await migrate(db, { migrationsFolder: './supabase/migrations' });
    console.log('✅ Migrasi skema database berhasil diaplikasikan!');
  } catch (error) {
    console.error('❌ Gagal menjalankan migrasi:', error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

run();
