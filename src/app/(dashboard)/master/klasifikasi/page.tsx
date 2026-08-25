'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Layers, FileText } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { KlasifikasiSuratForm, KlasifikasiSuratFormValues } from './form';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { getKlasifikasiSuratList, deleteKlasifikasiSurat } from '@/features/master-data/actions/klasifikasi-surat';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';

export default function KlasifikasiSuratPage() {
  const [data, setData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<(KlasifikasiSuratFormValues & { id?: string }) | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const response = await getKlasifikasiSuratList({
        search: debouncedSearch || undefined,
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
      });

      if (response.success) {
        setData(response.data || []);
        setTotalCount(response.metadata?.totalRecords || 0);
      } else {
        toast.error(response.error);
      }
    } catch {
      toast.error('Gagal mengambil data klasifikasi surat');
    }
  }, [pagination.pageIndex, pagination.pageSize, debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData, isFormOpen, isDeleteDialogOpen]);

  const handleEdit = (item: any) => {
    setSelectedData(item);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedData(null);
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
      const res = await deleteKlasifikasiSurat(deletingId);
      if (res.success) {
        toast.success('Berhasil menghapus kode klasifikasi surat');
        setIsDeleteDialogOpen(false);
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error('Gagal menghapus klasifikasi surat');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'kode',
      header: 'Kode / Nomor Klasifikasi',
      cell: ({ row }) => (
        <span className='font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs'>
          {row.original.kode}
        </span>
      ),
    },
    {
      accessorKey: 'nama',
      header: 'Nama Klasifikasi / Urusan',
      cell: ({ row }) => (
        <span className='font-medium text-gray-900'>{row.original.nama}</span>
      ),
    },
    {
      accessorKey: 'deskripsi',
      header: 'Keterangan',
      cell: ({ row }) => (
        <span className='text-xs text-gray-500 line-clamp-2'>
          {row.original.deskripsi || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'isAktif',
      header: 'Status',
      cell: ({ row }) => {
        const isAktif = row.original.isAktif;
        return (
          <span className={'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ' + (isAktif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
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
          <div className='flex justify-end gap-1'>
            <Button variant='ghost' size='sm' onClick={() => handleEdit(item)} className='text-blue-600 h-8 px-2.5 text-xs'>
              Edit
            </Button>
            <Button variant='ghost' size='sm' onClick={() => handleDeleteClick(item.id)} className='text-red-600 h-8 px-2.5 text-xs'>
              Hapus
            </Button>
          </div>
        );
      },
    },
  ];

  const pageCount = Math.ceil(totalCount / pagination.pageSize);

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
            <Layers className='w-6 h-6 text-blue-600' /> Kode Klasifikasi Surat
          </h1>
          <p className='text-sm text-gray-500'>
            Master kode klasifikasi dan penomoran tata naskah dinas persuratan sekolah (Contoh: 420, 421.2, 422, 005).
          </p>
        </div>
        <Button onClick={handleCreate} className='flex items-center gap-2 bg-blue-700 hover:bg-blue-800'>
          <Plus className='w-4 h-4' /> Tambah Kode Klasifikasi
        </Button>
      </div>

      {/* Search Input */}
      <div className='relative w-full sm:w-80'>
        <Search className='w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
        <Input
          placeholder='Cari kode atau nama klasifikasi...'
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPagination((p) => ({ ...p, pageIndex: 0 }));
          }}
          className='pl-9 text-sm'
        />
      </div>

      <DataTable 
        columns={columns} 
        data={data} 
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
      />

      <KlasifikasiSuratForm 
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
