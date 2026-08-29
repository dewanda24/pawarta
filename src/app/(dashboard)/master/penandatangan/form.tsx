'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { createPenandatangan, updatePenandatangan } from '@/features/master-data/actions/penandatangan';
import { getPegawaiList } from '@/features/master-data/actions/pegawai';
import { UserCheck, Shield, Key, PenTool, CheckCircle2 } from 'lucide-react';

const formSchema = z.object({
  pegawaiId: z.string().uuid('Silakan pilih pegawai'),
  jabatanDokumen: z.string().min(1, 'Jabatan pada naskah dinas wajib diisi'),
  nipLabel: z.string().optional().nullable(),
  jenisTtd: z.enum(['DIGITAL_LOCAL', 'BSRE_TTE', 'MANUAL']),
  ttdDigitalUrl: z.string().optional().nullable(),
  spesimenUrl: z.string().optional().nullable(),
  masaBerlakuMulai: z.string().optional().nullable(),
  masaBerlakuSelesai: z.string().optional().nullable(),
  isAktif: z.boolean(),
});

export type PenandatanganFormValues = z.infer<typeof formSchema>;

interface PenandatanganFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
}

export function PenandatanganForm({ open, onOpenChange, initialData }: PenandatanganFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pegawaiList, setPegawaiList] = useState<any[]>([]);
  const [loadingPegawai, setLoadingPegawai] = useState(false);

  const form = useForm<PenandatanganFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pegawaiId: '',
      jabatanDokumen: 'Kepala Sekolah',
      nipLabel: '',
      jenisTtd: 'DIGITAL_LOCAL',
      ttdDigitalUrl: '',
      spesimenUrl: '',
      masaBerlakuMulai: '',
      masaBerlakuSelesai: '',
      isAktif: true,
    },
  });

  const selectedPegawaiId = form.watch('pegawaiId');

  const selectedPegawai = useMemo(() => {
    return pegawaiList.find((p) => p.id === selectedPegawaiId) || initialData?.pegawai || null;
  }, [pegawaiList, selectedPegawaiId, initialData]);

  useEffect(() => {
    async function loadPegawai() {
      setLoadingPegawai(true);
      try {
        const res = await getPegawaiList({ limit: 500 });
        if (res.success && res.data) {
          setPegawaiList(res.data);
        }
      } catch (err) {
        console.error('Failed to load pegawai list', err);
      } finally {
        setLoadingPegawai(false);
      }
    }
    if (open) {
      loadPegawai();
    }
  }, [open]);

  useEffect(() => {
    if (initialData && open) {
      form.reset({
        pegawaiId: initialData.pegawaiId || initialData.pegawai?.id || '',
        jabatanDokumen: initialData.jabatanDokumen || initialData.jabatan?.nama || 'Kepala Sekolah',
        nipLabel: initialData.nipLabel || (initialData.pegawai?.nip ? `NIP. ${initialData.pegawai.nip}` : ''),
        jenisTtd: initialData.jenisTtd || 'DIGITAL_LOCAL',
        ttdDigitalUrl: initialData.ttdDigitalUrl || '',
        spesimenUrl: initialData.spesimenUrl || '',
        masaBerlakuMulai: initialData.masaBerlakuMulai || '',
        masaBerlakuSelesai: initialData.masaBerlakuSelesai || '',
        isAktif: initialData.isAktif ?? true,
      });
    } else if (!open) {
      form.reset({
        pegawaiId: '',
        jabatanDokumen: 'Kepala Sekolah',
        nipLabel: '',
        jenisTtd: 'DIGITAL_LOCAL',
        ttdDigitalUrl: '',
        spesimenUrl: '',
        masaBerlakuMulai: '',
        masaBerlakuSelesai: '',
        isAktif: true,
      });
    }
  }, [initialData, open, form]);

  // When a pegawai is chosen in create mode, auto-fill default values
  const handlePegawaiSelect = (pegawaiId: string) => {
    form.setValue('pegawaiId', pegawaiId, { shouldValidate: true });
    const peg = pegawaiList.find((p) => p.id === pegawaiId);
    if (peg) {
      if (!form.getValues('nipLabel') && peg.nip) {
        form.setValue('nipLabel', `NIP. ${peg.nip}`);
      }
      if (!initialData && peg.jabatan?.nama) {
        form.setValue('jabatanDokumen', peg.jabatan.nama);
      }
    }
  };

  const onSubmit = async (data: PenandatanganFormValues) => {
    setIsSubmitting(true);
    try {
      const targetPegawai = selectedPegawai || pegawaiList.find((p) => p.id === data.pegawaiId);
      const payload: any = {
        pegawaiId: data.pegawaiId,
        jabatanId: targetPegawai?.jabatanId || null,
        jabatanDokumen: data.jabatanDokumen,
        nipLabel: data.nipLabel || (targetPegawai?.nip ? `NIP. ${targetPegawai.nip}` : null),
        jenisTtd: data.jenisTtd,
        ttdDigitalUrl: data.ttdDigitalUrl || null,
        spesimenUrl: data.spesimenUrl || null,
        masaBerlakuMulai: data.masaBerlakuMulai || null,
        masaBerlakuSelesai: data.masaBerlakuSelesai || null,
        isAktif: data.isAktif,
      };

      const result = initialData?.id
        ? await updatePenandatangan(initialData.id, payload)
        : await createPenandatangan(payload);

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
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                {initialData ? 'Edit' : 'Tambah'} Pejabat Penandatangan
              </DialogTitle>
              <p className="text-xs text-gray-500 mt-0.5">
                Konfigurasi wewenang tanda tangan naskah dinas & verifikasi TTE (Single Source of Truth: Master Pegawai)
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-3">
          {/* 1. Pilih Pegawai */}
          <div className="space-y-2">
            <Label htmlFor="pegawaiId" className="text-xs font-semibold">
              Pilih Pegawai (Single Source of Truth) <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.watch('pegawaiId')}
              onValueChange={handlePegawaiSelect}
              disabled={loadingPegawai}
            >
              <SelectTrigger id="pegawaiId" className="h-10 text-sm">
                <SelectValue placeholder={loadingPegawai ? 'Memuat daftar pegawai...' : 'Pilih Pegawai dari Master'} />
              </SelectTrigger>
              <SelectContent>
                {pegawaiList.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nama} {p.nip ? `(NIP: ${p.nip})` : ''} — {p.jabatan?.nama || 'Pegawai'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.pegawaiId && (
              <p className="text-xs text-red-500">{form.formState.errors.pegawaiId.message}</p>
            )}
          </div>

          {/* 2. Read-Only Pegawai Profile Card */}
          {selectedPegawai && (
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-blue-200/60 pb-2">
                <span className="font-semibold text-blue-900 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-blue-700" /> Profil Pegawai Terpilih (Read-Only)
                </span>
                <span className="bg-blue-200/70 text-blue-800 px-2 py-0.5 rounded text-[11px] font-medium">
                  {selectedPegawai.statusAsn || 'ASN / PTK'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-gray-700">
                <div>
                  <span className="text-gray-500 block text-[10px]">Nama Lengkap:</span>
                  <p className="font-bold text-gray-900">{selectedPegawai.nama}</p>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px]">NIP:</span>
                  <p className="font-mono text-gray-900">{selectedPegawai.nip || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px]">Jabatan Struktural / Fungsional:</span>
                  <p className="font-medium text-gray-900">{selectedPegawai.jabatan?.nama || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px]">Pangkat / Golongan:</span>
                  <p className="font-medium text-gray-900">{selectedPegawai.pangkatGolongan || '-'}</p>
                </div>
              </div>
            </div>
          )}

          {/* 3. Konfigurasi Penandatangan Dokumen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="jabatanDokumen" className="text-xs font-semibold">
                Jabatan pada Dokumen <span className="text-red-500">*</span>
              </Label>
              <Input
                id="jabatanDokumen"
                {...form.register('jabatanDokumen')}
                placeholder="Contoh: Kepala Sekolah / Plt. Kepala Sekolah"
                className="text-xs h-9"
              />
              {form.formState.errors.jabatanDokumen && (
                <p className="text-xs text-red-500">{form.formState.errors.jabatanDokumen.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nipLabel" className="text-xs font-semibold">
                Format Teks NIP Cetak
              </Label>
              <Input
                id="nipLabel"
                {...form.register('nipLabel')}
                placeholder="Contoh: NIP. 19780101 200501 1 001"
                className="text-xs h-9 font-mono"
              />
            </div>
          </div>

          {/* 4. Mekanisme TTE & Keabsahan */}
          <div className="space-y-1.5 pt-1">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-600" /> Jenis / Mekanisme Tanda Tangan
            </Label>
            <Select
              value={form.watch('jenisTtd')}
              onValueChange={(val: any) => form.setValue('jenisTtd', val)}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Pilih Jenis TTD" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DIGITAL_LOCAL">
                  QR Code Verifikasi & TTE Digital Internal (PAWARTA Integrity Hash)
                </SelectItem>
                <SelectItem value="BSRE_TTE">
                  Integrasi Sertifikat Elektronik BSrE / BSSN
                </SelectItem>
                <SelectItem value="MANUAL">
                  Tanda Tangan Basah / Manual Stamp
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 5. Periode Masa Berlaku */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="masaBerlakuMulai" className="text-xs font-semibold">
                Masa Berlaku Mulai
              </Label>
              <Input
                id="masaBerlakuMulai"
                {...form.register('masaBerlakuMulai')}
                placeholder="Contoh: 2026-01-01 atau 2026"
                className="text-xs h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="masaBerlakuSelesai" className="text-xs font-semibold">
                Masa Berlaku Selesai
              </Label>
              <Input
                id="masaBerlakuSelesai"
                {...form.register('masaBerlakuSelesai')}
                placeholder="Contoh: 2028-12-31 atau Tetap"
                className="text-xs h-9"
              />
            </div>
          </div>

          {/* 6. Status Keaktifan */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isAktif"
              checked={form.watch('isAktif')}
              onChange={(e) => form.setValue('isAktif', e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
            />
            <Label htmlFor="isAktif" className="text-xs font-medium cursor-pointer text-gray-800">
              Penandatangan Aktif & Sah Digunakan pada Naskah Dinas
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="bg-blue-700 hover:bg-blue-800">
              {isSubmitting ? 'Menyimpan...' : 'Simpan Penandatangan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
