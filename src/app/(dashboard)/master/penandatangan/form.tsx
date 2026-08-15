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
import { createPenandatangan, updatePenandatangan } from '@/features/master-data/actions/penandatangan';

const formSchema = z.object({
  pegawaiId: z.string().uuid('Pegawai ID tidak valid'),
  jabatanId: z.string().uuid('Jabatan ID tidak valid'),
  nipLabel: z.string().optional().nullable(),
  masaBerlakuMulai: z.string().optional().nullable(),
  masaBerlakuSelesai: z.string().optional().nullable(),
  isAktif: z.boolean(),
});

export type PenandatanganFormValues = z.infer<typeof formSchema>;

interface PenandatanganFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: PenandatanganFormValues & { id?: string };
}

export function PenandatanganForm({ open, onOpenChange, initialData }: PenandatanganFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PenandatanganFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pegawaiId: '',
      jabatanId: '',
      nipLabel: '',
      masaBerlakuMulai: '',
      masaBerlakuSelesai: '',
      isAktif: true,
    },
  });

  useEffect(() => {
    if (initialData && open) {
      form.reset({
        ...initialData,
        nipLabel: initialData.nipLabel || '',
        masaBerlakuMulai: initialData.masaBerlakuMulai || '',
        masaBerlakuSelesai: initialData.masaBerlakuSelesai || '',
      });
    } else if (!open) {
      form.reset();
    }
  }, [initialData, open, form]);

  const onSubmit = async (data: PenandatanganFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        nipLabel: data.nipLabel || null,
        masaBerlakuMulai: data.masaBerlakuMulai || null,
        masaBerlakuSelesai: data.masaBerlakuSelesai || null,
      };

      const result = initialData?.id
        ? await updatePenandatangan(initialData.id, payload as any)
        : await createPenandatangan(payload as any);

      if (result.success) {
        toast.success(`Berhasil ${initialData?.id ? 'mengubah' : 'menambah'} data penandatangan`);
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
          <DialogTitle>{initialData ? 'Edit' : 'Tambah'} Penandatangan</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="pegawaiId">Pegawai ID (UUID) <span className="text-red-500">*</span></Label>
            <Input id="pegawaiId" {...form.register('pegawaiId')} placeholder="ID Pegawai" />
            {form.formState.errors.pegawaiId && (
              <p className="text-sm text-red-500">{form.formState.errors.pegawaiId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="jabatanId">Jabatan ID (UUID) <span className="text-red-500">*</span></Label>
            <Input id="jabatanId" {...form.register('jabatanId')} placeholder="ID Jabatan" />
            {form.formState.errors.jabatanId && (
              <p className="text-sm text-red-500">{form.formState.errors.jabatanId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nipLabel">NIP Label</Label>
            <Input id="nipLabel" {...form.register('nipLabel')} placeholder="Label NIP untuk cetak" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="masaBerlakuMulai">Berlaku Mulai</Label>
            <Input id="masaBerlakuMulai" {...form.register('masaBerlakuMulai')} placeholder="Contoh: 2024" />
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
