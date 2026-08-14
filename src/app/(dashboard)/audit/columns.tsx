'use client';

import { ColumnDef } from '@tanstack/react-table';

export type AuditLog = {
  id: string;
  waktu: string;
  user: string;
  ipAddress: string;
  modul: string;
  aksi: string;
  detail: string | null;
};

export const columns: ColumnDef<AuditLog, any>[] = [
  {
    accessorKey: 'waktu',
    header: 'Waktu',
  },
  {
    accessorKey: 'user',
    header: 'User',
  },
  {
    accessorKey: 'ipAddress',
    header: 'IP Address',
    cell: ({ row }) => {
      return <span className="font-mono text-xs">{(row as any).getValue('ipAddress')}</span>;
    },
  },
  {
    accessorKey: 'modul',
    header: 'Modul',
    cell: ({ row }) => {
      return (
        <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold bg-secondary text-secondary-foreground">
          {(row as any).getValue('modul')}
        </span>
      );
    },
  },
  {
    accessorKey: 'aksi',
    header: 'Aksi',
    cell: ({ row }) => {
      return <span className="font-bold text-xs">{(row as any).getValue('aksi')}</span>;
    },
  },
  {
    accessorKey: 'detail',
    header: 'Detail',
    cell: ({ row }) => {
      return <span className="text-muted-foreground text-xs">{(row as any).getValue('detail')}</span>;
    },
  },
];
