export type PaperSize = 'A4' | 'F4' | 'Letter' | 'Legal';
export type PaperOrientation = 'portrait' | 'landscape';
export type UnitType = 'cm' | 'mm' | 'in';

export interface MarginSettings {
  top: number;
  right: number;
  bottom: number;
  left: number;
  unit: UnitType;
}

export interface TypographySettings {
  fontFamily: 'Arial' | 'Bookman Old Style' | 'Times New Roman' | 'Calibri' | 'Tahoma';
  fontSizePt: number; // e.g. 10, 11, 12
  lineHeight: number; // e.g. 1.0, 1.15, 1.5, 2.0
  paragraphSpacingPt: number; // e.g. 6, 8, 12
  firstLineIndentCm: number; // e.g. 1.0, 1.25
}

export interface PaperSettings {
  ukuran: PaperSize;
  orientasi: PaperOrientation;
  margin: MarginSettings;
  tipografi: TypographySettings;
  tampilkanGarisBatasMargin?: boolean;
}

export interface DocumentTemplateItem {
  id: string;
  kode: string;
  nama: string;
  kategoriId?: string | null;
  jenisSuratId: string;
  deskripsi?: string | null;
  versiAktifId?: string | null;
  isAktif: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  kategori?: {
    id: string;
    nama: string;
  } | null;
  jenisSurat?: {
    id: string;
    nama: string;
    kode?: string | null;
  } | null;
  versiAktif?: {
    id: string;
    nomorVersi: string;
    kontenHtml: string;
    headerId?: string | null;
    footerId?: string | null;
    pengaturanKertas: PaperSettings;
    status: string;
  } | null;
}

export interface DocumentTemplateInput {
  id?: string;
  kode: string;
  nama: string;
  kategoriId?: string | null;
  jenisSuratId: string;
  deskripsi?: string | null;
  isAktif?: boolean;
  headerId?: string | null;
  footerId?: string | null;
  kontenHtml?: string;
  pengaturanKertas: PaperSettings;
}

export const MARGIN_PRESETS: Record<
  string,
  { nama: string; deskripsi: string; margin: MarginSettings }
> = {
  STANDAR_DINAS: {
    nama: 'Standar Tata Naskah Dinas (Resmi)',
    deskripsi:
      'Kiri: 3.0 cm, Atas: 2.5 cm, Kanan: 2.0 cm, Bawah: 2.5 cm (Ideal untuk jilid/ordner)',
    margin: { top: 2.5, right: 2.0, bottom: 2.5, left: 3.0, unit: 'cm' },
  },
  STANDAR_SEKOLAH_KOMPAK: {
    nama: 'Kompak / Hemat Kertas',
    deskripsi: 'Kiri: 2.0 cm, Atas: 2.0 cm, Kanan: 2.0 cm, Bawah: 2.0 cm (Untuk surat 1 lembar)',
    margin: { top: 2.0, right: 2.0, bottom: 2.0, left: 2.0, unit: 'cm' },
  },
  STANDAR_LAPORAN: {
    nama: 'Standar Laporan / SK Panjang',
    deskripsi: 'Kiri: 4.0 cm, Atas: 3.0 cm, Kanan: 3.0 cm, Bawah: 3.0 cm',
    margin: { top: 3.0, right: 3.0, bottom: 3.0, left: 4.0, unit: 'cm' },
  },
  SEIMBANG: {
    nama: 'Seimbang (Moderate)',
    deskripsi: 'Kiri: 2.5 cm, Atas: 2.5 cm, Kanan: 2.5 cm, Bawah: 2.5 cm (Margin rata standar)',
    margin: { top: 2.5, right: 2.5, bottom: 2.5, left: 2.5, unit: 'cm' },
  },
};

export const DEFAULT_PAPER_SETTINGS: PaperSettings = {
  ukuran: 'A4',
  orientasi: 'portrait',
  margin: {
    top: 2.5,
    right: 2.0,
    bottom: 2.5,
    left: 3.0,
    unit: 'cm',
  },
  tipografi: {
    fontFamily: 'Arial',
    fontSizePt: 11,
    lineHeight: 1.15,
    paragraphSpacingPt: 8,
    firstLineIndentCm: 1.0,
  },
  tampilkanGarisBatasMargin: true,
};
