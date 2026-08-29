import { getConsentDetailById } from '@/features/student-letter/consent-actions';
import { notFound } from 'next/navigation';
import { PrintButton } from '@/components/shared/PrintButton';
import { LetterheadView } from '@/components/shared/LetterheadView';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Printer, FileText } from 'lucide-react';
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

  const cleanNomorSurat =
    stripNomorPrefix(consent.nomorSurat) || '421.3/001/SMPN-1-UJJ/2026';

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

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Bar Navigation & Action (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase">
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
              Dokumen Resmi SMPN 1 UJUNGJAYA
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
      <div className="bg-white p-6 sm:p-12 md:p-14 rounded-2xl border border-gray-200 shadow-sm print:border-none print:shadow-none print:p-0 text-gray-950 font-serif leading-relaxed text-sm">
        {/* Kop Surat Resmi SMPN 1 UJUNGJAYA */}
        <LetterheadView header={kopSurat} fallbackSekolah={sekolah} />

        {/* Header Naskah Dinas: Nomor, Sifat, Lampiran, Hal, Tanggal */}
        <div className="mt-5 mb-4 text-xs sm:text-sm font-sans space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
            <table className="text-xs sm:text-sm">
              <tbody>
                <tr>
                  <td className="w-20 font-semibold py-0.5">Nomor</td>
                  <td className="w-3">:</td>
                  <td className="font-mono font-bold py-0.5">
                    {cleanNomorSurat}
                  </td>
                </tr>
                <tr>
                  <td className="font-semibold py-0.5">Sifat</td>
                  <td>:</td>
                  <td className="py-0.5">Penting</td>
                </tr>
                <tr>
                  <td className="font-semibold py-0.5">Lampiran</td>
                  <td>:</td>
                  <td className="py-0.5">1 Lembar (Lembar Persetujuan)</td>
                </tr>
                <tr>
                  <td className="font-semibold py-0.5 align-top">Perihal</td>
                  <td className="align-top">:</td>
                  <td className="font-bold py-0.5 text-gray-950">
                    Pemberitahuan dan Persetujuan Pelaksanaan Pembelajaran 5 (Lima) Hari
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="text-right sm:text-right font-sans text-xs sm:text-sm shrink-0">
              <p>
                {sekolah?.kabupaten || 'Sumedang'}, {tanggalTtd}
              </p>
            </div>
          </div>

          <div className="pt-2">
            <p className="font-semibold">Kepada Yth.,</p>
            <p className="font-bold">Bapak/Ibu Orang Tua / Wali Murid</p>
            <p className="italic text-gray-700">di Tempat</p>
          </div>
        </div>

        {/* Isi Surat Pemberitahuan Sekolah */}
        <div className="space-y-3.5 text-xs sm:text-sm text-justify leading-relaxed">
          <p>Dengan hormat,</p>
          <p className="indent-8">
            Sehubungan dengan upaya peningkatan mutu pendidikan, penguatan pendidikan karakter peserta didik, serta
            merujuk pada regulasi pemerintah terkait efisiensi hari belajar efektif pada satuan pendidikan, dengan ini
            kami beritahukan bahwa <strong>{sekolah?.nama || 'SMPN 1 UJUNGJAYA'}</strong> akan mulai menerapkan
            sistem <strong>Pembelajaran 5 (Lima) Hari Sekolah</strong>.
          </p>

          <div className="pl-6 sm:pl-8 space-y-1.5 my-2 font-sans">
            <p className="font-semibold text-xs sm:text-sm">
              Adapun rincian pelaksanaan sistem tersebut adalah sebagai berikut:
            </p>
            <table className="w-full text-xs sm:text-sm ml-2">
              <tbody>
                <tr>
                  <td className="w-36 py-0.5 font-medium">• Mulai Berlaku</td>
                  <td className="w-3">:</td>
                  <td className="font-semibold py-0.5">Tahun Pelajaran 2026/2027</td>
                </tr>
                <tr>
                  <td className="py-0.5 font-medium">• Hari Belajar</td>
                  <td>:</td>
                  <td className="font-semibold py-0.5">Senin sampai dengan Jumat</td>
                </tr>
                <tr>
                  <td className="py-0.5 font-medium">• Jam Belajar</td>
                  <td>:</td>
                  <td className="font-semibold py-0.5">
                    07.00 s.d. 15.00 WIB (disesuaikan dengan alokasi kurikulum dan jadwal KBM)
                  </td>
                </tr>
                <tr>
                  <td className="py-0.5 font-medium">• Hari Libur</td>
                  <td>:</td>
                  <td className="font-semibold py-0.5">Sabtu dan Minggu</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="indent-8">
            Penerapan sistem 5 hari sekolah ini bertujuan agar peserta didik memiliki waktu yang lebih leluasa di akhir
            pekan untuk beristirahat, bersosialisasi, dan memperkuat pendidikan karakter di lingkungan keluarga secara
            mandiri dan terarah.
          </p>

          <p className="indent-8">
            Demi kelancaran dan keberhasilan pelaksanaan program ini, kami sangat mengharapkan dukungan penuh dan kerja
            sama dari Bapak/Ibu sekalian. Kami mohon kesediaan Bapak/Ibu untuk mengisi dan menandatangani lembar
            persetujuan yang terlampir pada halaman berikutnya dari surat ini.
          </p>

          <p className="indent-8">
            Demikian surat pemberitahuan ini kami sampaikan. Atas perhatian, pengertian, dan kerja sama yang baik dari
            Bapak/Ibu, kami ucapkan terima kasih.
          </p>
        </div>

        {/* Pengesahan Kepala Sekolah */}
        <div className="flex justify-end mt-6 font-sans text-xs sm:text-sm">
          <div className="text-center w-72 space-y-1">
            <p>Hormat kami,</p>
            <p className="font-bold">Kepala {sekolah?.nama || 'SMPN 1 UJUNGJAYA'}</p>
            <div className="h-20 flex items-center justify-center my-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/v1/verifikasi/qr/${consent.id}`}
                alt="QR Code Verifikasi Dokumen Digital PAWARTA"
                className="w-16 h-16 object-contain border border-gray-200 p-0.5 rounded shadow-xs"
              />
            </div>
            <p className="font-bold underline text-gray-950">
              {kepsek?.nama || 'Drs. H. Dedi Kusnadi, M.Pd.'}
            </p>
            <p className="text-gray-700 font-mono text-[11px]">
              NIP. {kepsek?.nip || '19680512 199403 1 005'}
            </p>
          </div>
        </div>

        {/* Footer Halaman 1 */}
        <div className="mt-8 pt-3 border-t border-gray-200 text-[10px] text-gray-400 font-sans flex items-center justify-between">
          <p>PAWARTA — Sistem Tata Naskah Dinas Pendidikan Digital</p>
          <p>Halaman 1 dari 2</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* HALAMAN 2: LEMBAR PERSETUJUAN / PERNYATAAN RESMI ORANG TUA / WALI         */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 sm:p-12 md:p-14 rounded-2xl border border-gray-200 shadow-sm print:border-none print:shadow-none print:p-0 text-gray-950 font-serif leading-relaxed text-sm print:break-before-page break-before-page">
        {/* Kop Surat Resmi di Halaman 2 */}
        <LetterheadView header={kopSurat} fallbackSekolah={sekolah} />

        {/* Judul Lembar Persetujuan Formal */}
        <div className="text-center space-y-1 my-5">
          <h2 className="font-bold text-base sm:text-lg uppercase tracking-wider underline">
            SURAT PERNYATAAN / PERSETUJUAN ORANG TUA / WALI MURID
          </h2>
          <p className="font-bold text-xs sm:text-sm uppercase tracking-wide text-gray-800">
            PENERAPAN SISTEM PEMBELAJARAN 5 (LIMA) HARI SEKOLAH
          </p>
          <p className="text-xs font-mono text-gray-600">
            Lampiran Surat Nomor: {cleanNomorSurat}
          </p>
        </div>

        {/* Kalimat Pembuka Formal */}
        <p className="text-justify indent-8 mb-3 text-xs sm:text-sm">
          Yang bertanda tangan di bawah ini, saya selaku orang tua / wali murid dari peserta didik{' '}
          <strong>{sekolah?.nama || 'SMPN 1 UJUNGJAYA'}</strong>:
        </p>

        {/* Tabel Identitas Orang Tua / Wali */}
        <table className="w-full text-xs sm:text-sm ml-4 sm:ml-8 font-sans mb-3">
          <tbody>
            <tr>
              <td className="w-44 sm:w-52 py-0.5 font-medium">Nama Lengkap</td>
              <td className="w-3">:</td>
              <td className="font-bold py-0.5">{consent.namaOrtu}</td>
            </tr>
            <tr>
              <td className="py-0.5 font-medium">Hubungan Keluarga</td>
              <td>:</td>
              <td className="py-0.5">{consent.hubungan || 'Orang Tua Kandung'}</td>
            </tr>
            <tr>
              <td className="py-0.5 font-medium">Pekerjaan</td>
              <td>:</td>
              <td className="py-0.5">{consent.pekerjaanOrtu || '-'}</td>
            </tr>
            <tr>
              <td className="py-0.5 font-medium">No. Telepon / WhatsApp</td>
              <td>:</td>
              <td className="font-mono py-0.5">{consent.noHpOrtu}</td>
            </tr>
            <tr>
              <td className="py-0.5 font-medium align-top">Alamat Domisili</td>
              <td className="align-top">:</td>
              <td className="py-0.5 align-top">{consent.alamatOrtu || '-'}</td>
            </tr>
          </tbody>
        </table>

        <p className="text-justify indent-8 mb-2 text-xs sm:text-sm">
          Menyatakan keterangan mengenai putra / putri kami sebagai peserta didik:
        </p>

        {/* Tabel Identitas Siswa */}
        <table className="w-full text-xs sm:text-sm ml-4 sm:ml-8 font-sans mb-3">
          <tbody>
            <tr>
              <td className="w-44 sm:w-52 py-0.5 font-medium">Nama Peserta Didik</td>
              <td className="w-3">:</td>
              <td className="font-bold py-0.5 uppercase">{namaSiswa}</td>
            </tr>
            <tr>
              <td className="py-0.5 font-medium">NIS / NISN</td>
              <td>:</td>
              <td className="font-mono py-0.5">
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

        {/* Klausul Pernyataan Sikap Formal (Format Surat Biasa Tanpa Card) */}
        <div className="my-4 space-y-3 font-serif">
          <p className="text-xs sm:text-sm text-justify indent-8 leading-relaxed">
            Dengan ini menyatakan secara sadar, tanpa paksaan maupun tekanan dari pihak manapun, bahwa saya:
          </p>

          <div className="pl-6 sm:pl-8 space-y-1">
            <p className="font-bold text-xs sm:text-sm text-gray-950 font-sans tracking-wide uppercase">
              {consent.statusPersetujuan === 'SETUJU'
                ? '✓ MENYETUJUI & MENDUKUNG'
                : '✕ TIDAK MENYETUJUI'}
            </p>
            <p className="text-xs sm:text-sm leading-relaxed">
              Kebijakan Pelaksanaan Program Pembelajaran 5 (Lima) Hari Sekolah pada{' '}
              <strong>{sekolah?.nama || 'SMPN 1 UJUNGJAYA'}</strong>.
            </p>
          </div>

          {consent.statusPersetujuan === 'SETUJU' ? (
            <div className="space-y-2 pt-1">
              <p className="font-bold text-xs sm:text-sm">
                Ketentuan Komitmen dan Tanggung Jawab Orang Tua/Wali:
              </p>
              <ol className="list-decimal pl-10 sm:pl-12 space-y-1.5 text-xs sm:text-sm text-justify leading-relaxed">
                <li>
                  Mendukung dan mematuhi tata tertib serta jadwal Kegiatan Belajar Mengajar (KBM) dari hari Senin
                  sampai dengan Jumat.
                </li>
                <li>
                  Aktif menjalin komunikasi dengan pihak sekolah serta menghadiri kegiatan/pertemuan orang tua yang
                  diselenggarakan sekolah.
                </li>
                <li>
                  Memastikan kedisiplinan kehadiran anak dan menyelesaikan kewajiban administrasi sekolah tepat waktu.
                </li>
                <li>
                  Melakukan pengawasan, pendampingan belajar mandiri, dan penguatan pendidikan karakter anak dalam
                  lingkungan keluarga pada hari Sabtu dan Minggu.
                </li>
              </ol>
            </div>
          ) : (
            <div className="space-y-1 pt-1">
              <p className="font-bold text-xs sm:text-sm text-red-950">Catatan / Alasan Keberatan:</p>
              <p className="pl-6 sm:pl-8 text-xs sm:text-sm italic text-justify">
                &ldquo;{consent.alasanPenolakan || 'Tidak menyetujui penerapan sistem 5 hari sekolah.'}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Kalimat Penutup Formal */}
        <p className="text-justify indent-8 my-4 text-xs sm:text-sm">
          Demikian surat pernyataan dan persetujuan ini saya buat dengan sebenar-benarnya dalam keadaan sadar dan tanpa
          paksaan dari pihak manapun untuk dapat dipergunakan sebagaimana mestinya.
        </p>

        {/* Blok Tanda Tangan Orang Tua / Wali */}
        <div className="flex justify-end mt-6 font-sans text-xs sm:text-sm">
          <div className="text-center w-72 space-y-1">
            <p>
              {sekolah?.kabupaten || 'Sumedang'}, {tanggalTtd}
            </p>
            <p className="font-semibold text-gray-950">Yang Membuat Pernyataan,</p>
            <p className="text-[11px] text-gray-500">Orang Tua / Wali Murid</p>
            <div className="h-20 flex items-center justify-center my-1">
              {consent.ttdDigital ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={consent.ttdDigital}
                  alt="Tanda Tangan Digital Orang Tua"
                  className="max-h-16 max-w-[150px] object-contain"
                />
              ) : (
                <div className="h-16" />
              )}
            </div>
            <p className="font-bold underline text-gray-950">({consent.namaOrtu})</p>
            <p className="text-gray-600 text-[11px]">
              Penanggung Jawab Peserta Didik
            </p>
          </div>
        </div>

        {/* Footer Halaman 2 */}
        <div className="mt-8 pt-3 border-t border-gray-200 text-[10px] text-gray-400 font-sans flex items-center justify-between">
          <p>Dokumen Digital Sah • Portal Persetujuan PAWARTA {sekolah?.nama || 'SMPN 1 UJUNGJAYA'}</p>
          <p>Halaman 2 dari 2</p>
        </div>
      </div>
    </div>
  );
}
