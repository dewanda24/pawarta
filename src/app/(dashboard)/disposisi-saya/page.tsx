'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMyDispositions, updateDispositionStatus } from '@/features/incoming-letter/actions';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';
import { ClipboardList, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  MENUNGGU: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  PROSES: 'bg-blue-100 text-blue-800 border border-blue-200',
  SELESAI: 'bg-green-100 text-green-800 border border-green-200',
};

export default function DisposisiSayaPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'MENUNGGU' | 'PROSES' | 'SELESAI' | 'SEMUA'>('SEMUA');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyDispositions();
      if (res.success) setData(res.data || []);
    } catch {
      toast.error('Gagal memuat disposisi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdateStatus = async (id: string, status: 'PROSES' | 'SELESAI') => {
    setUpdatingId(id);
    try {
      const res = await updateDispositionStatus(id, status);
      if (res.success) {
        toast.success(status === 'SELESAI' ? 'Disposisi diselesaikan' : 'Disposisi ditandai sedang diproses');
        fetchData();
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error('Gagal memperbarui status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = activeTab === 'SEMUA' ? data : data.filter((d) => d.status === activeTab);

  const tabs: { label: string; value: typeof activeTab }[] = [
    { label: 'Semua', value: 'SEMUA' },
    { label: 'Menunggu', value: 'MENUNGGU' },
    { label: 'Diproses', value: 'PROSES' },
    { label: 'Selesai', value: 'SELESAI' },
  ];

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-purple-700 to-indigo-800 text-white p-6 rounded-2xl shadow-sm'>
        <div>
          <div className='flex items-center gap-2 text-purple-200 text-xs font-semibold uppercase tracking-wider mb-1'>
            <ClipboardList className='w-4 h-4' />
            <span>Inbox Disposisi</span>
          </div>
          <h1 className='text-2xl font-bold tracking-tight'>Disposisi Saya</h1>
          <p className='text-purple-100 text-sm mt-1'>Daftar surat yang didisposisikan kepada Anda untuk ditindaklanjuti.</p>
        </div>
        <div className='bg-white/20 px-4 py-2 rounded-xl text-center'>
          <p className='text-2xl font-bold'>{data.filter(d => d.status === 'MENUNGGU').length}</p>
          <p className='text-xs text-purple-200'>Menunggu Tindakan</p>
        </div>
      </div>

      {/* Tabs */}
      <div className='flex border rounded-lg p-1 bg-gray-100/80 w-fit gap-1'>
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={'px-4 py-2 text-sm font-medium rounded-md transition-all ' + (activeTab === tab.value ? 'bg-white text-purple-700 shadow-xs' : 'text-gray-600 hover:text-gray-900')}
          >
            {tab.label}
            {tab.value !== 'SEMUA' && (
              <span className='ml-1.5 text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full'>
                {data.filter(d => d.status === tab.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className='flex items-center justify-center py-16 text-gray-400'>
          <Loader2 className='w-6 h-6 animate-spin mr-2' /> Memuat disposisi...
        </div>
      ) : filtered.length === 0 ? (
        <div className='text-center py-16 text-gray-400'>
          <ClipboardList className='w-12 h-12 mx-auto mb-3 opacity-30' />
          <p className='font-medium'>Tidak ada disposisi</p>
          <p className='text-sm'>Belum ada surat yang didisposisikan kepada Anda pada kategori ini.</p>
        </div>
      ) : (
        <div className='space-y-3'>
          {filtered.map((item) => (
            <div key={item.id} className='bg-white rounded-xl border border-gray-200 p-5 shadow-xs hover:shadow-sm transition-shadow'>
              <div className='flex flex-col sm:flex-row justify-between gap-4'>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2 mb-2'>
                    <span className={'text-xs font-semibold px-2 py-0.5 rounded-full ' + (STATUS_COLORS[item.status] || 'bg-gray-100 text-gray-700')}>
                      {item.status}
                    </span>
                    {item.deadline && (
                      <span className='text-xs text-red-600 font-medium'>
                        Deadline: {new Date(item.deadline).toLocaleDateString('id-ID')}
                      </span>
                    )}
                  </div>
                  <h3 className='font-semibold text-gray-900 truncate'>
                    {item.surat?.perihal || 'Tanpa Perihal'}
                  </h3>
                  <p className='text-sm text-gray-500 mt-0.5'>
                    No. Surat: <span className='font-mono text-gray-700'>{item.surat?.nomorSurat}</span>
                    {item.surat?.pengirim && <> · Dari: <span className='font-medium text-gray-700'>{item.surat.pengirim}</span></>}
                  </p>
                  <div className='mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2'>
                    <p className='text-xs font-semibold text-amber-800 uppercase tracking-wider mb-0.5'>Instruksi</p>
                    <p className='text-sm text-amber-900'>{item.instruksi}</p>
                  </div>
                  {item.catatan && (
                    <p className='text-xs text-gray-500 mt-1.5'>Catatan: {item.catatan}</p>
                  )}
                  <p className='text-xs text-gray-400 mt-1.5'>
                    Dari: <span className='font-medium text-gray-600'>{item.pemberiDisposisi?.nama || 'Sistem'}</span>
                    · {new Date(item.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                  </p>
                </div>

                <div className='flex sm:flex-col gap-2 shrink-0'>
                  <Link href={'/surat-masuk/' + item.suratId}>
                    <Button variant='outline' size='sm' className='text-xs h-8 flex items-center gap-1'>
                      Lihat Surat <ArrowRight className='w-3 h-3' />
                    </Button>
                  </Link>
                  {item.status === 'MENUNGGU' && (
                    <Button
                      size='sm'
                      className='text-xs h-8 bg-blue-600 hover:bg-blue-700'
                      disabled={updatingId === item.id}
                      onClick={() => handleUpdateStatus(item.id, 'PROSES')}
                    >
                      {updatingId === item.id ? <Loader2 className='w-3.5 h-3.5 animate-spin' /> : 'Tandai Diproses'}
                    </Button>
                  )}
                  {item.status === 'PROSES' && (
                    <Button
                      size='sm'
                      className='text-xs h-8 bg-green-600 hover:bg-green-700 flex items-center gap-1'
                      disabled={updatingId === item.id}
                      onClick={() => handleUpdateStatus(item.id, 'SELESAI')}
                    >
                      {updatingId === item.id ? <Loader2 className='w-3.5 h-3.5 animate-spin' /> : <><CheckCircle2 className='w-3.5 h-3.5' /> Selesai</>}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}