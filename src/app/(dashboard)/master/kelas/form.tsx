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
import { createKelas, updateKelas } from '@/features/master-data/actions/kelas';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export interface KelasFormValues {
  id?: string;
  kodeKelas: string;
  namaKelas: string;
  tingkat: number;
  jurusan?: string | null;
  waliKelasId?: string | null;
  tahunAjaran?: string;
}

interface KelasFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: KelasFormValues | null;
  pegawaiList: Array<{ id: string; nama: string; nip?: string | null }>;
  onSuccess: () => void;
}

export function KelasForm({
  open,
  onOpenChange,
  initialData,
  pegawaiList,
  onSuccess,
}: KelasFormProps) {
  const [loading, setLoading] = useState(false);

  const [kodeKelas, setKodeKelas] = useState('');
  const [namaKelas, setNamaKelas] = useState('');
  const [tingkat, setTingkat] = useState<number>(7);
  const [jurusan, setJurusan] = useState('Umum');
  const [waliKelasId, setWaliKelasId] = useState('');
  const [tahunAjaran, setTahunAjaran] = useState('2026/2027');

  useEffect(() => {
    if (initialData) {
      setKodeKelas(initialData.kodeKelas || '');
      setNamaKelas(initialData.namaKelas || '');
      setTingkat(initialData.tingkat || 7);
      setJurusan(initialData.jurusan || 'Umum');
      setWaliKelasId(initialData.waliKelasId || '');
      setTahunAjaran(initialData.tahunAjaran || '2026/2027');
    } else {
      setKodeKelas('');
      setNamaKelas('');
      setTingkat(7);
      setJurusan('Umum');
      setWaliKelasId('');
      setTahunAjaran('2026/2027');
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!kodeKelas.trim()) {
      toast.error('Kode rombel wajib diisi');
      return;
    }
    if (!namaKelas.trim()) {
      toast.error('Nama kelas wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        kodeKelas: kodeKelas.trim().toUpperCase(),
        namaKelas: namaKelas.trim(),
        tingkat,
        jurusan: jurusan || 'Umum',
        waliKelasId: waliKelasId || null,
        tahunAjaran: tahunAjaran.trim() || '2026/2027',
      };

      if (initialData?.id) {
        const res = await updateKelas(initialData.id, payload as any);
        if (res.success) {
          toast.success('Rombongan belajar berhasil diperbarui');
          onOpenChange(false);
          onSuccess();
        } else {
          toast.error(res.error || 'Gagal memperbarui rombel');
        }
      } else {
        const res = await createKelas(payload as any);
        if (res.success) {
          toast.success('Rombongan belajar baru berhasil ditambahkan');
          onOpenChange(false);
          onSuccess();
        } else {
          toast.error(res.error || 'Gagal menambahkan rombel');
        }
      }
    } catch {
      toast.error('Terjadi kesalahan saat menyimpan data rombel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-gray-900">
            {initialData ? 'Ubah Rombongan Belajar' : 'Tambah Rombel Baru'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Kode Rombel *</Label>
            <Input
              value={kodeKelas}
              onChange={(e) => setKodeKelas(e.target.value)}
              placeholder="Contoh: 7A, 8B, 9C"
              className="h-9 text-xs font-mono uppercase"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Nama Lengkap Kelas *</Label>
            <Input
              value={namaKelas}
              onChange={(e) => setNamaKelas(e.target.value)}
              placeholder="Contoh: Kelas 7A"
              className="h-9 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Tingkat Kelas *</Label>
              <Select value={String(tingkat)} onValueChange={(v) => setTingkat(Number(v))}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Pilih Tingkat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Kelas 7 (SMP)</SelectItem>
                  <SelectItem value="8">Kelas 8 (SMP)</SelectItem>
                  <SelectItem value="9">Kelas 9 (SMP)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Tahun Pelajaran</Label>
              <Input
                value={tahunAjaran}
                onChange={(e) => setTahunAjaran(e.target.value)}
                placeholder="2026/2027"
                className="h-9 text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Wali Kelas</Label>
            <Select value={waliKelasId} onValueChange={setWaliKelasId}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="-- Pilih Wali Kelas --" />
              </SelectTrigger>
              <SelectContent className="max-h-56">
                <SelectItem value="">-- Belum Ditentukan --</SelectItem>
                {pegawaiList.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-xs">
                    {p.nama} {p.nip ? `(NIP. ${p.nip})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
              {initialData ? 'Simpan Perubahan' : 'Tambah Rombel'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
