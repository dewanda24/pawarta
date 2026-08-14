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