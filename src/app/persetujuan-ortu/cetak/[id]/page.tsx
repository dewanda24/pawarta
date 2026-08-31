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
      {/* HALAMAN 1: SURAT PEMBERITAHUAN DARI KEPALA SEKOLAH                        */}
      {/* ========================================================================= */}
      <div className="print-page bg-white p-6 sm:p-10 md:p-12 rounded-2xl border border-gray-200 shadow-sm print:border-none print:shadow-none print:p-0 text-gray-950 font-serif text-[13px] print:text-[11pt] leading-normal print:leading-[1.35]">
        {/* Kop Surat Resmi SMPN 1 UJUNGJAYA */}
        <LetterheadView header={kopSurat} fallbackSekolah={sekolah} />

        {/* Header Naskah Dinas */}
        <div className="mt-3 mb-2 text-xs print:text-[10.5pt] font-sans space-y-1.5">
          <div className="flex flex-row justify-between items-start">
            <table className="text-xs print:text-[10.5pt]">
              <tbody>
                <tr>
                  <td className="w-20 font-semibold py-0.2">Nomor</td>
                  <td className="w-3">:</td>
                  <td className="font-mono font-bold py-0.2">{cleanNomorSurat}</td>
                </tr>
                <tr>
                  <td className="font-semibold py-0.2">Sifat</td>
                  <td>:</td>
                  <td className="py-0.2">{config?.sifatSurat || 'Penting'}</td>
                </tr>
                <tr>
                  <td className="font-semibold py-0.2">Lampiran</td>
                  <td>:</td>
                  <td className="py-0.2">{config?.lampiranSurat || '1 Lembar (Lembar Persetujuan)'}</td>
                </tr>
                <tr>
                  <td className="font-semibold py-0.2 align-top">Perihal</td>
                  <td className="align-top">:</td>
                  <td className="font-bold py-0.2 text-gray-950">
                    {config?.perihalSurat || 'Pemberitahuan & Persetujuan Pembelajaran 5 (Lima) Hari'}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="text-right font-sans text-xs print:text-[10.5pt] shrink-0">
              <p>
                {config?.tempatSurat || sekolah?.kabupaten || 'Sumedang'}, {tanggalSuratDisplay}
              </p>
            </div>
          </div>

          <div className="pt-1">
            <p className="font-semibold">Kepada Yth.,</p>
            <p className="font-bold">{config?.penerimaSurat || 'Bapak/Ibu Orang Tua / Wali Murid'}</p>
            <p className="italic text-gray-700">di Tempat</p>
          </div>
        </div>

        {/* Isi Surat Pemberitahuan Sekolah */}
        <div className="space-y-2 text-justify text-[13px] print:text-[11pt] leading-normal print:leading-[1.35]">
          <p>Dengan hormat,</p>
          <p className="indent-8">
            {config?.teksPembuka ||
              `Sehubungan dengan upaya peningkatan mutu pendidikan, penguatan karakter peserta didik, serta regulasi pemerintah terkait efisiensi hari belajar efektif, dengan ini kami beritahukan bahwa ${sekolah?.nama || 'SMPN 1 UJUNGJAYA'} akan menerapkan sistem Pembelajaran 5 (Lima) Hari Sekolah.`}
          </p>

          <div className="pl-6 sm:pl-8 my-1 font-sans">
            <p className="font-semibold text-xs print:text-[10.5pt] mb-1">
              Adapun ketentuan pelaksanaan sistem tersebut:
            </p>
            <table className="w-full text-xs print:text-[10.5pt]">
              <tbody>
                <tr>
                  <td className="w-32 py-0.2 font-medium">• Mulai Berlaku</td>
                  <td className="w-3">:</td>
                  <td className="font-semibold py-0.2">
                    {config?.ketentuan?.mulaiBerlaku || 'Tahun Pelajaran 2026/2027'}
                  </td>
                </tr>
                <tr>
                  <td className="py-0.2 font-medium">• Hari Belajar</td>
                  <td>:</td>
                  <td className="font-semibold py-0.2">
                    {config?.ketentuan?.hariBelajar || 'Senin s.d. Jumat'}
                  </td>
                </tr>
                <tr>
                  <td className="py-0.2 font-medium">• Jam Belajar</td>
                  <td>:</td>
                  <td className="font-semibold py-0.2">
                    {config?.ketentuan?.jamBelajar ||
                      '07.00 s.d. 15.00 WIB (disesuaikan dengan alokasi kurikulum dan jadwal KBM)'}
                  </td>
                </tr>
                <tr>
                  <td className="py-0.2 font-medium">• Hari Libur</td>
                  <td>:</td>
                  <td className="font-semibold py-0.2">
                    {config?.ketentuan?.hariLibur || 'Sabtu dan Minggu'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="indent-8">
            {config?.paragrafTujuan ||
              'Penerapan sistem ini bertujuan agar peserta didik memiliki waktu lebih leluasa di akhir pekan untuk penguatan pendidikan karakter bersama keluarga secara mandiri dan terarah.'}
          </p>

          <p className="indent-8">
            Demi kelancaran program ini, kami memohon kesediaan Bapak/Ibu untuk mengisi dan menandatangani lembar
            persetujuan yang terlampir pada halaman kedua surat ini.
          </p>

          <p className="indent-8">
            {config?.teksPenutup ||
              'Demikian pemberitahuan ini disampaikan. Atas kerja sama Bapak/Ibu, kami ucapkan terima kasih.'}
          </p>
        </div>

        {/* Pengesahan Kepala Sekolah / Penandatangan */}
        <div className="flex justify-end mt-4 print:mt-3 font-sans text-xs print:text-[10.5pt]">
          <div className="text-center w-64 space-y-0.5">
            <p>Hormat kami,</p>
            <p className="font-bold">{jabatanPenandatangan}</p>
            <div className="h-14 flex items-center justify-center my-1">
              {tampilkanQr ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={`/api/v1/verifikasi/qr/${consent.id}`}
                  alt="QR Code Verifikasi Dokumen Digital PAWARTA"
                  className="w-13 h-13 object-contain border border-gray-200 p-0.5 rounded shadow-xs"
                />
              ) : (
                <div className="h-13" />
              )}
            </div>
            <p className="font-bold underline text-gray-950">
              {namaPenandatangan}
            </p>
            <p className="text-gray-700 font-mono text-[10px] print:text-[9.5pt]">
              {nipPenandatangan ? `NIP. ${nipPenandatangan}` : '-'}
            </p>
          </div>
        </div>

        {/* Footer Halaman 1 */}
        <div className="mt-4 pt-1.5 border-t border-gray-200 text-[9px] print:text-[8.5pt] text-gray-400 font-sans flex items-center justify-between">
          <p>PAWARTA — Tata Naskah Dinas Digital</p>
          <p>Halaman 1 dari 2</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* HALAMAN 2: LEMBAR PERSETUJUAN / PERNYATAAN RESMI ORANG TUA / WALI         */}
      {/* ========================================================================= */}
      <div className="print-page bg-white p-6 sm:p-10 md:p-12 rounded-2xl border border-gray-200 shadow-sm print:border-none print:shadow-none print:p-0 text-gray-950 font-serif text-[13px] print:text-[11pt] leading-normal print:leading-[1.35]">
        {/* Kop Surat Resmi di Halaman 2 */}
        <LetterheadView header={kopSurat} fallbackSekolah={sekolah} />

        {/* Judul Lembar Persetujuan Formal */}
        <div className="text-center space-y-0.5 my-3">
          <h2 className="font-bold text-sm sm:text-base print:text-[12pt] uppercase tracking-wider underline">
            {config?.judulHalaman2 || 'SURAT PERNYATAAN / PERSETUJUAN ORANG TUA / WALI MURID'}
          </h2>
          <p className="font-bold text-xs print:text-[10pt] uppercase tracking-wide text-gray-800">
            {config?.subjudulHalaman2 || 'PENERAPAN SISTEM PEMBELAJARAN 5 (LIMA) HARI SEKOLAH'}
          </p>
          <p className="text-[11px] print:text-[9.5pt] font-mono text-gray-600">
            Lampiran Surat Nomor: {cleanNomorSurat}
          </p>
        </div>

        {/* Kalimat Pembuka Formal */}
        <p className="text-justify indent-8 mb-1.5 text-[13px] print:text-[11pt]">
          Yang bertanda tangan di bawah ini, saya selaku orang tua / wali murid dari peserta didik{' '}
          <strong>{sekolah?.nama || 'SMPN 1 UJUNGJAYA'}</strong>:
        </p>

        {/* Tabel Identitas Orang Tua / Wali */}
        <table className="w-full text-xs print:text-[10.5pt] ml-4 sm:ml-6 font-sans mb-2">
          <tbody>
            <tr>
              <td className="w-40 sm:w-48 py-0.2 font-medium">Nama Lengkap</td>
              <td className="w-3">:</td>
              <td className="font-bold py-0.2">{consent.namaOrtu}</td>
            </tr>
            <tr>
              <td className="py-0.2 font-medium">Hubungan Keluarga</td>
              <td>:</td>
              <td className="py-0.2">{consent.hubungan || 'Orang Tua Kandung'}</td>
            </tr>
            <tr>
              <td className="py-0.2 font-medium">Pekerjaan</td>
              <td>:</td>
              <td className="py-0.2">{consent.pekerjaanOrtu || '-'}</td>
            </tr>
            <tr>
              <td className="py-0.2 font-medium">No. Telepon / WhatsApp</td>
              <td>:</td>
              <td className="font-mono py-0.2">{consent.noHpOrtu}</td>
            </tr>
            <tr>
              <td className="py-0.2 font-medium align-top">Alamat Domisili</td>
              <td className="align-top">:</td>
              <td className="py-0.2 align-top">{consent.alamatOrtu || '-'}</td>
            </tr>
          </tbody>
        </table>

        <p className="text-justify indent-8 mb-1 text-[13px] print:text-[11pt]">
          Menyatakan keterangan mengenai putra / putri kami sebagai peserta didik:
        </p>

        {/* Tabel Identitas Siswa */}
        <table className="w-full text-xs print:text-[10.5pt] ml-4 sm:ml-6 font-sans mb-2">
          <tbody>
            <tr>
              <td className="w-40 sm:w-48 py-0.2 font-medium">Nama Peserta Didik</td>
              <td className="w-3">:</td>
              <td className="font-bold py-0.2 uppercase">{namaSiswa}</td>
            </tr>
            <tr>
              <td className="py-0.2 font-medium">NIS / NISN</td>
              <td>:</td>
              <td className="font-mono py-0.2">
                {nisSiswa} / {nisnSiswa}
              </td>
            </tr>
            <tr>
              <td className="py-0.2 font-medium">Kelas / Tingkat</td>
              <td>:</td>
              <td className="font-semibold py-0.2">{kelasSiswa}</td>
            </tr>
          </tbody>
        </table>

        {/* Klausul Pernyataan Sikap Formal */}
        <div className="my-2 space-y-1.5 font-serif">
          <p className="text-[13px] print:text-[11pt] text-justify indent-8 leading-normal">
            Dengan ini menyatakan secara sadar, tanpa paksaan dari pihak manapun, bahwa saya:
          </p>

          <div className="pl-6 sm:pl-8 space-y-0.5">
            <p className="font-bold text-xs print:text-[10.5pt] text-gray-950 font-sans tracking-wide uppercase">
              {consent.statusPersetujuan === 'SETUJU'
                ? '✓ MENYETUJUI & MENDUKUNG'
                : '✕ TIDAK MENYETUJUI'}
            </p>
            <p className="text-[13px] print:text-[11pt] leading-normal">
              Kebijakan Pelaksanaan Program Pembelajaran 5 (Lima) Hari Sekolah pada{' '}
              <strong>{sekolah?.nama || 'SMPN 1 UJUNGJAYA'}</strong>.
            </p>
          </div>

          {consent.statusPersetujuan === 'SETUJU' ? (
            <div className="space-y-1 pt-0.5">
              <p className="font-bold text-xs print:text-[10.5pt]">
                Ketentuan Komitmen dan Tanggung Jawab Orang Tua/Wali:
              </p>
              <ol className="list-decimal pl-8 sm:pl-10 space-y-0.5 text-xs print:text-[10pt] text-justify leading-normal">
                {(config?.komitmenPoin && config.komitmenPoin.length > 0
                  ? config.komitmenPoin
                  : [
                      'Mendukung dan mematuhi tata tertib serta jadwal KBM dari hari Senin sampai dengan Jumat.',
                      'Aktif menjalin komunikasi dengan pihak sekolah dan menghadiri pertemuan orang tua yang diselenggarakan sekolah.',
                      'Memastikan kedisiplinan kehadiran anak dan menyelesaikan kewajiban administrasi sekolah tepat waktu.',
                      'Melakukan pengawasan dan penguatan karakter anak dalam lingkungan keluarga pada hari Sabtu dan Minggu.',
                    ]
                ).map((poin: string, idx: number) => (
                  <li key={idx}>{poin}</li>
                ))}
              </ol>
            </div>
          ) : (
            <div className="space-y-0.5 pt-0.5">
              <p className="font-bold text-xs print:text-[10.5pt] text-red-950">Catatan / Alasan Keberatan:</p>
              <p className="pl-6 sm:pl-8 text-xs print:text-[10.5pt] italic text-justify">
                &ldquo;{consent.alasanPenolakan || 'Tidak menyetujui penerapan sistem 5 hari sekolah.'}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Kalimat Penutup Formal */}
        <p className="text-justify indent-8 my-2 text-[13px] print:text-[11pt]">
          Demikian surat pernyataan dan persetujuan ini saya buat dengan sebenar-benarnya dalam keadaan sadar untuk
          dapat dipergunakan sebagaimana mestinya.
        </p>

        {/* Blok Tanda Tangan Orang Tua / Wali */}
        <div className="flex justify-end mt-3 print:mt-2 font-sans text-xs print:text-[10.5pt]">
          <div className="text-center w-64 space-y-0.5">
            <p>
              {config?.tempatSurat || sekolah?.kabupaten || 'Sumedang'}, {tanggalTtd}
            </p>
            <p className="font-semibold text-gray-950">Yang Membuat Pernyataan,</p>
            <p className="text-[10px] print:text-[9.5pt] text-gray-500">Orang Tua / Wali Murid</p>
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
            <p className="font-bold underline text-gray-950">({consent.namaOrtu})</p>
            <p className="text-gray-600 text-[10px] print:text-[9.5pt]">
              Penanggung Jawab Peserta Didik
            </p>
          </div>
        </div>

        {/* Footer Halaman 2 */}
        <div className="mt-4 pt-1.5 border-t border-gray-200 text-[9px] print:text-[8.5pt] text-gray-400 font-sans flex items-center justify-between">
          <p>Dokumen Digital Sah • Portal Persetujuan PAWARTA {sekolah?.nama || 'SMPN 1 UJUNGJAYA'}</p>
          <p>Halaman 2 dari 2</p>
        </div>
      </div>
    </div>
  );
}
