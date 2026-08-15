'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { createSekolah, updateSekolah } from '@/features/master-data/actions/sekolah';

// Define explicit Zod schema to avoid drizzle-zod type inference issues in client components
const formSchema = z.object({
  nama: z.string().min(1, 'Nama Sekolah wajib diisi'),
  npsn: z.string().optional().nullable(),
  nss: z.string().optional().nullable(),
  jenjang: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  alamat: z.string().optional().nullable(),
  desa: z.string().optional().nullable(),
  kecamatan: z.string().optional().nullable(),
  kabupaten: z.string().optional().nullable(),
  provinsi: z.string().optional().nullable(),
  kodePos: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  telepon: z.string().optional().nullable(),
  isAktif: z.boolean(),
});

export type FormValues = z.infer<typeof formSchema>;

interface SekolahFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: FormValues & { id?: string };
}

export function SekolahForm({ open, onOpenChange, initialData }: SekolahFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      nama: '',
      npsn: '',
      nss: '',
      jenjang: '',
      status: '',
      alamat: '',
      desa: '',
      kecamatan: '',
      kabupaten: '',
      provinsi: '',
      kodePos: '',
      email: '',
      website: '',
      telepon: '',
      isAktif: true,
    },
  });

  useEffect(() => {
    if (initialData && open) {
      form.reset(initialData);
    } else if (!open) {
      form.reset();
    }
  }, [initialData, open, form]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const result = initialData?.id
        ? await updateSekolah(initialData.id, data as any)
        : await createSekolah(data as any);

      if (result.success) {
        toast.success(`Berhasil ${initialData?.id ? 'mengubah' : 'menambah'} data sekolah`);
        onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit' : 'Tambah'} Sekolah</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Sekolah <span className="text-red-500">*</span></Label>
              <Input id="nama" {...form.register('nama')} placeholder="Nama Lengkap Sekolah" />
              {form.formState.errors.nama && (
                <p className="text-sm text-red-500">{form.formState.errors.nama.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="npsn">NPSN</Label>
              <Input id="npsn" {...form.register('npsn')} value={form.watch('npsn') || ''} placeholder="NPSN" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jenjang">Jenjang</Label>
              <Input id="jenjang" {...form.register('jenjang')} value={form.watch('jenjang') || ''} placeholder="SD / SMP / SMA" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Input id="status" {...form.register('status')} value={form.watch('status') || ''} placeholder="Negeri / Swasta" />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="alamat">Alamat Lengkap</Label>
              <Input id="alamat" {...form.register('alamat')} value={form.watch('alamat') || ''} placeholder="Alamat Sekolah" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kecamatan">Kecamatan</Label>
              <Input id="kecamatan" {...form.register('kecamatan')} value={form.watch('kecamatan') || ''} placeholder="Kecamatan" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kabupaten">Kabupaten/Kota</Label>
              <Input id="kabupaten" {...form.register('kabupaten')} value={form.watch('kabupaten') || ''} placeholder="Kabupaten" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telepon">Nomor Telepon</Label>
              <Input id="telepon" {...form.register('telepon')} value={form.watch('telepon') || ''} placeholder="021-..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register('email')} value={form.watch('email') || ''} placeholder="email@sekolah.com" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
