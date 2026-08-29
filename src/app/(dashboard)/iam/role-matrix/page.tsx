'use client';

import { useState, useEffect } from 'react';
import { getRoleList, assignPermissionsToRole } from '@/features/iam/actions/role';
import { getPermissionList } from '@/features/iam/actions/permission';
import { Button } from '@/components/ui/button';
import { Check, Save, Shield, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function RoleMatrixPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [matrix, setMatrix] = useState<Record<string, Set<string>>>({}); // roleId -> Set(permissionId)
  const [loading, setLoading] = useState(true);
  const [savingRoleId, setSavingRoleId] = useState<string | null>(null);
  const [isSavingAll, setIsSavingAll] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resRoles, resPerms] = await Promise.all([getRoleList(), getPermissionList()]);
      if (resRoles.success && resRoles.data) {
        setRoles(resRoles.data);
        const initMatrix: Record<string, Set<string>> = {};
        resRoles.data.forEach((r: any) => {
          const permSet = new Set<string>();
          r.rolePermissions?.forEach((rp: any) => {
            if (rp.permissionId) permSet.add(rp.permissionId);
          });
          initMatrix[r.id] = permSet;
        });
        setMatrix(initMatrix);
      }
      if (resPerms.success && resPerms.data) {
        setPermissions(resPerms.data);
      }
    } catch {
      toast.error('Gagal memuat data matrix hak akses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = (roleId: string, permissionId: string) => {
    // Prevent modifying Super Admin permissions if desired, or allow toggling
    setMatrix((prev) => {
      const roleSet = new Set(prev[roleId] || []);
      if (roleSet.has(permissionId)) {
        roleSet.delete(permissionId);
      } else {
        roleSet.add(permissionId);
      }
      return { ...prev, [roleId]: roleSet };
    });
  };

  const handleSaveRole = async (roleId: string) => {
    setSavingRoleId(roleId);
    try {
      const permIds = Array.from(matrix[roleId] || []);
      const res = await assignPermissionsToRole(roleId, permIds);
      if (res.success) {
        toast.success('Hak akses role berhasil diperbarui');
      } else {
        toast.error(res.error || 'Gagal menyimpan hak akses');
      }
    } catch {
      toast.error('Terjadi kesalahan saat menyimpan hak akses');
    } finally {
      setSavingRoleId(null);
    }
  };

  const handleSaveAll = async () => {
    setIsSavingAll(true);
    try {
      await Promise.all(
        roles.map((r) => {
          const permIds = Array.from(matrix[r.id] || []);
          return assignPermissionsToRole(r.id, permIds);
        })
      );
      toast.success('Semua perubahan hak akses berhasil disimpan');
    } catch {
      toast.error('Gagal menyimpan seluruh matrix hak akses');
    } finally {
      setIsSavingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Matriks Hak Akses & Kewenangan (RBAC)</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Atur hak akses secara visual per modul dinas (Surat Masuk, Surat Keluar, Disposisi, Kesiswaan, IAM).
            </p>
          </div>
        </div>
        <Button
          onClick={handleSaveAll}
          disabled={loading || isSavingAll}
          className="bg-blue-700 hover:bg-blue-800 flex items-center gap-2 text-xs font-semibold shadow-xs"
        >
          {isSavingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSavingAll ? 'Menyimpan...' : 'Simpan Semua Matriks'}
        </Button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400 text-xs">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
          Memuat konfigurasi matriks peran dan izin...
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50/90 text-gray-700 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 border-r border-gray-200 w-80 bg-gray-50 sticky left-0 z-20">
                    Modul & Nama Izin Akses
                  </th>
                  {roles.map((role) => (
                    <th
                      key={role.id}
                      className="px-5 py-3.5 text-center border-r border-gray-200 whitespace-nowrap min-w-[140px]"
                    >
                      <div className="font-bold text-gray-900">{role.namaRole}</div>
                      <div className="text-[10px] font-normal text-gray-500 truncate max-w-[130px] mx-auto">
                        {role.deskripsi || 'Peran dinas'}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={savingRoleId === role.id}
                        onClick={() => handleSaveRole(role.id)}
                        className="text-[10px] h-6 px-2 text-blue-600 hover:bg-blue-50 mt-1"
                      >
                        {savingRoleId === role.id ? 'Menyimpan...' : 'Simpan Kolom'}
                      </Button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {permissions.map((permission) => (
                  <tr key={permission.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-3.5 border-r border-gray-200 font-medium text-gray-900 bg-white sticky left-0 z-10 shadow-[1px_0_0_rgba(0,0,0,0.05)]">
                      <p className="font-semibold text-gray-900">{permission.nama}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{permission.modul} • {permission.deskripsi || 'Akses operasional'}</p>
                    </td>
                    {roles.map((role) => {
                      const isChecked = matrix[role.id]?.has(permission.id) || false;
                      const isSuperAdmin = role.namaRole === 'Super Admin';
                      return (
                        <td
                          key={role.id}
                          className={`px-5 py-3.5 text-center border-r border-gray-100 ${
                            isChecked ? 'bg-blue-50/20' : ''
                          }`}
                        >
                          <label className="inline-flex items-center justify-center cursor-pointer p-1">
                            <input
                              type="checkbox"
                              checked={isSuperAdmin || isChecked}
                              disabled={isSuperAdmin}
                              onChange={() => handleToggle(role.id, permission.id)}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer disabled:opacity-60"
                            />
                          </label>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
