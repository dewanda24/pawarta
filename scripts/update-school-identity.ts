import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema';
import { eq } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL missing');
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client, { schema });

async function updateSchool() {
  console.log('🏫 Sinkronisasi Identitas Sekolah ke SMPN 1 UJUNGJAYA...');

  // 1. Update / Insert Master Sekolah
  const existingSekolah = await db.query.masterSekolah.findFirst({
    where: eq(schema.masterSekolah.isAktif, true),
  });

  const sekolahData = {
    nama: 'SMPN 1 UJUNGJAYA',
    npsn: '20208421',
    alamat: 'Jalan Jaladustan Nomor 29 Ujungjaya',
    desa: 'Ujungjaya',
    kecamatan: 'Ujungjaya',
    kabupaten: 'Sumedang',
    provinsi: 'Jawa Barat',
    kodePos: '45383',
    telepon: '(0261) 881234',
    email: 'smpn1ujungjaya@gmail.com',
    website: 'https://smpn1ujungjaya.sch.id',
    logoUrl: '/LOGO SMPN 1 UJUNGJAYA a (1).png',
    isAktif: true,
  };

  if (existingSekolah) {
    await db
      .update(schema.masterSekolah)
      .set({ ...sekolahData, updatedAt: new Date() })
      .where(eq(schema.masterSekolah.id, existingSekolah.id));
    console.log('✅ Master Sekolah diupdate ke SMPN 1 UJUNGJAYA');
  } else {
    await db.insert(schema.masterSekolah).values(sekolahData);
    console.log('✅ Master Sekolah dibuat baru untuk SMPN 1 UJUNGJAYA');
  }

  // 2. Update / Insert Default Kop Surat
  const existingKop = await db.query.documentHeaders.findFirst({
    where: eq(schema.documentHeaders.isDefault, true),
  });

  const kopData = {
    namaKop: 'KOP Standar SMP Negeri 1 Ujungjaya',
    tipeKop: 'PERANGKAT_DAERAH',
    logoUrl: '/Lambang_Kabupaten_Sumedang.png',
    logoKiriUrl: '/Lambang_Kabupaten_Sumedang.png',
    logoKananUrl: '/LOGO SMPN 1 UJUNGJAYA a (1).png',
    instansiUtama: 'PEMERINTAH KABUPATEN SUMEDANG',
    instansiInduk: 'DINAS PENDIDIKAN',
    namaSekolah: 'SMP NEGERI 1 UJUNGJAYA',
    alamat: 'Jalan Jaladustan Nomor 29 Ujungjaya Sumedang 45383',
    kontak: 'Pos-el: smpn1ujungjaya@gmail.com | Laman: smpn1ujungjaya.sch.id',
    tipeGaris: 'double_thick',
    isDefault: true,
    isAktif: true,
  };

  if (existingKop) {
    await db
      .update(schema.documentHeaders)
      .set({ ...kopData, updatedAt: new Date() })
      .where(eq(schema.documentHeaders.id, existingKop.id));
    console.log('✅ Kop Surat diupdate ke KOP SMPN 1 Ujungjaya');
  } else {
    await db.insert(schema.documentHeaders).values(kopData);
    console.log('✅ Kop Surat dibuat baru');
  }

  // 3. Update / Insert Kepala Sekolah
  const existingKepsek = await db.query.masterPegawai.findFirst({
    where: eq(schema.masterPegawai.isAktif, true),
  });

  if (existingKepsek) {
    await db
      .update(schema.masterPegawai)
      .set({
        nama: existingKepsek.nama || 'Drs. H. Dedi Kusnadi, M.Pd.',
        nip: existingKepsek.nip || '19680512 199403 1 005',
        pangkatGolongan: 'Pembina Tk. I, IV/b',
        updatedAt: new Date(),
      })
      .where(eq(schema.masterPegawai.id, existingKepsek.id));
  }

  console.log('🎉 SINKRONISASI IDENTITAS SEKOLAH SELESAI!');
  await client.end();
  process.exit(0);
}

updateSchool().catch((err) => {
  console.error('❌ Error updating school identity:', err);
  process.exit(1);
});
