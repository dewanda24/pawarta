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
import { createInstansi, updateInstansi } from '@/features/master-data/actions/instansi';

const formSchema = z.object({
  nama: z.string().min(1, 'Nama Instansi wajib diisi'),
  jenis: z.string().optional().nullable(),
  alamat: z.string().optional().nullable(),
  kota: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  telepon: z.string().optional().nullable(),
  website: z.string().url('Format URL tidak valid').optional().nullable(),
  isAktif: z.boolean(),
});

export type InstansiFormValues = z.infer<typeof formSchema>;

interface InstansiFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: InstansiFormValues & { id?: string };
}

export function InstansiForm({ open, onOpenChange, initialData }: InstansiFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InstansiFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama: '',
      jenis: '',
      alamat: '',
      kota: '',
      email: '',
      telepon: '',
      website: '',
      isAktif: true,
    },
  });

  useEffect(() => {
    if (initialData && open) {
      form.reset({
        ...initialData,
        jenis: initialData.jenis || '',
        alamat: initialData.alamat || '',
        kota: initialData.kota || '',
        email: initialData.email || '',
        telepon: initialData.telepon || '',
        website: initialData.website || '',
      });
    } else if (!open) {
      form.reset();
    }
  }, [initialData, open, form]);

  const onSubmit = async (data: InstansiFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        jenis: data.jenis || null,
        alamat: data.alamat || null,
        kota: data.kota || null,
        email: data.email || null,
        telepon: data.telepon || null,
        website: data.website || null,
      };

      const result = initialData?.id
        ? await updateInstansi(initialData.id, payload as any)
        : await createInstansi(payload as any);

      if (result.success) {
        toast.success(`Berhasil ${initialData?.id ? 'mengubah' : 'menambah'} data instansi`);
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
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit' : 'Tambah'} Instansi</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="nama">Nama Instansi <span className="text-red-500">*</span></Label>
              <Input id="nama" {...form.register('nama')} placeholder="Masukkan nama instansi" />
              {form.formState.errors.nama && (
                <p className="text-sm text-red-500">{form.formState.errors.nama.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jenis">Jenis Instansi</Label>
              <Input id="jenis" {...form.register('jenis')} placeholder="Contoh: Sekolah, Dinas" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kota">Kota</Label>
              <Input id="kota" {...form.register('kota')} placeholder="Masukkan kota" />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="alamat">Alamat</Label>
              <Input id="alamat" {...form.register('alamat')} placeholder="Masukkan alamat lengkap" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register('email')} placeholder="email@contoh.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telepon">Telepon</Label>
              <Input id="telepon" {...form.register('telepon')} placeholder="081xxx" />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" {...form.register('website')} placeholder="https://..." />
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
