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
