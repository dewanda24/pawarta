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
} from 'lucide-react';

export const metadata = {
  title: 'Masuk ke Sistem Persuratan | PAWARTA',
  description: 'Portal Masuk Sistem Informasi Administrasi Persuratan Sekolah PAWARTA',
};

export default function LoginPage() {
  return (
    <div className="h-screen h-dvh w-full flex overflow-hidden bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* LEFT PANEL: Showcase & Branding (Visible on Desktop >= lg) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative flex-col justify-between p-6 xl:p-10 overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950 border-r border-white/10">
        {/* Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Branding */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/30">
              <School className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight block text-white leading-none">
                PAWARTA
              </span>
              <span className="text-[10px] text-blue-200 block font-medium mt-0.5">
                Tata Naskah Dinas & Persuratan Sekolah
              </span>
            </div>
          </div>
        </div>

        {/* Middle Value Proposition */}
        <div className="relative z-10 my-auto py-2 space-y-4 xl:space-y-6 max-w-lg">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-[11px] font-semibold">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>Standar Perbup Sumedang No. 9/2026</span>
            </div>
            <h2 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-white leading-snug">
              Transformasi Digital Tata Naskah Dinas Sekolah
            </h2>
            <p className="text-xs xl:text-sm text-slate-300 leading-relaxed">
              Solusi terpadu administrasi surat masuk, disposisi elektronik berjenjang, penerbitan
              surat keluar, serta verifikasi keabsahan dokumen berbasis TTE.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-xs space-y-1 hover:bg-white/[0.07] transition-all">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <MailCheck className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-semibold text-xs text-white">Agenda Surat Otomatis</h3>
              <p className="text-[10px] text-slate-400 leading-tight">
                Penomoran agenda surat masuk & keluar tahunan otomatis.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-xs space-y-1 hover:bg-white/[0.07] transition-all">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Send className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-semibold text-xs text-white">Disposisi & Notifikasi</h3>
              <p className="text-[10px] text-slate-400 leading-tight">
                Instruksi disposisi langsung ke akun staf dengan status real-time.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-xs space-y-1 hover:bg-white/[0.07] transition-all">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <QrCode className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-semibold text-xs text-white">Verifikasi TTE Resmi</h3>
              <p className="text-[10px] text-slate-400 leading-tight">
                QR Code terintegrasi untuk pembuktian keaslian dokumen.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-xs space-y-1 hover:bg-white/[0.07] transition-all">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-semibold text-xs text-white">Surat Kesiswaan</h3>
              <p className="text-[10px] text-slate-400 leading-tight">
                Penerbitan surat dispensasi, ket. aktif, & panggilan ortu.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
          <span>PAWARTA &copy; {new Date().getFullYear()}</span>
          <span className="text-slate-500">Versi 1.0</span>
        </div>
      </div>

      {/* RIGHT PANEL: Login Form (Fixed Full Viewport on Desktop & Mobile) */}
      <div className="w-full lg:w-1/2 xl:w-[45%] h-full flex flex-col justify-between p-4 sm:p-6 lg:p-8 bg-slate-900/50 backdrop-blur-md overflow-y-auto lg:overflow-hidden">
        {/* Mobile Header / Top Bar */}
        <div className="flex items-center justify-between gap-3 w-full max-w-sm sm:max-w-md mx-auto shrink-0">
          {/* Logo on Mobile */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-xs">
              <School className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white block leading-tight">
                PAWARTA
              </span>
              <span className="text-[9px] text-blue-300 block">Sistem Persuratan</span>
            </div>
          </div>

          <div className="hidden lg:block"></div>

          {/* Quick link to verification */}
          <Link
            href="/verifikasi"
            className="inline-flex items-center gap-1.5 text-xs text-blue-300 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 transition-colors shrink-0 ml-auto"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verifikasi Dokumen</span>
          </Link>
        </div>

        {/* Center Login Box */}
        <div className="w-full max-w-sm sm:max-w-md mx-auto my-auto py-3">
          <div className="bg-white text-gray-950 rounded-2xl shadow-2xl p-5 sm:p-7 border border-gray-100 space-y-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 shadow-inner mx-auto sm:mx-0">
                <FileText className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900">
                Masuk ke Akun
              </h1>
              <p className="text-xs text-gray-500">
                Masukkan username atau email beserta kata sandi akun Anda.
              </p>
            </div>

            <Suspense
              fallback={
                <div className="py-8 text-center text-xs text-gray-400">
                  Memuat formulir masuk...
                </div>
              }
            >
              <LoginForm />
            </Suspense>
          </div>

          {/* Verification notice below card */}
          <div className="text-center mt-3">
            <Link
              href="/verifikasi"
              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-blue-300 transition-colors"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Cek Keaslian Dokumen Naskah Dinas Publik &rarr;
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full max-w-sm sm:max-w-md mx-auto text-center text-[10px] text-slate-500 py-1 shrink-0">
          <p>
            PAWARTA &copy; {new Date().getFullYear()} • Standar Perbup Sumedang No. 9/2026
          </p>
        </div>
      </div>
    </div>
  );
}
