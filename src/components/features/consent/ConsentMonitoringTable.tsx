'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Printer,
  FileSpreadsheet,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Eye,
  Filter,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { deleteConsentAdmin } from '@/features/student-letter/consent-actions';

interface ConsentRecord {
  id: string;
  nomorSurat: string | null;
  namaOrtu: string;
  hubungan: string | null;
  noHpOrtu: string;
  pekerjaanOrtu: string | null;
  alamatOrtu: string | null;
  statusPersetujuan: string;
  alasanPenolakan: string | null;
  signedAt: Date | string;
  ttdDigital: string;
  kelasId: string | null;
  siswa?: {
    id: string;
    nama: string;
    nis: string | null;
    nisn: string;
    kelas?: {
      id: string;
      namaKelas: string;
      kodeKelas: string;
    } | null;
  } | null;
}

interface ClassStat {
  kelasId: string;
  kodeKelas: string;
  namaKelas: string;
  totalSiswa: number;
  totalSubmitted: number;
  totalSetuju: number;
  totalTidakSetuju: number;
  totalBelum: number;
  percentage: number;
}

interface ConsentMonitoringTableProps {
  initialData: ConsentRecord[];
  classes: ClassStat[];
}

export function ConsentMonitoringTable({ initialData, classes }: ConsentMonitoringTableProps) {
  const [data, setData] = useState<ConsentRecord[]>(initialData);
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [previewTtd, setPreviewTtd] = useState<{ url: string; name: string } | null>(null);

  // Filter list
  const filteredData = data.filter((item) => {
    if (selectedClass !== 'ALL' && item.kelasId !== selectedClass) return false;
    if (selectedStatus !== 'ALL' && item.statusPersetujuan !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSiswa = item.siswa?.nama?.toLowerCase().includes(q) || item.siswa?.nisn?.includes(q);
      const matchOrtu = item.namaOrtu.toLowerCase().includes(q) || item.noHpOrtu.includes(q);
      const matchNomor = item.nomorSurat?.toLowerCase().includes(q);
      if (!matchSiswa && !matchOrtu && !matchNomor) return false;
    }
    return true;
  });

  const handleCopyPublicLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const publicUrl = `${origin}/persetujuan-ortu`;
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    toast.success('Tautan formulir publik berhasil disalin!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleExportCsv = () => {
    if (filteredData.length === 0) {
      toast.error('Tidak ada data untuk diexport');
      return;
    }

    const headers = [
      'No',
      'Nomor Surat',
      'Nama Siswa',
      'NISN',
      'Kelas',
      'Nama Orang Tua',
      'Hubungan',
      'No HP Ortu',
      'Pekerjaan Ortu',
      'Alamat Ortu',
      'Status Persetujuan',
      'Alasan Jika Tidak Setuju',
      'Waktu Penandatanganan',
    ];

    const rows = filteredData.map((item, idx) => [
      idx + 1,
      `"${item.nomorSurat || ''}"`,
      `"${item.siswa?.nama || ''}"`,
      `"${item.siswa?.nisn || ''}"`,
      `"${item.siswa?.kelas?.namaKelas || item.siswa?.kelas?.kodeKelas || ''}"`,
      `"${item.namaOrtu || ''}"`,
      `"${item.hubungan || ''}"`,
      `"${item.noHpOrtu || ''}"`,
      `"${item.pekerjaanOrtu || ''}"`,
      `"${(item.alamatOrtu || '').replace(/"/g, '""')}"`,
      `"${item.statusPersetujuan}"`,
      `"${(item.alasanPenolakan || '').replace(/"/g, '""')}"`,
      `"${item.signedAt ? new Date(item.signedAt).toLocaleString('id-ID') : ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Persetujuan_5_Hari_Kerja_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('File rekap CSV berhasil diunduh');
  };

  const handleDelete = async (id: string, namaSiswa: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data persetujuan untuk ${namaSiswa}?`)) {
      return;
    }

    try {
      const res = await deleteConsentAdmin(id);
      if (res.success) {
        setData((prev) => prev.filter((item) => item.id !== id));
        toast.success('Data persetujuan berhasil dihapus');
      } else {
        toast.error(res.error || 'Gagal menghapus data');
      }
    } catch {
      toast.error('Terjadi kesalahan saat menghapus data');
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleCopyPublicLink}
            variant="outline"
            className="text-xs h-9 font-semibold text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
            {copiedLink ? 'Tautan Tersalin!' : 'Salin Link Formulir Publik (Ortu)'}
          </Button>

          <Link href="/persetujuan-ortu" target="_blank">
            <Button variant="ghost" className="text-xs h-9 text-gray-600 hover:text-gray-900">
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Buka Halaman Publik
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={handleExportCsv}
            variant="outline"
            className="w-full sm:w-auto text-xs h-9 border-emerald-300 text-emerald-800 hover:bg-emerald-50 font-semibold"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> Export Excel / CSV
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama siswa, NISN, atau orang tua..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Filter Kelas */}
        <div className="sm:col-span-3">
          <Select value={selectedClass} onValueChange={(val) => setSelectedClass(val)}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Semua Kelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Kelas ({data.length})</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c.kelasId} value={c.kelasId}>
                  {c.namaKelas} ({c.totalSubmitted}/{c.totalSiswa})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filter Status */}
        <div className="sm:col-span-3">
          <Select value={selectedStatus} onValueChange={(val) => setSelectedStatus(val)}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value="SETUJU">✓ Menyetujui</SelectItem>
              <SelectItem value="TIDAK_SETUJU">✕ Tidak Menyetujui</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5 text-center w-12">No</th>
                <th className="p-3.5">Nama Siswa & NISN</th>
                <th className="p-3.5">Kelas</th>
                <th className="p-3.5">Orang Tua / Wali</th>
                <th className="p-3.5">Status Sikap</th>
                <th className="p-3.5 text-center">Tanda Tangan</th>
                <th className="p-3.5">Waktu TTD</th>
                <th className="p-3.5 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.length > 0 ? (
                filteredData.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="p-3.5 text-center font-mono text-gray-500">{idx + 1}</td>

                    <td className="p-3.5">
                      <div className="font-bold text-gray-900 text-xs sm:text-sm">
                        {item.siswa?.nama || 'Siswa'}
                      </div>
                      <div className="text-[11px] text-gray-500 font-mono">
                        NISN: {item.siswa?.nisn || '-'}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                        {item.siswa?.kelas?.namaKelas || item.siswa?.kelas?.kodeKelas || '-'}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="font-semibold text-gray-900">{item.namaOrtu}</div>
                      <div className="text-[11px] text-gray-500">
                        {item.hubungan || 'Orang Tua'} • <span className="font-mono">{item.noHpOrtu}</span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      {item.statusPersetujuan === 'SETUJU' ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Menyetujui
                        </span>
                      ) : (
                        <div>
                          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded text-[11px] border border-red-200">
                            <XCircle className="w-3.5 h-3.5" /> Menolak
                          </span>
                          {item.alasanPenolakan && (
                            <p className="text-[10px] text-red-600 italic mt-0.5 max-w-xs truncate" title={item.alasanPenolakan}>
                              {item.alasanPenolakan}
                            </p>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="p-3.5 text-center">
                      {item.ttdDigital ? (
                        <button
                          type="button"
                          onClick={() => setPreviewTtd({ url: item.ttdDigital, name: item.namaOrtu })}
                          className="h-8 w-16 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded p-0.5 inline-flex items-center justify-center transition-transform hover:scale-105"
                          title="Klik untuk pratinjau tanda tangan"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.ttdDigital}
                            alt="TTD"
                            className="max-h-full max-w-full object-contain"
                          />
                        </button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    <td className="p-3.5 text-gray-600 text-[11px]">
                      {item.signedAt
                        ? new Date(item.signedAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '-'}
                    </td>

                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/persetujuan-ortu/cetak/${item.id}`} target="_blank" title="Cetak Surat PDF">
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-blue-700 hover:bg-blue-50">
                            <Printer className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id, item.siswa?.nama || 'Siswa')}
                          className="h-7 w-7 p-0 text-red-600 hover:bg-red-50"
                          title="Hapus Data"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400">
                    Tidak ada data persetujuan orang tua yang sesuai dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <span>Menampilkan {filteredData.length} dari total {data.length} surat masuk</span>
        </div>
      </div>

      {/* Modal Preview Tanda Tangan */}
      {previewTtd && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in-50"
          onClick={() => setPreviewTtd(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="font-bold text-gray-900 text-sm">
              Pratinjau Tanda Tangan Digital
            </h4>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center min-h-[140px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewTtd.url}
                alt="Tanda Tangan"
                className="max-h-28 max-w-full object-contain"
              />
            </div>
            <p className="text-xs text-gray-600 font-semibold">{previewTtd.name}</p>
            <Button
              onClick={() => setPreviewTtd(null)}
              className="w-full h-9 text-xs font-semibold bg-gray-900 text-white"
            >
              Tutup
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
