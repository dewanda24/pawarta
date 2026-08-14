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