import { db } from '../src/db';
import { documentHeaders } from '../src/db/schema/document';
import { eq } from 'drizzle-orm';

async function seedKopSurat() {
  console.log('Seeding Document Header (KOP Surat)...');

  const existing = await db.query.documentHeaders.findFirst();
  if (existing) {
    console.log('Document Header already exists, skipping.');
    return;
  }

  await db.insert(documentHeaders).values([
    {
      namaKop: 'KOP Resmi Dinas Pendidikan Jawa Timur',
      instansiUtama: 'PEMERINTAH PROVINSI JAWA TIMUR • DINAS PENDIDIKAN',
      namaSekolah: 'SMA NEGERI 1 KOTA CONTOH',
      alamat: 'Jl. Pendidikan No. 45, Kec. Karangpilang, Kota Surabaya, Jawa Timur 60221',
      kontak: 'Telp: (031) 7531234 • Email: info@sman1kotacontoh.sch.id',
      website: 'www.sman1kotacontoh.sch.id',
      tipeGaris: 'double_thick',
      isDefault: true,
      isAktif: true,
    },
    {
      namaKop: 'KOP Komite Sekolah & Persatuan Orang Tua',
      instansiUtama: 'KOMITE SEKOLAH • SMA NEGERI 1 KOTA CONTOH',
      namaSekolah: 'PERSATUAN ORANG TUA SISWA DAN GURU',
      alamat: 'Jl. Pendidikan No. 45, Kota Surabaya, Jawa Timur',
      kontak: 'Email: komite@sman1kotacontoh.sch.id',
      website: 'www.sman1kotacontoh.sch.id',
      tipeGaris: 'single_thick',
      isDefault: false,
      isAktif: true,
    },
  ]);

  console.log('Seed Document Headers completed successfully!');
}

seedKopSurat().catch(console.error);
