'use server';

import { db } from '@/db';
import { apiKeys, webhooks, automationRules } from '@/db/schema/integration';
import { digitalSignatures, signatureSigners, signatureHistories } from '@/db/schema/signature';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { requireAuth, logActivity } from '@/lib/server-action';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

// ==========================================
// API Token Management
// ==========================================
export async function createApiKey(data: { nama: string; permissions: string[] }) {
  const user = await requireAuth();

  // Generate token: "sk_live_" + 32 chars
  const rawToken = `sk_live_${crypto.randomBytes(16).toString('hex')}`;
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const tokenPreview = rawToken.substring(0, 12) + '...';

  try {
    const [apiKey] = await db
      .insert(apiKeys)
      .values({
        nama: data.nama,
        tokenHash,
        tokenPreview,
        permissions: data.permissions,
        createdBy: user.id,
      })
      .returning();

    revalidatePath('/pengaturan/api');

    // PENTING: rawToken HANYA DIKEMBALIKAN SEKALI INI. Tidak disimpan di DB.
    return { success: true, apiKey, rawToken };
  } catch (error: any) {
    return { error: 'Gagal membuat API Key', message: error.message };
  }
}

// ==========================================
// Webhook Management
// ==========================================
export async function createWebhook(data: { nama: string; url: string; events: string[] }) {
  const user = await requireAuth();
  const secret = `whsec_${crypto.randomBytes(16).toString('hex')}`;

  try {
    const [webhook] = await db
      .insert(webhooks)
      .values({
        nama: data.nama,
        url: data.url,
        events: data.events,
        secret,
        createdBy: user.id,
      })
      .returning();

    revalidatePath('/pengaturan/webhook');
    return { success: true, webhook };
  } catch (error: any) {
    return { error: 'Gagal membuat Webhook', message: error.message };
  }
}

// ==========================================
// Automation Engine
// ==========================================

export async function createAutomationRule(data: {
  nama: string;
  triggerEvent: string;
  conditions: unknown;
  actions: unknown;
}) {
  const user = await requireAuth();

  try {
    const [rule] = await db
      .insert(automationRules)
      .values({
        nama: data.nama,
        triggerEvent: data.triggerEvent,
        conditions: data.conditions,
        actions: data.actions,
        createdBy: user.id,
      })
      .returning();

    revalidatePath('/pengaturan/automasi');
    return { success: true, rule };
  } catch (error: any) {
    return { error: 'Gagal membuat Automation Rule', message: error.message };
  }
}

// ==========================================
// Digital Signature Engine
// ==========================================
export async function generateSignatureRequest(data: {
  entityType: string;
  entityId: string;
  signers: string[];
  tipe: string;
}) {
  const user = await requireAuth();

  try {
    const result = await db.transaction(async (tx) => {
      const [signature] = await tx
        .insert(digitalSignatures)
        .values({
          entityType: data.entityType,
          outgoingLetterId: data.entityType === 'OUTGOING' ? data.entityId : null,
          tipe: data.tipe,
          status: 'WAITING',
        })
        .returning();

      for (let i = 0; i < data.signers.length; i++) {
        await tx.insert(signatureSigners).values({
          signatureId: signature.id,
          signerId: data.signers[i],
          urutan: i + 1,
          status: 'WAITING',
        });
      }

      await tx.insert(signatureHistories).values({
        signatureId: signature.id,
        aktorId: user.id,
        aksi: 'REQUEST_CREATED',
        deskripsi: `Permintaan tanda tangan (${data.tipe}) dibuat untuk ${data.signers.length} penandatangan.`,
      });

      return signature;
    });

    revalidatePath('/tanda-tangan');
    return { success: true, data: result };
  } catch (error: any) {
    return { error: 'Gagal membuat Signature Request', message: error.message };
  }
}
