

-- ==========================================
-- FILE: 0000_fine_nova.sql
-- ==========================================
CREATE TABLE "konfigurasi_sistem" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	"prefix_nomor_surat" varchar(100),
	"format_nomor" varchar(255),
	"tahun_aktif" varchar(10),
	"bahasa" varchar(50) DEFAULT 'id-ID',
	"zona_waktu" varchar(50) DEFAULT 'Asia/Jakarta',
	"format_tanggal" varchar(50) DEFAULT 'DD MMMM YYYY',
	"format_pdf" varchar(50) DEFAULT 'A4',
	"margin_cetak" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "mapping_jenis_klasifikasi" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	"jenis_surat_id" uuid NOT NULL,
	"klasifikasi_surat_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "master_instansi" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	"nama" varchar(255) NOT NULL,
	"jenis" varchar(100),
	"alamat" text,
	"kota" varchar(100),
	"email" varchar(100),
	"telepon" varchar(50),
	"website" varchar(100),
	"is_aktif" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "master_jabatan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	"nama" varchar(255) NOT NULL,
	"is_aktif" boolean DEFAULT true NOT NULL,
	CONSTRAINT "master_jabatan_nama_unique" UNIQUE("nama")
);
--> statement-breakpoint
CREATE TABLE "master_jenis_surat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	"kode" varchar(50) NOT NULL,
	"nama" varchar(255) NOT NULL,
	"deskripsi" text,
	"is_aktif" boolean DEFAULT true NOT NULL,
	CONSTRAINT "master_jenis_surat_kode_unique" UNIQUE("kode")
);
--> statement-breakpoint
CREATE TABLE "master_klasifikasi_surat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	"kode" varchar(50) NOT NULL,
	"nama" varchar(255) NOT NULL,
	"deskripsi" text,
	"level" integer DEFAULT 1 NOT NULL,
	"parent_id" uuid,
	"is_aktif" boolean DEFAULT true NOT NULL,
	CONSTRAINT "master_klasifikasi_surat_kode_unique" UNIQUE("kode")
);
--> statement-breakpoint
CREATE TABLE "master_pegawai" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	"nama" varchar(255) NOT NULL,
	"nip" varchar(50),
	"nik" varchar(50),
	"email" varchar(100),
	"no_hp" varchar(50),
	"unit_kerja_id" uuid,
	"jabatan_id" uuid,
	"status_asn" varchar(50),
	"is_aktif" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "master_penandatangan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	"pegawai_id" uuid NOT NULL,
	"jabatan_id" uuid NOT NULL,
	"nip_label" varchar(50),
	"ttd_digital_url" text,
	"paraf_url" text,
	"masa_berlaku_mulai" varchar(50),
	"masa_berlaku_selesai" varchar(50),
	"is_aktif" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "master_placeholder" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	"key" varchar(100) NOT NULL,
	"nama" varchar(100) NOT NULL,
	"deskripsi" text,
	"sumber_data" varchar(100),
	"is_aktif" boolean DEFAULT true NOT NULL,
	CONSTRAINT "master_placeholder_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "master_prioritas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	"nama" varchar(100) NOT NULL,
	"is_aktif" boolean DEFAULT true NOT NULL,
	CONSTRAINT "master_prioritas_nama_unique" UNIQUE("nama")
);
--> statement-breakpoint
CREATE TABLE "master_sekolah" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	"nama" varchar(255) NOT NULL,
	"npsn" varchar(50),
	"nss" varchar(50),
	"jenjang" varchar(50),
	"status" varchar(50),
	"alamat" text,
	"desa" varchar(100),
	"kecamatan" varchar(100),
	"kabupaten" varchar(100),
	"provinsi" varchar(100),
	"kode_pos" varchar(20),
	"email" varchar(100),
	"website" varchar(100),
	"telepon" varchar(50),
	"logo" text,
	"kepala_sekolah_id" uuid,
	"is_aktif" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "master_sifat_surat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	"nama" varchar(100) NOT NULL,
	"is_aktif" boolean DEFAULT true NOT NULL,
	CONSTRAINT "master_sifat_surat_nama_unique" UNIQUE("nama")
);
--> statement-breakpoint
CREATE TABLE "master_unit_kerja" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	"kode" varchar(50) NOT NULL,
	"nama" varchar(255) NOT NULL,
	"deskripsi" text,
	"is_aktif" boolean DEFAULT true NOT NULL,
	CONSTRAINT "master_unit_kerja_kode_unique" UNIQUE("kode")
);
--> statement-breakpoint
ALTER TABLE "mapping_jenis_klasifikasi" ADD CONSTRAINT "mapping_jenis_klasifikasi_jenis_surat_id_master_jenis_surat_id_fk" FOREIGN KEY ("jenis_surat_id") REFERENCES "public"."master_jenis_surat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mapping_jenis_klasifikasi" ADD CONSTRAINT "mapping_jenis_klasifikasi_klasifikasi_surat_id_master_klasifikasi_surat_id_fk" FOREIGN KEY ("klasifikasi_surat_id") REFERENCES "public"."master_klasifikasi_surat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "master_pegawai" ADD CONSTRAINT "master_pegawai_unit_kerja_id_master_unit_kerja_id_fk" FOREIGN KEY ("unit_kerja_id") REFERENCES "public"."master_unit_kerja"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "master_pegawai" ADD CONSTRAINT "master_pegawai_jabatan_id_master_jabatan_id_fk" FOREIGN KEY ("jabatan_id") REFERENCES "public"."master_jabatan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "master_penandatangan" ADD CONSTRAINT "master_penandatangan_pegawai_id_master_pegawai_id_fk" FOREIGN KEY ("pegawai_id") REFERENCES "public"."master_pegawai"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "master_penandatangan" ADD CONSTRAINT "master_penandatangan_jabatan_id_master_jabatan_id_fk" FOREIGN KEY ("jabatan_id") REFERENCES "public"."master_jabatan"("id") ON DELETE no action ON UPDATE no action;

-- ==========================================
-- FILE: 0001_slippery_brood.sql
-- ==========================================
CREATE TABLE "login_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"aktivitas" varchar(100) NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"status" varchar(50),
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menus" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama" varchar(100) NOT NULL,
	"icon" varchar(50),
	"route" varchar(255),
	"parent_id" uuid,
	"urutan" integer DEFAULT 0,
	"permission_id" uuid,
	"is_aktif" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_resets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	CONSTRAINT "password_resets_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama" varchar(100) NOT NULL,
	"deskripsi" text,
	"modul" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	CONSTRAINT "permissions_nama_unique" UNIQUE("nama")
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama_role" varchar(100) NOT NULL,
	"deskripsi" text,
	"warna_badge" varchar(50),
	"urutan" integer DEFAULT 0,
	"is_aktif" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	CONSTRAINT "roles_nama_role_unique" UNIQUE("nama_role")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_token" varchar(255) NOT NULL,
	"user_id" uuid NOT NULL,
	"expires" timestamp NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	CONSTRAINT "sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	CONSTRAINT "user_roles_user_id_role_id_pk" PRIMARY KEY("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama" varchar(255) NOT NULL,
	"username" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"pegawai_id" uuid,
	"status" varchar(50) DEFAULT 'Aktif' NOT NULL,
	"avatar" text,
	"last_login" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "login_logs" ADD CONSTRAINT "login_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menus" ADD CONSTRAINT "menus_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_pegawai_id_master_pegawai_id_fk" FOREIGN KEY ("pegawai_id") REFERENCES "public"."master_pegawai"("id") ON DELETE no action ON UPDATE no action;

-- ==========================================
-- FILE: 0002_heavy_stature.sql
-- ==========================================
CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"aksi" varchar(50) NOT NULL,
	"modul" varchar(100) NOT NULL,
	"detail_aktivitas" text NOT NULL,
	"ip_address" varchar(45),
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dashboard_widgets" (
	"nama" varchar(100) NOT NULL,
	"deskripsi" text,
	"icon" varchar(50),
	"komponen" varchar(100) NOT NULL,
	"permission_id" uuid,
	"default_col_span" integer DEFAULT 1 NOT NULL,
	"default_row_span" integer DEFAULT 1 NOT NULL,
	"is_aktif" boolean DEFAULT true NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorite_menu" (
	"user_id" uuid NOT NULL,
	"menu_id" uuid NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"judul" varchar(255) NOT NULL,
	"pesan" text NOT NULL,
	"tipe" varchar(20) DEFAULT 'Info' NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"link_url" varchar(500),
	"kategori" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recent_menu" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"menu_id" uuid NOT NULL,
	"last_accessed" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_dashboard" (
	"user_id" uuid NOT NULL,
	"widget_id" uuid NOT NULL,
	"posisi" integer NOT NULL,
	"col_span" integer NOT NULL,
	"row_span" integer NOT NULL,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"user_id" uuid NOT NULL,
	"tema" varchar(20) DEFAULT 'system' NOT NULL,
	"sidebar_collapsed" boolean DEFAULT false NOT NULL,
	"bahasa" varchar(10) DEFAULT 'id' NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	CONSTRAINT "user_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "document_footers" (
	"nama_footer" varchar(255) NOT NULL,
	"layout" varchar(50) DEFAULT '1_kolom' NOT NULL,
	"konfigurasi_ttd" json NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_aktif" boolean DEFAULT true NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_headers" (
	"nama_kop" varchar(255) NOT NULL,
	"logo_url" text,
	"instansi_utama" varchar(255),
	"nama_sekolah" varchar(255),
	"alamat" text,
	"kontak" varchar(255),
	"website" varchar(100),
	"tipe_garis" varchar(50) DEFAULT 'single_thick',
	"is_default" boolean DEFAULT false NOT NULL,
	"is_aktif" boolean DEFAULT true NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_templates" (
	"kode" varchar(50) NOT NULL,
	"nama" varchar(255) NOT NULL,
	"kategori_id" uuid,
	"jenis_surat_id" uuid NOT NULL,
	"deskripsi" text,
	"versi_aktif_id" uuid,
	"is_aktif" boolean DEFAULT true NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	CONSTRAINT "document_templates_kode_unique" UNIQUE("kode")
);
--> statement-breakpoint
CREATE TABLE "generated_documents" (
	"template_version_id" uuid,
	"nama_file" varchar(255) NOT NULL,
	"tipe_export" varchar(20) NOT NULL,
	"data_placeholder" json,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "template_categories" (
	"nama" varchar(100) NOT NULL,
	"deskripsi" text,
	"is_aktif" boolean DEFAULT true NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	CONSTRAINT "template_categories_nama_unique" UNIQUE("nama")
);
--> statement-breakpoint
CREATE TABLE "template_sections" (
	"version_id" uuid NOT NULL,
	"tipe_section" varchar(50) NOT NULL,
	"urutan" integer DEFAULT 1 NOT NULL,
	"konten" text,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "template_tests" (
	"template_version_id" uuid NOT NULL,
	"hasil_render" text,
	"error_log" text,
	"is_sukses" boolean NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "template_versions" (
	"template_id" uuid NOT NULL,
	"nomor_versi" varchar(20) NOT NULL,
	"konten_html" text NOT NULL,
	"header_id" uuid,
	"footer_id" uuid,
	"pengaturan_kertas" json NOT NULL,
	"status" varchar(20) DEFAULT 'Draft' NOT NULL,
	"catatan_perubahan" text,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_role_id_permission_id_pk";--> statement-breakpoint
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_user_id_role_id_pk";--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboard_widgets" ADD CONSTRAINT "dashboard_widgets_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_menu" ADD CONSTRAINT "favorite_menu_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_menu" ADD CONSTRAINT "favorite_menu_menu_id_menus_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."menus"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recent_menu" ADD CONSTRAINT "recent_menu_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recent_menu" ADD CONSTRAINT "recent_menu_menu_id_menus_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."menus"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_dashboard" ADD CONSTRAINT "user_dashboard_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_dashboard" ADD CONSTRAINT "user_dashboard_widget_id_dashboard_widgets_id_fk" FOREIGN KEY ("widget_id") REFERENCES "public"."dashboard_widgets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_templates" ADD CONSTRAINT "document_templates_kategori_id_template_categories_id_fk" FOREIGN KEY ("kategori_id") REFERENCES "public"."template_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_templates" ADD CONSTRAINT "document_templates_jenis_surat_id_master_jenis_surat_id_fk" FOREIGN KEY ("jenis_surat_id") REFERENCES "public"."master_jenis_surat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_documents" ADD CONSTRAINT "generated_documents_template_version_id_template_versions_id_fk" FOREIGN KEY ("template_version_id") REFERENCES "public"."template_versions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_sections" ADD CONSTRAINT "template_sections_version_id_template_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."template_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_tests" ADD CONSTRAINT "template_tests_template_version_id_template_versions_id_fk" FOREIGN KEY ("template_version_id") REFERENCES "public"."template_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_versions" ADD CONSTRAINT "template_versions_template_id_document_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."document_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_versions" ADD CONSTRAINT "template_versions_header_id_document_headers_id_fk" FOREIGN KEY ("header_id") REFERENCES "public"."document_headers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_versions" ADD CONSTRAINT "template_versions_footer_id_document_footers_id_fk" FOREIGN KEY ("footer_id") REFERENCES "public"."document_footers"("id") ON DELETE set null ON UPDATE no action;

-- ==========================================
-- FILE: 0003_reflective_professor_monster.sql
-- ==========================================
CREATE TABLE "workflow_histories" (
	"instance_id" uuid NOT NULL,
	"from_step_id" uuid,
	"to_step_id" uuid,
	"actor_id" uuid NOT NULL,
	"action" varchar(100) NOT NULL,
	"catatan" text,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_instances" (
	"entity_type" varchar(50) DEFAULT 'SURAT_KELUAR' NOT NULL,
	"entity_id" uuid NOT NULL,
	"current_step_id" uuid NOT NULL,
	"assigned_user_id" uuid,
	"status_kondisi" varchar(50) DEFAULT 'PENDING' NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_steps" (
	"nama_step" varchar(100) NOT NULL,
	"kode_status" varchar(50) NOT NULL,
	"urutan" integer NOT NULL,
	"is_aktif" boolean DEFAULT true NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	CONSTRAINT "workflow_steps_kode_status_unique" UNIQUE("kode_status")
);
--> statement-breakpoint
CREATE TABLE "letter_attachments" (
	"surat_id" uuid NOT NULL,
	"nama_file" varchar(255) NOT NULL,
	"tipe_mime" varchar(100),
	"ukuran_bytes" integer,
	"file_url" text NOT NULL,
	"deskripsi" text,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "letter_distributions" (
	"surat_id" uuid NOT NULL,
	"tujuan" varchar(255) NOT NULL,
	"metode_pengiriman" varchar(100),
	"tanggal_kirim" timestamp,
	"status_pengiriman" varchar(50) DEFAULT 'PROSES',
	"bukti_kirim_url" text,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "letter_reviews" (
	"surat_id" uuid NOT NULL,
	"reviewer_id" uuid NOT NULL,
	"tipe_review" varchar(50) NOT NULL,
	"catatan" text,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "letter_signatures" (
	"surat_id" uuid NOT NULL,
	"penandatangan_id" uuid NOT NULL,
	"qr_code_url" text,
	"kode_verifikasi" varchar(100),
	"status_ttd" varchar(50) DEFAULT 'PENDING' NOT NULL,
	"waktu_ttd" timestamp,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	CONSTRAINT "letter_signatures_kode_verifikasi_unique" UNIQUE("kode_verifikasi")
);
--> statement-breakpoint
CREATE TABLE "outgoing_letter_versions" (
	"surat_id" uuid NOT NULL,
	"versi" varchar(20) NOT NULL,
	"konten_html" text NOT NULL,
	"data_placeholder" json,
	"template_version_id" uuid,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outgoing_letters" (
	"nomor_agenda" varchar(100),
	"nomor_surat" varchar(100),
	"template_id" uuid,
	"jenis_surat_id" uuid,
	"klasifikasi_id" uuid,
	"prioritas_id" uuid,
	"sifat_surat_id" uuid,
	"perihal" text NOT NULL,
	"tujuan_surat" varchar(255) NOT NULL,
	"instansi_tujuan_id" uuid,
	"pembuat_id" uuid NOT NULL,
	"unit_kerja_id" uuid NOT NULL,
	"penandatangan_id" uuid,
	"tanggal_surat" date,
	"tanggal_terbit" date,
	"status" varchar(50) DEFAULT 'DRAFT' NOT NULL,
	"catatan_tambahan" text,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workflow_histories" ADD CONSTRAINT "workflow_histories_instance_id_workflow_instances_id_fk" FOREIGN KEY ("instance_id") REFERENCES "public"."workflow_instances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_histories" ADD CONSTRAINT "workflow_histories_from_step_id_workflow_steps_id_fk" FOREIGN KEY ("from_step_id") REFERENCES "public"."workflow_steps"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_histories" ADD CONSTRAINT "workflow_histories_to_step_id_workflow_steps_id_fk" FOREIGN KEY ("to_step_id") REFERENCES "public"."workflow_steps"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_histories" ADD CONSTRAINT "workflow_histories_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_instances" ADD CONSTRAINT "workflow_instances_current_step_id_workflow_steps_id_fk" FOREIGN KEY ("current_step_id") REFERENCES "public"."workflow_steps"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_instances" ADD CONSTRAINT "workflow_instances_assigned_user_id_users_id_fk" FOREIGN KEY ("assigned_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "letter_attachments" ADD CONSTRAINT "letter_attachments_surat_id_outgoing_letters_id_fk" FOREIGN KEY ("surat_id") REFERENCES "public"."outgoing_letters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "letter_distributions" ADD CONSTRAINT "letter_distributions_surat_id_outgoing_letters_id_fk" FOREIGN KEY ("surat_id") REFERENCES "public"."outgoing_letters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "letter_reviews" ADD CONSTRAINT "letter_reviews_surat_id_outgoing_letters_id_fk" FOREIGN KEY ("surat_id") REFERENCES "public"."outgoing_letters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "letter_reviews" ADD CONSTRAINT "letter_reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "letter_signatures" ADD CONSTRAINT "letter_signatures_surat_id_outgoing_letters_id_fk" FOREIGN KEY ("surat_id") REFERENCES "public"."outgoing_letters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "letter_signatures" ADD CONSTRAINT "letter_signatures_penandatangan_id_master_pegawai_id_fk" FOREIGN KEY ("penandatangan_id") REFERENCES "public"."master_pegawai"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outgoing_letter_versions" ADD CONSTRAINT "outgoing_letter_versions_surat_id_outgoing_letters_id_fk" FOREIGN KEY ("surat_id") REFERENCES "public"."outgoing_letters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outgoing_letter_versions" ADD CONSTRAINT "outgoing_letter_versions_template_version_id_template_versions_id_fk" FOREIGN KEY ("template_version_id") REFERENCES "public"."template_versions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outgoing_letters" ADD CONSTRAINT "outgoing_letters_template_id_document_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."document_templates"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outgoing_letters" ADD CONSTRAINT "outgoing_letters_jenis_surat_id_master_jenis_surat_id_fk" FOREIGN KEY ("jenis_surat_id") REFERENCES "public"."master_jenis_surat"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outgoing_letters" ADD CONSTRAINT "outgoing_letters_klasifikasi_id_master_klasifikasi_surat_id_fk" FOREIGN KEY ("klasifikasi_id") REFERENCES "public"."master_klasifikasi_surat"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outgoing_letters" ADD CONSTRAINT "outgoing_letters_prioritas_id_master_prioritas_id_fk" FOREIGN KEY ("prioritas_id") REFERENCES "public"."master_prioritas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outgoing_letters" ADD CONSTRAINT "outgoing_letters_sifat_surat_id_master_sifat_surat_id_fk" FOREIGN KEY ("sifat_surat_id") REFERENCES "public"."master_sifat_surat"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outgoing_letters" ADD CONSTRAINT "outgoing_letters_instansi_tujuan_id_master_instansi_id_fk" FOREIGN KEY ("instansi_tujuan_id") REFERENCES "public"."master_instansi"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outgoing_letters" ADD CONSTRAINT "outgoing_letters_pembuat_id_users_id_fk" FOREIGN KEY ("pembuat_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outgoing_letters" ADD CONSTRAINT "outgoing_letters_unit_kerja_id_master_unit_kerja_id_fk" FOREIGN KEY ("unit_kerja_id") REFERENCES "public"."master_unit_kerja"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outgoing_letters" ADD CONSTRAINT "outgoing_letters_penandatangan_id_master_pegawai_id_fk" FOREIGN KEY ("penandatangan_id") REFERENCES "public"."master_pegawai"("id") ON DELETE restrict ON UPDATE no action;

-- ==========================================
-- FILE: 0004_harsh_quasimodo.sql
-- ==========================================
CREATE TABLE "agenda_books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	"nama_buku" varchar(255) NOT NULL,
	"tahun" integer NOT NULL,
	"tipe" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'AKTIF' NOT NULL,
	"keterangan" text
);
--> statement-breakpoint
CREATE TABLE "incoming_agendas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	"buku_agenda_id" uuid NOT NULL,
	"surat_id" uuid NOT NULL,
	"nomor_urut" integer NOT NULL,
	"tanggal_catat" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incoming_dispositions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	"surat_id" uuid NOT NULL,
	"pemberi_disposisi_id" uuid NOT NULL,
	"penerima_disposisi_id" uuid NOT NULL,
	"instruksi" text NOT NULL,
	"catatan" text,
	"deadline" timestamp,
	"status" varchar(50) DEFAULT 'MENUNGGU' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incoming_distributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	"surat_id" uuid NOT NULL,
	"pengirim_id" uuid NOT NULL,
	"tujuan_unit_id" uuid,
	"tujuan_pegawai_id" uuid,
	"catatan" text,
	"deadline" timestamp,
	"status" varchar(50) DEFAULT 'TERKIRIM' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incoming_letter_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	"surat_id" uuid NOT NULL,
	"nama_file" varchar(255) NOT NULL,
	"tipe_mime" varchar(100),
	"ukuran_bytes" integer,
	"file_url" text NOT NULL,
	"deskripsi" text,
	"ocr_text" text
);
--> statement-breakpoint
CREATE TABLE "incoming_letters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	"nomor_agenda" varchar(100),
	"nomor_surat" varchar(100) NOT NULL,
	"tanggal_surat" date NOT NULL,
	"tanggal_diterima" date NOT NULL,
	"pengirim" varchar(255) NOT NULL,
	"instansi_pengirim_id" uuid,
	"perihal" text NOT NULL,
	"ringkasan_isi" text,
	"jenis_surat_id" uuid NOT NULL,
	"klasifikasi_id" uuid NOT NULL,
	"prioritas_id" uuid NOT NULL,
	"sifat_surat_id" uuid NOT NULL,
	"tujuan_unit_id" uuid,
	"penerima_id" uuid,
	"status" varchar(50) DEFAULT 'DRAFT' NOT NULL,
	"catatan" text
);
--> statement-breakpoint
CREATE TABLE "incoming_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"surat_id" uuid,
	"aktor_id" uuid,
	"aksi" varchar(50) NOT NULL,
	"keterangan" text,
	"data_lama" json,
	"data_baru" json,
	"tanggal" timestamp DEFAULT now() NOT NULL,
	"ip_address" varchar(45)
);
--> statement-breakpoint
CREATE TABLE "incoming_registers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	"buku_register_id" uuid NOT NULL,
	"surat_id" uuid NOT NULL,
	"nomor_urut" integer NOT NULL,
	"tanggal_catat" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incoming_timelines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"surat_id" uuid NOT NULL,
	"aktor_id" uuid,
	"aktivitas" varchar(100) NOT NULL,
	"deskripsi" text,
	"tanggal" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "register_books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	"nama_register" varchar(255) NOT NULL,
	"tahun" integer NOT NULL,
	"tipe" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'AKTIF' NOT NULL,
	"keterangan" text
);
--> statement-breakpoint
ALTER TABLE "incoming_agendas" ADD CONSTRAINT "incoming_agendas_buku_agenda_id_agenda_books_id_fk" FOREIGN KEY ("buku_agenda_id") REFERENCES "public"."agenda_books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incoming_agendas" ADD CONSTRAINT "incoming_agendas_surat_id_incoming_letters_id_fk" FOREIGN KEY ("surat_id") REFERENCES "public"."incoming_letters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incoming_dispositions" ADD CONSTRAINT "incoming_dispositions_surat_id_incoming_letters_id_fk" FOREIGN KEY ("surat_id") REFERENCES "public"."incoming_letters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incoming_dispositions" ADD CONSTRAINT "incoming_dispositions_pemberi_disposisi_id_users_id_fk" FOREIGN KEY ("pemberi_disposisi_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incoming_dispositions" ADD CONSTRAINT "incoming_dispositions_penerima_disposisi_id_users_id_fk" FOREIGN KEY ("penerima_disposisi_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incoming_distributions" ADD CONSTRAINT "incoming_distributions_surat_id_incoming_letters_id_fk" FOREIGN KEY ("surat_id") REFERENCES "public"."incoming_letters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incoming_distributions" ADD CONSTRAINT "incoming_distributions_pengirim_id_users_id_fk" FOREIGN KEY ("pengirim_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incoming_distributions" ADD CONSTRAINT "incoming_distributions_tujuan_unit_id_master_unit_kerja_id_fk" FOREIGN KEY ("tujuan_unit_id") REFERENCES "public"."master_unit_kerja"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incoming_distributions" ADD CONSTRAINT "incoming_distributions_tujuan_pegawai_id_master_pegawai_id_fk" FOREIGN KEY ("tujuan_pegawai_id") REFERENCES "public"."master_pegawai"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incoming_letter_attachments" ADD CONSTRAINT "incoming_letter_attachments_surat_id_incoming_letters_id_fk" FOREIGN KEY ("surat_id") REFERENCES "public"."incoming_letters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incoming_letters" ADD CONSTRAINT "incoming_letters_instansi_pengirim_id_master_instansi_id_fk" FOREIGN KEY ("instansi_pengirim_id") REFERENCES "public"."master_instansi"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incoming_letters" ADD CONSTRAINT "incoming_letters_jenis_surat_id_master_jenis_surat_id_fk" FOREIGN KEY ("jenis_surat_id") REFERENCES "public"."master_jenis_surat"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incoming_letters" ADD CONSTRAINT "incoming_letters_klasifikasi_id_master_klasifikasi_surat_id_fk" FOREIGN KEY ("klasifikasi_id") REFERENCES "public"."master_klasifikasi_surat"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incoming_letters" ADD CONSTRAINT "incoming_letters_prioritas_id_master_prioritas_id_fk" FOREIGN KEY ("prioritas_id") REFERENCES "public"."master_prioritas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incoming_letters" ADD CONSTRAINT "incoming_letters_sifat_surat_id_master_sifat_surat_id_fk" FOREIGN KEY ("sifat_surat_id") REFERENCES "public"."master_sifat_surat"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incoming_letters" ADD CONSTRAINT "incoming_letters_tujuan_unit_id_master_unit_kerja_id_fk" FOREIGN KEY ("tujuan_unit_id") REFERENCES "public"."master_unit_kerja"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incoming_letters" ADD CONSTRAINT "incoming_letters_penerima_id_master_pegawai_id_fk" FOREIGN KEY ("penerima_id") REFERENCES "public"."master_pegawai"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incoming_logs" ADD CONSTRAINT "incoming_logs_surat_id_incoming_letters_id_fk" FOREIGN KEY ("surat_id") REFERENCES "public"."incoming_letters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incoming_logs" ADD CONSTRAINT "incoming_logs_aktor_id_users_id_fk" FOREIGN KEY ("aktor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incoming_registers" ADD CONSTRAINT "incoming_registers_buku_register_id_register_books_id_fk" FOREIGN KEY ("buku_register_id") REFERENCES "public"."register_books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incoming_registers" ADD CONSTRAINT "incoming_registers_surat_id_incoming_letters_id_fk" FOREIGN KEY ("surat_id") REFERENCES "public"."incoming_letters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incoming_timelines" ADD CONSTRAINT "incoming_timelines_surat_id_incoming_letters_id_fk" FOREIGN KEY ("surat_id") REFERENCES "public"."incoming_letters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incoming_timelines" ADD CONSTRAINT "incoming_timelines_aktor_id_users_id_fk" FOREIGN KEY ("aktor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;

-- ==========================================
-- FILE: 0005_curvy_sir_ram.sql
-- ==========================================
CREATE TABLE "archive_borrowings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	"archive_id" uuid NOT NULL,
	"peminjam_id" uuid NOT NULL,
	"unit_peminjam_id" uuid,
	"tanggal_pinjam" timestamp DEFAULT now() NOT NULL,
	"tanggal_kembali_rencana" timestamp NOT NULL,
	"tanggal_kembali_aktual" timestamp,
	"keperluan" text NOT NULL,
	"status" varchar(50) DEFAULT 'MENUNGGU_PERSETUJUAN' NOT NULL,
	"catatan_penolakan" text
);
--> statement-breakpoint
CREATE TABLE "archive_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	"nama" varchar(255) NOT NULL,
	"deskripsi" text,
	"is_aktif" boolean DEFAULT true NOT NULL,
	CONSTRAINT "archive_categories_nama_unique" UNIQUE("nama")
);
--> statement-breakpoint
CREATE TABLE "archive_histories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"archive_id" uuid NOT NULL,
	"aktor_id" uuid,
	"aksi" varchar(100) NOT NULL,
	"deskripsi" text,
	"tanggal" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "archive_labels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	"nama" varchar(100) NOT NULL,
	"warna" varchar(20),
	CONSTRAINT "archive_labels_nama_unique" UNIQUE("nama")
);
--> statement-breakpoint
CREATE TABLE "archive_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	"nama" varchar(100) NOT NULL,
	"warna" varchar(20),
	CONSTRAINT "archive_tags_nama_unique" UNIQUE("nama")
);
--> statement-breakpoint
CREATE TABLE "archive_to_labels" (
	"archive_id" uuid NOT NULL,
	"label_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "archive_to_tags" (
	"archive_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "archives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"incoming_letter_id" uuid,
	"outgoing_letter_id" uuid,
	"kategori_id" uuid,
	"nomor_arsip" varchar(100) NOT NULL,
	"perihal" text NOT NULL,
	"tahun" integer NOT NULL,
	"lokasi_fisik" varchar(255),
	"folder_virtual" varchar(255),
	"status" varchar(50) DEFAULT 'AKTIF' NOT NULL,
	"retention_policy_id" uuid,
	"tanggal_retensi_berakhir" date,
	"status_retensi" varchar(50) DEFAULT 'AKTIF' NOT NULL,
	"metadata" jsonb,
	"search_vector" text,
	CONSTRAINT "archives_nomor_arsip_unique" UNIQUE("nomor_arsip")
);
--> statement-breakpoint
CREATE TABLE "document_favorites" (
	"user_id" uuid NOT NULL,
	"archive_id" uuid NOT NULL,
	"tanggal_ditambahkan" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_hashes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" uuid NOT NULL,
	"hash_sha256" varchar(64) NOT NULL,
	"tanggal_generate" timestamp DEFAULT now() NOT NULL,
	"generator_id" uuid,
	"versi_dokumen" varchar(50),
	CONSTRAINT "document_hashes_hash_sha256_unique" UNIQUE("hash_sha256")
);
--> statement-breakpoint
CREATE TABLE "document_recents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"archive_id" uuid NOT NULL,
	"tanggal_akses" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hash_id" uuid NOT NULL,
	"tanggal_verifikasi" timestamp DEFAULT now() NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"status_validasi" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "retention_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"archive_id" uuid NOT NULL,
	"aksi" varchar(50) NOT NULL,
	"status_sebelumnya" varchar(50),
	"status_baru" varchar(50),
	"catatan" text,
	"aktor_id" uuid,
	"tanggal" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "retention_policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	"kode" varchar(50) NOT NULL,
	"nama" varchar(255) NOT NULL,
	"masa_aktif_tahun" integer NOT NULL,
	"masa_inaktif_tahun" integer NOT NULL,
	"tindakan_akhir" varchar(50) NOT NULL,
	"keterangan" text,
	"is_aktif" boolean DEFAULT true NOT NULL,
	CONSTRAINT "retention_policies_kode_unique" UNIQUE("kode")
);
--> statement-breakpoint
ALTER TABLE "archive_borrowings" ADD CONSTRAINT "archive_borrowings_archive_id_archives_id_fk" FOREIGN KEY ("archive_id") REFERENCES "public"."archives"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archive_borrowings" ADD CONSTRAINT "archive_borrowings_peminjam_id_users_id_fk" FOREIGN KEY ("peminjam_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archive_borrowings" ADD CONSTRAINT "archive_borrowings_unit_peminjam_id_master_unit_kerja_id_fk" FOREIGN KEY ("unit_peminjam_id") REFERENCES "public"."master_unit_kerja"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archive_histories" ADD CONSTRAINT "archive_histories_archive_id_archives_id_fk" FOREIGN KEY ("archive_id") REFERENCES "public"."archives"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archive_histories" ADD CONSTRAINT "archive_histories_aktor_id_users_id_fk" FOREIGN KEY ("aktor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archive_to_labels" ADD CONSTRAINT "archive_to_labels_archive_id_archives_id_fk" FOREIGN KEY ("archive_id") REFERENCES "public"."archives"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archive_to_labels" ADD CONSTRAINT "archive_to_labels_label_id_archive_labels_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."archive_labels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archive_to_tags" ADD CONSTRAINT "archive_to_tags_archive_id_archives_id_fk" FOREIGN KEY ("archive_id") REFERENCES "public"."archives"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archive_to_tags" ADD CONSTRAINT "archive_to_tags_tag_id_archive_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."archive_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archives" ADD CONSTRAINT "archives_incoming_letter_id_incoming_letters_id_fk" FOREIGN KEY ("incoming_letter_id") REFERENCES "public"."incoming_letters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archives" ADD CONSTRAINT "archives_outgoing_letter_id_outgoing_letters_id_fk" FOREIGN KEY ("outgoing_letter_id") REFERENCES "public"."outgoing_letters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archives" ADD CONSTRAINT "archives_kategori_id_archive_categories_id_fk" FOREIGN KEY ("kategori_id") REFERENCES "public"."archive_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_favorites" ADD CONSTRAINT "document_favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_favorites" ADD CONSTRAINT "document_favorites_archive_id_archives_id_fk" FOREIGN KEY ("archive_id") REFERENCES "public"."archives"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_hashes" ADD CONSTRAINT "document_hashes_generator_id_users_id_fk" FOREIGN KEY ("generator_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_recents" ADD CONSTRAINT "document_recents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_recents" ADD CONSTRAINT "document_recents_archive_id_archives_id_fk" FOREIGN KEY ("archive_id") REFERENCES "public"."archives"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_verifications" ADD CONSTRAINT "document_verifications_hash_id_document_hashes_id_fk" FOREIGN KEY ("hash_id") REFERENCES "public"."document_hashes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retention_logs" ADD CONSTRAINT "retention_logs_archive_id_archives_id_fk" FOREIGN KEY ("archive_id") REFERENCES "public"."archives"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retention_logs" ADD CONSTRAINT "retention_logs_aktor_id_users_id_fk" FOREIGN KEY ("aktor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;

-- ==========================================
-- FILE: 0006_colossal_ultragirl.sql
-- ==========================================
CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	"nama" varchar(255) NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"token_preview" varchar(20) NOT NULL,
	"permissions" jsonb,
	"expires_at" timestamp,
	"last_used_at" timestamp,
	"is_aktif" boolean DEFAULT true NOT NULL,
	CONSTRAINT "api_keys_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "api_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"api_key_id" uuid,
	"endpoint" varchar(255) NOT NULL,
	"method" varchar(10) NOT NULL,
	"status_code" varchar(10) NOT NULL,
	"ip_address" varchar(45),
	"request_body" jsonb,
	"response_body" jsonb,
	"tanggal" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "automation_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rule_id" uuid,
	"trigger_event" varchar(100) NOT NULL,
	"context" jsonb,
	"status" varchar(50) NOT NULL,
	"error_message" text,
	"tanggal" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "automation_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	"nama" varchar(255) NOT NULL,
	"deskripsi" text,
	"trigger_event" varchar(100) NOT NULL,
	"conditions" jsonb NOT NULL,
	"actions" jsonb NOT NULL,
	"is_aktif" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"webhook_id" uuid,
	"event" varchar(100) NOT NULL,
	"payload" jsonb NOT NULL,
	"status_code" varchar(10),
	"response_body" text,
	"status" varchar(50) NOT NULL,
	"tanggal" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	"nama" varchar(255) NOT NULL,
	"url" varchar(500) NOT NULL,
	"secret" varchar(255),
	"events" jsonb NOT NULL,
	"is_aktif" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid,
	"penerima" varchar(255) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"status" varchar(50) NOT NULL,
	"error_message" text,
	"tanggal" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
	"kode" varchar(100) NOT NULL,
	"nama" varchar(255) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"html_body" text NOT NULL,
	"is_aktif" boolean DEFAULT true NOT NULL,
	CONSTRAINT "email_templates_kode_unique" UNIQUE("kode")
);
--> statement-breakpoint
CREATE TABLE "storage_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kategori" varchar(50) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"path" varchar(500) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"size_bytes" varchar(50) NOT NULL,
	"hash_sha256" varchar(64),
	"uploaded_by" uuid,
	"tanggal_upload" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_backups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipe" varchar(50) NOT NULL,
	"filename" varchar(255) NOT NULL,
	"path" varchar(500) NOT NULL,
	"size_bytes" varchar(50),
	"status" varchar(50) NOT NULL,
	"aktor_id" uuid,
	"tanggal_mulai" timestamp DEFAULT now() NOT NULL,
	"tanggal_selesai" timestamp,
	"error_message" text
);
--> statement-breakpoint
CREATE TABLE "system_health_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"komponen" varchar(100) NOT NULL,
	"status" varchar(50) NOT NULL,
	"metrics" jsonb,
	"error_message" text,
	"tanggal" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "digital_signatures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"outgoing_letter_id" uuid,
	"provider" varchar(50) DEFAULT 'LOCAL' NOT NULL,
	"tipe" varchar(50) DEFAULT 'SEQUENTIAL' NOT NULL,
	"status" varchar(50) DEFAULT 'DRAFT' NOT NULL,
	"provider_payload" jsonb,
	"tanggal_request" timestamp DEFAULT now() NOT NULL,
	"tanggal_selesai" timestamp
);
--> statement-breakpoint
CREATE TABLE "signature_histories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"signature_id" uuid NOT NULL,
	"aktor_id" uuid,
	"aksi" varchar(50) NOT NULL,
	"deskripsi" text,
	"tanggal" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "signature_signers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"signature_id" uuid NOT NULL,
	"signer_id" uuid NOT NULL,
	"urutan" integer DEFAULT 1 NOT NULL,
	"posisi_visual" jsonb,
	"status" varchar(50) DEFAULT 'WAITING' NOT NULL,
	"tanggal_ttd" timestamp,
	"catatan_penolakan" text
);
--> statement-breakpoint
ALTER TABLE "api_logs" ADD CONSTRAINT "api_logs_api_key_id_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."api_keys"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_logs" ADD CONSTRAINT "automation_logs_rule_id_automation_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."automation_rules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_logs" ADD CONSTRAINT "webhook_logs_webhook_id_webhooks_id_fk" FOREIGN KEY ("webhook_id") REFERENCES "public"."webhooks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_template_id_email_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."email_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storage_files" ADD CONSTRAINT "storage_files_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_backups" ADD CONSTRAINT "system_backups_aktor_id_users_id_fk" FOREIGN KEY ("aktor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "digital_signatures" ADD CONSTRAINT "digital_signatures_outgoing_letter_id_outgoing_letters_id_fk" FOREIGN KEY ("outgoing_letter_id") REFERENCES "public"."outgoing_letters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signature_histories" ADD CONSTRAINT "signature_histories_signature_id_digital_signatures_id_fk" FOREIGN KEY ("signature_id") REFERENCES "public"."digital_signatures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signature_histories" ADD CONSTRAINT "signature_histories_aktor_id_users_id_fk" FOREIGN KEY ("aktor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signature_signers" ADD CONSTRAINT "signature_signers_signature_id_digital_signatures_id_fk" FOREIGN KEY ("signature_id") REFERENCES "public"."digital_signatures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signature_signers" ADD CONSTRAINT "signature_signers_signer_id_users_id_fk" FOREIGN KEY ("signer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

-- ==========================================
-- FILE: 0007_student_letters.sql
-- ==========================================
CREATE TABLE IF NOT EXISTS "master_kelas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" uuid,
	"updated_by" uuid,
	"kode_kelas" varchar(50) NOT NULL UNIQUE,
	"nama_kelas" varchar(100) NOT NULL,
	"tingkat" integer DEFAULT 10 NOT NULL,
	"jurusan" varchar(100),
	"wali_kelas_id" uuid,
	"tahun_ajaran" varchar(50) DEFAULT '2026/2027',
	"is_aktif" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "master_siswa" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" uuid,
	"updated_by" uuid,
	"nis" varchar(50) UNIQUE,
	"nisn" varchar(50) NOT NULL UNIQUE,
	"nama" varchar(255) NOT NULL,
	"jenis_kelamin" varchar(10) DEFAULT 'L',
	"tempat_lahir" varchar(100),
	"tanggal_lahir" varchar(50),
	"kelas_id" uuid,
	"nama_ortu" varchar(255),
	"pekerjaan_ortu" varchar(100),
	"no_hp_ortu" varchar(50),
	"alamat" text,
	"status" varchar(50) DEFAULT 'Aktif' NOT NULL,
	"is_aktif" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "student_letters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" uuid,
	"updated_by" uuid,
	"outgoing_letter_id" uuid,
	"tipe_surat" varchar(50) NOT NULL,
	"siswa_id" uuid,
	"kelas_id" uuid,
	"nomor_surat" varchar(100),
	"keperluan" text,
	"nama_kegiatan" varchar(255),
	"lokasi_kegiatan" varchar(255),
	"tanggal_mulai" varchar(50),
	"tanggal_selesai" varchar(50),
	"guru_pendamping_id" uuid,
	"waktu_menghadap" varchar(100),
	"menghadap_kepada" varchar(100),
	"ruangan" varchar(100),
	"catatan_khusus" text,
	"status" varchar(50) DEFAULT 'APPROVED' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "student_letter_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" uuid,
	"updated_by" uuid,
	"student_letter_id" uuid NOT NULL,
	"siswa_id" uuid NOT NULL,
	"peran" varchar(100) DEFAULT 'Peserta'
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "master_kelas" ADD CONSTRAINT "master_kelas_wali_kelas_id_master_pegawai_id_fk" FOREIGN KEY ("wali_kelas_id") REFERENCES "master_pegawai"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "master_siswa" ADD CONSTRAINT "master_siswa_kelas_id_master_kelas_id_fk" FOREIGN KEY ("kelas_id") REFERENCES "master_kelas"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "student_letters" ADD CONSTRAINT "student_letters_outgoing_letter_id_outgoing_letters_id_fk" FOREIGN KEY ("outgoing_letter_id") REFERENCES "outgoing_letters"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "student_letters" ADD CONSTRAINT "student_letters_siswa_id_master_siswa_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "master_siswa"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "student_letters" ADD CONSTRAINT "student_letters_kelas_id_master_kelas_id_fk" FOREIGN KEY ("kelas_id") REFERENCES "master_kelas"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "student_letters" ADD CONSTRAINT "student_letters_guru_pendamping_id_master_pegawai_id_fk" FOREIGN KEY ("guru_pendamping_id") REFERENCES "master_pegawai"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "student_letter_participants" ADD CONSTRAINT "student_letter_participants_student_letter_id_student_letters_id_fk" FOREIGN KEY ("student_letter_id") REFERENCES "student_letters"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "student_letter_participants" ADD CONSTRAINT "student_letter_participants_siswa_id_master_siswa_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "master_siswa"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;


-- ==========================================
-- FILE: 0008_parent_consents.sql
-- ==========================================
CREATE TABLE IF NOT EXISTS "parent_consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" uuid,
	"updated_by" uuid,
	"kategori" varchar(50) DEFAULT '5_HARI_KERJA' NOT NULL,
	"siswa_id" uuid NOT NULL,
	"kelas_id" uuid,
	"nama_ortu" varchar(255) NOT NULL,
	"pekerjaan_ortu" varchar(100),
	"no_hp_ortu" varchar(50) NOT NULL,
	"alamat_ortu" text,
	"hubungan" varchar(50) DEFAULT 'Orang Tua Kandung',
	"status_persetujuan" varchar(50) NOT NULL,
	"alasan_penolakan" text,
	"kesiapan_fasilitas" json,
	"ttd_digital" text NOT NULL,
	"ip_address" varchar(100),
	"user_agent" text,
	"signed_at" timestamp DEFAULT now() NOT NULL,
	"nomor_surat" varchar(100),
	"document_snapshot" json
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "parent_consents" ADD CONSTRAINT "parent_consents_siswa_id_master_siswa_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "master_siswa"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "parent_consents" ADD CONSTRAINT "parent_consents_kelas_id_master_kelas_id_fk" FOREIGN KEY ("kelas_id") REFERENCES "master_kelas"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
