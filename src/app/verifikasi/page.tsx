'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  School,
  FileCheck,
  Calendar,
  User,
  ArrowRight,
  Landmark,
} from 'lucide-react';
import Link from 'next/link';

export default function VerifikasiPublikPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/v1/verifikasi?q=${encodeURIComponent(query.trim())}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setResult(json.data);
      } else {
        setResult(null);
      }
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-blue-900 via-indigo-950 to-gray-950 text-white flex flex-col justify-between p-4 sm:p-8'>
      {/* Top Bar */}
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

        <Link href='/login'>
          <Button variant='outline' size='sm' className='text-xs text-white border-white/20 bg-white/5 hover:bg-white/10'>
            Masuk Portal Sistem <ArrowRight className='w-3.5 h-3.5 ml-1' />
          </Button>
        </Link>
      </header>

      {/* Main Content */}
      <main className='max-w-2xl w-full mx-auto my-8 space-y-8'>
        <div className='text-center space-y-3'>
          <div className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold'>
            <ShieldCheck className='w-3.5 h-3.5 text-blue-400' /> Portal Verifikasi Keabsahan Naskah Dinas
          </div>
          <h1 className='text-3xl sm:text-4xl font-extrabold tracking-tight'>
            Verifikasi Dokumen & Tanda Tangan Elektronik
          </h1>
          <p className='text-sm text-gray-300 max-w-lg mx-auto'>
            Cek validitas dan keaslian dokumen resmi sekolah, surat dinas, maupun surat keterangan kesiswaan yang diterbitkan oleh sistem PAWARTA.
          </p>
        </div>

        {/* Search Card */}
        <div className='bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 p-6 shadow-2xl space-y-4'>
          <form onSubmit={handleSearch} className='space-y-3'>
            <div className='relative'>
              <Search className='w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400' />
              <Input
                placeholder='Masukkan Nomor Surat, ID Surat, atau Kode Hash...'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className='pl-11 h-12 bg-white/90 text-gray-900 placeholder:text-gray-500 text-sm font-medium rounded-xl border-none focus-visible:ring-2 focus-visible:ring-blue-400'
                required
              />
            </div>
            <Button
              type='submit'
              disabled={loading}
              className='w-full h-11 bg-blue-600 hover:bg-blue-500 font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/30'
            >
              {loading ? 'Memeriksa Dokumen...' : 'Periksa Keaslian Dokumen'}
            </Button>
          </form>

          <p className='text-[11px] text-gray-400 text-center'>
            Contoh: <span className='font-mono text-gray-300'>421.2/001/DISPEN/...</span> atau scan langsung QR code pada berkas cetak.
          </p>
        </div>

        {/* Verification Result Card */}
        {searched && (
          <div>
            {loading ? (
              <div className='text-center py-12 text-blue-200 animate-pulse text-sm'>
                Mencocokkan tanda tangan digital & naskah dinas di database...
              </div>
            ) : result ? (
              <div className={`bg-white text-gray-950 rounded-2xl border-2 ${result.statusKeabsahan === 'DIBATALKAN' ? 'border-red-500' : 'border-emerald-500'} shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200`}>
                {/* Result Header */}
                <div className='flex items-center gap-3 pb-4 border-b border-gray-100'>
                  <div className={`w-12 h-12 rounded-xl ${result.statusKeabsahan === 'DIBATALKAN' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'} flex items-center justify-center shrink-0 shadow-inner`}>
                    {result.statusKeabsahan === 'DIBATALKAN' ? <ShieldAlert className='w-7 h-7' /> : <ShieldCheck className='w-7 h-7' />}
                  </div>
                  <div>
                    <span className={`inline-block text-[11px] font-bold uppercase tracking-wider ${result.statusKeabsahan === 'DIBATALKAN' ? 'text-red-700 bg-red-50' : 'text-emerald-700 bg-emerald-50'} px-2 py-0.5 rounded`}>
                      {result.statusKeabsahan === 'DIBATALKAN' ? 'DOKUMEN TELAH DIBATALKAN / DICABUT' : 'Dokumen Resmi Sah & Terverifikasi'}
                    </span>
                    <h2 className='text-lg font-bold text-gray-900 mt-0.5'>{result.perihal || result.namaKegiatan || 'Surat Dinas'}</h2>
                  </div>
                </div>

                {/* Details Grid */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs'>
                  <div className='bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1'>
                    <span className='text-gray-500 flex items-center gap-1.5'>
                      <FileCheck className='w-3.5 h-3.5 text-blue-600' /> Nomor Dokumen
                    </span>
                    <p className='font-bold text-gray-900 text-sm font-mono'>{result.nomorSurat}</p>
                  </div>

                  <div className='bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1'>
                    <span className='text-gray-500 flex items-center gap-1.5'>
                      <Calendar className='w-3.5 h-3.5 text-blue-600' /> Tanggal Penerbitan
                    </span>
                    <p className='font-semibold text-gray-900'>
                      {result.tanggalSurat || result.tanggalTerbit || result.createdAt
                        ? new Date(result.tanggalSurat || result.tanggalTerbit || result.createdAt).toLocaleDateString('id-ID', { dateStyle: 'full' })
                        : '-'}
                    </p>
                  </div>

                  <div className='bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1 sm:col-span-2'>
                    <span className='text-gray-500 flex items-center gap-1.5'>
                      <Landmark className='w-3.5 h-3.5 text-blue-600' /> Satuan Pendidikan Penerbit
                    </span>
                    <p className='font-bold text-gray-900'>{result.sekolah || 'SMP NEGERI 1 UJUNGJAYA'}</p>
                  </div>

                  {result.tujuanSurat && (
                    <div className='bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1 sm:col-span-2'>
                      <span className='text-gray-500 block'>Penerima / Tujuan Naskah:</span>
                      <p className='font-semibold text-gray-900'>{result.tujuanSurat}</p>
                    </div>
                  )}

                  {result.siswa && (
                    <div className='bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1 sm:col-span-2'>
                      <span className='text-gray-500 block'>Siswa Terkait:</span>
                      <p className='font-bold text-gray-900'>{result.siswa.nama} (NISN: {result.siswa.nisn || '-'})</p>
                    </div>
                  )}

                  <div className='bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200 space-y-1 sm:col-span-2'>
                    <div className='flex items-center justify-between'>
                      <span className='text-emerald-800 font-semibold flex items-center gap-1.5'>
                        <User className='w-3.5 h-3.5 text-emerald-700' /> Penandatangan Elektronik (TTE)
                      </span>
                      <span className='text-[10px] bg-emerald-200/70 text-emerald-900 font-semibold px-2 py-0.5 rounded'>
                        {result.jenisTtd === 'BSRE_TTE' ? 'Sertifikat BSrE' : 'TTE Digital PAWARTA'}
                      </span>
                    </div>
                    <p className='font-bold text-emerald-950'>{result.penandatangan || 'Kepala Sekolah'}</p>
                    <p className='text-[11px] text-emerald-800'>{result.jabatanPenandatangan || 'Kepala Sekolah'} • <span className='font-mono'>{result.nip || '-'}</span></p>
                    {result.signedAt && (
                      <p className='text-[10px] text-emerald-600 font-mono pt-1'>
                        Waktu Pengesahan: {new Date(result.signedAt).toLocaleString('id-ID')}
                      </p>
                    )}
                  </div>
                </div>

                <div className='text-center pt-2 text-[11px] text-gray-400'>
                  Sistem Informasi Administrasi Persuratan Sekolah (PAWARTA) • Integritas Digital Terjamin
                </div>
              </div>
            ) : (
              <div className='bg-red-500/10 backdrop-blur-md rounded-2xl border-2 border-red-500/30 p-8 text-center space-y-3'>
                <ShieldAlert className='w-12 h-12 text-red-400 mx-auto' />
                <h3 className='text-lg font-bold text-red-200'>Dokumen Tidak Ditemukan / Tidak Valid</h3>
                <p className='text-xs text-red-300 max-w-md mx-auto'>
                  Nomor surat atau kode hash yang Anda masukkan tidak terdaftar dalam pangkalan data resmi PAWARTA. Pastikan nomor dimasukkan dengan tepat.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className='max-w-4xl w-full mx-auto text-center py-6 border-t border-white/10 text-xs text-gray-400'>
        © 2026 PAWARTA — Sistem Persuratan Digital & Tanda Tangan Elektronik Satuan Pendidikan.
      </footer>
    </div>
  );
}
