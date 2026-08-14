import { z } from 'zod';

export const incomingLetterSchema = z.object({
  nomorSurat: z.string().min(1, { message: 'Nomor surat wajib diisi' }),
  tanggalSurat: z.string().min(1, { message: 'Tanggal surat wajib diisi' }),
  tanggalDiterima: z.string().min(1, { message: 'Tanggal diterima wajib diisi' }),
  pengirim: z.string().min(1, { message: 'Pengirim wajib diisi' }),
  instansiPengirimId: z.string().uuid().optional().nullable(),
  perihal: z.string().min(1, { message: 'Perihal wajib diisi' }),
  ringkasanIsi: z.string().optional(),
  jenisSuratId: z.string().uuid({ message: 'Jenis surat wajib dipilih' }),
  klasifikasiId: z.string().uuid({ message: 'Klasifikasi wajib dipilih' }),
  prioritasId: z.string().uuid({ message: 'Prioritas wajib dipilih' }),
  sifatSuratId: z.string().uuid({ message: 'Sifat surat wajib dipilih' }),
  catatan: z.string().optional(),
});

export type IncomingLetterFormValues = z.infer<typeof incomingLetterSchema>;

export const distributeLetterSchema = z.object({
  tujuanUnitId: z.string().uuid().optional().nullable(),
  tujuanPegawaiId: z.string().uuid().optional().nullable(),
  catatan: z.string().optional(),
  deadline: z.string().optional().nullable(), // ISO date string
}).refine(data => data.tujuanUnitId || data.tujuanPegawaiId, {
  message: 'Tujuan unit atau pegawai wajib dipilih',
  path: ['tujuanUnitId'], // At least one must be provided
});

export type DistributeLetterFormValues = z.infer<typeof distributeLetterSchema>;

export const dispositionLetterSchema = z.object({
  penerimaDisposisiId: z.string().uuid({ message: 'Penerima disposisi wajib dipilih' }),
  instruksi: z.string().min(1, { message: 'Instruksi wajib diisi' }),
  catatan: z.string().optional(),
  deadline: z.string().optional().nullable(),
});

export type DispositionLetterFormValues = z.infer<typeof dispositionLetterSchema>;
