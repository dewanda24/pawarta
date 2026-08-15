'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { getSiswaList } from '@/features/master-data/actions/siswa';
import { createSuratKeteranganAktif } from '@/features/student-letter/actions';

interface SiswaItem {
  id: string;
  nama: string;
  nisn: string;
  kelas?: { kodeKelas?: string };
  namaOrtu?: string | null;
  pekerjaanOrtu?: string | null;
}

export default function KeteranganAktifPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [siswaOptions, setSiswaOptions] = useState<SiswaItem[]>([]);

  const [siswaId, setSiswaId] = useState('');
  const [keperluan, setKeperluan] = useState('');

  useEffect(() => {
    async function loadSiswa() {
      setFetching(true);
      try {
        const res = await getSiswaList({ limit: 200 });
        if (res.success && res.data) {
          setSiswaOptions(res.data as unknown as SiswaItem[]);
        }
      } catch {
        toast.error('Gagal memuat master data siswa');
      } finally {
        setFetching(false);
      }
    }
    loadSiswa();
  }, []);

  const selectedSiswa = siswaOptions.find((s) => s.id === siswaId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siswaId) {
      toast.error('Silakan pilih siswa');
      return;
    }
    if (!keperluan) {
      toast.error('Silakan isi keperluan pembuatan surat');
      return;
    }

    setLoading(true);
    try {
      const res = await createSuratKeteranganAktif({
        siswaId,
        keperluan,
      });

      if (res.success && res.data) {
        toast.success('Surat Keterangan Siswa Aktif berhasil diterbitkan!');
        router.push(`/surat-siswa/${res.data.id}`);
      } else {
        toast.error(res.error || 'Gagal menerbitkan surat');
      }
    } catch {
      toast.error('Terjadi kesalahan saat menerbitkan surat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>Persuratan Siswa</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Buat Surat Keterangan Siswa Aktif
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Menerbitkan surat keterangan resmi bahwa siswa terdaftar aktif belajar di sekolah.
          </p>
        </div>

        <Link href="/surat-siswa">
          <Button variant="outline" className="flex items-center gap-1 text-xs">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Button>
        </Link>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-xs space-y-6"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Pilih Siswa *</Label>
            <select
              className="w-full h-10 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={siswaId}
              onChange={(e) => setSiswaId(e.target.value)}
              required
              disabled={fetching}
            >
              <option value="">-- Cari & Pilih Nama Siswa --</option>
              {siswaOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama} ({s.kelas?.kodeKelas || 'Tanpa Kelas'}) - NISN: {s.nisn}
                </option>
              ))}
            </select>
          </div>

          {selectedSiswa && (
            <div className="p-4 bg-emerald-50/60 rounded-lg border border-emerald-200 space-y-1 text-xs text-emerald-900">
              <p>
                <span className="font-semibold text-emerald-800">Nama Siswa:</span>{' '}
                {selectedSiswa.nama}
              </p>
              <p>
                <span className="font-semibold text-emerald-800">NISN:</span> {selectedSiswa.nisn}
              </p>
              <p>
                <span className="font-semibold text-emerald-800">Kelas:</span>{' '}
                {selectedSiswa.kelas?.kodeKelas || '-'}
              </p>
              <p>
                <span className="font-semibold text-emerald-800">Orang Tua / Wali:</span>{' '}
                {selectedSiswa.namaOrtu || '-'} ({selectedSiswa.pekerjaanOrtu || '-'})
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Keperluan Pembuatan Surat *</Label>
            <Textarea
              placeholder="Contoh: Persyaratan pengajuan Beasiswa PIP / Pengurusan Tunjangan Gaji PNS Orang Tua / Pembuatan Paspor"
              rows={3}
              value={keperluan}
              onChange={(e) => setKeperluan(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="pt-4 border-t flex justify-end gap-3">
          <Link href="/surat-siswa">
            <Button type="button" variant="outline">
              Batal
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            Terbitkan Surat Keterangan
          </Button>
        </div>
      </form>
    </div>
  );
}
