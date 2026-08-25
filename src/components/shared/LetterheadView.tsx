import React from 'react';

interface LetterheadProps {
  header?: {
    instansiUtama?: string | null;
    namaSekolah?: string | null;
    alamat?: string | null;
    kontak?: string | null;
    website?: string | null;
    tipeGaris?: string | null;
    logoUrl?: string | null;
  } | null;
  fallbackSekolah?: {
    nama?: string | null;
    alamat?: string | null;
    npsn?: string | null;
    email?: string | null;
    telepon?: string | null;
  } | null;
}

export function LetterheadView({ header, fallbackSekolah }: LetterheadProps) {
  const instansi =
    header?.instansiUtama || 'PEMERINTAH PROVINSI JAWA TIMUR • DINAS PENDIDIKAN';
  const namaSekolah =
    header?.namaSekolah || fallbackSekolah?.nama || 'SMA NEGERI CONTOH UTAMA';
  const alamat =
    header?.alamat || fallbackSekolah?.alamat || 'Jl. Pendidikan No. 45 Kota Utama';
  const kontak =
    header?.kontak ||
    `NPSN: ${fallbackSekolah?.npsn || '20512345'} • Email: ${fallbackSekolah?.email || 'info@sekolah.sch.id'}`;
  const website = header?.website;
  const tipeGaris = header?.tipeGaris || 'double_thick';
  const logoUrl = header?.logoUrl || '/tutwuri.svg';

  return (
    <div className='relative'>
      <div className='flex items-center justify-between gap-4'>
        {/* Logo Kiri */}
        <div className='w-20 sm:w-24 shrink-0 flex items-center justify-center'>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt='Logo Instansi / Sekolah'
              className='w-16 h-16 sm:w-20 sm:h-20 object-contain'
            />
          ) : (
            <div className='w-16 h-16 sm:w-20 sm:h-20' />
          )}
        </div>

        {/* Teks KOP Tengah */}
        <div className='flex-1 text-center px-2'>
          <h3 className='text-xs sm:text-sm font-bold tracking-wider uppercase text-gray-700 font-sans leading-tight'>
            {instansi}
          </h3>
          <h2 className='text-base sm:text-xl font-extrabold tracking-tight text-gray-950 uppercase mt-1 font-sans leading-tight'>
            {namaSekolah}
          </h2>
          <p className='text-[11px] sm:text-xs text-gray-600 mt-1 font-sans leading-snug'>
            {alamat}
          </p>
          <p className='text-[10px] sm:text-[11px] text-gray-500 font-sans leading-snug'>
            {kontak}
            {website ? ` • Website: ${website}` : ''}
          </p>
        </div>

        {/* Spacer Kanan agar Teks tetap di Tengah Sempurna */}
        <div className='w-20 sm:w-24 shrink-0 hidden sm:block' />
      </div>

      {/* Garis Pembatas KOP */}
      <div
        className={`mt-3 ${
          tipeGaris === 'double_thick'
            ? 'border-b-4 border-double border-gray-950'
            : tipeGaris === 'single_thick'
            ? 'border-b-2 border-gray-950'
            : 'border-b border-gray-950'
        }`}
      />
    </div>
  );
}
