'use client';

import { useState, useEffect, useMemo } from 'react';
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
  Printer,
  Inbox,
  Send,
  Search,
  GraduationCap,
  Calendar,
  FileSpreadsheet,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { getIncomingLetters } from '@/features/incoming-letter/actions';
import { getSuratKeluarList } from '@/features/surat-keluar/actions/surat';
import { getStudentLetters } from '@/features/student-letter/actions';
import { toast } from 'sonner';

export default function AgendaDigitalPage() {
  const [activeTab, setActiveTab] = useState<'masuk' | 'keluar' | 'siswa'>('masuk');
  const [incomingData, setIncomingData] = useState<any[]>([]);
  const [outgoingData, setOutgoingData] = useState<any[]>([]);
  const [studentData, setStudentData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(25);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resMasuk, resKeluar, resSiswa] = await Promise.all([
        getIncomingLetters({ limit: 500 }),
        getSuratKeluarList({ limit: 500 }),
        getStudentLetters(),
      ]);

      if (resMasuk.success && resMasuk.data) {
        setIncomingData(resMasuk.data);
      }
      if (resKeluar.success && resKeluar.data) {
        setOutgoingData(resKeluar.data);
      }
      if (resSiswa.success && resSiswa.data) {
        setStudentData(resSiswa.data);
      }
    } catch {
      toast.error('Gagal memuat data agenda persuratan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Reset page when tab or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search, startDate, endDate, pageSize]);

  const isDateInRange = (dateStr?: string | Date | null) => {
    if (!dateStr) return true;
    const d = new Date(dateStr);
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (d < start) return false;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (d > end) return false;
    }
    return true;
  };

  const filteredIncoming = useMemo(() => {
    return incomingData.filter((item) => {
      if (!isDateInRange(item.tanggalDiterima || item.tanggalSurat)) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        item.nomorSurat?.toLowerCase().includes(q) ||
        item.nomorAgenda?.toLowerCase().includes(q) ||
        item.pengirim?.toLowerCase().includes(q) ||
        item.perihal?.toLowerCase().includes(q)
      );
    });
  }, [incomingData, startDate, endDate, search]);

  const filteredOutgoing = useMemo(() => {
    return outgoingData.filter((item) => {
      if (!isDateInRange(item.tanggalSurat || item.createdAt)) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        item.nomorSurat?.toLowerCase().includes(q) ||
        item.nomorAgenda?.toLowerCase().includes(q) ||
        item.tujuanSurat?.toLowerCase().includes(q) ||
        item.perihal?.toLowerCase().includes(q)
      );
    });
  }, [outgoingData, startDate, endDate, search]);

  const filteredStudent = useMemo(() => {
    return studentData.filter((item) => {
      if (!isDateInRange(item.createdAt)) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        item.nomorSurat?.toLowerCase().includes(q) ||
        item.siswa?.nama?.toLowerCase().includes(q) ||
        item.namaKegiatan?.toLowerCase().includes(q) ||
        item.keperluan?.toLowerCase().includes(q)
      );
    });
  }, [studentData, startDate, endDate, search]);

  const activeDataset =
    activeTab === 'masuk'
      ? filteredIncoming
      : activeTab === 'keluar'
      ? filteredOutgoing
      : filteredStudent;

  const totalRecords = activeDataset.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);
  const paginatedData = activeDataset.slice(startIndex, endIndex);

  const resetFilters = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
  };

  const handlePrint = () => {
    window.print();
  };

  const exportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (activeTab === 'masuk') {
      csvContent += 'No,No Agenda,Tgl Terima,Nomor Surat,Tgl Surat,Asal Surat,Perihal,Status\n';
      filteredIncoming.forEach((item, index) => {
        const row = [
          index + 1,
          `"${item.nomorAgenda || '-'}"`,
          `"${item.tanggalDiterima ? new Date(item.tanggalDiterima).toLocaleDateString('id-ID') : '-'}"`,
          `"${item.nomorSurat || '-'}"`,
          `"${item.tanggalSurat ? new Date(item.tanggalSurat).toLocaleDateString('id-ID') : '-'}"`,
          `"${(item.pengirim || '').replace(/"/g, '""')}"`,
          `"${(item.perihal || '').replace(/"/g, '""')}"`,
          `"${item.status || '-'}"`,
        ].join(',');
        csvContent += row + '\n';
      });
    } else if (activeTab === 'keluar') {
      csvContent += 'No,No Agenda,Tgl Surat,Nomor Surat,Tujuan Surat,Perihal,Status\n';
      filteredOutgoing.forEach((item, index) => {
        const row = [
          index + 1,
          `"${item.nomorAgenda || '-'}"`,
          `"${item.tanggalSurat ? new Date(item.tanggalSurat).toLocaleDateString('id-ID') : '-'}"`,
          `"${item.nomorSurat || '-'}"`,
          `"${(item.tujuanSurat || '').replace(/"/g, '""')}"`,
          `"${(item.perihal || '').replace(/"/g, '""')}"`,
          `"${item.status || '-'}"`,
        ].join(',');
        csvContent += row + '\n';
      });
    } else {
      csvContent += 'No,Jenis Surat,Nomor Surat,Tgl Terbit,Nama Siswa/Kegiatan,Kelas,Keperluan,Status\n';
      filteredStudent.forEach((item, index) => {
        const row = [
          index + 1,
          `"${item.tipeSurat || '-'}"`,
          `"${item.nomorSurat || '-'}"`,
          `"${item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID') : '-'}"`,
          `"${(item.namaKegiatan || item.siswa?.nama || '-').replace(/"/g, '""')}"`,
          `"${item.siswa?.kelas?.namaKelas || item.kelas?.namaKelas || '-'}"`,
          `"${(item.keperluan || item.catatanKhusus || '-').replace(/"/g, '""')}"`,
          `"${item.status || '-'}"`,
        ].join(',');
        csvContent += row + '\n';
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `buku_agenda_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Buku agenda berhasil diekspor ke format CSV');
  };

  return (
    <div className='space-y-6'>
      {/* Action Header (Hidden on Print) */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs print:hidden'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-gray-900'>Agenda Digital Persuratan</h1>
          <p className='text-xs text-gray-500 mt-1'>
            Buku register dan agenda otomatis seluruh naskah dinas masuk, naskah dinas keluar, dan surat kesiswaan.
          </p>
        </div>

        <div className='flex items-center gap-2 w-full sm:w-auto'>
          <Button
            variant='outline'
            size='sm'
            onClick={loadData}
            disabled={loading}
            className='text-xs h-9 font-semibold'
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Segarkan
          </Button>

          <Button
            variant='outline'
            size='sm'
            onClick={exportCSV}
            className='text-xs h-9 font-semibold text-emerald-700 hover:bg-emerald-50 border-emerald-200'
          >
            <FileSpreadsheet className='w-3.5 h-3.5 mr-1.5 text-emerald-600' />
            Ekspor Excel / CSV
          </Button>

          <Button
            size='sm'
            onClick={handlePrint}
            className='bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 font-semibold shadow-xs'
          >
            <Printer className='w-3.5 h-3.5 mr-1.5' />
            Cetak Buku Agenda
          </Button>
        </div>
      </div>

      {/* Summary Cards (Hidden on Print) */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden'>
        <div
          onClick={() => setActiveTab('masuk')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            activeTab === 'masuk'
              ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className='flex items-center justify-between'>
            <span className='text-xs font-semibold text-gray-500'>Surat Masuk</span>
            <Inbox className='w-4 h-4 text-blue-600' />
          </div>
          <p className='text-2xl font-bold text-gray-900 mt-1'>{filteredIncoming.length}</p>
          <p className='text-[11px] text-gray-400 mt-0.5'>Total agenda tercatat</p>
        </div>

        <div
          onClick={() => setActiveTab('keluar')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            activeTab === 'keluar'
              ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className='flex items-center justify-between'>
            <span className='text-xs font-semibold text-gray-500'>Surat Keluar (Dinas)</span>
            <Send className='w-4 h-4 text-emerald-600' />
          </div>
          <p className='text-2xl font-bold text-gray-900 mt-1'>{filteredOutgoing.length}</p>
          <p className='text-[11px] text-gray-400 mt-0.5'>Total agenda diterbitkan</p>
        </div>

        <div
          onClick={() => setActiveTab('siswa')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            activeTab === 'siswa'
              ? 'bg-purple-50/70 border-purple-300 ring-2 ring-purple-500/20'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className='flex items-center justify-between'>
            <span className='text-xs font-semibold text-gray-500'>Surat Kesiswaan</span>
            <GraduationCap className='w-4 h-4 text-purple-600' />
          </div>
          <p className='text-2xl font-bold text-gray-900 mt-1'>{filteredStudent.length}</p>
          <p className='text-[11px] text-gray-400 mt-0.5'>Dispensasi, aktif & panggilan</p>
        </div>
      </div>

      {/* Printable Header (Visible only when Printing) */}
      <div className='hidden print:block text-center border-b-2 border-black pb-4 mb-6'>
        <h2 className='text-xl font-bold uppercase tracking-wider'>
          BUKU AGENDA PERSURATAN RESMI SEKOLAH
        </h2>
        <p className='text-sm font-semibold'>
          Kategori:{' '}
          {activeTab === 'masuk'
            ? 'AGENDA SURAT MASUK'
            : activeTab === 'keluar'
            ? 'AGENDA SURAT KELUAR'
            : 'AGENDA SURAT KESISWAAN'}
        </p>
        {(startDate || endDate) && (
          <p className='text-xs text-gray-700'>
            Periode: {startDate ? new Date(startDate).toLocaleDateString('id-ID') : 'Awal'} s/d{' '}
            {endDate ? new Date(endDate).toLocaleDateString('id-ID') : 'Sekarang'}
          </p>
        )}
        <p className='text-[11px] text-gray-600 mt-1'>
          Dicetak pada: {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
        </p>
      </div>

      {/* Filter Toolbar (Hidden on Print) */}
      <div className='bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3 print:hidden'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          {/* Tabs */}
          <div className='flex border rounded-lg p-1 bg-gray-100/80'>
            <button
              onClick={() => setActiveTab('masuk')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'masuk'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Inbox className='w-3.5 h-3.5' /> Surat Masuk ({filteredIncoming.length})
            </button>
            <button
              onClick={() => setActiveTab('keluar')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'keluar'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Send className='w-3.5 h-3.5' /> Surat Keluar ({filteredOutgoing.length})
            </button>
            <button
              onClick={() => setActiveTab('siswa')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'siswa'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <GraduationCap className='w-3.5 h-3.5' /> Surat Siswa ({filteredStudent.length})
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className='grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-gray-100'>
          <div className='sm:col-span-6 relative'>
            <Search className='w-4 h-4 text-gray-400 absolute left-3 top-2.5' />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Cari nomor agenda, nomor surat, perihal, atau tujuan...'
              className='pl-9 text-xs h-9'
            />
          </div>

          <div className='sm:col-span-3 flex items-center gap-1.5'>
            <Calendar className='w-4 h-4 text-gray-400 shrink-0' />
            <Input
              type='date'
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className='text-xs h-9'
              title='Tanggal Awal'
            />
          </div>

          <div className='sm:col-span-3 flex items-center gap-2'>
            <Input
              type='date'
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className='text-xs h-9 flex-1'
              title='Tanggal Akhir'
            />
            {(search || startDate || endDate) && (
              <Button
                variant='ghost'
                size='sm'
                onClick={resetFilters}
                className='text-xs text-red-600 h-9 px-2'
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Page Size & Counter info */}
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
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-gray-300">|</span>
            <span>
              Menampilkan <strong>{totalRecords === 0 ? 0 : startIndex + 1}-{endIndex}</strong> dari total <strong>{totalRecords}</strong> data
            </span>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className='bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden print:border-none print:shadow-none'>
        <div className='overflow-x-auto'>
          {activeTab === 'masuk' && (
            <table className='w-full text-xs text-left border-collapse'>
              <thead className='bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-600 uppercase print:bg-gray-100'>
                <tr>
                  <th className='p-3 text-center w-10 border'>No</th>
                  <th className='p-3 border'>No. Agenda</th>
                  <th className='p-3 border'>Tgl Terima</th>
                  <th className='p-3 border'>Nomor Surat</th>
                  <th className='p-3 border'>Tgl Surat</th>
                  <th className='p-3 border'>Asal Surat / Pengirim</th>
                  <th className='p-3 border'>Perihal / Isi Ringkas</th>
                  <th className='p-3 border text-center'>Status</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {loading ? (
                  <tr>
                    <td colSpan={8} className='p-8 text-center text-gray-500'>
                      Memuat data agenda surat masuk...
                    </td>
                  </tr>
                ) : filteredIncoming.length === 0 ? (
                  <tr>
                    <td colSpan={8} className='p-8 text-center text-gray-500'>
                      Tidak ada data surat masuk yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('print').matches
                    ? filteredIncoming
                    : paginatedData
                  ).map((item, idx) => (
                    <tr key={item.id || idx} className='hover:bg-gray-50/80'>
                      <td className='p-2.5 text-center border font-medium text-gray-500'>
                        {startIndex + idx + 1}
                      </td>
                      <td className='p-2.5 border font-bold text-blue-700 whitespace-nowrap'>
                        {item.nomorAgenda || '-'}
                      </td>
                      <td className='p-2.5 border whitespace-nowrap'>
                        {item.tanggalDiterima
                          ? new Date(item.tanggalDiterima).toLocaleDateString('id-ID')
                          : '-'}
                      </td>
                      <td className='p-2.5 border font-semibold text-gray-900 whitespace-nowrap'>
                        {item.nomorSurat}
                      </td>
                      <td className='p-2.5 border whitespace-nowrap'>
                        {item.tanggalSurat
                          ? new Date(item.tanggalSurat).toLocaleDateString('id-ID')
                          : '-'}
                      </td>
                      <td className='p-2.5 border font-medium text-gray-900'>
                        {item.pengirim}
                      </td>
                      <td className='p-2.5 border text-gray-700'>{item.perihal}</td>
                      <td className='p-2.5 border text-center whitespace-nowrap'>
                        <span className='inline-block px-2 py-0.5 text-[10px] font-semibold rounded bg-blue-50 text-blue-700 border border-blue-200'>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'keluar' && (
            <table className='w-full text-xs text-left border-collapse'>
              <thead className='bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-600 uppercase print:bg-gray-100'>
                <tr>
                  <th className='p-3 text-center w-10 border'>No</th>
                  <th className='p-3 border'>No. Agenda</th>
                  <th className='p-3 border'>Tgl Surat</th>
                  <th className='p-3 border'>Nomor Surat</th>
                  <th className='p-3 border'>Tujuan Surat / Penerima</th>
                  <th className='p-3 border'>Perihal / Isi Ringkas</th>
                  <th className='p-3 border text-center'>Status</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {loading ? (
                  <tr>
                    <td colSpan={7} className='p-8 text-center text-gray-500'>
                      Memuat data agenda surat keluar...
                    </td>
                  </tr>
                ) : filteredOutgoing.length === 0 ? (
                  <tr>
                    <td colSpan={7} className='p-8 text-center text-gray-500'>
                      Tidak ada data surat keluar yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('print').matches
                    ? filteredOutgoing
                    : paginatedData
                  ).map((item, idx) => (
                    <tr key={item.id || idx} className='hover:bg-gray-50/80'>
                      <td className='p-2.5 text-center border font-medium text-gray-500'>
                        {startIndex + idx + 1}
                      </td>
                      <td className='p-2.5 border font-bold text-emerald-700 whitespace-nowrap'>
                        {item.nomorAgenda || '-'}
                      </td>
                      <td className='p-2.5 border whitespace-nowrap'>
                        {item.tanggalSurat
                          ? new Date(item.tanggalSurat).toLocaleDateString('id-ID')
                          : '-'}
                      </td>
                      <td className='p-2.5 border font-semibold text-gray-900 whitespace-nowrap'>
                        {item.nomorSurat || 'Belum Terbit'}
                      </td>
                      <td className='p-2.5 border font-medium text-gray-900'>
                        {item.tujuanSurat || '-'}
                      </td>
                      <td className='p-2.5 border text-gray-700'>{item.perihal}</td>
                      <td className='p-2.5 border text-center whitespace-nowrap'>
                        <span className='inline-block px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-50 text-emerald-700 border border-emerald-200'>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'siswa' && (
            <table className='w-full text-xs text-left border-collapse'>
              <thead className='bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-600 uppercase print:bg-gray-100'>
                <tr>
                  <th className='p-3 text-center w-10 border'>No</th>
                  <th className='p-3 border'>Jenis Surat</th>
                  <th className='p-3 border'>Nomor Surat</th>
                  <th className='p-3 border'>Tgl Terbit</th>
                  <th className='p-3 border'>Nama Siswa / Kegiatan</th>
                  <th className='p-3 border'>Kelas</th>
                  <th className='p-3 border'>Keperluan</th>
                  <th className='p-3 border text-center'>Status</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {loading ? (
                  <tr>
                    <td colSpan={8} className='p-8 text-center text-gray-500'>
                      Memuat data agenda surat kesiswaan...
                    </td>
                  </tr>
                ) : filteredStudent.length === 0 ? (
                  <tr>
                    <td colSpan={8} className='p-8 text-center text-gray-500'>
                      Tidak ada data surat kesiswaan yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('print').matches
                    ? filteredStudent
                    : paginatedData
                  ).map((item, idx) => (
                    <tr key={item.id || idx} className='hover:bg-gray-50/80'>
                      <td className='p-2.5 text-center border font-medium text-gray-500'>
                        {startIndex + idx + 1}
                      </td>
                      <td className='p-2.5 border font-semibold text-purple-700 whitespace-nowrap'>
                        {item.tipeSurat === 'DISPENSASI'
                          ? 'Dispensasi'
                          : item.tipeSurat === 'KETERANGAN_AKTIF'
                          ? 'Keterangan Aktif'
                          : 'Panggilan Ortu'}
                      </td>
                      <td className='p-2.5 border font-mono font-medium text-gray-900 whitespace-nowrap'>
                        {item.nomorSurat}
                      </td>
                      <td className='p-2.5 border whitespace-nowrap'>
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString('id-ID')
                          : '-'}
                      </td>
                      <td className='p-2.5 border font-bold text-gray-900'>
                        {item.namaKegiatan || item.siswa?.nama || '-'}
                      </td>
                      <td className='p-2.5 border text-gray-700 whitespace-nowrap'>
                        {item.siswa?.kelas?.namaKelas || item.kelas?.namaKelas || '-'}
                      </td>
                      <td className='p-2.5 border text-gray-700'>
                        {item.keperluan || item.catatanKhusus || '-'}
                      </td>
                      <td className='p-2.5 border text-center whitespace-nowrap'>
                        <span className='inline-block px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-50 text-emerald-700 border border-emerald-200'>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Screen Pagination Footer (Hidden on Print) */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs print:hidden">
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

      {/* Signature Section on Print */}
      <div className='hidden print:grid grid-cols-2 gap-8 pt-12 text-center text-xs'>
        <div>
          <p className='text-gray-600'>Mengetahui,</p>
          <p className='font-bold'>Kepala Sekolah</p>
          <div className='h-20' />
          <p className='font-bold underline'>(...................................................)</p>
          <p className='text-gray-600'>NIP. ...........................................</p>
        </div>

        <div>
          <p className='text-gray-600'>
            {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}
          </p>
          <p className='font-bold'>Pengelola Agenda & Arsip</p>
          <div className='h-20' />
          <p className='font-bold underline'>(...................................................)</p>
          <p className='text-gray-600'>NIP. ...........................................</p>
        </div>
      </div>
    </div>
  );
}
