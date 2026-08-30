import { db } from '@/db';
import { activityLogs, users } from '@/db/schema';
import { requireAuth } from '@/lib/server-action';
import { eq, desc } from 'drizzle-orm';
import { ActivityLogsClient } from './ActivityLogsClient';

export const metadata = {
  title: 'Activity Log Sistem | PAWARTA',
};

export default async function ActivityLogsPage() {
  await requireAuth('SISTEM_LOG_READ');

  const logs = await db
    .select({
      id: activityLogs.id,
      aksi: activityLogs.aksi,
      modul: activityLogs.modul,
      detailAktivitas: activityLogs.detailAktivitas,
      ipAddress: activityLogs.ipAddress,
      metadata: activityLogs.metadata,
      createdAt: activityLogs.createdAt,
      aktorNama: users.nama,
      aktorUsername: users.username,
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .orderBy(desc(activityLogs.createdAt))
    .limit(200);

  return <ActivityLogsClient initialLogs={logs as any} />;
}
