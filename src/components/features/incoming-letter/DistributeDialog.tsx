'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { distributeLetterSchema, DistributeLetterFormValues } from '@/features/incoming-letter/validations';
import { distributeIncomingLetter } from '@/features/incoming-letter/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export function DistributeDialog({
  open,
  onOpenChange,
  suratId,
  pegawaiOpts = [],
  unitKerjaOpts = [],
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suratId: string;
  pegawaiOpts: any[];
  unitKerjaOpts: any[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DistributeLetterFormValues>({
    resolver: zodResolver(distributeLetterSchema),
  });

  const onSubmit = async (data: DistributeLetterFormValues) => {
    setLoading(true);
    const result = await distributeIncomingLetter(suratId, data);
    setLoading(false);

    if (result.success) {
      toast.success('Surat berhasil didistribusikan');
      reset();
      onOpenChange(false);
      router.refresh();
    } else {
      toast.error(result.error || 'Gagal mendistribusikan surat');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Distribusi Surat</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Tujuan Pegawai (Opsional)</Label>
            <select
              {...register('tujuanPegawaiId')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">-- Pilih Pegawai --</option>
              {pegawaiOpts.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.nama}
                </option>
              ))}
            </select>
            {errors.tujuanPegawaiId && <span className="text-xs text-red-500">{errors.tujuanPegawaiId.message}</span>}
          </div>

          <div className="space-y-2">
            <Label>Tujuan Unit Kerja (Opsional)</Label>
            <select
              {...register('tujuanUnitId')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">-- Pilih Unit Kerja --</option>
              {unitKerjaOpts.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.nama}
                </option>
              ))}
            </select>
            {errors.tujuanUnitId && <span className="text-xs text-red-500">{errors.tujuanUnitId.message}</span>}
          </div>

          <div className="space-y-2">
            <Label>Catatan Pengiriman</Label>
            <Input {...register('catatan')} placeholder="Tambahkan catatan jika perlu" />
          </div>

          <div className="space-y-2">
            <Label>Deadline (Opsional)</Label>
            <Input type="date" {...register('deadline')} />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Kirim'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
