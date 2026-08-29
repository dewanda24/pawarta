import Link from 'next/link';
import { db } from '@/db';
import { studentLetters } from '@/db/schema';
import { isNull, desc } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  PlusCircle,
  FileText,
  FileCheck,
  UserCheck,
  PhoneCall,
  Printer,
  Calendar,
  User,
} from 'lucide-react';

import { DeleteStudentLetterButton } from '@/components/features/student-letter/DeleteStudentLetterButton';

export const metadata = {
  title: 'Surat Kesiswaan | PAWARTA',
};

export default async function SuratSiswaPage() {
  const letters = await db.query.studentLetters.findMany({
    where: isNull(studentLetters.deletedAt),
    with: {
      siswa: {
        with: { kelas: true },
      },
      kelas: true,
      guruPendamping: true,
      participants: {
        with: {
          siswa: {
            with: { kelas: true },
          },
        },
      },
    },
    orderBy: [desc(studentLetters.createdAt)],
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 sm:p-8 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>Modul Persuratan Kesiswaan</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight">Layanan Surat Siswa</h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
            Penerbitan surat izin dispensasi lomba/kegiatan, surat keterangan siswa aktif, dan surat
            panggilan orang tua / wali murid.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 w-full lg:w-auto">
          <Link href="/surat-siswa/persetujuan-5-hari-kerja" className="w-full">
            <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-xs flex items-center justify-center gap-2 text-xs sm:text-sm h-9 sm:h-10">
              <FileCheck className="w-4 h-4" /> Persetujuan 5 Hari
            </Button>
          </Link>
          <Link href="/surat-siswa/dispensasi" className="w-full">
            <Button className="w-full bg-white text-blue-900 hover:bg-blue-50 font-semibold shadow-xs flex items-center justify-center gap-2 text-xs sm:text-sm h-9 sm:h-10">
              <PlusCircle className="w-4 h-4" /> Dispensasi
            </Button>
          </Link>
          <Link href="/surat-siswa/keterangan-aktif" className="w-full">
            <Button
              variant="outline"
              className="w-full bg-blue-600/40 border-blue-300/40 text-white hover:bg-blue-600/60 flex items-center justify-center gap-2 text-xs sm:text-sm h-9 sm:h-10"
            >
              <FileText className="w-4 h-4" /> Ket. Aktif
            </Button>
          </Link>
          <Link href="/surat-siswa/panggilan-ortu" className="w-full">
            <Button
              variant="outline"
              className="w-full bg-blue-600/40 border-blue-300/40 text-white hover:bg-blue-600/60 flex items-center justify-center gap-2 text-xs sm:text-sm h-9 sm:h-10"
            >
              <PhoneCall className="w-4 h-4" /> Panggilan Ortu
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <Link href="/surat-siswa/persetujuan-5-hari-kerja" className="group">
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm sm:text-base group-hover:text-emerald-600 transition-colors">
              Persetujuan 5 Hari Kerja
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Monitoring & rekap persetujuan wali murid dengan tanda tangan digital publik.
            </p>
          </div>
        </Link>

        <Link href="/surat-siswa/dispensasi" className="group">
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-xs hover:border-blue-500 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm sm:text-base group-hover:text-blue-600 transition-colors">
              Surat Dispensasi Siswa
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Izin dispensasi meninggalkan KBM untuk lomba, turnamen, atau dinas luar sekolah.
            </p>
          </div>
        </Link>

        <Link href="/surat-siswa/keterangan-aktif" className="group">
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm sm:text-base group-hover:text-emerald-600 transition-colors">
              Surat Keterangan Siswa Aktif
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Surat keterangan aktif sekolah untuk syarat beasiswa, tunjangan gaji ortu, atau visa.
            </p>
          </div>
        </Link>

        <Link href="/surat-siswa/panggilan-ortu" className="group">
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-xs hover:border-amber-500 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm sm:text-base group-hover:text-amber-600 transition-colors">
              Surat Panggilan Orang Tua / BK
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Surat pemanggilan resmi wali murid untuk pembinaan, koordinasi absensi, dan BK.
            </p>
          </div>
        </Link>
      </div>

      {/* Letters List / Table Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-sm">Riwayat Surat Kesiswaan</h2>
          <span className="text-xs text-gray-500 font-medium">{letters.length} Surat Diterbitkan</span>
        </div>

        {/* MOBILE CARD VIEW (< md) */}
        <div className="block md:hidden divide-y divide-gray-100">
          {letters.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">
              Belum ada surat kesiswaan yang diterbitkan.
            </div>
          ) : (
            letters.map((item) => {
              let namaDisplay = item.siswa?.nama || '-';
              let kelasDisplay = item.siswa?.kelas?.kodeKelas || item.kelas?.kodeKelas || '-';
              if (item.tipeSurat === 'DISPENSASI' && item.participants && item.participants.length > 0) {
                namaDisplay = `${item.participants[0].siswa?.nama} (+${item.participants.length - 1} siswa)`;
                kelasDisplay = item.participants[0].siswa?.kelas?.kodeKelas || '-';
              }

              return (
                <div key={item.id} className="p-4 space-y-2.5 hover:bg-gray-50/80 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        item.tipeSurat === 'DISPENSASI'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : item.tipeSurat === 'KETERANGAN_AKTIF'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {item.tipeSurat === 'DISPENSASI'
                        ? 'Dispensasi'
                        : item.tipeSurat === 'KETERANGAN_AKTIF'
                          ? 'Ket. Aktif'
                          : 'Panggilan Ortu'}
                    </span>
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID') : '-'}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 text-sm leading-tight">{namaDisplay}</h4>
                    <p className="text-xs text-gray-500 mt-0.5 font-mono">
                      No: {item.nomorSurat} • Kelas {kelasDisplay}
                    </p>
                    <p className="text-xs text-gray-700 mt-1 line-clamp-2">
                      {item.namaKegiatan || item.keperluan || '-'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                    <Link href={`/surat-siswa/${item.id}`} className="flex-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-8 text-xs font-semibold text-blue-700 border-blue-200 hover:bg-blue-50 flex items-center justify-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" /> Cetak & Detail
                      </Button>
                    </Link>
                    <DeleteStudentLetterButton id={item.id} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* DESKTOP TABLE VIEW (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-600 uppercase border-b border-gray-200">
              <tr>
                <th className="p-3.5 text-center w-12 border-r">No</th>
                <th className="p-3.5 border-r">Jenis Surat</th>
                <th className="p-3.5 border-r">Nomor Surat</th>
                <th className="p-3.5 border-r">Nama Siswa / Peserta</th>
                <th className="p-3.5 border-r">Kelas</th>
                <th className="p-3.5 border-r">Perihal / Kegiatan</th>
                <th className="p-3.5 border-r">Tanggal</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {letters.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400">
                    Belum ada surat kesiswaan yang diterbitkan.
                  </td>
                </tr>
              ) : (
                letters.map((item, idx) => {
                  let namaDisplay = item.siswa?.nama || '-';
                  let kelasDisplay = item.siswa?.kelas?.kodeKelas || item.kelas?.kodeKelas || '-';
                  if (item.tipeSurat === 'DISPENSASI' && item.participants && item.participants.length > 0) {
                    namaDisplay = `${item.participants[0].siswa?.nama} (+${item.participants.length - 1} siswa)`;
                    kelasDisplay = item.participants[0].siswa?.kelas?.kodeKelas || '-';
                  }

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3 text-center border-r font-medium text-gray-500">
                        {idx + 1}
                      </td>
                      <td className="p-3 border-r">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            item.tipeSurat === 'DISPENSASI'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : item.tipeSurat === 'KETERANGAN_AKTIF'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {item.tipeSurat === 'DISPENSASI'
                            ? 'Dispensasi'
                            : item.tipeSurat === 'KETERANGAN_AKTIF'
                              ? 'Ket. Aktif'
                              : 'Panggilan Ortu'}
                        </span>
                      </td>
                      <td className="p-3 border-r font-mono text-xs font-semibold text-gray-900">
                        {item.nomorSurat}
                      </td>
                      <td className="p-3 border-r font-semibold text-gray-900">{namaDisplay}</td>
                      <td className="p-3 border-r text-gray-700">{kelasDisplay}</td>
                      <td className="p-3 border-r text-gray-700 max-w-xs truncate">
                        {item.namaKegiatan || item.keperluan || '-'}
                      </td>
                      <td className="p-3 border-r whitespace-nowrap text-xs text-gray-500">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString('id-ID')
                          : '-'}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Link href={`/surat-siswa/${item.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2.5 text-xs flex items-center gap-1"
                            >
                              <Printer className="w-3.5 h-3.5" /> Cetak
                            </Button>
                          </Link>
                          <DeleteStudentLetterButton id={item.id} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
