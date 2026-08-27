'use client';

import React, { useState } from 'react';
import { DocumentTemplateItem } from '@/features/master-data/types/template-surat';
import { deleteDocumentTemplate } from '@/features/master-data/actions/template-surat';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sliders, Search, Trash2, FileText, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface TemplateListClientProps {
  initialTemplates: DocumentTemplateItem[];
}

export function TemplateListClient({ initialTemplates }: TemplateListClientProps) {
  const [templates, setTemplates] = useState<DocumentTemplateItem[]>(initialTemplates);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredTemplates = templates.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.nama.toLowerCase().includes(q) ||
      t.kode.toLowerCase().includes(q) ||
      t.jenisSurat?.nama?.toLowerCase().includes(q) ||
      t.kategori?.nama?.toLowerCase().includes(q)
    );
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await deleteDocumentTemplate(deleteId);
      if (res.success) {
        setTemplates((prev) => prev.filter((t) => t.id !== deleteId));
        toast.success('Template berhasil dihapus');
        setDeleteId(null);
      } else {
        toast.error(res.error || 'Gagal menghapus template');
      }
    } catch {
      toast.error('Terjadi kesalahan saat menghapus template');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
      {/* Search and Filters Bar */}
      <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari template, kode, atau jenis surat..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="text-xs text-gray-500 font-medium">
          Total Template:{' '}
          <span className="font-bold text-gray-900">{filteredTemplates.length}</span>
        </div>
      </div>

      {/* Templates List */}
      {filteredTemplates.length === 0 ? (
        <div className="p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Belum Ada Template Surat</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Belum ada template kustom yang tersimpan. Klik tombol di bawah untuk mendesain
              template pertama Anda dengan margin standar.
            </p>
          </div>
          <Link href="/master/template-surat/designer">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white mt-2">
              <Sparkles className="w-4 h-4 mr-1.5" /> Buka Studio Layout Baru
            </Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-500 font-semibold border-b border-gray-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3">Kode & Nama Template</th>
                <th className="px-4 py-3">Jenis Surat</th>
                <th className="px-4 py-3">Format Kertas & Font</th>
                <th className="px-4 py-3">Margin (T-R-B-L)</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredTemplates.map((item) => {
                const settings = item.versiAktif?.pengaturanKertas;
                const m = settings?.margin;
                const typo = settings?.tipografi;

                return (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-gray-900 text-sm">{item.nama}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-[10px] border border-blue-100">
                          {item.kode}
                        </span>
                        {item.kategori && (
                          <span className="text-[11px] text-gray-500">• {item.kategori.nama}</span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="font-medium text-gray-800">
                        {item.jenisSurat?.nama || '-'}
                      </span>
                    </td>

                    <td className="px-4 py-4 space-y-0.5">
                      <div className="font-medium text-gray-900">
                        {settings?.ukuran || 'A4'}{' '}
                        <span className="text-gray-400 capitalize text-[10px]">
                          ({settings?.orientasi || 'portrait'})
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {typo?.fontFamily || 'Arial'} {typo?.fontSizePt || 11}pt
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {m ? (
                        <div className="inline-flex items-center gap-1 font-mono text-[11px] bg-stone-100 px-2 py-1 rounded-md text-stone-800 border border-stone-200">
                          <span>{m.top}</span>
                          <span className="text-gray-400">/</span>
                          <span>{m.right}</span>
                          <span className="text-gray-400">/</span>
                          <span>{m.bottom}</span>
                          <span className="text-gray-400">/</span>
                          <span className="font-bold text-blue-700">{m.left}</span>
                          <span className="text-[9px] text-gray-500 font-sans">{m.unit}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          item.isAktif
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {item.isAktif ? 'Aktif' : 'Non-aktif'}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/master/template-surat/${item.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2.5 text-xs flex items-center gap-1 text-blue-700 hover:text-blue-800 hover:bg-blue-50 border-blue-200"
                          >
                            <Sliders className="w-3.5 h-3.5" /> Edit Margin & Layout
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(item.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title="Hapus Template Surat?"
        description="Template ini akan dihapus dari sistem. Format surat yang sudah terbit sebelumnya tidak akan terpengaruh."
      />
    </div>
  );
}
