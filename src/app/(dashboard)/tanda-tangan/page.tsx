import { db } from '@/db';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { digitalSignatures, signatureSigners } from '@/db/schema/signature';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { users } from '@/db/schema/iam';
import { outgoingLetters } from '@/db/schema/outgoing-letter';
import { eq, desc } from 'drizzle-orm';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Digital Signature | PAWARTA',
};

export default async function DigitalSignaturePage() {
  const requests = await db
    .select({
      id: digitalSignatures.id,
      entityType: digitalSignatures.entityType,
      tipe: digitalSignatures.tipe,
      status: digitalSignatures.status,
      tanggalRequest: digitalSignatures.tanggalRequest,
      perihal: outgoingLetters.perihal,
    })
    .from(digitalSignatures)
    .leftJoin(outgoingLetters, eq(digitalSignatures.outgoingLetterId, outgoingLetters.id))
    .orderBy(desc(digitalSignatures.tanggalRequest));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Digital Signature Engine</h1>
          <p className="text-muted-foreground">
            Kelola permintaan Tanda Tangan Elektronik (TTE) internal maupun BSrE.
          </p>
        </div>
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Tgl Request
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Dokumen
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Tipe TTE
                </th>
                <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">
                  Progress
                </th>
                <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">
                  Status Dokumen
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-muted-foreground">
                    Belum ada permintaan Tanda Tangan.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr
                    key={req.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle">
                      {new Date(req.tanggalRequest).toLocaleDateString('id-ID')}
                    </td>
                    <td className="p-4 align-middle">
                      <span className="font-medium text-blue-600 truncate block max-w-[250px]">
                        {req.perihal || 'Dokumen Internal'}
                      </span>
                      <span className="text-xs text-muted-foreground">{req.entityType}</span>
                    </td>
                    <td className="p-4 align-middle">
                      <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold bg-secondary text-secondary-foreground">
                        {req.tipe}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-center">
                      <span className="text-xs text-muted-foreground">Menunggu Penandatangan</span>
                    </td>
                    <td className="p-4 align-middle text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          req.status === 'SIGNED'
                            ? 'bg-green-100 text-green-800'
                            : req.status === 'WAITING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <Button variant="outline" size="sm">
                        Tandatangani
                      </Button>
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
