import { pgTable, varchar, text, uuid, json, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { auditFields } from './utils';
import { masterSiswa, masterKelas, masterPegawai } from './master';
import { outgoingLetters } from './outgoing-letter';

// 1. Student Letters (Surat Terkait Siswa)
export const studentLetters = pgTable('student_letters', {
  ...auditFields,
  outgoingLetterId: uuid('outgoing_letter_id').references(() => outgoingLetters.id, {
    onDelete: 'cascade',
  }),
  tipeSurat: varchar('tipe_surat', { length: 50 }).notNull(), // DISPENSASI, KETERANGAN_AKTIF, PANGGILAN_ORTU, IZIN_SAKIT
  siswaId: uuid('siswa_id').references(() => masterSiswa.id, { onDelete: 'set null' }),
  kelasId: uuid('kelas_id').references(() => masterKelas.id, { onDelete: 'set null' }),
  nomorSurat: varchar('nomor_surat', { length: 100 }),
  keperluan: text('keperluan'),
  namaKegiatan: varchar('nama_kegiatan', { length: 255 }), // Untuk dispensasi lomba/acara
  lokasiKegiatan: varchar('lokasi_kegiatan', { length: 255 }),
  tanggalMulai: varchar('tanggal_mulai', { length: 50 }),
  tanggalSelesai: varchar('tanggal_selesai', { length: 50 }),
  guruPendampingId: uuid('guru_pendamping_id').references(() => masterPegawai.id, {
    onDelete: 'set null',
  }),
  waktuMenghadap: varchar('waktu_menghadap', { length: 100 }), // Untuk surat panggilan orang tua
  menghadapKepada: varchar('menghadap_kepada', { length: 100 }),
  ruangan: varchar('ruangan', { length: 100 }),
  catatanKhusus: text('catatan_khusus'),
  documentSnapshot: json('document_snapshot'), // Historical immutable snapshot (kop, sekolah, kepsek, siswa)
  signedAt: timestamp('signed_at'),
  status: varchar('status', { length: 50 }).default('APPROVED').notNull(),
});

// 2. Student Letter Participants (Peserta Dispensasi Berkelompok)
export const studentLetterParticipants = pgTable('student_letter_participants', {
  ...auditFields,
  studentLetterId: uuid('student_letter_id')
    .references(() => studentLetters.id, { onDelete: 'cascade' })
    .notNull(),
  siswaId: uuid('siswa_id')
    .references(() => masterSiswa.id, { onDelete: 'cascade' })
    .notNull(),
  peran: varchar('peran', { length: 100 }).default('Peserta'),
});

// 3. Parent Consents (Surat Persetujuan / Pernyataan Orang Tua)
export const parentConsents = pgTable('parent_consents', {
  ...auditFields,
  kategori: varchar('kategori', { length: 50 }).default('5_HARI_KERJA').notNull(), // '5_HARI_KERJA', 'EKSKUL', 'STUDY_TOUR'
  siswaId: uuid('siswa_id')
    .references(() => masterSiswa.id, { onDelete: 'cascade' })
    .notNull(),
  kelasId: uuid('kelas_id').references(() => masterKelas.id, { onDelete: 'set null' }),

  // Data Orang Tua / Wali
  namaOrtu: varchar('nama_ortu', { length: 255 }).notNull(),
  pekerjaanOrtu: varchar('pekerjaan_ortu', { length: 100 }),
  noHpOrtu: varchar('no_hp_ortu', { length: 50 }).notNull(),
  alamatOrtu: text('alamat_ortu'),
  hubungan: varchar('hubungan', { length: 50 }).default('Orang Tua Kandung'), // Ayah, Ibu, Wali

  // Keputusan & Catatan
  statusPersetujuan: varchar('status_persetujuan', { length: 50 }).notNull(), // 'SETUJU', 'TIDAK_SETUJU'
  alasanPenolakan: text('alasan_penolakan'),
  kesiapanFasilitas: json('kesiapan_fasilitas'), // e.g. { bekalMakan: true, transportasi: true, ibadah: true }

  // Tanda Tangan & Audit Trail
  ttdDigital: text('ttd_digital').notNull(), // Base64 data URL gambar tanda tangan
  ipAddress: varchar('ip_address', { length: 100 }),
  userAgent: text('user_agent'),
  signedAt: timestamp('signed_at').defaultNow().notNull(),

  // Nomor Surat & Snapshot
  nomorSurat: varchar('nomor_surat', { length: 100 }),
  documentSnapshot: json('document_snapshot'), // Snapshot nama sekolah, kepsek, kop surat, siswa saat ttd
});

// ==========================================
// RELATIONS
// ==========================================

export const studentLettersRelations = relations(studentLetters, ({ one, many }) => ({
  outgoingLetter: one(outgoingLetters, {
    fields: [studentLetters.outgoingLetterId],
    references: [outgoingLetters.id],
  }),
  siswa: one(masterSiswa, {
    fields: [studentLetters.siswaId],
    references: [masterSiswa.id],
  }),
  kelas: one(masterKelas, {
    fields: [studentLetters.kelasId],
    references: [masterKelas.id],
  }),
  guruPendamping: one(masterPegawai, {
    fields: [studentLetters.guruPendampingId],
    references: [masterPegawai.id],
  }),
  participants: many(studentLetterParticipants),
}));

export const studentLetterParticipantsRelations = relations(
  studentLetterParticipants,
  ({ one }) => ({
    studentLetter: one(studentLetters, {
      fields: [studentLetterParticipants.studentLetterId],
      references: [studentLetters.id],
    }),
    siswa: one(masterSiswa, {
      fields: [studentLetterParticipants.siswaId],
      references: [masterSiswa.id],
    }),
  }),
);

export const parentConsentsRelations = relations(parentConsents, ({ one }) => ({
  siswa: one(masterSiswa, {
    fields: [parentConsents.siswaId],
    references: [masterSiswa.id],
  }),
  kelas: one(masterKelas, {
    fields: [parentConsents.kelasId],
    references: [masterKelas.id],
  }),
}));

