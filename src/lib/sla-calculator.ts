/**
 * Kalkulator Batas Waktu SLA Pengendalian Naskah Masuk & Disposisi
 * Berdasarkan: Peraturan Bupati Sumedang Nomor 9 Tahun 2026 (Pasal 72)
 *
 * Ketentuan Pasal 72:
 * a. Amat Segera / Kilat : Batas waktu 24 jam setelah surat diterima.
 * b. Segera              : Batas waktu 2 x 24 jam setelah surat diterima.
 * c. Penting             : Batas waktu 3 x 24 jam setelah surat diterima.
 * d. Biasa               : Batas waktu paling lama 5 hari kerja setelah surat diterima.
 */

export type SifatSuratPerbup = 'AMAT_SEGERA' | 'SEGERA' | 'PENTING' | 'BIASA' | 'RAHASIA';

export interface SlaInfo {
  sifat: SifatSuratPerbup;
  label: string;
  durasiDeskripsi: string;
  deadline: Date;
  status: 'ON_TRACK' | 'WARNING' | 'OVERDUE';
  sisaJam: number;
  sisaHari: number;
  badgeColor: string;
}

/**
 * Normalisasi string nama sifat surat ke enum standar
 */
export function normalizeSifatSurat(sifatStr?: string | null): SifatSuratPerbup {
  if (!sifatStr) return 'BIASA';
  const upper = sifatStr.trim().toUpperCase();

  if (upper.includes('AMAT SEGERA') || upper.includes('KILAT')) return 'AMAT_SEGERA';
  if (upper.includes('SEGERA')) return 'SEGERA';
  if (upper.includes('PENTING')) return 'PENTING';
  if (upper.includes('RAHASIA')) return 'RAHASIA';
  return 'BIASA';
}

/**
 * Menambahkan N hari kerja (Senin-Jumat) ke sebuah tanggal
 */
export function addWorkDays(startDate: Date, days: number): Date {
  const date = new Date(startDate);
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    const dayOfWeek = date.getDay();
    // 0 = Minggu, 6 = Sabtu
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      added++;
    }
  }
  return date;
}

/**
 * Menghitung deadline SLA resmi berdasarkan waktu terima dan sifat surat
 */
export function calculateSlaDeadline(tanggalTerima: Date | string, sifatStr?: string | null): Date {
  const start =
    typeof tanggalTerima === 'string' ? new Date(tanggalTerima) : new Date(tanggalTerima);
  const baseDate = isNaN(start.getTime()) ? new Date() : new Date(start);
  const sifat = normalizeSifatSurat(sifatStr);

  switch (sifat) {
    case 'AMAT_SEGERA': {
      // 24 Jam
      return new Date(baseDate.getTime() + 24 * 60 * 60 * 1000);
    }
    case 'SEGERA': {
      // 2 x 24 Jam = 48 Jam
      return new Date(baseDate.getTime() + 48 * 60 * 60 * 1000);
    }
    case 'PENTING': {
      // 3 x 24 Jam = 72 Jam
      return new Date(baseDate.getTime() + 72 * 60 * 60 * 1000);
    }
    case 'RAHASIA': {
      // Rahasia diperlakukan setara Segera (48 Jam)
      return new Date(baseDate.getTime() + 48 * 60 * 60 * 1000);
    }
    case 'BIASA':
    default: {
      // 5 Hari Kerja
      return addWorkDays(baseDate, 5);
    }
  }
}

/**
 * Menghitung status SLA saat ini (apakah on track, warning, atau overdue)
 */
export function getSlaInfo(
  tanggalTerima: Date | string,
  sifatStr?: string | null,
  customDeadline?: Date | string | null,
): SlaInfo {
  const deadline = customDeadline
    ? typeof customDeadline === 'string'
      ? new Date(customDeadline)
      : customDeadline
    : calculateSlaDeadline(tanggalTerima, sifatStr);

  const sifat = normalizeSifatSurat(sifatStr);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const sisaJam = Math.round(diffMs / (1000 * 60 * 60));
  const sisaHari = Math.round(diffMs / (1000 * 60 * 60 * 24));

  let status: 'ON_TRACK' | 'WARNING' | 'OVERDUE' = 'ON_TRACK';
  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';

  if (diffMs <= 0) {
    status = 'OVERDUE';
    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
  } else if (diffMs <= 24 * 60 * 60 * 1000) {
    // Kurang dari 24 jam tersisa
    status = 'WARNING';
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  let label = 'Biasa';
  let durasiDeskripsi = 'Maksimal 5 hari kerja';
  if (sifat === 'AMAT_SEGERA') {
    label = 'Amat Segera / Kilat';
    durasiDeskripsi = 'Maksimal 24 jam';
  } else if (sifat === 'SEGERA') {
    label = 'Segera';
    durasiDeskripsi = 'Maksimal 2 x 24 jam (48 jam)';
  } else if (sifat === 'PENTING') {
    label = 'Penting';
    durasiDeskripsi = 'Maksimal 3 x 24 jam (72 jam)';
  } else if (sifat === 'RAHASIA') {
    label = 'Rahasia';
    durasiDeskripsi = 'Maksimal 48 jam';
  }

  return {
    sifat,
    label,
    durasiDeskripsi,
    deadline,
    status,
    sisaJam,
    sisaHari,
    badgeColor,
  };
}

/**
 * Daftar Instruksi Baku Lembar Disposisi Sesuai Lampiran II.A.3 Perbup 9/2026
 */
export const INSTRUKSI_DISPOSISI_STANDAR = [
  'Tanggapan dan Saran',
  'Proses lebih lanjut',
  'Koordinasi/konfirmasikan',
  'Hadiri / Wakili',
  'Siapkan bahan / laporan',
  'Arsipkan / Untuk diketahui',
] as const;
