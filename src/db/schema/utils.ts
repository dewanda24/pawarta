import { timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const auditFields = {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
  createdBy: varchar('created_by', { length: 255 }).default('system').notNull(),
  updatedBy: varchar('updated_by', { length: 255 }).default('system').notNull(),
};
