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