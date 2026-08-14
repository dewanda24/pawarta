import { z } from 'zod';

export const outgoingLetterSchema = z.object({
  templateId: z.string().uuid({ message: 'Template tidak valid' }),
  jenisSuratId: z.string().uuid({ message: 'Jenis Surat wajib diisi' }),
  klasifikasiId: z.string().uuid({ message: 'Klasifikasi wajib diisi' }),
  perihal: z.string().min(3, { message: 'Perihal minimal 3 karakter' }),
  tujuanSurat: z.string().min(3, { message: 'Tujuan Surat wajib diisi' }),
  instansiTujuanId: z.string().uuid().optional().nullable(),
  prioritasId: z.string().uuid().optional().nullable(),
  sifatSuratId: z.string().uuid().optional().nullable(),
  unitKerjaId: z.string().uuid({ message: 'Unit Kerja wajib diisi' }),
  penandatanganId: z.string().uuid({ message: 'Penandatangan wajib diisi' }),
  catatanTambahan: z.string().optional().nullable(),
});

export type OutgoingLetterFormValues = z.infer<typeof outgoingLetterSchema>;
