import { db } from '@/db';
import { masterKelas } from '@/db/schema/master';
import { isNull, desc } from 'drizzle-orm';
import { School, Users } from 'lucide-react';

export const metadata = {
  title: 'Master Kelas | PAWARTA',
};

export default async function MasterKelasPage() {
  const kelasList = await db.query.masterKelas.findMany({
    where: isNull(masterKelas.deletedAt),
    with: {
      waliKelas: true,
      siswa: true,
    },
    orderBy: [desc(masterKelas.tingkat), desc(masterKelas.kodeKelas)],
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-1">
          <School className="w-4 h-4" />
          <span>Master Data Kesiswaan</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Rombongan Belajar (Kelas)
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Daftar rombel kelas, tingkat, jurusan, dan wali kelas pendamping siswa.
        </p>
      </div>

      {/* Grid of Classes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kelasList.map((k) => (
          <div
            key={k.id}
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs hover:border-blue-300 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Tingkat {k.tingkat} • {k.jurusan}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mt-0.5">{k.namaKelas}</h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{k.kodeKelas}</p>
              </div>
              <span className="p-2 rounded-lg bg-blue-50 text-blue-700">
                <School className="w-5 h-5" />
              </span>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Wali Kelas:</span>
                <span className="text-xs font-semibold text-gray-800">
                  {k.waliKelas?.nama || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Total Siswa:</span>
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                  <Users className="w-3 h-3" /> {k.siswa?.length || 0} Siswa
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Tahun Ajaran:</span>
                <span className="text-xs text-gray-700 font-medium">{k.tahunAjaran}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
