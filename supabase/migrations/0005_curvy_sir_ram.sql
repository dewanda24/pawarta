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