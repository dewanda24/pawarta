import { db } from '@/db';
import { automationRules } from '@/db/schema/integration';
import { desc } from 'drizzle-orm';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Automation Rules | PAWARTA',
};

export default async function AutomationPage() {
  const rules = await db.select().from(automationRules).orderBy(desc(automationRules.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Automation Engine</h1>
          <p className="text-muted-foreground">Otomatiskan proses bisnis menggunakan If-This-Then-That (IFTTT) Logic.</p>
        </div>
        <Button>Buat Rule Baru</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rules.length === 0 ? (
          <div className="col-span-full p-8 text-center text-muted-foreground border rounded-md">
            Belum ada Automation Rule.
          </div>
        ) : (
          rules.map((rule) => (
            <div key={rule.id} className="border rounded-md p-4 bg-card shadow-sm flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold">{rule.nama}</h3>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${rule.isAktif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {rule.isAktif ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{rule.deskripsi || 'Tidak ada deskripsi'}</p>
                
                <div className="mt-4 pt-4 border-t space-y-2 text-sm">
                  <div className="bg-muted p-2 rounded">
                    <span className="font-semibold text-blue-600 block text-xs">WHEN (Trigger)</span>
                    <code>{rule.triggerEvent}</code>
                  </div>
                  <div className="bg-muted p-2 rounded">
                    <span className="font-semibold text-yellow-600 block text-xs">IF (Conditions)</span>
                    <code className="text-xs break-all">{JSON.stringify(rule.conditions)}</code>
                  </div>
                  <div className="bg-muted p-2 rounded">
                    <span className="font-semibold text-green-600 block text-xs">THEN (Actions)</span>
                    <code className="text-xs break-all">{JSON.stringify(rule.actions)}</code>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="w-full">Edit</Button>
                <Button variant="secondary" size="sm" className="w-full">Logs</Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
