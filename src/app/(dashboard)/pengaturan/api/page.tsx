import { db } from '@/db';
import { apiKeys } from '@/db/schema/integration';
import { desc } from 'drizzle-orm';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'API Management | PAWARTA',
};

export default async function ApiManagementPage() {
  const keys = await db.select().from(apiKeys).orderBy(desc(apiKeys.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Management</h1>
          <p className="text-muted-foreground">Kelola API Keys untuk integrasi pihak ketiga.</p>
        </div>
        <Button>Generate API Key</Button>
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nama Aplikasi</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Token Preview</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Permissions</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Dibuat Pada</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Terakhir Digunakan</th>
                <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {keys.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-muted-foreground">Belum ada API Key.</td>
                </tr>
              ) : (
                keys.map((key) => (
                  <tr key={key.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle font-medium">{key.nama}</td>
                    <td className="p-4 align-middle font-mono text-xs">{key.tokenPreview}</td>
                    <td className="p-4 align-middle">
                      <div className="flex flex-wrap gap-1">
                        {(key.permissions as string[])?.map((p) => (
                          <span key={p} className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">{p}</span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 align-middle">{new Date(key.createdAt).toLocaleDateString('id-ID')}</td>
                    <td className="p-4 align-middle">{key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString('id-ID') : 'Belum pernah'}</td>
                    <td className="p-4 align-middle text-center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${key.isAktif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {key.isAktif ? 'Aktif' : 'Revoked'}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <Button variant="outline" size="sm" className="mr-2">Rotate</Button>
                      <Button variant="destructive" size="sm">Revoke</Button>
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
