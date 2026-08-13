import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import * as schemas from '@/db/schema';
import { z } from 'zod';

// ==========================================
// 1. Master Sekolah
// ==========================================
export const insertMasterSekolahSchema = createInsertSchema(schemas.masterSekolah).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  createdBy: true,
  updatedBy: true,
});
export const selectMasterSekolahSchema = createSelectSchema(schemas.masterSekolah);

// ==========================================
// 2. Master Unit Kerja
// ==========================================
export const insertMasterUnitKerjaSchema = createInsertSchema(schemas.masterUnitKerja).omit({
  id: true, createdAt: true, updatedAt: true, deletedAt: true, createdBy: true, updatedBy: true,
});
export const selectMasterUnitKerjaSchema = createSelectSchema(schemas.masterUnitKerja);

// ==========================================
// 3. Master Jabatan
// ==========================================
export const insertMasterJabatanSchema = createInsertSchema(schemas.masterJabatan).omit({
  id: true, createdAt: true, updatedAt: true, deletedAt: true, createdBy: true, updatedBy: true,
});
export const selectMasterJabatanSchema = createSelectSchema(schemas.masterJabatan);

// ==========================================
// 4. Master Pegawai
// ==========================================
export const insertMasterPegawaiSchema = createInsertSchema(schemas.masterPegawai).omit({
  id: true, createdAt: true, updatedAt: true, deletedAt: true, createdBy: true, updatedBy: true,
});
export const selectMasterPegawaiSchema = createSelectSchema(schemas.masterPegawai);

// ==========================================
// 5. Master Penandatangan
// ==========================================
export const insertMasterPenandatanganSchema = createInsertSchema(schemas.masterPenandatangan).omit({
  id: true, createdAt: true, updatedAt: true, deletedAt: true, createdBy: true, updatedBy: true,
});
export const selectMasterPenandatanganSchema = createSelectSchema(schemas.masterPenandatangan);

// ==========================================
// 6. Master Jenis Surat
// ==========================================
export const insertMasterJenisSuratSchema = createInsertSchema(schemas.masterJenisSurat).omit({
  id: true, createdAt: true, updatedAt: true, deletedAt: true, createdBy: true, updatedBy: true,
});
export const selectMasterJenisSuratSchema = createSelectSchema(schemas.masterJenisSurat);

// ==========================================
// 7. Master Klasifikasi Surat
// ==========================================
export const insertMasterKlasifikasiSuratSchema = createInsertSchema(schemas.masterKlasifikasiSurat).omit({
  id: true, createdAt: true, updatedAt: true, deletedAt: true, createdBy: true, updatedBy: true,
});
export const selectMasterKlasifikasiSuratSchema = createSelectSchema(schemas.masterKlasifikasiSurat);

// ==========================================
// 8. Mapping Jenis Surat -> Klasifikasi
// ==========================================
export const insertMappingJenisKlasifikasiSchema = createInsertSchema(schemas.mappingJenisKlasifikasi).omit({
  id: true, createdAt: true, updatedAt: true, deletedAt: true, createdBy: true, updatedBy: true,
});
export const selectMappingJenisKlasifikasiSchema = createSelectSchema(schemas.mappingJenisKlasifikasi);

// ==========================================
// 9. Master Prioritas
// ==========================================
export const insertMasterPrioritasSchema = createInsertSchema(schemas.masterPrioritas).omit({
  id: true, createdAt: true, updatedAt: true, deletedAt: true, createdBy: true, updatedBy: true,
});
export const selectMasterPrioritasSchema = createSelectSchema(schemas.masterPrioritas);

// ==========================================
// 10. Master Sifat Surat
// ==========================================
export const insertMasterSifatSuratSchema = createInsertSchema(schemas.masterSifatSurat).omit({
  id: true, createdAt: true, updatedAt: true, deletedAt: true, createdBy: true, updatedBy: true,
});
export const selectMasterSifatSuratSchema = createSelectSchema(schemas.masterSifatSurat);

// ==========================================
// 11. Master Instansi
// ==========================================
export const insertMasterInstansiSchema = createInsertSchema(schemas.masterInstansi).omit({
  id: true, createdAt: true, updatedAt: true, deletedAt: true, createdBy: true, updatedBy: true,
});
export const selectMasterInstansiSchema = createSelectSchema(schemas.masterInstansi);

// ==========================================
// 12. Master Placeholder
// ==========================================
export const insertMasterPlaceholderSchema = createInsertSchema(schemas.masterPlaceholder).omit({
  id: true, createdAt: true, updatedAt: true, deletedAt: true, createdBy: true, updatedBy: true,
});
export const selectMasterPlaceholderSchema = createSelectSchema(schemas.masterPlaceholder);

// ==========================================
// 13. Konfigurasi Sistem
// ==========================================
export const insertKonfigurasiSistemSchema = createInsertSchema(schemas.konfigurasiSistem).omit({
  id: true, createdAt: true, updatedAt: true, deletedAt: true, createdBy: true, updatedBy: true,
});
export const selectKonfigurasiSistemSchema = createSelectSchema(schemas.konfigurasiSistem);
