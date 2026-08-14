import { db } from '@/db';
import { emailTemplates } from '@/db/schema/system';
import { desc } from 'drizzle-orm';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Email Templates | PAWARTA',
};

export default async function EmailTemplatePage() {
  const templates = await db.select().from(emailTemplates).orderBy(desc(emailTemplates.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Templates</h1>
          <p className="text-muted-foreground">Kelola format dan konten notifikasi email (Mendukung Handlebars syntax).</p>
        </div>
        <Button>Tambah Template</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.length === 0 ? (
          <div className="col-span-full p-8 text-center text-muted-foreground border rounded-md">
            Belum ada Email Template.
          </div>
        ) : (
          templates.map((tpl) => (
            <div key={tpl.id} className="border rounded-md p-4 bg-card shadow-sm flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-blue-700">{tpl.kode}</h3>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${tpl.isAktif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {tpl.isAktif ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                <p className="text-sm font-semibold">{tpl.nama}</p>
                <div className="mt-4 pt-4 border-t space-y-2 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground block">Subject</span>
                    <p className="font-medium truncate">{tpl.subject}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Body (Preview)</span>
                    <p className="text-xs text-muted-foreground line-clamp-3 font-mono bg-muted p-2 rounded mt-1">
                      {tpl.htmlBody}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="w-full">Edit Konten</Button>
                <Button variant="secondary" size="sm" className="w-full">Test Kirim</Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
