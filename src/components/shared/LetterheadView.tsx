import React from 'react';

interface LetterheadProps {
  header?: {
    namaKop?: string | null;
    instansiUtama?: string | null;
    instansiInduk?: string | null;
    namaSekolah?: string | null;
    alamat?: string | null;
    kontak?: string | null;
    website?: string | null;
    tipeGaris?: string | null;
    logoUrl?: string | null;
    logoKiriUrl?: string | null;
    logoKananUrl?: string | null;
  } | null;
  fallbackSekolah?: {
    nama?: string | null;
    alamat?: string | null;
    npsn?: string | null;
    email?: string | null;
    telepon?: string | null;
  } | null;
  className?: string;
}

export function LetterheadView({ header, fallbackSekolah, className = '' }: LetterheadProps) {
  const instansiUtama = header?.instansiUtama || 'PEMERINTAH DAERAH PROVINSI JAWA TIMUR';
  const instansiInduk = header?.instansiInduk || 'DINAS PENDIDIKAN';
  const namaSekolah = header?.namaSekolah || fallbackSekolah?.nama || 'SMA NEGERI CONTOH UTAMA';
  const alamat = header?.alamat || fallbackSekolah?.alamat || 'Jl. Pendidikan No. 45 Kota Utama';

  const kontakParts: string[] = [];
  if (header?.kontak) {
    kontakParts.push(header.kontak);
  } else {
    if (fallbackSekolah?.npsn) kontakParts.push(`NPSN: ${fallbackSekolah.npsn}`);
    if (fallbackSekolah?.telepon) kontakParts.push(`Telp: ${fallbackSekolah.telepon}`);
    if (fallbackSekolah?.email) kontakParts.push(`e-mail: ${fallbackSekolah.email}`);
  }
  if (header?.website) {
    kontakParts.push(`Website: ${header.website}`);
  }
  const kontakText = kontakParts.join(' • ');

  const tipeGaris = header?.tipeGaris || 'double_thick';

  // Resolve logos
  const logoKiri = header?.logoKiriUrl || header?.logoUrl || null;
  const logoKanan = header?.logoKananUrl || null;

  const hasLeft = Boolean(logoKiri);
  const hasRight = Boolean(logoKanan);
  const hasAnyLogo = hasLeft || hasRight;

  return (
    <div className={`relative w-full ${className}`}>
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        {/* Kolom Kiri: Logo Kiri atau Balancing Spacer */}
        {hasAnyLogo && (
          <div className="w-16 sm:w-24 shrink-0 flex items-center justify-center">
            {hasLeft ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoKiri!}
                alt="Logo Kiri"
                className="w-14 h-14 sm:w-20 sm:h-20 object-contain"
              />
            ) : (
              // Balancing spacer jika hanya ada logo kanan agar teks tetap tepat di tengah
              <div className="w-14 h-14 sm:w-20 sm:h-20" aria-hidden="true" />
            )}
          </div>
        )}

        {/* Teks KOP Tengah (Hirarki Naskah Dinas Resmi) */}
        <div className="flex-1 text-center px-1 sm:px-2">
          {instansiUtama && (
            <h3 className="text-[11px] sm:text-sm font-bold tracking-wide uppercase text-black font-sans leading-tight">
              {instansiUtama}
            </h3>
          )}
          {instansiInduk && (
            <h4 className="text-[11px] sm:text-sm font-bold tracking-wide uppercase text-black font-sans leading-tight mt-0.5">
              {instansiInduk}
            </h4>
          )}
          <h2 className="text-sm sm:text-xl md:text-2xl font-black tracking-tight text-black uppercase mt-1 font-sans leading-tight">
            {namaSekolah}
          </h2>
          {alamat && (
            <p className="text-[10px] sm:text-xs font-normal text-black mt-1 font-sans leading-snug">
              {alamat}
            </p>
          )}
          {kontakText && (
            <p className="text-[9px] sm:text-[11px] font-normal text-black font-sans leading-snug">
              {kontakText}
            </p>
          )}
        </div>

        {/* Kolom Kanan: Logo Kanan atau Balancing Spacer */}
        {hasAnyLogo && (
          <div className="w-16 sm:w-24 shrink-0 flex items-center justify-center">
            {hasRight ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoKanan!}
                alt="Logo Kanan"
                className="w-14 h-14 sm:w-20 sm:h-20 object-contain"
              />
            ) : (
              // Balancing spacer jika hanya ada logo kiri agar teks tetap tepat di tengah
              <div className="w-14 h-14 sm:w-20 sm:h-20" aria-hidden="true" />
            )}
          </div>
        )}
      </div>

      {/* Garis Pembatas KOP */}
      {tipeGaris === 'double_thick' && (
        <div className="mt-2.5 space-y-[2px] w-full">
          <div className="border-b-2 sm:border-b-[2.5px] border-black w-full" />
          <div className="border-b border-black w-full" />
        </div>
      )}
      {tipeGaris === 'single_thick' && <div className="mt-2.5 border-b-2 border-black w-full" />}
      {tipeGaris === 'single_thin' && <div className="mt-2.5 border-b border-black w-full" />}
    </div>
  );
}
