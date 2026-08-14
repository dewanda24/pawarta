import { db } from '@/db';
import { activityLogs } from '@/db/schema/workspace';
import { users } from '@/db/schema/iam';
import { eq, desc } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { columns, AuditLog } from './columns';

export const metadata = {
  title: 'Audit Center | PAWARTA',
};

export default async function AuditCenterPage() {
  const logs = await db
    .select({
      id: activityLogs.id,
      aksi: activityLogs.aksi,
      modul: activityLogs.modul,
      detailAktivitas: activityLogs.detailAktivitas,
      ipAddress: activityLogs.ipAddress,
      createdAt: activityLogs.createdAt,
      user: users.nama,
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .orderBy(desc(activityLogs.createdAt))
    .limit(100);

  const formattedLogs: AuditLog[] = logs.map((log) => ({
    id: log.id,
    waktu: new Date(log.createdAt).toLocaleString('id-ID'),
    user: log.user || 'System',
    ipAddress: log.ipAddress || 'N/A',
    modul: log.modul,
    aksi: log.aksi,
    detail: log.detailAktivitas,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Center</h1>
          <p className="text-muted-foreground">
            Log aktivitas sistem terpusat untuk keamanan dan kepatuhan.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Advanced Filter</Button>
          <Button>Export Laporan (CSV)</Button>
        </div>
      </div>

      <DataTable columns={columns} data={formattedLogs} />
    </div>
  );
}
