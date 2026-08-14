import { pgTable, varchar, text, boolean, integer, json, timestamp, uuid } from 'drizzle-orm/pg-core';
import { auditFields } from './utils';
import { users, menus, permissions } from './iam';

// ==========================================
// 1. User Preferences
// ==========================================
export const userPreferences = pgTable('user_preferences', {
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  tema: varchar('tema', { length: 20 }).default('system').notNull(), // light, dark, system
  sidebarCollapsed: boolean('sidebar_collapsed').default(false).notNull(),
  bahasa: varchar('bahasa', { length: 10 }).default('id').notNull(), // id, en
  ...auditFields,
});

// ==========================================
// 2. Favorite & Recent Menu
// ==========================================
export const favoriteMenu = pgTable('favorite_menu', {
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  menuId: uuid('menu_id')
    .notNull()
    .references(() => menus.id, { onDelete: 'cascade' }),
  ...auditFields,
});

export const recentMenu = pgTable('recent_menu', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  menuId: uuid('menu_id')
    .notNull()
    .references(() => menus.id, { onDelete: 'cascade' }),
  lastAccessed: timestamp('last_accessed').defaultNow().notNull(),
});

// ==========================================
// 3. Activity Timeline & Logs
// ==========================================
export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'set null' }),
  aksi: varchar('aksi', { length: 50 }).notNull(), // Create, Update, Delete, Login, Approve, dll
  modul: varchar('modul', { length: 100 }).notNull(), // Nama modul terkait e.g., Surat Masuk
  detailAktivitas: text('detail_aktivitas').notNull(), // Deskripsi lengkap
  ipAddress: varchar('ip_address', { length: 45 }),
  metadata: json('metadata'), // Menyimpan detail tambahan e.g., ID data yang diubah
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// 4. Notification Center
// ==========================================
export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  judul: varchar('judul', { length: 255 }).notNull(),
  pesan: text('pesan').notNull(),
  tipe: varchar('tipe', { length: 20 }).default('Info').notNull(), // Info, Success, Warning, Error, System
  isRead: boolean('is_read').default(false).notNull(),
  linkUrl: varchar('link_url', { length: 500 }), // Link jika notifikasi diklik
  kategori: varchar('kategori', { length: 100 }), // e.g., Disposisi, Approval
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// 5. Dashboard Widgets System
// ==========================================
export const dashboardWidgets = pgTable('dashboard_widgets', {
  nama: varchar('nama', { length: 100 }).notNull(),
  deskripsi: text('deskripsi'),
  icon: varchar('icon', { length: 50 }),
  komponen: varchar('komponen', { length: 100 }).notNull(), // Identifier component react e.g., "WidgetStatistik"
  permissionId: uuid('permission_id') // Jika null, berarti semua role bisa pakai
    .references(() => permissions.id, { onDelete: 'set null' }),
  defaultColSpan: integer('default_col_span').default(1).notNull(),
  defaultRowSpan: integer('default_row_span').default(1).notNull(),
  isAktif: boolean('is_aktif').default(true).notNull(),
  ...auditFields,
});

export const userDashboard = pgTable('user_dashboard', {
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  widgetId: uuid('widget_id')
    .notNull()
    .references(() => dashboardWidgets.id, { onDelete: 'cascade' }),
  posisi: integer('posisi').notNull(), // Urutan urutan widget
  colSpan: integer('col_span').notNull(),
  rowSpan: integer('row_span').notNull(),
  isHidden: boolean('is_hidden').default(false).notNull(),
  ...auditFields,
});
