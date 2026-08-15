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
import { createJenisSurat, updateJenisSurat } from '@/features/master-data/actions/jenis-surat';

const formSchema = z.object({
  kode: z.string().min(1, 'Kode wajib diisi'),
  nama: z.string().min(1, 'Nama Jenis Surat wajib diisi'),
  deskripsi: z.string().optional().nullable(),
  isAktif: z.boolean(),
});

export type JenisSuratFormValues = z.infer<typeof formSchema>;

interface JenisSuratFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: JenisSuratFormValues & { id?: string };
}

export function JenisSuratForm({ open, onOpenChange, initialData }: JenisSuratFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<JenisSuratFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kode: '',
      nama: '',
      deskripsi: '',
      isAktif: true,
    },
  });

  useEffect(() => {
    if (initialData && open) {
      form.reset({
        ...initialData,
        deskripsi: initialData.deskripsi || '',
      });
    } else if (!open) {
      form.reset();
    }
  }, [initialData, open, form]);

  const onSubmit = async (data: JenisSuratFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        deskripsi: data.deskripsi || null,
      };

      const result = initialData?.id
        ? await updateJenisSurat(initialData.id, payload as any)
        : await createJenisSurat(payload as any);

      if (result.success) {
        toast.success(`Berhasil ${initialData?.id ? 'mengubah' : 'menambah'} data jenis surat`);
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit' : 'Tambah'} Jenis Surat</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="kode">Kode <span className="text-red-500">*</span></Label>
            <Input id="kode" {...form.register('kode')} placeholder="Contoh: SU, ST, SE" />
            {form.formState.errors.kode && (
              <p className="text-sm text-red-500">{form.formState.errors.kode.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nama">Nama Jenis Surat <span className="text-red-500">*</span></Label>
            <Input id="nama" {...form.register('nama')} placeholder="Contoh: Surat Undangan" />
            {form.formState.errors.nama && (
              <p className="text-sm text-red-500">{form.formState.errors.nama.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Input id="deskripsi" {...form.register('deskripsi')} placeholder="Deskripsi singkat" />
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
