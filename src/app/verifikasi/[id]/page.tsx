import { db } from '@/db';
import { outgoingLetters, studentLetters, masterPegawai, masterSekolah } from '@/db/schema';
import { eq, or, ilike, and, isNull } from 'drizzle-orm';
import { ShieldCheck, ShieldAlert, FileCheck, Calendar, Landmark, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Hasil Verifikasi Dokumen Digital | PAWARTA',
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function VerifikasiDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const rawId = resolvedParams?.id || '';
  const decodedId = decodeURIComponent(rawId).trim();
  const isUuid = UUID_REGEX.test(decodedId);

  const [sekolah, kepsek] = await Promise.all([
    db.query.masterSekolah.findFirst({ where: eq(masterSekolah.isAktif, true) }),
    db.query.masterPegawai.findFirst({ where: eq(masterPegawai.isAktif, true) }),
  ]);

  // Check outgoing
  const outgoingWhere = and(
    isNull(outgoingLetters.deletedAt),
    isUuid
      ? or(eq(outgoingLetters.id, decodedId), ilike(outgoingLetters.nomorSurat, decodedId))
      : ilike(outgoingLetters.nomorSurat, decodedId)
  );

  const outgoing = await db.query.outgoingLetters.findFirst({
    where: outgoingWhere,
    with: { penandatangan: true },
  });

  // Check student letter
  const studentWhere = and(
    isNull(studentLetters.deletedAt),
    isUuid
      ? or(eq(studentLetters.id, decodedId), ilike(studentLetters.nomorSurat, decodedId))
      : ilike(studentLetters.nomorSurat, decodedId)
  );

  const student = !outgoing
    ? await db.query.studentLetters.findFirst({
        where: studentWhere,
        with: { siswa: true },
      })
    : null;

  const doc = outgoing
    ? {
        tipe: 'Surat Dinas Keluar',
        nomorSurat: outgoing.nomorSurat || 'DRAFT',
        perihal: outgoing.perihal,
        tanggal: outgoing.tanggalSurat,
        tujuan: outgoing.tujuanSurat,
        penandatangan: outgoing.penandatangan?.nama || kepsek?.nama || 'Kepala Sekolah',
        nip: outgoing.penandatangan?.nip || kepsek?.nip || '-',
        status: outgoing.status,
      }
    : student
    ? {
        tipe:
          student.tipeSurat === 'DISPENSASI'
            ? 'Surat Dispensasi Siswa'
            : student.tipeSurat === 'KETERANGAN_AKTIF'
            ? 'Surat Keterangan Siswa Aktif'
            : 'Surat Panggilan Orang Tua',
        nomorSurat: student.nomorSurat,
        perihal: student.keperluan || student.namaKegiatan || 'Surat Kesiswaan',
        tujuan: student.siswa ? `${student.siswa.nama} (${student.siswa.nisn || '-'})` : '-',
        penandatangan: kepsek?.nama || 'Kepala Sekolah',
        nip: kepsek?.nip || '-',
        status: student.status,
      }
    : null;

  return (
    <div className='min-h-screen bg-gradient-to-b from-blue-900 via-indigo-950 to-gray-950 text-white flex flex-col justify-between p-4 sm:p-8'>
      <header className='max-w-4xl w-full mx-auto flex items-center justify-between py-4 border-b border-white/10'>
        <div className='flex items-center gap-2.5'>
          <div className='w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md'>
            P
          </div>
          <div>
            <span className='font-bold text-base tracking-tight'>PAWARTA</span>
            <span className='block text-[10px] text-blue-200'>Layanan Verifikasi Dokumen & TTE</span>
          </div>
        </div>

        <Link href='/verifikasi'>
          <Button variant='outline' size='sm' className='text-xs text-white border-white/20 bg-white/5 hover:bg-white/10'>
            <ArrowLeft className='w-3.5 h-3.5 mr-1' /> Cek Dokumen Lain
          </Button>
        </Link>
      </header>

      <main className='max-w-2xl w-full mx-auto my-8'>
        {doc ? (
          <div className='bg-white text-gray-950 rounded-2xl border-2 border-emerald-500 shadow-2xl p-6 sm:p-8 space-y-6'>
            <div className='flex items-center gap-3 pb-4 border-b border-gray-100'>
              <div className='w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 shadow-inner'>
                <ShieldCheck className='w-7 h-7' />
              </div>
              <div>
                <span className='inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded'>
                  Tanda Tangan Elektronik Sah & Asli
                </span>
                <h2 className='text-lg font-bold text-gray-900 mt-0.5'>{doc.perihal}</h2>
              </div>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs'>
              <div className='bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1'>
                <span className='text-gray-500 block flex items-center gap-1.5'>
                  <FileCheck className='w-3.5 h-3.5 text-blue-600' /> Nomor Dokumen
                </span>
                <p className='font-bold text-gray-900 text-sm font-mono'>{doc.nomorSurat}</p>
              </div>

              <div className='bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1'>
                <span className='text-gray-500 block flex items-center gap-1.5'>
                  <Calendar className='w-3.5 h-3.5 text-blue-600' /> Tanggal Penerbitan
                </span>
                <p className='font-semibold text-gray-900'>
                  {doc.tanggal
                    ? new Date(doc.tanggal).toLocaleDateString('id-ID', { dateStyle: 'full' })
                    : '-'}
                </p>
              </div>

              <div className='bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1 sm:col-span-2'>
                <span className='text-gray-500 block flex items-center gap-1.5'>
                  <Landmark className='w-3.5 h-3.5 text-blue-600' /> Instansi Satuan Pendidikan
                </span>
                <p className='font-bold text-gray-900'>{sekolah?.nama || 'SMA NEGERI CONTOH UTAMA'}</p>
              </div>

              <div className='bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1 sm:col-span-2'>
                <span className='text-gray-500 block'>Peruntukan / Penerima:</span>
                <p className='font-semibold text-gray-900'>{doc.tujuan}</p>
              </div>

              <div className='bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200 space-y-1 sm:col-span-2'>
                <span className='text-emerald-800 font-semibold block flex items-center gap-1.5'>
                  <User className='w-3.5 h-3.5 text-emerald-700' /> Penandatangan Elektronik (TTE)
                </span>
                <p className='font-bold text-emerald-950'>{doc.penandatangan}</p>
                <p className='text-[11px] text-emerald-700 font-mono'>NIP: {doc.nip}</p>
              </div>
            </div>

            <div className='text-center pt-2 text-[11px] text-gray-400'>
              Sistem Informasi Administrasi Persuratan Sekolah (PAWARTA) • Integritas Digital Terjamin
            </div>
          </div>
        ) : (
          <div className='bg-red-500/10 backdrop-blur-md rounded-2xl border-2 border-red-500/30 p-8 text-center space-y-3'>
            <ShieldAlert className='w-12 h-12 text-red-400 mx-auto' />
            <h3 className='text-lg font-bold text-red-200'>Dokumen Tidak Ditemukan</h3>
            <p className='text-xs text-red-300 max-w-md mx-auto'>
              ID dokumen atau nomor surat ini tidak terdaftar pada pangkalan data resmi PAWARTA.
            </p>
          </div>
        )}
      </main>

      <footer className='max-w-4xl w-full mx-auto text-center py-6 border-t border-white/10 text-xs text-gray-400'>
        © 2026 PAWARTA — Sistem Persuratan Digital & Tanda Tangan Elektronik Satuan Pendidikan.
      </footer>
    </div>
  );
}
