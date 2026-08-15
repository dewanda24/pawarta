import { db } from '@/db';
import {
  masterJenisSurat,
  masterKlasifikasiSurat,
  masterInstansi,
  masterPegawai,
  masterPrioritas,
  masterSifatSurat,
} from '@/db/schema/master';
import { eq } from 'drizzle-orm';
import { OutgoingLetterForm } from '@/components/features/outgoing-letter/OutgoingLetterForm';

export const metadata = {
  title: 'Buat Surat Keluar | PAWARTA',
};

export default async function CreateSuratKeluarPage() {
  const [jenisSuratOpts, klasifikasiOpts, instansiOpts, pegawaiOpts, prioritasOpts, sifatOpts] =
    await Promise.all([
      db.select().from(masterJenisSurat).where(eq(masterJenisSurat.isAktif, true)),
      db.select().from(masterKlasifikasiSurat).where(eq(masterKlasifikasiSurat.isAktif, true)),
      db.select().from(masterInstansi).where(eq(masterInstansi.isAktif, true)),
      db.select().from(masterPegawai).where(eq(masterPegawai.isAktif, true)),
      db.select().from(masterPrioritas).where(eq(masterPrioritas.isAktif, true)),
      db.select().from(masterSifatSurat).where(eq(masterSifatSurat.isAktif, true)),
    ]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Buat Surat Keluar Baru</h1>
        <p className="text-sm text-gray-500 mt-1">
          Lengkapi data di bawah ini untuk mencatat surat keluar baru atau mengajukan draft surat.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
        <OutgoingLetterForm
          jenisSuratOpts={jenisSuratOpts}
          klasifikasiOpts={klasifikasiOpts}
          instansiOpts={instansiOpts}
          pegawaiOpts={pegawaiOpts}
          prioritasOpts={prioritasOpts}
          sifatOpts={sifatOpts}
        />
      </div>
    </div>
  );
}
