'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createSystemBackup } from '@/features/system/actions';
import { HardDrive, Download, Database, FileArchive, Loader2, ShieldCheck, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatIndonesianDate } from '@/utils/date';


interface BackupItem {
  id: string;
  tipe: string;
  filename: string;
  path: string;
  sizeBytes: string | null;
  status: string;
  tanggalMulai: Date;
  aktorNama?: string | null;
}

export function BackupClient({ backups = [] }: { backups: BackupItem[] }) {
  const [loadingTipe, setLoadingTipe] = useState<string | null>(null);

  const handleCreateBackup = async (tipe: 'DATABASE' | 'DOCUMENT' | 'FULL') => {
    setLoadingTipe(tipe);
    try {
      const res = await createSystemBackup(tipe);
      if (res.success) {
        toast.success(`Snapshot cadangan ${tipe} berhasil dibuat!`);
      } else {
        toast.error(res.error || 'Gagal membuat backup');
      }
    } catch {
      toast.error('Terjadi kesalahan saat memproses backup');
    } finally {
      setLoadingTipe(null);
    }
  };

  const handleDownload = (filename: string) => {
    toast.info(`Mengunduh file arsip: ${filename}`);
  };

  return (
    <div className="space-y-6">
      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Database Backup */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Cadangan Basis Data (SQL)</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Mencadangkan seluruh tabel surat, log, master data, dan relasi sistem.
            </p>
          </div>
          <Button
            onClick={() => handleCreateBackup('DATABASE')}
            disabled={loadingTipe !== null}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-9 shadow-xs"
          >
            {loadingTipe === 'DATABASE' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buat Cadangan Database'}
          </Button>
        </div>

        {/* Document Backup */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileArchive className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Arsip Lampiran & Berkas (.ZIP)</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Mencadangkan seluruh berkas fisik scan PDF naskah dinas dan lampiran.
            </p>
          </div>
          <Button
            onClick={() => handleCreateBackup('DOCUMENT')}
            disabled={loadingTipe !== null}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs h-9 shadow-xs"
          >
            {loadingTipe === 'DOCUMENT' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buat Arsip Lampiran'}
          </Button>
        </div>

        {/* Full Backup */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Cadangan Penuh (Full System)</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Kombinasi lengkap basis data, konfigurasi tata naskah, dan berkas digital.
            </p>
          </div>
          <Button
            onClick={() => handleCreateBackup('FULL')}
            disabled={loadingTipe !== null}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 shadow-xs"
          >
            {loadingTipe === 'FULL' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buat Cadangan Penuh'}
          </Button>
        </div>
      </div>

      {/* Backup History Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Riwayat Berkas Cadangan</h3>
            <p className="text-xs text-gray-500 mt-0.5">Daftar snapshot arsip sistem yang siap diunduh</p>
          </div>
          <Badge variant="outline" className="text-xs bg-slate-50 text-slate-700">
            {backups.length} Berkas Tersimpan
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-700 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Nama Berkas</th>
                <th className="px-5 py-3.5">Tipe Cadangan</th>
                <th className="px-5 py-3.5">Ukuran</th>
                <th className="px-5 py-3.5">Waktu Pembuatan</th>
                <th className="px-5 py-3.5">Dibuat Oleh</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {backups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                    Belum ada snapshot cadangan yang dibuat.
                  </td>
                </tr>
              ) : (
                backups.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 font-mono font-medium text-gray-900">
                      {item.filename}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                        {item.tipe}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600 font-medium">
                      {item.sizeBytes || '-'}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {formatIndonesianDate(item.tanggalMulai)}
                    </td>

                    <td className="px-5 py-4 text-gray-900 font-medium">
                      {item.aktorNama || 'Administrator'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(item.filename)}
                        className="h-8 px-2.5 text-xs text-blue-700 border-blue-200 hover:bg-blue-50 font-medium flex items-center gap-1.5 ml-auto"
                      >
                        <Download className="w-3.5 h-3.5" /> Unduh
                      </Button>
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
