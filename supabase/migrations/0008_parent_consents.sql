CREATE TABLE IF NOT EXISTS "parent_consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(255) DEFAULT 'system' NOT NULL,
	"updated_by" varchar(255) DEFAULT 'system' NOT NULL,
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
