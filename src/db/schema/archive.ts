import { pgTable, varchar, text, uuid, date, timestamp, integer, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { auditFields } from './utils';
import { users } from './iam';
import { masterUnitKerja, masterPegawai } from './master';
import { incomingLetters } from './incoming-letter';
import { outgoingLetters } from './outgoing-letter';

// ==========================================
// 1. Kategori, Tag & Label Arsip
// ==========================================
export const archiveCategories = pgTable('archive_categories', {
  ...auditFields,
  nama: varchar('nama', { length: 255 }).notNull().unique(), // e.g., Surat Keputusan, Surat Edaran
  deskripsi: text('deskripsi'),
  isAktif: boolean('is_aktif').default(true).notNull(),
});

export const archiveTags = pgTable('archive_tags', {
  ...auditFields,
  nama: varchar('nama', { length: 100 }).notNull().unique(),
  warna: varchar('warna', { length: 20 }), // Hex color code
});

export const archiveLabels = pgTable('archive_labels', {
  ...auditFields,
  nama: varchar('nama', { length: 100 }).notNull().unique(),
  warna: varchar('warna', { length: 20 }),
});

// ==========================================
// 2. Arsip Digital Utama
// ==========================================
export const archives = pgTable('archives', {
  ...auditFields,
  
  // Tipe dokumen yang diarsipkan (Surat Masuk / Surat Keluar / Lainnya)
  entityType: varchar('entity_type', { length: 50 }).notNull(), // INCOMING, OUTGOING, OTHER
  incomingLetterId: uuid('incoming_letter_id').references(() => incomingLetters.id, { onDelete: 'set null' }),
  outgoingLetterId: uuid('outgoing_letter_id').references(() => outgoingLetters.id, { onDelete: 'set null' }),
  
  // Metadata Arsip
  kategoriId: uuid('kategori_id').references(() => archiveCategories.id, { onDelete: 'set null' }),
  nomorArsip: varchar('nomor_arsip', { length: 100 }).unique().notNull(), // Generate khusus arsip
  perihal: text('perihal').notNull(),
  tahun: integer('tahun').notNull(),
  lokasiFisik: varchar('lokasi_fisik', { length: 255 }), // Rak 1, Lemari A
  folderVirtual: varchar('folder_virtual', { length: 255 }), // Path e.g., /2026/SuratMasuk
  
  // Status dan Retensi
  status: varchar('status', { length: 50 }).default('AKTIF').notNull(), // AKTIF, DIPINJAM, MUSNAH, PERMANEN
  retentionPolicyId: uuid('retention_policy_id'), // Relasi dibuat nanti
  tanggalRetensiBerakhir: date('tanggal_retensi_berakhir'),
  statusRetensi: varchar('status_retensi', { length: 50 }).default('AKTIF').notNull(), // AKTIF, AKAN_BERAKHIR, HABIS, PERMANEN, MUSNAH
  
  // Custom Metadata
  metadata: jsonb('metadata'), // Format bebas berdasarkan kebutuhan instansi

  // FTS Index Column
  searchVector: text('search_vector'), // Untuk menyimpan TSVector
});

// Relasi Many-to-Many untuk Tag dan Label
export const archiveToTags = pgTable('archive_to_tags', {
  archiveId: uuid('archive_id').notNull().references(() => archives.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').notNull().references(() => archiveTags.id, { onDelete: 'cascade' }),
});

export const archiveToLabels = pgTable('archive_to_labels', {
  archiveId: uuid('archive_id').notNull().references(() => archives.id, { onDelete: 'cascade' }),
  labelId: uuid('label_id').notNull().references(() => archiveLabels.id, { onDelete: 'cascade' }),
});

// ==========================================
// 3. Kebijakan Retensi (JRA - Jadwal Retensi Arsip)
// ==========================================
export const retentionPolicies = pgTable('retention_policies', {
  ...auditFields,
  kode: varchar('kode', { length: 50 }).notNull().unique(),
  nama: varchar('nama', { length: 255 }).notNull(),
  masaAktifTahun: integer('masa_aktif_tahun').notNull(),
  masaInaktifTahun: integer('masa_inaktif_tahun').notNull(),
  tindakanAkhir: varchar('tindakan_akhir', { length: 50 }).notNull(), // MUSNAH, PERMANEN, DINILAI_KEMBALI
  keterangan: text('keterangan'),
  isAktif: boolean('is_aktif').default(true).notNull(),
});

// Melengkapi relasi di tabel arsip
// export const archivesWithRetention = ... (Sudah ada field retentionPolicyId di atas)

export const retentionLogs = pgTable('retention_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  archiveId: uuid('archive_id').notNull().references(() => archives.id, { onDelete: 'cascade' }),
  aksi: varchar('aksi', { length: 50 }).notNull(), // PERUBAHAN_STATUS, PEMUSNAHAN
  statusSebelumnya: varchar('status_sebelumnya', { length: 50 }),
  statusBaru: varchar('status_baru', { length: 50 }),
  catatan: text('catatan'),
  aktorId: uuid('aktor_id').references(() => users.id, { onDelete: 'set null' }),
  tanggal: timestamp('tanggal').defaultNow().notNull(),
});

// ==========================================
// 4. Peminjaman Arsip
// ==========================================
export const archiveBorrowings = pgTable('archive_borrowings', {
  ...auditFields,
  archiveId: uuid('archive_id').notNull().references(() => archives.id, { onDelete: 'cascade' }),
  peminjamId: uuid('peminjam_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  unitPeminjamId: uuid('unit_peminjam_id').references(() => masterUnitKerja.id, { onDelete: 'set null' }),
  tanggalPinjam: timestamp('tanggal_pinjam').defaultNow().notNull(),
  tanggalKembaliRencana: timestamp('tanggal_kembali_rencana').notNull(),
  tanggalKembaliAktual: timestamp('tanggal_kembali_aktual'),
  keperluan: text('keperluan').notNull(),
  status: varchar('status', { length: 50 }).default('MENUNGGU_PERSETUJUAN').notNull(), // MENUNGGU_PERSETUJUAN, DIPINJAM, DIKEMBALIKAN, TERLAMBAT, TOLAK
  catatanPenolakan: text('catatan_penolakan'),
});

// ==========================================
// 5. Histori & Riwayat Arsip
// ==========================================
export const archiveHistories = pgTable('archive_histories', {
  id: uuid('id').defaultRandom().primaryKey(),
  archiveId: uuid('archive_id').notNull().references(() => archives.id, { onDelete: 'cascade' }),
  aktorId: uuid('aktor_id').references(() => users.id, { onDelete: 'set null' }),
  aksi: varchar('aksi', { length: 100 }).notNull(), // DIBUAT, DIUPDATE, DIPINJAM, DIKEMBALIKAN, DIHANCURKAN
  deskripsi: text('deskripsi'),
  tanggal: timestamp('tanggal').defaultNow().notNull(),
});

// ==========================================
// 6. Verifikasi & Hash Engine (Digital Signature / Integritas)
// ==========================================
export const documentHashes = pgTable('document_hashes', {
  id: uuid('id').defaultRandom().primaryKey(),
  entityType: varchar('entity_type', { length: 50 }).notNull(), // INCOMING, OUTGOING, ARCHIVE
  entityId: uuid('entity_id').notNull(), // ID surat atau arsip
  hashSha256: varchar('hash_sha256', { length: 64 }).unique().notNull(),
  tanggalGenerate: timestamp('tanggal_generate').defaultNow().notNull(),
  generatorId: uuid('generator_id').references(() => users.id, { onDelete: 'set null' }),
  versiDokumen: varchar('versi_dokumen', { length: 50 }),
});

export const documentVerifications = pgTable('document_verifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  hashId: uuid('hash_id').notNull().references(() => documentHashes.id, { onDelete: 'cascade' }),
  tanggalVerifikasi: timestamp('tanggal_verifikasi').defaultNow().notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  statusValidasi: boolean('status_validasi').notNull(),
});

// ==========================================
// 7. Favorit dan Dokumen Terakhir Dibaca
// ==========================================
export const documentFavorites = pgTable('document_favorites', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  archiveId: uuid('archive_id').notNull().references(() => archives.id, { onDelete: 'cascade' }),
  tanggalDitambahkan: timestamp('tanggal_ditambahkan').defaultNow().notNull(),
});

export const documentRecents = pgTable('document_recents', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  archiveId: uuid('archive_id').notNull().references(() => archives.id, { onDelete: 'cascade' }),
  tanggalAkses: timestamp('tanggal_akses').defaultNow().notNull(),
});

// ==========================================
// RELATIONS
// ==========================================

export const archivesRelations = relations(archives, ({ one, many }) => ({
  incomingLetter: one(incomingLetters, {
    fields: [archives.incomingLetterId],
    references: [incomingLetters.id],
  }),
  outgoingLetter: one(outgoingLetters, {
    fields: [archives.outgoingLetterId],
    references: [outgoingLetters.id],
  }),
  kategori: one(archiveCategories, {
    fields: [archives.kategoriId],
    references: [archiveCategories.id],
  }),
  retentionPolicy: one(retentionPolicies, {
    fields: [archives.retentionPolicyId],
    references: [retentionPolicies.id],
  }),
  tags: many(archiveToTags),
  labels: many(archiveToLabels),
  borrowings: many(archiveBorrowings),
  histories: many(archiveHistories),
  retentionLogs: many(retentionLogs),
}));

export const retentionPoliciesRelations = relations(retentionPolicies, ({ many }) => ({
  archives: many(archives),
}));

export const archiveBorrowingsRelations = relations(archiveBorrowings, ({ one }) => ({
  archive: one(archives, {
    fields: [archiveBorrowings.archiveId],
    references: [archives.id],
  }),
  peminjam: one(users, {
    fields: [archiveBorrowings.peminjamId],
    references: [users.id],
  }),
  unitPeminjam: one(masterUnitKerja, {
    fields: [archiveBorrowings.unitPeminjamId],
    references: [masterUnitKerja.id],
  }),
}));

export const documentHashesRelations = relations(documentHashes, ({ one, many }) => ({
  generator: one(users, {
    fields: [documentHashes.generatorId],
    references: [users.id],
  }),
  verifications: many(documentVerifications),
}));

export const documentVerificationsRelations = relations(documentVerifications, ({ one }) => ({
  hash: one(documentHashes, {
    fields: [documentVerifications.hashId],
    references: [documentHashes.id],
  }),
}));
