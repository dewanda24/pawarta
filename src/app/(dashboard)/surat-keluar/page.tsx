'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { getSuratKeluarList, deleteSuratKeluar } from '@/features/surat-keluar/actions/surat';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function SuratKeluarPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      const response = await getSuratKeluarList({
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
      toast.error('Gagal mengambil data surat keluar');
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.pageIndex, pagination.pageSize, isDeleteDialogOpen]);

  const handleCreate = () => {
    router.push('/surat-keluar/create');
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await deleteSuratKeluar(deletingId);
      if (res.success) {
        toast.success('Berhasil menghapus draft surat keluar');
        setIsDeleteDialogOpen(false);
      } else {
        toast.error(res.error);
      }
    } catch (e) {
      toast.error('Gagal menghapus draft surat keluar');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'perihal',
      header: 'Perihal',
    },
    {
      accessorKey: 'tujuanSurat',
      header: 'Tujuan',
    },
    {
      accessorKey: 'jenisSurat.nama',
      header: 'Jenis Surat',
      cell: ({ row }) => row.original.jenisSurat?.nama || '-',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        let bg = 'bg-gray-100 text-gray-800';
        if (status === 'DRAFT') bg = 'bg-yellow-100 text-yellow-800';
        if (status === 'REVIEW') bg = 'bg-blue-100 text-blue-800';
        if (status === 'APPROVED') bg = 'bg-green-100 text-green-800';
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg}`}>
            {status}
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
            <Button variant="ghost" size="sm" onClick={() => router.push(`/surat-keluar/${item.id}`)} className="text-blue-600">
              Detail
            </Button>
            {item.status === 'DRAFT' && (
              <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(item.id)} className="text-red-600">
                Hapus
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const pageCount = Math.ceil(totalCount / pagination.pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Surat Keluar</h1>
          <p className="text-xs sm:text-sm text-gray-500">Kelola daftar surat keluar dinas, persetujuan, dan pengiriman.</p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs sm:text-sm">
          <Plus className="w-4 h-4" /> Buat Draft Baru
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={data} 
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
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
