import { Suspense } from 'react';
import LoginForm from './login-form';
import Link from 'next/link';
import {
  School,
  ShieldCheck,
  FileText,
  MailCheck,
  Send,
  QrCode,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const metadata = {
  title: 'Masuk ke Sistem Persuratan | PAWARTA',
  description: 'Portal Masuk Sistem Informasi Administrasi Persuratan Sekolah PAWARTA',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* LEFT PANEL: Showcase & Branding (Visible on Desktop >= lg) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950 border-r border-white/10">
        {/* Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Branding */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/30">
              <School className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight block text-white">PAWARTA</span>
              <span className="text-[11px] text-blue-200 block -mt-0.5 font-medium">
                Tata Naskah Dinas & Persuratan Sekolah
              </span>
            </div>
          </div>
        </div>

        {/* Middle Value Proposition */}
        <div className="relative z-10 my-auto py-8 space-y-8 max-w-lg">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Standar Perbup Sumedang No. 9/2026</span>
            </div>
            <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Transformasi Digital Tata Naskah Dinas Sekolah
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Solusi terpadu administrasi surat masuk, disposisi elektronik berjenjang, penerbitan
              surat keluar, serta verifikasi keabsahan dokumen berbasis Tanda Tangan Elektronik.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xs space-y-2 hover:bg-white/[0.07] transition-all">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <MailCheck className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-xs text-white">Agenda Surat Otomatis</h3>
              <p className="text-[11px] text-slate-400 leading-normal">
                Penomoran agenda surat masuk & keluar per tahun secara runtut dan presisi.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xs space-y-2 hover:bg-white/[0.07] transition-all">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Send className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-xs text-white">Disposisi & Notifikasi</h3>
              <p className="text-[11px] text-slate-400 leading-normal">
                Instruksi disposisi langsung ke akun staf dengan status pemantauan real-time.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xs space-y-2 hover:bg-white/[0.07] transition-all">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <QrCode className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-xs text-white">Verifikasi TTE Resmi</h3>
              <p className="text-[11px] text-slate-400 leading-normal">
                QR Code terintegrasi untuk pembuktian keaslian dokumen resmi sekolah.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xs space-y-2 hover:bg-white/[0.07] transition-all">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-xs text-white">Surat Kesiswaan</h3>
              <p className="text-[11px] text-slate-400 leading-normal">
                Penerbitan surat izin dispensasi, keterangan aktif, & panggilan wali murid.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>PAWARTA &copy; {new Date().getFullYear()}</span>
          <span className="text-[11px] text-slate-500">Versi 1.0 (Next-Gen Edition)</span>
        </div>
      </div>

      {/* RIGHT PANEL: Login Form (Full width on Mobile, 50% on Desktop) */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex flex-col justify-between p-4 sm:p-8 lg:p-12 bg-slate-900/50 backdrop-blur-md">
        {/* Mobile Header / Quick Action Bar */}
        <div className="flex items-center justify-between gap-3 w-full max-w-md mx-auto">
          {/* Logo on Mobile */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
              <School className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block leading-tight">
                PAWARTA
              </span>
              <span className="text-[10px] text-blue-300 block">Sistem Persuratan</span>
            </div>
          </div>

          <div className="hidden lg:block"></div>

          {/* Quick link to verification */}
          <Link
            href="/verifikasi"
            className="inline-flex items-center gap-1.5 text-xs text-blue-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 transition-colors shrink-0 ml-auto"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verifikasi Dokumen</span>
          </Link>
        </div>

        {/* Center Box */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          <div className="bg-white text-gray-950 rounded-3xl shadow-2xl p-6 sm:p-10 border border-gray-100 space-y-6">
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 shadow-inner mx-auto sm:mx-0">
                <FileText className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                Masuk ke Akun
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Masukkan username atau alamat email beserta kata sandi yang telah terdaftar.
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

          {/* Mobile footer verification notice */}
          <div className="text-center mt-6">
            <Link
              href="/verifikasi"
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-blue-300 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Cek Keaslian Dokumen Naskah Dinas Publik &rarr;
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full max-w-md mx-auto text-center text-xs text-slate-500 py-2">
          <p>
            PAWARTA &copy; {new Date().getFullYear()} • Standar Perbup Sumedang No. 9/2026
          </p>
        </div>
      </div>
    </div>
  );
}
