import { db } from '@/db';
import { systemHealthLogs } from '@/db/schema/system';
import { desc } from 'drizzle-orm';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'System Health | PAWARTA',
};

export default async function SystemHealthPage() {
  const logs = await db.select().from(systemHealthLogs).orderBy(desc(systemHealthLogs.tanggal)).limit(50);

  const components = [
    { name: 'Database (PostgreSQL)', status: 'HEALTHY', latency: '12ms' },
    { name: 'File Storage (S3)', status: 'HEALTHY', latency: '45ms' },
    { name: 'Queue Engine (BullMQ)', status: 'HEALTHY', latency: '5ms' },
    { name: 'Email SMTP', status: 'DEGRADED', latency: '1200ms' },
    { name: 'API Gateway', status: 'HEALTHY', latency: '20ms' },
    { name: 'Webhook Dispatcher', status: 'HEALTHY', latency: '8ms' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
          <p className="text-muted-foreground">Monitoring status komponen dan infrastruktur sistem PAWARTA.</p>
        </div>
        <Button variant="outline">Refresh Data</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {components.map((comp) => (
          <div key={comp.name} className="border rounded-md p-4 bg-card shadow-sm flex flex-col">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold">{comp.name}</h3>
              <div className={`h-3 w-3 rounded-full mt-1 ${comp.status === 'HEALTHY' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className={`font-bold ${comp.status === 'HEALTHY' ? 'text-green-600' : 'text-yellow-600'}`}>{comp.status}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Latency</p>
                <p className="font-mono text-sm">{comp.latency}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Diagnostic Logs</h2>
        <div className="rounded-md border p-0">
          <div className="relative w-full overflow-auto max-h-[400px]">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b bg-muted/50 sticky top-0">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Waktu</th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Komponen</th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Pesan Error</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-muted-foreground">Belum ada log diagnostik.</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle whitespace-nowrap">{new Date(log.tanggal).toLocaleString('id-ID')}</td>
                      <td className="p-4 align-middle font-medium">{log.komponen}</td>
                      <td className="p-4 align-middle">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${log.status === 'HEALTHY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-4 align-middle text-xs font-mono text-red-600">{log.errorMessage || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
