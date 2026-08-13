import { z } from 'zod';
import * as schemas from '../schemas';

// Ekspor Typescript Interfaces dari Zod Schemas

export type InsertMasterSekolah = z.infer<typeof schemas.insertMasterSekolahSchema>;
export type MasterSekolah = z.infer<typeof schemas.selectMasterSekolahSchema>;

export type InsertMasterUnitKerja = z.infer<typeof schemas.insertMasterUnitKerjaSchema>;
export type MasterUnitKerja = z.infer<typeof schemas.selectMasterUnitKerjaSchema>;

export type InsertMasterJabatan = z.infer<typeof schemas.insertMasterJabatanSchema>;
export type MasterJabatan = z.infer<typeof schemas.selectMasterJabatanSchema>;

export type InsertMasterPegawai = z.infer<typeof schemas.insertMasterPegawaiSchema>;
export type MasterPegawai = z.infer<typeof schemas.selectMasterPegawaiSchema>;

export type InsertMasterPenandatangan = z.infer<typeof schemas.insertMasterPenandatanganSchema>;
export type MasterPenandatangan = z.infer<typeof schemas.selectMasterPenandatanganSchema>;

export type InsertMasterJenisSurat = z.infer<typeof schemas.insertMasterJenisSuratSchema>;
export type MasterJenisSurat = z.infer<typeof schemas.selectMasterJenisSuratSchema>;

export type InsertMasterKlasifikasiSurat = z.infer<typeof schemas.insertMasterKlasifikasiSuratSchema>;
export type MasterKlasifikasiSurat = z.infer<typeof schemas.selectMasterKlasifikasiSuratSchema>;

export type InsertMappingJenisKlasifikasi = z.infer<typeof schemas.insertMappingJenisKlasifikasiSchema>;
export type MappingJenisKlasifikasi = z.infer<typeof schemas.selectMappingJenisKlasifikasiSchema>;

export type InsertMasterPrioritas = z.infer<typeof schemas.insertMasterPrioritasSchema>;
export type MasterPrioritas = z.infer<typeof schemas.selectMasterPrioritasSchema>;

export type InsertMasterSifatSurat = z.infer<typeof schemas.insertMasterSifatSuratSchema>;
export type MasterSifatSurat = z.infer<typeof schemas.selectMasterSifatSuratSchema>;

export type InsertMasterInstansi = z.infer<typeof schemas.insertMasterInstansiSchema>;
export type MasterInstansi = z.infer<typeof schemas.selectMasterInstansiSchema>;

export type InsertMasterPlaceholder = z.infer<typeof schemas.insertMasterPlaceholderSchema>;
export type MasterPlaceholder = z.infer<typeof schemas.selectMasterPlaceholderSchema>;

export type InsertKonfigurasiSistem = z.infer<typeof schemas.insertKonfigurasiSistemSchema>;
export type KonfigurasiSistem = z.infer<typeof schemas.selectKonfigurasiSistemSchema>;
