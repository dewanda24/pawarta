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
import {
  createDocumentHeader,
  updateDocumentHeader,
  uploadLogoFile,
} from '@/features/master-data/actions/kop-surat';
import { toast } from 'sonner';
import { Upload, Image as ImageIcon, Loader2, X, Sparkles, Building2, School, Sliders, Type } from 'lucide-react';
import { LetterheadView } from '@/components/shared/LetterheadView';

const formSchema = z.object({
  namaKop: z.string().min(1, 'Nama profil kop wajib diisi'),
  instansiUtama: z.string().optional(),
  instansiInduk: z.string().optional(),
  namaSekolah: z.string().min(1, 'Nama sekolah wajib diisi'),
  alamat: z.string().optional(),
  kontak: z.string().optional(),
  website: z.string().optional(),
  logoUrl: z.string().optional(),
  logoKiriUrl: z.string().optional(),
  logoKananUrl: z.string().optional(),
  tipeGaris: z.string(),
  fontFamily: z.string().optional(),
  fontSizeInstansiUtama: z.coerce.number().min(6).max(36).optional(),
  fontSizeInstansiInduk: z.coerce.number().min(6).max(36).optional(),
  fontSizeNamaSekolah: z.coerce.number().min(6).max(48).optional(),
  fontSizeAlamat: z.coerce.number().min(6).max(24).optional(),
  fontSizeKontak: z.coerce.number().min(6).max(24).optional(),
  isDefault: z.boolean(),
  isAktif: z.boolean(),
});

export type DocumentHeaderFormValues = z.infer<typeof formSchema>;

export type DocumentHeaderFormInitialData = {
  [K in keyof DocumentHeaderFormValues]?: DocumentHeaderFormValues[K] | null;
} & { id?: string };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: DocumentHeaderFormInitialData | null;
}

export function DocumentHeaderForm({ open, onOpenChange, initialData }: Props) {
  const isEditing = !!initialData?.id;
  const leftFileInputRef = useRef<HTMLInputElement>(null);
  const rightFileInputRef = useRef<HTMLInputElement>(null);

  const [isUploadingLeft, setIsUploadingLeft] = useState(false);
  const [isUploadingRight, setIsUploadingRight] = useState(false);

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
      instansiUtama: 'PEMERINTAH DAERAH KABUPATEN SUMEDANG',
      instansiInduk: 'DINAS PENDIDIKAN',
      namaSekolah: 'SMP NEGERI 1 UJUNGJAYA',
      alamat: 'Jalan Jaladustan Nomor 29 Ujungjaya Sumedang 45383',
      kontak: 'e-mail : smpn1ujungjaya@gmail.com',
      website: '',
      logoUrl: '/Lambang_Kabupaten_Sumedang.png',
      logoKiriUrl: '/Lambang_Kabupaten_Sumedang.png',
      logoKananUrl: '/LOGO SMPN 1 UJUNGJAYA a (1).png',
      tipeGaris: 'double_thick',
      fontFamily: 'Times New Roman',
      fontSizeInstansiUtama: 14,
      fontSizeInstansiInduk: 14,
      fontSizeNamaSekolah: 18,
      fontSizeAlamat: 10,
      fontSizeKontak: 9,
      isDefault: false,
      isAktif: true,
    },
  });

  const watchAll = watch();

  useEffect(() => {
    if (initialData) {
      const logoKiri = initialData.logoKiriUrl || initialData.logoUrl || '';
      reset({
        namaKop: initialData.namaKop || '',
        instansiUtama: initialData.instansiUtama || '',
        instansiInduk: initialData.instansiInduk || '',
        namaSekolah: initialData.namaSekolah || '',
        alamat: initialData.alamat || '',
        kontak: initialData.kontak || '',
        website: initialData.website || '',
        logoUrl: logoKiri,
        logoKiriUrl: logoKiri,
        logoKananUrl: initialData.logoKananUrl || '',
        tipeGaris: initialData.tipeGaris || 'double_thick',
        fontFamily: initialData.fontFamily || 'Times New Roman',
        fontSizeInstansiUtama: initialData.fontSizeInstansiUtama ?? 14,
        fontSizeInstansiInduk: initialData.fontSizeInstansiInduk ?? 14,
        fontSizeNamaSekolah: initialData.fontSizeNamaSekolah ?? 18,
        fontSizeAlamat: initialData.fontSizeAlamat ?? 10,
        fontSizeKontak: initialData.fontSizeKontak ?? 9,
        isDefault: initialData.isDefault ?? false,
        isAktif: initialData.isAktif ?? true,
      });
    } else {
      reset({
        namaKop: '',
        instansiUtama: 'PEMERINTAH DAERAH KABUPATEN SUMEDANG',
        instansiInduk: 'DINAS PENDIDIKAN',
        namaSekolah: 'SMP NEGERI 1 UJUNGJAYA',
        alamat: 'Jalan Jaladustan Nomor 29 Ujungjaya Sumedang 45383',
        kontak: 'e-mail : smpn1ujungjaya@gmail.com',
        website: '',
        logoUrl: '/Lambang_Kabupaten_Sumedang.png',
        logoKiriUrl: '/Lambang_Kabupaten_Sumedang.png',
        logoKananUrl: '/LOGO SMPN 1 UJUNGJAYA a (1).png',
        tipeGaris: 'double_thick',
        fontFamily: 'Times New Roman',
        fontSizeInstansiUtama: 14,
        fontSizeInstansiInduk: 14,
        fontSizeNamaSekolah: 18,
        fontSizeAlamat: 10,
        fontSizeKontak: 9,
        isDefault: false,
        isAktif: true,
      });
    }
  }, [initialData, reset, open]);

  const handleUploadLogo = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'left' | 'right',
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        if (target === 'left') {
          setValue('logoKiriUrl', dataUrl);
          setValue('logoUrl', dataUrl);
        } else {
          setValue('logoKananUrl', dataUrl);
        }
      }
    };
    reader.readAsDataURL(file);

    if (target === 'left') setIsUploadingLeft(true);
    else setIsUploadingRight(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tipeSurat', 'LOGO');

      // 1. Try Server Action first
      const res = await uploadLogoFile(formData);
      if (res.success && res.url) {
        if (target === 'left') {
          setValue('logoKiriUrl', res.url);
          setValue('logoUrl', res.url);
          toast.success('Logo kiri berhasil disimpan');
        } else {
          setValue('logoKananUrl', res.url);
          toast.success('Logo kanan berhasil disimpan');
        }
      } else {
        // 2. Fallback to API route if server action had an error
        const apiRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const json = await apiRes.json();
        if (apiRes.ok && json.success) {
          const uploadedUrl = json.url || json.fileUrl;
          if (target === 'left') {
            setValue('logoKiriUrl', uploadedUrl);
            setValue('logoUrl', uploadedUrl);
            toast.success('Logo kiri berhasil diunggah!');
          } else {
            setValue('logoKananUrl', uploadedUrl);
            toast.success('Logo kanan berhasil diunggah!');
          }
        } else {
          toast.error(res.error || json.error || 'Gagal menyimpan file logo');
        }
      }
    } catch {
      toast.error('Terjadi kesalahan saat upload logo');
    } finally {
      if (target === 'left') setIsUploadingLeft(false);
      else setIsUploadingRight(false);
      // Reset input value so re-selecting same file triggers onChange
      e.target.value = '';
    }
  };

  const onSubmit = async (data: DocumentHeaderFormValues) => {
    try {
      const payload = {
        ...data,
        logoUrl: data.logoKiriUrl || null,
        logoKiriUrl: data.logoKiriUrl || null,
        logoKananUrl: data.logoKananUrl || null,
      };

      if (isEditing && initialData?.id) {
        const res = await updateDocumentHeader(initialData.id, payload);
        if (res.success) {
          toast.success('KOP surat berhasil diperbarui');
          onOpenChange(false);
        } else {
          toast.error(res.error || 'Gagal mengubah KOP surat');
        }
      } else {
        const res = await createDocumentHeader(payload);
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
      <DialogContent className="sm:max-w-[840px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <Building2 className="w-5 h-5 text-blue-600" />
            {isEditing ? 'Edit Desain KOP Surat' : 'Buat Desain KOP Surat Baru'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-2">
          {/* Live Preview Box */}
          <div className="rounded-xl border border-gray-200 bg-linear-to-b from-gray-50 to-gray-100/60 p-4 shadow-inner">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Pratinjau Langsung (Live Letterhead Preview)
              </p>
              <span className="text-[10px] text-gray-500 font-medium">
                Tampilan real-time lembar naskah dinas
              </span>
            </div>

            <div className="bg-white p-5 sm:p-7 rounded-lg border border-gray-300/80 shadow-xs">
              <LetterheadView
                header={{
                  instansiUtama: watchAll.instansiUtama,
                  instansiInduk: watchAll.instansiInduk,
                  namaSekolah: watchAll.namaSekolah,
                  alamat: watchAll.alamat,
                  kontak: watchAll.kontak,
                  website: watchAll.website,
                  tipeGaris: watchAll.tipeGaris,
                  fontFamily: watchAll.fontFamily,
                  logoKiriUrl: watchAll.logoKiriUrl,
                  logoKananUrl: watchAll.logoKananUrl,
                  fontSizeInstansiUtama: watchAll.fontSizeInstansiUtama,
                  fontSizeInstansiInduk: watchAll.fontSizeInstansiInduk,
                  fontSizeNamaSekolah: watchAll.fontSizeNamaSekolah,
                  fontSizeAlamat: watchAll.fontSizeAlamat,
                  fontSizeKontak: watchAll.fontSizeKontak,
                }}
              />
            </div>
          </div>

          {/* Pengaturan Logo Kiri & Logo Kanan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Logo Kiri */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-blue-600" /> Logo Kiri (Pemda / Dinas)
                </Label>
                {watchAll.logoKiriUrl ? (
                  <button
                    type="button"
                    onClick={() => {
                      setValue('logoKiriUrl', '');
                      setValue('logoUrl', '');
                    }}
                    className="text-[11px] text-red-600 hover:text-red-700 flex items-center gap-0.5"
                  >
                    <X className="w-3 h-3" /> Hapus
                  </button>
                ) : (
                  <span className="text-[10px] text-gray-400">Kosong</span>
                )}
              </div>

              {/* Logo Kiri Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setValue('logoKiriUrl', '/Lambang_Kabupaten_Sumedang.png');
                    setValue('logoUrl', '/Lambang_Kabupaten_Sumedang.png');
                  }}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all ${
                    watchAll.logoKiriUrl === '/Lambang_Kabupaten_Sumedang.png'
                      ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 font-semibold text-blue-900'
                      : 'bg-gray-50/70 border-gray-200 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/Lambang_Kabupaten_Sumedang.png" alt="Sumedang" className="w-6 h-6 object-contain" />
                  <span className="text-[11px] leading-tight font-medium">Kab. Sumedang</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setValue('logoKiriUrl', '/Tut Wuri Handayani Logo - Colored - 512x512 - zonalogo.com.png');
                    setValue('logoUrl', '/Tut Wuri Handayani Logo - Colored - 512x512 - zonalogo.com.png');
                  }}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all ${
                    watchAll.logoKiriUrl === '/Tut Wuri Handayani Logo - Colored - 512x512 - zonalogo.com.png'
                      ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 font-semibold text-blue-900'
                      : 'bg-gray-50/70 border-gray-200 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/Tut Wuri Handayani Logo - Colored - 512x512 - zonalogo.com.png" alt="Tut Wuri" className="w-6 h-6 object-contain" />
                  <span className="text-[11px] leading-tight font-medium">Tut Wuri</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setValue('logoKiriUrl', '/logo-provinsi.svg');
                    setValue('logoUrl', '/logo-provinsi.svg');
                  }}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all ${
                    watchAll.logoKiriUrl === '/logo-provinsi.svg'
                      ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 font-semibold text-blue-900'
                      : 'bg-gray-50/70 border-gray-200 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo-provinsi.svg" alt="Daerah" className="w-6 h-6 object-contain" />
                  <span className="text-[11px] leading-tight font-medium">Daerah (SVG)</span>
                </button>
              </div>

              <div>
                <input
                  ref={leftFileInputRef}
                  type="file"
                  onChange={(e) => handleUploadLogo(e, 'left')}
                  className="hidden"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => leftFileInputRef.current?.click()}
                  disabled={isUploadingLeft}
                  className="w-full text-xs flex items-center justify-center gap-1.5 border-dashed border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  {isUploadingLeft ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Mengunggah...
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" /> Upload File Logo Kiri
                    </>
                  )}
                </Button>
              </div>

              <Input
                placeholder="Atau URL gambar (https://...)"
                value={watchAll.logoKiriUrl || ''}
                onChange={(e) => {
                  setValue('logoKiriUrl', e.target.value);
                  setValue('logoUrl', e.target.value);
                }}
                className="text-[11px] h-8 bg-gray-50/50"
              />
            </div>

            {/* Logo Kanan */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <School className="w-4 h-4 text-emerald-600" /> Logo Kanan (Sekolah / Tut Wuri)
                </Label>
                {watchAll.logoKananUrl ? (
                  <button
                    type="button"
                    onClick={() => setValue('logoKananUrl', '')}
                    className="text-[11px] text-red-600 hover:text-red-700 flex items-center gap-0.5"
                  >
                    <X className="w-3 h-3" /> Hapus
                  </button>
                ) : (
                  <span className="text-[10px] text-gray-400">Kosong</span>
                )}
              </div>

              {/* Logo Kanan Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setValue('logoKananUrl', '/LOGO SMPN 1 UJUNGJAYA a (1).png')}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all ${
                    watchAll.logoKananUrl === '/LOGO SMPN 1 UJUNGJAYA a (1).png'
                      ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 font-semibold text-emerald-900'
                      : 'bg-gray-50/70 border-gray-200 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/LOGO SMPN 1 UJUNGJAYA a (1).png" alt="SMPN 1" className="w-6 h-6 object-contain" />
                  <span className="text-[11px] leading-tight font-medium">SMPN 1 Ujungjaya</span>
                </button>

                <button
                  type="button"
                  onClick={() => setValue('logoKananUrl', '/Tut Wuri Handayani Logo - Colored - 512x512 - zonalogo.com.png')}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all ${
                    watchAll.logoKananUrl === '/Tut Wuri Handayani Logo - Colored - 512x512 - zonalogo.com.png'
                      ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 font-semibold text-emerald-900'
                      : 'bg-gray-50/70 border-gray-200 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/Tut Wuri Handayani Logo - Colored - 512x512 - zonalogo.com.png" alt="Tut Wuri" className="w-6 h-6 object-contain" />
                  <span className="text-[11px] leading-tight font-medium">Tut Wuri</span>
                </button>

                <button
                  type="button"
                  onClick={() => setValue('logoKananUrl', '/Lambang_Kabupaten_Sumedang.png')}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all ${
                    watchAll.logoKananUrl === '/Lambang_Kabupaten_Sumedang.png'
                      ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 font-semibold text-emerald-900'
                      : 'bg-gray-50/70 border-gray-200 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/Lambang_Kabupaten_Sumedang.png" alt="Sumedang" className="w-6 h-6 object-contain" />
                  <span className="text-[11px] leading-tight font-medium">Kab. Sumedang</span>
                </button>
              </div>

              <div>
                <input
                  ref={rightFileInputRef}
                  type="file"
                  onChange={(e) => handleUploadLogo(e, 'right')}
                  className="hidden"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => rightFileInputRef.current?.click()}
                  disabled={isUploadingRight}
                  className="w-full text-xs flex items-center justify-center gap-1.5 border-dashed border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                >
                  {isUploadingRight ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Mengunggah...
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" /> Upload File Logo Kanan
                    </>
                  )}
                </Button>
              </div>

              <Input
                placeholder="Atau URL gambar (https://...)"
                value={watchAll.logoKananUrl || ''}
                onChange={(e) => setValue('logoKananUrl', e.target.value)}
                className="text-[11px] h-8 bg-gray-50/50"
              />
            </div>
          </div>

          {/* Form Input Data Naskah Dinas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="namaKop" className="text-xs font-semibold">
                Nama Profil KOP <span className="text-red-500">*</span>
              </Label>
              <Input
                id="namaKop"
                placeholder="Contoh: KOP Resmi Dinas SMP Negeri 1"
                {...register('namaKop')}
              />
              {errors.namaKop && <p className="text-xs text-red-500">{errors.namaKop.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="instansiUtama" className="text-xs font-semibold">
                Baris 1: Pemerintah Daerah / Instansi Utama
              </Label>
              <Input
                id="instansiUtama"
                placeholder="Contoh: PEMERINTAH DAERAH KABUPATEN SUMEDANG"
                {...register('instansiUtama')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="instansiInduk" className="text-xs font-semibold">
                Baris 2: Dinas / Badan Pembina (Opsional)
              </Label>
              <Input
                id="instansiInduk"
                placeholder="Contoh: DINAS PENDIDIKAN"
                {...register('instansiInduk')}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="namaSekolah" className="text-xs font-semibold">
                Baris 3: Nama Satuan Pendidikan / Sekolah <span className="text-red-500">*</span>
              </Label>
              <Input
                id="namaSekolah"
                placeholder="Contoh: SMP NEGERI 1 UJUNGJAYA"
                className="font-bold"
                {...register('namaSekolah')}
              />
              {errors.namaSekolah && (
                <p className="text-xs text-red-500">{errors.namaSekolah.message}</p>
              )}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="alamat" className="text-xs font-semibold">
                Baris 4: Alamat Lengkap & Kode Pos
              </Label>
              <Textarea
                id="alamat"
                rows={2}
                placeholder="Contoh: Jalan Jaladustan Nomor 29 Ujungjaya Sumedang 45383"
                {...register('alamat')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="kontak" className="text-xs font-semibold">
                Baris 5: Kontak / Email / Telepon
              </Label>
              <Input
                id="kontak"
                placeholder="Contoh: e-mail : smpn1ujungjaya@gmail.com"
                {...register('kontak')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="website" className="text-xs font-semibold">
                Website Sekolah (Opsional)
              </Label>
              <Input
                id="website"
                placeholder="Contoh: www.smpn1ujungjaya.sch.id"
                {...register('website')}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="tipeGaris" className="text-xs font-semibold">
                Gaya Garis Pembatas KOP
              </Label>
              <select
                id="tipeGaris"
                {...register('tipeGaris')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="double_thick">
                  Garis Ganda Dinas (Garis Tebal Atas & Garis Tipis Bawah)
                </option>
                <option value="single_thick">Garis Tunggal Tebal (2px)</option>
                <option value="single_thin">Garis Tunggal Tipis (1px)</option>
              </select>
            </div>
          </div>

          {/* Pengaturan Tipografi & Font KOP Surat */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-blue-100 pb-2">
              <Label className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                <Type className="w-4 h-4 text-blue-700" />
                Pengaturan Jenis Font & Ukuran KOP Surat
              </Label>
              <span className="text-[10px] text-blue-700 font-medium">
                Dapat disesuaikan & langsung terlihat di pratinjau atas
              </span>
            </div>

            {/* Pilihan Font Family (Jenis Huruf) */}
            <div className="space-y-2 bg-white p-3.5 rounded-lg border border-blue-100 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <Label htmlFor="fontFamily" className="text-xs font-bold text-gray-900">
                  Jenis Font KOP Surat (Font Family)
                </Label>
                <span className="text-[10px] text-gray-500">
                  Pilih standar font resmi atau klik preset di bawah
                </span>
              </div>

              {/* Preset Tombol Font Cepat */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {[
                  { id: 'Times New Roman', label: 'Times New Roman', desc: 'Standar Naskah Dinas', fontClass: "'Times New Roman', Times, serif" },
                  { id: 'Arial', label: 'Arial', desc: 'Modern Sans / Perbup', fontClass: 'Arial, sans-serif' },
                  { id: 'Bookman Old Style', label: 'Bookman Old Style', desc: 'Klasik Formal', fontClass: '"Bookman Old Style", Georgia, serif' },
                  { id: 'Garamond', label: 'Garamond', desc: 'Elegan Naskah Resmi', fontClass: 'Garamond, serif' },
                  { id: 'Georgia', label: 'Georgia', desc: 'Serif Elegan', fontClass: 'Georgia, serif' },
                  { id: 'Calibri', label: 'Calibri', desc: 'Sans Bersih', fontClass: 'Calibri, sans-serif' },
                  { id: 'Tahoma', label: 'Tahoma', desc: 'Sans Jelas & Rapi', fontClass: 'Tahoma, sans-serif' },
                  { id: 'Courier New', label: 'Courier New', desc: 'Monospace Resmi', fontClass: '"Courier New", monospace' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setValue('fontFamily', item.id)}
                    style={{ fontFamily: item.fontClass }}
                    className={`flex flex-col p-2 rounded-lg border text-left transition-all ${
                      (watchAll.fontFamily || 'Times New Roman') === item.id
                        ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-500/20 text-blue-950 font-bold'
                        : 'bg-gray-50/70 border-gray-200 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span className="text-xs">{item.label}</span>
                    <span className="text-[9px] font-sans font-normal text-gray-500 mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>

              <div className="pt-2 flex items-center gap-2">
                <span className="text-xs text-gray-500 whitespace-nowrap">Atau pilih manual:</span>
                <select
                  id="fontFamily"
                  {...register('fontFamily')}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs ring-offset-background"
                >
                  <option value="Times New Roman">Times New Roman (Standar Huruf Berkait Resmi)</option>
                  <option value="Arial">Arial (Standar Huruf Tanpa Kait / Modern)</option>
                  <option value="Bookman Old Style">Bookman Old Style (Klasik Formal)</option>
                  <option value="Garamond">Garamond (Elegan Naskah Dinas)</option>
                  <option value="Georgia">Georgia (Serif Elegan)</option>
                  <option value="Calibri">Calibri (Sans Modern)</option>
                  <option value="Tahoma">Tahoma (Sans Jelas)</option>
                  <option value="Courier New">Courier New (Monospace)</option>
                </select>
              </div>
            </div>

            {/* Pilihan Ukuran Font (pt) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              <div className="space-y-1 bg-white p-3 rounded-lg border border-blue-100 shadow-2xs">
                <Label htmlFor="fontSizeInstansiUtama" className="text-[11px] font-semibold text-gray-800">
                  Font Instansi Utama (Pemda)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="fontSizeInstansiUtama"
                    type="number"
                    min={8}
                    max={30}
                    {...register('fontSizeInstansiUtama')}
                    className="h-8 text-xs font-semibold"
                  />
                  <span className="text-xs font-mono text-gray-500 shrink-0">pt</span>
                </div>
                <p className="text-[10px] text-gray-400">Default: 14 pt</p>
              </div>

              <div className="space-y-1 bg-white p-3 rounded-lg border border-blue-100 shadow-2xs">
                <Label htmlFor="fontSizeInstansiInduk" className="text-[11px] font-semibold text-gray-800">
                  Font Instansi Induk (Dinas)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="fontSizeInstansiInduk"
                    type="number"
                    min={8}
                    max={30}
                    {...register('fontSizeInstansiInduk')}
                    className="h-8 text-xs font-semibold"
                  />
                  <span className="text-xs font-mono text-gray-500 shrink-0">pt</span>
                </div>
                <p className="text-[10px] text-gray-400">Default: 14 pt</p>
              </div>

              <div className="space-y-1 bg-white p-3 rounded-lg border border-blue-100 shadow-2xs">
                <Label htmlFor="fontSizeNamaSekolah" className="text-[11px] font-semibold text-gray-800">
                  Font Nama Sekolah (Satker)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="fontSizeNamaSekolah"
                    type="number"
                    min={10}
                    max={36}
                    {...register('fontSizeNamaSekolah')}
                    className="h-8 text-xs font-bold text-blue-900"
                  />
                  <span className="text-xs font-mono text-gray-500 shrink-0">pt</span>
                </div>
                <p className="text-[10px] text-gray-400">Default: 18 pt</p>
              </div>

              <div className="space-y-1 bg-white p-3 rounded-lg border border-blue-100 shadow-2xs">
                <Label htmlFor="fontSizeAlamat" className="text-[11px] font-semibold text-gray-800">
                  Font Alamat & Kode Pos
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="fontSizeAlamat"
                    type="number"
                    min={6}
                    max={20}
                    {...register('fontSizeAlamat')}
                    className="h-8 text-xs"
                  />
                  <span className="text-xs font-mono text-gray-500 shrink-0">pt</span>
                </div>
                <p className="text-[10px] text-gray-400">Default: 10 pt</p>
              </div>

              <div className="space-y-1 bg-white p-3 rounded-lg border border-blue-100 shadow-2xs">
                <Label htmlFor="fontSizeKontak" className="text-[11px] font-semibold text-gray-800">
                  Font Kontak & Website
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="fontSizeKontak"
                    type="number"
                    min={6}
                    max={20}
                    {...register('fontSizeKontak')}
                    className="h-8 text-xs"
                  />
                  <span className="text-xs font-mono text-gray-500 shrink-0">pt</span>
                </div>
                <p className="text-[10px] text-gray-400">Default: 9 pt</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="flex items-center justify-between rounded-lg border p-3 bg-gray-50/50">
              <div>
                <Label className="text-xs font-semibold text-gray-900">
                  Jadikan KOP Utama (Default)
                </Label>
                <p className="text-[10px] text-gray-500">
                  Otomatis digunakan di seluruh cetak surat dinas
                </p>
              </div>
              <input
                type="checkbox"
                id="isDefault"
                checked={watchAll.isDefault}
                onChange={(e) => setValue('isDefault', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3 bg-gray-50/50">
              <div>
                <Label className="text-xs font-semibold text-gray-900">Status Aktif</Label>
                <p className="text-[10px] text-gray-500">Dapat dipilih dalam sistem</p>
              </div>
              <input
                type="checkbox"
                id="isAktif"
                checked={watchAll.isAktif}
                onChange={(e) => setValue('isAktif', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
          </div>

          <DialogFooter className="pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-700 hover:bg-blue-800">
              {isSubmitting ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Simpan KOP Surat'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
