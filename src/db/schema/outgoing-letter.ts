import { pgTable, varchar, text, uuid, json, date, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { auditFields } from './utils';
import {
  masterJenisSurat,
  masterKlasifikasiSurat,
  masterInstansi,
  masterPegawai,
  masterUnitKerja,
  masterPrioritas,
  masterSifatSurat,
} from './master';
import { documentTemplates, templateVersions } from './document';
import { users } from './iam';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { workflowInstances } from './workflow';

// ==========================================
// 1. Outgoing Letters (Surat Keluar)
// ==========================================
export const outgoingLetters = pgTable('outgoing_letters', {
  nomorAgenda: varchar('nomor_agenda', { length: 100 }), // Generate saat approved
  nomorSurat: varchar('nomor_surat', { length: 100 }), // Generate saat approved
  templateId: uuid('template_id').references(() => documentTemplates.id, { onDelete: 'restrict' }),
  jenisSuratId: uuid('jenis_surat_id').references(() => masterJenisSurat.id, {
    onDelete: 'restrict',
  }),
  klasifikasiId: uuid('klasifikasi_id').references(() => masterKlasifikasiSurat.id, {
    onDelete: 'restrict',
  }),
  prioritasId: uuid('prioritas_id').references(() => masterPrioritas.id, { onDelete: 'set null' }),
  sifatSuratId: uuid('sifat_surat_id').references(() => masterSifatSurat.id, {
    onDelete: 'set null',
  }),
  perihal: text('perihal').notNull(),
  tujuanSurat: varchar('tujuan_surat', { length: 255 }).notNull(), // Personal tujuan
  instansiTujuanId: uuid('instansi_tujuan_id').references(() => masterInstansi.id, {
    onDelete: 'set null',
  }), // Organisasi tujuan
  pembuatId: uuid('pembuat_id')
    .references(() => users.id, { onDelete: 'restrict' })
    .notNull(), // Konseptor
  unitKerjaId: uuid('unit_kerja_id')
    .references(() => masterUnitKerja.id, { onDelete: 'restrict' })
    .notNull(),
  penandatanganId: uuid('penandatangan_id').references(() => masterPegawai.id, {
    onDelete: 'restrict',
  }),
  tanggalSurat: date('tanggal_surat'),
  tanggalTerbit: date('tanggal_terbit'),
  status: varchar('status', { length: 50 }).notNull().default('DRAFT'), // DRAFT, REVIEW, APPROVED, PUBLISHED
  catatanTambahan: text('catatan_tambahan'),
  ...auditFields,
});

// ==========================================
// 2. Outgoing Letter Versions (Penyimpanan Draft)
// ==========================================
export const outgoingLetterVersions = pgTable('outgoing_letter_versions', {
  suratId: uuid('surat_id')
    .notNull()
    .references(() => outgoingLetters.id, { onDelete: 'cascade' }),
  versi: varchar('versi', { length: 20 }).notNull(), // v1, v2
  kontenHtml: text('konten_html').notNull(),
  dataPlaceholder: json('data_placeholder'), // Json simpanan pengisian form
  templateVersionId: uuid('template_version_id').references(() => templateVersions.id, {
    onDelete: 'set null',
  }),
  ...auditFields,
});

// ==========================================
// 3. Letter Reviews (Revisi & Approval)
// ==========================================
export const letterReviews = pgTable('letter_reviews', {
  suratId: uuid('surat_id')
    .notNull()
    .references(() => outgoingLetters.id, { onDelete: 'cascade' }),
  reviewerId: uuid('reviewer_id')
    .references(() => users.id, { onDelete: 'restrict' })
    .notNull(),
  tipeReview: varchar('tipe_review', { length: 50 }).notNull(), // APPROVE, REJECT, REVISE
  catatan: text('catatan'),
  ...auditFields,
});

// ==========================================
// 4. Letter Signatures (Tanda Tangan)
// ==========================================
export const letterSignatures = pgTable('letter_signatures', {
  suratId: uuid('surat_id')
    .notNull()
    .references(() => outgoingLetters.id, { onDelete: 'cascade' }),
  penandatanganId: uuid('penandatangan_id')
    .references(() => masterPegawai.id, { onDelete: 'restrict' })
    .notNull(),
  qrCodeUrl: text('qr_code_url'),
  kodeVerifikasi: varchar('kode_verifikasi', { length: 100 }).unique(),
  statusTtd: varchar('status_ttd', { length: 50 }).default('PENDING').notNull(),
  waktuTtd: timestamp('waktu_ttd'),
  ...auditFields,
});

// ==========================================
// 5. Letter Attachments (Lampiran)
// ==========================================
export const letterAttachments = pgTable('letter_attachments', {
  suratId: uuid('surat_id')
    .notNull()
    .references(() => outgoingLetters.id, { onDelete: 'cascade' }),
  namaFile: varchar('nama_file', { length: 255 }).notNull(),
  tipeMime: varchar('tipe_mime', { length: 100 }),
  ukuranBytes: integer('ukuran_bytes'),
  fileUrl: text('file_url').notNull(),
  deskripsi: text('deskripsi'),
  ...auditFields,
});

// ==========================================
// 6. Letter Distributions (Pengiriman)
// ==========================================
export const letterDistributions = pgTable('letter_distributions', {
  suratId: uuid('surat_id')
    .notNull()
    .references(() => outgoingLetters.id, { onDelete: 'cascade' }),
  tujuan: varchar('tujuan', { length: 255 }).notNull(),
  metodePengiriman: varchar('metode_pengiriman', { length: 100 }), // Email, Fisik, Kurir
  tanggalKirim: timestamp('tanggal_kirim'),
  statusPengiriman: varchar('status_pengiriman', { length: 50 }).default('PROSES'), // PROSES, TERKIRIM, GAGAL
  buktiKirimUrl: text('bukti_kirim_url'),
  ...auditFields,
});

// ==========================================
// RELATIONS
// ==========================================
export const outgoingLettersRelations = relations(outgoingLetters, ({ one, many }) => ({
  jenisSurat: one(masterJenisSurat, {
    fields: [outgoingLetters.jenisSuratId],
    references: [masterJenisSurat.id],
  }),
  instansiTujuan: one(masterInstansi, {
    fields: [outgoingLetters.instansiTujuanId],
    references: [masterInstansi.id],
  }),
  pembuat: one(users, {
    fields: [outgoingLetters.pembuatId],
    references: [users.id],
  }),
  unitKerja: one(masterUnitKerja, {
    fields: [outgoingLetters.unitKerjaId],
    references: [masterUnitKerja.id],
  }),
  penandatangan: one(masterPegawai, {
    fields: [outgoingLetters.penandatanganId],
    references: [masterPegawai.id],
  }),
  versions: many(outgoingLetterVersions),
  reviews: many(letterReviews),
  signatures: many(letterSignatures),
  attachments: many(letterAttachments),
  distributions: many(letterDistributions),
}));
