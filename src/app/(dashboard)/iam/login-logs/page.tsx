import { db } from '@/db';
import { loginLogs, users } from '@/db/schema/iam';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '@/lib/server-action';
import { LoginLogsClient } from './LoginLogsClient';

export const metadata = {
  title: 'Log Login Pengguna | PAWARTA',
};

export default async function LoginLogsPage() {
  await requireAuth('IAM_LOGIN_LOG_READ');

  const logs = await db
    .select({
      id: loginLogs.id,
      aktivitas: loginLogs.aktivitas,
      ipAddress: loginLogs.ipAddress,
      userAgent: loginLogs.userAgent,
      status: loginLogs.status,
      keterangan: loginLogs.keterangan,
      createdAt: loginLogs.createdAt,
      namaUser: users.nama,
      username: users.username,
      email: users.email,
    })
    .from(loginLogs)
    .leftJoin(users, eq(loginLogs.userId, users.id))
    .orderBy(desc(loginLogs.createdAt))
    .limit(200);

  return <LoginLogsClient initialLogs={logs as any} />;
}
