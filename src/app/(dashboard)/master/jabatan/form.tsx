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
import { createJabatan, updateJabatan } from '@/features/master-data/actions/jabatan';

const formSchema = z.object({
  nama: z.string().min(1, 'Nama Jabatan wajib diisi'),
  isAktif: z.boolean(),
});

export type JabatanFormValues = z.infer<typeof formSchema>;

interface JabatanFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: JabatanFormValues & { id?: string };
}

export function JabatanForm({ open, onOpenChange, initialData }: JabatanFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<JabatanFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      nama: '',
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

  const onSubmit = async (data: JabatanFormValues) => {
    setIsSubmitting(true);
    try {
      const result = initialData?.id
        ? await updateJabatan(initialData.id, data as any)
        : await createJabatan(data as any);

      if (result.success) {
        toast.success(`Berhasil ${initialData?.id ? 'mengubah' : 'menambah'} data jabatan`);
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
          <DialogTitle>{initialData ? 'Edit' : 'Tambah'} Jabatan</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Jabatan <span className="text-red-500">*</span></Label>
            <Input id="nama" {...form.register('nama')} placeholder="Masukkan nama jabatan" />
            {form.formState.errors.nama && (
              <p className="text-sm text-red-500">{form.formState.errors.nama.message}</p>
            )}
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
