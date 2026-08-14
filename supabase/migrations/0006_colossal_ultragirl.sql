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