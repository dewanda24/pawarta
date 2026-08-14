import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import * as schemas from '@/db/schema';

// Helper type untuk menghilangkan audit fields pada form insert
type OmitAudit<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'createdBy' | 'updatedBy'>;

// ==========================================
// Typescript Interfaces
// ==========================================

export type MasterSekolah = InferSelectModel<typeof schemas.masterSekolah>;
export type InsertMasterSekolah = OmitAudit<InferInsertModel<typeof schemas.masterSekolah>>;

export type MasterUnitKerja = InferSelectModel<typeof schemas.masterUnitKerja>;
export type InsertMasterUnitKerja = OmitAudit<InferInsertModel<typeof schemas.masterUnitKerja>>;

export type MasterJabatan = InferSelectModel<typeof schemas.masterJabatan>;
export type InsertMasterJabatan = OmitAudit<InferInsertModel<typeof schemas.masterJabatan>>;

export type MasterPegawai = InferSelectModel<typeof schemas.masterPegawai>;
export type InsertMasterPegawai = OmitAudit<InferInsertModel<typeof schemas.masterPegawai>>;

export type MasterPenandatangan = InferSelectModel<typeof schemas.masterPenandatangan>;
export type InsertMasterPenandatangan = OmitAudit<InferInsertModel<typeof schemas.masterPenandatangan>>;

export type MasterJenisSurat = InferSelectModel<typeof schemas.masterJenisSurat>;
export type InsertMasterJenisSurat = OmitAudit<InferInsertModel<typeof schemas.masterJenisSurat>>;

export type MasterKlasifikasiSurat = InferSelectModel<typeof schemas.masterKlasifikasiSurat>;
export type InsertMasterKlasifikasiSurat = OmitAudit<InferInsertModel<typeof schemas.masterKlasifikasiSurat>>;

export type MappingJenisKlasifikasi = InferSelectModel<typeof schemas.mappingJenisKlasifikasi>;
export type InsertMappingJenisKlasifikasi = OmitAudit<InferInsertModel<typeof schemas.mappingJenisKlasifikasi>>;

export type MasterPrioritas = InferSelectModel<typeof schemas.masterPrioritas>;
export type InsertMasterPrioritas = OmitAudit<InferInsertModel<typeof schemas.masterPrioritas>>;

export type MasterSifatSurat = InferSelectModel<typeof schemas.masterSifatSurat>;
export type InsertMasterSifatSurat = OmitAudit<InferInsertModel<typeof schemas.masterSifatSurat>>;

export type MasterInstansi = InferSelectModel<typeof schemas.masterInstansi>;
export type InsertMasterInstansi = OmitAudit<InferInsertModel<typeof schemas.masterInstansi>>;

export type MasterPlaceholder = InferSelectModel<typeof schemas.masterPlaceholder>;
export type InsertMasterPlaceholder = OmitAudit<InferInsertModel<typeof schemas.masterPlaceholder>>;

export type KonfigurasiSistem = InferSelectModel<typeof schemas.konfigurasiSistem>;
export type InsertKonfigurasiSistem = OmitAudit<InferInsertModel<typeof schemas.konfigurasiSistem>>;
