'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Dapat diintegrasikan dengan Sentry atau log error internal
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <h2 className="mb-4 text-3xl font-bold text-gray-900">Terjadi Kesalahan Sistem</h2>
      <p className="mb-8 text-gray-600">
        Sistem PAWARTA mendeteksi adanya kendala. Silakan coba lagi atau hubungi administrator.
      </p>
      <button
        onClick={() => reset()}
        className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        Coba Lagi
      </button>
    </div>
  );
}
