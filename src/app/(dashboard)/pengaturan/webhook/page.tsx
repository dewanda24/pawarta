import { db } from '@/db';
import { webhooks } from '@/db/schema/integration';
import { desc } from 'drizzle-orm';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Webhook Management | PAWARTA',
};

export const dynamic = 'force-dynamic';

export default async function WebhookManagementPage() {
  const hooks = await db.select().from(webhooks).orderBy(desc(webhooks.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Webhook Engine</h1>
          <p className="text-muted-foreground">Kirim notifikasi real-time ke aplikasi eksternal saat event terjadi.</p>
        </div>
        <Button>Tambah Webhook</Button>
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nama / Endpoint</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Events Disubscribe</th>
                <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {hooks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-muted-foreground">Belum ada Webhook yang didaftarkan.</td>
                </tr>
              ) : (
                hooks.map((hook) => (
                  <tr key={hook.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle">
                      <span className="font-medium block">{hook.nama}</span>
                      <span className="text-xs text-muted-foreground font-mono">{hook.url}</span>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex flex-wrap gap-1">
                        {(hook.events as string[])?.map((e) => (
                          <span key={e} className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-[10px] font-semibold">{e}</span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 align-middle text-center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${hook.isAktif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {hook.isAktif ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <Button variant="outline" size="sm" className="mr-2">Test Ping</Button>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </td>
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
