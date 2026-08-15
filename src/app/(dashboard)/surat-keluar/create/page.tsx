'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createSuratKeluar } from '@/features/surat-keluar/actions/surat';

const formSchema = z.object({
  perihal: z.string().min(1, 'Perihal wajib diisi'),
  tujuanSurat: z.string().min(1, 'Tujuan surat wajib diisi'),
  jenisSuratId: z.string().uuid('Pilih jenis surat'),
  klasifikasiId: z.string().uuid('Pilih klasifikasi surat'),
  prioritasId: z.string().uuid('Pilih prioritas').optional().nullable(),
  sifatSuratId: z.string().uuid('Pilih sifat surat').optional().nullable(),
  instansiTujuanId: z.string().uuid('Pilih instansi').optional().nullable(),
  pembuatId: z.string().uuid('Pembuat ID tidak valid'),
  unitKerjaId: z.string().uuid('Unit Kerja ID tidak valid'),
  penandatanganId: z.string().uuid('Pilih penandatangan').optional().nullable(),
  catatanTambahan: z.string().optional().nullable(),
});

type SuratKeluarFormValues = z.infer<typeof formSchema>;

export default function CreateSuratKeluarPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SuratKeluarFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      perihal: '',
      tujuanSurat: '',
      jenisSuratId: '',
      klasifikasiId: '',
      prioritasId: '',
      sifatSuratId: '',
      instansiTujuanId: '',
      pembuatId: '', // Ini idealnya didapat dari session NextAuth saat render
      unitKerjaId: '', // Idealnya dari session user
      penandatanganId: '',
      catatanTambahan: '',
    },
  });

  const onSubmit = async (data: SuratKeluarFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        prioritasId: data.prioritasId || null,
        sifatSuratId: data.sifatSuratId || null,
        instansiTujuanId: data.instansiTujuanId || null,
        penandatanganId: data.penandatanganId || null,
        catatanTambahan: data.catatanTambahan || null,
      };

      const result = await createSuratKeluar(payload as any);

      if (result.success) {
        toast.success('Draft surat keluar berhasil dibuat');
        router.push('/surat-keluar');
      } else {
        toast.error(result.error || 'Terjadi kesalahan');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan sistem');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Buat Surat Keluar Baru</h1>
        <p className="text-sm text-gray-500">Isi metadata awal untuk draft surat keluar.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg border shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2">
            <Label htmlFor="perihal">Perihal Surat <span className="text-red-500">*</span></Label>
            <Input id="perihal" {...form.register('perihal')} placeholder="Contoh: Undangan Rapat Koordinasi" />
            {form.formState.errors.perihal && (
              <p className="text-sm text-red-500">{form.formState.errors.perihal.message}</p>
            )}
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="tujuanSurat">Tujuan Surat (Personal/Umum) <span className="text-red-500">*</span></Label>
            <Input id="tujuanSurat" {...form.register('tujuanSurat')} placeholder="Kepada Yth. Kepala Dinas..." />
            {form.formState.errors.tujuanSurat && (
              <p className="text-sm text-red-500">{form.formState.errors.tujuanSurat.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="jenisSuratId">Jenis Surat ID (UUID) <span className="text-red-500">*</span></Label>
            <Input id="jenisSuratId" {...form.register('jenisSuratId')} placeholder="ID Jenis Surat" />
            {form.formState.errors.jenisSuratId && <p className="text-sm text-red-500">{form.formState.errors.jenisSuratId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="klasifikasiId">Klasifikasi Surat ID (UUID) <span className="text-red-500">*</span></Label>
            <Input id="klasifikasiId" {...form.register('klasifikasiId')} placeholder="ID Klasifikasi" />
            {form.formState.errors.klasifikasiId && <p className="text-sm text-red-500">{form.formState.errors.klasifikasiId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pembuatId">Pembuat ID (UUID Konseptor) <span className="text-red-500">*</span></Label>
            <Input id="pembuatId" {...form.register('pembuatId')} placeholder="ID User Anda" />
            {form.formState.errors.pembuatId && <p className="text-sm text-red-500">{form.formState.errors.pembuatId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="unitKerjaId">Unit Kerja ID (UUID) <span className="text-red-500">*</span></Label>
            <Input id="unitKerjaId" {...form.register('unitKerjaId')} placeholder="ID Unit Kerja" />
            {form.formState.errors.unitKerjaId && <p className="text-sm text-red-500">{form.formState.errors.unitKerjaId.message}</p>}
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="catatanTambahan">Catatan Tambahan</Label>
            <Textarea id="catatanTambahan" {...form.register('catatanTambahan')} placeholder="Catatan untuk pimpinan atau reviewer" />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => router.push('/surat-keluar')}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : 'Simpan Draft'}
          </Button>
        </div>
      </form>
    </div>
  );
}
