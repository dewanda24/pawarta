import React from 'react';

export type TipeKopNaskahDinas = 'PERANGKAT_DAERAH' | 'JABATAN_BUPATI' | 'ATAS_NAMA_BUPATI';

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
    tipeKop?: string | null;
  } | null;
  fallbackSekolah?: {
    nama?: string | null;
    alamat?: string | null;
    npsn?: string | null;
    email?: string | null;
    telepon?: string | null;
    kabupaten?: string | null;
  } | null;
  className?: string;
  tipeKopOverride?: TipeKopNaskahDinas;
}

export function LetterheadView({
  header,
  fallbackSekolah,
  className = '',
  tipeKopOverride,
}: LetterheadProps) {
  const tipeKop = (tipeKopOverride || header?.tipeKop || 'PERANGKAT_DAERAH') as TipeKopNaskahDinas;

  // 1. KOP JABATAN BUPATI / ATAS NAMA BUPATI (Lampiran IV.A)
  if (tipeKop === 'JABATAN_BUPATI' || tipeKop === 'ATAS_NAMA_BUPATI') {
    const judulKop =
      tipeKop === 'JABATAN_BUPATI'
        ? header?.namaSekolah || 'BUPATI SUMEDANG'
        : 'KABUPATEN SUMEDANG';

    const logoGaruda = header?.logoUrl || header?.logoKiriUrl || '/garuda-emas.png';

    return (
      <div className={`relative w-full text-center ${className}`}>
        {/* Lambang Garuda 2.5 cm Simetris Tengah Atas */}
        <div className="flex justify-center mb-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoGaruda}
            alt="Lambang Negara"
            className="w-16 h-16 object-contain"
            onError={(e) => {
              // fallback ke logo pemda jika garuda tidak tersedia
              (e.target as HTMLImageElement).src = '/Lambang_Kabupaten_Sumedang.png';
            }}
          />
        </div>
        <h2 className="text-base sm:text-lg font-bold tracking-wider text-black font-sans uppercase">
          {judulKop}
        </h2>
        {header?.alamat && (
          <p className="text-[10px] sm:text-xs text-black font-sans mt-1">{header.alamat}</p>
        )}
        {header?.kontak && (
          <p className="text-[9px] sm:text-[11px] text-black font-sans">{header.kontak}</p>
        )}
      </div>
    );
  }

  // 2. KOP PERANGKAT DAERAH / DINAS / SEKOLAH (Lampiran IV.B)
  // Aturan Perbup No. 9/2026:
  // - Rasio huruf Pemerintah Daerah : Perangkat Daerah = 3 : 4
  // - Font Arial, Nama Perangkat Daerah ditebalkan (bold)
  const instansiUtama = header?.instansiUtama || 'PEMERINTAH KABUPATEN SUMEDANG';
  const instansiInduk = header?.instansiInduk || (header?.namaSekolah ? 'DINAS PENDIDIKAN' : null);
  const namaInstansi = header?.namaSekolah || fallbackSekolah?.nama || 'DINAS PENDIDIKAN';
  const alamat =
    header?.alamat || fallbackSekolah?.alamat || 'Jl. Prabu Gajah Agung No. 9 Sumedang';

  const kontakParts: string[] = [];
  if (header?.kontak) {
    kontakParts.push(header.kontak);
  } else {
    if (fallbackSekolah?.telepon) kontakParts.push(`Telp: ${fallbackSekolah.telepon}`);
    if (fallbackSekolah?.email) kontakParts.push(`Pos-el: ${fallbackSekolah.email}`);
  }
  if (header?.website) {
    kontakParts.push(`Laman: ${header.website}`);
  }
  const kontakText = kontakParts.join(' • ');
  const tipeGaris = header?.tipeGaris || 'double_thick';

  // Resolusi logo (Default Pemda Sumedang di kiri)
  const logoKiri = header?.logoKiriUrl || header?.logoUrl || '/Lambang_Kabupaten_Sumedang.png';
  const logoKanan = header?.logoKananUrl || null;

  const hasLeft = Boolean(logoKiri);
  const hasRight = Boolean(logoKanan);
  const hasAnyLogo = hasLeft || hasRight;

  return (
    <div className={`relative w-full ${className}`}>
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        {/* Kolom Kiri: Logo Daerah */}
        {hasAnyLogo && (
          <div className="w-16 sm:w-24 shrink-0 flex items-center justify-center">
            {hasLeft ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoKiri!}
                alt="Logo Daerah Kab. Sumedang"
                className="w-14 h-14 sm:w-20 sm:h-20 object-contain"
              />
            ) : (
              <div className="w-14 h-14 sm:w-20 sm:h-20" aria-hidden="true" />
            )}
          </div>
        )}

        {/* Teks KOP Tengah (Perbandingan Rasio 3 : 4) */}
        <div className="flex-1 text-center px-1 sm:px-2">
          {/* Tulisan Instansi Utama (Skala Rasio 3) */}
          <h3 className="text-[12px] sm:text-[14px] md:text-[15px] font-semibold tracking-wide uppercase text-black font-sans leading-tight">
            {instansiUtama}
          </h3>

          {instansiInduk && instansiInduk !== instansiUtama && (
            <h4 className="text-[12px] sm:text-[14px] font-semibold tracking-wide uppercase text-black font-sans leading-tight mt-0.5">
              {instansiInduk}
            </h4>
          )}

          {/* Tulisan Nama Perangkat Daerah / Satuan Pendidikan (Skala Rasio 4 - Bold) */}
          <h2 className="text-[16px] sm:text-[19px] md:text-[20px] font-bold tracking-tight text-black uppercase mt-0.5 font-sans leading-tight">
            {namaInstansi}
          </h2>

          {alamat && (
            <p className="text-[10px] sm:text-[11px] font-normal text-black mt-1 font-sans leading-tight">
              {alamat}
            </p>
          )}
          {kontakText && (
            <p className="text-[9px] sm:text-[10px] font-normal text-black font-sans leading-tight mt-0.5">
              {kontakText}
            </p>
          )}
        </div>

        {/* Kolom Kanan: Logo Sekolah / Instansi (Opsional) atau Spacer */}
        {hasAnyLogo && (
          <div className="w-16 sm:w-24 shrink-0 flex items-center justify-center">
            {hasRight ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoKanan!}
                alt="Logo Satuan Pendidikan"
                className="w-14 h-14 sm:w-20 sm:h-20 object-contain"
              />
            ) : (
              <div className="w-14 h-14 sm:w-20 sm:h-20" aria-hidden="true" />
            )}
          </div>
        )}
      </div>

      {/* Garis Penutup KOP (Garis Ganda Tebal-Tipis Sesuai Standar) */}
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
