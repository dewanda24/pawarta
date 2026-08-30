'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { saveKonfigurasiSistem, KonfigurasiSistemInput } from '@/features/system/actions';
import { SlidersHorizontal, Loader2, Save, FileText, Globe, Clock, CheckCircle2 } from 'lucide-react';

export function KonfigurasiClient({ initialData }: { initialData: KonfigurasiSistemInput | null }) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
  } = useForm<KonfigurasiSistemInput>({
    defaultValues: {
      prefixNomorSurat: initialData?.prefixNomorSurat || '421.2',
      formatNomor: initialData?.formatNomor || '{klasifikasi}/{urut}-{unit}/{bulan_romawi}/{tahun}',
      tahunAktif: initialData?.tahunAktif || new Date().getFullYear().toString(),
      bahasa: initialData?.bahasa || 'id-ID',
      zonaWaktu: initialData?.zonaWaktu || 'Asia/Jakarta',
      formatTanggal: initialData?.formatTanggal || 'DD MMMM YYYY',
      formatPdf: initialData?.formatPdf || 'F4',
      marginCetak: initialData?.marginCetak || '2.5cm 2.0cm 2.5cm 3.0cm',
    },
  });

  const onSubmit = async (data: KonfigurasiSistemInput) => {
    setLoading(true);
    try {
      const res = await saveKonfigurasiSistem(data);
      if (res.success) {
        toast.success('Konfigurasi sistem berhasil diperbarui!');
      } else {
        toast.error(res.error || 'Gagal menyimpan konfigurasi');
      }
    } catch {
      toast.error('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 1. Pengaturan Standar Naskah Dinas */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Standar Naskah Dinas (Perbup Sumedang No. 9/2026)</h2>
            <p className="text-[11px] text-gray-500">Format kertas, margin pencetakan arsip, dan penomoran</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">Ukuran Kertas Standar</Label>
            <select
              {...register('formatPdf')}
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium"
            >
              <option value="F4">HVS F4 / Folio (215 x 330 mm) - Standar Resmi</option>
              <option value="A4">A4 (210 x 297 mm)</option>
              <option value="LETTER">Letter (216 x 279 mm)</option>
            </select>
            <p className="text-[11px] text-emerald-700 font-medium">✓ Sesuai regulasi tata naskah dinas Kabupaten Sumedang</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">Margin Cetak (Atas Kanan Bawah Kiri)</Label>
            <Input
              {...register('marginCetak')}
              placeholder="2.5cm 2.0cm 2.5cm 3.0cm"
              className="text-xs font-mono"
            />
            <p className="text-[11px] text-gray-500">Margin kiri 3.0 cm disediakan khusus ruang penomoran & jilid arsip</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">Prefix / Kode Urusan Default</Label>
            <Input
              {...register('prefixNomorSurat')}
              placeholder="421.2"
              className="text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">Format Penomoran Surat</Label>
            <Input
              {...register('formatNomor')}
              placeholder="{klasifikasi}/{urut}-{unit}/{bulan_romawi}/{tahun}"
              className="text-xs font-mono"
            />
          </div>
        </div>
      </div>

      {/* 2. Pengaturan Lokalisasi & Regional */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Lokalisasi & Kalender Kerja</h2>
            <p className="text-[11px] text-gray-500">Zona waktu, bahasa antarmuka, dan tahun ajaran aktif</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">Tahun Ajaran / Kalender Aktif</Label>
            <Input
              {...register('tahunAktif')}
              placeholder="2026/2027"
              className="text-xs font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">Zona Waktu (Timezone)</Label>
            <select
              {...register('zonaWaktu')}
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium"
            >
              <option value="Asia/Jakarta">WIB - Asia/Jakarta (GMT+7)</option>
              <option value="Asia/Makassar">WITA - Asia/Makassar (GMT+8)</option>
              <option value="Asia/Jayapura">WIT - Asia/Jayapura (GMT+9)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">Bahasa Sistem</Label>
            <select
              {...register('bahasa')}
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium"
            >
              <option value="id-ID">Bahasa Indonesia (Resmi)</option>
              <option value="en-US">English (US)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 h-10 shadow-xs flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Simpan Perubahan Konfigurasi
        </Button>
      </div>
    </form>
  );
}
