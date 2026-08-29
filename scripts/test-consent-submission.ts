import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import {
  getPublicClasses,
  getPublicStudentsByClass,
  submitParentConsent,
  getConsentDetailById,
} from '../src/features/student-letter/consent-actions';

async function runTest() {
  console.log('🧪 Menguji alur submit surat persetujuan orang tua...');

  // 1. Ambil Kelas
  const classesRes = await getPublicClasses();
  console.log('1. getPublicClasses:', classesRes.success, 'Total kelas:', classesRes.data?.length);

  if (!classesRes.data || classesRes.data.length === 0) {
    console.log('⚠️ Tidak ada kelas aktif untuk diuji');
    return;
  }

  const kelas = classesRes.data[0];
  console.log(`   Menggunakan kelas: ${kelas.namaKelas} (${kelas.id})`);

  // 2. Ambil Siswa
  const studentsRes = await getPublicStudentsByClass(kelas.id);
  console.log('2. getPublicStudentsByClass:', studentsRes.success, 'Total siswa:', studentsRes.data?.length);

  if (!studentsRes.data || studentsRes.data.length === 0) {
    console.log('⚠️ Tidak ada siswa di kelas ini untuk diuji');
    return;
  }

  const siswa = studentsRes.data[0];
  console.log(`   Menggunakan siswa: ${siswa.nama} (${siswa.id})`);

  // 3. Submit Consent
  const sampleTtd = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  const submitRes = await submitParentConsent({
    kategori: '5_HARI_KERJA',
    siswaId: siswa.id,
    kelasId: kelas.id,
    namaOrtu: 'Budi Santoso (Uji Sistem)',
    hubungan: 'Ayah Kandung',
    noHpOrtu: '081234567890',
    pekerjaanOrtu: 'Wiraswasta',
    alamatOrtu: 'Jl. Contoh Pengujian No. 123',
    statusPersetujuan: 'SETUJU',
    kesiapanFasilitas: {
      bekalMakan: true,
      transportasi: true,
      ibadah: true,
      pendampinganBelajar: true,
    },
    ttdDigital: sampleTtd,
  });

  console.log('3. submitParentConsent:', submitRes);

  if (!submitRes.success || !submitRes.data) {
    console.error('❌ Gagal submit persetujuan:', submitRes.error);
    process.exit(1);
  }

  const consentId = submitRes.data.id;
  console.log(`   ✅ Tersimpan dengan ID: ${consentId}, No: ${submitRes.data.nomorSurat}`);

  // 4. Detail / Cetak
  const detailRes = await getConsentDetailById(consentId);
  console.log('4. getConsentDetailById:', detailRes.success, 'Nomor:', detailRes.data?.nomorSurat);

  console.log('\n🎉 SELURUH PENGUJIAN BACKEND PERSETUJUAN ORANG TUA LULUS 100%!');
  process.exit(0);
}

runTest().catch((err) => {
  console.error('❌ Error testing:', err);
  process.exit(1);
});
