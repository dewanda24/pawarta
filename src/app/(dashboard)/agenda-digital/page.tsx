'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Printer, Inbox, Send, Search } from 'lucide-react';
import { getIncomingLetters } from '@/features/incoming-letter/actions';
import { toast } from 'sonner';

interface AgendaItem {
  id?: string;
  nomorAgenda?: string;
  nomorSurat?: string;
  tanggalSurat?: string | Date;
  tanggalDiterima?: string | Date;
  pengirim?: string;
  perihal?: string;
  ringkasanIsi?: string;
  status?: string;
  klasifikasi?: { kode?: string; nama?: string };
}

export default function AgendaDigitalPage() {
  const [activeTab, setActiveTab] = useState<'masuk' | 'keluar'>('masuk');
  const [incomingData, setIncomingData] = useState<AgendaItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await getIncomingLetters({ limit: 100 });
        if (res.success && res.data) {
          setIncomingData(res.data as unknown as AgendaItem[]);
        }
      } catch {
        toast.error('Gagal memuat agenda surat');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredIncoming = incomingData.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.nomorSurat?.toLowerCase().includes(q) ||
      item.nomorAgenda?.toLowerCase().includes(q) ||
      item.pengirim?.toLowerCase().includes(q) ||
      item.perihal?.toLowerCase().includes(q)
    );
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Buku Agenda Persuratan
          </h1>
          <p className="text-sm text-gray-500">
            Rekapitulasi resmi surat masuk dan surat keluar untuk arsip & laporan akreditasi
            sekolah.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800"
          >
            <Printer className="w-4 h-4" /> Cetak Lembar Agenda
          </Button>
        </div>
      </div>

      {/* Printable Header (Visible only when Printing) */}
      <div className="hidden print:block text-center border-b-2 border-black pb-4 mb-6">
        <h2 className="text-xl font-bold uppercase tracking-wider">
          BUKU AGENDA PERSURATAN SEKOLAH
        </h2>
        <p className="text-sm">Jenis: {activeTab === 'masuk' ? 'SURAT MASUK' : 'SURAT KELUAR'}</p>
        <p className="text-xs text-gray-600">
          Dicetak pada: {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
        </p>
      </div>

      {/* Tabs & Filter (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div className="flex border rounded-lg p-1 bg-gray-100/80">
          <button
            onClick={() => setActiveTab('masuk')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'masuk'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Inbox className="w-4 h-4" /> Agenda Surat Masuk
          </button>
          <button
            onClick={() => setActiveTab('keluar')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'keluar'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Send className="w-4 h-4" /> Agenda Surat Keluar
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Cari agenda, nomor, perihal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden print:border-none print:shadow-none">
        <div className="overflow-x-auto">
          {activeTab === 'masuk' ? (
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase print:bg-gray-100">
                <tr>
                  <th className="p-3.5 text-center w-12 border">No</th>
                  <th className="p-3.5 border">No. Agenda</th>
                  <th className="p-3.5 border">Tgl Terima</th>
                  <th className="p-3.5 border">Nomor Surat</th>
                  <th className="p-3.5 border">Tgl Surat</th>
                  <th className="p-3.5 border">Asal Surat / Pengirim</th>
                  <th className="p-3.5 border">Perihal / Isi Ringkas</th>
                  <th className="p-3.5 border">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500">
                      Memuat data agenda...
                    </td>
                  </tr>
                ) : filteredIncoming.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500">
                      Belum ada catatan agenda surat masuk.
                    </td>
                  </tr>
                ) : (
                  filteredIncoming.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-gray-50/80">
                      <td className="p-3 text-center border font-medium text-gray-500">
                        {idx + 1}
                      </td>
                      <td className="p-3 border font-semibold text-blue-700">
                        {item.nomorAgenda || '-'}
                      </td>
                      <td className="p-3 border whitespace-nowrap">
                        {item.tanggalDiterima
                          ? new Date(item.tanggalDiterima).toLocaleDateString('id-ID')
                          : '-'}
                      </td>
                      <td className="p-3 border font-medium text-gray-900">{item.nomorSurat}</td>
                      <td className="p-3 border whitespace-nowrap">
                        {item.tanggalSurat
                          ? new Date(item.tanggalSurat).toLocaleDateString('id-ID')
                          : '-'}
                      </td>
                      <td className="p-3 border font-medium text-gray-800">{item.pengirim}</td>
                      <td className="p-3 border text-gray-700">{item.perihal}</td>
                      <td className="p-3 border">
                        <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-blue-50 text-blue-700 border border-blue-200">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <Send className="w-10 h-10 mx-auto text-gray-300 mb-3" />
              <p className="font-medium text-gray-700">Agenda Surat Keluar</p>
              <p className="text-xs text-gray-400 mt-1">
                Daftar penomoran surat keluar yang telah diterbitkan sekolah.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
