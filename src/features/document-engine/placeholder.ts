/**
 * Placeholder Engine
 * Ekstraksi, Validasi, dan Penggantian {{placeholder}} di dalam string HTML/Text.
 */

// Format regex untuk mencocokkan {{key_placeholder}}
const PLACEHOLDER_REGEX = /\{\{([a-zA-Z0-9_]+)\}\}/g;

export interface ValidationResult {
  isValid: boolean;
  missingPlaceholders: string[];
  duplicatePlaceholders: string[];
  foundPlaceholders: string[];
}

/**
 * Ekstrak semua placeholder dari template konten
 */
export function extractPlaceholders(content: string): string[] {
  const matches = [...content.matchAll(PLACEHOLDER_REGEX)];
  return matches.map((match) => match[1]); // ambil group ke-1 tanpa {{}}
}

/**
 * Validasi placeholder terhadap master data yang diizinkan (dari Master Placeholder Sprint 1)
 */
export function validatePlaceholders(
  content: string,
  allowedPlaceholderKeys: string[],
): ValidationResult {
  const extracted = extractPlaceholders(content);

  // Hitung frekuensi untuk deteksi duplikat (meskipun duplikat seringkali sah dalam dokumen)
  const frequency: Record<string, number> = {};
  extracted.forEach((p) => {
    frequency[p] = (frequency[p] || 0) + 1;
  });

  const missingPlaceholders = extracted.filter((p) => !allowedPlaceholderKeys.includes(p));

  const duplicatePlaceholders = Object.keys(frequency).filter((key) => frequency[key] > 1);

  return {
    isValid: missingPlaceholders.length === 0,
    missingPlaceholders,
    duplicatePlaceholders,
    foundPlaceholders: extracted,
  };
}

/**
 * Render string dengan mereplace placeholder menggunakan data JSON
 */
export function renderContent(content: string, data: Record<string, unknown>): string {
  if (!content) return '';

  return content.replace(PLACEHOLDER_REGEX, (match, key) => {
    // Jika data untuk key tersebut tidak ada, biarkan utuh atau ganti dengan peringatan
    if (data[key] !== undefined && data[key] !== null) {
      return String(data[key]);
    }
    return `<span class="text-red-500 font-bold">[!] ${key} KOSONG</span>`;
  });
}
