import { db } from '@/db';
import { retentionPolicies, archives } from '@/db/schema/archive';
import { eq, desc, and, lt } from 'drizzle-orm';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Retensi Arsip | PAWARTA',
};

export default async function RetensiArsipPage() {
  const policies = await db
    .select()
    .from(retentionPolicies)
    .where(eq(retentionPolicies.isAktif, true))
    .orderBy(retentionPolicies.nama);

  // Dynamic calculation query: Ambil arsip yang masa retensinya sudah lewat / hampir habis
  const today = new Date().toISOString().split('T')[0];
  const expiringArchives = await db
    .select({
      id: archives.id,
      nomorArsip: archives.nomorArsip,
      perihal: archives.perihal,
      statusRetensi: archives.statusRetensi,
      tanggalRetensiBerakhir: archives.tanggalRetensiBerakhir,
      retensiNama: retentionPolicies.nama,
      tindakanAkhir: retentionPolicies.tindakanAkhir,
    })
    .from(archives)
    .innerJoin(retentionPolicies, eq(archives.retentionPolicyId, retentionPolicies.id))
    .where(
      and(
        lt(archives.tanggalRetensiBerakhir, today), // Sudah lewat tanggal berakhir
        eq(archives.statusRetensi, 'AKTIF') // Status masih aktif, perlu diproses
      )
    )
    .orderBy(desc(archives.tanggalRetensiBerakhir));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Retensi Arsip</h1>
          <p className="text-muted-foreground">Jadwal Retensi Arsip (JRA) dan Monitoring Masa Aktif.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Tambah JRA</Button>
          <Button variant="secondary">Kalkulasi Retensi (Trigger Engine)</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel JRA Master */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Kebijakan Jadwal Retensi (JRA)</h2>
          <div className="rounded-md border p-0">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b bg-muted/50">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Kode / Nama</th>
                    <th className="h-10 px-4 text-center align-middle font-medium text-muted-foreground">Aktif</th>
                    <th className="h-10 px-4 text-center align-middle font-medium text-muted-foreground">Inaktif</th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Tindakan Akhir</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {policies.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-muted-foreground">Belum ada kebijakan retensi aktif.</td>
                    </tr>
                  ) : (
                    policies.map((policy) => (
                      <tr key={policy.id} className="border-b transition-colors">
                        <td className="p-4 align-middle">
                          <span className="font-medium text-blue-600 block">{policy.kode}</span>
                          <span className="text-xs">{policy.nama}</span>
                        </td>
                        <td className="p-4 align-middle text-center">{policy.masaAktifTahun} thn</td>
                        <td className="p-4 align-middle text-center">{policy.masaInaktifTahun} thn</td>
                        <td className="p-4 align-middle">
                          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${
                            policy.tindakanAkhir === 'MUSNAH' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {policy.tindakanAkhir}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Panel Expiring Archives */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Membutuhkan Tindak Lanjut Retensi</h2>
          <div className="rounded-md border border-red-200 p-0">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b bg-red-50">
                  <tr className="border-b transition-colors">
                    <th className="h-10 px-4 text-left align-middle font-medium text-red-800">No. Arsip</th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-red-800">Tgl Jatuh Tempo</th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-red-800">Rekomendasi Aksi</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {expiringArchives.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-muted-foreground">Tidak ada arsip yang melewati batas retensi.</td>
                    </tr>
                  ) : (
                    expiringArchives.map((archive) => (
                      <tr key={archive.id} className="border-b transition-colors">
                        <td className="p-4 align-middle">
                          <span className="font-medium">{archive.nomorArsip}</span>
                          <span className="block text-xs text-muted-foreground truncate max-w-[200px]">{archive.perihal}</span>
                        </td>
                        <td className="p-4 align-middle text-red-600 font-bold">
                          {archive.tanggalRetensiBerakhir ? new Date(archive.tanggalRetensiBerakhir).toLocaleDateString('id-ID') : '-'}
                        </td>
                        <td className="p-4 align-middle">
                          <Button size="sm" variant={archive.tindakanAkhir === 'MUSNAH' ? 'destructive' : 'secondary'}>
                            Proses {archive.tindakanAkhir === 'MUSNAH' ? 'Pemusnahan' : 'Permanen'}
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
      </div>
    </div>
  );
}
