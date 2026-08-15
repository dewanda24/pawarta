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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { createPegawai, updatePegawai } from '@/features/master-data/actions/pegawai';

const formSchema = z.object({
  nama: z.string().min(1, 'Nama Pegawai wajib diisi'),
  nip: z.string().optional().nullable(),
  nik: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  noHp: z.string().optional().nullable(),
  statusAsn: z.string().optional().nullable(),
  unitKerjaId: z.string().optional().nullable(),
  jabatanId: z.string().optional().nullable(),
  isAktif: z.boolean(),
});

export type PegawaiFormValues = z.infer<typeof formSchema>;

interface PegawaiFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: PegawaiFormValues & { id?: string };
  unitKerjaOptions: any[];
  jabatanOptions: any[];
}

export function PegawaiForm({ open, onOpenChange, initialData, unitKerjaOptions, jabatanOptions }: PegawaiFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PegawaiFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      nama: '',
      nip: '',
      nik: '',
      email: '',
      noHp: '',
      statusAsn: '',
      unitKerjaId: undefined,
      jabatanId: undefined,
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

  const onSubmit = async (data: PegawaiFormValues) => {
    setIsSubmitting(true);
    try {
      const result = initialData?.id
        ? await updatePegawai(initialData.id, data as any)
        : await createPegawai(data as any);

      if (result.success) {
        toast.success(`Berhasil ${initialData?.id ? 'mengubah' : 'menambah'} data pegawai`);
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
          <DialogTitle>{initialData ? 'Edit' : 'Tambah'} Pegawai</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="nama">Nama Pegawai <span className="text-red-500">*</span></Label>
              <Input id="nama" {...form.register('nama')} placeholder="Nama Lengkap" />
              {form.formState.errors.nama && (
                <p className="text-sm text-red-500">{form.formState.errors.nama.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nip">NIP</Label>
              <Input id="nip" {...form.register('nip')} value={form.watch('nip') || ''} placeholder="NIP" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nik">NIK</Label>
              <Input id="nik" {...form.register('nik')} value={form.watch('nik') || ''} placeholder="NIK" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unitKerjaId">Unit Kerja</Label>
              <Select 
                onValueChange={(val) => form.setValue('unitKerjaId', val)} 
                value={form.watch('unitKerjaId') || undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Unit Kerja" />
                </SelectTrigger>
                <SelectContent>
                  {unitKerjaOptions.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>{opt.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="jabatanId">Jabatan</Label>
              <Select 
                onValueChange={(val) => form.setValue('jabatanId', val)} 
                value={form.watch('jabatanId') || undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Jabatan" />
                </SelectTrigger>
                <SelectContent>
                  {jabatanOptions.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>{opt.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="statusAsn">Status ASN</Label>
              <Input id="statusAsn" {...form.register('statusAsn')} value={form.watch('statusAsn') || ''} placeholder="PNS / PPPK / Honorer" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="noHp">Nomor HP</Label>
              <Input id="noHp" {...form.register('noHp')} value={form.watch('noHp') || ''} placeholder="08..." />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register('email')} value={form.watch('email') || ''} placeholder="email@pegawai.com" />
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
