import { getUserList } from '@/features/iam/actions/user';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default async function UsersPage() {
  const { data: userList } = await getUserList();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
          <p className="text-sm text-gray-500">Kelola akses akun dan role pengguna sistem.</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Pengguna
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Nama</th>
                <th className="px-6 py-4">Username / Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {userList?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Belum ada data pengguna.
                  </td>
                </tr>
              )}
              {userList?.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                        {user.nama.charAt(0)}
                      </div>
                      {user.nama}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    <div>{user.username}</div>
                    <div className="text-xs">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    {user.userRoles.map((ur) => (
                      <span key={ur.roleId} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 mr-1">
                        {ur.role.namaRole}
                      </span>
                    ))}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" className="text-blue-600">Edit</Button>
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
