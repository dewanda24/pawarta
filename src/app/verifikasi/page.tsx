import { db } from '@/db';
import { documentHashes, documentVerifications } from '@/db/schema/archive';
import { users } from '@/db/schema/iam';
import { eq } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const metadata = {
  title: 'Verifikasi Dokumen | PAWARTA',
};

export default async function VerifikasiPage({
  searchParams,
}: {
  searchParams: { hash?: string };
}) {
  const hashQuery = searchParams.hash || '';
  
  let validasiResult = null;
  let hashData = null;

  if (hashQuery) {
    const [result] = await db
      .select({
        id: documentHashes.id,
        entityType: documentHashes.entityType,
        tanggalGenerate: documentHashes.tanggalGenerate,
        generator: users.nama,
      })
      .from(documentHashes)
      .leftJoin(users, eq(documentHashes.generatorId, users.id))
      .where(eq(documentHashes.hashSha256, hashQuery));

    if (result) {
      validasiResult = 'VALID';
      hashData = result;

      // Log verification (in a real app this would be in a server action or route handler to capture IP properly)
      await db.insert(documentVerifications).values({
        hashId: result.id,
        statusValidasi: true,
        userAgent: 'Verification Page',
      });
    } else {
      validasiResult = 'INVALID';
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="max-w-md w-full bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="bg-primary p-6 text-center text-primary-foreground">
          <h1 className="text-2xl font-bold">Verifikasi Dokumen</h1>
          <p className="opacity-90 text-sm mt-1">PAWARTA Enterprise</p>
        </div>
        
        <div className="p-6 space-y-6">
          <p className="text-sm text-center text-muted-foreground">
            Masukkan kode hash dokumen atau scan QR Code yang tertera pada dokumen fisik/digital Anda.
          </p>

          <form className="space-y-4">
            <div>
              <Input 
                name="hash" 
                defaultValue={hashQuery} 
                placeholder="Masukkan Hash SHA-256..." 
                required 
                className="text-center font-mono text-xs"
              />
            </div>
            <Button type="submit" className="w-full">Verifikasi</Button>
          </form>

          {validasiResult === 'VALID' && hashData && (
            <div className="rounded-md border border-green-200 bg-green-50 p-4 space-y-3">
              <div className="flex items-center gap-2 text-green-800 font-bold justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                DOKUMEN ASLI TERVERIFIKASI
              </div>
              <div className="text-sm space-y-2 text-green-900 bg-white/50 p-3 rounded border border-green-100">
                <p><span className="font-semibold block text-xs text-green-700">Tipe Dokumen</span> {hashData.entityType}</p>
                <p><span className="font-semibold block text-xs text-green-700">Digenerate Pada</span> {new Date(hashData.tanggalGenerate).toLocaleString('id-ID')}</p>
                <p><span className="font-semibold block text-xs text-green-700">Oleh</span> {hashData.generator || 'Sistem'}</p>
                
                <div className="pt-2 mt-2 border-t border-green-200">
                  <p className="font-semibold text-xs text-green-700 mb-1">Status Tanda Tangan Elektronik (TTE)</p>
                  <span className="inline-flex items-center rounded-full bg-green-200 px-2 py-0.5 text-xs font-semibold text-green-800">
                    BSrE Verified (Simulasi)
                  </span>
                </div>
              </div>
            </div>
          )}

          {validasiResult === 'INVALID' && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 space-y-2 text-center">
              <div className="flex items-center gap-2 text-red-800 font-bold justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                DOKUMEN TIDAK VALID
              </div>
              <p className="text-sm text-red-900">
                Hash tidak ditemukan dalam sistem kami. Dokumen ini mungkin palsu atau telah diubah.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
