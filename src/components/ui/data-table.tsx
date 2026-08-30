'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount?: number;
  pagination?: {
    pageIndex: number;
    pageSize: number;
  };
  onPaginationChange?: (updater: any) => void;
  totalRecords?: number;
}

export function DataTable<TData extends Record<string, any>, TValue>({
  columns,
  data,
  pageCount,
  pagination,
  onPaginationChange,
  totalRecords,
}: DataTableProps<TData, TValue>) {
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    pageCount,
    state: pagination ? { pagination } : undefined,
    onPaginationChange: onPaginationChange,
    manualPagination: pageCount !== undefined,
    ...(pageCount === undefined ? { getPaginationRowModel: getPaginationRowModel() } : {}),
  });

  const currentPage = table.getState().pagination.pageIndex + 1;
  const currentSize = table.getState().pagination.pageSize;
  const calculatedTotalPages =
    pageCount !== undefined
      ? Math.max(1, pageCount)
      : Math.max(1, Math.ceil(data.length / currentSize));

  const totalCount =
    totalRecords !== undefined ? totalRecords : pageCount !== undefined ? pageCount * currentSize : data.length;

  const startRecord = Math.min((currentPage - 1) * currentSize + 1, totalCount);
  const endRecord = Math.min(currentPage * currentSize, totalCount);

  return (
    <div className="space-y-3">
      {/* Table Container */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-gray-50/80">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-gray-200">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="text-[11px] font-bold text-gray-700 uppercase tracking-wider py-3.5"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 text-xs">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="hover:bg-blue-50/40 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 px-3.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-28 text-center text-xs text-gray-400">
                  Tidak ada data yang ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-1 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span>Baris per halaman:</span>
          <Select
            value={String(currentSize)}
            onValueChange={(val) => {
              table.setPageSize(Number(val));
            }}
          >
            <SelectTrigger className="h-7 w-[70px] text-xs font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-gray-300">|</span>
          <span>
            Menampilkan <strong>{totalCount === 0 ? 0 : startRecord}-{endRecord}</strong> dari total <strong>{totalCount}</strong> data
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="text-gray-500 font-medium mr-2 hidden sm:inline">
            Halaman <strong>{currentPage}</strong> dari <strong>{calculatedTotalPages}</strong>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="h-8 px-2 text-xs"
            title="Halaman Pertama"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 px-2.5 text-xs flex items-center gap-1 font-semibold"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Sebelumnya</span>
          </Button>

          <span className="font-semibold text-gray-700 px-2.5 py-1 bg-white border border-gray-200 rounded-md shadow-2xs">
            {currentPage}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 px-2.5 text-xs flex items-center gap-1 font-semibold"
          >
            <span>Selanjutnya</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(calculatedTotalPages - 1)}
            disabled={!table.getCanNextPage()}
            className="h-8 px-2 text-xs"
            title="Halaman Terakhir"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
