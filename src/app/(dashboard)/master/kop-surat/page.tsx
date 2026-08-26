'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Star, CheckCircle, Trash2, Pencil, Landmark } from 'lucide-react';
import { DocumentHeaderForm } from './form';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import {
  getDocumentHeadersList,
  setDefaultDocumentHeader,
  deleteDocumentHeader,
} from '@/features/master-data/actions/kop-surat';
import { LetterheadView } from '@/components/shared/LetterheadView';
import { toast } from 'sonner';

interface HeaderItem {
  id: string;
  namaKop: string;
  instansiUtama?: string | null;
  instansiInduk?: string | null;
  namaSekolah?: string | null;
  alamat?: string | null;
  kontak?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  logoKiriUrl?: string | null;
  logoKananUrl?: string | null;
  tipeGaris?: string | null;
  isDefault: boolean;
  isAktif: boolean;
}

export default function MasterKopSuratPage() {
  const [data, setData] = useState<HeaderItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<HeaderItem | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const reloadData = useCallback(async () => {
    try {
      const res = await getDocumentHeadersList();
      if (res.success) {
        setData((res.data as unknown as HeaderItem[]) || []);
      } else {
        toast.error(res.error || 'Gagal memuat data kop surat');
      }
    } catch {
      toast.error('Gagal mengambil data kop surat');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await getDocumentHeadersList();
        if (isMounted) {
          if (res.success) {
            setData((res.data as unknown as HeaderItem[]) || []);
          } else {
            toast.error(res.error || 'Gagal memuat data kop surat');
          }
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          toast.error('Gagal mengambil data kop surat');
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [isFormOpen]);

  const handleSetDefault = async (id: string) => {
    try {
      const res = await setDefaultDocumentHeader(id);
      if (res.success) {
        toast.success('KOP surat utama berhasil diperbarui');
        reloadData();
      } else {
        toast.error(res.error || 'Gagal mengubah KOP default');
      }
    } catch {
      toast.error('Gagal mengubah KOP default');
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await deleteDocumentHeader(deleteId);
      if (res.success) {
        toast.success('Desain KOP surat berhasil dihapus');
        setDeleteId(null);
        reloadData();
      } else {
        toast.error(res.error || 'Gagal menghapus KOP surat');
      }
    } catch {
      toast.error('Gagal menghapus KOP surat');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Landmark className="w-6 h-6 text-blue-600" /> Pengaturan Desain KOP Surat
          </h1>
          <p className="text-sm text-gray-500">
            Kelola kepala naskah dinas (KOP Surat) resmi sekolah yang digunakan pada seluruh cetakan
            surat dinas dan kesiswaan.
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedData(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800"
        >
          <Plus className="w-4 h-4" /> Tambah Desain KOP
        </Button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-gray-400">Memuat daftar KOP surat...</div>
      ) : data.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-white p-8">
          <Landmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900">Belum Ada Desain KOP Kustom</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 mb-4">
            Sistem saat ini menggunakan KOP default dari profil sekolah. Anda dapat membuat desain
            KOP surat resmi dinas baru sekarang.
          </p>
          <Button
            onClick={() => {
              setSelectedData(null);
              setIsFormOpen(true);
            }}
            className="bg-blue-700 hover:bg-blue-800 text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Buat KOP Sekarang
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border bg-white p-6 shadow-xs flex flex-col justify-between transition-all ${
                item.isDefault
                  ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div>
                {/* Header Card */}
                <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-950 text-base">{item.namaKop}</h3>
                    {item.isDefault && (
                      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        <Star className="w-3 h-3 fill-blue-700 text-blue-700" /> KOP Utama
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      item.isAktif ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {item.isAktif ? 'Aktif' : 'Non-Aktif'}
                  </span>
                </div>

                {/* Preview Box */}
                <div className="bg-gray-50/70 p-4 sm:p-5 rounded-xl border border-gray-200 mb-4">
                  <LetterheadView header={item} />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-2">
                {!item.isDefault ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(item.id)}
                    className="text-xs text-blue-700 border-blue-200 hover:bg-blue-50"
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Jadikan KOP Utama
                  </Button>
                ) : (
                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Digunakan saat ini
                  </span>
                )}

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedData(item);
                      setIsFormOpen(true);
                    }}
                    className="text-xs text-gray-700 hover:text-blue-600"
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  {!item.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(item.id)}
                      className="text-xs text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <DocumentHeaderForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialData={selectedData}
      />

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
