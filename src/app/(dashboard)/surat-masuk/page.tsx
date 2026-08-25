'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { getIncomingLetters, deleteIncomingLetter } from '@/features/incoming-letter/actions';
import { toast } from 'sonner';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';

const STATUS_COLORS: Record<string, string> = {
  REGISTERED: 'bg-blue-100 text-blue-800',
  DISTRIBUTED: 'bg-yellow-100 text-yellow-800',
  DISPOSITIONED: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  DRAFT: 'bg-gray-100 text-gray-800',
};

export default function SuratMasukPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const response = await getIncomingLetters({
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
      toast.error('Gagal mengambil data surat masuk');
    }
  }, [pagination.pageIndex, pagination.pageSize, debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await deleteIncomingLetter(deletingId);
      if (res.success) {
        toast.success('Surat masuk berhasil dihapus');
        setIsDeleteDialogOpen(false);
        fetchData();
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error('Gagal menghapus surat masuk');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'nomorAgenda',
      header: 'No. Agenda',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-blue-700">
          {row.original.nomorAgenda || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'nomorSurat',
      header: 'No. Surat',
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">{row.original.nomorSurat}</span>
      ),
    },
    {
      accessorKey: 'pengirim',
      header: 'Pengirim',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">{row.original.pengirim}</div>
          {row.original.instansiPengirim && (
            <div className="text-xs text-gray-500">{row.original.instansiPengirim.nama}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'perihal',
      header: 'Perihal',
      cell: ({ row }) => (
        <span className="line-clamp-2 text-sm">{row.original.perihal}</span>
      ),
    },
    {
      accessorKey: 'tanggalDiterima',
      header: 'Tgl Diterima',
      cell: ({ row }) =>
        row.original.tanggalDiterima
          ? new Date(row.original.tanggalDiterima).toLocaleDateString('id-ID')
          : '-',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const color = STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
            {status}
          </span>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Link href={`/surat-masuk/${row.original.id}`}>
            <Button variant="ghost" size="sm" className="text-blue-600 h-8 px-2.5 text-xs">
              Detail
            </Button>
          </Link>
          <Link href={`/surat-masuk/${row.original.id}/edit`}>
            <Button variant="ghost" size="sm" className="text-amber-600 h-8 px-2.5 text-xs">
              Edit
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 h-8 px-2 text-xs"
            onClick={() => handleDeleteClick(row.original.id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const pageCount = Math.ceil(totalCount / pagination.pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Surat Masuk</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Kelola semua surat masuk dan disposisi.</p>
        </div>
        <Link href="/surat-masuk/tambah" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs sm:text-sm">
            <Plus className="w-4 h-4" /> Registrasi Surat Masuk
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Cari nomor, pengirim, perihal..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPagination((p) => ({ ...p, pageIndex: 0 }));
          }}
          className="pl-9 text-sm"
        />
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
