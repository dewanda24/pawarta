import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema';
import { eq, sql } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL missing');

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client, { schema });

async function fixAllSchools() {
  console.log('🔍 Memperbaiki data master_sekolah & document_headers...');

  // Set non-SMPN 1 Ujungjaya to is_aktif = false
  await db.execute(sql`
    UPDATE master_sekolah 
    SET is_aktif = false 
    WHERE nama != 'SMPN 1 UJUNGJAYA'
  `);

  // Ensure SMPN 1 Ujungjaya is active and has correct data
  await db.execute(sql`
    UPDATE master_sekolah 
    SET 
      nama = 'SMPN 1 UJUNGJAYA',
      npsn = '20208421',
      alamat = 'Jalan Jaladustan Nomor 29 Ujungjaya',
      desa = 'Ujungjaya',
      kecamatan = 'Ujungjaya',
      kabupaten = 'Sumedang',
      provinsi = 'Jawa Barat',
      kode_pos = '45383',
      telepon = '(0261) 881234',
      email = 'smpn1ujungjaya@gmail.com',
      website = 'https://smpn1ujungjaya.sch.id',
      is_aktif = true
    WHERE nama = 'SMPN 1 UJUNGJAYA'
  `);

  // Deactivate non-default document headers, set SMPN 1 Ujungjaya as default
  await db.execute(sql`
    UPDATE document_headers
    SET is_default = false
  `);

  await db.execute(sql`
    UPDATE document_headers
    SET 
      instansi_utama = 'PEMERINTAH KABUPATEN SUMEDANG',
      instansi_induk = 'DINAS PENDIDIKAN',
      nama_sekolah = 'SMP NEGERI 1 UJUNGJAYA',
      alamat = 'Jalan Jaladustan Nomor 29 Ujungjaya Sumedang 45383',
      kontak = 'Pos-el: smpn1ujungjaya@gmail.com | Laman: smpn1ujungjaya.sch.id',
      logo_kiri_url = '/Lambang_Kabupaten_Sumedang.png',
      logo_kanan_url = '/LOGO SMPN 1 UJUNGJAYA a (1).png',
      logo_url = '/Lambang_Kabupaten_Sumedang.png',
      is_default = true,
      is_aktif = true
    WHERE id = (SELECT id FROM document_headers ORDER BY created_at DESC LIMIT 1)
  `);

  const activeSchools = await db.select().from(schema.masterSekolah).where(eq(schema.masterSekolah.isAktif, true));
  console.log('✅ Sekolah Aktif Sekarang:', activeSchools.map((s) => ({ id: s.id, nama: s.nama })));

  const activeKop = await db.select().from(schema.documentHeaders).where(eq(schema.documentHeaders.isDefault, true));
  console.log('✅ KOP Surat Default Sekarang:', activeKop.map((k) => ({ id: k.id, namaSekolah: k.namaSekolah })));

  await client.end();
  process.exit(0);
}

fixAllSchools().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
