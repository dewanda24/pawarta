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