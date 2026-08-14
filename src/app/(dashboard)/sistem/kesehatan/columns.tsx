'use client';

import { ColumnDef } from '@tanstack/react-table';

export type HealthLog = {
  id: string;
  waktu: string;
  komponen: string;
  status: string;
  pesanError: string;
};

export const columns: ColumnDef<HealthLog>[] = [
  {
    accessorKey: 'waktu',
    header: 'Waktu',
  },
  {
    accessorKey: 'komponen',
    header: 'Komponen',
    cell: ({ row }) => {
      return <span className="font-medium">{(row as any).getValue('komponen')}</span>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = (row as any).getValue('status') as string;
      return (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${status === 'HEALTHY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: 'pesanError',
    header: 'Pesan Error',
    cell: ({ row }) => {
      return <span className="text-xs font-mono text-red-600">{(row as any).getValue('pesanError')}</span>;
    },
  },
];
