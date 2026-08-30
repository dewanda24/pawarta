import { db } from '@/db';
import { masterSiswa, masterKelas } from '@/db/schema/master';
import { isNull, desc } from 'drizzle-orm';
import { SiswaClient } from './SiswaClient';

export const metadata = {
  title: 'Master Siswa | PAWARTA',
};

export default async function MasterSiswaPage() {
  const [siswaList, kelasList] = await Promise.all([
    db.query.masterSiswa.findMany({
      where: isNull(masterSiswa.deletedAt),
      with: {
        kelas: true,
      },
      orderBy: [desc(masterSiswa.createdAt)],
    }),
    db.query.masterKelas.findMany({
      where: isNull(masterKelas.deletedAt),
      orderBy: [desc(masterKelas.tingkat), desc(masterKelas.kodeKelas)],
    }),
  ]);

  return <SiswaClient initialData={siswaList as any} kelasList={kelasList as any} />;
}
