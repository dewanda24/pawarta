'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PhoneCall, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { getSiswaList } from '@/features/master-data/actions/siswa';
import { createSuratPanggilanOrtu } from '@/features/student-letter/actions';

interface SiswaItem {
  id: string;
  nama: string;
  nisn: string;
  kelas?: { kodeKelas?: string };
  namaOrtu?: string | null;
}

export default function PanggilanOrtuPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [siswaOptions, setSiswaOptions] = useState<SiswaItem[]>([]);

  const [siswaId, setSiswaId] = useState('');
  const [waktuMenghadap, setWaktuMenghadap] = useState('');
  const [menghadapKepada, setMenghadapKepada] = useState(
    'Guru Bimbingan Konseling (BK) / Wali Kelas',
  );
  const [ruangan, setRuangan] = useState('Ruang Bimbingan Konseling (BK)');
  const [keperluan, setKeperluan] = useState('');
  const [catatanKhusus, setCatatanKhusus] = useState('');

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
    if (!siswaId || !waktuMenghadap || !keperluan) {
      toast.error('Mohon lengkapi siswa, waktu menghadap, dan perihal pemanggilan');
      return;
    }

    setLoading(true);
    try {
      const res = await createSuratPanggilanOrtu({
        siswaId,
        waktuMenghadap,
        menghadapKepada,
        ruangan,
        keperluan,
        catatanKhusus: catatanKhusus || undefined,
      });

      if (res.success && res.data) {
        toast.success('Surat Panggilan Orang Tua berhasil diterbitkan!');
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
          <div className="flex items-center gap-2 text-amber-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <PhoneCall className="w-4 h-4" />
            <span>Persuratan BK & Kesiswaan</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Buat Surat Panggilan Orang Tua / Wali Murid
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Surat resmi pemanggilan wali murid ke sekolah untuk koordinasi perkembangan/pembinaan
            siswa.
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
              className="w-full h-10 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={siswaId}
              onChange={(e) => setSiswaId(e.target.value)}
              required
              disabled={fetching}
            >
              <option value="">-- Cari & Pilih Siswa Yang Bersangkutan --</option>
              {siswaOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama} ({s.kelas?.kodeKelas || 'Tanpa Kelas'}) - Wali: {s.namaOrtu || '-'}
                </option>
              ))}
            </select>
          </div>

          {selectedSiswa && (
            <div className="p-4 bg-amber-50/60 rounded-lg border border-amber-200 space-y-1 text-xs text-amber-950">
              <p>
                <span className="font-semibold text-amber-900">Nama Siswa:</span>{' '}
                {selectedSiswa.nama}
              </p>
              <p>
                <span className="font-semibold text-amber-900">Kelas:</span>{' '}
                {selectedSiswa.kelas?.kodeKelas || '-'}
              </p>
              <p>
                <span className="font-semibold text-amber-900">Ditujukan Kepada:</span> Orang Tua /
                Wali dari {selectedSiswa.nama} ({selectedSiswa.namaOrtu || 'Bapak/Ibu Wali Murid'})
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs font-medium">Hari, Tanggal & Waktu Menghadap *</Label>
              <Input
                placeholder="Contoh: Senin, 18 Agustus 2026 pukul 09:00 WIB"
                value={waktuMenghadap}
                onChange={(e) => setWaktuMenghadap(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Menghadap Kepada</Label>
              <Input
                placeholder="Guru BK / Wali Kelas"
                value={menghadapKepada}
                onChange={(e) => setMenghadapKepada(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Ruangan / Tempat Menghadap</Label>
              <Input
                placeholder="Ruang BK / Ruang Kepala Sekolah"
                value={ruangan}
                onChange={(e) => setRuangan(e.target.value)}
                required
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs font-medium">Perihal / Alasan Pemanggilan *</Label>
              <Textarea
                placeholder="Contoh: Konsultasi perkembangan belajar dan kehadiran siswa di sekolah"
                rows={2}
                value={keperluan}
                onChange={(e) => setKeperluan(e.target.value)}
                required
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs font-medium">Catatan Khusus (Opsional)</Label>
              <Input
                placeholder="Contoh: Mengingat pentingnya hal ini, dimohon kehadiran tepat waktu."
                value={catatanKhusus}
                onChange={(e) => setCatatanKhusus(e.target.value)}
              />
            </div>
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
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <PhoneCall className="w-4 h-4" />
            )}
            Terbitkan Surat Panggilan
          </Button>
        </div>
      </form>
    </div>
  );
}
