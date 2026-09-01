export interface JadwalKbmItem {
  hari: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | string;
  jam: string;
  kegiatan?: string;
  isIstirahat?: boolean;
}

export interface LampiranJadwalConfig {
  judul?: string;
  subjudul?: string;
  items: JadwalKbmItem[];
}

export interface ConsentLetterConfig {
  // Identitas Dokumen
  nomorSurat: string;
  sifatSurat: string;
  lampiranSurat: string;
  perihalSurat: string;
  tempatSurat: string;
  tanggalSurat: string; // 'OTOMATIS' atau teks tanggal khusus seperti '18 Juli 2026'
  penerimaSurat: string;

  // Format Tipografi Surat
  fontSurat?: string; // 'Times New Roman' | 'Arial' | 'Bookman Old Style' | 'Garamond' | 'Georgia' | 'Calibri' | 'Tahoma'
  ukuranFontSurat?: number; // 10.5 | 11 | 12
  spasiSurat?: string; // '1.5' | '1.15' | '1.0'

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

  // Lampiran Resmi Surat Sekolah: Jadwal KBM 5 Hari Kerja
  lampiranJadwal?: LampiranJadwalConfig;

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

export const DEFAULT_LAMPIRAN_JADWAL_KBM: JadwalKbmItem[] = [
  // SENIN
  { hari: 'Senin', jam: '06.30–07.40', kegiatan: 'Upacara Bendera / Pembiasaan' },
  { hari: 'Senin', jam: '07.40–08.20', kegiatan: 'Jam Pelajaran ke-1' },
  { hari: 'Senin', jam: '08.20–09.00', kegiatan: 'Jam Pelajaran ke-2' },
  { hari: 'Senin', jam: '09.00–09.40', kegiatan: 'Jam Pelajaran ke-3' },
  { hari: 'Senin', jam: '09.40–10.10', kegiatan: 'Istirahat I', isIstirahat: true },
  { hari: 'Senin', jam: '10.10–10.50', kegiatan: 'Jam Pelajaran ke-4' },
  { hari: 'Senin', jam: '10.50–11.30', kegiatan: 'Jam Pelajaran ke-5' },
  { hari: 'Senin', jam: '11.30–12.10', kegiatan: 'Jam Pelajaran ke-6' },
  { hari: 'Senin', jam: '12.10–12.40', kegiatan: 'Istirahat II (Ishoma)', isIstirahat: true },
  { hari: 'Senin', jam: '12.40–13.20', kegiatan: 'Jam Pelajaran ke-7' },
  { hari: 'Senin', jam: '13.20–14.00', kegiatan: 'Jam Pelajaran ke-8' },

  // SELASA
  { hari: 'Selasa', jam: '06.30–07.00', kegiatan: 'Pembiasaan Pagi / Literasi' },
  { hari: 'Selasa', jam: '07.00–07.40', kegiatan: 'Jam Pelajaran ke-1' },
  { hari: 'Selasa', jam: '07.40–08.20', kegiatan: 'Jam Pelajaran ke-2' },
  { hari: 'Selasa', jam: '08.20–09.00', kegiatan: 'Jam Pelajaran ke-3' },
  { hari: 'Selasa', jam: '09.00–09.40', kegiatan: 'Jam Pelajaran ke-4' },
  { hari: 'Selasa', jam: '09.40–10.10', kegiatan: 'Istirahat I', isIstirahat: true },
  { hari: 'Selasa', jam: '10.10–10.50', kegiatan: 'Jam Pelajaran ke-5' },
  { hari: 'Selasa', jam: '10.50–11.30', kegiatan: 'Jam Pelajaran ke-6' },
  { hari: 'Selasa', jam: '11.30–12.10', kegiatan: 'Jam Pelajaran ke-7' },
  { hari: 'Selasa', jam: '12.10–12.40', kegiatan: 'Istirahat II (Ishoma)', isIstirahat: true },
  { hari: 'Selasa', jam: '12.40–13.20', kegiatan: 'Jam Pelajaran ke-8' },
  { hari: 'Selasa', jam: '13.20–14.00', kegiatan: 'Jam Pelajaran ke-9' },

  // RABU
  { hari: 'Rabu', jam: '06.30–07.00', kegiatan: 'Pembiasaan Pagi / Literasi' },
  { hari: 'Rabu', jam: '07.00–07.40', kegiatan: 'Jam Pelajaran ke-1' },
  { hari: 'Rabu', jam: '07.40–08.20', kegiatan: 'Jam Pelajaran ke-2' },
  { hari: 'Rabu', jam: '08.20–09.00', kegiatan: 'Jam Pelajaran ke-3' },
  { hari: 'Rabu', jam: '09.00–09.40', kegiatan: 'Jam Pelajaran ke-4' },
  { hari: 'Rabu', jam: '09.40–10.10', kegiatan: 'Istirahat I', isIstirahat: true },
  { hari: 'Rabu', jam: '10.10–10.50', kegiatan: 'Jam Pelajaran ke-5' },
  { hari: 'Rabu', jam: '10.50–11.30', kegiatan: 'Jam Pelajaran ke-6' },
  { hari: 'Rabu', jam: '11.30–12.10', kegiatan: 'Jam Pelajaran ke-7' },
  { hari: 'Rabu', jam: '12.10–12.40', kegiatan: 'Istirahat II (Ishoma)', isIstirahat: true },
  { hari: 'Rabu', jam: '12.40–13.20', kegiatan: 'Jam Pelajaran ke-8' },
  { hari: 'Rabu', jam: '13.20–14.00', kegiatan: 'Jam Pelajaran ke-9' },

  // KAMIS
  { hari: 'Kamis', jam: '06.30–07.00', kegiatan: 'Pembiasaan Pagi / Literasi' },
  { hari: 'Kamis', jam: '07.00–07.40', kegiatan: 'Jam Pelajaran ke-1' },
  { hari: 'Kamis', jam: '07.40–08.20', kegiatan: 'Jam Pelajaran ke-2' },
  { hari: 'Kamis', jam: '08.20–09.00', kegiatan: 'Jam Pelajaran ke-3' },
  { hari: 'Kamis', jam: '09.00–09.40', kegiatan: 'Jam Pelajaran ke-4' },
  { hari: 'Kamis', jam: '09.40–10.10', kegiatan: 'Istirahat I', isIstirahat: true },
  { hari: 'Kamis', jam: '10.10–10.50', kegiatan: 'Jam Pelajaran ke-5' },
  { hari: 'Kamis', jam: '10.50–11.30', kegiatan: 'Jam Pelajaran ke-6' },
  { hari: 'Kamis', jam: '11.30–12.10', kegiatan: 'Jam Pelajaran ke-7' },
  { hari: 'Kamis', jam: '12.10–12.40', kegiatan: 'Istirahat II (Ishoma)', isIstirahat: true },
  { hari: 'Kamis', jam: '12.40–13.20', kegiatan: 'Jam Pelajaran ke-8' },
  { hari: 'Kamis', jam: '13.20–14.00', kegiatan: 'Jam Pelajaran ke-9' },

  // JUMAT
  { hari: 'Jumat', jam: '06.30–07.00', kegiatan: 'Pembiasaan Pagi / Keagamaan / Senam' },
  { hari: 'Jumat', jam: '07.00–07.40', kegiatan: 'Jam Pelajaran ke-1' },
  { hari: 'Jumat', jam: '07.40–08.20', kegiatan: 'Jam Pelajaran ke-2' },
  { hari: 'Jumat', jam: '08.20–09.00', kegiatan: 'Jam Pelajaran ke-3' },
  { hari: 'Jumat', jam: '09.00–09.30', kegiatan: 'Istirahat', isIstirahat: true },
  { hari: 'Jumat', jam: '09.30–10.10', kegiatan: 'Jam Pelajaran ke-4' },
  { hari: 'Jumat', jam: '10.10–10.50', kegiatan: 'Jam Pelajaran ke-5' },
  { hari: 'Jumat', jam: '10.50–11.30', kegiatan: 'Jam Pelajaran ke-6 (Persiapan Shalat Jumat)' },
];

export const DEFAULT_CONSENT_LETTER_CONFIG: ConsentLetterConfig = {
  nomorSurat: 'B/382/400.3.5.1/VIII/2026',
  sifatSurat: 'Penting',
  lampiranSurat: '1 Lembar Lampiran Jadwal KBM',
  perihalSurat: 'Pemberitahuan & Persetujuan Pembelajaran 5 (Lima) Hari',
  tempatSurat: 'Sumedang',
  tanggalSurat: 'OTOMATIS',
  penerimaSurat: 'Bapak/Ibu Orang Tua / Wali Murid',

  fontSurat: 'Arial',
  ukuranFontSurat: 11,
  spasiSurat: '1.5',

  teksPembuka:
    'Sehubungan dengan upaya peningkatan mutu pendidikan, penguatan karakter peserta didik, serta regulasi pemerintah terkait efisiensi hari belajar efektif, dengan ini kami beritahukan bahwa sekolah akan menerapkan sistem Pembelajaran 5 (Lima) Hari Sekolah.',

  ketentuan: {
    mulaiBerlaku: 'Tahun Pelajaran 2026/2027',
    hariBelajar: 'Senin s.d. Jumat',
    jamBelajar: '06.30 s.d. 14.00 WIB (Senin–Kamis) & 06.30 s.d. 11.30 WIB (Jumat) — Rincian Jadwal Terlampir',
    hariLibur: 'Sabtu dan Minggu',
  },

  paragrafTujuan:
    'Penerapan sistem ini bertujuan agar peserta didik memiliki waktu lebih leluasa di akhir pekan untuk penguatan pendidikan karakter bersama keluarga secara mandiri dan terarah.',

  teksPenutup:
    'Demikian pemberitahuan ini disampaikan. Atas kerja sama Bapak/Ibu, kami ucapkan terima kasih.',

  lampiranJadwal: {
    judul: 'LAMPIRAN: JADWAL KEGIATAN BELAJAR MENGAJAR (KBM)',
    subjudul: 'SISTEM PEMBELAJARAN 5 (LIMA) HARI KERJA SEKOLAH',
    items: DEFAULT_LAMPIRAN_JADWAL_KBM,
  },

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
