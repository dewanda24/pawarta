'use server';

import { db } from '@/db';
import { outgoingLetters } from '@/db/schema/outgoing-letter';
import { incomingDispositions, incomingLetters } from '@/db/schema/incoming-letter';
import { studentLetters } from '@/db/schema/student-letter';
import { requireAuth } from '@/lib/server-action';
import { eq, and, isNull, or, desc, lt } from 'drizzle-orm';

export interface WorkQueueItem {
  id: string;
  type: 'PERSETUJUAN' | 'TANDA_TANGAN' | 'DISPOSISI' | 'REVISI';
  title: string;
  subtitle: string;
  date: string;
  priority?: string;
  isOverdue?: boolean;
  linkUrl: string;
  badgeText: string;
  badgeVariant: 'red' | 'amber' | 'blue' | 'purple';
}

export interface WorkQueueSummary {
  totalTasks: number;
  menungguPersetujuanCount: number;
  menungguTtdCount: number;
  disposisiAktifCount: number;
  revisiCount: number;
  overdueCount: number;
  items: WorkQueueItem[];
}

export async function getMyWorkQueue(): Promise<{ success: boolean; data?: WorkQueueSummary; error?: string }> {
  try {
    const user = await requireAuth();
    const userId = user.id;

    // 1. Ambil Disposisi Aktif yang ditujukan ke User ini
    const myDispositions = await db.query.incomingDispositions.findMany({
      where: and(
        eq(incomingDispositions.penerimaDisposisiId, userId),
        or(eq(incomingDispositions.status, 'MENUNGGU'), eq(incomingDispositions.status, 'PROSES')),
      ),
      with: {
        surat: true,
        pemberiDisposisi: true,
      },
      orderBy: [desc(incomingDispositions.createdAt)],
    });

    // 2. Ambil Surat Keluar yang Menunggu Persetujuan
    const lettersToApprove = await db.query.outgoingLetters.findMany({
      where: and(
        isNull(outgoingLetters.deletedAt),
        or(eq(outgoingLetters.status, 'DIAJUKAN'), eq(outgoingLetters.status, 'DIPERIKSA')),
      ),
      with: {
        pembuat: true,
        jenisSurat: true,
      },
      orderBy: [desc(outgoingLetters.createdAt)],
    });

    // 3. Ambil Surat Keluar yang Menunggu Tanda Tangan
    const lettersToSign = await db.query.outgoingLetters.findMany({
      where: and(
        isNull(outgoingLetters.deletedAt),
        eq(outgoingLetters.status, 'APPROVED'),
        isNull(outgoingLetters.signedAt),
      ),
      with: {
        jenisSurat: true,
        penandatangan: true,
      },
      orderBy: [desc(outgoingLetters.createdAt)],
    });

    // 4. Ambil Surat Keluar milik user yang perlu Direvisi
    const lettersToRevise = await db.query.outgoingLetters.findMany({
      where: and(
        isNull(outgoingLetters.deletedAt),
        eq(outgoingLetters.pembuatId, userId),
        eq(outgoingLetters.status, 'REVISI'),
      ),
      with: {
        jenisSurat: true,
      },
      orderBy: [desc(outgoingLetters.updatedAt)],
    });

    const now = new Date();
    const items: WorkQueueItem[] = [];

    // Format Disposisi Items
    myDispositions.forEach((disp) => {
      const isOverdue = disp.deadline ? new Date(disp.deadline) < now : false;
      items.push({
        id: disp.id,
        type: 'DISPOSISI',
        title: disp.surat?.perihal || 'Disposisi Surat Masuk',
        subtitle: `Instruksi: "${disp.instruksi}" • Dari: ${disp.pemberiDisposisi?.nama || 'Atasan'}`,
        date: disp.deadline ? `Deadline: ${new Date(disp.deadline).toLocaleDateString('id-ID')}` : 'Tanpa Deadline',
        isOverdue,
        linkUrl: `/disposisi-saya`,
        badgeText: isOverdue ? 'Terlambat' : disp.status,
        badgeVariant: isOverdue ? 'red' : 'blue',
      });
    });

    // Format Persetujuan Items
    lettersToApprove.forEach((l) => {
      items.push({
        id: l.id,
        type: 'PERSETUJUAN',
        title: l.perihal,
        subtitle: `${l.jenisSurat?.nama || 'Surat Keluar'} • Konseptor: ${l.pembuat?.nama || 'Staf'}`,
        date: l.tanggalSurat ? new Date(l.tanggalSurat).toLocaleDateString('id-ID') : 'Draft',
        linkUrl: `/surat-keluar/${l.id}`,
        badgeText: 'Menunggu Persetujuan',
        badgeVariant: 'red',
      });
    });

    // Format Tanda Tangan Items
    lettersToSign.forEach((l) => {
      items.push({
        id: l.id,
        type: 'TANDA_TANGAN',
        title: l.perihal,
        subtitle: `Tujuan: ${l.tujuanSurat} • No: ${l.nomorSurat || 'Siap TTE'}`,
        date: l.tanggalSurat ? new Date(l.tanggalSurat).toLocaleDateString('id-ID') : 'Hari ini',
        linkUrl: `/surat-keluar/${l.id}`,
        badgeText: 'Siap Tanda Tangan',
        badgeVariant: 'purple',
      });
    });

    // Format Revisi Items
    lettersToRevise.forEach((l) => {
      items.push({
        id: l.id,
        type: 'REVISI',
        title: l.perihal,
        subtitle: `Catatan: ${l.catatanTambahan || 'Perlu perbaikan sebelum diajukan kembali'}`,
        date: 'Perlu Revisi',
        linkUrl: `/surat-keluar/${l.id}`,
        badgeText: 'Revisi',
        badgeVariant: 'amber',
      });
    });

    const overdueCount = myDispositions.filter((d) => d.deadline && new Date(d.deadline) < now).length;

    const summary: WorkQueueSummary = {
      totalTasks: items.length,
      menungguPersetujuanCount: lettersToApprove.length,
      menungguTtdCount: lettersToSign.length,
      disposisiAktifCount: myDispositions.length,
      revisiCount: lettersToRevise.length,
      overdueCount,
      items,
    };

    return { success: true, data: summary };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal mengambil antrean tugas';
    return { success: false, error: msg };
  }
}
