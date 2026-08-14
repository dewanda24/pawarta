import { db } from '@/db';
import { masterJenisSurat, masterKlasifikasiSurat, masterPrioritas, masterSifatSurat, masterInstansi } from '@/db/schema/master';
import { IncomingLetterForm } from '@/components/features/incoming-letter/IncomingLetterForm';
import { eq } from 'drizzle-orm';

export const metadata = {
  title: 'Tambah Surat Masuk | PAWARTA',
};

export default async function TambahSuratMasukPage() {
  const [jenisSuratOpts, klasifikasiOpts, prioritasOpts, sifatOpts, instansiOpts] = await Promise.all([
    db.select().from(masterJenisSurat).where(eq(masterJenisSurat.isAktif, true)),
    db.select().from(masterKlasifikasiSurat).where(eq(masterKlasifikasiSurat.isAktif, true)),
    db.select().from(masterPrioritas).where(eq(masterPrioritas.isAktif, true)),
    db.select().from(masterSifatSurat).where(eq(masterSifatSurat.isAktif, true)),
    db.select().from(masterInstansi).where(eq(masterInstansi.isAktif, true)),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Registrasi Surat Masuk</h1>
        <p className="text-muted-foreground">Isi formulir di bawah ini untuk meregistrasi surat masuk baru.</p>
      </div>

      <div className="rounded-md border p-6">
        <IncomingLetterForm 
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
