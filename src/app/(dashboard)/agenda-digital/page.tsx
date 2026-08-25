'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Printer,
  Inbox,
  Send,
  Search,
  GraduationCap,
  Calendar,
  FileSpreadsheet,
  RefreshCw,
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

  const filteredIncoming = incomingData.filter((item) => {
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

  const filteredOutgoing = outgoingData.filter((item) => {
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

  const filteredStudent = studentData.filter((item) => {
    if (!isDateInRange(item.createdAt)) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.nomorSurat?.toLowerCase().includes(q) ||
      item.namaKegiatan?.toLowerCase().includes(q) ||
      item.siswa?.nama?.toLowerCase().includes(q) ||
      item.keperluan?.toLowerCase().includes(q)
    );
  });

  const exportToCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    const filename = `buku-agenda-${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`;

    if (activeTab === 'masuk') {
      headers = [
        'No',
        'No. Agenda',
        'No. Surat',
        'Tgl Surat',
        'Tgl Diterima',
        'Pengirim / Instansi',
        'Perihal',
        'Ringkasan',
        'Status',
      ];
      rows = filteredIncoming.map((item, idx) => [
        String(idx + 1),
        `"${item.nomorAgenda || '-'}"`,
        `"${item.nomorSurat || '-'}"`,
        item.tanggalSurat ? new Date(item.tanggalSurat).toLocaleDateString('id-ID') : '-',
        item.tanggalDiterima ? new Date(item.tanggalDiterima).toLocaleDateString('id-ID') : '-',
        `"${item.pengirim || '-'}"`,
        `"${item.perihal || '-'}"`,
        `"${item.ringkasanIsi || '-'}"`,
        item.status || '-',
      ]);
    } else if (activeTab === 'keluar') {
      headers = [
        'No',
        'No. Agenda',
        'No. Surat',
        'Tgl Surat',
        'Tujuan Surat',
        'Perihal',
        'Jenis Surat',
        'Pembuat',
        'Status',
      ];
      rows = filteredOutgoing.map((item, idx) => [
        String(idx + 1),
        `"${item.nomorAgenda || '-'}"`,
        `"${item.nomorSurat || 'DRAFT'}"`,
        item.tanggalSurat ? new Date(item.tanggalSurat).toLocaleDateString('id-ID') : '-',
        `"${item.tujuanSurat || '-'}"`,
        `"${item.perihal || '-'}"`,
        `"${item.jenisSurat?.nama || '-'}"`,
        `"${item.pembuat?.nama || '-'}"`,
        item.status || '-',
      ]);
    } else {
      headers = [
        'No',
        'Tipe Surat',
        'No. Surat',
        'Tgl Terbit',
        'Nama Siswa / Kegiatan',
        'Kelas',
        'Keperluan / Perihal',
        'Status',
      ];
      rows = filteredStudent.map((item, idx) => [
        String(idx + 1),
        item.tipeSurat || '-',
        `"${item.nomorSurat || '-'}"`,
        item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID') : '-',
        `"${item.namaKegiatan || item.siswa?.nama || '-'}"`,
        `"${item.siswa?.kelas?.kodeKelas || item.kelas?.kodeKelas || '-'}"`,
        `"${item.keperluan || item.catatanKhusus || '-'}"`,
        item.status || '-',
      ]);
    }

    const csvContent =
      '\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Data ${filename} berhasil diexport!`);
  };

  const handlePrint = () => {
    window.print();
  };

  const resetFilters = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className='space-y-6'>
      {/* Header (Hidden on Print) */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2'>
            <Calendar className='w-6 h-6 text-blue-600' /> Buku Agenda & Rekapitulasi Digital
          </h1>
          <p className='text-sm text-gray-500'>
            Rekapitulasi resmi surat masuk, surat keluar, dan surat kesiswaan untuk arsip dinas & akreditasi sekolah.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            onClick={exportToCSV}
            className='flex items-center gap-1.5 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50'
          >
            <FileSpreadsheet className='w-4 h-4' /> Export Excel / CSV
          </Button>
          <Button
            onClick={handlePrint}
            className='flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-xs'
          >
            <Printer className='w-4 h-4' /> Cetak Lembar Agenda
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
              <GraduationCap className='w-3.5 h-3.5' /> Kesiswaan ({filteredStudent.length})
            </button>
          </div>

          {/* Quick Refresh */}
          <Button variant='ghost' size='sm' onClick={loadData} className='text-xs text-gray-500'>
            <RefreshCw className='w-3.5 h-3.5 mr-1' /> Muat Ulang
          </Button>
        </div>

        {/* Search & Date Filter */}
        <div className='grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1 border-t border-gray-100'>
          <div className='sm:col-span-2 relative'>
            <Search className='w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
            <Input
              placeholder='Cari nomor agenda, nomor surat, perihal, nama...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='pl-9 text-xs h-9'
            />
          </div>

          <div>
            <Input
              type='date'
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className='text-xs h-9'
              title='Tanggal Mulai'
            />
          </div>

          <div className='flex items-center gap-2'>
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
                  filteredIncoming.map((item, idx) => (
                    <tr key={item.id || idx} className='hover:bg-gray-50/80'>
                      <td className='p-2.5 text-center border font-medium text-gray-500'>
                        {idx + 1}
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
                      <td className='p-2.5 border font-medium text-gray-800'>{item.pengirim}</td>
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
                  <th className='p-3 border'>Nomor Surat</th>
                  <th className='p-3 border'>Tgl Surat</th>
                  <th className='p-3 border'>Tujuan Surat</th>
                  <th className='p-3 border'>Perihal</th>
                  <th className='p-3 border'>Jenis</th>
                  <th className='p-3 border text-center'>Status</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {loading ? (
                  <tr>
                    <td colSpan={8} className='p-8 text-center text-gray-500'>
                      Memuat data agenda surat keluar...
                    </td>
                  </tr>
                ) : filteredOutgoing.length === 0 ? (
                  <tr>
                    <td colSpan={8} className='p-8 text-center text-gray-500'>
                      Tidak ada data surat keluar yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  filteredOutgoing.map((item, idx) => (
                    <tr key={item.id || idx} className='hover:bg-gray-50/80'>
                      <td className='p-2.5 text-center border font-medium text-gray-500'>
                        {idx + 1}
                      </td>
                      <td className='p-2.5 border font-bold text-emerald-700 whitespace-nowrap'>
                        {item.nomorAgenda || '-'}
                      </td>
                      <td className='p-2.5 border font-semibold text-gray-900 whitespace-nowrap'>
                        {item.nomorSurat || <span className='text-gray-400 italic'>Draft</span>}
                      </td>
                      <td className='p-2.5 border whitespace-nowrap'>
                        {item.tanggalSurat
                          ? new Date(item.tanggalSurat).toLocaleDateString('id-ID')
                          : '-'}
                      </td>
                      <td className='p-2.5 border font-medium text-gray-800'>{item.tujuanSurat}</td>
                      <td className='p-2.5 border text-gray-700'>{item.perihal}</td>
                      <td className='p-2.5 border text-gray-600 whitespace-nowrap'>
                        {item.jenisSurat?.nama || '-'}
                      </td>
                      <td className='p-2.5 border text-center whitespace-nowrap'>
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded border ${
                            item.status === 'APPROVED' || item.status === 'PUBLISHED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
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
                  <th className='p-3 border'>Keperluan / Catatan</th>
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
                  filteredStudent.map((item, idx) => (
                    <tr key={item.id || idx} className='hover:bg-gray-50/80'>
                      <td className='p-2.5 text-center border font-medium text-gray-500'>
                        {idx + 1}
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
