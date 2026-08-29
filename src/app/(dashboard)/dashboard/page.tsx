import Link from 'next/link';
import { db } from '@/db';
import { incomingLetters, incomingDispositions } from '@/db/schema/incoming-letter';
import { outgoingLetters } from '@/db/schema/outgoing-letter';
import { studentLetters } from '@/db/schema/student-letter';
import { sql, desc, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { getMyWorkQueue } from '@/features/system/actions/work-queue';
import {
  Inbox,
  Send,
  PlusCircle,
  ArrowRight,
  School,
  GraduationCap,
  ClipboardList,
  AlertCircle,
  CheckCircle2,
  Clock,
  PenTool,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Dashboard Persuratan Sekolah | PAWARTA',
};

interface RecentMasukItem {
  id: string;
  nomorSurat: string;
  pengirim: string;
  perihal: string;
  tanggalDiterima: string | null;
  status: string;
}

interface RecentKeluarItem {
  id: string;
  nomorSurat: string | null;
  tujuanSurat: string;
  perihal: string;
  tanggalSurat: string | null;
  status: string;
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  let totalMasuk = 0;
  let totalKeluar = 0;
  let totalDisposisiSekolah = 0;
  let myDisposisiCount = 0;
  let totalSuratSiswa = 0;
  let recentMasuk: RecentMasukItem[] = [];
  let recentKeluar: RecentKeluarItem[] = [];
  let workQueue: any = null;

  try {
    const [
      masukCount,
      keluarCount,
      disposisiAllCount,
      myDisposisiResult,
      suratSiswaCount,
      workQueueRes,
    ] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(incomingLetters)
        .where(sql`${incomingLetters.deletedAt} IS NULL`),
      db
        .select({ count: sql<number>`count(*)` })
        .from(outgoingLetters)
        .where(sql`${outgoingLetters.deletedAt} IS NULL`),
      db.select({ count: sql<number>`count(*)` }).from(incomingDispositions),
      userId
        ? db
            .select({ count: sql<number>`count(*)` })
            .from(incomingDispositions)
            .where(eq(incomingDispositions.penerimaDisposisiId, userId))
        : Promise.resolve([{ count: 0 }]),
      db
        .select({ count: sql<number>`count(*)` })
        .from(studentLetters)
        .where(sql`${studentLetters.deletedAt} IS NULL`),
      getMyWorkQueue(),
    ]);

    totalMasuk = Number(masukCount[0]?.count || 0);
    totalKeluar = Number(keluarCount[0]?.count || 0);
    totalDisposisiSekolah = Number(disposisiAllCount[0]?.count || 0);
    myDisposisiCount = Number(myDisposisiResult[0]?.count || 0);
    totalSuratSiswa = Number(suratSiswaCount[0]?.count || 0);

    if (workQueueRes.success && workQueueRes.data) {
      workQueue = workQueueRes.data;
    }

    recentMasuk = await db
      .select({
        id: incomingLetters.id,
        nomorSurat: incomingLetters.nomorSurat,
        pengirim: incomingLetters.pengirim,
        perihal: incomingLetters.perihal,
        tanggalDiterima: incomingLetters.tanggalDiterima,
        status: incomingLetters.status,
      })
      .from(incomingLetters)
      .where(sql`${incomingLetters.deletedAt} IS NULL`)
      .orderBy(desc(incomingLetters.createdAt))
      .limit(5);

    recentKeluar = await db
      .select({
        id: outgoingLetters.id,
        nomorSurat: outgoingLetters.nomorSurat,
        tujuanSurat: outgoingLetters.tujuanSurat,
        perihal: outgoingLetters.perihal,
        tanggalSurat: outgoingLetters.tanggalSurat,
        status: outgoingLetters.status,
      })
      .from(outgoingLetters)
      .where(sql`${outgoingLetters.deletedAt} IS NULL`)
      .orderBy(desc(outgoingLetters.createdAt))
      .limit(5);
  } catch (error) {
    console.error('Error loading dashboard stats:', error);
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 sm:p-8 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-blue-200 text-sm font-medium mb-1">
            <School className="w-4 h-4" />
            <span>Sistem Informasi Administrasi Persuratan Sekolah</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Selamat Datang di PAWARTA
          </h1>
          <p className="text-blue-100 text-sm mt-1 max-w-xl">
            Kelola alur persuratan satuan pendidikan secara terpadu: Surat Masuk, Penomoran Naskah Dinas, Surat Kesiswaan, Disposisi & TTE.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/surat-siswa">
            <Button className="bg-white text-blue-800 hover:bg-blue-50 font-semibold shadow-sm flex items-center gap-2">
              <GraduationCap className="w-4 h-4" /> Surat Kesiswaan
            </Button>
          </Link>
          <Link href="/surat-masuk/tambah">
            <Button
              variant="outline"
              className="bg-blue-600/30 border-blue-400/40 text-white hover:bg-blue-600/50 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Catat Surat Masuk
            </Button>
          </Link>
        </div>
      </div>

      {/* TUGAS SAYA / WORK QUEUE (PHASE 3 & 19) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
                Tugas Saya / Antrean Pekerjaan
                {workQueue?.totalTasks > 0 && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {workQueue.totalTasks} Tindakan
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-500">Pekerjaan dinas yang membutuhkan perhatian atau tindakan Anda saat ini.</p>
            </div>
          </div>

          {/* Quick Filter Badges */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {workQueue?.menungguPersetujuanCount > 0 && (
              <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                {workQueue.menungguPersetujuanCount} Menunggu Persetujuan
              </span>
            )}
            {workQueue?.menungguTtdCount > 0 && (
              <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-purple-600" />
                {workQueue.menungguTtdCount} Menunggu TTE
              </span>
            )}
            {workQueue?.disposisiAktifCount > 0 && (
              <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                {workQueue.disposisiAktifCount} Disposisi Aktif
              </span>
            )}
            {workQueue?.revisiCount > 0 && (
              <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                {workQueue.revisiCount} Perlu Revisi
              </span>
            )}
          </div>
        </div>

        {/* Task Items List */}
        {!workQueue || workQueue.items.length === 0 ? (
          <div className="py-8 text-center bg-gray-50/70 rounded-xl border border-dashed border-gray-200 text-gray-500 text-xs flex flex-col items-center justify-center gap-1.5">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            <p className="font-semibold text-gray-700">Semua Tugas Sudah Selesai!</p>
            <p className="text-gray-400">Tidak ada naskah dinas atau disposisi yang menunggu tindakan Anda saat ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {workQueue.items.map((task: any) => (
              <Link
                key={task.id}
                href={task.linkUrl}
                className="p-4 rounded-xl border border-gray-200/90 hover:border-blue-400 hover:shadow-xs transition-all flex items-start justify-between gap-3 bg-white group"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        task.badgeVariant === 'red'
                          ? 'bg-red-100 text-red-800'
                          : task.badgeVariant === 'purple'
                          ? 'bg-purple-100 text-purple-800'
                          : task.badgeVariant === 'amber'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {task.badgeText}
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">{task.date}</span>
                  </div>
                  <p className="font-bold text-xs text-gray-900 group-hover:text-blue-700 truncate">
                    {task.title}
                  </p>
                  <p className="text-[11px] text-gray-500 line-clamp-1">{task.subtitle}</p>
                </div>
                <div className="p-1.5 rounded-lg bg-gray-50 group-hover:bg-blue-50 text-gray-400 group-hover:text-blue-600 transition-colors shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Surat Masuk */}
        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between hover:border-blue-300 transition-colors">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Surat Masuk
            </p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalMasuk}</h3>
            <p className="text-xs text-muted-foreground mt-1">Total teregistrasi</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Inbox className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Disposisi Masuk */}
        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between hover:border-amber-300 transition-colors">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Disposisi Masuk
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-bold text-gray-900">{myDisposisiCount}</h3>
              {totalDisposisiSekolah > 0 && (
                <span className="text-xs text-gray-500 font-medium">
                  ({totalDisposisiSekolah} total sekolah)
                </span>
              )}
            </div>
            <Link
              href="/disposisi-saya"
              className="text-xs text-amber-600 font-medium hover:underline flex items-center gap-1 mt-1"
            >
              Lihat Lembar Disposisi <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ClipboardList className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Surat Keluar */}
        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between hover:border-emerald-300 transition-colors">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Surat Keluar
            </p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalKeluar}</h3>
            <p className="text-xs text-muted-foreground mt-1">Dinas & Administrasi</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Send className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Surat Kesiswaan */}
        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between hover:border-purple-300 transition-colors">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Surat Kesiswaan
            </p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalSuratSiswa}</h3>
            <Link
              href="/surat-siswa"
              className="text-xs text-purple-600 font-medium hover:underline flex items-center gap-1 mt-1"
            >
              Buka Layanan <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Incoming & Outgoing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Incoming Letters */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <Inbox className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">Surat Masuk Terbaru</h2>
            </div>
            <Link
              href="/surat-masuk"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Lihat Semua <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {recentMasuk.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">
                Belum ada data surat masuk.
              </div>
            ) : (
              recentMasuk.map((item) => (
                <div key={item.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.perihal || 'Tanpa Perihal'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Dari: <span className="font-medium text-gray-700">{item.pengirim}</span> • No:{' '}
                      {item.nomorSurat}
                    </p>
                  </div>
                  <Link href={`/surat-masuk/${item.id}`}>
                    <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                      Detail
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Outgoing Letters */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-600" />
              <h2 className="font-semibold text-gray-900">Surat Keluar Terbaru</h2>
            </div>
            <Link
              href="/surat-keluar"
              className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Lihat Semua <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {recentKeluar.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">
                Belum ada data surat keluar.
              </div>
            ) : (
              recentKeluar.map((item) => (
                <div key={item.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.perihal || 'Tanpa Perihal'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Kepada: <span className="font-medium text-gray-700">{item.tujuanSurat}</span>{' '}
                      • No: {item.nomorSurat || 'Draft'}
                    </p>
                  </div>
                  <Link href={`/surat-keluar/${item.id}`}>
                    <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                      Detail
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
