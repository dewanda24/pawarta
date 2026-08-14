import { pgTable, varchar, text, uuid, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { users } from './iam';
import { outgoingLetters } from './outgoing-letter';

// ==========================================
// 1. Digital Signature Engine
// ==========================================
export const digitalSignatures = pgTable('digital_signatures', {
  id: uuid('id').defaultRandom().primaryKey(),
  entityType: varchar('entity_type', { length: 50 }).notNull(), // OUTGOING, INTERNAL
  outgoingLetterId: uuid('outgoing_letter_id').references(() => outgoingLetters.id, { onDelete: 'cascade' }),
  provider: varchar('provider', { length: 50 }).default('LOCAL').notNull(), // LOCAL, BSRE
  
  // Konfigurasi Penandatanganan
  tipe: varchar('tipe', { length: 50 }).default('SEQUENTIAL').notNull(), // SEQUENTIAL, PARALLEL
  
  status: varchar('status', { length: 50 }).default('DRAFT').notNull(), // DRAFT, WAITING, PARTIAL, SIGNED, VERIFIED, REVOKED
  
  // Payload spesifik provider TTE
  providerPayload: jsonb('provider_payload'),
  
  tanggalRequest: timestamp('tanggal_request').defaultNow().notNull(),
  tanggalSelesai: timestamp('tanggal_selesai'),
});

export const signatureSigners = pgTable('signature_signers', {
  id: uuid('id').defaultRandom().primaryKey(),
  signatureId: uuid('signature_id').notNull().references(() => digitalSignatures.id, { onDelete: 'cascade' }),
  signerId: uuid('signer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  urutan: integer('urutan').default(1).notNull(), // Untuk sequential
  posisiVisual: jsonb('posisi_visual'), // x, y, page, width, height (untuk stamp visual)
  status: varchar('status', { length: 50 }).default('WAITING').notNull(), // WAITING, SIGNED, REJECTED
  tanggalTtd: timestamp('tanggal_ttd'),
  catatanPenolakan: text('catatan_penolakan'),
});

import { integer } from 'drizzle-orm/pg-core';

export const signatureHistories = pgTable('signature_histories', {
  id: uuid('id').defaultRandom().primaryKey(),
  signatureId: uuid('signature_id').notNull().references(() => digitalSignatures.id, { onDelete: 'cascade' }),
  aktorId: uuid('aktor_id').references(() => users.id, { onDelete: 'set null' }),
  aksi: varchar('aksi', { length: 50 }).notNull(), // DRAFT_CREATED, SENT, SIGNED, VERIFIED
  deskripsi: text('deskripsi'),
  tanggal: timestamp('tanggal').defaultNow().notNull(),
});
