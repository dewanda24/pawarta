'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GraduationCap, ArrowLeft, Loader2, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { getSiswaList } from '@/features/master-data/actions/siswa';
import { getPegawaiList } from '@/features/master-data/actions/pegawai';
import { createSuratDispensasi } from '@/features/student-letter/actions';

interface SiswaItem {
  id: string;
  nama: string;
  nisn: string;
  kelas?: { kodeKelas?: string };
}

interface PegawaiItem {
  id: string;
  nama: string;
  nip?: string | null;
}

export default function DispensasiPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [siswaOptions, setSiswaOptions] = useState<SiswaItem[]>([]);
  const [pegawaiOptions, setPegawaiOptions] = useState<PegawaiItem[]>([]);

  // Form states
  const [namaKegiatan, setNamaKegiatan] = useState('');
  const [lokasiKegiatan, setLokasiKegiatan] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [guruPendampingId, setGuruPendampingId] = useState('');
  const [keperluan, setKeperluan] = useState('');
  const [selectedSiswaIds, setSelectedSiswaIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadMaster() {
      setFetching(true);
      try {
        const [resSiswa, resPegawai] = await Promise.all([
          getSiswaList({ limit: 200 }),
          getPegawaiList({ limit: 100 }),
        ]);

        if (resSiswa.success && resSiswa.data) {
          setSiswaOptions(resSiswa.data as unknown as SiswaItem[]);
        }
        if (resPegawai.success && resPegawai.data) {
          setPegawaiOptions(resPegawai.data as unknown as PegawaiItem[]);
        }
      } catch {
        toast.error('Gagal memuat master data siswa & guru');
      } finally {
        setFetching(false);
      }
    }
    loadMaster();
  }, []);

  const handleAddSiswa = (siswaId: string) => {
    if (!siswaId) return;
    if (!selectedSiswaIds.includes(siswaId)) {
      setSelectedSiswaIds([...selectedSiswaIds, siswaId]);
    }
  };

  const handleRemoveSiswa = (siswaId: string) => {
    setSelectedSiswaIds(selectedSiswaIds.filter((id) => id !== siswaId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaKegiatan || !tanggalMulai || !tanggalSelesai) {
      toast.error('Mohon lengkapi nama kegiatan dan tanggal dispensasi');
      return;
    }
    if (selectedSiswaIds.length === 0) {
      toast.error('Mohon pilih minimal 1 siswa peserta dispensasi');
      return;
    }

    setLoading(true);
    try {
      const res = await createSuratDispensasi({
        namaKegiatan,
        lokasiKegiatan,
        tanggalMulai,
        tanggalSelesai,
        guruPendampingId: guruPendampingId || undefined,
        keperluan: keperluan || `Mengikuti kegiatan ${namaKegiatan}`,
        siswaIds: selectedSiswaIds,
      });

      if (res.success && res.data) {
        toast.success('Surat dispensasi berhasil diterbitkan!');
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>Persuratan Siswa</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Buat Surat Dispensasi Siswa
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Terbitkan surat izin resmi bagi siswa yang mengikuti perlombaan atau dinas luar sekolah.
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
          <h2 className="text-base font-bold text-gray-900 border-b pb-2">
            1. Informasi Kegiatan & Waktu
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs font-medium">Nama Lomba / Kegiatan *</Label>
              <Input
                placeholder="Contoh: Olimpiade Sains Nasional (OSN) Tingkat Provinsi"
                value={namaKegiatan}
                onChange={(e) => setNamaKegiatan(e.target.value)}
                required
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs font-medium">Lokasi / Tempat Pelaksanaan</Label>
              <Input
                placeholder="Contoh: Gedung Balai Diklat Provinsi Jawa Timur"
                value={lokasiKegiatan}
                onChange={(e) => setLokasiKegiatan(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Tanggal Mulai Dispensasi *</Label>
              <Input
                type="date"
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Tanggal Selesai Dispensasi *</Label>
              <Input
                type="date"
                value={tanggalSelesai}
                onChange={(e) => setTanggalSelesai(e.target.value)}
                required
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs font-medium">Guru Pembina / Pendamping (Opsional)</Label>
              <select
                className="w-full h-10 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={guruPendampingId}
                onChange={(e) => setGuruPendampingId(e.target.value)}
              >
                <option value="">-- Pilih Guru Pembina Pendamping --</option>
                {pegawaiOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama} {p.nip ? `(NIP: ${p.nip})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs font-medium">Keterangan / Keperluan Tambahan</Label>
              <Textarea
                placeholder="Penjelasan singkat mengenai keikutsertaan siswa dalam kegiatan tersebut..."
                rows={2}
                value={keperluan}
                onChange={(e) => setKeperluan(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Selected Students */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h2 className="text-base font-bold text-gray-900 border-b pb-2">
            2. Daftar Siswa Peserta Dispensasi ({selectedSiswaIds.length} Siswa Dipilih)
          </h2>

          <div className="space-y-3">
            <div className="flex gap-2">
              <select
                id="select-siswa-dropdown"
                className="flex-1 h-10 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => {
                  handleAddSiswa(e.target.value);
                  e.target.value = '';
                }}
                disabled={fetching}
              >
                <option value="">-- Pilih Siswa untuk Ditambahkan ke Surat --</option>
                {siswaOptions.map((s) => (
                  <option key={s.id} value={s.id} disabled={selectedSiswaIds.includes(s.id)}>
                    {s.nama} ({s.kelas?.kodeKelas || 'Tanpa Kelas'}) - NISN: {s.nisn}
                  </option>
                ))}
              </select>
            </div>

            {selectedSiswaIds.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400 bg-gray-50 rounded-lg border border-dashed">
                Belum ada siswa yang dipilih. Silakan pilih siswa pada menu dropdown di atas.
              </div>
            ) : (
              <div className="divide-y divide-gray-100 border rounded-lg overflow-hidden">
                {selectedSiswaIds.map((sId, index) => {
                  const s = siswaOptions.find((opt) => opt.id === sId);
                  if (!s) return null;
                  return (
                    <div
                      key={sId}
                      className="flex items-center justify-between p-3 bg-white hover:bg-gray-50 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-center font-bold text-xs text-gray-400">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900">{s.nama}</p>
                          <p className="text-xs text-gray-500">
                            Kelas:{' '}
                            <span className="font-medium text-blue-700">
                              {s.kelas?.kodeKelas || '-'}
                            </span>{' '}
                            • NISN: {s.nisn}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSiswa(sId)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t flex justify-end gap-3">
          <Link href="/surat-siswa">
            <Button type="button" variant="outline">
              Batal
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-700 hover:bg-blue-800 text-white font-semibold flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <GraduationCap className="w-4 h-4" />
            )}
            Terbitkan Surat Dispensasi
          </Button>
        </div>
      </form>
    </div>
  );
}
