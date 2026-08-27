'use server';

import { db } from '@/db';
import {
  documentTemplates,
  templateVersions,
  templateCategories,
  documentHeaders,
  documentFooters,
} from '@/db/schema/document';
import { masterJenisSurat, masterSekolah, masterPegawai } from '@/db/schema/master';
import { eq, desc, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { requireAuth, logActivity } from '@/lib/server-action';
import {
  DocumentTemplateInput,
  PaperSettings,
  DEFAULT_PAPER_SETTINGS,
} from '../types/template-surat';

/**
 * Mendapatkan semua daftar template dokumen beserta relasi kategori dan versi aktif.
 */
export async function getDocumentTemplatesList() {
  try {
    await requireAuth('MASTER_SEKOLAH_READ');

    const templates = await db.query.documentTemplates.findMany({
      orderBy: [desc(documentTemplates.createdAt)],
      with: {
        kategori: true,
        jenisSurat: true,
        versions: {
          orderBy: [desc(templateVersions.createdAt)],
        },
      },
    });

    const formatted = templates.map((t) => {
      const activeVersion =
        t.versions.find((v) => v.id === t.versiAktifId) || t.versions[0] || null;

      return {
        id: t.id,
        kode: t.kode,
        nama: t.nama,
        kategoriId: t.kategoriId,
        jenisSuratId: t.jenisSuratId,
        deskripsi: t.deskripsi,
        versiAktifId: t.versiAktifId,
        isAktif: t.isAktif,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        kategori: t.kategori,
        jenisSurat: t.jenisSurat,
        versiAktif: activeVersion
          ? {
              id: activeVersion.id,
              nomorVersi: activeVersion.nomorVersi,
              kontenHtml: activeVersion.kontenHtml,
              headerId: activeVersion.headerId,
              footerId: activeVersion.footerId,
              pengaturanKertas:
                (activeVersion.pengaturanKertas as PaperSettings) || DEFAULT_PAPER_SETTINGS,
              status: activeVersion.status,
            }
          : null,
      };
    });

    return { success: true, data: formatted };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal mengambil data template dokumen';
    return { success: false, error: msg };
  }
}

/**
 * Mendapatkan detail satu template dokumen berdasarkan ID
 */
export async function getDocumentTemplateById(id: string) {
  try {
    await requireAuth('MASTER_SEKOLAH_READ');

    const template = await db.query.documentTemplates.findFirst({
      where: eq(documentTemplates.id, id),
      with: {
        kategori: true,
        jenisSurat: true,
        versions: {
          orderBy: [desc(templateVersions.createdAt)],
        },
      },
    });

    if (!template) {
      return { success: false, error: 'Template tidak ditemukan' };
    }

    const activeVersion =
      template.versions.find((v) => v.id === template.versiAktifId) || template.versions[0] || null;

    const [header, footer, headersList, jenisSuratList, kategoriList, sekolah, kepsek] =
      await Promise.all([
        activeVersion?.headerId
          ? db.query.documentHeaders.findFirst({
              where: eq(documentHeaders.id, activeVersion.headerId),
            })
          : db.query.documentHeaders.findFirst({
              where: and(eq(documentHeaders.isDefault, true), eq(documentHeaders.isAktif, true)),
            }),
        activeVersion?.footerId
          ? db.query.documentFooters.findFirst({
              where: eq(documentFooters.id, activeVersion.footerId),
            })
          : null,
        db.query.documentHeaders.findMany({
          where: eq(documentHeaders.isAktif, true),
        }),
        db.query.masterJenisSurat.findMany({
          where: eq(masterJenisSurat.isAktif, true),
        }),
        db.query.templateCategories.findMany({
          where: eq(templateCategories.isAktif, true),
        }),
        db.query.masterSekolah.findFirst({
          where: eq(masterSekolah.isAktif, true),
        }),
        db.query.masterPegawai.findFirst({
          where: eq(masterPegawai.isAktif, true),
        }),
      ]);

    return {
      success: true,
      data: {
        id: template.id,
        kode: template.kode,
        nama: template.nama,
        kategoriId: template.kategoriId,
        jenisSuratId: template.jenisSuratId,
        deskripsi: template.deskripsi,
        versiAktifId: template.versiAktifId,
        isAktif: template.isAktif,
        kategori: template.kategori,
        jenisSurat: template.jenisSurat,
        versiAktif: activeVersion
          ? {
              id: activeVersion.id,
              nomorVersi: activeVersion.nomorVersi,
              kontenHtml: activeVersion.kontenHtml,
              headerId: activeVersion.headerId,
              footerId: activeVersion.footerId,
              pengaturanKertas:
                (activeVersion.pengaturanKertas as PaperSettings) || DEFAULT_PAPER_SETTINGS,
              status: activeVersion.status,
            }
          : null,
      },
      header,
      footer,
      headersList,
      jenisSuratList,
      kategoriList,
      sekolah,
      kepsek,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal mengambil detail template';
    return { success: false, error: msg };
  }
}

/**
 * Mengambil data pendukung untuk membuat/mendesain template baru (Headers, Jenis Surat, Kategori, Profil Sekolah)
 */
export async function getTemplateDesignerMeta() {
  try {
    await requireAuth('MASTER_SEKOLAH_READ');

    const [headersList, jenisSuratList, kategoriList, sekolah, kepsek, defaultHeader] =
      await Promise.all([
        db.query.documentHeaders.findMany({
          where: eq(documentHeaders.isAktif, true),
          orderBy: [desc(documentHeaders.isDefault), desc(documentHeaders.createdAt)],
        }),
        db.query.masterJenisSurat.findMany({
          where: eq(masterJenisSurat.isAktif, true),
          orderBy: [masterJenisSurat.nama],
        }),
        db.query.templateCategories.findMany({
          where: eq(templateCategories.isAktif, true),
          orderBy: [templateCategories.nama],
        }),
        db.query.masterSekolah.findFirst({
          where: eq(masterSekolah.isAktif, true),
        }),
        db.query.masterPegawai.findFirst({
          where: eq(masterPegawai.isAktif, true),
        }),
        db.query.documentHeaders.findFirst({
          where: and(eq(documentHeaders.isDefault, true), eq(documentHeaders.isAktif, true)),
        }),
      ]);

    return {
      success: true,
      data: {
        headersList,
        jenisSuratList,
        kategoriList,
        sekolah,
        kepsek,
        defaultHeader: defaultHeader || headersList[0] || null,
      },
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal memuat metadata template';
    return { success: false, error: msg };
  }
}

/**
 * Menyimpan atau memperbarui template dokumen beserta versi dan pengaturan kertas / marginnya
 */
export async function saveDocumentTemplate(input: DocumentTemplateInput) {
  try {
    const user = await requireAuth('MASTER_SEKOLAH_UPDATE');

    let templateId = input.id;

    if (templateId) {
      // 1. Update master template
      await db
        .update(documentTemplates)
        .set({
          kode: input.kode,
          nama: input.nama,
          kategoriId: input.kategoriId || null,
          jenisSuratId: input.jenisSuratId,
          deskripsi: input.deskripsi || null,
          isAktif: input.isAktif ?? true,
          updatedBy: user.id,
          updatedAt: new Date(),
        })
        .where(eq(documentTemplates.id, templateId));

      // 2. Insert new version / update active version
      const existingVersion = await db.query.templateVersions.findFirst({
        where: eq(templateVersions.templateId, templateId),
        orderBy: [desc(templateVersions.createdAt)],
      });

      if (existingVersion) {
        await db
          .update(templateVersions)
          .set({
            kontenHtml: input.kontenHtml || existingVersion.kontenHtml,
            headerId: input.headerId || existingVersion.headerId,
            footerId: input.footerId || existingVersion.footerId,
            pengaturanKertas: input.pengaturanKertas,
            updatedBy: user.id,
            updatedAt: new Date(),
          })
          .where(eq(templateVersions.id, existingVersion.id));
      } else {
        const [newVersion] = await db
          .insert(templateVersions)
          .values({
            templateId,
            nomorVersi: 'v1.0',
            kontenHtml: input.kontenHtml || '<p>Isi template surat...</p>',
            headerId: input.headerId || null,
            footerId: input.footerId || null,
            pengaturanKertas: input.pengaturanKertas,
            status: 'Published',
            createdBy: user.id,
          })
          .returning();

        await db
          .update(documentTemplates)
          .set({ versiAktifId: newVersion.id })
          .where(eq(documentTemplates.id, templateId));
      }

      await logActivity({
        userId: user.id,
        action: 'UPDATE',
        entityType: 'DOCUMENT_TEMPLATE',
        entityId: templateId,
        details: { deskripsi: `Memperbarui template ${input.nama} (${input.kode})` },
      });
    } else {
      // Create new template and version
      const [newTemplate] = await db
        .insert(documentTemplates)
        .values({
          kode: input.kode,
          nama: input.nama,
          kategoriId: input.kategoriId || null,
          jenisSuratId: input.jenisSuratId,
          deskripsi: input.deskripsi || null,
          isAktif: input.isAktif ?? true,
          createdBy: user.id,
        })
        .returning();

      templateId = newTemplate.id;

      const [newVersion] = await db
        .insert(templateVersions)
        .values({
          templateId: newTemplate.id,
          nomorVersi: 'v1.0',
          kontenHtml: input.kontenHtml || '<p>Isi surat...</p>',
          headerId: input.headerId || null,
          footerId: input.footerId || null,
          pengaturanKertas: input.pengaturanKertas,
          status: 'Published',
          createdBy: user.id,
        })
        .returning();

      await db
        .update(documentTemplates)
        .set({ versiAktifId: newVersion.id })
        .where(eq(documentTemplates.id, newTemplate.id));

      await logActivity({
        userId: user.id,
        action: 'CREATE',
        entityType: 'DOCUMENT_TEMPLATE',
        entityId: newTemplate.id,
        details: { deskripsi: `Membuat template baru ${input.nama} (${input.kode})` },
      });
    }

    revalidatePath('/master/template-surat');
    revalidatePath('/surat-keluar');
    revalidatePath('/surat-siswa');

    return { success: true, data: { id: templateId } };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal menyimpan template surat';
    return { success: false, error: msg };
  }
}

/**
 * Menghapus template surat
 */
export async function deleteDocumentTemplate(id: string) {
  try {
    const user = await requireAuth('MASTER_SEKOLAH_DELETE');

    const template = await db.query.documentTemplates.findFirst({
      where: eq(documentTemplates.id, id),
    });

    if (!template) {
      return { success: false, error: 'Template tidak ditemukan' };
    }

    await db.delete(documentTemplates).where(eq(documentTemplates.id, id));

    await logActivity({
      userId: user.id,
      action: 'DELETE',
      entityType: 'DOCUMENT_TEMPLATE',
      entityId: id,
      details: { deskripsi: `Menghapus template ${template.nama} (${template.kode})` },
    });

    revalidatePath('/master/template-surat');
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal menghapus template';
    return { success: false, error: msg };
  }
}
