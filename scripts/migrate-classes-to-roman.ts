import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

function toRoman(num: number | string): string {
  const n = typeof num === 'string' ? parseInt(num, 10) : num;
  switch (n) {
    case 1: return 'I';
    case 2: return 'II';
    case 3: return 'III';
    case 4: return 'IV';
    case 5: return 'V';
    case 6: return 'VI';
    case 7: return 'VII';
    case 8: return 'VIII';
    case 9: return 'IX';
    case 10: return 'X';
    case 11: return 'XI';
    case 12: return 'XII';
    default: return String(num);
  }
}

function normalizeKodeKelas(kode: string, tingkat: number): string {
  // Misal "7A" -> "VII-A", "8-B" -> "VIII-B", "9C" -> "IX-C", "X-MIPA-1" -> "X-MIPA-1"
  const roman = toRoman(tingkat);
  const match = kode.match(/^[0-9]+[-_\s]*([a-zA-Z0-9_-]+)$/);
  if (match) {
    const rombel = match[1].toUpperCase();
    return `${roman}-${rombel}`;
  }
  return kode;
}

function normalizeNamaKelas(nama: string, tingkat: number, kodeBaru: string): string {
  // Misal "Kelas 7A" -> "Kelas VII-A"
  const roman = toRoman(tingkat);
  const match = nama.match(/^Kelas\s+[0-9]+[-_\s]*([a-zA-Z0-9_-]+)$/i);
  if (match) {
    const rombel = match[1].toUpperCase();
    return `Kelas ${roman}-${rombel}`;
  }
  if (!nama.startsWith('Kelas ')) {
    return `Kelas ${kodeBaru}`;
  }
  return nama.replace(/\b7\b/g, 'VII').replace(/\b8\b/g, 'VIII').replace(/\b9\b/g, 'IX');
}

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL is missing');
    process.exit(1);
  }

  const sql = postgres(dbUrl);

  try {
    console.log('Fetching all classes in master_kelas...');
    const classes = await sql`SELECT id, kode_kelas, nama_kelas, tingkat FROM master_kelas`;

    for (const c of classes) {
      const kodeBaru = normalizeKodeKelas(c.kode_kelas, c.tingkat);
      const namaBaru = normalizeNamaKelas(c.nama_kelas, c.tingkat, kodeBaru);

      if (kodeBaru !== c.kode_kelas || namaBaru !== c.nama_kelas) {
        console.log(`Updating [${c.id}]: "${c.kode_kelas}" -> "${kodeBaru}", "${c.nama_kelas}" -> "${namaBaru}"`);
        await sql`
          UPDATE master_kelas
          SET kode_kelas = ${kodeBaru}, nama_kelas = ${namaBaru}, updated_at = NOW()
          WHERE id = ${c.id}
        `;
      }
    }

    console.log('All classes successfully migrated to Roman numerals!');
    const updated = await sql`SELECT id, kode_kelas, nama_kelas, tingkat FROM master_kelas ORDER BY tingkat, kode_kelas`;
    console.log('Updated classes:', JSON.stringify(updated, null, 2));
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await sql.end();
  }
}

main();
