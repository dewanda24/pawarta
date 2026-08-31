export interface ConsentLetterConfig {
  // Identitas Dokumen
  nomorSurat: string;
  sifatSurat: string;
  lampiranSurat: string;
  perihalSurat: string;
  tempatSurat: string;
  tanggalSurat: string; // 'OTOMATIS' atau teks tanggal khusus seperti '18 Juli 2026'
  penerimaSurat: string;

  // Redaksi Halaman 1 (Pemberitahuan dari Sekolah)
  teksPembuka: string;
  ketentuan: {
    mulaiBerlaku: string;
    hariBelajar: string;
    jamBelajar: string;
    hariLibur: string;
  };
  paragrafTujuan: string;
  teksPenutup: string;

  // Redaksi Halaman 2 (Lembar Persetujuan Orang Tua)
  judulHalaman2: string;
  subjudulHalaman2: string;
  komitmenPoin: string[];

  // Penandatangan Sekolah
  penandatangan: {
    pegawaiId: string | null;
    nama: string;
    nip: string;
    jabatan: string; // e.g. "Kepala SMPN 1 UJUNGJAYA", "Plt. Kepala Sekolah", "Wakil Kepala Sekolah Bidang Kurikulum"
    pangkatGolongan?: string;
    tampilkanQr: boolean;
    tampilkanTtdDigital: boolean;
  };
}

export const DEFAULT_CONSENT_LETTER_CONFIG: ConsentLetterConfig = {
  nomorSurat: 'B/382/400.3.5.1/VIII/2026',
  sifatSurat: 'Penting',
  lampiranSurat: '1 Lembar (Lembar Persetujuan)',
  perihalSurat: 'Pemberitahuan & Persetujuan Pembelajaran 5 (Lima) Hari',
  tempatSurat: 'Sumedang',
  tanggalSurat: 'OTOMATIS',
  penerimaSurat: 'Bapak/Ibu Orang Tua / Wali Murid',

  teksPembuka:
    'Sehubungan dengan upaya peningkatan mutu pendidikan, penguatan karakter peserta didik, serta regulasi pemerintah terkait efisiensi hari belajar efektif, dengan ini kami beritahukan bahwa sekolah akan menerapkan sistem Pembelajaran 5 (Lima) Hari Sekolah.',

  ketentuan: {
    mulaiBerlaku: 'Tahun Pelajaran 2026/2027',
    hariBelajar: 'Senin s.d. Jumat',
    jamBelajar: '07.00 s.d. 15.00 WIB (disesuaikan dengan alokasi kurikulum dan jadwal KBM)',
    hariLibur: 'Sabtu dan Minggu',
  },

  paragrafTujuan:
    'Penerapan sistem ini bertujuan agar peserta didik memiliki waktu lebih leluasa di akhir pekan untuk penguatan pendidikan karakter bersama keluarga secara mandiri dan terarah.',

  teksPenutup:
    'Demikian pemberitahuan ini disampaikan. Atas kerja sama Bapak/Ibu, kami ucapkan terima kasih.',

  judulHalaman2: 'SURAT PERNYATAAN / PERSETUJUAN ORANG TUA / WALI MURID',
  subjudulHalaman2: 'PENERAPAN SISTEM PEMBELAJARAN 5 (LIMA) HARI SEKOLAH',

  komitmenPoin: [
    'Mendukung dan mematuhi tata tertib serta jadwal KBM dari hari Senin sampai dengan Jumat.',
    'Aktif menjalin komunikasi dengan pihak sekolah dan menghadiri pertemuan orang tua yang diselenggarakan sekolah.',
    'Memastikan kedisiplinan kehadiran anak dan menyelesaikan kewajiban administrasi sekolah tepat waktu.',
    'Melakukan pengawasan dan penguatan karakter anak dalam lingkungan keluarga pada hari Sabtu dan Minggu.',
  ],

  penandatangan: {
    pegawaiId: null,
    nama: 'Drs. H. Dedi Kusnadi, M.Pd.',
    nip: '19680512 199403 1 005',
    jabatan: 'Kepala SMPN 1 UJUNGJAYA',
    pangkatGolongan: 'Pembina Tingkat I (IV/b)',
    tampilkanQr: true,
    tampilkanTtdDigital: true,
  },
};
