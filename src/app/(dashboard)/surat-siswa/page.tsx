import { db } from '@/db';
import { studentLetters } from '@/db/schema';
import { isNull, desc } from 'drizzle-orm';
import { SuratSiswaClient } from './SuratSiswaClient';

export const metadata = {
  title: 'Surat Kesiswaan | PAWARTA',
};

export default async function SuratSiswaPage() {
  const letters = await db.query.studentLetters.findMany({
    where: isNull(studentLetters.deletedAt),
    with: {
      siswa: {
        with: { kelas: true },
      },
      kelas: true,
      guruPendamping: true,
      participants: {
        with: {
          siswa: {
            with: { kelas: true },
          },
        },
      },
    },
    orderBy: [desc(studentLetters.createdAt)],
  });

  return <SuratSiswaClient initialData={letters as any} />;
}
