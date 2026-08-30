-- ==========================================
-- Migration: Sync Schema Fields
-- Fix missing fields in master_jenis_surat & master_penandatangan
-- Fix konfigurasi_sistem.format_pdf default value
-- ==========================================

-- 1. Add missing fields to master_jenis_surat
ALTER TABLE "master_jenis_surat"
  ADD COLUMN IF NOT EXISTS "kategori" varchar(100) DEFAULT 'Naskah Dinas Korespondensi',
  ADD COLUMN IF NOT EXISTS "sub_kategori" varchar(100) DEFAULT 'Internal',
  ADD COLUMN IF NOT EXISTS "font_family" varchar(100) DEFAULT 'Arial',
  ADD COLUMN IF NOT EXISTS "font_size" integer DEFAULT 12,
  ADD COLUMN IF NOT EXISTS "line_spacing" varchar(20) DEFAULT '1.15',
  ADD COLUMN IF NOT EXISTS "margin_kiri" varchar(20) DEFAULT '3.0cm',
  ADD COLUMN IF NOT EXISTS "margin_kanan" varchar(20) DEFAULT '2.0cm',
  ADD COLUMN IF NOT EXISTS "margin_atas" varchar(20) DEFAULT '2.5cm',
  ADD COLUMN IF NOT EXISTS "margin_bawah" varchar(20) DEFAULT '2.5cm',
  ADD COLUMN IF NOT EXISTS "ukuran_kertas" varchar(50) DEFAULT 'F4';

-- 2. Add missing fields to master_penandatangan
ALTER TABLE "master_penandatangan"
  ADD COLUMN IF NOT EXISTS "jabatan_dokumen" varchar(255),
  ADD COLUMN IF NOT EXISTS "jenis_ttd" varchar(50) DEFAULT 'DIGITAL_LOCAL',
  ADD COLUMN IF NOT EXISTS "tte_config" text,
  ADD COLUMN IF NOT EXISTS "spesimen_url" text;

-- 3. Fix konfigurasi_sistem format_pdf default from A4 to F4
ALTER TABLE "konfigurasi_sistem"
  ALTER COLUMN "format_pdf" SET DEFAULT 'F4';

UPDATE "konfigurasi_sistem"
  SET "format_pdf" = 'F4'
  WHERE "format_pdf" = 'A4' OR "format_pdf" IS NULL;

-- 4. Fix margin_cetak default (was NULL, should be standard value)
UPDATE "konfigurasi_sistem"
  SET "margin_cetak" = '2.5cm 2.0cm 2.5cm 3.0cm'
  WHERE "margin_cetak" IS NULL;
