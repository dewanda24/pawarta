'use client';

import { useState } from 'react';
import {
  BookOpen,
  Inbox,
  Send,
  GraduationCap,
  ShieldCheck,
  HelpCircle,
  Phone,
  FileCheck,
  Layers,
  Landmark,
  Radio,
  Printer,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function BantuanPage() {
  const [activeTab, setActiveTab] = useState<'panduan' | 'faq' | 'tte'>('panduan');

  return (
    <div className='space-y-6'>
      {/* Header Banner */}
      <div className='bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-sm space-y-2'>
        <div className='flex items-center gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider'>
          <BookOpen className='w-4 h-4' />
          <span>Pusat Bantuan & SOP Tata Naskah Dinas Sekolah</span>
        </div>
        <h1 className='text-2xl sm:text-3xl font-bold tracking-tight'>
          Panduan Operasional PAWARTA
        </h1>
        <p className='text-blue-100 text-xs sm:text-sm max-w-2xl'>
          Petunjuk teknis alur pengelolaan naskah dinas, registrasi surat masuk & cetak lembar disposisi, penerbitan surat kesiswaan, hingga validasi tanda tangan elektronik.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className='flex border-b border-gray-200 text-xs sm:text-sm'>
        <button
          onClick={() => setActiveTab('panduan')}
          className={`flex items-center gap-2 py-3 px-4 sm:px-6 font-semibold border-b-2 transition-all ${
            activeTab === 'panduan'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <BookOpen className='w-4 h-4' /> Alur Kerja Persuratan
        </button>
        <button
          onClick={() => setActiveTab('tte')}
          className={`flex items-center gap-2 py-3 px-4 sm:px-6 font-semibold border-b-2 transition-all ${
            activeTab === 'tte'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <ShieldCheck className='w-4 h-4' /> TTE & Verifikasi QR Code
        </button>
        <button
          onClick={() => setActiveTab('faq')}
          className={`flex items-center gap-2 py-3 px-4 sm:px-6 font-semibold border-b-2 transition-all ${
            activeTab === 'faq'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <HelpCircle className='w-4 h-4' /> Tanya Jawab (FAQ)
        </button>
      </div>

      {/* TAB 1: PANDUAN ALUR PERSURATAN */}
      {activeTab === 'panduan' && (
        <div className='space-y-6'>
          {/* Section 1: Surat Masuk & Disposisi */}
          <div className='bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4'>
            <div className='flex items-center gap-3 border-b border-gray-100 pb-3'>
              <div className='w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold'>
                <Inbox className='w-5 h-5' />
              </div>
              <div>
                <h2 className='text-base font-bold text-gray-900'>1. Alur Pengelolaan Surat Masuk & Disposisi</h2>
                <p className='text-xs text-gray-500'>Prosedur registrasi berkas masuk hingga disposisi Kepala Sekolah</p>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-xs'>
              <div className='bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2'>
                <span className='w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px]'>1</span>
                <h3 className='font-bold text-gray-900'>Pencatatan Berkas (Staf TU)</h3>
                <p className='text-gray-600 leading-relaxed'>
                  Surat fisik atau email dicatat di menu <strong>Surat Masuk ➔ Registrasi</strong>. Sistem secara otomatis memberikan <em>Nomor Agenda Digital</em> dan mengunggah pindaian berkas asli (PDF/JPG).
                </p>
              </div>

              <div className='bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2'>
                <span className='w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px]'>2</span>
                <h3 className='font-bold text-gray-900'>Disposisi Kepala Sekolah</h3>
                <p className='text-gray-600 leading-relaxed'>
                  Kepala Sekolah membaca ringkasan surat di sistem atau berkas fisik, lalu memilih pejabat/guru tujuan dan memberikan instruksi tindak lanjut.
                </p>
              </div>

              <div className='bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2'>
                <span className='w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px]'>3</span>
                <h3 className='font-bold text-gray-900'>Cetak Lembar Disposisi & Notifikasi</h3>
                <p className='text-gray-600 leading-relaxed'>
                  TU mencetak <strong>Lembar Disposisi 1/2 HVS</strong> untuk map arsip fisik. Guru/Waka penerima disposisi dapat melihat tugas di menu <strong>Disposisi Saya</strong> atau menerima notifikasi WA instan.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Surat Keluar & Kesiswaan */}
          <div className='bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4'>
            <div className='flex items-center gap-3 border-b border-gray-100 pb-3'>
              <div className='w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold'>
                <Send className='w-5 h-5' />
              </div>
              <div>
                <h2 className='text-base font-bold text-gray-900'>2. Alur Penerbitan Surat Keluar & Kesiswaan</h2>
                <p className='text-xs text-gray-500'>Penerbitan surat dinas, dispensasi lomba siswa, dan surat keterangan aktif</p>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-xs'>
              <div className='bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2'>
                <span className='w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px]'>1</span>
                <h3 className='font-bold text-gray-900'>Pilih Jenis & Template Surat</h3>
                <p className='text-gray-600 leading-relaxed'>
                  Buka menu <strong>Surat Keluar</strong> untuk dinas umum atau <strong>Surat Kesiswaan</strong> untuk dispensasi lomba, keterangan aktif siswa, atau panggilan orang tua.
                </p>
              </div>

              <div className='bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2'>
                <span className='w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px]'>2</span>
                <h3 className='font-bold text-gray-900'>Otomatisasi Penomoran & KOP</h3>
                <p className='text-gray-600 leading-relaxed'>
                  Sistem otomatis menyematkan <strong>KOP Surat Resmi</strong> (logo dinas/sekolah) dan meng-generate <strong>Nomor Surat Kedinasan</strong> sesuai Kode Klasifikasi tanpa risiko nomor ganda.
                </p>
              </div>

              <div className='bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2'>
                <span className='w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px]'>3</span>
                <h3 className='font-bold text-gray-900'>Langsung Siap Cetak / TTE</h3>
                <p className='text-gray-600 leading-relaxed'>
                  Surat siap dicetak di kertas resmi untuk tanda tangan basah Kepala Sekolah, atau ditandatangani secara elektronik (TTE) yang dilengkapi QR Code Verifikasi.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TTE & QR VERIFIKASI */}
      {activeTab === 'tte' && (
        <div className='bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-5 text-xs sm:text-sm text-gray-700 leading-relaxed'>
          <div className='flex items-center gap-3 border-b border-gray-100 pb-4'>
            <div className='w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold'>
              <ShieldCheck className='w-6 h-6' />
            </div>
            <div>
              <h2 className='text-base font-bold text-gray-900'>Validasi Keabsahan Tanda Tangan Elektronik (TTE)</h2>
              <p className='text-xs text-gray-500'>Bagaimana cara memverifikasi keaslian dokumen yang diterbitkan PAWARTA?</p>
            </div>
          </div>

          <div className='space-y-4'>
            <p>
              Setiap dokumen naskah dinas dan surat kesiswaan yang diterbitkan oleh sistem <strong>PAWARTA</strong> dilengkapi dengan <strong>QR Code Keabsahan Digital</strong> yang terhubung ke pangkalan data sekolah.
            </p>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pt-2'>
              <div className='p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1.5'>
                <h3 className='font-bold text-gray-900 text-xs flex items-center gap-2'>
                  <Phone className='w-4 h-4 text-blue-600' /> 1. Pemindaian Langsung via Kamera Smartphone
                </h3>
                <p className='text-xs text-gray-600'>
                  Penerima surat (instansi luar, panitia lomba, wali murid) cukup mengarahkan kamera HP ke QR Code yang tercetak di sudut tanda tangan surat untuk langsung melihat status keaslian dokumen secara publik.
                </p>
              </div>

              <div className='p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1.5'>
                <h3 className='font-bold text-gray-900 text-xs flex items-center gap-2'>
                  <FileCheck className='w-4 h-4 text-emerald-600' /> 2. Melalui Portal Verifikasi Publik
                </h3>
                <p className='text-xs text-gray-600'>
                  Akses laman publik <strong>/verifikasi</strong> dan masukkan Nomor Surat atau ID Berkas untuk memeriksa validitas penerbitan, nama penandatangan, dan NIP Kepala Sekolah.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FAQ */}
      {activeTab === 'faq' && (
        <div className='bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-4'>
          <h2 className='text-base font-bold text-gray-900 border-b pb-3'>Pertanyaan yang Sering Diajukan (FAQ)</h2>

          <div className='divide-y divide-gray-100 text-xs sm:text-sm'>
            <div className='py-3 space-y-1'>
              <h3 className='font-bold text-gray-900'>Bagaimana cara mengganti Logo dan Alamat pada KOP Surat?</h3>
              <p className='text-gray-600'>
                Buka menu <strong>Master Data Sekolah ➔ Desain KOP Surat</strong>. Anda dapat mengunggah logo sekolah kustom, mengubah instansi dinas, alamat, email, serta memilih gaya garis pembatas resmi kedinasan.
              </p>
            </div>

            <div className='py-3 space-y-1'>
              <h3 className='font-bold text-gray-900'>Bagaimana cara mencetak Rekapitulasi Buku Agenda untuk Akreditasi Sekolah?</h3>
              <p className='text-gray-600'>
                Masuk ke menu <strong>Buku Agenda & Rekap</strong>, tentukan rentang tanggal (misalnya 1 tahun ajaran), lalu klik tombol <strong>Export Excel / CSV</strong> atau klik <strong>Cetak Buku Agenda</strong> untuk mencetak lembar formal lengkap dengan blok tanda tangan pengarsip & Kepala Sekolah.
              </p>
            </div>

            <div className='py-3 space-y-1'>
              <h3 className='font-bold text-gray-900'>Apakah surat dispensasi siswa bisa mencakup banyak peserta sekaligus?</h3>
              <p className='text-gray-600'>
                Ya. Pada formulir <strong>Surat Kesiswaan ➔ Buat Dispensasi</strong>, Anda dapat memilih banyak nama siswa (misalnya tim basket/futsal/olimpiade) dalam satu nomor surat izin resmi.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
