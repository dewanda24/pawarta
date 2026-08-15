import { pgTable, varchar, text, boolean, integer, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { auditFields } from './utils';

// 1. Master Sekolah
export const masterSekolah = pgTable('master_sekolah', {
  ...auditFields,
  nama: varchar('nama', { length: 255 }).notNull(),
  npsn: varchar('npsn', { length: 50 }),
  nss: varchar('nss', { length: 50 }),
  jenjang: varchar('jenjang', { length: 50 }),
  status: varchar('status', { length: 50 }),
  alamat: text('alamat'),
  desa: varchar('desa', { length: 100 }),
  kecamatan: varchar('kecamatan', { length: 100 }),
  kabupaten: varchar('kabupaten', { length: 100 }),
  provinsi: varchar('provinsi', { length: 100 }),
  kodePos: varchar('kode_pos', { length: 20 }),
  email: varchar('email', { length: 100 }),
  website: varchar('website', { length: 100 }),
  telepon: varchar('telepon', { length: 50 }),
  logo: text('logo'),
  kepalaSekolahId: uuid('kepala_sekolah_id'), // Relasi ke master_pegawai
  isAktif: boolean('is_aktif').default(true).notNull(),
});

// 2. Master Unit Kerja
export const masterUnitKerja = pgTable('master_unit_kerja', {
  ...auditFields,
  kode: varchar('kode', { length: 50 }).notNull().unique(),
  nama: varchar('nama', { length: 255 }).notNull(),
  deskripsi: text('deskripsi'),
  isAktif: boolean('is_aktif').default(true).notNull(),
});

// 3. Master Jabatan
export const masterJabatan = pgTable('master_jabatan', {
  ...auditFields,
  nama: varchar('nama', { length: 255 }).notNull().unique(),
  isAktif: boolean('is_aktif').default(true).notNull(),
});

// 4. Master Pegawai
export const masterPegawai = pgTable('master_pegawai', {
  ...auditFields,
  nama: varchar('nama', { length: 255 }).notNull(),
  nip: varchar('nip', { length: 50 }),
  nik: varchar('nik', { length: 50 }),
  email: varchar('email', { length: 100 }),
  noHp: varchar('no_hp', { length: 50 }),
  unitKerjaId: uuid('unit_kerja_id').references(() => masterUnitKerja.id),
  jabatanId: uuid('jabatan_id').references(() => masterJabatan.id),
  statusAsn: varchar('status_asn', { length: 50 }), // PNS, PPPK, Honorer, dll
  isAktif: boolean('is_aktif').default(true).notNull(),
});

// 5. Master Penandatangan
export const masterPenandatangan = pgTable('master_penandatangan', {
  ...auditFields,
  pegawaiId: uuid('pegawai_id')
    .references(() => masterPegawai.id)
    .notNull(),
  jabatanId: uuid('jabatan_id')
    .references(() => masterJabatan.id)
    .notNull(),
  nipLabel: varchar('nip_label', { length: 50 }), // Label NIP yang akan dicetak
  ttdDigitalUrl: text('ttd_digital_url'),
  parafUrl: text('paraf_url'),
  masaBerlakuMulai: varchar('masa_berlaku_mulai', { length: 50 }),
  masaBerlakuSelesai: varchar('masa_berlaku_selesai', { length: 50 }),
  isAktif: boolean('is_aktif').default(true).notNull(),
});

// 6. Master Jenis Surat
export const masterJenisSurat = pgTable('master_jenis_surat', {
  ...auditFields,
  kode: varchar('kode', { length: 50 }).notNull().unique(),
  nama: varchar('nama', { length: 255 }).notNull(), // Surat Tugas, Undangan, dll
  deskripsi: text('deskripsi'),
  isAktif: boolean('is_aktif').default(true).notNull(),
});

// 7. Master Klasifikasi Surat
export const masterKlasifikasiSurat = pgTable('master_klasifikasi_surat', {
  ...auditFields,
  kode: varchar('kode', { length: 50 }).notNull().unique(), // 400, 400.3
  nama: varchar('nama', { length: 255 }).notNull(),
  deskripsi: text('deskripsi'),
  level: integer('level').notNull().default(1),
  parentId: uuid('parent_id'), // Self-referencing FK ditangani via relasi
  isAktif: boolean('is_aktif').default(true).notNull(),
});

// 8. Mapping Jenis Surat -> Klasifikasi
export const mappingJenisKlasifikasi = pgTable('mapping_jenis_klasifikasi', {
  ...auditFields,
  jenisSuratId: uuid('jenis_surat_id')
    .references(() => masterJenisSurat.id)
    .notNull(),
  klasifikasiSuratId: uuid('klasifikasi_surat_id')
    .references(() => masterKlasifikasiSurat.id)
    .notNull(),
});

// 9. Master Prioritas
export const masterPrioritas = pgTable('master_prioritas', {
  ...auditFields,
  nama: varchar('nama', { length: 100 }).notNull().unique(), // Rendah, Sedang, Tinggi, Mendesak
  isAktif: boolean('is_aktif').default(true).notNull(),
});

// 10. Master Sifat Surat
export const masterSifatSurat = pgTable('master_sifat_surat', {
  ...auditFields,
  nama: varchar('nama', { length: 100 }).notNull().unique(), // Biasa, Penting, Rahasia
  isAktif: boolean('is_aktif').default(true).notNull(),
});

// 11. Master Instansi
export const masterInstansi = pgTable('master_instansi', {
  ...auditFields,
  nama: varchar('nama', { length: 255 }).notNull(),
  jenis: varchar('jenis', { length: 100 }), // Dinas, Swasta, Sekolah, dll
  alamat: text('alamat'),
  kota: varchar('kota', { length: 100 }),
  email: varchar('email', { length: 100 }),
  telepon: varchar('telepon', { length: 50 }),
  website: varchar('website', { length: 100 }),
  isAktif: boolean('is_aktif').default(true).notNull(),
});

// 12. Master Placeholder
export const masterPlaceholder = pgTable('master_placeholder', {
  ...auditFields,
  key: varchar('key', { length: 100 }).notNull().unique(), // {nama_sekolah}
  nama: varchar('nama', { length: 100 }).notNull(),
  deskripsi: text('deskripsi'),
  sumberData: varchar('sumber_data', { length: 100 }), // Misal: "Tabel Sekolah", "Tabel Pegawai"
  isAktif: boolean('is_aktif').default(true).notNull(),
});

// 13. Konfigurasi Sistem
export const konfigurasiSistem = pgTable('konfigurasi_sistem', {
  ...auditFields,
  prefixNomorSurat: varchar('prefix_nomor_surat', { length: 100 }),
  formatNomor: varchar('format_nomor', { length: 255 }),
  tahunAktif: varchar('tahun_aktif', { length: 10 }),
  bahasa: varchar('bahasa', { length: 50 }).default('id-ID'),
  zonaWaktu: varchar('zona_waktu', { length: 50 }).default('Asia/Jakarta'),
  formatTanggal: varchar('format_tanggal', { length: 50 }).default('DD MMMM YYYY'),
  formatPdf: varchar('format_pdf', { length: 50 }).default('A4'),
  marginCetak: varchar('margin_cetak', { length: 100 }), // e.g. "2cm 2cm 2cm 2cm"
});

// 14. Master Kelas
export const masterKelas = pgTable('master_kelas', {
  ...auditFields,
  kodeKelas: varchar('kode_kelas', { length: 50 }).notNull().unique(), // e.g. "X-MIPA-1"
  namaKelas: varchar('nama_kelas', { length: 100 }).notNull(), // e.g. "Kelas X MIPA 1"
  tingkat: integer('tingkat').notNull().default(10), // 10, 11, 12
  jurusan: varchar('jurusan', { length: 100 }), // MIPA, IPS, dll
  waliKelasId: uuid('wali_kelas_id').references(() => masterPegawai.id, { onDelete: 'set null' }),
  tahunAjaran: varchar('tahun_ajaran', { length: 50 }).default('2026/2027'),
  isAktif: boolean('is_aktif').default(true).notNull(),
});

// 15. Master Siswa
export const masterSiswa = pgTable('master_siswa', {
  ...auditFields,
  nis: varchar('nis', { length: 50 }).unique(),
  nisn: varchar('nisn', { length: 50 }).unique().notNull(),
  nama: varchar('nama', { length: 255 }).notNull(),
  jenisKelamin: varchar('jenis_kelamin', { length: 10 }).default('L'), // L, P
  tempatLahir: varchar('tempat_lahir', { length: 100 }),
  tanggalLahir: varchar('tanggal_lahir', { length: 50 }),
  kelasId: uuid('kelas_id').references(() => masterKelas.id, { onDelete: 'set null' }),
  namaOrtu: varchar('nama_ortu', { length: 255 }),
  pekerjaanOrtu: varchar('pekerjaan_ortu', { length: 100 }),
  noHpOrtu: varchar('no_hp_ortu', { length: 50 }),
  alamat: text('alamat'),
  status: varchar('status', { length: 50 }).default('Aktif').notNull(), // Aktif, Lulus, Pindah, Keluar
  isAktif: boolean('is_aktif').default(true).notNull(),
});

// ============================================================================
// RELATIONS
// ============================================================================

export const sekolahRelations = relations(masterSekolah, ({ one }) => ({
  kepalaSekolah: one(masterPegawai, {
    fields: [masterSekolah.kepalaSekolahId],
    references: [masterPegawai.id],
  }),
}));

export const pegawaiRelations = relations(masterPegawai, ({ one, many }) => ({
  unitKerja: one(masterUnitKerja, {
    fields: [masterPegawai.unitKerjaId],
    references: [masterUnitKerja.id],
  }),
  jabatan: one(masterJabatan, {
    fields: [masterPegawai.jabatanId],
    references: [masterJabatan.id],
  }),
  penandatangan: many(masterPenandatangan),
  kelasWali: many(masterKelas),
}));

export const unitKerjaRelations = relations(masterUnitKerja, ({ many }) => ({
  pegawai: many(masterPegawai),
}));

export const jabatanRelations = relations(masterJabatan, ({ many }) => ({
  pegawai: many(masterPegawai),
  penandatangan: many(masterPenandatangan),
}));

export const penandatanganRelations = relations(masterPenandatangan, ({ one }) => ({
  pegawai: one(masterPegawai, {
    fields: [masterPenandatangan.pegawaiId],
    references: [masterPegawai.id],
  }),
  jabatan: one(masterJabatan, {
    fields: [masterPenandatangan.jabatanId],
    references: [masterJabatan.id],
  }),
}));

export const klasifikasiRelations = relations(masterKlasifikasiSurat, ({ one, many }) => ({
  parent: one(masterKlasifikasiSurat, {
    fields: [masterKlasifikasiSurat.parentId],
    references: [masterKlasifikasiSurat.id],
  }),
  children: many(masterKlasifikasiSurat),
  mappingJenis: many(mappingJenisKlasifikasi),
}));

export const jenisSuratRelations = relations(masterJenisSurat, ({ many }) => ({
  mappingKlasifikasi: many(mappingJenisKlasifikasi),
}));

export const mappingJenisKlasifikasiRelations = relations(mappingJenisKlasifikasi, ({ one }) => ({
  jenisSurat: one(masterJenisSurat, {
    fields: [mappingJenisKlasifikasi.jenisSuratId],
    references: [masterJenisSurat.id],
  }),
  klasifikasiSurat: one(masterKlasifikasiSurat, {
    fields: [mappingJenisKlasifikasi.klasifikasiSuratId],
    references: [masterKlasifikasiSurat.id],
  }),
}));

export const masterKelasRelations = relations(masterKelas, ({ one, many }) => ({
  waliKelas: one(masterPegawai, {
    fields: [masterKelas.waliKelasId],
    references: [masterPegawai.id],
  }),
  siswa: many(masterSiswa),
}));

export const masterSiswaRelations = relations(masterSiswa, ({ one }) => ({
  kelas: one(masterKelas, {
    fields: [masterSiswa.kelasId],
    references: [masterKelas.id],
  }),
}));
