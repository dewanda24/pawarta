import { pgTable, varchar, text, uuid, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { auditFields } from './utils';
import { users } from './iam';

// ==========================================
// 1. Email Service & Notifications
// ==========================================
export const emailTemplates = pgTable('email_templates', {
  ...auditFields,
  kode: varchar('kode', { length: 100 }).notNull().unique(), // e.g., "SURAT_BARU", "DISPOSISI"
  nama: varchar('nama', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 255 }).notNull(),
  htmlBody: text('html_body').notNull(), // Supports handlebars/mustache syntax
  isAktif: boolean('is_aktif').default(true).notNull(),
});

export const emailLogs = pgTable('email_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  templateId: uuid('template_id').references(() => emailTemplates.id, { onDelete: 'set null' }),
  penerima: varchar('penerima', { length: 255 }).notNull(), // Email address
  subject: varchar('subject', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull(), // SUCCESS, FAILED
  errorMessage: text('error_message'),
  tanggal: timestamp('tanggal').defaultNow().notNull(),
});

// ==========================================
// 2. Backup & Restore
// ==========================================
export const systemBackups = pgTable('system_backups', {
  id: uuid('id').defaultRandom().primaryKey(),
  tipe: varchar('tipe', { length: 50 }).notNull(), // DATABASE, DOCUMENT, FULL
  filename: varchar('filename', { length: 255 }).notNull(),
  path: varchar('path', { length: 500 }).notNull(),
  sizeBytes: varchar('size_bytes', { length: 50 }),
  status: varchar('status', { length: 50 }).notNull(), // SUCCESS, FAILED, IN_PROGRESS
  aktorId: uuid('aktor_id').references(() => users.id, { onDelete: 'set null' }),
  tanggalMulai: timestamp('tanggal_mulai').defaultNow().notNull(),
  tanggalSelesai: timestamp('tanggal_selesai'),
  errorMessage: text('error_message'),
});

// ==========================================
// 3. System Health
// ==========================================
export const systemHealthLogs = pgTable('system_health_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  komponen: varchar('komponen', { length: 100 }).notNull(), // DATABASE, STORAGE, QUEUE, EMAIL
  status: varchar('status', { length: 50 }).notNull(), // HEALTHY, DEGRADED, DOWN
  metrics: jsonb('metrics'), // CPU, RAM, Latency dll
  errorMessage: text('error_message'),
  tanggal: timestamp('tanggal').defaultNow().notNull(),
});

// ==========================================
// 4. File Storage Manager
// ==========================================
export const storageFiles = pgTable('storage_files', {
  id: uuid('id').defaultRandom().primaryKey(),
  kategori: varchar('kategori', { length: 50 }).notNull(), // DOKUMEN, LAMPIRAN, LOGO, TTD, PARAF
  originalName: varchar('original_name', { length: 255 }).notNull(),
  path: varchar('path', { length: 500 }).notNull(), // Relative path or Cloud URI
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  sizeBytes: varchar('size_bytes', { length: 50 }).notNull(),
  hashSha256: varchar('hash_sha256', { length: 64 }), // For integrity check
  uploadedBy: uuid('uploaded_by').references(() => users.id, { onDelete: 'set null' }),
  tanggalUpload: timestamp('tanggal_upload').defaultNow().notNull(),
});
