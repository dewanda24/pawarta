import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL missing in .env.local');
}

const client = postgres(connectionString);

async function run() {
  console.log('Menambahkan kolom font size ke document_headers...');
  await client.unsafe(`
    ALTER TABLE document_headers 
    ADD COLUMN IF NOT EXISTS font_size_instansi_utama integer DEFAULT 14,
    ADD COLUMN IF NOT EXISTS font_size_instansi_induk integer DEFAULT 14,
    ADD COLUMN IF NOT EXISTS font_size_nama_sekolah integer DEFAULT 18,
    ADD COLUMN IF NOT EXISTS font_size_alamat integer DEFAULT 10,
    ADD COLUMN IF NOT EXISTS font_size_kontak integer DEFAULT 9;
  `);
  console.log('Kolom berhasil ditambahkan / diverifikasi!');
  await client.end();
}

run().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
