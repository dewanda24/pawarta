'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  ShieldCheck,
  ShieldAlert,
  Laptop,
  Globe,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
} from 'lucide-react';
import { formatIndonesianDate } from '@/utils/date';

interface LoginLogItem {
  id: string;
  aktivitas: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  status: string | null;
  keterangan: string | null;
  createdAt: Date | string | null;
  namaUser: string | null;
  username: string | null;
  email: string | null;
}

interface LoginLogsClientProps {
  initialLogs: LoginLogItem[];
}

export function LoginLogsClient({ initialLogs }: LoginLogsClientProps) {
  const [logs] = useState<LoginLogItem[]>(initialLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(15);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const isSuccess = log.status === 'Success' || log.status === 'SUCCESS';
      if (statusFilter === 'SUCCESS' && !isSuccess) return false;
      if (statusFilter === 'FAILED' && isSuccess) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchUser = log.namaUser?.toLowerCase().includes(q);
        const matchUsername = log.username?.toLowerCase().includes(q);
        const matchEmail = log.email?.toLowerCase().includes(q);
        const matchIp = log.ipAddress?.toLowerCase().includes(q);
        const matchKet = log.keterangan?.toLowerCase().includes(q);
        if (!matchUser && !matchUsername && !matchEmail && !matchIp && !matchKet) return false;
      }
      return true;
    });
  }, [logs, statusFilter, searchQuery]);

  const totalRecords = filteredLogs.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
              Log Login Pengguna
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Audit trail dan riwayat autentikasi seluruh akun pengguna PAWARTA
            </p>
          </div>
        </div>
        <Badge variant="outline" className="px-3 py-1 text-xs bg-slate-50 border-slate-200 text-slate-700 font-medium">
          Total {logs.length} Sesi Terakhir
        </Badge>
      </div>

      {/* Toolbar Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama pengguna, username, IP, atau keterangan..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="sm:col-span-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Status Login ({logs.length})</SelectItem>
                <SelectItem value="SUCCESS">✓ Berhasil Login</SelectItem>
                <SelectItem value="FAILED">✕ Gagal Login</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500 gap-2">
          <div className="flex items-center gap-2">
            <span>Baris per halaman:</span>
            <Select value={String(pageSize)} onValueChange={(val) => setPageSize(Number(val))}>
              <SelectTrigger className="h-7 w-[70px] text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-gray-300">|</span>
            <span>
              Menampilkan <strong>{totalRecords === 0 ? 0 : startIndex + 1}-{endIndex}</strong> dari total <strong>{totalRecords}</strong> data
            </span>
          </div>

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-blue-600 hover:underline font-medium"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Tabel Log Login */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-700 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Waktu Akses</th>
                <th className="px-5 py-3.5">Pengguna</th>
                <th className="px-5 py-3.5">Aktivitas</th>
                <th className="px-5 py-3.5">Alamat IP & Perangkat</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                    Tidak ada riwayat aktivitas login yang sesuai filter.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const isSuccess = log.status === 'Success' || log.status === 'SUCCESS';
                  return (
                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Waktu */}
                      <td className="px-5 py-4 whitespace-nowrap font-medium text-gray-900">
                        {formatIndonesianDate(log.createdAt)}
                      </td>

                      {/* User */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-900">{log.namaUser || 'Tamu / Anonim'}</div>
                        <div className="text-[11px] text-gray-500 font-mono">
                          {log.username ? `@${log.username}` : log.email || '-'}
                        </div>
                      </td>

                      {/* Aktivitas */}
                      <td className="px-5 py-4 font-medium text-gray-800">
                        {log.aktivitas || 'Autentikasi Pengguna'}
                      </td>

                      {/* IP & Perangkat */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 font-mono text-gray-700 font-medium">
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                          <span>{log.ipAddress || '127.0.0.1'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5 max-w-xs truncate" title={log.userAgent || ''}>
                          <Laptop className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{log.userAgent || 'Browser Web'}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <Badge
                          variant="outline"
                          className={`gap-1 font-semibold ${
                            isSuccess
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {isSuccess ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                          <span>{isSuccess ? 'Berhasil' : 'Gagal'}</span>
                        </Badge>
                      </td>

                      {/* Keterangan */}
                      <td className="px-5 py-4 text-gray-600 max-w-xs truncate">
                        {log.keterangan || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-gray-500 font-medium">
            Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong> (Total {totalRecords} Data)
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="h-8 px-2 text-xs"
              title="Halaman Pertama"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 px-2.5 text-xs flex items-center gap-1 font-semibold"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </Button>

            <span className="font-semibold text-gray-700 px-2.5 py-1 bg-white border border-gray-200 rounded-md">
              {currentPage}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="h-8 px-2.5 text-xs flex items-center gap-1 font-semibold"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage >= totalPages}
              className="h-8 px-2 text-xs"
              title="Halaman Terakhir"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
