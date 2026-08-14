import { z } from 'zod';

export const archiveDocumentSchema = z.object({
  entityType: z.enum(['INCOMING', 'OUTGOING', 'OTHER']),
  entityId: z.string().uuid().optional(),
  kategoriId: z.string().uuid().optional(),
  perihal: z.string().min(1, { message: 'Perihal wajib diisi' }),
  tahun: z.number().int().min(2000),
  lokasiFisik: z.string().optional(),
  folderVirtual: z.string().optional(),
  retentionPolicyId: z.string().uuid().optional().nullable(),
  metadata: z.record(z.any()).optional(),
});

export type ArchiveDocumentFormValues = z.infer<typeof archiveDocumentSchema>;

export const borrowArchiveSchema = z.object({
  archiveId: z.string().uuid(),
  peminjamId: z.string().uuid(),
  unitPeminjamId: z.string().uuid().optional().nullable(),
  tanggalKembaliRencana: z.string(), // ISO String
  keperluan: z.string().min(1, { message: 'Keperluan wajib diisi' }),
});

export type BorrowArchiveFormValues = z.infer<typeof borrowArchiveSchema>;

export const returnArchiveSchema = z.object({
  borrowId: z.string().uuid(),
  catatan: z.string().optional(),
});
