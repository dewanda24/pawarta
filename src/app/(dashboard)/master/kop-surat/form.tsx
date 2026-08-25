'use client';

import { useState, useRef, useEffect } from 'react';
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
import { createDocumentHeader, updateDocumentHeader } from '@/features/master-data/actions/kop-surat';
import { toast } from 'sonner';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';

const formSchema = z.object({
  namaKop: z.string().min(1, 'Nama profil kop wajib diisi'),
  instansiUtama: z.string().optional(),
  namaSekolah: z.string().min(1, 'Nama sekolah wajib diisi'),
  alamat: z.string().optional(),
  kontak: z.string().optional(),
  website: z.string().optional(),
  logoUrl: z.string().optional(),
  tipeGaris: z.string(),
  isDefault: z.boolean(),
  isAktif: z.boolean(),
});

export type DocumentHeaderFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: (DocumentHeaderFormValues & { id?: string }) | null;
}

export function DocumentHeaderForm({ open, onOpenChange, initialData }: Props) {
  const isEditing = !!initialData?.id;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DocumentHeaderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      namaKop: '',
      instansiUtama: 'PEMERINTAH PROVINSI JAWA TIMUR • DINAS PENDIDIKAN',
      namaSekolah: '',
      alamat: '',
      kontak: '',
      website: '',
      logoUrl: '/tutwuri.svg',
      tipeGaris: 'double_thick',
      isDefault: false,
      isAktif: true,
    },
  });

  const watchAll = watch();

  useEffect(() => {
    if (initialData) {
      reset({
        namaKop: initialData.namaKop || '',
        instansiUtama: initialData.instansiUtama || '',
        namaSekolah: initialData.namaSekolah || '',
        alamat: initialData.alamat || '',
        kontak: initialData.kontak || '',
        website: initialData.website || '',
        logoUrl: initialData.logoUrl || '/tutwuri.svg',
        tipeGaris: initialData.tipeGaris || 'double_thick',
        isDefault: initialData.isDefault ?? false,
        isAktif: initialData.isAktif ?? true,
      });
    } else {
      reset({
        namaKop: '',
        instansiUtama: 'PEMERINTAH PROVINSI JAWA TIMUR • DINAS PENDIDIKAN',
        namaSekolah: '',
        alamat: '',
        kontak: '',
        website: '',
        logoUrl: '/tutwuri.svg',
        tipeGaris: 'double_thick',
        isDefault: false,
        isAktif: true,
      });
    }
  }, [initialData, reset, open]);

  const handleUploadLogoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tipeSurat', 'LOGO');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setValue('logoUrl', json.url || json.fileUrl);
        toast.success('Logo berhasil diunggah!');
      } else {
        toast.error(json.error || 'Gagal mengunggah logo');
      }
    } catch {
      toast.error('Terjadi kesalahan saat upload logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const onSubmit = async (data: DocumentHeaderFormValues) => {
    try {
      if (isEditing && initialData?.id) {
        const res = await updateDocumentHeader(initialData.id, data);
        if (res.success) {
          toast.success('KOP surat berhasil diperbarui');
          onOpenChange(false);
        } else {
          toast.error(res.error || 'Gagal mengubah KOP surat');
        }
      } else {
        const res = await createDocumentHeader(data);
        if (res.success) {
          toast.success('KOP surat baru berhasil ditambahkan');
          onOpenChange(false);
        } else {
          toast.error(res.error || 'Gagal menambahkan KOP surat');
        }
      }
    } catch {
      toast.error('Terjadi kesalahan saat memproses data');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[760px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Desain KOP Surat' : 'Buat Desain KOP Surat Baru'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-5 py-2'>
          {/* Live Preview Box */}
          <div className='border rounded-xl p-4 bg-gray-50/80 shadow-inner'>
            <p className='text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2'>
              Live Preview KOP Surat Resmi
            </p>
            <div className='bg-white p-5 sm:p-6 rounded-lg border border-gray-200 shadow-xs'>
              <div className='flex items-center justify-between gap-4'>
                {/* Logo Preview */}
                <div className='w-16 sm:w-20 shrink-0 flex items-center justify-center'>
                  {watchAll.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={watchAll.logoUrl}
                      alt='Logo'
                      className='w-14 h-14 sm:w-16 sm:h-16 object-contain'
                    />
                  ) : (
                    <div className='w-14 h-14 border border-dashed border-gray-300 rounded flex items-center justify-center text-[10px] text-gray-400'>
                      Tanpa Logo
                    </div>
                  )}
                </div>

                {/* Teks KOP Tengah */}
                <div className='flex-1 text-center px-1'>
                  <h4 className='text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-700 font-sans'>
                    {watchAll.instansiUtama || 'INSTANSI INDUK / DINAS PENDIDIKAN'}
                  </h4>
                  <h3 className='text-sm sm:text-lg font-extrabold uppercase tracking-tight text-gray-950 mt-0.5 font-sans'>
                    {watchAll.namaSekolah || 'NAMA SATUAN PENDIDIKAN / SEKOLAH'}
                  </h3>
                  <p className='text-[10px] sm:text-[11px] text-gray-600 mt-1 font-sans'>
                    {watchAll.alamat || 'Alamat Lengkap Sekolah'}
                  </p>
                  <p className='text-[10px] text-gray-500 font-sans'>
                    {watchAll.kontak ? watchAll.kontak : ''}
                    {watchAll.website ? ` • ${watchAll.website}` : ''}
                  </p>
                </div>

                {/* Spacer Kanan agar Teks tetap di Tengah Sempurna */}
                <div className='w-16 sm:w-20 shrink-0 hidden sm:block' />
              </div>

              <div
                className={`mt-3 ${
                  watchAll.tipeGaris === 'double_thick'
                    ? 'border-b-4 border-double border-gray-950'
                    : watchAll.tipeGaris === 'single_thick'
                    ? 'border-b-2 border-gray-950'
                    : 'border-b border-gray-950'
                }`}
              />
            </div>
          </div>

          {/* Logo Selector & Uploader Section */}
          <div className='rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-3'>
            <div className='flex items-center justify-between'>
              <Label className='text-xs font-bold text-gray-900 flex items-center gap-1.5'>
                <ImageIcon className='w-4 h-4 text-blue-600' /> Logo KOP Surat
              </Label>
              {watchAll.logoUrl && (
                <span className='text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200'>
                  Logo Terpasang
                </span>
              )}
            </div>

            {/* Logo Presets & Upload */}
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-2.5'>
              <button
                type='button'
                onClick={() => setValue('logoUrl', '/tutwuri.svg')}
                className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left text-xs transition-all ${
                  watchAll.logoUrl === '/tutwuri.svg'
                    ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src='/tutwuri.svg' alt='Tut Wuri' className='w-7 h-7 object-contain' />
                <div>
                  <p className='font-bold text-gray-900'>Tut Wuri Handayani</p>
                  <p className='text-[10px] text-gray-500'>Logo Resmi Kemendikbud</p>
                </div>
              </button>

              <button
                type='button'
                onClick={() => setValue('logoUrl', '/logo-provinsi.svg')}
                className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left text-xs transition-all ${
                  watchAll.logoUrl === '/logo-provinsi.svg'
                    ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src='/logo-provinsi.svg' alt='Daerah' className='w-7 h-7 object-contain' />
                <div>
                  <p className='font-bold text-gray-900'>Lambang Daerah</p>
                  <p className='text-[10px] text-gray-500'>Logo Provinsi / Pemda</p>
                </div>
              </button>

              <div>
                <input
                  ref={fileInputRef}
                  type='file'
                  onChange={handleUploadLogoFile}
                  className='hidden'
                  accept='image/png,image/jpeg,image/svg+xml,image/webp'
                />
                <button
                  type='button'
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingLogo}
                  className='w-full h-full flex items-center justify-center gap-2 p-2.5 rounded-lg border border-dashed border-blue-400 bg-blue-50/50 hover:bg-blue-100/50 text-blue-700 font-semibold text-xs transition-all'
                >
                  {isUploadingLogo ? (
                    <>
                      <Loader2 className='w-4 h-4 animate-spin' /> Mengunggah...
                    </>
                  ) : (
                    <>
                      <Upload className='w-4 h-4' /> Upload Logo Sekolah
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className='pt-1'>
              <Input
                placeholder='Atau tempel URL gambar logo eksternal (contoh: https://.../logo.png)'
                value={watchAll.logoUrl || ''}
                onChange={(e) => setValue('logoUrl', e.target.value)}
                className='text-xs h-8 bg-white'
              />
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5'>
            <div className='space-y-1.5 sm:col-span-2'>
              <Label htmlFor='namaKop'>
                Nama Profil KOP <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='namaKop'
                placeholder='Contoh: KOP Resmi Dinas SMA Negeri 1'
                {...register('namaKop')}
              />
              {errors.namaKop && <p className='text-xs text-red-500'>{errors.namaKop.message}</p>}
            </div>

            <div className='space-y-1.5 sm:col-span-2'>
              <Label htmlFor='instansiUtama'>Instansi Induk / Pemerintah Daerah</Label>
              <Input
                id='instansiUtama'
                placeholder='Contoh: PEMERINTAH PROVINSI JAWA TIMUR • DINAS PENDIDIKAN'
                {...register('instansiUtama')}
              />
            </div>

            <div className='space-y-1.5 sm:col-span-2'>
              <Label htmlFor='namaSekolah'>
                Nama Satuan Pendidikan / Sekolah <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='namaSekolah'
                placeholder='Contoh: SMA NEGERI 1 KOTA CONTOH'
                {...register('namaSekolah')}
              />
              {errors.namaSekolah && <p className='text-xs text-red-500'>{errors.namaSekolah.message}</p>}
            </div>

            <div className='space-y-1.5 sm:col-span-2'>
              <Label htmlFor='alamat'>Alamat Lengkap & Kode Pos</Label>
              <Textarea
                id='alamat'
                rows={2}
                placeholder='Contoh: Jl. Pendidikan No. 45, Kec. Karangpilang, Kota Surabaya 60221'
                {...register('alamat')}
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='kontak'>Kontak (Telepon / Email)</Label>
              <Input
                id='kontak'
                placeholder='Contoh: Telp: (031) 123456 • info@sman1.sch.id'
                {...register('kontak')}
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='website'>Website Sekolah</Label>
              <Input
                id='website'
                placeholder='Contoh: www.sman1contoh.sch.id'
                {...register('website')}
              />
            </div>

            <div className='space-y-1.5 sm:col-span-2'>
              <Label htmlFor='tipeGaris'>Gaya Garis Pembatas KOP</Label>
              <select
                id='tipeGaris'
                {...register('tipeGaris')}
                className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background'
              >
                <option value='double_thick'>Garis Ganda Tebal & Tipis (Standar Resmi Kedinasan)</option>
                <option value='single_thick'>Garis Tunggal Tebal (2px)</option>
                <option value='single_thin'>Garis Tunggal Tipis (1px)</option>
              </select>
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2'>
            <div className='flex items-center justify-between rounded-lg border p-3 bg-gray-50/50'>
              <div>
                <Label className='text-xs font-semibold text-gray-900'>Jadikan KOP Default</Label>
                <p className='text-[10px] text-gray-500'>Otomatis dipakai di semua cetak surat</p>
              </div>
              <input
                type='checkbox'
                id='isDefault'
                checked={watchAll.isDefault}
                onChange={(e) => setValue('isDefault', e.target.checked)}
                className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
              />
            </div>

            <div className='flex items-center justify-between rounded-lg border p-3 bg-gray-50/50'>
              <div>
                <Label className='text-xs font-semibold text-gray-900'>Status Aktif</Label>
                <p className='text-[10px] text-gray-500'>Dapat dipilih dalam sistem</p>
              </div>
              <input
                type='checkbox'
                id='isAktif'
                checked={watchAll.isAktif}
                onChange={(e) => setValue('isAktif', e.target.checked)}
                className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
              />
            </div>
          </div>

          <DialogFooter className='pt-3'>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type='submit' disabled={isSubmitting} className='bg-blue-700 hover:bg-blue-800'>
              {isSubmitting ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Simpan KOP Surat'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
