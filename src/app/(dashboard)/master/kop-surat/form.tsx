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
} from '@/features/master-data/actions/kop-surat';
import { toast } from 'sonner';
import { Upload, Image as ImageIcon, Loader2, X, Sparkles, Building2, School } from 'lucide-react';
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
      logoUrl: '/logo-provinsi.svg',
      logoKiriUrl: '/logo-provinsi.svg',
      logoKananUrl: '',
      tipeGaris: 'double_thick',
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
        logoUrl: '/logo-provinsi.svg',
        logoKiriUrl: '/logo-provinsi.svg',
        logoKananUrl: '',
        tipeGaris: 'double_thick',
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

    if (target === 'left') setIsUploadingLeft(true);
    else setIsUploadingRight(true);

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
        toast.error(json.error || 'Gagal mengunggah logo');
      }
    } catch {
      toast.error('Terjadi kesalahan saat upload logo');
    } finally {
      if (target === 'left') setIsUploadingLeft(false);
      else setIsUploadingRight(false);
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
                  logoKiriUrl: watchAll.logoKiriUrl,
                  logoKananUrl: watchAll.logoKananUrl,
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
              <div className="grid grid-cols-2 gap-2">
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
                  <span className="text-[11px] leading-tight">Lambang Daerah</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setValue('logoKiriUrl', '/tutwuri.svg');
                    setValue('logoUrl', '/tutwuri.svg');
                  }}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all ${
                    watchAll.logoKiriUrl === '/tutwuri.svg'
                      ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 font-semibold text-blue-900'
                      : 'bg-gray-50/70 border-gray-200 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/tutwuri.svg" alt="Tut Wuri" className="w-6 h-6 object-contain" />
                  <span className="text-[11px] leading-tight">Tut Wuri</span>
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
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setValue('logoKananUrl', '/tutwuri.svg')}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all ${
                    watchAll.logoKananUrl === '/tutwuri.svg'
                      ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 font-semibold text-emerald-900'
                      : 'bg-gray-50/70 border-gray-200 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/tutwuri.svg" alt="Tut Wuri" className="w-6 h-6 object-contain" />
                  <span className="text-[11px] leading-tight">Tut Wuri</span>
                </button>

                <button
                  type="button"
                  onClick={() => setValue('logoKananUrl', '/logo-provinsi.svg')}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all ${
                    watchAll.logoKananUrl === '/logo-provinsi.svg'
                      ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 font-semibold text-emerald-900'
                      : 'bg-gray-50/70 border-gray-200 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo-provinsi.svg" alt="Daerah" className="w-6 h-6 object-contain" />
                  <span className="text-[11px] leading-tight">Lambang Daerah</span>
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
