import {
  getConsentListAdmin,
  getConsentSummaryStats,
} from '@/features/student-letter/consent-actions';
import { ConsentMonitoringTable } from '@/components/features/consent/ConsentMonitoringTable';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  GraduationCap,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Calendar,
  Sparkles,
  Percent,
} from 'lucide-react';

export const metadata = {
  title: 'Monitoring Persetujuan 5 Hari Kerja | PAWARTA',
};

export default async function PersetujuanLimaHariKerjaAdminPage() {
  const [listRes, statsRes] = await Promise.all([
    getConsentListAdmin({ kategori: '5_HARI_KERJA' }),
    getConsentSummaryStats('5_HARI_KERJA'),
  ]);

  const list = listRes.success && listRes.data ? listRes.data : [];
  const stats = statsRes.success && statsRes.data
    ? statsRes.data
    : {
        totalStudents: 0,
        totalSubmitted: 0,
        totalSetuju: 0,
        totalTidakSetuju: 0,
        totalBelum: 0,
        overallPercentage: 0,
        classStats: [],
      };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 bg-gradient-to-r from-blue-800 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <Link
              href="/surat-siswa"
              className="hover:text-white flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Surat Kesiswaan
            </Link>
            <span>/</span>
            <span>Program 5 Hari Sekolah</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            Monitoring Surat Persetujuan Orang Tua
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-2xl">
            Rekapitulasi tanda tangan persetujuan wali murid untuk pelaksanaan program 5 hari sekolah
            (Full Day School) Tahun Ajaran 2026/2027.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/persetujuan-ortu" target="_blank">
            <Button className="bg-white text-blue-900 hover:bg-blue-50 font-bold shadow-xs text-xs sm:text-sm h-10 px-4">
              Buka Form Publik (Ortu)
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Siswa */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">Total Siswa</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">{stats.totalStudents}</div>
          <p className="text-[11px] text-gray-400 mt-0.5">Seluruh kelas aktif</p>
        </div>

        {/* Total Respon Masuk */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">Respon Masuk</span>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
              {stats.overallPercentage}%
            </span>
          </div>
          <div className="text-2xl font-black text-blue-700">{stats.totalSubmitted}</div>
          <p className="text-[11px] text-gray-500 mt-0.5">Sudah mengisi</p>
        </div>

        {/* Total Menyetujui */}
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-semibold">Menyetujui</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{stats.totalSetuju}</div>
          <p className="text-[11px] text-emerald-600 mt-0.5">
            {stats.totalSubmitted > 0
              ? Math.round((stats.totalSetuju / stats.totalSubmitted) * 100)
              : 0}
            % dari respon
          </p>
        </div>

        {/* Total Menolak */}
        <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50/20 shadow-xs">
          <div className="flex items-center justify-between text-red-700 mb-2">
            <span className="text-xs font-semibold">Tidak Menyetujui</span>
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-black text-red-700">{stats.totalTidakSetuju}</div>
          <p className="text-[11px] text-red-600 mt-0.5">Perlu tindak lanjut</p>
        </div>

        {/* Total Belum Mengisi */}
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-semibold">Belum Mengisi</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700">{stats.totalBelum}</div>
          <p className="text-[11px] text-amber-600 mt-0.5">Menunggu respon wali</p>
        </div>
      </div>

      {/* Progress Cards per Kelas */}
      {stats.classStats && stats.classStats.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">Progres Pengisian per Kelas</h3>
            <span className="text-xs text-gray-500 font-medium">
              {stats.classStats.length} Rombel Terdata
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {stats.classStats.map((c) => (
              <div
                key={c.kelasId}
                className="p-3 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-gray-50 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-900">{c.namaKelas}</span>
                  <span
                    className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                      c.percentage === 100
                        ? 'bg-emerald-100 text-emerald-800'
                        : c.percentage >= 70
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {c.percentage}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      c.percentage === 100
                        ? 'bg-emerald-600'
                        : c.percentage >= 70
                          ? 'bg-blue-600'
                          : 'bg-amber-500'
                    }`}
                    style={{ width: `${c.percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-gray-500">
                  <span>
                    Masuk: <strong>{c.totalSubmitted}</strong>/{c.totalSiswa}
                  </span>
                  <span>
                    Setuju: <strong className="text-emerald-700">{c.totalSetuju}</strong> • Tolak:{' '}
                    <strong className="text-red-700">{c.totalTidakSetuju}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Monitoring & Filter Table */}
      <ConsentMonitoringTable initialData={list as any} classes={stats.classStats} />
    </div>
  );
}
