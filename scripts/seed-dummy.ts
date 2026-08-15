import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema';
import * as dotenv from 'dotenv';
import crypto from 'crypto';

// Load environment variables
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is missing in environment variables.');
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client, { schema });

async function main() {
  console.log('Seeding Dummy Data...');

  try {
    const defaultFields = {
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Bersihkan data lama (opsional, hati-hati jika dipakai di production)
    console.log('Clearing old data...');
    await db.execute(sql`TRUNCATE TABLE master_sekolah, master_pegawai, master_jabatan, master_unit_kerja, master_instansi, master_jenis_surat, master_prioritas, master_sifat_surat CASCADE`);

    // 1. Master Unit Kerja
    console.log('Inserting Master Unit Kerja...');
    const unitKerjas = [
      { id: crypto.randomUUID(), kode: 'UK-01', nama: 'Sub Bagian Tata Usaha', isAktif: true, ...defaultFields },
      { id: crypto.randomUUID(), kode: 'UK-02', nama: 'Seksi Pendidikan Madrasah', isAktif: true, ...defaultFields },
      { id: crypto.randomUUID(), kode: 'UK-03', nama: 'Seksi Bimbingan Masyarakat Islam', isAktif: true, ...defaultFields },
    ];
    await db.insert(schema.masterUnitKerja).values(unitKerjas).onConflictDoNothing();

    // 2. Master Jabatan
    console.log('Inserting Master Jabatan...');
    const jabatans = [
      { id: crypto.randomUUID(), nama: 'Kepala Sub Bagian Tata Usaha', isAktif: true, ...defaultFields },
      { id: crypto.randomUUID(), nama: 'Kepala Seksi', isAktif: true, ...defaultFields },
      { id: crypto.randomUUID(), nama: 'Staff Administrasi', isAktif: true, ...defaultFields },
    ];
    await db.insert(schema.masterJabatan).values(jabatans).onConflictDoNothing();

    // 3. Master Pegawai
    console.log('Inserting Master Pegawai...');
    const pegawais = [
      { id: crypto.randomUUID(), nama: 'Budi Santoso', nip: '198001012005011001', email: 'budi@example.com', unitKerjaId: unitKerjas[0].id, jabatanId: jabatans[0].id, statusAsn: 'PNS', isAktif: true, ...defaultFields },
      { id: crypto.randomUUID(), nama: 'Siti Aminah', nip: '198505052010012002', email: 'siti@example.com', unitKerjaId: unitKerjas[1].id, jabatanId: jabatans[1].id, statusAsn: 'PNS', isAktif: true, ...defaultFields },
      { id: crypto.randomUUID(), nama: 'Ahmad Fauzi', nip: '199008082015011003', email: 'ahmad@example.com', unitKerjaId: unitKerjas[2].id, jabatanId: jabatans[2].id, statusAsn: 'PNS', isAktif: true, ...defaultFields },
    ];
    await db.insert(schema.masterPegawai).values(pegawais).onConflictDoNothing();

    // 4. Master Sekolah
    console.log('Inserting Master Sekolah...');
    const sekolahs = [
      { id: crypto.randomUUID(), nama: 'MIN 1 Kota', npsn: '12345678', jenjang: 'MI', status: 'Negeri', isAktif: true, kepalaSekolahId: pegawais[0].id, ...defaultFields },
      { id: crypto.randomUUID(), nama: 'MTsN 2 Kota', npsn: '87654321', jenjang: 'MTs', status: 'Negeri', isAktif: true, kepalaSekolahId: pegawais[1].id, ...defaultFields },
      { id: crypto.randomUUID(), nama: 'MAN 3 Kota', npsn: '11223344', jenjang: 'MA', status: 'Negeri', isAktif: true, kepalaSekolahId: pegawais[2].id, ...defaultFields },
    ];
    await db.insert(schema.masterSekolah).values(sekolahs).onConflictDoNothing();

    // 5. Master Instansi
    console.log('Inserting Master Instansi...');
    const instansis = [
      { id: crypto.randomUUID(), nama: 'Kementerian Agama Provinsi', jenis: 'Instansi Pemerintah', kota: 'Jakarta', email: 'kanwil@kemenag.go.id', isAktif: true, ...defaultFields },
      { id: crypto.randomUUID(), nama: 'Dinas Pendidikan', jenis: 'Instansi Daerah', kota: 'Jakarta', email: 'disdik@jakarta.go.id', isAktif: true, ...defaultFields },
      { id: crypto.randomUUID(), nama: 'Universitas Islam Negeri', jenis: 'Perguruan Tinggi', kota: 'Jakarta', email: 'rektorat@uin.ac.id', isAktif: true, ...defaultFields },
    ];
    await db.insert(schema.masterInstansi).values(instansis).onConflictDoNothing();

    // 6. Master Jenis Surat
    console.log('Inserting Master Jenis Surat...');
    const jenisSurat = [
      { id: crypto.randomUUID(), kode: 'SU', nama: 'Surat Undangan', isAktif: true, ...defaultFields },
      { id: crypto.randomUUID(), kode: 'ST', nama: 'Surat Tugas', isAktif: true, ...defaultFields },
      { id: crypto.randomUUID(), kode: 'SE', nama: 'Surat Edaran', isAktif: true, ...defaultFields },
    ];
    await db.insert(schema.masterJenisSurat).values(jenisSurat).onConflictDoNothing();

    // 7. Master Prioritas
    console.log('Inserting Master Prioritas...');
    const prioritas = [
      { id: crypto.randomUUID(), nama: 'Biasa', isAktif: true, ...defaultFields },
      { id: crypto.randomUUID(), nama: 'Segera', isAktif: true, ...defaultFields },
      { id: crypto.randomUUID(), nama: 'Sangat Segera', isAktif: true, ...defaultFields },
    ];
    await db.insert(schema.masterPrioritas).values(prioritas).onConflictDoNothing();

    // 8. Master Sifat Surat
    console.log('Inserting Master Sifat Surat...');
    const sifatSurat = [
      { id: crypto.randomUUID(), nama: 'Biasa', isAktif: true, ...defaultFields },
      { id: crypto.randomUUID(), nama: 'Penting', isAktif: true, ...defaultFields },
      { id: crypto.randomUUID(), nama: 'Rahasia', isAktif: true, ...defaultFields },
    ];
    await db.insert(schema.masterSifatSurat).values(sifatSurat).onConflictDoNothing();

    console.log('Dummy data seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding dummy data:', error);
  } finally {
    process.exit(0);
  }
}

main();
