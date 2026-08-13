import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
      <h2 className="mb-4 text-4xl font-bold text-gray-900">404 - Halaman Tidak Ditemukan</h2>
      <p className="mb-8 text-gray-600">Maaf, halaman yang Anda cari tidak tersedia dalam sistem PAWARTA.</p>
      <Link
        href="/"
        className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
