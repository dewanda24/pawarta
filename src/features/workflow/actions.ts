'use server';

import { db } from '@/db';
import { workflowInstances, workflowSteps, workflowHistories } from '@/db/schema/workflow';
import { outgoingLetters } from '@/db/schema/outgoing-letter';
import { requireAuth, logActivity } from '@/lib/server-action';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// Fungsi generic untuk submit surat ke step selanjutnya
export async function submitWorkflow(instanceId: string, action: string, catatan: string = '') {
  const user = await requireAuth();

  try {
    const result = await db.transaction(async (tx) => {
      // 1. Dapatkan Instance saat ini
      const [instance] = await tx
        .select()
        .from(workflowInstances)
        .where(eq(workflowInstances.id, instanceId));

      if (!instance) throw new Error('Workflow tidak ditemukan');

      // 2. Dapatkan Step saat ini
      const [currentStep] = await tx
        .select()
        .from(workflowSteps)
        .where(eq(workflowSteps.id, instance.currentStepId));

      // 3. Tentukan Next Step berdasarkan action (Sederhana: cari step dengan urutan + 1)
      let nextStep;
      if (action === 'APPROVE' || action === 'SUBMIT') {
        [nextStep] = await tx
          .select()
          .from(workflowSteps)
          .where(eq(workflowSteps.urutan, currentStep.urutan + 1));
      } else if (action === 'REJECT') {
        // Kembali ke draft atau end
        [nextStep] = await tx
          .select()
          .from(workflowSteps)
          .where(eq(workflowSteps.kodeStatus, 'DRAFT'));
      }

      if (!nextStep) throw new Error('Step selanjutnya tidak ditemukan');

      // 4. Catat ke History
      await tx.insert(workflowHistories).values({
        instanceId,
        fromStepId: currentStep.id,
        toStepId: nextStep.id,
        actorId: user.id,
        action,
        catatan,
        createdBy: user.id,
      });

      // 5. Update Instance
      await tx
        .update(workflowInstances)
        .set({
          currentStepId: nextStep.id,
          updatedAt: new Date(),
          updatedBy: user.id,
        })
        .where(eq(workflowInstances.id, instanceId));

      // 6. Sinkronisasi status di Entity (Surat Keluar)
      if (instance.entityType === 'SURAT_KELUAR') {
        await tx
          .update(outgoingLetters)
          .set({ status: nextStep.kodeStatus })
          .where(eq(outgoingLetters.id, instance.entityId));
      }

      await logActivity({
        userId: user.id,
        action: 'UPDATE',
        entityType: 'workflow_instances',
        entityId: instanceId,
        details: { deskripsi: `Workflow Action: ${action}` }
      });
      return nextStep;
    });

    revalidatePath('/surat-keluar');
    return { success: true, data: result };
  } catch (error: any) {
    return { error: 'Gagal memproses workflow', message: error.message };
  }
}
