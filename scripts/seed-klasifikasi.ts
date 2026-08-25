import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema';
import * as dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is missing in environment variables.');
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client, { schema });

const defaultKlasifikasi = [
  { kode: '420', nama: 'PENDIDIKAN (UMUM)', deskripsi: 'Urusan bidang pendidikan secara umum' },
  { kode: '421', nama: 'Penyelenggaraan Sekolah', deskripsi: 'Administrasi kelembagaan sekolah' },
  { kode: '421.1', nama: 'Pendidikan Pra Sekolah / PAUD / TK', deskripsi: 'Pendidikan anak usia dini dan taman kanak-kanak' },
  { kode: '421.2', nama: 'Sekolah Dasar (SD / MI)', deskripsi: 'Pendidikan tingkat dasar' },
  { kode: '421.3', nama: 'Sekolah Menengah Pertama (SMP / MTs)', deskripsi: 'Pendidikan tingkat menengah pertama' },
  { kode: '421.4', nama: 'Sekolah Menengah Atas (SMA / MA)', deskripsi: 'Pendidikan tingkat menengah atas' },
  { kode: '421.5', nama: 'Sekolah Menengah Kejuruan (SMK / MAK)', deskripsi: 'Pendidikan kejuruan dan vokasi' },
  { kode: '421.6', nama: 'Sekolah Luar Biasa (SLB)', deskripsi: 'Pendidikan khusus' },
  { kode: '421.7', nama: 'Kesiswaan, Ekstrakurikuler & Lomba', deskripsi: 'Dispensasi lomba, turnamen, OSIS, pramuka, pembinaan siswa' },
  { kode: '421.8', nama: 'Beasiswa & Kesejahteraan Siswa', deskripsi: 'PIP, KIP, beasiswa prestasi, bantuan sosial siswa' },
  { kode: '421.9', nama: 'Kelulusan, Ijazah & Alumni', deskripsi: 'Surat keterangan lulus, legalisir, surat ijazah' },
  { kode: '422', nama: 'Kurikulum & Pembelajaran', deskripsi: 'Kegiatan belajar mengajar dan kurikulum' },
  { kode: '422.1', nama: 'Ujian & Asesmen (ANBK, PTS, PAS)', deskripsi: 'Pelaksanaan ujian, penilaian sumatif, asesmen nasional' },
  { kode: '422.2', nama: 'Kalender Pendidikan & Jadwal Belajar', deskripsi: 'Penetapan hari efektif dan libur sekolah' },
  { kode: '422.3', nama: 'Praktik Kerja Lapangan (PKL / Prakerin)', deskripsi: 'Kerjasama magang dan PKL industri' },
  { kode: '423', nama: 'Tenaga Pendidik & Kependidikan (Guru & TU)', deskripsi: 'SK pembagian tugas mengajar, sertifikasi guru, MGMP' },
  { kode: '424', nama: 'Sarana & Prasarana Sekolah', deskripsi: 'Inventaris laboratorium, perpustakaan, gedung sekolah' },
  { kode: '425', nama: 'Komite Sekolah & Kemitraan', deskripsi: 'Rapat komite, paguyuban wali murid, MoU kemitraan' },
  { kode: '005', nama: 'Undangan Kedinasan / Rapat', deskripsi: 'Surat undangan pertemuan kedinasan dan rapat dinas' },
  { kode: '800', nama: 'Kepegawaian & Ketenagaan', deskripsi: 'Cuti, mutasi, kenaikan pangkat, pengusulan ASN/PPPK' },
  { kode: '900', nama: 'Keuangan & Dana BOS', deskripsi: 'Laporan BOS, BPOPP, SPP dan pertanggungjawaban anggaran' },
];

async function main() {
  console.log('Seeding Kode Klasifikasi Surat Sekolah...');
  try {
    for (const item of defaultKlasifikasi) {
      await db.insert(schema.masterKlasifikasiSurat).values({
        id: crypto.randomUUID(),
        kode: item.kode,
        nama: item.nama,
        deskripsi: item.deskripsi,
        level: item.kode.includes('.') ? 2 : 1,
        isAktif: true,
      }).onConflictDoUpdate({
        target: schema.masterKlasifikasiSurat.kode,
        set: {
          nama: item.nama,
          deskripsi: item.deskripsi,
          isAktif: true,
        }
      });
    }
    console.log(Berhasil menambahkan  kode klasifikasi surat!);
  } catch (error) {
    console.error('Error seeding klasifikasi:', error);
  } finally {
    process.exit(0);
  }
}

main();
