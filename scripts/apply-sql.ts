import fs from 'fs';
import path from 'path';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL missing in .env.local');
}

const client = postgres(connectionString);

async function run() {
  console.log('🚀 Menjalankan seluruh SQL migrasi ke Supabase secara langsung...');

  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  console.log(`Ditemukan ${files.length} file migrasi SQL:`, files);

  let combinedSql = '';

  for (const file of files) {
    console.log(`\n📄 Memproses: ${file}...`);
    const content = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    combinedSql +=
      `\n\n-- ==========================================\n-- FILE: ${file}\n-- ==========================================\n` +
      content;

    // Pecah berdasarkan statement-breakpoint atau semicolon
    const statements = content
      .split('--> statement-breakpoint')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      try {
        await client.unsafe(statement);
      } catch (err: unknown) {
        const pgErr = err as { code?: string; message?: string };
        // Jika tabel/kolom/constraint sudah ada (42P07, 42701, 42710), lanjutkan
        if (pgErr.code && ['42P07', '42701', '42710', '42P16'].includes(pgErr.code)) {
          // already exists, safe to ignore
        } else {
          console.warn(`  ⚠️ Warning on statement: ${pgErr.message || String(err)}`);
        }
      }
    }
    console.log(`  ✅ ${file} selesai.`);
  }

  // Simpan file SQL gabungan untuk opsi Supabase SQL Editor
  const outPath = path.join(process.cwd(), 'supabase', 'schema_full.sql');
  fs.writeFileSync(outPath, combinedSql, 'utf-8');
  console.log(`\n💾 Seluruh skema telah digabung dan disimpan di: ${outPath}`);

  await client.end();
  console.log('\n🎉 SINKRONISASI SKEMA DATABASE SELESAI!');
}

run().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
