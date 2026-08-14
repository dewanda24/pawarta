import { getRoleList } from '@/features/iam/actions/role';
import { getPermissionList } from '@/features/iam/actions/permission';
import { Button } from '@/components/ui/button';
import { Check, Save } from 'lucide-react';

export default async function RoleMatrixPage() {
  const { data: roles } = await getRoleList();
  const { data: permissions } = await getPermissionList();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role Permission Matrix</h1>
          <p className="text-sm text-gray-500">Atur hak akses secara visual per module dan role.</p>
        </div>
        <Button className="flex items-center gap-2">
          <Save className="w-4 h-4" /> Simpan Perubahan
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 border-r border-gray-100 w-64 bg-white sticky left-0 z-10">Permission \ Role</th>
              {roles?.map((role) => (
                <th key={role.id} className="px-6 py-4 text-center border-r border-gray-100 whitespace-nowrap">
                  <div className="font-bold">{role.namaRole}</div>
                  <div className="text-xs font-normal text-gray-400 mt-1">{role.deskripsi}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {permissions?.map((permission) => (
              <tr key={permission.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 border-r border-gray-100 font-medium text-gray-900 bg-white sticky left-0 z-10">
                  {permission.nama}
                  <div className="text-xs text-gray-400 mt-1">{permission.modul}</div>
                </td>
                {roles?.map((role) => {
                  const hasPermission = role.rolePermissions.some(rp => rp.permissionId === permission.id);
                  return (
                    <td key={role.id} className="px-6 py-4 text-center border-r border-gray-100">
                      {hasPermission ? (
                        <div className="w-6 h-6 mx-auto bg-green-100 text-green-700 rounded flex items-center justify-center">
                          <Check className="w-4 h-4" />
                        </div>
                      ) : (
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
