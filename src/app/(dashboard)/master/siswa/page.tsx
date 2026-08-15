import { db } from '@/db';
import { masterSiswa, masterKelas } from '@/db/schema/master';
import { eq, isNull, desc } from 'drizzle-orm';
import { Users, GraduationCap, School } from 'lucide-react';

export const metadata = {
  title: 'Master Siswa | PAWARTA',
};

export default async function MasterSiswaPage() {
  const siswaList = await db.query.masterSiswa.findMany({
    where: isNull(masterSiswa.deletedAt),
    with: {
      kelas: true,
    },
    orderBy: [desc(masterSiswa.createdAt)],
  });

  const totalSiswa = siswaList.length;
  const siswaLaki = siswaList.filter((s) => s.jenisKelamin === 'L').length;
  const siswaPerempuan = siswaList.filter((s) => s.jenisKelamin === 'P').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>Master Data Kesiswaan</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Data Siswa Sekolah</h1>
          <p className="text-xs text-gray-500 mt-1">
            Daftar profil siswa aktif untuk integrasi otomatis surat dispensasi, izin, dan surat
            keterangan.
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Total Siswa Aktif</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalSiswa}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Siswa Laki-Laki (L)</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">{siswaLaki}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Siswa Perempuan (P)</p>
            <p className="text-2xl font-bold text-purple-700 mt-1">{siswaPerempuan}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <School className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-sm">Daftar Lengkap Siswa</h2>
          <span className="text-xs text-gray-500">{totalSiswa} Siswa terdaftar</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-600 uppercase border-b border-gray-200">
              <tr>
                <th className="p-3.5 text-center w-12 border-r">No</th>
                <th className="p-3.5 border-r">NIS / NISN</th>
                <th className="p-3.5 border-r">Nama Lengkap Siswa</th>
                <th className="p-3.5 border-r">L/P</th>
                <th className="p-3.5 border-r">Kelas</th>
                <th className="p-3.5 border-r">Nama Orang Tua / Wali</th>
                <th className="p-3.5 border-r">No. HP Orang Tua</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {siswaList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400">
                    Belum ada data siswa yang tercatat.
                  </td>
                </tr>
              ) : (
                siswaList.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3 text-center border-r font-medium text-gray-500">
                      {idx + 1}
                    </td>
                    <td className="p-3 border-r font-mono text-xs text-gray-700">
                      <div className="font-semibold text-blue-700">{item.nisn}</div>
                      <div className="text-[11px] text-gray-400">NIS: {item.nis || '-'}</div>
                    </td>
                    <td className="p-3 border-r font-semibold text-gray-900">{item.nama}</td>
                    <td className="p-3 border-r text-center font-bold text-xs text-gray-600">
                      {item.jenisKelamin}
                    </td>
                    <td className="p-3 border-r">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {item.kelas?.kodeKelas || '-'}
                      </span>
                    </td>
                    <td className="p-3 border-r text-gray-700">{item.namaOrtu || '-'}</td>
                    <td className="p-3 border-r font-mono text-xs text-gray-600">
                      {item.noHpOrtu || '-'}
                    </td>
                    <td className="p-3">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.status}
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
  );
}
