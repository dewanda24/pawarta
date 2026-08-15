'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { dispositionLetterSchema, DispositionLetterFormValues } from '@/features/incoming-letter/validations';
import { createInitialDisposition } from '@/features/incoming-letter/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export function DispositionDialog({
  open,
  onOpenChange,
  suratId,
  pegawaiOpts = [],
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suratId: string;
  pegawaiOpts: any[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DispositionLetterFormValues>({
    resolver: zodResolver(dispositionLetterSchema),
  });

  const onSubmit = async (data: DispositionLetterFormValues) => {
    setLoading(true);
    const result = await createInitialDisposition(suratId, data);
    setLoading(false);

    if (result.success) {
      toast.success('Disposisi berhasil dibuat');
      reset();
      onOpenChange(false);
      router.refresh();
    } else {
      toast.error(result.error || 'Gagal membuat disposisi');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Disposisi Surat</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Penerima Disposisi</Label>
            <select
              {...register('penerimaDisposisiId')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">-- Pilih Pegawai --</option>
              {pegawaiOpts.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.nama}
                </option>
              ))}
            </select>
            {errors.penerimaDisposisiId && <span className="text-xs text-red-500">{errors.penerimaDisposisiId.message}</span>}
          </div>

          <div className="space-y-2">
            <Label>Instruksi</Label>
            <Input {...register('instruksi')} placeholder="Contoh: Segera tindaklanjuti" />
            {errors.instruksi && <span className="text-xs text-red-500">{errors.instruksi.message}</span>}
          </div>

          <div className="space-y-2">
            <Label>Catatan Tambahan (Opsional)</Label>
            <Input {...register('catatan')} />
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
