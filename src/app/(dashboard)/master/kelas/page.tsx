import { db } from '@/db';
import { masterKelas, masterPegawai } from '@/db/schema/master';
import { isNull, desc } from 'drizzle-orm';
import { KelasClient } from './KelasClient';

export const metadata = {
  title: 'Master Rombongan Belajar (Kelas) | PAWARTA',
};

export default async function MasterKelasPage() {
  const [kelasList, pegawaiList] = await Promise.all([
    db.query.masterKelas.findMany({
      where: isNull(masterKelas.deletedAt),
      with: {
        waliKelas: true,
        siswa: {
          columns: {
            id: true,
          },
        },
      },
      orderBy: [desc(masterKelas.tingkat), desc(masterKelas.kodeKelas)],
    }),
    db.query.masterPegawai.findMany({
      where: isNull(masterPegawai.deletedAt),
      orderBy: [desc(masterPegawai.nama)],
    }),
  ]);

  return <KelasClient initialData={kelasList as any} pegawaiList={pegawaiList as any} />;
}
