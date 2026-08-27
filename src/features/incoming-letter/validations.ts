import { z } from 'zod';

export const incomingLetterSchema = z.object({
  nomorSurat: z.string().min(1, { message: 'Nomor surat wajib diisi' }),
  tanggalSurat: z.string().min(1, { message: 'Tanggal surat wajib diisi' }),
  tanggalDiterima: z.string().min(1, { message: 'Tanggal diterima wajib diisi' }),
  pengirim: z.string().min(1, { message: 'Pengirim wajib diisi' }),
  instansiPengirimId: z.string().optional().nullable(),
  perihal: z.string().min(1, { message: 'Perihal wajib diisi' }),
  ringkasanIsi: z.string().optional().nullable(),
  jenisSuratId: z.string().min(1, { message: 'Jenis surat wajib dipilih' }),
  klasifikasiId: z.string().min(1, { message: 'Klasifikasi wajib dipilih' }),
  prioritasId: z.string().min(1, { message: 'Prioritas wajib dipilih' }),
  sifatSuratId: z.string().min(1, { message: 'Sifat surat wajib dipilih' }),
  catatan: z.string().optional().nullable(),
});

export type IncomingLetterFormValues = z.infer<typeof incomingLetterSchema>;

export const distributeLetterSchema = z
  .object({
    tujuanUnitId: z.string().optional().nullable(),
    tujuanPegawaiId: z.string().optional().nullable(),
    catatan: z.string().optional().nullable(),
    deadline: z.string().optional().nullable(),
  })
  .refine((data) => !!(data.tujuanUnitId || data.tujuanPegawaiId), {
    message: 'Tujuan unit atau pegawai wajib dipilih',
    path: ['tujuanUnitId'],
  });

export type DistributeLetterFormValues = z.infer<typeof distributeLetterSchema>;

export const dispositionLetterSchema = z.object({
  penerimaDisposisiId: z.string().min(1, { message: 'Penerima disposisi wajib dipilih' }),
  instruksi: z.string().min(1, { message: 'Instruksi wajib diisi' }),
  catatan: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
});

export type DispositionLetterFormValues = z.infer<typeof dispositionLetterSchema>;
