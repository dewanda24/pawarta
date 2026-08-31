import { pgTable, varchar, text, boolean, integer, json, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { auditFields } from './utils';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { masterJenisSurat, masterInstansi } from './master';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { users } from './iam';

// ==========================================
// 1. Template Categories
// ==========================================
export const templateCategories = pgTable('template_categories', {
  nama: varchar('nama', { length: 100 }).unique().notNull(), // Administrasi, Akademik, Umum
  deskripsi: text('deskripsi'),
  isAktif: boolean('is_aktif').default(true).notNull(),
  ...auditFields,
});

// ==========================================
// 2. Document Headers (Kop Surat)
// ==========================================
export const documentHeaders = pgTable('document_headers', {
  namaKop: varchar('nama_kop', { length: 255 }).notNull(),
  logoUrl: text('logo_url'), // Backwards compatibility
  logoKiriUrl: text('logo_kiri_url'), // Logo sisi kiri (misal: Logo Pemda / Dinas)
  logoKananUrl: text('logo_kanan_url'), // Logo sisi kanan (misal: Logo Sekolah / Tut Wuri)
  instansiUtama: varchar('instansi_utama', { length: 255 }), // e.g. PEMERINTAH DAERAH KABUPATEN SUMEDANG
  instansiInduk: varchar('instansi_induk', { length: 255 }), // e.g. DINAS PENDIDIKAN
  namaSekolah: varchar('nama_sekolah', { length: 255 }), // e.g. SMP NEGERI 1 UJUNGJAYA
  alamat: text('alamat'),
  kontak: varchar('kontak', { length: 255 }), // e.g. Telp / Email
  website: varchar('website', { length: 100 }),
  tipeKop: varchar('tipe_kop', { length: 50 }).default('PERANGKAT_DAERAH'), // PERANGKAT_DAERAH, JABATAN_BUPATI, ATAS_NAMA_BUPATI
  tipeGaris: varchar('tipe_garis', { length: 50 }).default('double_thick'),
  fontFamily: varchar('font_family', { length: 100 }).default('Arial'),
  fontSizeInstansiUtama: integer('font_size_instansi_utama'),
  fontSizeInstansiInduk: integer('font_size_instansi_induk'),
  fontSizeNamaSekolah: integer('font_size_nama_sekolah'),
  fontSizeAlamat: integer('font_size_alamat'),
  fontSizeKontak: integer('font_size_kontak'),
  isDefault: boolean('is_default').default(false).notNull(),
  isAktif: boolean('is_aktif').default(true).notNull(),
  ...auditFields,
});

// ==========================================
// 3. Document Footers (Tanda Tangan)
// ==========================================
export const documentFooters = pgTable('document_footers', {
  namaFooter: varchar('nama_footer', { length: 255 }).notNull(),
  layout: varchar('layout', { length: 50 }).default('1_kolom').notNull(), // 1_kolom, 2_kolom, 3_kolom
  konfigurasiTtd: json('konfigurasi_ttd').notNull(), // Simpan data struktur JSON untuk TTD (Mengetahui, Menyetujui)
  isDefault: boolean('is_default').default(false).notNull(),
  isAktif: boolean('is_aktif').default(true).notNull(),
  ...auditFields,
});

// ==========================================
// 4. Document Templates
// ==========================================
export const documentTemplates = pgTable('document_templates', {
  kode: varchar('kode', { length: 50 }).unique().notNull(),
  nama: varchar('nama', { length: 255 }).notNull(),
  kategoriId: uuid('kategori_id').references(() => templateCategories.id, { onDelete: 'set null' }),
  jenisSuratId: uuid('jenis_surat_id')
    .references(() => masterJenisSurat.id)
    .notNull(),
  deskripsi: text('deskripsi'),
  versiAktifId: uuid('versi_aktif_id'), // Akan direferensikan nanti ke template_versions
  isAktif: boolean('is_aktif').default(true).notNull(),
  ...auditFields,
});

// ==========================================
// 5. Template Versions
// ==========================================
export const templateVersions = pgTable('template_versions', {
  templateId: uuid('template_id')
    .notNull()
    .references(() => documentTemplates.id, { onDelete: 'cascade' }),
  nomorVersi: varchar('nomor_versi', { length: 20 }).notNull(), // v1.0, v1.1
  kontenHtml: text('konten_html').notNull(), // Body editor text
  headerId: uuid('header_id').references(() => documentHeaders.id, { onDelete: 'set null' }),
  footerId: uuid('footer_id').references(() => documentFooters.id, { onDelete: 'set null' }),
  pengaturanKertas: json('pengaturan_kertas').notNull(), // { ukuran: 'A4', orientasi: 'portrait', margin: '2cm 2cm' }
  status: varchar('status', { length: 20 }).default('Draft').notNull(), // Draft, Published, Archived
  catatanPerubahan: text('catatan_perubahan'),
  ...auditFields,
});

// ==========================================
// 6. Template Sections (Opsional untuk modularitas yang ekstrim)
// ==========================================
export const templateSections = pgTable('template_sections', {
  versionId: uuid('version_id')
    .notNull()
    .references(() => templateVersions.id, { onDelete: 'cascade' }),
  tipeSection: varchar('tipe_section', { length: 50 }).notNull(), // header, body, footer, lampiran
  urutan: integer('urutan').notNull().default(1),
  konten: text('konten'),
  ...auditFields,
});

// ==========================================
// 7. Generated Documents (Simulasi/Test Log)
// ==========================================
export const generatedDocuments = pgTable('generated_documents', {
  templateVersionId: uuid('template_version_id').references(() => templateVersions.id, {
    onDelete: 'set null',
  }),
  namaFile: varchar('nama_file', { length: 255 }).notNull(),
  tipeExport: varchar('tipe_export', { length: 20 }).notNull(), // PDF, DOCX
  dataPlaceholder: json('data_placeholder'), // Data asli yang diinject saat render
  ...auditFields,
});

export const templateTests = pgTable('template_tests', {
  templateVersionId: uuid('template_version_id')
    .notNull()
    .references(() => templateVersions.id, { onDelete: 'cascade' }),
  hasilRender: text('hasil_render'),
  errorLog: text('error_log'),
  isSukses: boolean('is_sukses').notNull(),
  ...auditFields,
});

// ==========================================
// RELATIONS
// ==========================================
export const documentTemplatesRelations = relations(documentTemplates, ({ one, many }) => ({
  kategori: one(templateCategories, {
    fields: [documentTemplates.kategoriId],
    references: [templateCategories.id],
  }),
  jenisSurat: one(masterJenisSurat, {
    fields: [documentTemplates.jenisSuratId],
    references: [masterJenisSurat.id],
  }),
  versions: many(templateVersions),
}));

export const templateVersionsRelations = relations(templateVersions, ({ one, many }) => ({
  template: one(documentTemplates, {
    fields: [templateVersions.templateId],
    references: [documentTemplates.id],
  }),
  header: one(documentHeaders, {
    fields: [templateVersions.headerId],
    references: [documentHeaders.id],
  }),
  footer: one(documentFooters, {
    fields: [templateVersions.footerId],
    references: [documentFooters.id],
  }),
  sections: many(templateSections),
  tests: many(templateTests),
}));
