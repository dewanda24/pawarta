'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { PenandatanganForm, PenandatanganFormValues } from './form';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { getPenandatanganList, deletePenandatangan } from '@/features/master-data/actions/penandatangan';
import { toast } from 'sonner';

export default function PenandatanganPage() {
  const [data, setData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<PenandatanganFormValues & { id?: string } | undefined>(undefined);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      const response = await getPenandatanganList({
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
      });

      if (response.success) {
        setData(response.data || []);
        setTotalCount(response.metadata?.totalRecords || 0);
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error('Gagal mengambil data penandatangan');
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.pageIndex, pagination.pageSize, isFormOpen, isDeleteDialogOpen]);

  const handleEdit = (item: any) => {
    setSelectedData(item);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedData(undefined);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await deletePenandatangan(deletingId);
      if (res.success) {
        toast.success('Berhasil menghapus penandatangan');
        setIsDeleteDialogOpen(false);
      } else {
        toast.error(res.error);
      }
    } catch (e) {
      toast.error('Gagal menghapus penandatangan');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'pegawai.nama',
      header: 'Nama Pegawai & NIP',
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-gray-900">{row.original.pegawai?.nama || '-'}</p>
          <p className="text-[11px] text-gray-500 font-mono">{row.original.nipLabel || (row.original.pegawai?.nip ? `NIP. ${row.original.pegawai.nip}` : '-')}</p>
        </div>
      ),
    },
    {
      accessorKey: 'jabatanDokumen',
      header: 'Jabatan pada Dokumen',
      cell: ({ row }) => (
        <div>
          <span className="font-medium text-gray-900">{row.original.jabatanDokumen || row.original.jabatan?.nama || 'Kepala Sekolah'}</span>
          <span className="block text-[11px] text-gray-400">Unit: {row.original.pegawai?.unitKerja?.nama || 'Sekolah'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'jenisTtd',
      header: 'Mekanisme TTE',
      cell: ({ row }) => {
        const jenis = row.original.jenisTtd || 'DIGITAL_LOCAL';
        const label = jenis === 'BSRE_TTE' ? 'BSrE / BSSN' : jenis === 'MANUAL' ? 'Basah / Manual' : 'QR & Digital Hash';
        const badgeClass = jenis === 'BSRE_TTE' ? 'bg-purple-100 text-purple-800' : jenis === 'MANUAL' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800';
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${badgeClass}`}>
            {label}
          </span>
        );
      },
    },
    {
      accessorKey: 'masaBerlakuMulai',
      header: 'Masa Berlaku',
      cell: ({ row }) => {
        const mulai = row.original.masaBerlakuMulai;
        const selesai = row.original.masaBerlakuSelesai;
        if (!mulai && !selesai) return <span className="text-xs text-gray-400">Tetap</span>;
        return <span className="text-xs text-gray-700">{mulai || '-'} s/d {selesai || 'Selesai'}</span>;
      },
    },
    {
      accessorKey: 'isAktif',
      header: 'Status',
      cell: ({ row }) => {
        const isAktif = row.original.isAktif;
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isAktif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {isAktif ? 'Aktif' : 'Non-Aktif'}
          </span>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => handleEdit(item)} className="text-blue-600">
              Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(item.id)} className="text-red-600">
              Hapus
            </Button>
          </div>
        );
      },
    },
  ];

  const pageCount = Math.ceil(totalCount / pagination.pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Penandatangan</h1>
          <p className="text-sm text-gray-500">Kelola master data penandatangan surat.</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Penandatangan
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={data} 
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
      />

      <PenandatanganForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        initialData={selectedData} 
      />

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
