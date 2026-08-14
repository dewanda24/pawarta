'use server';

import { db } from '@/db';
import { documentTemplates, templateVersions, masterPlaceholder } from '@/db/schema';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { eq, desc } from 'drizzle-orm';
import { renderContent, validatePlaceholders } from './placeholder';
import { requireAuth } from '@/lib/server-action';

// ==========================================
// 1. Template Engine Services
// ==========================================

export async function getTemplateWithVersion(templateId: string, versionId?: string) {
  try {
    await requireAuth();
    const template = await db.query.documentTemplates.findFirst({
      where: eq(documentTemplates.id, templateId),
      with: {
        jenisSurat: true,
      },
    });

    if (!template) throw new Error('Template tidak ditemukan');

    const targetVersionId = versionId || template.versiAktifId;
    if (!targetVersionId) throw new Error('Tidak ada versi aktif untuk template ini');

    const version = await db.query.templateVersions.findFirst({
      where: eq(templateVersions.id, targetVersionId),
      with: {
        header: true,
        footer: true,
      },
    });

    return { success: true, data: { template, version } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==========================================
// 2. Testing & Validation (Dummy Generator)
// ==========================================

export async function testRenderTemplate(kontenHtml: string) {
  try {
    await requireAuth();
    // Ambil master placeholder dari database untuk memastikan key valid
    const masterKeys = await db.query.masterPlaceholder.findMany({
      where: eq(masterPlaceholder.isAktif, true),
    });

    const allowedKeys = masterKeys.map((k) => k.key);

    // 1. Validasi
    const validation = validatePlaceholders(kontenHtml, allowedKeys);

    // 2. Generate Dummy Data untuk render
    const dummyData: Record<string, string> = {};
    masterKeys.forEach((k) => {
      dummyData[k.key] = `[Dummy ${k.nama}]`;
    });

    // 3. Eksekusi Render (Simulation)
    const renderedHtml = renderContent(kontenHtml, dummyData);

    return {
      success: true,
      validation,
      renderedHtml,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
