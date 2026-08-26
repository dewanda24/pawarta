/**
 * Generator Nomor Naskah Dinas Otomatis
 * Berdasarkan: Peraturan Bupati Sumedang Nomor 9 Tahun 2026
 * (Pasal 26 - 30 & Lampiran V)
 */

export type DerajatKeamananSurat = 'SR' | 'R' | 'T' | 'B';

export interface GenerateNomorParams {
  /**
   * Kode jenis surat, misalnya: 'PERBUP', 'KEPBUP', 'ST', 'SP', 'SPD', 'ND', 'SD', 'UND', 'SPGL', 'SE', 'SKET', dll.
   */
  kodeJenisSurat: string;
  /**
   * Nomor urut surat dalam satu tahun kalender (misal: 1, 15, 120)
   */
  nomorUrut: number | string;
  /**
   * Kode klasifikasi arsip (misal: '800', '421.2', '005')
   */
  kodeKlasifikasi?: string | null;
  /**
   * Kode perangkat daerah atau kode sekolah (misal: 'Disdik', 'Setda', 'SMPN-1-UJJ', 'BKPSDM')
   */
  kodePerangkatDaerah?: string | null;
  /**
   * Kode bagian / bidang untuk naskah dinas internal (misal: 'Bag.Org', 'Bid.SMP', 'TU')
   */
  kodeBagianBidang?: string | null;
  /**
   * Derajat klasifikasi keamanan arsip:
   * SR (Sangat Rahasia), R (Rahasia), T (Terbatas / Penting), B (Biasa / Terbuka)
   * Default: 'B'
   */
  derajatKeamanan?: DerajatKeamananSurat | string | null;
  /**
   * Tanggal naskah dibuat / diterbitkan (untuk menentukan tahun & bulan Romawi)
   */
  tanggal?: Date | string | null;
  /**
   * Jumlah digit padding untuk nomor urut (default: 3 digit, misal '001')
   */
  paddingDigit?: number;
}

const BULAN_ROMAWI = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

/**
 * Mengubah angka bulan (1-12) menjadi format Romawi (I - XII)
 */
export function getBulanRomawi(bulanIndex1Based: number): string {
  const normalized = Math.max(1, Math.min(12, bulanIndex1Based));
  return BULAN_ROMAWI[normalized - 1];
}

/**
 * Menstandarisasi kode derajat keamanan arsip (Pasal 65):
 * - SR: Sangat Rahasia
 * - R: Rahasia
 * - T: Terbatas / Penting
 * - B: Biasa / Terbuka
 */
export function normalizeDerajatKeamanan(sifat?: string | null): DerajatKeamananSurat {
  if (!sifat) return 'B';
  const upper = sifat.trim().toUpperCase();
  if (upper.includes('SANGAT RAHASIA') || upper === 'SR') return 'SR';
  if (upper.includes('RAHASIA') || upper === 'R') return 'R';
  if (upper.includes('PENTING') || upper.includes('TERBATAS') || upper === 'T') return 'T';
  return 'B';
}

/**
 * Mengenerate format nomor naskah dinas resmi sesuai Perbup Sumedang No. 9 Tahun 2026
 */
export function generateNomorNaskahDinas(params: GenerateNomorParams): string {
  const {
    kodeJenisSurat,
    nomorUrut,
    kodeKlasifikasi = '000',
    kodePerangkatDaerah = 'Disdik',
    kodeBagianBidang = 'TU',
    derajatKeamanan = 'B',
    tanggal = new Date(),
    paddingDigit = 3,
  } = params;

  const dateObj = typeof tanggal === 'string' ? new Date(tanggal) : tanggal || new Date();
  const year = isNaN(dateObj.getTime()) ? new Date().getFullYear() : dateObj.getFullYear();
  const monthRomawi = isNaN(dateObj.getTime())
    ? getBulanRomawi(new Date().getMonth() + 1)
    : getBulanRomawi(dateObj.getMonth() + 1);

  const cleanSeq =
    typeof nomorUrut === 'number'
      ? nomorUrut.toString().padStart(paddingDigit, '0')
      : nomorUrut.padStart(paddingDigit, '0');

  const cleanKlasifikasi = (kodeKlasifikasi || '000').trim();
  const cleanDerajat = normalizeDerajatKeamanan(derajatKeamanan);
  const cleanPerangkatDaerah = (kodePerangkatDaerah || 'Disdik').trim();
  const cleanBagian = (kodeBagianBidang || 'TU').trim();
  const upperJenis = (kodeJenisSurat || 'SD').trim().toUpperCase();

  // --------------------------------------------------------------------------
  // 1. Kategori Pengaturan & Regulasi (Pasal 26 & Lampiran V.A.1)
  // Format: NOMOR ...(1)... TAHUN ...(2)...
  // Contoh: PERATURAN BUPATI SUMEDANG NOMOR 9 TAHUN 2026
  // Termasuk: PERDA, PERBUP, PER_DPRD, INS (Instruksi), LD (Lembaran Daerah), BD (Berita Daerah)
  // --------------------------------------------------------------------------
  if (['PERDA', 'PERBUP', 'PER_DPRD', 'INS'].includes(upperJenis)) {
    return `NOMOR ${cleanSeq} TAHUN ${year}`;
  }
  if (['LD', 'BD'].includes(upperJenis)) {
    return `Nomor ${cleanSeq} Tahun ${year}`;
  }

  // --------------------------------------------------------------------------
  // 2. Kategori Penetapan (Pasal 27 & Lampiran V.A.2)
  // Format: NOMOR ...(1)... / ...(2)... TAHUN ...(3)...
  // (1) Kode Klasifikasi, (2) Nomor Urut, (3) Tahun Terbit
  // Contoh: KEPUTUSAN BUPATI SUMEDANG NOMOR 800/012 TAHUN 2026
  // --------------------------------------------------------------------------
  if (['KEPBUP', 'KEP_DPRD', 'KEP_PIM_DPRD', 'KEP_BK_DPRD'].includes(upperJenis)) {
    return `NOMOR ${cleanKlasifikasi}/${cleanSeq} TAHUN ${year}`;
  }

  // --------------------------------------------------------------------------
  // 3. Korespondensi Internal - NOTA DINAS (Pasal 28 & Lampiran V.B.1)
  // Format: Nomor: ...(1)... / ...(2)... / ...(3)... / ...(4)... / ...(5)...
  // (1) Nomor Urut, (2) Kode Klasifikasi, (3) Kode Bagian/Bidang, (4) Bulan Romawi, (5) Tahun Terbit
  // Contoh: Nomor: 015/800/Bag.Org/VIII/2026
  // --------------------------------------------------------------------------
  if (['ND', 'NOTA_DINAS', 'NOTA DINAS'].includes(upperJenis)) {
    return `Nomor: ${cleanSeq}/${cleanKlasifikasi}/${cleanBagian}/${monthRomawi}/${year}`;
  }

  // --------------------------------------------------------------------------
  // 4. Korespondensi Eksternal (Surat Dinas), Surat Undangan, Surat Panggilan
  // (Pasal 29 & Lampiran V.B.2 & V.C.7)
  // Format: Nomor: ...(1)... / ...(2)... / ...(3)... / ...(4)... / ...(5)... / ...(6)...
  // (1) Derajat Keamanan, (2) Nomor Urut, (3) Kode Klasifikasi, (4) Kode Perangkat Daerah, (5) Bulan Romawi, (6) Tahun
  // Contoh: Nomor: B/023/005/Disdik/VIII/2026
  // --------------------------------------------------------------------------
  if (
    [
      'SD',
      'SURAT_DINAS',
      'SURAT DINAS',
      'UND',
      'SURAT_UNDANGAN',
      'SPGL',
      'SURAT_PANGGILAN',
    ].includes(upperJenis)
  ) {
    return `Nomor: ${cleanDerajat}/${cleanSeq}/${cleanKlasifikasi}/${cleanPerangkatDaerah}/${monthRomawi}/${year}`;
  }

  // --------------------------------------------------------------------------
  // 5. Naskah Dinas Penugasan & Naskah Khusus Lainnya (Pasal 27 & Lampiran V.A.3 & V.C.2-6)
  // Format: NOMOR ...(1)... / ...(2)... / ...(3)...
  // (1) Kode Klasifikasi, (2) Nomor Urut, (3) Tahun Terbit
  // Contoh: SURAT TUGAS NOMOR 800/045/2026 atau Nomor: 005/012/2026
  // --------------------------------------------------------------------------
  if (['SP', 'ST', 'SPD', 'SKU', 'REK', 'SIZIN'].includes(upperJenis)) {
    return `NOMOR ${cleanKlasifikasi}/${cleanSeq}/${year}`;
  }
  if (['SE', 'SURAT_EDARAN'].includes(upperJenis)) {
    return `NOMOR ${cleanKlasifikasi}/${cleanSeq} TAHUN ${year}`;
  }

  // Default fallback untuk format standar naskah dinas
  return `Nomor: ${cleanKlasifikasi}/${cleanSeq}/${year}`;
}
