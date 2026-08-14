import { getJabatanList } from '@/features/master-data/actions/jabatan';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Link from 'next/link';

export default async function JabatanPage() {
  const { data: jabatanList } = await getJabatanList();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Jabatan</h1>
          <p className="text-sm text-gray-500">Kelola data jabatan struktural dan fungsional.</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Jabatan
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">No</th>
                <th className="px-6 py-4">Nama Jabatan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {jabatanList?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Belum ada data jabatan.
                  </td>
                </tr>
              )}
              {jabatanList?.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-gray-500">{index + 1}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{item.nama}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.isAktif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {item.isAktif ? 'Aktif' : 'Non-Aktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
