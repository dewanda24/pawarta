import { pgTable, varchar, text, uuid, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { auditFields } from './utils';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { users } from './iam';

// ==========================================
// 1. API Management
// ==========================================
export const apiKeys = pgTable('api_keys', {
  ...auditFields,
  nama: varchar('nama', { length: 255 }).notNull(),
  tokenHash: varchar('token_hash', { length: 255 }).notNull().unique(), // Hashed API token for security
  tokenPreview: varchar('token_preview', { length: 20 }).notNull(), // Like "sk_live_...a1b2"
  permissions: jsonb('permissions'), // Array of permissions e.g., ["read:letters", "write:archive"]
  expiresAt: timestamp('expires_at'),
  lastUsedAt: timestamp('last_used_at'),
  isAktif: boolean('is_aktif').default(true).notNull(),
});

export const apiLogs = pgTable('api_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  apiKeyId: uuid('api_key_id').references(() => apiKeys.id, { onDelete: 'set null' }),
  endpoint: varchar('endpoint', { length: 255 }).notNull(),
  method: varchar('method', { length: 10 }).notNull(),
  statusCode: varchar('status_code', { length: 10 }).notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  requestBody: jsonb('request_body'),
  responseBody: jsonb('response_body'),
  tanggal: timestamp('tanggal').defaultNow().notNull(),
});

// ==========================================
// 2. Webhook Engine
// ==========================================
export const webhooks = pgTable('webhooks', {
  ...auditFields,
  nama: varchar('nama', { length: 255 }).notNull(),
  url: varchar('url', { length: 500 }).notNull(),
  secret: varchar('secret', { length: 255 }), // Used for signing payload
  events: jsonb('events').notNull(), // Array e.g., ["letter.created", "signature.completed"]
  isAktif: boolean('is_aktif').default(true).notNull(),
});

export const webhookLogs = pgTable('webhook_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  webhookId: uuid('webhook_id').references(() => webhooks.id, { onDelete: 'cascade' }),
  event: varchar('event', { length: 100 }).notNull(),
  payload: jsonb('payload').notNull(),
  statusCode: varchar('status_code', { length: 10 }),
  responseBody: text('response_body'),
  status: varchar('status', { length: 50 }).notNull(), // SUCCESS, FAILED
  tanggal: timestamp('tanggal').defaultNow().notNull(),
});

// ==========================================
// 3. Automation Engine (Rule Engine)
// ==========================================
export const automationRules = pgTable('automation_rules', {
  ...auditFields,
  nama: varchar('nama', { length: 255 }).notNull(),
  deskripsi: text('deskripsi'),
  triggerEvent: varchar('trigger_event', { length: 100 }).notNull(), // e.g., "letter.incoming.created", "retention.expired"
  conditions: jsonb('conditions').notNull(), // Logical rules e.g., [{field: "prioritas", op: "eq", value: "Tinggi"}]
  actions: jsonb('actions').notNull(), // Execution steps e.g., [{type: "SEND_EMAIL", templateId: "...", to: "..."}]
  isAktif: boolean('is_aktif').default(true).notNull(),
});

export const automationLogs = pgTable('automation_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  ruleId: uuid('rule_id').references(() => automationRules.id, { onDelete: 'cascade' }),
  triggerEvent: varchar('trigger_event', { length: 100 }).notNull(),
  context: jsonb('context'), // Data that triggered the rule
  status: varchar('status', { length: 50 }).notNull(), // SUCCESS, FAILED
  errorMessage: text('error_message'),
  tanggal: timestamp('tanggal').defaultNow().notNull(),
});
