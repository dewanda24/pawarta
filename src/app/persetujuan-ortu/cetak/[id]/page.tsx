import { getConsentDetailById } from '@/features/student-letter/consent-actions';
import { notFound } from 'next/navigation';
import { PrintButton } from '@/components/shared/PrintButton';
import { LetterheadView } from '@/components/shared/LetterheadView';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { stripNomorPrefix } from '@/lib/nomor-surat-generator';

export const metadata = {
  title: 'Cetak Surat Persetujuan Orang Tua | SMPN 1 UJUNGJAYA',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CetakPersetujuanPage({ params }: PageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const res = await getConsentDetailById(id);
  if (!res.success || !res.data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl max-w-md w-full shadow-lg border border-gray-200 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Dokumen Tidak Ditemukan</h2>
          <p className="text-xs text-gray-500">
            {res.error || 'Dokumen surat persetujuan tidak dapat dimuat.'}
          </p>
          <Link href="/persetujuan-ortu">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2">
              Kembali ke Formulir
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const consent = res.data;
  const sekolah = res.sekolah;
  const kopSurat = res.kopSurat;
  const kepsek = res.kepsek;
  const config = (consent.documentSnapshot as any)?.config || res.config;

  const cleanNomorSurat =
    stripNomorPrefix(consent.nomorSurat) || config?.nomorSurat || 'B/382/400.3.5.1/VIII/2026';

  const tanggalTtd = consent.signedAt
    ? new Date(consent.signedAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

  const tanggalSuratDisplay =
    config?.tanggalSurat && config.tanggalSurat !== 'OTOMATIS'
      ? config.tanggalSurat
      : tanggalTtd;

  const namaSiswa =
    consent.siswa?.nama || (consent.documentSnapshot as any)?.siswa?.nama || '-';
  const nisSiswa =
    consent.siswa?.nis || (consent.documentSnapshot as any)?.siswa?.nis || '-';
  const nisnSiswa =
    consent.siswa?.nisn || (consent.documentSnapshot as any)?.siswa?.nisn || '-';
  const kelasSiswa =
    consent.siswa?.kelas?.namaKelas ||
    consent.kelas?.namaKelas ||
    (consent.documentSnapshot as any)?.siswa?.kelas ||
    '-';

  const namaPenandatangan =
    config?.penandatangan?.nama ||
    (consent.documentSnapshot as any)?.kepsek?.nama ||
    kepsek?.nama ||
    'Drs. H. Dedi Kusnadi, M.Pd.';

  const nipPenandatangan =
    config?.penandatangan?.nip ||
    (consent.documentSnapshot as any)?.kepsek?.nip ||
    kepsek?.nip ||
    '19680512 199403 1 005';

  const jabatanPenandatangan =
    config?.penandatangan?.jabatan ||
    (consent.documentSnapshot as any)?.kepsek?.jabatan ||
    `Kepala ${sekolah?.nama || 'SMPN 1 UJUNGJAYA'}`;

  const tampilkanQr = config?.penandatangan?.tampilkanQr !== false;

  // Resolusi Tipografi Surat Dinamis
  const selectedFont = config?.fontSurat || 'Times New Roman';
  const resolvedFontFamily =
    selectedFont === 'Arial'
      ? 'Arial, Helvetica, sans-serif'
      : selectedFont === 'Bookman Old Style'
        ? '"Bookman Old Style", Georgia, serif'
        : selectedFont === 'Garamond'
          ? 'Garamond, "EB Garamond", serif'
          : selectedFont === 'Georgia'
            ? 'Georgia, serif'
            : selectedFont === 'Calibri'
              ? 'Calibri, Candara, Segoe, "Segoe UI", sans-serif'
              : selectedFont === 'Tahoma'
                ? 'Tahoma, Geneva, sans-serif'
                : selectedFont === 'Courier New'
                  ? '"Courier New", Courier, monospace'
                  : '"Times New Roman", Times, serif';

  const resolvedLineHeight = config?.spasiSurat || '1.5';
  const resolvedFontSize = config?.ukuranFontSurat ? `${config.ukuranFontSurat}pt` : '11pt';

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 print:p-0 print:space-y-0 print:max-w-none">
      {/* Header Bar Navigation & Action (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase">
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
              Dokumen Resmi {sekolah?.nama || 'SMPN 1 UJUNGJAYA'}
            </span>
            <span>•</span>
            <span
              className={`px-2 py-0.5 rounded font-semibold border ${
                consent.statusPersetujuan === 'SETUJU'
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : 'text-red-700 bg-red-50 border-red-200'
              }`}
            >
              {consent.statusPersetujuan === 'SETUJU' ? 'DISETUJUI' : 'DITOLAK'}
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 mt-1">
            Nomor: {cleanNomorSurat}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Peserta Didik: <strong>{namaSiswa}</strong> (Kelas: {kelasSiswa})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/persetujuan-ortu/sukses/${consent.id}`}>
            <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs h-9">
              <ArrowLeft className="w-4 h-4" /> Kembali
            </Button>
          </Link>
          <PrintButton />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LEMBAR PERSETUJUAN / PERNYATAAN RESMI ORANG TUA / WALI (1 HALAMAN)        */}
      {/* ========================================================================= */}
      <div
        className="print-page bg-white p-6 sm:p-10 md:p-12 rounded-2xl border border-gray-200 shadow-sm print:border-none print:shadow-none print:p-0 text-gray-950 text-[13px]"
        style={{
          fontFamily: resolvedFontFamily,
          lineHeight: resolvedLineHeight,
          fontSize: resolvedFontSize,
        }}
      >
        {/* Kop Surat Resmi di Lembar Pernyataan */}
        <LetterheadView header={kopSurat} fallbackSekolah={sekolah} />

        {/* Judul Lembar Persetujuan Formal */}
        <div className="text-center space-y-1 my-3">
          <h2 className="font-bold text-sm sm:text-base print:text-[12pt] uppercase tracking-wider underline leading-snug">
            {config?.judulHalaman2 || 'SURAT PERNYATAAN / PERSETUJUAN ORANG TUA / WALI MURID'}
          </h2>
          <p className="font-bold text-xs print:text-[10.5pt] uppercase tracking-wide text-gray-800 leading-snug">
            {config?.subjudulHalaman2 || 'PENERAPAN SISTEM PEMBELAJARAN 5 (LIMA) HARI SEKOLAH'}
          </p>
          <p className="text-[11px] print:text-[9.5pt] text-gray-600 leading-snug">
            Nomor: {cleanNomorSurat}
          </p>
        </div>

        {/* Kalimat Pembuka Formal */}
        <p className="mb-1 text-[13px] print:text-[11pt] leading-[1.5] print:leading-[1.5]">
          Yang bertanda tangan di bawah ini:
        </p>

        {/* Tabel Identitas Orang Tua / Wali */}
        <table className="w-full text-xs print:text-[10.5pt] ml-4 sm:ml-6 mb-2 leading-[1.5]">
          <tbody>
            <tr>
              <td className="w-40 sm:w-48 py-0.5 font-medium">Nama Lengkap</td>
              <td className="w-3">:</td>
              <td className="font-bold py-0.5">{consent.namaOrtu}</td>
            </tr>
            <tr>
              <td className="py-0.5 font-medium">Pekerjaan</td>
              <td>:</td>
              <td className="py-0.5">{consent.pekerjaanOrtu || '-'}</td>
            </tr>
            <tr>
              <td className="py-0.5 font-medium">No. Telepon / WhatsApp</td>
              <td>:</td>
              <td className="py-0.5">{consent.noHpOrtu}</td>
            </tr>
            <tr>
              <td className="py-0.5 font-medium align-top">Alamat Domisili</td>
              <td className="align-top">:</td>
              <td className="py-0.5 align-top">{consent.alamatOrtu || '-'}</td>
            </tr>
          </tbody>
        </table>

        {/* Kalimat Perantara Identitas Siswa */}
        <p className="mb-1 text-[13px] print:text-[11pt] leading-[1.5] print:leading-[1.5]">
          selaku orang tua / wali murid dari:
        </p>

        {/* Tabel Identitas Siswa */}
        <table className="w-full text-xs print:text-[10.5pt] ml-4 sm:ml-6 mb-2.5 leading-[1.5]">
          <tbody>
            <tr>
              <td className="w-40 sm:w-48 py-0.5 font-medium">Nama Peserta Didik</td>
              <td className="w-3">:</td>
              <td className="font-bold py-0.5 uppercase">{namaSiswa}</td>
            </tr>
            <tr>
              <td className="py-0.5 font-medium">NIS / NISN</td>
              <td>:</td>
              <td className="py-0.5">
                {nisSiswa} / {nisnSiswa}
              </td>
            </tr>
            <tr>
              <td className="py-0.5 font-medium">Kelas / Tingkat</td>
              <td>:</td>
              <td className="font-semibold py-0.5">{kelasSiswa}</td>
            </tr>
          </tbody>
        </table>

        {/* Klausul Pernyataan Sikap Formal */}
        <div className="my-2 space-y-2 leading-[1.5] print:leading-[1.5]">
          <p className="text-[13px] print:text-[11pt] text-justify indent-8 leading-[1.5] print:leading-[1.5]">
            Dengan ini menyatakan secara sadar, tanpa paksaan dari pihak manapun, bahwa saya:
          </p>

          <div className="pl-6 sm:pl-8 space-y-1">
            <p className="font-bold text-xs print:text-[10.5pt] text-gray-950 tracking-wide uppercase leading-snug">
              {consent.statusPersetujuan === 'SETUJU'
                ? '✓ MENYETUJUI & MENDUKUNG'
                : '✕ TIDAK MENYETUJUI'}
            </p>
            <p className="text-[13px] print:text-[11pt] leading-[1.5] print:leading-[1.5]">
              Kebijakan Pelaksanaan Program Pembelajaran 5 (Lima) Hari Sekolah pada{' '}
              <strong>{sekolah?.nama || 'SMPN 1 UJUNGJAYA'}</strong>.
            </p>
          </div>

          {consent.statusPersetujuan === 'SETUJU' ? (
            <div className="space-y-1.5 pt-1">
              <p className="font-bold text-xs print:text-[10.5pt] leading-snug">
                Ketentuan Komitmen dan Tanggung Jawab Orang Tua/Wali:
              </p>
              <ol className="list-decimal pl-8 sm:pl-10 space-y-1 text-xs print:text-[10pt] text-justify leading-[1.5] print:leading-[1.5]">
                {(config?.komitmenPoin && config.komitmenPoin.length > 0
                  ? config.komitmenPoin
                  : [
                      'Mendukung dan mematuhi tata tertib serta jadwal KBM dari hari Senin sampai dengan Jumat.',
                      'Aktif menjalin komunikasi dengan pihak sekolah dan menghadiri pertemuan orang tua yang diselenggarakan sekolah.',
                      'Memastikan kedisiplinan kehadiran anak dan menyelesaikan kewajiban administrasi sekolah tepat waktu.',
                      'Melakukan pengawasan dan penguatan karakter anak dalam lingkungan keluarga pada hari Sabtu dan Minggu.',
                    ]
                ).map((poin: string, idx: number) => (
                  <li key={idx} className="leading-[1.5]">{poin}</li>
                ))}
              </ol>
            </div>
          ) : (
            <div className="space-y-1 pt-1">
              <p className="font-bold text-xs print:text-[10.5pt] text-red-950 leading-snug">Catatan / Alasan Keberatan:</p>
              <p className="pl-6 sm:pl-8 text-xs print:text-[10.5pt] italic text-justify leading-[1.5]">
                &ldquo;{consent.alasanPenolakan || 'Tidak menyetujui penerapan sistem 5 hari sekolah.'}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Kalimat Penutup Formal */}
        <p className="text-justify indent-8 my-2.5 text-[13px] print:text-[11pt] leading-[1.5] print:leading-[1.5]">
          Demikian surat pernyataan ini saya buat dengan sebenar-benarnya dalam keadaan sadar untuk
          dapat dipergunakan sebagaimana mestinya.
        </p>

        {/* Blok Tanda Tangan Orang Tua / Wali */}
        <div className="flex justify-end mt-4 print:mt-3 text-xs print:text-[10.5pt]">
          <div className="text-center w-64 space-y-0.5 leading-snug">
            <p>
              Ujungjaya, {tanggalTtd}
            </p>
            <p className="font-semibold text-gray-950">Yang membuat pernyataan,</p>
            <div className="h-14 flex items-center justify-center my-0.5">
              {consent.ttdDigital ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={consent.ttdDigital}
                  alt="Tanda Tangan Digital Orang Tua"
                  className="max-h-13 max-w-[140px] object-contain"
                />
              ) : (
                <div className="h-13" />
              )}
            </div>
            <p className="font-bold underline text-gray-950">{consent.namaOrtu}</p>
            <p className="text-gray-700 text-[11px] print:text-[10pt]">
              Orang Tua / Wali
            </p>
          </div>
        </div>

        {/* Footer Lembar Pernyataan */}
        <div className="mt-4 pt-1.5 border-t border-gray-200 text-[9px] print:text-[8.5pt] text-gray-400 flex items-center justify-between">
          <p>Dokumen Digital Sah • Portal Persetujuan PAWARTA {sekolah?.nama || 'SMPN 1 UJUNGJAYA'}</p>
          <p>Halaman 1 dari 1</p>
        </div>
      </div>
    </div>
  );
}
