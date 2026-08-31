import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const sql = postgres(process.env.DATABASE_URL!);
  const classes = await sql`SELECT id, kode_kelas, nama_kelas, tingkat FROM master_kelas ORDER BY tingkat, kode_kelas`;
  console.log('Current classes in DB:', JSON.stringify(classes, null, 2));
  await sql.end();
}
main();
