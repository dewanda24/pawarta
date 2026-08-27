'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
      <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 mb-4 shadow-sm">
        <AlertCircle className="w-8 h-8" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
        Terjadi Kesalahan Sistem
      </h1>
      <p className="text-sm text-gray-600 mt-2 max-w-md">
        {error.message || 'Sistem mendeteksi kendala pada server. Tim administrator telah diberitahu.'}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => reset()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <RotateCcw className="w-4 h-4" /> Muat Ulang Halaman
        </Button>
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2">
            <Home className="w-4 h-4" /> Beranda
          </Button>
        </Link>
      </div>
    </div>
  );
}
