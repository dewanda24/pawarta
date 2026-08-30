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
import { KelasForm, KelasFormValues } from './form';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { deleteKelas, getKelasList } from '@/features/master-data/actions/kelas';
import {
  School,
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  LayoutGrid,
  Table as TableIcon,
  Sparkles,
  GraduationCap,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface KelasItem {
  id: string;
  kodeKelas: string;
  namaKelas: string;
  tingkat: number;
  jurusan: string | null;
  waliKelasId: string | null;
  tahunAjaran: string | null;
  isAktif: boolean;
  waliKelas?: {
    id: string;
    nama: string;
    nip: string | null;
  } | null;
  siswa?: Array<{ id: string }>;
}

interface PegawaiItem {
  id: string;
  nama: string;
  nip: string | null;
}

interface KelasClientProps {
  initialData: KelasItem[];
  pegawaiList: PegawaiItem[];
}

export function KelasClient({ initialData, pegawaiList }: KelasClientProps) {
  const [data, setData] = useState<KelasItem[]>(initialData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTingkat, setSelectedTingkat] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(12);

  // Form Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedKelas, setSelectedKelas] = useState<(KelasFormValues & { id?: string }) | null>(null);

  // Delete Dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{ id: string; nama: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const refreshData = async () => {
    const res = await getKelasList();
    if (res.success && res.data) {
      setData(res.data as KelasItem[]);
    }
  };

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (selectedTingkat !== 'ALL' && String(item.tingkat) !== selectedTingkat) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchKode = item.kodeKelas.toLowerCase().includes(q);
        const matchNama = item.namaKelas.toLowerCase().includes(q);
        const matchWali = item.waliKelas?.nama?.toLowerCase().includes(q);
        if (!matchKode && !matchNama && !matchWali) return false;
      }
      return true;
    });
  }, [data, selectedTingkat, searchQuery]);

  // Pagination Calculations
  const totalRecords = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Stats
  const totalRombel = data.length;
  const totalSiswaAll = data.reduce((acc, k) => acc + (k.siswa?.length || 0), 0);
  const kelas7Count = data.filter((k) => k.tingkat === 7).length;
  const kelas8Count = data.filter((k) => k.tingkat === 8).length;
  const kelas9Count = data.filter((k) => k.tingkat === 9).length;

  const handleCreate = () => {
    setSelectedKelas(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: KelasItem) => {
    setSelectedKelas({
      id: item.id,
      kodeKelas: item.kodeKelas,
      namaKelas: item.namaKelas,
      tingkat: item.tingkat,
      jurusan: item.jurusan || 'Umum',
      waliKelasId: item.waliKelasId,
      tahunAjaran: item.tahunAjaran || '2026/2027',
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (item: KelasItem) => {
    setDeletingItem({ id: item.id, nama: item.namaKelas });
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      const res = await deleteKelas(deletingItem.id);
      if (res.success) {
        toast.success(`Rombongan belajar ${deletingItem.nama} berhasil dihapus`);
        setData((prev) => prev.filter((k) => k.id !== deletingItem.id));
        setIsDeleteDialogOpen(false);
      } else {
        toast.error(res.error || 'Gagal menghapus rombel');
      }
    } catch {
      toast.error('Terjadi kesalahan saat menghapus rombel');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <School className="w-4 h-4" />
            <span>Master Data Kesiswaan</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Rombongan Belajar (Kelas)
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Daftar 17 rombongan belajar aktif SMPN 1 Ujungjaya, penetapan wali kelas, dan pembagian tingkat.
          </p>
        </div>

        <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 font-semibold flex items-center gap-1.5 shadow-xs">
          <Plus className="w-4 h-4" />
          <span>Tambah Rombel Baru</span>
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Total Rombel</p>
            <p className="text-2xl font-black text-gray-900 mt-0.5">{totalRombel} Kelas</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <School className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Kelas 7 (Tingkat VII)</p>
            <p className="text-2xl font-black text-indigo-700 mt-0.5">{kelas7Count} Rombel</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Kelas 8 (Tingkat VIII)</p>
            <p className="text-2xl font-black text-purple-700 mt-0.5">{kelas8Count} Rombel</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Kelas 9 (Tingkat IX)</p>
            <p className="text-2xl font-black text-emerald-700 mt-0.5">{kelas9Count} Rombel</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Toolbar Filter, Live Search & View Mode */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
            {/* Search Box */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kode/nama kelas atau wali..."
                className="pl-9 h-9 text-xs"
              />
            </div>

            {/* Filter Tingkat */}
            <Select value={selectedTingkat} onValueChange={setSelectedTingkat}>
              <SelectTrigger className="h-9 w-40 text-xs">
                <SelectValue placeholder="Semua Tingkat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Tingkat</SelectItem>
                <SelectItem value="7">Tingkat 7 (VII)</SelectItem>
                <SelectItem value="8">Tingkat 8 (VIII)</SelectItem>
                <SelectItem value="9">Tingkat 9 (IX)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid Kartu</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tabel Rinci</span>
            </button>
          </div>
        </div>

        {/* Counter Info */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
          <div>
            Menampilkan <strong>{totalRecords === 0 ? 0 : startIndex + 1} - {endIndex}</strong> dari total <strong>{totalRecords}</strong> rombongan belajar ({totalSiswaAll} siswa terdaftar)
          </div>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-blue-600 hover:underline font-medium"
            >
              Reset Cari
            </button>
          )}
        </div>
      </div>

      {/* Grid View Mode */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {paginatedData.length === 0 ? (
            <div className="col-span-3 bg-white p-12 text-center text-gray-400 rounded-2xl border border-gray-200 text-xs">
              Tidak ditemukan rombongan belajar yang sesuai filter.
            </div>
          ) : (
            paginatedData.map((k) => (
              <div
                key={k.id}
                className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        Tingkat {k.tingkat} • SMP
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 mt-1.5">{k.namaKelas}</h3>
                      <p className="text-xs text-gray-400 font-mono">Kode: {k.kodeKelas}</p>
                    </div>
                    <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                      {k.kodeKelas}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Wali Kelas:</span>
                      <span className="font-semibold text-gray-900">
                        {k.waliKelas?.nama || 'Belum Ditetapkan'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Jumlah Siswa:</span>
                      <span className="inline-flex items-center gap-1 font-bold bg-blue-50 text-blue-900 px-2 py-0.5 rounded border border-blue-200">
                        <Users className="w-3 h-3 text-blue-600" /> {k.siswa?.length || 0} Siswa
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tahun Ajaran:</span>
                      <span className="font-medium text-gray-700">{k.tahunAjaran || '2026/2027'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <Link
                    href={`/persetujuan-ortu?kelas=${k.kodeKelas}`}
                    target="_blank"
                    className="text-[11px] text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg border border-blue-200 transition-colors"
                    title="Buka Tautan Khusus Kelas Ini untuk Ortu"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Link Ortu</span>
                  </Link>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(k)}
                      className="h-8 w-8 p-0 text-amber-600 hover:bg-amber-50"
                      title="Ubah Rombel"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(k)}
                      className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                      title="Hapus Rombel"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Table View Mode */
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-gray-50 text-[11px] font-bold text-gray-700 uppercase border-b border-gray-200">
                <tr>
                  <th className="p-3.5 text-center w-12 border-r">No</th>
                  <th className="p-3.5 border-r">Kode Rombel</th>
                  <th className="p-3.5 border-r">Nama Rombongan Belajar</th>
                  <th className="p-3.5 text-center border-r w-24">Tingkat</th>
                  <th className="p-3.5 text-center border-r w-28">Jumlah Siswa</th>
                  <th className="p-3.5 border-r">Wali Kelas</th>
                  <th className="p-3.5 border-r">Tahun Ajaran</th>
                  <th className="p-3.5 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-10 text-center text-gray-400">
                      Tidak ditemukan data rombongan belajar.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="p-3.5 text-center font-medium text-gray-500 border-r">
                        {startIndex + idx + 1}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-blue-700 border-r">
                        {item.kodeKelas}
                      </td>
                      <td className="p-3.5 font-bold text-gray-900 border-r">
                        {item.namaKelas}
                      </td>
                      <td className="p-3.5 text-center border-r">
                        <span className="bg-gray-100 text-gray-800 font-semibold px-2 py-0.5 rounded text-[11px]">
                          Kelas {item.tingkat}
                        </span>
                      </td>
                      <td className="p-3.5 text-center border-r">
                        <span className="bg-blue-50 text-blue-900 font-bold px-2.5 py-0.5 rounded-full text-[11px] border border-blue-200">
                          {item.siswa?.length || 0} Siswa
                        </span>
                      </td>
                      <td className="p-3.5 border-r font-medium text-gray-900">
                        {item.waliKelas?.nama || '-'}
                      </td>
                      <td className="p-3.5 border-r text-gray-600 font-mono text-[11px]">
                        {item.tahunAjaran || '2026/2027'}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            href={`/persetujuan-ortu?kelas=${item.kodeKelas}`}
                            target="_blank"
                            title="Tautan Form Ortu"
                          >
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-blue-600 hover:bg-blue-50">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item)}
                            className="h-7 w-7 p-0 text-amber-600 hover:bg-amber-50"
                            title="Ubah Rombel"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(item)}
                            className="h-7 w-7 p-0 text-red-600 hover:bg-red-50"
                            title="Hapus Rombel"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="text-gray-500 font-medium">
          Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong> (Total {totalRecords} Rombel)
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
            className="h-8 px-2.5 text-xs flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Sebelumnya</span>
          </Button>

          <span className="font-semibold text-gray-700 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-md">
            {currentPage}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="h-8 px-2.5 text-xs flex items-center gap-1"
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

      {/* Form Dialog Modal */}
      <KelasForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialData={selectedKelas}
        pegawaiList={pegawaiList}
        onSuccess={refreshData}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Hapus Rombongan Belajar"
        description={`Apakah Anda yakin ingin menghapus rombongan belajar "${deletingItem?.nama}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </div>

  );
}
