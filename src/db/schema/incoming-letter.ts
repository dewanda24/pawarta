import {
  pgTable,
  varchar,
  text,
  uuid,
  date,
  timestamp,
  integer,
  boolean,
  json,
} from 'drizzle-orm/pg-core';
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
import { users } from './iam';

// ==========================================
// 1. Agenda & Register Books
// ==========================================
export const agendaBooks = pgTable('agenda_books', {
  ...auditFields,
  namaBuku: varchar('nama_buku', { length: 255 }).notNull(), // e.g. "Buku Agenda Surat Masuk 2026"
  tahun: integer('tahun').notNull(),
  tipe: varchar('tipe', { length: 50 }).notNull(), // MASUK, KELUAR
  status: varchar('status', { length: 50 }).default('AKTIF').notNull(), // AKTIF, TUTUP
  keterangan: text('keterangan'),
});

export const registerBooks = pgTable('register_books', {
  ...auditFields,
  namaRegister: varchar('nama_register', { length: 255 }).notNull(), // e.g. "Register Disposisi 2026"
  tahun: integer('tahun').notNull(),
  tipe: varchar('tipe', { length: 50 }).notNull(), // MASUK, KELUAR, DISPOSISI
  status: varchar('status', { length: 50 }).default('AKTIF').notNull(), // AKTIF, TUTUP
  keterangan: text('keterangan'),
});

// ==========================================
// 2. Incoming Letters (Surat Masuk)
// ==========================================
export const incomingLetters = pgTable('incoming_letters', {
  ...auditFields,
  nomorAgenda: varchar('nomor_agenda', { length: 100 }), // Akan terisi jika sudah diregistrasi ke agenda
  nomorSurat: varchar('nomor_surat', { length: 100 }).notNull(),
  tanggalSurat: date('tanggal_surat').notNull(),
  tanggalDiterima: date('tanggal_diterima').notNull(),

  pengirim: varchar('pengirim', { length: 255 }).notNull(), // Nama orang pengirim
  instansiPengirimId: uuid('instansi_pengirim_id').references(() => masterInstansi.id, {
    onDelete: 'set null',
  }),

  perihal: text('perihal').notNull(),
  ringkasanIsi: text('ringkasan_isi'),

  jenisSuratId: uuid('jenis_surat_id')
    .references(() => masterJenisSurat.id, { onDelete: 'restrict' })
    .notNull(),
  klasifikasiId: uuid('klasifikasi_id')
    .references(() => masterKlasifikasiSurat.id, { onDelete: 'restrict' })
    .notNull(),
  prioritasId: uuid('prioritas_id')
    .references(() => masterPrioritas.id, { onDelete: 'restrict' })
    .notNull(),
  sifatSuratId: uuid('sifat_surat_id')
    .references(() => masterSifatSurat.id, { onDelete: 'restrict' })
    .notNull(),

  tujuanUnitId: uuid('tujuan_unit_id').references(() => masterUnitKerja.id, {
    onDelete: 'set null',
  }),
  penerimaId: uuid('penerima_id').references(() => masterPegawai.id, { onDelete: 'set null' }), // Pegawai yang menerima fisik surat

  status: varchar('status', { length: 50 }).default('DRAFT').notNull(), // DRAFT, REGISTERED, DISTRIBUTED, DISPOSITIONED, COMPLETED
  deadlineSla: timestamp('deadline_sla'), // Batas waktu penyelesaian sesuai Pasal 72 Perbup 9/2026
  catatan: text('catatan'),
  deletedAt: timestamp('deleted_at'),
});

// ==========================================
// 3. Attachments
// ==========================================
export const incomingLetterAttachments = pgTable('incoming_letter_attachments', {
  ...auditFields,
  suratId: uuid('surat_id')
    .notNull()
    .references(() => incomingLetters.id, { onDelete: 'cascade' }),
  namaFile: varchar('nama_file', { length: 255 }).notNull(),
  tipeMime: varchar('tipe_mime', { length: 100 }),
  ukuranBytes: integer('ukuran_bytes'),
  fileUrl: text('file_url').notNull(),
  deskripsi: text('deskripsi'),
  ocrText: text('ocr_text'), // OCR Ready (placeholder)
});

// ==========================================
// 4. Internal Distribution (Distribusi Internal)
// ==========================================
export const incomingDistributions = pgTable('incoming_distributions', {
  ...auditFields,
  suratId: uuid('surat_id')
    .notNull()
    .references(() => incomingLetters.id, { onDelete: 'cascade' }),
  pengirimId: uuid('pengirim_id')
    .references(() => users.id, { onDelete: 'restrict' })
    .notNull(), // User yang mendistribusikan
  tujuanUnitId: uuid('tujuan_unit_id').references(() => masterUnitKerja.id, {
    onDelete: 'set null',
  }),
  tujuanPegawaiId: uuid('tujuan_pegawai_id').references(() => masterPegawai.id, {
    onDelete: 'set null',
  }),
  catatan: text('catatan'),
  deadline: timestamp('deadline'),
  status: varchar('status', { length: 50 }).default('TERKIRIM').notNull(), // TERKIRIM, DIBACA, DITINDAKLANJUTI
});

// ==========================================
// 5. Initial Disposition (Disposisi Awal)
// ==========================================
export const incomingDispositions = pgTable('incoming_dispositions', {
  ...auditFields,
  suratId: uuid('surat_id')
    .notNull()
    .references(() => incomingLetters.id, { onDelete: 'cascade' }),
  pemberiDisposisiId: uuid('pemberi_disposisi_id')
    .references(() => users.id, { onDelete: 'restrict' })
    .notNull(),
  penerimaDisposisiId: uuid('penerima_disposisi_id')
    .references(() => users.id, { onDelete: 'restrict' })
    .notNull(),
  instruksi: text('instruksi').notNull(), // Instruksi disposisi
  catatan: text('catatan'),
  deadline: timestamp('deadline'),
  status: varchar('status', { length: 50 }).default('MENUNGGU').notNull(), // MENUNGGU, PROSES, SELESAI
});

// ==========================================
// 6. Incoming Agendas & Registers
// ==========================================
export const incomingAgendas = pgTable('incoming_agendas', {
  ...auditFields,
  bukuAgendaId: uuid('buku_agenda_id')
    .notNull()
    .references(() => agendaBooks.id, { onDelete: 'cascade' }),
  suratId: uuid('surat_id')
    .notNull()
    .references(() => incomingLetters.id, { onDelete: 'cascade' }),
  nomorUrut: integer('nomor_urut').notNull(),
  tanggalCatat: timestamp('tanggal_catat').defaultNow().notNull(),
});

export const incomingRegisters = pgTable('incoming_registers', {
  ...auditFields,
  bukuRegisterId: uuid('buku_register_id')
    .notNull()
    .references(() => registerBooks.id, { onDelete: 'cascade' }),
  suratId: uuid('surat_id')
    .notNull()
    .references(() => incomingLetters.id, { onDelete: 'cascade' }),
  nomorUrut: integer('nomor_urut').notNull(),
  tanggalCatat: timestamp('tanggal_catat').defaultNow().notNull(),
});

// ==========================================
// 7. Timelines
// ==========================================
export const incomingTimelines = pgTable('incoming_timelines', {
  id: uuid('id').defaultRandom().primaryKey(),
  suratId: uuid('surat_id')
    .notNull()
    .references(() => incomingLetters.id, { onDelete: 'cascade' }),
  aktorId: uuid('aktor_id').references(() => users.id, { onDelete: 'set null' }),
  aktivitas: varchar('aktivitas', { length: 100 }).notNull(), // Registrasi, Upload, Distribusi, Disposisi, Selesai
  deskripsi: text('deskripsi'),
  tanggal: timestamp('tanggal').defaultNow().notNull(),
});

// ==========================================
// 8. Logs (Audit Trail Khusus Surat Masuk)
// ==========================================
export const incomingLogs = pgTable('incoming_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  suratId: uuid('surat_id').references(() => incomingLetters.id, { onDelete: 'set null' }),
  aktorId: uuid('aktor_id').references(() => users.id, { onDelete: 'set null' }),
  aksi: varchar('aksi', { length: 50 }).notNull(), // CREATE, UPDATE, DELETE, UPLOAD
  keterangan: text('keterangan'),
  dataLama: json('data_lama'),
  dataBaru: json('data_baru'),
  tanggal: timestamp('tanggal').defaultNow().notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

// ==========================================
// RELATIONS
// ==========================================

export const agendaBooksRelations = relations(agendaBooks, ({ many }) => ({
  agendas: many(incomingAgendas),
}));

export const registerBooksRelations = relations(registerBooks, ({ many }) => ({
  registers: many(incomingRegisters),
}));

export const incomingLettersRelations = relations(incomingLetters, ({ one, many }) => ({
  instansiPengirim: one(masterInstansi, {
    fields: [incomingLetters.instansiPengirimId],
    references: [masterInstansi.id],
  }),
  jenisSurat: one(masterJenisSurat, {
    fields: [incomingLetters.jenisSuratId],
    references: [masterJenisSurat.id],
  }),
  klasifikasi: one(masterKlasifikasiSurat, {
    fields: [incomingLetters.klasifikasiId],
    references: [masterKlasifikasiSurat.id],
  }),
  prioritas: one(masterPrioritas, {
    fields: [incomingLetters.prioritasId],
    references: [masterPrioritas.id],
  }),
  sifatSurat: one(masterSifatSurat, {
    fields: [incomingLetters.sifatSuratId],
    references: [masterSifatSurat.id],
  }),
  tujuanUnit: one(masterUnitKerja, {
    fields: [incomingLetters.tujuanUnitId],
    references: [masterUnitKerja.id],
  }),
  penerima: one(masterPegawai, {
    fields: [incomingLetters.penerimaId],
    references: [masterPegawai.id],
  }),
  attachments: many(incomingLetterAttachments),
  distributions: many(incomingDistributions),
  dispositions: many(incomingDispositions),
  agendas: many(incomingAgendas),
  registers: many(incomingRegisters),
  timelines: many(incomingTimelines),
  logs: many(incomingLogs),
}));

export const incomingLetterAttachmentsRelations = relations(
  incomingLetterAttachments,
  ({ one }) => ({
    surat: one(incomingLetters, {
      fields: [incomingLetterAttachments.suratId],
      references: [incomingLetters.id],
    }),
  }),
);

export const incomingDistributionsRelations = relations(incomingDistributions, ({ one }) => ({
  surat: one(incomingLetters, {
    fields: [incomingDistributions.suratId],
    references: [incomingLetters.id],
  }),
  pengirim: one(users, {
    fields: [incomingDistributions.pengirimId],
    references: [users.id],
  }),
  tujuanUnit: one(masterUnitKerja, {
    fields: [incomingDistributions.tujuanUnitId],
    references: [masterUnitKerja.id],
  }),
  tujuanPegawai: one(masterPegawai, {
    fields: [incomingDistributions.tujuanPegawaiId],
    references: [masterPegawai.id],
  }),
}));

export const incomingDispositionsRelations = relations(incomingDispositions, ({ one }) => ({
  surat: one(incomingLetters, {
    fields: [incomingDispositions.suratId],
    references: [incomingLetters.id],
  }),
  pemberiDisposisi: one(users, {
    fields: [incomingDispositions.pemberiDisposisiId],
    references: [users.id],
  }),
  penerimaDisposisi: one(users, {
    fields: [incomingDispositions.penerimaDisposisiId],
    references: [users.id],
  }),
}));

export const incomingAgendasRelations = relations(incomingAgendas, ({ one }) => ({
  bukuAgenda: one(agendaBooks, {
    fields: [incomingAgendas.bukuAgendaId],
    references: [agendaBooks.id],
  }),
  surat: one(incomingLetters, {
    fields: [incomingAgendas.suratId],
    references: [incomingLetters.id],
  }),
}));

export const incomingRegistersRelations = relations(incomingRegisters, ({ one }) => ({
  bukuRegister: one(registerBooks, {
    fields: [incomingRegisters.bukuRegisterId],
    references: [registerBooks.id],
  }),
  surat: one(incomingLetters, {
    fields: [incomingRegisters.suratId],
    references: [incomingLetters.id],
  }),
}));

export const incomingTimelinesRelations = relations(incomingTimelines, ({ one }) => ({
  surat: one(incomingLetters, {
    fields: [incomingTimelines.suratId],
    references: [incomingLetters.id],
  }),
  aktor: one(users, {
    fields: [incomingTimelines.aktorId],
    references: [users.id],
  }),
}));

export const incomingLogsRelations = relations(incomingLogs, ({ one }) => ({
  surat: one(incomingLetters, {
    fields: [incomingLogs.suratId],
    references: [incomingLetters.id],
  }),
  aktor: one(users, {
    fields: [incomingLogs.aktorId],
    references: [users.id],
  }),
}));
