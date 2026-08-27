import { Suspense } from 'react';
import LoginForm from './login-form';
import Link from 'next/link';
import { School, ShieldCheck, FileText } from 'lucide-react';

export const metadata = {
  title: 'Masuk ke Sistem Persuratan | PAWARTA',
  description: 'Portal Masuk Sistem Informasi Administrasi Persuratan Sekolah PAWARTA',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white p-4 sm:p-8">
      {/* Top Header */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            <School className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight block">PAWARTA</span>
            <span className="text-[11px] text-blue-200 block -mt-0.5">
              Sistem Persuratan & Naskah Dinas Sekolah
            </span>
          </div>
        </div>

        <Link
          href="/verifikasi"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs text-blue-200 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Verifikasi Dokumen & TTE</span>
        </Link>
      </header>

      {/* Center Content / Login Box */}
      <main className="w-full max-w-md mx-auto my-8">
        <div className="bg-white text-gray-950 rounded-2xl border border-gray-100 shadow-2xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-2 shadow-inner">
              <FileText className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Selamat Datang
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 max-w-xs mx-auto">
              Silakan masukkan username atau email beserta password akun Anda.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="py-12 text-center text-xs text-gray-400">
                Memuat formulir masuk...
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>

        <div className="text-center mt-4 sm:hidden">
          <Link
            href="/verifikasi"
            className="inline-flex items-center gap-1.5 text-xs text-blue-300 hover:text-white underline underline-offset-4"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Cek Keaslian Dokumen / Verifikasi TTE
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto text-center text-xs text-gray-400 py-2 border-t border-white/10">
        <p>
          PAWARTA &copy; {new Date().getFullYear()} • Standar Tata Naskah Dinas Perbup Sumedang
          No. 9/2026
        </p>
      </footer>
    </div>
  );
}
