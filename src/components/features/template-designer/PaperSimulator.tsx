'use client';

import React from 'react';
import { PaperSettings } from '@/features/master-data/types/template-surat';
import { LetterheadView } from '@/components/shared/LetterheadView';
import { OfficialSignatureBlock } from '@/components/shared/OfficialSignatureBlock';

export type SampleDocType =
  | 'UNDANGAN_DINAS'
  | 'SURAT_TUGAS'
  | 'KETERANGAN_SISWA'
  | 'PANGGILAN_ORTU'
  | 'SURAT_KEPUTUSAN'
  | 'CUSTOM_BODY';

interface PaperSimulatorProps {
  settings: PaperSettings;
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
  kepsek?: {
    nama?: string | null;
    nip?: string | null;
    pangkatGolongan?: string | null;
  } | null;
  sampleType?: SampleDocType;
  customHtml?: string;
  zoom?: number; // scale multiplier e.g. 1.0, 0.85
  className?: string;
}

// Paper dimensions in millimeters
const PAPER_DIMENSIONS: Record<string, { widthMm: number; heightMm: number }> = {
  A4: { widthMm: 210, heightMm: 297 },
  F4: { widthMm: 215, heightMm: 330 }, // Standar Folio Indonesia
  Letter: { widthMm: 215.9, heightMm: 279.4 },
  Legal: { widthMm: 215.9, heightMm: 355.6 },
};

export function PaperSimulator({
  settings,
  header,
  fallbackSekolah,
  kepsek,
  sampleType = 'UNDANGAN_DINAS',
  customHtml,
  zoom = 1,
  className = '',
}: PaperSimulatorProps) {
  const { ukuran, orientasi, margin, tipografi, tampilkanGarisBatasMargin } = settings;

  const baseDim = PAPER_DIMENSIONS[ukuran] || PAPER_DIMENSIONS.A4;
  const isLandscape = orientasi === 'landscape';

  const widthMm = isLandscape ? baseDim.heightMm : baseDim.widthMm;
  const heightMm = isLandscape ? baseDim.widthMm : baseDim.heightMm;

  // Margin in CSS strings
  const marginTopCss = `${margin.top}${margin.unit}`;
  const marginRightCss = `${margin.right}${margin.unit}`;
  const marginBottomCss = `${margin.bottom}${margin.unit}`;
  const marginLeftCss = `${margin.left}${margin.unit}`;

  const fontName = tipografi.fontFamily || 'Arial';
  const fontSizeCss = `${tipografi.fontSizePt || 11}pt`;
  const lineHeightCss = tipografi.lineHeight || 1.15;
  const paragraphSpacingCss = `${tipografi.paragraphSpacingPt || 8}pt`;
  const indentCss = `${tipografi.firstLineIndentCm || 1.0}cm`;

  return (
    <div className={`flex justify-center items-start ${className}`}>
      {/* Dynamic @page CSS for accurate browser printing matching the configured margins */}
      <style jsx global>{`
        @page {
          size: ${ukuran === 'F4' ? '215mm 330mm' : ukuran} ${orientasi};
          margin: ${marginTopCss} ${marginRightCss} ${marginBottomCss} ${marginLeftCss};
        }
        @media print {
          body {
            background: white !important;
            padding: 0 !important;
          }
          .paper-simulator-root {
            transform: none !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            min-height: auto !important;
          }
          .paper-margin-guide {
            outline: none !important;
            border: none !important;
          }
        }
      `}</style>

      {/* The Physical Simulated Paper Sheet */}
      <div
        className="paper-simulator-root bg-white text-gray-950 shadow-2xl transition-transform origin-top relative border border-gray-200"
        style={{
          width: `${widthMm}mm`,
          minHeight: `${heightMm}mm`,
          paddingTop: marginTopCss,
          paddingRight: marginRightCss,
          paddingBottom: marginBottomCss,
          paddingLeft: marginLeftCss,
          transform: `scale(${zoom})`,
          fontFamily: `"${fontName}", sans-serif, serif`,
          fontSize: fontSizeCss,
          lineHeight: lineHeightCss,
          boxSizing: 'border-box',
        }}
      >
        {/* Margin Guide Overlay for visual calibration */}
        {tampilkanGarisBatasMargin && (
          <div
            className="paper-margin-guide absolute inset-0 pointer-events-none print:hidden z-10"
            style={{
              top: marginTopCss,
              right: marginRightCss,
              bottom: marginBottomCss,
              left: marginLeftCss,
              border: '1px dashed rgba(59, 130, 246, 0.4)',
              backgroundColor: 'rgba(59, 130, 246, 0.015)',
            }}
          >
            {/* Guide labels in corners */}
            <span className="absolute -top-4 left-0 text-[9px] font-mono text-blue-500 font-semibold select-none">
              Top: {margin.top} {margin.unit} | Left: {margin.left} {margin.unit}
            </span>
            <span className="absolute -bottom-4 right-0 text-[9px] font-mono text-blue-500 font-semibold select-none">
              Right: {margin.right} {margin.unit} | Bottom: {margin.bottom} {margin.unit}
            </span>
          </div>
        )}

        {/* Printable Document Content */}
        <div className="relative z-0 w-full flex flex-col justify-between min-h-full">
          <div>
            {/* 1. KOP SURAT RESMI */}
            <LetterheadView header={header} fallbackSekolah={fallbackSekolah} />

            {/* 2. BODY KONTEN SURAT */}
            {sampleType === 'CUSTOM_BODY' && customHtml ? (
              <div
                className="mt-6 rich-text-preview"
                style={{
                  lineHeight: lineHeightCss,
                }}
                dangerouslySetInnerHTML={{ __html: customHtml }}
              />
            ) : (
              <SampleLetterBody
                sampleType={sampleType}
                fontName={fontName}
                fontSizeCss={fontSizeCss}
                lineHeightCss={lineHeightCss}
                paragraphSpacingCss={paragraphSpacingCss}
                indentCss={indentCss}
                sekolah={fallbackSekolah}
              />
            )}
          </div>

          {/* 3. TANDA TANGAN / FOOTER BLOK */}
          <div className="mt-8 pt-4 flex justify-end">
            <div className="text-left w-72">
              <OfficialSignatureBlock
                jabatan="Kepala Sekolah"
                nama={kepsek?.nama || 'Drs. H. Ahmad Wijaya, M.Pd.'}
                pangkatGolongan={kepsek?.pangkatGolongan || 'Pembina Tingkat I (IV/b)'}
                nip={kepsek?.nip || '197503122000031001'}
                isTte={true}
                qrCodeUrl="/api/v1/verifikasi/qr/sample-preview"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SampleLetterBodyProps {
  sampleType: SampleDocType;
  fontName: string;
  fontSizeCss: string;
  lineHeightCss: number;
  paragraphSpacingCss: string;
  indentCss: string;
  sekolah?: {
    nama?: string | null;
    kabupaten?: string | null;
  } | null;
}

function SampleLetterBody({
  sampleType,
  paragraphSpacingCss,
  indentCss,
  sekolah,
}: SampleLetterBodyProps) {
  const kota = sekolah?.kabupaten || 'Sumedang';
  const todayFormatted = new Date().toLocaleDateString('id-ID', { dateStyle: 'long' });

  if (sampleType === 'KETERANGAN_SISWA') {
    return (
      <div className="mt-6 space-y-4 text-justify">
        <div className="text-center space-y-0.5">
          <h3 className="font-bold text-base uppercase tracking-wider underline">
            SURAT KETERANGAN SISWA AKTIF
          </h3>
          <p className="text-xs font-mono">Nomor : 421.3 / 084 / SMA-01 / 2026</p>
        </div>

        <p style={{ textIndent: indentCss, marginBottom: paragraphSpacingCss }}>
          Yang bertanda tangan di bawah ini Kepala {sekolah?.nama || 'SMA Negeri 1 Sumedang'},
          Kabupaten {kota}, Provinsi Jawa Barat, dengan ini menerangkan bahwa:
        </p>

        <div className="ml-6 space-y-1.5 text-sm">
          <div className="grid grid-cols-[140px_12px_1fr]">
            <span>Nama Lengkap</span>
            <span>:</span>
            <span className="font-bold">Muhammad Rizky Pratama</span>
          </div>
          <div className="grid grid-cols-[140px_12px_1fr]">
            <span>NIS / NISN</span>
            <span>:</span>
            <span>222310452 / 0076543210</span>
          </div>
          <div className="grid grid-cols-[140px_12px_1fr]">
            <span>Tempat, Tgl Lahir</span>
            <span>:</span>
            <span>Sumedang, 14 Mei 2008</span>
          </div>
          <div className="grid grid-cols-[140px_12px_1fr]">
            <span>Kelas / Rombel</span>
            <span>:</span>
            <span>XII MIPA 1</span>
          </div>
          <div className="grid grid-cols-[140px_12px_1fr]">
            <span>Nama Orang Tua</span>
            <span>:</span>
            <span>Bambang Sutejo</span>
          </div>
        </div>

        <p style={{ textIndent: indentCss, marginBottom: paragraphSpacingCss }}>
          Adalah benar peserta didik yang tercatat aktif mengikuti kegiatan belajar mengajar pada
          Tahun Ajaran 2025/2026 di {sekolah?.nama || 'SMA Negeri 1 Sumedang'}. Surat keterangan ini
          diberikan untuk keperluan pengajuan beasiswa pendidikan.
        </p>

        <p style={{ textIndent: indentCss }}>
          Demikian surat keterangan ini kami buat dengan sebenarnya agar dapat dipergunakan
          sebagaimana mestinya.
        </p>
      </div>
    );
  }

  if (sampleType === 'SURAT_TUGAS') {
    return (
      <div className="mt-6 space-y-4 text-justify">
        <div className="text-center space-y-0.5">
          <h3 className="font-bold text-base uppercase tracking-wider underline">SURAT TUGAS</h3>
          <p className="text-xs font-mono">Nomor : 090 / 142 / TU-ST / 2026</p>
        </div>

        <p style={{ textIndent: indentCss, marginBottom: paragraphSpacingCss }}>
          Menindaklanjuti Surat Edaran Kepala Dinas Pendidikan Provinsi mengenai Pelatihan
          Peningkatan Mutu Tata Kelola Persuratan Sekolah, Kepala{' '}
          {sekolah?.nama || 'SMA Negeri 1 Sumedang'} dengan ini menugaskan kepada:
        </p>

        <div className="ml-6 space-y-1.5 text-sm">
          <div className="grid grid-cols-[140px_12px_1fr]">
            <span>Nama</span>
            <span>:</span>
            <span className="font-bold">Hendra Gunawan, S.Kom.</span>
          </div>
          <div className="grid grid-cols-[140px_12px_1fr]">
            <span>NIP</span>
            <span>:</span>
            <span>198504122010011012</span>
          </div>
          <div className="grid grid-cols-[140px_12px_1fr]">
            <span>Pangkat / Golongan</span>
            <span>:</span>
            <span>Penata Muda Tk. I (III/b)</span>
          </div>
          <div className="grid grid-cols-[140px_12px_1fr]">
            <span>Jabatan</span>
            <span>:</span>
            <span>Kepala Urusan Tata Usaha</span>
          </div>
        </div>

        <p style={{ textIndent: indentCss, marginBottom: paragraphSpacingCss }}>
          Untuk menghadiri dan mengikuti kegiatan{' '}
          <strong>Bimtek Transformasi Digital Naskah Dinas Sekolah</strong> yang akan
          diselenggarakan pada hari Kamis, 28 Agustus 2026 di Aula Sasana Praja Pemda {kota}.
        </p>

        <p style={{ textIndent: indentCss }}>
          Demikian surat tugas ini diberikan untuk dilaksanakan dengan penuh rasa tanggung jawab dan
          menyampaikan laporan hasil pelaksanaan tugas setelah kegiatan selesai.
        </p>
      </div>
    );
  }

  // Default: UNDANGAN_DINAS
  return (
    <div className="mt-6 space-y-4 text-justify">
      {/* Nomor & Tanggal */}
      <div className="flex justify-between items-start text-sm">
        <div className="space-y-1">
          <div className="grid grid-cols-[80px_12px_1fr]">
            <span>Nomor</span>
            <span>:</span>
            <span className="font-bold">005 / 218 / SMA-01 / 2026</span>
          </div>
          <div className="grid grid-cols-[80px_12px_1fr]">
            <span>Sifat</span>
            <span>:</span>
            <span>Penting</span>
          </div>
          <div className="grid grid-cols-[80px_12px_1fr]">
            <span>Lampiran</span>
            <span>:</span>
            <span>1 (satu) Berkas Jadwal</span>
          </div>
          <div className="grid grid-cols-[80px_12px_1fr]">
            <span>Perihal</span>
            <span>:</span>
            <span className="font-semibold">Undangan Rapat Koordinasi Naskah Dinas Digital</span>
          </div>
        </div>
        <div className="text-right text-sm">
          <p>
            {kota}, {todayFormatted}
          </p>
        </div>
      </div>

      {/* Tujuan Surat */}
      <div className="mt-4 space-y-1 text-sm">
        <p>Kepada Yth.</p>
        <p className="font-bold">Bapak/Ibu Pendidik dan Tenaga Kependidikan</p>
        <p>{sekolah?.nama || 'SMA Negeri 1 Sumedang'}</p>
        <p>di Tempat</p>
      </div>

      {/* Isi Naskah */}
      <div className="mt-4 space-y-3">
        <p>Dengan hormat,</p>
        <p style={{ textIndent: indentCss, marginBottom: paragraphSpacingCss }}>
          Dalam rangka standarisasi format naskah dinas, penyesuaian margin surat resmi, serta
          penerapan tanda tangan elektronik (TTE) terintegrasi pada lingkungan sekolah, bersama ini
          kami mengundang Bapak/Ibu untuk hadir dalam rapat koordinasi yang akan diselenggarakan
          pada:
        </p>

        <div className="ml-8 space-y-1.5 text-sm">
          <div className="grid grid-cols-[110px_12px_1fr]">
            <span>Hari, Tanggal</span>
            <span>:</span>
            <span className="font-semibold">Jumat, 29 Agustus 2026</span>
          </div>
          <div className="grid grid-cols-[110px_12px_1fr]">
            <span>Waktu</span>
            <span>:</span>
            <span>08.30 WIB s.d. Selesai</span>
          </div>
          <div className="grid grid-cols-[110px_12px_1fr]">
            <span>Tempat</span>
            <span>:</span>
            <span>Ruang Rapat Utama / Multimedia Gedung A</span>
          </div>
          <div className="grid grid-cols-[110px_12px_1fr]">
            <span>Agenda</span>
            <span>:</span>
            <span>Sosialisasi & Uji Coba Aplikasi Tata Naskah PAWARTA</span>
          </div>
        </div>

        <p style={{ textIndent: indentCss, marginBottom: paragraphSpacingCss }}>
          Mengingat pentingnya agenda tersebut, kami mengharapkan kehadiran Bapak/Ibu tepat pada
          waktunya.
        </p>

        <p style={{ textIndent: indentCss }}>
          Demikian undangan ini kami sampaikan. Atas perhatian dan kerja sama yang baik, kami
          ucapkan terima kasih.
        </p>
      </div>
    </div>
  );
}
