import {
  getPublicClasses,
  getConsentLetterConfig,
} from '@/features/student-letter/consent-actions';
import { ParentConsentForm } from '@/components/features/consent/ParentConsentForm';
import { db } from '@/db';
import { masterSekolah, documentHeaders } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { ShieldCheck, Calendar, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { DEFAULT_CONSENT_LETTER_CONFIG } from '@/features/student-letter/consent-config';

export const metadata = {
  title: 'Surat Persetujuan Orang Tua - Program 5 Hari Sekolah | PAWARTA',
  description: 'Portal resmi persetujuan orang tua / wali murid untuk pelaksanaan program 5 hari sekolah.',
};

interface PageProps {
  searchParams?: Promise<{ kelas?: string; kelasId?: string }> | { kelas?: string; kelasId?: string };
}

export default async function PersetujuanOrtuPublicPage({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await Promise.resolve(searchParams) : {};
  const [classesRes, sekolah, configRes, defaultKop] = await Promise.all([
    getPublicClasses(),
    db.query.masterSekolah.findFirst({
      where: eq(masterSekolah.isAktif, true),
    }),
    getConsentLetterConfig(),
    db.query.documentHeaders.findFirst({
      where: and(eq(documentHeaders.isDefault, true), eq(documentHeaders.isAktif, true)),
    }),
  ]);

  let activeKop = defaultKop;
  if (!activeKop) {
    activeKop = await db.query.documentHeaders.findFirst({
      where: eq(documentHeaders.isAktif, true),
      orderBy: [desc(documentHeaders.createdAt)],
    });
  }

  const classes = classesRes.success && classesRes.data ? classesRes.data : [];
  const letterConfig = configRes.success && configRes.data ? configRes.data : DEFAULT_CONSENT_LETTER_CONFIG;

  // Match class by id or by kodeKelas / namaKelas if passed via URL parameter (?kelas=7A / ?kelasId=...)
  let defaultKelasId = resolvedParams.kelasId || '';
  if (!defaultKelasId && resolvedParams.kelas) {
    const target = resolvedParams.kelas.toLowerCase().replace(/[^a-z0-9]/g, '');
    const found = classes.find((c: any) =>
      c.id === resolvedParams.kelas ||
      c.kodeKelas.toLowerCase().replace(/[^a-z0-9]/g, '') === target ||
      c.namaKelas.toLowerCase().replace(/[^a-z0-9]/g, '') === target
    );
    if (found) {
      defaultKelasId = found.id;
    }
  }

  const selectedClassName = classes.find((c: any) => c.id === defaultKelasId)?.namaKelas;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Top Header Bar */}
      <header className="border-b border-white/10 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/20">
              P
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base tracking-tight text-white">PAWARTA</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 font-semibold px-1.5 py-0.5 rounded border border-blue-400/30">
                  PORTAL PUBLIK
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {sekolah?.nama || 'Sistem Tata Naskah Dinas Pendidikan'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/verifikasi"
              className="text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Verifikasi Dokumen</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <main className="max-w-3xl w-full mx-auto px-4 py-8 sm:py-12 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>Tahun Ajaran 2026 / 2027</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Surat Persetujuan Orang Tua / Wali
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Program 5 Hari Sekolah (FDK)
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Formulir pernyataan dan persetujuan resmi orang tua/wali murid mengenai pelaksanaan Kegiatan Belajar Mengajar (KBM) 5 hari kerja (Senin s.d. Jumat) di {sekolah?.nama || 'SMPN 1 UJUNGJAYA'}.
          </p>

          {selectedClassName && (
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold px-3.5 py-1.5 rounded-xl animate-in fade-in">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Tautan Khusus: Kelas {selectedClassName}</span>
            </div>
          )}
        </div>

        {/* 3 Quick Steps Guidance */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              1
            </span>
            <div>
              <p className="font-semibold text-white">Pilih Siswa / Cari Cepat</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Ketik nama anak atau pilih kelas</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              2
            </span>
            <div>
              <p className="font-semibold text-white">Pilih Sikap Persetujuan</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Menyetujui / Tidak Menyetujui</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              3
            </span>
            <div>
              <p className="font-semibold text-white">Tanda Tangan Digital</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Goreskan tanda tangan di layar HP</p>
            </div>
          </div>
        </div>

        {/* Form Komponen Utama */}
        <ParentConsentForm
          classList={classes}
          defaultKelasId={defaultKelasId}
          config={letterConfig}
          sekolah={sekolah}
          kopSurat={activeKop}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} {sekolah?.nama || 'SMPN 1 UJUNGJAYA'}. Sistem Tata Naskah Dinas Terpadu PAWARTA.</p>
        <p className="text-[11px] text-slate-600 mt-1">Dokumen dan tanda tangan terekam secara sah & terverifikasi.</p>
      </footer>
    </div>
  );
}
