import { pgTable, varchar, uuid, boolean, integer, json, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { auditFields } from './utils';
import { users } from './iam';

// ==========================================
// 1. Workflow Steps (Master Konfigurasi Urutan)
// ==========================================
export const workflowSteps = pgTable('workflow_steps', {
  namaStep: varchar('nama_step', { length: 100 }).notNull(), // Draft, Review, Approved, dsb
  kodeStatus: varchar('kode_status', { length: 50 }).unique().notNull(), // DRAFT, REVIEW, APPROVED, NUMBERED, SIGNED, PUBLISHED, DISTRIBUTED, COMPLETED, ARCHIVED
  urutan: integer('urutan').notNull(),
  isAktif: boolean('is_aktif').default(true).notNull(),
  ...auditFields,
});

// ==========================================
// 2. Workflow Instances (Status Surat Saat Ini)
// ==========================================
export const workflowInstances = pgTable('workflow_instances', {
  entityType: varchar('entity_type', { length: 50 }).notNull().default('SURAT_KELUAR'), // Ke depan bisa untuk surat masuk
  entityId: uuid('entity_id').notNull(), // Referensi ke ID surat
  currentStepId: uuid('current_step_id').references(() => workflowSteps.id, { onDelete: 'restrict' }).notNull(),
  assignedUserId: uuid('assigned_user_id').references(() => users.id, { onDelete: 'set null' }), // Siapa yang sedang memegang bola?
  statusKondisi: varchar('status_kondisi', { length: 50 }).notNull().default('PENDING'), // PENDING, REJECTED, RETURNED, dll
  ...auditFields,
});

// ==========================================
// 3. Workflow Histories (Log Perjalanan Surat)
// ==========================================
export const workflowHistories = pgTable('workflow_histories', {
  instanceId: uuid('instance_id')
    .notNull()
    .references(() => workflowInstances.id, { onDelete: 'cascade' }),
  fromStepId: uuid('from_step_id').references(() => workflowSteps.id, { onDelete: 'set null' }),
  toStepId: uuid('to_step_id').references(() => workflowSteps.id, { onDelete: 'set null' }),
  actorId: uuid('actor_id').references(() => users.id, { onDelete: 'set null' }).notNull(),
  action: varchar('action', { length: 100 }).notNull(), // SUBMIT, APPROVE, REJECT, REVISE
  catatan: text('catatan'),
  ...auditFields,
});

// ==========================================
// RELATIONS
// ==========================================
export const workflowStepsRelations = relations(workflowSteps, ({ many }) => ({
  instances: many(workflowInstances),
}));

export const workflowInstancesRelations = relations(workflowInstances, ({ one, many }) => ({
  currentStep: one(workflowSteps, {
    fields: [workflowInstances.currentStepId],
    references: [workflowSteps.id],
  }),
  assignee: one(users, {
    fields: [workflowInstances.assignedUserId],
    references: [users.id],
  }),
  histories: many(workflowHistories),
}));

export const workflowHistoriesRelations = relations(workflowHistories, ({ one }) => ({
  instance: one(workflowInstances, {
    fields: [workflowHistories.instanceId],
    references: [workflowInstances.id],
  }),
  fromStep: one(workflowSteps, {
    fields: [workflowHistories.fromStepId],
    references: [workflowSteps.id],
  }),
  toStep: one(workflowSteps, {
    fields: [workflowHistories.toStepId],
    references: [workflowSteps.id],
  }),
  actor: one(users, {
    fields: [workflowHistories.actorId],
    references: [users.id],
  }),
}));
