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
 * Robust extraction of numerical grade (tingkat) from class object or string
 */
export function extractTingkat(
  c: { tingkat?: number | string | null; kodeKelas?: string; namaKelas?: string } | number | string | null | undefined
): number {
  if (c === null || c === undefined) return 7;
  if (typeof c === 'number' && !isNaN(c) && c > 0) return c;
  if (typeof c === 'string') {
    const parsed = parseInt(c, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
    const str = c.toUpperCase();
    if (/\b(XII|12)\b/.test(str)) return 12;
    if (/\b(XI|11)\b/.test(str)) return 11;
    if (/\b(X|10)\b/.test(str)) return 10;
    if (/\b(IX|9)\b/.test(str)) return 9;
    if (/\b(VIII|8)\b/.test(str)) return 8;
    if (/\b(VII|7)\b/.test(str)) return 7;
    return 7;
  }
  if (typeof c === 'object') {
    if (typeof c.tingkat === 'number' && !isNaN(c.tingkat) && c.tingkat > 0) return c.tingkat;
    if (typeof c.tingkat === 'string') {
      const parsed = parseInt(c.tingkat, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    const str = `${c.kodeKelas || ''} ${c.namaKelas || ''}`.toUpperCase();
    if (/\b(XII|12)\b/.test(str)) return 12;
    if (/\b(XI|11)\b/.test(str)) return 11;
    if (/\b(X|10)\b/.test(str)) return 10;
    if (/\b(IX|9)\b/.test(str)) return 9;
    if (/\b(VIII|8)\b/.test(str)) return 8;
    if (/\b(VII|7)\b/.test(str)) return 7;
    const numMatch = str.match(/\d+/);
    if (numMatch) return parseInt(numMatch[0], 10);
  }
  return 7;
}

/**
 * Normalizes class identifiers for seamless matching between Roman and Arabic numerals
 * e.g. "7A", "7-A", "VII-A", "Kelas VII-A" all normalize to "7a"
 */
export function normalizeClassKey(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/\bkelas\b/gi, '')
    .replace(/\bviii\b/gi, '8')
    .replace(/\bvii\b/gi, '7')
    .replace(/\bxii\b/gi, '12')
    .replace(/\bxi\b/gi, '11')
    .replace(/\bix\b/gi, '9')
    .replace(/\bx\b/gi, '10')
    .replace(/[^a-z0-9]/g, '');
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
