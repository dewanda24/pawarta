import { db } from '@/db';
import { activityLogs } from '@/db/schema/workspace';
import { users } from '@/db/schema/iam';
import { eq, desc } from 'drizzle-orm';
import { Button } from '@/components/ui/button';

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Center</h1>
          <p className="text-muted-foreground">Log aktivitas sistem terpusat untuk keamanan dan kepatuhan.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Advanced Filter</Button>
          <Button>Export Laporan (CSV)</Button>
        </div>
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Waktu</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">IP Address</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Modul</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Aksi</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Detail</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-muted-foreground">Belum ada log aktivitas.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle whitespace-nowrap">{new Date(log.createdAt).toLocaleString('id-ID')}</td>
                    <td className="p-4 align-middle font-medium">{log.user || 'System'}</td>
                    <td className="p-4 align-middle text-xs font-mono">{log.ipAddress || 'N/A'}</td>
                    <td className="p-4 align-middle">
                      <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold bg-secondary text-secondary-foreground">
                        {log.modul}
                      </span>
                    </td>
                    <td className="p-4 align-middle font-bold text-xs">{log.aksi}</td>
                    <td className="p-4 align-middle text-muted-foreground text-xs">{log.detailAktivitas}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
