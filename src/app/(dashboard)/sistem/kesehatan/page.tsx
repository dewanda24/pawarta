import { db } from '@/db';
import { systemHealthLogs } from '@/db/schema/system';
import { desc } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { columns, HealthLog } from './columns';

export const metadata = {
  title: 'System Health | PAWARTA',
};

export default async function SystemHealthPage() {
  const logs = await db
    .select()
    .from(systemHealthLogs)
    .orderBy(desc(systemHealthLogs.tanggal))
    .limit(50);

  const formattedLogs: HealthLog[] = logs.map((log) => ({
    id: log.id,
    waktu: new Date(log.tanggal).toLocaleString('id-ID'),
    komponen: log.komponen,
    status: log.status,
    pesanError: log.errorMessage || '-',
  }));

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
          <p className="text-muted-foreground">
            Monitoring status komponen dan infrastruktur sistem PAWARTA.
          </p>
        </div>
        <Button variant="outline">Refresh Data</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {components.map((comp) => (
          <div key={comp.name} className="border rounded-md p-4 bg-card shadow-sm flex flex-col">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold">{comp.name}</h3>
              <div
                className={`h-3 w-3 rounded-full mt-1 ${comp.status === 'HEALTHY' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}
              ></div>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p
                  className={`font-bold ${comp.status === 'HEALTHY' ? 'text-green-600' : 'text-yellow-600'}`}
                >
                  {comp.status}
                </p>
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
        <DataTable columns={columns} data={formattedLogs} />
      </div>
    </div>
  );
}
