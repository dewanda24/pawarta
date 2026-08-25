'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createKlasifikasiSurat, updateKlasifikasiSurat } from '@/features/master-data/actions/klasifikasi-surat';
import { toast } from 'sonner';
import { useEffect } from 'react';

const formSchema = z.object({
  kode: z.string().min(1, 'Kode klasifikasi wajib diisi (misal: 421.2)'),
  nama: z.string().min(1, 'Nama klasifikasi wajib diisi (misal: Kesiswaan / Kegiatan Siswa)'),
  deskripsi: z.string().optional(),
  isAktif: z.boolean(),
});

export type KlasifikasiSuratFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: (KlasifikasiSuratFormValues & { id?: string }) | null;
}

export function KlasifikasiSuratForm({ open, onOpenChange, initialData }: Props) {
  const isEditing = !!initialData?.id;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<KlasifikasiSuratFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kode: '',
      nama: '',
      deskripsi: '',
      isAktif: true,
    },
  });

  const isAktif = watch('isAktif');

  useEffect(() => {
    if (initialData) {
      reset({
        kode: initialData.kode || '',
        nama: initialData.nama || '',
        deskripsi: initialData.deskripsi || '',
        isAktif: initialData.isAktif ?? true,
      });
    } else {
      reset({
        kode: '',
        nama: '',
        deskripsi: '',
        isAktif: true,
      });
    }
  }, [initialData, reset, open]);

  const onSubmit = async (data: KlasifikasiSuratFormValues) => {
    try {
      if (isEditing && initialData?.id) {
        const res = await updateKlasifikasiSurat(initialData.id, data);
        if (res.success) {
          toast.success('Kode klasifikasi surat berhasil diperbarui');
          onOpenChange(false);
        } else {
          toast.error(res.error || 'Gagal mengubah data');
        }
      } else {
        const res = await createKlasifikasiSurat(data);
        if (res.success) {
          toast.success('Kode klasifikasi surat baru berhasil ditambahkan');
          onOpenChange(false);
        } else {
          toast.error(res.error || 'Gagal menambahkan data');
        }
      }
    } catch {
      toast.error('Terjadi kesalahan saat memproses data');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Kode Klasifikasi Surat' : 'Tambah Kode Klasifikasi Surat'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 py-2'>
          <div className='space-y-2'>
            <Label htmlFor='kode'>Kode Klasifikasi (Nomor / Kode Arsip) <span className='text-red-500'>*</span></Label>
            <Input
              id='kode'
              placeholder='Contoh: 421, 421.2, 422, 005'
              {...register('kode')}
            />
            {errors.kode && <p className='text-xs text-red-500'>{errors.kode.message}</p>}
            <p className='text-[11px] text-gray-500'>Kode ini digunakan untuk pembentukan nomor surat resmi.</p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='nama'>Nama Klasifikasi Urusan <span className='text-red-500'>*</span></Label>
            <Input
              id='nama'
              placeholder='Contoh: Kesiswaan & Ekstrakurikuler, Kurikulum, dll'
              {...register('nama')}
            />
            {errors.nama && <p className='text-xs text-red-500'>{errors.nama.message}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='deskripsi'>Deskripsi / Keterangan</Label>
            <Textarea
              id='deskripsi'
              placeholder='Contoh: Digunakan untuk surat permohonan dispensasi, izin kegiatan, dan beasiswa'
              rows={3}
              {...register('deskripsi')}
            />
          </div>

          <div className='flex items-center justify-between rounded-lg border p-3 shadow-xs bg-gray-50/50'>
            <div className='space-y-0.5'>
              <Label className='text-sm font-medium'>Status Aktif</Label>
              <p className='text-xs text-gray-500'>Jika aktif, akan muncul pada opsi klasifikasi di form surat</p>
            </div>
            <input
              type='checkbox'
              id='isAktif'
              checked={isAktif}
              onChange={(e) => setValue('isAktif', e.target.checked)}
              className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
            />
          </div>

          <DialogFooter className='pt-3'>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type='submit' disabled={isSubmitting} className='bg-blue-700 hover:bg-blue-800'>
              {isSubmitting ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Klasifikasi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
