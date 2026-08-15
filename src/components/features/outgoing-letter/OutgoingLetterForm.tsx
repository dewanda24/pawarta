'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createSuratKeluar } from '@/features/surat-keluar/actions/surat';

const outgoingLetterSchema = z.object({
  perihal: z.string().min(1, 'Perihal surat wajib diisi'),
  tujuanSurat: z.string().min(1, 'Tujuan surat wajib diisi (misal: Kepala Dinas / Wali Murid)'),
  jenisSuratId: z.string().min(1, 'Pilih jenis surat'),
  klasifikasiId: z.string().min(1, 'Pilih kode klasifikasi surat'),
  instansiTujuanId: z.string().optional().nullable(),
  penandatanganId: z.string().optional().nullable(),
  prioritasId: z.string().optional().nullable(),
  sifatSuratId: z.string().optional().nullable(),
  tanggalSurat: z.string().min(1, 'Tanggal surat wajib diisi'),
  catatanTambahan: z.string().optional().nullable(),
});

type OutgoingLetterFormValues = z.infer<typeof outgoingLetterSchema>;

interface OptionItem {
  id: string;
  nama?: string;
  kode?: string;
}

interface OutgoingLetterFormProps {
  jenisSuratOpts?: OptionItem[];
  klasifikasiOpts?: OptionItem[];
  instansiOpts?: OptionItem[];
  pegawaiOpts?: OptionItem[];
  prioritasOpts?: OptionItem[];
  sifatOpts?: OptionItem[];
}

export function OutgoingLetterForm({
  jenisSuratOpts = [],
  klasifikasiOpts = [],
  instansiOpts = [],
  pegawaiOpts = [],
  prioritasOpts = [],
  sifatOpts = [],
}: OutgoingLetterFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OutgoingLetterFormValues>({
    resolver: zodResolver(outgoingLetterSchema),
    defaultValues: {
      perihal: '',
      tujuanSurat: '',
      jenisSuratId: jenisSuratOpts[0]?.id || '',
      klasifikasiId: klasifikasiOpts[0]?.id || '',
      instansiTujuanId: '',
      penandatanganId: pegawaiOpts[0]?.id || '',
      prioritasId: prioritasOpts[0]?.id || '',
      sifatSuratId: sifatOpts[0]?.id || '',
      tanggalSurat: new Date().toISOString().split('T')[0],
      catatanTambahan: '',
    },
  });

  const onSubmit = async (data: OutgoingLetterFormValues) => {
    setLoading(true);
    try {
      const payload = {
        perihal: data.perihal,
        tujuanSurat: data.tujuanSurat,
        jenisSuratId: data.jenisSuratId,
        klasifikasiId: data.klasifikasiId,
        instansiTujuanId: data.instansiTujuanId || null,
        penandatanganId: data.penandatanganId || null,
        prioritasId: data.prioritasId || null,
        sifatSuratId: data.sifatSuratId || null,
        tanggalSurat: data.tanggalSurat,
        catatanTambahan: data.catatanTambahan || null,
      };

      const result = await createSuratKeluar(payload);

      if (result.success) {
        toast.success('Draft surat keluar berhasil dibuat!');
        router.push('/surat-keluar');
      } else {
        toast.error(result.error || 'Gagal menyimpan surat keluar');
      }
    } catch {
      toast.error('Terjadi kesalahan saat memproses data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Perihal */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="perihal">
            Perihal / Isi Ringkas Surat <span className="text-red-500">*</span>
          </Label>
          <Input
            id="perihal"
            {...register('perihal')}
            placeholder="Contoh: Undangan Rapat Komite Sekolah Semester Ganjil"
          />
          {errors.perihal && <p className="text-xs text-red-500">{errors.perihal.message}</p>}
        </div>

        {/* Tujuan Surat */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="tujuanSurat">
            Tujuan Surat (Kepada Yth.) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="tujuanSurat"
            {...register('tujuanSurat')}
            placeholder="Contoh: Seluruh Orang Tua / Wali Murid Kelas X"
          />
          {errors.tujuanSurat && (
            <p className="text-xs text-red-500">{errors.tujuanSurat.message}</p>
          )}
        </div>

        {/* Jenis Surat Dropdown */}
        <div className="space-y-2">
          <Label htmlFor="jenisSuratId">
            Jenis Surat <span className="text-red-500">*</span>
          </Label>
          <select
            id="jenisSuratId"
            {...register('jenisSuratId')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">-- Pilih Jenis Surat --</option>
            {jenisSuratOpts.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.nama} ({opt.kode})
              </option>
            ))}
          </select>
          {errors.jenisSuratId && (
            <p className="text-xs text-red-500">{errors.jenisSuratId.message}</p>
          )}
        </div>

        {/* Klasifikasi Surat Dropdown */}
        <div className="space-y-2">
          <Label htmlFor="klasifikasiId">
            Kode Klasifikasi Surat <span className="text-red-500">*</span>
          </Label>
          <select
            id="klasifikasiId"
            {...register('klasifikasiId')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">-- Pilih Kode Klasifikasi --</option>
            {klasifikasiOpts.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.kode} - {opt.nama}
              </option>
            ))}
          </select>
          {errors.klasifikasiId && (
            <p className="text-xs text-red-500">{errors.klasifikasiId.message}</p>
          )}
        </div>

        {/* Penandatangan (Kepala Sekolah / Guru) Dropdown */}
        <div className="space-y-2">
          <Label htmlFor="penandatanganId">Penandatangan Surat (Pimpinan/Kepsek)</Label>
          <select
            id="penandatanganId"
            {...register('penandatanganId')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">-- Pilih Penandatangan --</option>
            {pegawaiOpts.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.nama} {opt.nip ? `(NIP. ${opt.nip})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Instansi Relasi (Opsional) */}
        <div className="space-y-2">
          <Label htmlFor="instansiTujuanId">Instansi Tujuan (Opsional)</Label>
          <select
            id="instansiTujuanId"
            {...register('instansiTujuanId')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">-- Bukan Instansi / Bebas --</option>
            {instansiOpts.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.nama}
              </option>
            ))}
          </select>
        </div>

        {/* Tanggal Surat */}
        <div className="space-y-2">
          <Label htmlFor="tanggalSurat">
            Tanggal Surat <span className="text-red-500">*</span>
          </Label>
          <Input id="tanggalSurat" type="date" {...register('tanggalSurat')} />
          {errors.tanggalSurat && (
            <p className="text-xs text-red-500">{errors.tanggalSurat.message}</p>
          )}
        </div>

        {/* Prioritas & Sifat Surat */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="prioritasId">Prioritas</Label>
            <select
              id="prioritasId"
              {...register('prioritasId')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">-- Prioritas --</option>
              {prioritasOpts.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.nama}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sifatSuratId">Sifat Surat</Label>
            <select
              id="sifatSuratId"
              {...register('sifatSuratId')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">-- Sifat --</option>
              {sifatOpts.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.nama}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Catatan Tambahan */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="catatanTambahan">Catatan Tambahan / Ringkasan</Label>
          <Textarea
            id="catatanTambahan"
            {...register('catatanTambahan')}
            placeholder="Catatan konsep surat untuk Kepala Sekolah atau arsip TU..."
            rows={3}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={() => router.push('/surat-keluar')}>
          Batal
        </Button>
        <Button type="submit" disabled={loading} className="bg-blue-700 hover:bg-blue-800">
          {loading ? 'Menyimpan...' : 'Simpan Surat Keluar'}
        </Button>
      </div>
    </form>
  );
}
