import { db } from '@/db';
import { masterJenisSurat, masterKlasifikasiSurat, masterPrioritas, masterSifatSurat, masterInstansi } from '@/db/schema/master';
import { incomingLetters } from '@/db/schema/incoming-letter';
import { eq, and, isNull } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { EditIncomingLetterForm } from '@/components/features/incoming-letter/EditIncomingLetterForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { requireAuth } from '@/lib/server-action';

export const metadata = { title: 'Edit Surat Masuk | PAWARTA' };

export default async function EditSuratMasukPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  await requireAuth('SURAT_MASUK_UPDATE');

  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams?.id;
  if (!id) notFound();

  const [letter, jenisSuratOpts, klasifikasiOpts, prioritasOpts, sifatOpts, instansiOpts] = await Promise.all([
    db.query.incomingLetters.findFirst({
      where: and(eq(incomingLetters.id, id), isNull(incomingLetters.deletedAt)),
    }),
    db.select().from(masterJenisSurat).where(eq(masterJenisSurat.isAktif, true)),
    db.select().from(masterKlasifikasiSurat).where(eq(masterKlasifikasiSurat.isAktif, true)),
    db.select().from(masterPrioritas).where(eq(masterPrioritas.isAktif, true)),
    db.select().from(masterSifatSurat).where(eq(masterSifatSurat.isAktif, true)),
    db.select().from(masterInstansi).where(eq(masterInstansi.isAktif, true)),
  ]);

  if (!letter) notFound();

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Link href={'/surat-masuk/' + id}>
          <Button variant='outline' size='sm' className='flex items-center gap-1.5'>
            <ArrowLeft className='w-4 h-4' /> Kembali
          </Button>
        </Link>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Edit Surat Masuk</h1>
          <p className='text-muted-foreground text-sm'>{letter.nomorSurat}</p>
        </div>
      </div>
      <div className='rounded-xl border p-6 bg-white shadow-xs'>
        <EditIncomingLetterForm
          id={id}
          defaultValues={{
            nomorSurat: letter.nomorSurat,
            tanggalSurat: letter.tanggalSurat,
            tanggalDiterima: letter.tanggalDiterima,
            pengirim: letter.pengirim,
            instansiPengirimId: letter.instansiPengirimId ?? undefined,
            perihal: letter.perihal,
            ringkasanIsi: letter.ringkasanIsi ?? undefined,
            jenisSuratId: letter.jenisSuratId,
            klasifikasiId: letter.klasifikasiId,
            prioritasId: letter.prioritasId,
            sifatSuratId: letter.sifatSuratId,
            catatan: letter.catatan ?? undefined,
          }}
          jenisSuratOpts={jenisSuratOpts}
          klasifikasiOpts={klasifikasiOpts}
          prioritasOpts={prioritasOpts}
          sifatOpts={sifatOpts}
          instansiOpts={instansiOpts}
        />
      </div>
    </div>
  );
}