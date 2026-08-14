// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { auditFields } from './utils';
import { masterPegawai } from './master';

// ==========================================
// 1. Users & Auth (Extended for Auth.js & RBAC)
// ==========================================
export const users = pgTable('users', {
  nama: varchar('nama', { length: 255 }).notNull(),
  username: varchar('username', { length: 100 }).unique().notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  pegawaiId: uuid('pegawai_id').references(() => masterPegawai.id),
  status: varchar('status', { length: 50 }).default('Aktif').notNull(), // Aktif, Nonaktif, Locked
  avatar: text('avatar'),
  lastLogin: timestamp('last_login', { mode: 'date' }),
  ...auditFields,
});

export const sessions = pgTable('sessions', {
  sessionToken: varchar('session_token', { length: 255 }).unique().notNull(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  ...auditFields,
});

export const passwordResets = pgTable('password_resets', {
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 255 }).unique().notNull(),
  expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
  usedAt: timestamp('used_at', { mode: 'date' }),
  ...auditFields,
});

export const loginLogs = pgTable('login_logs', {
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  aktivitas: varchar('aktivitas', { length: 100 }).notNull(), // Login, Logout, Failed Login, Lock, Unlock
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  status: varchar('status', { length: 50 }), // Success, Failed
  keterangan: text('keterangan'),
  ...auditFields,
});

// ==========================================
// 2. Roles & Permissions (RBAC)
// ==========================================
export const roles = pgTable('roles', {
  namaRole: varchar('nama_role', { length: 100 }).unique().notNull(),
  deskripsi: text('deskripsi'),
  warnaBadge: varchar('warna_badge', { length: 50 }),
  urutan: integer('urutan').default(0),
  isAktif: boolean('is_aktif').default(true).notNull(),
  ...auditFields,
});

export const permissions = pgTable('permissions', {
  nama: varchar('nama', { length: 100 }).unique().notNull(), // e.g., master.read, letters.create
  deskripsi: text('deskripsi'),
  modul: varchar('modul', { length: 100 }).notNull(), // Grouping e.g., Master Data, Surat Masuk
  ...auditFields,
});

export const rolePermissions = pgTable('role_permissions', {
  roleId: uuid('role_id')
    .notNull()
    .references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: uuid('permission_id')
    .notNull()
    .references(() => permissions.id, { onDelete: 'cascade' }),
  ...auditFields,
});

export const userRoles = pgTable('user_roles', {
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  roleId: uuid('role_id')
    .notNull()
    .references(() => roles.id, { onDelete: 'cascade' }),
  ...auditFields,
});

// ==========================================
// 3. Dynamic Menus
// ==========================================
export const menus = pgTable('menus', {
  nama: varchar('nama', { length: 100 }).notNull(),
  icon: varchar('icon', { length: 50 }),
  route: varchar('route', { length: 255 }),
  parentId: uuid('parent_id'), // Self-referencing FK
  urutan: integer('urutan').default(0),
  permissionId: uuid('permission_id').references(() => permissions.id, { onDelete: 'set null' }),
  isAktif: boolean('is_aktif').default(true).notNull(),
  ...auditFields,
});

// ==========================================
// 4. Relations
// ==========================================

export const usersRelations = relations(users, ({ one, many }) => ({
  pegawai: one(masterPegawai, {
    fields: [users.pegawaiId],
    references: [masterPegawai.id],
  }),
  userRoles: many(userRoles),
  sessions: many(sessions),
  loginLogs: many(loginLogs),
  passwordResets: many(passwordResets),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
  rolePermissions: many(rolePermissions),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
  menus: many(menus),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));

export const menusRelations = relations(menus, ({ one, many }) => ({
  parent: one(menus, {
    fields: [menus.parentId],
    references: [menus.id],
    relationName: 'menuParent',
  }),
  children: many(menus, {
    relationName: 'menuParent',
  }),
  permission: one(permissions, {
    fields: [menus.permissionId],
    references: [permissions.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const loginLogsRelations = relations(loginLogs, ({ one }) => ({
  user: one(users, {
    fields: [loginLogs.userId],
    references: [users.id],
  }),
}));

export const passwordResetsRelations = relations(passwordResets, ({ one }) => ({
  user: one(users, {
    fields: [passwordResets.userId],
    references: [users.id],
  }),
}));
