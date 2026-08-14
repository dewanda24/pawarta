import { db } from '@/db';
import { outgoingLetters } from '@/db/schema/outgoing-letter';
import { workflowInstances, workflowSteps } from '@/db/schema/workflow';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function SuratKeluarDetailPage({ params }: { params: { id: string } }) {
  const [letter] = await db
    .select()
    .from(outgoingLetters)
    .where(eq(outgoingLetters.id, params.id));

  if (!letter) return notFound();

  // Find Workflow Instance
  const [workflow] = await db
    .select()
    .from(workflowInstances)
    .where(eq(workflowInstances.entityId, letter.id));
    
  let currentStep = null;
  if (workflow) {
    [currentStep] = await db
      .select()
      .from(workflowSteps)
      .where(eq(workflowSteps.id, workflow.currentStepId));
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 pt-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Detail Surat: {letter.perihal}</h2>
          <p className="text-muted-foreground text-sm">
            Tujuan: {letter.tujuanSurat} • Dibuat pada: {letter.createdAt?.toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-2">
          {letter.status === 'DRAFT' && (
            <Link href={`/surat-keluar/${letter.id}/editor`}>
              <Button>Edit Konten Surat</Button>
            </Link>
          )}
          {letter.status === 'REVIEW' && (
             <Button variant="default" className="bg-amber-600 hover:bg-amber-700">Approve Surat</Button>
          )}
          <Link href="/surat-keluar">
            <Button variant="outline">Kembali</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-md border p-6 bg-white shadow-sm space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Informasi Surat</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Nomor Surat</p>
                <p className="font-medium">{letter.nomorSurat || 'Belum di-generate'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium">
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                    {letter.status}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Tanggal Surat</p>
                <p className="font-medium">{letter.tanggalSurat ? new Date(letter.tanggalSurat).toLocaleDateString() : '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tanggal Terbit</p>
                <p className="font-medium">{letter.tanggalTerbit ? new Date(letter.tanggalTerbit).toLocaleDateString() : '-'}</p>
              </div>
            </div>
          </div>
          
          {/* Timeline Placeholder */}
          <div className="rounded-md border p-6 bg-white shadow-sm">
             <h3 className="text-lg font-semibold border-b pb-2 mb-4">Timeline / Riwayat</h3>
             <div className="relative border-l border-gray-200 ml-3 space-y-6">
               <div className="pl-6 relative">
                 <div className="absolute w-3 h-3 bg-primary rounded-full -left-1.5 top-1.5 border border-white"></div>
                 <p className="text-sm font-semibold">Surat Dibuat (Draft)</p>
                 <p className="text-xs text-muted-foreground">{letter.createdAt?.toLocaleString()}</p>
               </div>
               
               {letter.status !== 'DRAFT' && (
                 <div className="pl-6 relative">
                   <div className="absolute w-3 h-3 bg-primary rounded-full -left-1.5 top-1.5 border border-white"></div>
                   <p className="text-sm font-semibold">Submit Review</p>
                   <p className="text-xs text-muted-foreground">Oleh: Pembuat Surat</p>
                 </div>
               )}
             </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="rounded-md border p-6 bg-slate-50 shadow-sm">
             <h3 className="text-lg font-semibold border-b pb-2 mb-4">Workflow Info</h3>
             <div className="space-y-3 text-sm">
                <p><span className="text-muted-foreground">State saat ini:</span> <br/> {currentStep?.namaStep || 'DRAFT'}</p>
                <p><span className="text-muted-foreground">Di-assign ke:</span> <br/> User ID {workflow?.assignedUserId}</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
