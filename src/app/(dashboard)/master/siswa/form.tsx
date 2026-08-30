'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createSiswa, updateSiswa } from '@/features/master-data/actions/siswa';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export interface SiswaFormValues {
  id?: string;
  nama: string;
  nisn: string;
  nis?: string | null;
  jenisKelamin: 'L' | 'P';
  tempatLahir?: string | null;
  tanggalLahir?: string | null;
  kelasId?: string | null;
  namaOrtu?: string | null;
  pekerjaanOrtu?: string | null;
  noHpOrtu?: string | null;
  alamat?: string | null;
  status: string;
}

interface SiswaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: SiswaFormValues | null;
  kelasList: Array<{ id: string; namaKelas: string; kodeKelas: string }>;
  onSuccess: () => void;
}

export function SiswaForm({
  open,
  onOpenChange,
  initialData,
  kelasList,
  onSuccess,
}: SiswaFormProps) {
  const [loading, setLoading] = useState(false);

  const [nama, setNama] = useState('');
  const [nisn, setNisn] = useState('');
  const [nis, setNis] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P'>('L');
  const [tempatLahir, setTempatLahir] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [kelasId, setKelasId] = useState('');
  const [namaOrtu, setNamaOrtu] = useState('');
  const [pekerjaanOrtu, setPekerjaanOrtu] = useState('');
  const [noHpOrtu, setNoHpOrtu] = useState('');
  const [alamat, setAlamat] = useState('');
  const [status, setStatus] = useState('Aktif');

  useEffect(() => {
    if (initialData) {
      setNama(initialData.nama || '');
      setNisn(initialData.nisn || '');
      setNis(initialData.nis || '');
      setJenisKelamin((initialData.jenisKelamin as 'L' | 'P') || 'L');
      setTempatLahir(initialData.tempatLahir || '');
      setTanggalLahir(initialData.tanggalLahir || '');
      setKelasId(initialData.kelasId || '');
      setNamaOrtu(initialData.namaOrtu || '');
      setPekerjaanOrtu(initialData.pekerjaanOrtu || '');
      setNoHpOrtu(initialData.noHpOrtu || '');
      setAlamat(initialData.alamat || '');
      setStatus(initialData.status || 'Aktif');
    } else {
      setNama('');
      setNisn('');
      setNis('');
      setJenisKelamin('L');
      setTempatLahir('');
      setTanggalLahir('');
      setKelasId(kelasList[0]?.id || '');
      setNamaOrtu('');
      setPekerjaanOrtu('');
      setNoHpOrtu('');
      setAlamat('');
      setStatus('Aktif');
    }
  }, [initialData, open, kelasList]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nama.trim()) {
      toast.error('Nama lengkap siswa wajib diisi');
      return;
    }
    if (!nisn.trim()) {
      toast.error('NISN wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nama: nama.trim(),
        nisn: nisn.trim(),
        nis: nis.trim() || null,
        jenisKelamin,
        tempatLahir: tempatLahir.trim() || null,
        tanggalLahir: tanggalLahir.trim() || null,
        kelasId: kelasId || null,
        namaOrtu: namaOrtu.trim() || null,
        pekerjaanOrtu: pekerjaanOrtu.trim() || null,
        noHpOrtu: noHpOrtu.trim() || null,
        alamat: alamat.trim() || null,
        status: status || 'Aktif',
      };

      if (initialData?.id) {
        const res = await updateSiswa(initialData.id, payload as any);
        if (res.success) {
          toast.success('Data siswa berhasil diperbarui');
          onOpenChange(false);
          onSuccess();
        } else {
          toast.error(res.error || 'Gagal memperbarui data siswa');
        }
      } else {
        const res = await createSiswa(payload as any);
        if (res.success) {
          toast.success('Data siswa baru berhasil ditambahkan');
          onOpenChange(false);
          onSuccess();
        } else {
          toast.error(res.error || 'Gagal menambahkan data siswa');
        }
      }
    } catch {
      toast.error('Terjadi kesalahan saat menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-gray-900">
            {initialData ? 'Ubah Data Siswa' : 'Tambah Siswa Baru'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold">Nama Lengkap Siswa *</Label>
              <Input
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Muhammad Rizky Pratama"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">NISN *</Label>
              <Input
                value={nisn}
                onChange={(e) => setNisn(e.target.value)}
                placeholder="Contoh: 0123456789"
                className="h-9 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">NIS / NIPD</Label>
              <Input
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                placeholder="Contoh: 252607001"
                className="h-9 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Jenis Kelamin *</Label>
              <Select value={jenisKelamin} onValueChange={(val: 'L' | 'P') => setJenisKelamin(val)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Pilih Jenis Kelamin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Laki-laki (L)</SelectItem>
                  <SelectItem value="P">Perempuan (P)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Rombongan Belajar (Kelas) *</Label>
              <Select value={kelasId} onValueChange={setKelasId}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Pilih Kelas" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {kelasList.map((k) => (
                    <SelectItem key={k.id} value={k.id} className="text-xs">
                      {k.namaKelas} ({k.kodeKelas})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Tempat Lahir</Label>
              <Input
                value={tempatLahir}
                onChange={(e) => setTempatLahir(e.target.value)}
                placeholder="Contoh: Sumedang"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Tanggal Lahir</Label>
              <Input
                value={tanggalLahir}
                onChange={(e) => setTanggalLahir(e.target.value)}
                type="date"
                className="h-9 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Nama Orang Tua / Wali</Label>
              <Input
                value={namaOrtu}
                onChange={(e) => setNamaOrtu(e.target.value)}
                placeholder="Contoh: Bpk. Ahmad Subagja"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">No. HP / WhatsApp Ortu</Label>
              <Input
                value={noHpOrtu}
                onChange={(e) => setNoHpOrtu(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="h-9 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Pekerjaan Orang Tua</Label>
              <Input
                value={pekerjaanOrtu}
                onChange={(e) => setPekerjaanOrtu(e.target.value)}
                placeholder="Contoh: Wiraswasta / PNS"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Status Siswa</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Lulus">Lulus</SelectItem>
                  <SelectItem value="Pindah">Pindah</SelectItem>
                  <SelectItem value="Keluar">Keluar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold">Alamat Domisili</Label>
              <Textarea
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                rows={2}
                placeholder="Dusun, RT/RW, Desa, Kecamatan"
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
              {initialData ? 'Simpan Perubahan' : 'Tambah Siswa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
