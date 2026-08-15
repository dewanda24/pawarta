'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { getIncomingLetters } from '@/features/incoming-letter/actions';
import { toast } from 'sonner';

export default function SuratMasukPage() {
  const [data, setData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const fetchData = async () => {
    try {
      const response = await getIncomingLetters({
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
      toast.error('Gagal mengambil data surat masuk');
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.pageIndex, pagination.pageSize]);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'nomorAgenda',
      header: 'No. Agenda',
      cell: ({ row }) => row.original.nomorAgenda || '-',
    },
    {
      accessorKey: 'nomorSurat',
      header: 'No. Surat',
      cell: ({ row }) => <span className="font-medium">{row.original.nomorSurat}</span>,
    },
    {
      accessorKey: 'pengirim',
      header: 'Pengirim',
      cell: ({ row }) => (
        <div>
          <div>{row.original.pengirim}</div>
          {row.original.instansi && (
            <div className="text-xs text-gray-500">{row.original.instansi.nama}</div>
          )}
        </div>
      )
    },
    {
      accessorKey: 'perihal',
      header: 'Perihal',
    },
    {
      accessorKey: 'tanggalDiterima',
      header: 'Tgl Diterima',
      cell: ({ row }) => new Date(row.original.tanggalDiterima).toLocaleDateString('id-ID'),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const color = status === 'REGISTERED' ? 'bg-blue-100 text-blue-800' 
                    : status === 'DISTRIBUTED' ? 'bg-yellow-100 text-yellow-800'
                    : status === 'DISPOSITIONED' ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-800';
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
            {status}
          </span>
        );
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <div className="flex justify-end">
            <Link href={`/surat-masuk/${row.original.id}`}>
              <Button variant="outline" size="sm">Detail & Disposisi</Button>
            </Link>
          </div>
        );
      },
    },
  ];

  const pageCount = Math.ceil(totalCount / pagination.pageSize);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Surat Masuk</h1>
          <p className="text-muted-foreground">Kelola semua surat masuk dan disposisi.</p>
        </div>
        <Link href="/surat-masuk/tambah">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Registrasi Surat Masuk
          </Button>
        </Link>
      </div>

      <DataTable 
        columns={columns} 
        data={data} 
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
      />
    </div>
  );
}
