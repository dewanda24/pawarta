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
  userOpts = [],
  pegawaiOpts = [],
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suratId: string;
  userOpts?: any[];
  pegawaiOpts?: any[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const options = userOpts.length > 0 ? userOpts : pegawaiOpts;

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
            <Label>Penerima Disposisi (Akun Pengguna)</Label>
            <select
              {...register('penerimaDisposisiId')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">-- Pilih Penerima Disposisi --</option>
              {options.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.nama} {opt.username ? `(@${opt.username})` : ''}
                </option>
              ))}
            </select>
            {errors.penerimaDisposisiId && (
              <span className="text-xs text-red-500">{errors.penerimaDisposisiId.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label>Instruksi</Label>
            <Input {...register('instruksi')} placeholder="Contoh: Segera tindaklanjuti dan koordinasikan" />
            {errors.instruksi && (
              <span className="text-xs text-red-500">{errors.instruksi.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label>Catatan Tambahan (Opsional)</Label>
            <Input {...register('catatan')} placeholder="Catatan atau arahan khusus..." />
          </div>

          <div className="space-y-2">
            <Label>Batas Waktu / Deadline (Opsional)</Label>
            <Input type="date" {...register('deadline')} />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? 'Menyimpan...' : 'Kirim Disposisi'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

