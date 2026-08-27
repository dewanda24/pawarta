'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMyDispositions, updateDispositionStatus } from '@/features/incoming-letter/actions';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  ClipboardList,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Printer,
  Inbox,
  Send,
  Layers,
  Clock,
  UserCheck,
  User,
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  MENUNGGU: 'bg-amber-100 text-amber-800 border border-amber-200',
  PROSES: 'bg-blue-100 text-blue-800 border border-blue-200',
  SELESAI: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
};

export default function DisposisiSayaPage() {
  const [data, setData] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<'diterima' | 'diberikan' | 'semua'>('diterima');
  const [activeTab, setActiveTab] = useState<'MENUNGGU' | 'PROSES' | 'SELESAI' | 'SEMUA'>('SEMUA');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyDispositions({ scope });
      if (res.success) {
        setData(res.data || []);
        if (res.currentUserId) setCurrentUserId(res.currentUserId);
      } else {
        toast.error(res.error || 'Gagal memuat disposisi');
      }
    } catch {
      toast.error('Gagal memuat disposisi');
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateStatus = async (id: string, status: 'PROSES' | 'SELESAI') => {
    setUpdatingId(id);
    try {
      const res = await updateDispositionStatus(id, status);
      if (res.success) {
        toast.success(
          status === 'SELESAI' ? 'Disposisi diselesaikan' : 'Disposisi ditandai sedang diproses',
        );
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

  const statusTabs: { label: string; value: typeof activeTab }[] = [
    { label: 'Semua Status', value: 'SEMUA' },
    { label: 'Menunggu', value: 'MENUNGGU' },
    { label: 'Diproses', value: 'PROSES' },
    { label: 'Selesai', value: 'SELESAI' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-indigo-700 via-purple-700 to-purple-800 text-white p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-purple-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <ClipboardList className="w-4 h-4" />
            <span>Manajemen Disposisi Naskah Dinas</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Lembar Disposisi</h1>
          <p className="text-purple-100 text-sm mt-1 max-w-xl">
            Tindak lanjut instruksi pimpinan dan monitoring distribusi disposisi surat masuk sekolah.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="bg-white/15 backdrop-blur-xs border border-white/20 px-4 py-2 rounded-xl text-center">
            <p className="text-2xl font-bold">
              {data.filter((d) => d.status === 'MENUNGGU').length}
            </p>
            <p className="text-xs text-purple-200">Menunggu Tindakan</p>
          </div>
          <div className="bg-white/15 backdrop-blur-xs border border-white/20 px-4 py-2 rounded-xl text-center">
            <p className="text-2xl font-bold">{data.length}</p>
            <p className="text-xs text-purple-200">Total di Kategori Ini</p>
          </div>
        </div>
      </div>

      {/* Scope Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div className="flex p-1 bg-gray-100 rounded-xl border border-gray-200/80 gap-1 text-sm">
          <button
            onClick={() => setScope('diterima')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              scope === 'diterima'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Disposisi Diterima</span>
          </button>
          <button
            onClick={() => setScope('diberikan')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              scope === 'diberikan'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Disposisi Diberikan</span>
          </button>
          <button
            onClick={() => setScope('semua')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              scope === 'semua'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Semua Disposisi (Sekolah)</span>
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 bg-gray-50 border rounded-lg p-1">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                activeTab === tab.value
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              {tab.value !== 'SEMUA' && (
                <span
                  className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full ${
                    activeTab === tab.value ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {data.filter((d) => d.status === tab.value).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2 text-indigo-600" /> Memuat daftar
          disposisi...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 p-8">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-semibold text-gray-700">Tidak ada data disposisi</p>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            {scope === 'diterima'
              ? 'Belum ada surat masuk yang didisposisikan kepada akun Anda. Anda dapat beralih ke tab "Disposisi Diberikan" atau "Semua Disposisi (Sekolah)".'
              : scope === 'diberikan'
                ? 'Anda belum memberikan/meneruskan lembar disposisi kepada staf.'
                : 'Belum ada data disposisi yang tercatat dalam sistem.'}
          </p>
          {scope === 'diterima' && (
            <div className="mt-4 flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScope('semua')}
                className="text-xs"
              >
                Lihat Semua Disposisi Sekolah
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const isRecipient = currentUserId && item.penerimaDisposisiId === currentUserId;
            const isAuthor = currentUserId && item.pemberiDisposisiId === currentUserId;

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs hover:shadow-sm hover:border-indigo-200 transition-all"
              >
                <div className="flex flex-col lg:flex-row justify-between gap-5">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          STATUS_COLORS[item.status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {item.status}
                      </span>

                      {isRecipient && (
                        <span className="text-xs bg-indigo-50 text-indigo-700 font-medium px-2 py-0.5 rounded border border-indigo-200 flex items-center gap-1">
                          <UserCheck className="w-3 h-3" /> Untuk Saya
                        </span>
                      )}

                      {isAuthor && (
                        <span className="text-xs bg-purple-50 text-purple-700 font-medium px-2 py-0.5 rounded border border-purple-200 flex items-center gap-1">
                          <Send className="w-3 h-3" /> Dari Saya
                        </span>
                      )}

                      {item.deadline && (
                        <span className="text-xs text-red-600 font-medium flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                          <Clock className="w-3 h-3" /> Batas SLA:{' '}
                          {new Date(item.deadline).toLocaleDateString('id-ID')}
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-gray-900 text-base">
                      {item.surat?.perihal || 'Tanpa Perihal'}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                      <span>
                        No. Agenda:{' '}
                        <span className="font-mono font-bold text-indigo-700">
                          {item.surat?.nomorAgenda || '-'}
                        </span>
                      </span>
                      <span>•</span>
                      <span>
                        No. Surat:{' '}
                        <span className="font-mono text-gray-800">
                          {item.surat?.nomorSurat || '-'}
                        </span>
                      </span>
                      {item.surat?.pengirim && (
                        <>
                          <span>•</span>
                          <span>
                            Pengirim:{' '}
                            <span className="font-medium text-gray-700">
                              {item.surat.pengirim}
                            </span>
                          </span>
                        </>
                      )}
                    </div>

                    {/* Instruksi Box */}
                    <div className="mt-3 bg-amber-50/80 border border-amber-200/90 rounded-lg p-3">
                      <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">
                        Instruksi Disposisi
                      </p>
                      <p className="text-sm text-amber-950 font-medium leading-relaxed">
                        {item.instruksi}
                      </p>
                      {item.catatan && (
                        <p className="text-xs text-amber-800 mt-1.5 pt-1.5 border-t border-amber-200">
                          Catatan Tambahan: {item.catatan}
                        </p>
                      )}
                    </div>

                    {/* Meta Alur Disposisi */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-3">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span>Pemberi:</span>
                        <span className="font-semibold text-gray-800">
                          {item.pemberiDisposisi?.nama || 'Pimpinan'}
                        </span>
                      </div>
                      <span className="text-gray-300">➔</span>
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Penerima:</span>
                        <span className="font-semibold text-indigo-900 bg-indigo-50/70 px-1.5 py-0.5 rounded">
                          {item.penerimaDisposisi?.nama || 'Staf / Pejabat'}
                        </span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <span>
                        Dibuat:{' '}
                        {new Date(item.createdAt).toLocaleDateString('id-ID', {
                          dateStyle: 'medium',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex lg:flex-col justify-end items-stretch gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0">
                    <Link href={`/surat-masuk/${item.suratId}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs h-8 flex items-center justify-center gap-1.5"
                      >
                        Detail Surat <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>

                    <Link href={`/surat-masuk/${item.suratId}/disposisi`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs h-8 text-indigo-700 border-indigo-200 hover:bg-indigo-50 flex items-center justify-center gap-1.5"
                      >
                        <Printer className="w-3 h-3" /> Cetak Lembar
                      </Button>
                    </Link>

                    {item.status === 'MENUNGGU' && (
                      <Button
                        size="sm"
                        className="w-full text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={updatingId === item.id}
                        onClick={() => handleUpdateStatus(item.id, 'PROSES')}
                      >
                        {updatingId === item.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          'Tandai Diproses'
                        )}
                      </Button>
                    )}

                    {item.status === 'PROSES' && (
                      <Button
                        size="sm"
                        className="w-full text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1"
                        disabled={updatingId === item.id}
                        onClick={() => handleUpdateStatus(item.id, 'SELESAI')}
                      >
                        {updatingId === item.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}