/**
 * Utility functions for formatting Class & Grade Level to Roman Numerals (Standar Naskah Dinas Resmi)
 */

export function toRomanGrade(tingkat: number | string | null | undefined): string {
  if (!tingkat) return '';
  const n = typeof tingkat === 'string' ? parseInt(tingkat, 10) : tingkat;
  switch (n) {
    case 1: return 'I';
    case 2: return 'II';
    case 3: return 'III';
    case 4: return 'IV';
    case 5: return 'V';
    case 6: return 'VI';
    case 7: return 'VII';
    case 8: return 'VIII';
    case 9: return 'IX';
    case 10: return 'X';
    case 11: return 'XI';
    case 12: return 'XII';
    default: return String(tingkat);
  }
}

/**
 * Format any raw class string to proper Roman numerals
 * e.g. "Kelas 7A" -> "Kelas VII-A", "7A" -> "VII-A"
 */
export function formatNamaKelasRomawi(namaKelas: string | null | undefined): string {
  if (!namaKelas) return '-';
  
  return namaKelas
    .replace(/\bKelas\s+7\b/gi, 'Kelas VII')
    .replace(/\bKelas\s+8\b/gi, 'Kelas VIII')
    .replace(/\bKelas\s+9\b/gi, 'Kelas IX')
    .replace(/\b7([A-Z])\b/g, 'VII-$1')
    .replace(/\b8([A-Z])\b/g, 'VIII-$1')
    .replace(/\b9([A-Z])\b/g, 'IX-$1')
    .replace(/\b7-([A-Z])\b/g, 'VII-$1')
    .replace(/\b8-([A-Z])\b/g, 'VIII-$1')
    .replace(/\b9-([A-Z])\b/g, 'IX-$1');
}
