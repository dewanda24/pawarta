'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error boundary captured:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mb-4 shadow-sm">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
        Terjadi Kendala Memuat Halaman
      </h1>
      <p className="text-sm text-gray-500 mt-2 max-w-md">
        {error.message ||
          'Terjadi kesalahan internal saat memproses data. Silakan coba muat ulang atau kembali ke beranda dashboard.'}
      </p>

      {error.digest && (
        <p className="text-[11px] font-mono text-gray-400 mt-1 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
          Kode Error: {error.digest}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={() => reset()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <RotateCcw className="w-4 h-4" /> Coba Lagi
        </Button>
        <Link href="/dashboard">
          <Button variant="outline" className="flex items-center gap-2">
            <Home className="w-4 h-4" /> Ke Dashboard Utama
          </Button>
        </Link>
      </div>
    </div>
  );
}
