'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { PegawaiForm, PegawaiFormValues } from './form';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { getPegawaiList, deletePegawai } from '@/features/master-data/actions/pegawai';
import { getUnitKerjaList } from '@/features/master-data/actions/unit-kerja';
import { getJabatanList } from '@/features/master-data/actions/jabatan';
import { toast } from 'sonner';

export default function MasterPegawaiPage() {
  const [data, setData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  
  const [unitKerjaList, setUnitKerjaList] = useState<any[]>([]);
  const [jabatanList, setJabatanList] = useState<any[]>([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<PegawaiFormValues & { id?: string } | undefined>(undefined);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchOptions = async () => {
    try {
      const resUnitKerja = await getUnitKerjaList();
      const resJabatan = await getJabatanList();
      if (resUnitKerja.success) setUnitKerjaList(resUnitKerja.data || []);
      if (resJabatan.success) setJabatanList(resJabatan.data || []);
    } catch (error) {
      console.error('Failed fetching options', error);
    }
  };

  const fetchData = async () => {
    try {
      const response = await getPegawaiList({
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
      toast.error('Gagal mengambil data pegawai');
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

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
      const res = await deletePegawai(deletingId);
      if (res.success) {
        toast.success('Berhasil menghapus pegawai');
        setIsDeleteDialogOpen(false);
      } else {
        toast.error(res.error);
      }
    } catch (e) {
      toast.error('Gagal menghapus pegawai');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'nama',
      header: 'Nama Pegawai',
    },
    {
      accessorKey: 'nip',
      header: 'NIP',
    },
    {
      accessorKey: 'unitKerja.nama',
      header: 'Unit Kerja',
      cell: ({ row }) => row.original.unitKerja?.nama || '-',
    },
    {
      accessorKey: 'jabatan.nama',
      header: 'Jabatan',
      cell: ({ row }) => row.original.jabatan?.nama || '-',
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
          <h1 className="text-2xl font-bold text-gray-900">Master Pegawai</h1>
          <p className="text-sm text-gray-500">Kelola data pegawai, unit kerja, dan jabatan.</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Pegawai
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={data} 
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
      />

      <PegawaiForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        initialData={selectedData} 
        unitKerjaOptions={unitKerjaList}
        jabatanOptions={jabatanList}
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
