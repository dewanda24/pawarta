import { generateNomorNaskahDinas } from '../src/lib/nomor-surat-generator';

function testGenerator() {
  console.log('--- Testing Generator Nomor Naskah Dinas Perbup Sumedang 9/2026 ---\n');

  const testCases = [
    {
      kategori: '1. Naskah Pengaturan (Perbup)',
      params: {
        kodeJenisSurat: 'PERBUP',
        nomorUrut: 9,
        tanggal: new Date('2026-01-16'),
      },
      expected: 'NOMOR 009 TAHUN 2026',
    },
    {
      kategori: '2. Naskah Penetapan (SK Bupati)',
      params: {
        kodeJenisSurat: 'KEPBUP',
        kodeKlasifikasi: '800',
        nomorUrut: 12,
        tanggal: new Date('2026-03-01'),
      },
      expected: 'NOMOR 800/012 TAHUN 2026',
    },
    {
      kategori: '3. Naskah Penugasan (Surat Tugas)',
      params: {
        kodeJenisSurat: 'ST',
        kodeKlasifikasi: '800',
        nomorUrut: 45,
        tanggal: new Date('2026-04-10'),
      },
      expected: 'NOMOR 800/045/2026',
    },
    {
      kategori: '4. Korespondensi Internal (Nota Dinas)',
      params: {
        kodeJenisSurat: 'ND',
        kodeKlasifikasi: '800',
        nomorUrut: 15,
        kodeBagianBidang: 'Bag.Org',
        tanggal: new Date('2026-08-26'),
      },
      expected: 'Nomor: 015/800/Bag.Org/VIII/2026',
    },
    {
      kategori: '5. Korespondensi Eksternal (Surat Dinas - Biasa)',
      params: {
        kodeJenisSurat: 'SD',
        kodeKlasifikasi: '005',
        nomorUrut: 23,
        kodePerangkatDaerah: 'Disdik',
        derajatKeamanan: 'B',
        tanggal: new Date('2026-08-26'),
      },
      expected: 'Nomor: B/023/005/Disdik/VIII/2026',
    },
    {
      kategori: '6. Surat Undangan Eksternal (Penting/Terbatas)',
      params: {
        kodeJenisSurat: 'UND',
        kodeKlasifikasi: '005',
        nomorUrut: 5,
        kodePerangkatDaerah: 'Setda',
        derajatKeamanan: 'T',
        tanggal: new Date('2026-08-26'),
      },
      expected: 'Nomor: T/005/005/Setda/VIII/2026',
    },
  ];

  let allPassed = true;
  for (const tc of testCases) {
    const result = generateNomorNaskahDinas(tc.params);
    const passed = result === tc.expected;
    if (!passed) allPassed = false;
    console.log(`${passed ? '✅ PASS' : '❌ FAIL'}: ${tc.kategori}`);
    console.log(`   Hasil   : "${result}"`);
    console.log(`   Expected: "${tc.expected}"\n`);
  }

  if (allPassed) {
    console.log('🎉 SEMUA TEST RUMUS PENOMORAN PERBUP SUMEDANG 9/2026 BERHASIL!');
  } else {
    console.error('❌ Ada test yang gagal.');
    process.exit(1);
  }
}

testGenerator();
