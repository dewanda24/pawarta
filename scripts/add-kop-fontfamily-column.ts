import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL missing in .env.local');
}

const client = postgres(connectionString);

async function run() {
  console.log('Menambahkan kolom font_family ke document_headers...');
  await client.unsafe(`
    ALTER TABLE document_headers 
    ADD COLUMN IF NOT EXISTS font_family varchar(100) DEFAULT 'Times New Roman';
  `);
  console.log('Kolom font_family berhasil ditambahkan!');
  await client.end();
  process.exit(0);
}

run().catch((err) => {
  console.error('Migrasi gagal:', err);
  process.exit(1);
});

