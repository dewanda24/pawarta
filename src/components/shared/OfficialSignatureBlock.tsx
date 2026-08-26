import React from 'react';

export interface OfficialSignatureBlockProps {
  jabatan: string; // Misal: "Kepala SMP Negeri 1 Ujungjaya"
  nama: string; // Misal: "Drs. H. Ahmad Wijaya, M.Pd."
  pangkatGolongan?: string | null; // Misal: "Pembina Tingkat I (IV/b)"
  nip?: string | null; // Misal: "197503122000031001"
  tempatTanggal?: string | null; // Misal: "Sumedang, 26 Agustus 2026"
  isTte?: boolean;
  qrCodeUrl?: string | null;
  className?: string;
}

export function OfficialSignatureBlock({
  jabatan,
  nama,
  pangkatGolongan,
  nip,
  tempatTanggal,
  isTte = false,
  qrCodeUrl,
  className = '',
}: OfficialSignatureBlockProps) {
  return (
    <div className={`inline-block text-left font-sans text-black ${className}`}>
      {/* Tempat & Tanggal */}
      {tempatTanggal && <p className="text-sm text-gray-900 mb-1">{tempatTanggal}</p>}

      {/* Jabatan Penandatangan */}
      <p className="text-sm font-semibold text-gray-950">{jabatan},</p>

      {/* Area Tanda Tangan / QR Code TTE (Pasal 49) */}
      <div className="my-2 min-h-[75px] flex items-center">
        {isTte && qrCodeUrl ? (
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrCodeUrl}
              alt="QR Code TTE Resmi"
              className="w-16 h-16 object-contain border border-gray-200 p-0.5 rounded"
            />
            <div className="text-[10px] text-gray-500 leading-tight">
              <p className="font-semibold text-gray-700">Ditandatangani secara elektronik</p>
              <p>Sesuai Perbup Sumedang No. 9/2026</p>
            </div>
          </div>
        ) : (
          <div className="h-16" aria-hidden="true" />
        )}
      </div>

      {/* Nama Lengkap & Gelar (Title Case - Pasal 48 ayat 5) */}
      <p className="text-sm font-bold text-gray-950 underline decoration-1 underline-offset-2">
        {nama}
      </p>

      {/* Pangkat / Golongan Ruang (Pasal 48 ayat 8) */}
      {pangkatGolongan && (
        <p className="text-xs text-gray-800 leading-tight mt-0.5">{pangkatGolongan}</p>
      )}

      {/* NIP (Pasal 48 ayat 8) */}
      {nip && <p className="text-xs text-gray-800 font-mono leading-tight mt-0.5">NIP. {nip}</p>}
    </div>
  );
}
