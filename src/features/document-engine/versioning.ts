'use server';

import { db } from '@/db';
import { documentTemplates, templateVersions } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAuth, logActivity } from '@/lib/server-action';

/**
 * Menciptakan versi baru setiap kali template disimpan.
 * Menghindari penulisan ulang pada versi lama (Immutability Concept).
 */
export async function createNewVersion(
  templateId: string, 
  kontenHtml: string, 
  pengaturanKertas: any,
  catatanPerubahan: string = 'Autosave'
) {
  try {
    const user = await requireAuth();
    // 1. Cari versi terakhir untuk menentukan penomoran vX.X
    const lastVersions = await db.query.templateVersions.findMany({
      where: eq(templateVersions.templateId, templateId),
      orderBy: [desc(templateVersions.createdAt)],
      limit: 1
    });

    let newVersionNumber = 'v1.0';
    if (lastVersions.length > 0) {
      const lastNumber = parseFloat(lastVersions[0].nomorVersi.replace('v', ''));
      newVersionNumber = `v${(lastNumber + 0.1).toFixed(1)}`;
    }

    // 2. Insert versi baru
    const [newVersion] = await db.insert(templateVersions).values({
      templateId,
      nomorVersi: newVersionNumber,
      kontenHtml,
      pengaturanKertas,
      status: 'Draft',
      catatanPerubahan
    }).returning();

    await logActivity({
      userId: user.id!,
      action: 'CREATE_VERSION',
      entityType: 'TEMPLATE_VERSION',
      entityId: newVersion.id,
      details: { templateId, version: newVersionNumber }
    });

    return { success: true, data: newVersion };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Publish Workflow: 
 * Menjadikan versi spesifik sebagai "Published" dan "Versi Aktif" di master template.
 */
export async function publishTemplateVersion(templateId: string, versionId: string) {
  try {
    const user = await requireAuth();
    // 1. Set semua versi menjadi Archived
    await db.update(templateVersions)
      .set({ status: 'Archived' })
      .where(eq(templateVersions.templateId, templateId));
    
    // 2. Set versi target menjadi Published
    await db.update(templateVersions)
      .set({ status: 'Published' })
      .where(eq(templateVersions.id, versionId));

    // 3. Update master template untuk menggunakan versi aktif ini
    await db.update(documentTemplates)
      .set({ versiAktifId: versionId })
      .where(eq(documentTemplates.id, templateId));

    await logActivity({
      userId: user.id!,
      action: 'PUBLISH_VERSION',
      entityType: 'DOCUMENT_TEMPLATE',
      entityId: templateId,
      details: { publishedVersionId: versionId }
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Memulihkan (Restore) versi lama untuk dijadikan basis Draft baru
 */
export async function restoreVersion(templateId: string, versionIdToRestore: string) {
  try {
    await requireAuth();
    const oldVersion = await db.query.templateVersions.findFirst({
      where: eq(templateVersions.id, versionIdToRestore)
    });

    if (!oldVersion) throw new Error('Versi tidak ditemukan');

    // Buat draft baru dari konten lama
    return await createNewVersion(
      templateId, 
      oldVersion.kontenHtml, 
      oldVersion.pengaturanKertas, 
      `Restored from ${oldVersion.nomorVersi}`
    );
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
