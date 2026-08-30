'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
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
  GraduationCap,
  PlusCircle,
  FileText,
  FileCheck,
  PhoneCall,
  Printer,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  Users,
} from 'lucide-react';
import { DeleteStudentLetterButton } from '@/components/features/student-letter/DeleteStudentLetterButton';

interface StudentLetterItem {
  id: string;
  tipeSurat: 'DISPENSASI' | 'KETERANGAN_AKTIF' | 'PANGGILAN_ORTU' | string;
  nomorSurat: string;
  namaKegiatan?: string | null;
  keperluan?: string | null;
  tanggalMulai?: Date | string | null;
  tanggalSelesai?: Date | string | null;
  status: string;
  createdAt?: Date | string | null;
  siswa?: {
    id: string;
    nama: string;
    nisn: string;
    kelas?: {
      id: string;
      namaKelas: string;
      kodeKelas: string;
    } | null;
  } | null;
  kelas?: {
    id: string;
    namaKelas: string;
    kodeKelas: string;
  } | null;
  guruPendamping?: {
    id: string;
    nama: string;
  } | null;
  participants?: Array<{
    id: string;
    siswa?: {
      id: string;
      nama: string;
      kelas?: {
        id: string;
        kodeKelas: string;
      } | null;
    } | null;
  }>;
}

interface SuratSiswaClientProps {
  initialData: StudentLetterItem[];
}

export function SuratSiswaClient({ initialData }: SuratSiswaClientProps) {
  const [data] = useState<StudentLetterItem[]>(initialData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (selectedType !== 'ALL' && item.tipeSurat !== selectedType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNomor = item.nomorSurat?.toLowerCase().includes(q);
        const matchSiswa = item.siswa?.nama?.toLowerCase().includes(q);
        const matchPart = item.participants?.some((p) => p.siswa?.nama?.toLowerCase().includes(q));
        const matchKegiatan = item.namaKegiatan?.toLowerCase().includes(q);
        const matchKeperluan = item.keperluan?.toLowerCase().includes(q);
        if (!matchNomor && !matchSiswa && !matchPart && !matchKegiatan && !matchKeperluan) return false;
      }
      return true;
    });
  }, [data, selectedType, searchQuery]);

  const totalRecords = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);
  const paginatedData = filteredData.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 sm:p-8 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>Modul Persuratan Kesiswaan</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight">Layanan Surat Siswa</h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
            Penerbitan surat izin dispensasi lomba/kegiatan, surat keterangan siswa aktif, dan surat
            panggilan orang tua / wali murid.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 w-full lg:w-auto">
          <Link href="/surat-siswa/persetujuan-5-hari-kerja" className="w-full">
            <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-xs flex items-center justify-center gap-2 text-xs sm:text-sm h-9 sm:h-10">
              <FileCheck className="w-4 h-4" /> Persetujuan 5 Hari
            </Button>
          </Link>
          <Link href="/surat-siswa/dispensasi" className="w-full">
            <Button className="w-full bg-white text-blue-900 hover:bg-blue-50 font-semibold shadow-xs flex items-center justify-center gap-2 text-xs sm:text-sm h-9 sm:h-10">
              <PlusCircle className="w-4 h-4" /> Dispensasi
            </Button>
          </Link>
          <Link href="/surat-siswa/keterangan-aktif" className="w-full">
            <Button
              variant="outline"
              className="w-full bg-blue-600/40 border-blue-300/40 text-white hover:bg-blue-600/60 flex items-center justify-center gap-2 text-xs sm:text-sm h-9 sm:h-10"
            >
              <FileText className="w-4 h-4" /> Ket. Aktif
            </Button>
          </Link>
          <Link href="/surat-siswa/panggilan-ortu" className="w-full">
            <Button
              variant="outline"
              className="w-full bg-blue-600/40 border-blue-300/40 text-white hover:bg-blue-600/60 flex items-center justify-center gap-2 text-xs sm:text-sm h-9 sm:h-10"
            >
              <PhoneCall className="w-4 h-4" /> Panggilan Ortu
            </Button>
          </Link>
        </div>
      </div>

      {/* Toolbar Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor surat, nama siswa, atau keperluan surat..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="sm:col-span-4">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Semua Jenis Surat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Jenis Surat ({data.length})</SelectItem>
                <SelectItem value="DISPENSASI">Surat Dispensasi Siswa</SelectItem>
                <SelectItem value="KETERANGAN_AKTIF">Surat Keterangan Siswa Aktif</SelectItem>
                <SelectItem value="PANGGILAN_ORTU">Surat Panggilan Orang Tua</SelectItem>
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
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-gray-300">|</span>
            <span>
              Menampilkan <strong>{totalRecords === 0 ? 0 : startIndex + 1}-{endIndex}</strong> dari total <strong>{totalRecords}</strong> surat
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

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-gray-50 text-[11px] font-bold text-gray-700 uppercase border-b border-gray-200">
              <tr>
                <th className="p-3.5 text-center w-12 border-r">No</th>
                <th className="p-3.5 border-r">Jenis & Nomor Surat</th>
                <th className="p-3.5 border-r">Nama Siswa / Peserta</th>
                <th className="p-3.5 border-r">Kelas</th>
                <th className="p-3.5 border-r">Keperluan / Kegiatan</th>
                <th className="p-3.5 border-r">Tanggal Terbit</th>
                <th className="p-3.5 text-center w-36">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-gray-400 text-xs">
                    Belum ada riwayat surat kesiswaan yang sesuai filter.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, idx) => {
                  let namaDisplay = item.siswa?.nama || '-';
                  let kelasDisplay = item.siswa?.kelas?.kodeKelas || item.kelas?.kodeKelas || '-';
                  if (item.tipeSurat === 'DISPENSASI' && item.participants && item.participants.length > 0) {
                    namaDisplay = `${item.participants[0].siswa?.nama} (+${item.participants.length - 1} siswa)`;
                    kelasDisplay = item.participants[0].siswa?.kelas?.kodeKelas || '-';
                  }

                  return (
                    <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="p-3.5 text-center font-medium text-gray-500 border-r">
                        {startIndex + idx + 1}
                      </td>

                      <td className="p-3.5 border-r">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-1 ${
                            item.tipeSurat === 'DISPENSASI'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : item.tipeSurat === 'KETERANGAN_AKTIF'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {item.tipeSurat === 'DISPENSASI'
                            ? 'Dispensasi'
                            : item.tipeSurat === 'KETERANGAN_AKTIF'
                              ? 'Ket. Aktif'
                              : 'Panggilan Ortu'}
                        </span>
                        <span className="font-mono font-bold text-gray-900 block text-xs">
                          {item.nomorSurat}
                        </span>
                      </td>

                      <td className="p-3.5 font-bold text-gray-900 border-r">
                        {namaDisplay}
                      </td>

                      <td className="p-3.5 border-r">
                        <span className="bg-gray-100 text-gray-800 font-semibold px-2 py-0.5 rounded text-[11px]">
                          {kelasDisplay}
                        </span>
                      </td>

                      <td className="p-3.5 border-r text-gray-700 max-w-xs truncate">
                        {item.namaKegiatan || item.keperluan || '-'}
                      </td>

                      <td className="p-3.5 border-r text-gray-600 text-[11px]">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                      </td>

                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link href={`/surat-siswa/${item.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2.5 text-xs text-blue-700 border-blue-200 hover:bg-blue-50 flex items-center gap-1"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Cetak</span>
                            </Button>
                          </Link>
                          <DeleteStudentLetterButton id={item.id} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-gray-500 font-medium">
            Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong> (Total {totalRecords} Surat)
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

            <span className="font-semibold text-gray-700 px-2.5 py-1 bg-white border border-gray-200 rounded-md">
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
      </div>
    </div>
  );
}
