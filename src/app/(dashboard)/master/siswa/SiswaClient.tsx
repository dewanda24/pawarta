'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SiswaForm, SiswaFormValues } from './form';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { deleteSiswa, getSiswaList } from '@/features/master-data/actions/siswa';
import {
  Users,
  GraduationCap,
  School,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Phone,
  MapPin,
  Calendar,
  User,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface SiswaItem {
  id: string;
  nama: string;
  nis: string | null;
  nisn: string;
  jenisKelamin: string | null;
  tempatLahir: string | null;
  tanggalLahir: string | null;
  kelasId: string | null;
  namaOrtu: string | null;
  pekerjaanOrtu: string | null;
  noHpOrtu: string | null;
  alamat: string | null;
  status: string;
  kelas?: {
    id: string;
    namaKelas: string;
    kodeKelas: string;
    tingkat: number;
  } | null;
}

interface KelasItem {
  id: string;
  namaKelas: string;
  kodeKelas: string;
  tingkat: number;
}

interface SiswaClientProps {
  initialData: SiswaItem[];
  kelasList: KelasItem[];
}

export function SiswaClient({ initialData, kelasList }: SiswaClientProps) {
  const [data, setData] = useState<SiswaItem[]>(initialData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedGender, setSelectedGender] = useState<string>('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState<(SiswaFormValues & { id?: string }) | null>(null);

  // Detail Modal State
  const [detailSiswa, setDetailSiswa] = useState<SiswaItem | null>(null);

  // Delete Dialog State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{ id: string; nama: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Refresh data from server action
  const refreshData = async () => {
    const res = await getSiswaList();
    if (res.success && res.data) {
      setData(res.data as SiswaItem[]);
    }
  };

  // Filtered Data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (selectedClass !== 'ALL' && item.kelasId !== selectedClass) return false;
      if (selectedGender !== 'ALL' && item.jenisKelamin !== selectedGender) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNama = item.nama.toLowerCase().includes(q);
        const matchNisn = item.nisn?.toLowerCase().includes(q);
        const matchNis = item.nis?.toLowerCase().includes(q);
        const matchOrtu = item.namaOrtu?.toLowerCase().includes(q);
        const matchHp = item.noHpOrtu?.includes(q);
        if (!matchNama && !matchNisn && !matchNis && !matchOrtu && !matchHp) return false;
      }
      return true;
    });
  }, [data, selectedClass, selectedGender, searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedClass, selectedGender, pageSize]);

  // Pagination Calculations
  const totalRecords = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Stats
  const totalSiswa = data.length;
  const totalLaki = data.filter((s) => s.jenisKelamin === 'L').length;
  const totalPerempuan = data.filter((s) => s.jenisKelamin === 'P').length;

  const handleCreate = () => {
    setSelectedSiswa(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: SiswaItem) => {
    setSelectedSiswa({
      id: item.id,
      nama: item.nama,
      nisn: item.nisn,
      nis: item.nis,
      jenisKelamin: (item.jenisKelamin as 'L' | 'P') || 'L',
      tempatLahir: item.tempatLahir,
      tanggalLahir: item.tanggalLahir,
      kelasId: item.kelasId,
      namaOrtu: item.namaOrtu,
      pekerjaanOrtu: item.pekerjaanOrtu,
      noHpOrtu: item.noHpOrtu,
      alamat: item.alamat,
      status: item.status || 'Aktif',
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (item: SiswaItem) => {
    setDeletingItem({ id: item.id, nama: item.nama });
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      const res = await deleteSiswa(deletingItem.id);
      if (res.success) {
        toast.success(`Data siswa ${deletingItem.nama} berhasil dihapus`);
        setData((prev) => prev.filter((s) => s.id !== deletingItem.id));
        setIsDeleteDialogOpen(false);
      } else {
        toast.error(res.error || 'Gagal menghapus data siswa');
      }
    } catch {
      toast.error('Terjadi kesalahan saat menghapus data');
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
            <GraduationCap className="w-4 h-4" />
            <span>Master Data Kesiswaan</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Data Siswa Sekolah</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manajemen lengkap 474 profil siswa aktif SMPN 1 Ujungjaya untuk penerbitan surat dan persetujuan 5 hari kerja.
          </p>
        </div>

        <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 font-semibold flex items-center gap-1.5 shadow-xs">
          <Plus className="w-4 h-4" />
          <span>Tambah Siswa Baru</span>
        </Button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Total Siswa Aktif</p>
            <p className="text-2xl font-black text-gray-900 mt-0.5">{totalSiswa}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Siswa Laki-Laki (L)</p>
            <p className="text-2xl font-black text-blue-700 mt-0.5">{totalLaki}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Siswa Perempuan (P)</p>
            <p className="text-2xl font-black text-purple-700 mt-0.5">{totalPerempuan}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <School className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Total Rombel</p>
            <p className="text-2xl font-black text-emerald-700 mt-0.5">{kelasList.length} Kelas</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Toolbar Filter & Live Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama siswa, NISN, NIS, nama orang tua, atau nomor HP..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Filter Kelas */}
          <div className="sm:col-span-3">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Semua Kelas" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="ALL">Semua Kelas ({totalSiswa})</SelectItem>
                {kelasList.map((k) => (
                  <SelectItem key={k.id} value={k.id}>
                    {k.namaKelas} ({k.kodeKelas})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filter Gender */}
          <div className="sm:col-span-3">
            <Select value={selectedGender} onValueChange={setSelectedGender}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Semua Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Jenis Kelamin</SelectItem>
                <SelectItem value="L">Laki-Laki (L)</SelectItem>
                <SelectItem value="P">Perempuan (P)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Page Size & Counter Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500 gap-2">
          <div className="flex items-center gap-2">
            <span>Tampilkan per halaman:</span>
            <Select value={String(pageSize)} onValueChange={(val) => setPageSize(Number(val))}>
              <SelectTrigger className="h-7 w-20 text-xs font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-gray-400">|</span>
            <span>
              Menampilkan <strong>{totalRecords === 0 ? 0 : startIndex + 1} - {endIndex}</strong> dari total <strong>{totalRecords}</strong> siswa
            </span>
          </div>

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-blue-600 hover:underline font-medium text-xs"
            >
              Reset Filter Pencarian
            </button>
          )}
        </div>
      </div>

      {/* Main Student Data Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-gray-50 text-[11px] font-bold text-gray-700 uppercase border-b border-gray-200">
              <tr>
                <th className="p-3.5 text-center w-12 border-r">No</th>
                <th className="p-3.5 border-r">NISN / NIS</th>
                <th className="p-3.5 border-r">Nama Lengkap Siswa</th>
                <th className="p-3.5 text-center border-r w-14">L/P</th>
                <th className="p-3.5 border-r">Rombel (Kelas)</th>
                <th className="p-3.5 border-r">Nama Orang Tua / Wali</th>
                <th className="p-3.5 border-r">No. HP WhatsApp</th>
                <th className="p-3.5 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-gray-400 text-xs">
                    Tidak ditemukan data siswa yang sesuai dengan kriteria pencarian atau filter.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="p-3.5 text-center font-medium text-gray-500 border-r">
                      {startIndex + idx + 1}
                    </td>

                    <td className="p-3.5 border-r">
                      <span className="font-mono font-bold text-gray-900 block">{item.nisn}</span>
                      <span className="font-mono text-[10px] text-gray-500">
                        NIS: {item.nis || '-'}
                      </span>
                    </td>

                    <td className="p-3.5 font-bold text-gray-900 border-r">
                      <button
                        type="button"
                        onClick={() => setDetailSiswa(item)}
                        className="hover:text-blue-600 text-left font-bold transition-colors"
                      >
                        {item.nama}
                      </button>
                      <span className="block text-[10px] font-normal text-gray-400">
                        {item.tempatLahir ? `${item.tempatLahir}, ` : ''}{item.tanggalLahir || ''}
                      </span>
                    </td>

                    <td className="p-3.5 text-center border-r">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          item.jenisKelamin === 'L'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {item.jenisKelamin || 'L'}
                      </span>
                    </td>

                    <td className="p-3.5 border-r">
                      <span className="font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded text-[11px] border border-gray-200">
                        {item.kelas?.namaKelas || item.kelas?.kodeKelas || '-'}
                      </span>
                    </td>

                    <td className="p-3.5 border-r">
                      <span className="font-semibold text-gray-900 block">{item.namaOrtu || '-'}</span>
                      <span className="text-[10px] text-gray-500">{item.pekerjaanOrtu || '-'}</span>
                    </td>

                    <td className="p-3.5 border-r font-mono text-[11px] text-gray-700">
                      {item.noHpOrtu ? (
                        <a
                          href={`https://wa.me/${item.noHpOrtu.replace(/[^0-9]/g, '').startsWith('0') ? `62${item.noHpOrtu.replace(/[^0-9]/g, '').slice(1)}` : item.noHpOrtu.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{item.noHpOrtu}</span>
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDetailSiswa(item)}
                          className="h-7 w-7 p-0 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                          title="Lihat Detail Profil"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          className="h-7 w-7 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          title="Ubah Data Siswa"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(item)}
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Hapus Siswa"
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

        {/* Pagination Navigation Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-gray-500 font-medium">
            Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong> (Total {totalRecords} Siswa)
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

            {/* Direct Page Indicator */}
            <div className="flex items-center gap-1 px-1">
              <span className="font-semibold text-gray-700 px-2 py-1 bg-white border border-gray-300 rounded-md">
                {currentPage}
              </span>
            </div>

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
      </div>

      {/* Modal Detail Profil Siswa */}
      {detailSiswa && (
        <Dialog open={!!detailSiswa} onOpenChange={() => setDetailSiswa(null)}>
          <DialogContent className="sm:max-w-lg rounded-2xl">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                  {detailSiswa.nama.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-gray-900">
                    {detailSiswa.nama}
                  </DialogTitle>
                  <p className="text-xs text-gray-500 font-mono">
                    NISN: {detailSiswa.nisn} • NIS: {detailSiswa.nis || '-'}
                  </p>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Kelas</span>
                  <span className="font-bold text-gray-900 text-xs">
                    {detailSiswa.kelas?.namaKelas || detailSiswa.kelas?.kodeKelas || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Jenis Kelamin</span>
                  <span className="font-bold text-gray-900 text-xs">
                    {detailSiswa.jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Tempat, Tanggal Lahir</span>
                  <span className="font-medium text-gray-800 text-xs">
                    {detailSiswa.tempatLahir || '-'}{detailSiswa.tanggalLahir ? `, ${detailSiswa.tanggalLahir}` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Status Siswa</span>
                  <span className="font-bold text-emerald-700 text-xs">
                    {detailSiswa.status || 'Aktif'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 bg-blue-50/50 p-3.5 rounded-xl border border-blue-200">
                <p className="font-bold text-blue-900 text-xs">Data Orang Tua / Wali</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-500 block text-[10px]">Nama Orang Tua / Wali:</span>
                    <span className="font-semibold text-gray-900">{detailSiswa.namaOrtu || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">Pekerjaan:</span>
                    <span className="font-medium text-gray-800">{detailSiswa.pekerjaanOrtu || '-'}</span>
                  </div>
                </div>
                <div className="pt-1">
                  <span className="text-gray-500 block text-[10px]">No. Telepon / WhatsApp:</span>
                  <span className="font-mono font-semibold text-emerald-800">{detailSiswa.noHpOrtu || '-'}</span>
                </div>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-1">
                <span className="text-gray-400 block text-[10px] uppercase font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Alamat Domisili
                </span>
                <p className="text-gray-800 leading-relaxed text-xs">{detailSiswa.alamat || 'Kabupaten Sumedang'}</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const s = detailSiswa;
                    setDetailSiswa(null);
                    handleEdit(s);
                  }}
                  className="text-xs"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1" /> Ubah Data
                </Button>
                <Button size="sm" onClick={() => setDetailSiswa(null)} className="text-xs bg-gray-900 text-white">
                  Tutup
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Form Dialog Modal */}
      <SiswaForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialData={selectedSiswa}
        kelasList={kelasList}
        onSuccess={refreshData}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Hapus Data Siswa"
        description={`Apakah Anda yakin ingin menghapus data siswa "${deletingItem?.nama}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </div>

  );
}
