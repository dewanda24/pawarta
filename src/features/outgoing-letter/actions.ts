'use server';

import { db } from '@/db';
import { outgoingLetters, outgoingLetterVersions } from '@/db/schema/outgoing-letter';
import { workflowInstances, workflowSteps } from '@/db/schema/workflow';
import { requireAuth, logActivity } from '@/lib/server-action';
import { outgoingLetterSchema, OutgoingLetterFormValues } from './validations';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createOutgoingDraft(data: OutgoingLetterFormValues) {
  const user = await requireAuth();

  const validatedFields = outgoingLetterSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      error: 'Data tidak valid',
      details: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await db.transaction(async (tx) => {
      // 1. Create Letter
      const [newLetter] = await tx
        .insert(outgoingLetters)
        .values({
          ...validatedFields.data,
          pembuatId: user.id,
          status: 'DRAFT',
          createdBy: user.id,
        })
        .returning();

      // 2. Create initial Version (Empty HTML for now)
      await tx.insert(outgoingLetterVersions).values({
        suratId: newLetter.id,
        versi: 'v1.0',
        kontenHtml: '<p>Ketik draf surat di sini...</p>',
        dataPlaceholder: {},
        createdBy: user.id,
      });

      // 3. Init Workflow (Find Draft Step)
      const [draftStep] = await tx
        .select()
        .from(workflowSteps)
        .where(eq(workflowSteps.kodeStatus, 'DRAFT'));
      if (draftStep) {
        await tx.insert(workflowInstances).values({
          entityType: 'SURAT_KELUAR',
          entityId: newLetter.id,
          currentStepId: draftStep.id,
          assignedUserId: user.id, // Bola di pembuat
          statusKondisi: 'PENDING',
          createdBy: user.id,
        });
      }

      await logActivity({
        userId: user.id,
        action: 'CREATE',
        entityType: 'outgoing_letters',
        entityId: newLetter.id,
        details: { deskripsi: 'Membuat draf surat keluar baru' },
      });

      return newLetter;
    });

    revalidatePath('/surat-keluar');
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error createOutgoingDraft:', error);
    return { error: 'Gagal membuat draf surat', message: error.message };
  }
}

export async function deleteOutgoingLetter(id: string) {
  const user = await requireAuth();

  try {
    await db.transaction(async (tx) => {
      // Soft Delete
      await tx
        .update(outgoingLetters)
        .set({
          deletedAt: new Date(),
        })
        .where(eq(outgoingLetters.id, id));

      await logActivity({
        userId: user.id,
        action: 'DELETE',
        entityType: 'outgoing_letters',
        entityId: id,
        details: { deskripsi: 'Menghapus surat keluar' },
      });
    });

    revalidatePath('/surat-keluar');
    return { success: true };
  } catch (error: any) {
    return { error: 'Gagal menghapus surat', message: error.message };
  }
}
