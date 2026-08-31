'use server';

import { db } from '@/db';
import { documentHeaders } from '@/db/schema/document';
import { eq, desc, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { requireAuth, logActivity } from '@/lib/server-action';

export interface DocumentHeaderInput {
  namaKop: string;
  logoUrl?: string | null;
  logoKiriUrl?: string | null;
  logoKananUrl?: string | null;
  instansiUtama?: string | null;
  instansiInduk?: string | null;
  namaSekolah?: string | null;
  alamat?: string | null;
  kontak?: string | null;
  website?: string | null;
  tipeGaris?: string | null;
  fontSizeInstansiUtama?: number | null;
  fontSizeInstansiInduk?: number | null;
  fontSizeNamaSekolah?: number | null;
  fontSizeAlamat?: number | null;
  fontSizeKontak?: number | null;
  isDefault?: boolean;
  isAktif?: boolean;
}

export async function getDocumentHeadersList() {
  try {
    await requireAuth('MASTER_SEKOLAH_READ');
    const data = await db.query.documentHeaders.findMany({
      orderBy: [desc(documentHeaders.isDefault), desc(documentHeaders.createdAt)],
    });
    return { success: true, data };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal mengambil data kop surat';
    return { success: false, error: msg };
  }
}

export async function getDefaultDocumentHeader() {
  try {
    const defaultHeader = await db.query.documentHeaders.findFirst({
      where: and(eq(documentHeaders.isDefault, true), eq(documentHeaders.isAktif, true)),
    });
    if (defaultHeader) return { success: true, data: defaultHeader };

    const firstActive = await db.query.documentHeaders.findFirst({
      where: eq(documentHeaders.isAktif, true),
    });
    return { success: true, data: firstActive || null };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal mengambil kop default';
    return { success: false, error: msg };
  }
}

export async function createDocumentHeader(data: DocumentHeaderInput) {
  try {
    const user = await requireAuth('MASTER_SEKOLAH_CREATE');

    if (data.isDefault) {
      await db.update(documentHeaders).set({ isDefault: false });
    }

    const [inserted] = await db
      .insert(documentHeaders)
      .values({
        namaKop: data.namaKop,
        logoUrl: data.logoKiriUrl || data.logoUrl || null,
        logoKiriUrl: data.logoKiriUrl || data.logoUrl || null,
        logoKananUrl: data.logoKananUrl || null,
        instansiUtama: data.instansiUtama || null,
        instansiInduk: data.instansiInduk || null,
        namaSekolah: data.namaSekolah || null,
        alamat: data.alamat || null,
        kontak: data.kontak || null,
        website: data.website || null,
        tipeGaris: data.tipeGaris || 'double_thick',
        fontSizeInstansiUtama: data.fontSizeInstansiUtama || 14,
        fontSizeInstansiInduk: data.fontSizeInstansiInduk || 14,
        fontSizeNamaSekolah: data.fontSizeNamaSekolah || 18,
        fontSizeAlamat: data.fontSizeAlamat || 10,
        fontSizeKontak: data.fontSizeKontak || 9,
        isDefault: data.isDefault ?? false,
        isAktif: data.isAktif ?? true,
      })
      .returning();

    await logActivity({
      userId: user.id!,
      action: 'CREATE',
      entityType: 'DOCUMENT_HEADER',
      entityId: inserted.id,
      details: { namaKop: data.namaKop },
    });

    revalidatePath('/master/kop-surat');
    revalidatePath('/surat-keluar');
    return { success: true, data: inserted };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal membuat kop surat';
    return { success: false, error: msg };
  }
}

export async function updateDocumentHeader(id: string, data: Partial<DocumentHeaderInput>) {
  try {
    const user = await requireAuth('MASTER_SEKOLAH_UPDATE');

    if (data.isDefault) {
      await db.update(documentHeaders).set({ isDefault: false });
    }

    const payload: Record<string, unknown> = { ...data };
    if (data.logoKiriUrl !== undefined) {
      payload.logoUrl = data.logoKiriUrl;
    }

    await db
      .update(documentHeaders)
      .set({
        ...payload,
        updatedAt: new Date(),
      })
      .where(eq(documentHeaders.id, id));

    await logActivity({
      userId: user.id!,
      action: 'UPDATE',
      entityType: 'DOCUMENT_HEADER',
      entityId: id,
    });

    revalidatePath('/master/kop-surat');
    revalidatePath('/surat-keluar');
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal mengubah kop surat';
    return { success: false, error: msg };
  }
}

export async function setDefaultDocumentHeader(id: string) {
  try {
    const user = await requireAuth('MASTER_SEKOLAH_UPDATE');

    await db.update(documentHeaders).set({ isDefault: false });
    await db
      .update(documentHeaders)
      .set({ isDefault: true, isAktif: true, updatedAt: new Date() })
      .where(eq(documentHeaders.id, id));

    await logActivity({
      userId: user.id!,
      action: 'SET_DEFAULT',
      entityType: 'DOCUMENT_HEADER',
      entityId: id,
    });

    revalidatePath('/master/kop-surat');
    revalidatePath('/surat-keluar');
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal menetapkan kop default';
    return { success: false, error: msg };
  }
}

export async function deleteDocumentHeader(id: string) {
  try {
    const user = await requireAuth('MASTER_SEKOLAH_DELETE');

    await db.delete(documentHeaders).where(eq(documentHeaders.id, id));

    await logActivity({
      userId: user.id!,
      action: 'DELETE',
      entityType: 'DOCUMENT_HEADER',
      entityId: id,
    });

    revalidatePath('/master/kop-surat');
    revalidatePath('/surat-keluar');
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal menghapus kop surat';
    return { success: false, error: msg };
  }
}

export async function uploadLogoFile(formData: FormData) {
  try {
    await requireAuth();
    const file = formData.get('file') as File | null;
    if (!file) {
      return { success: false, error: 'File logo wajib disediakan' };
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return { success: false, error: 'Ukuran file logo maksimal 10MB' };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { writeFile, mkdir } = await import('fs/promises');
    const { join } = await import('path');
    const { existsSync } = await import('fs');

    const uploadDir = join(process.cwd(), 'public', 'uploads', 'logos');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `logo_${timestamp}_${sanitizedName}`;
    const filePath = join(uploadDir, uniqueFileName);
    const fileUrl = `/uploads/logos/${uniqueFileName}`;

    await writeFile(filePath, buffer);

    return { success: true, url: fileUrl };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal mengunggah logo';
    return { success: false, error: msg };
  }
}
