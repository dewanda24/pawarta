'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  incomingLetterSchema,
  IncomingLetterFormValues,
} from '@/features/incoming-letter/validations';
import { registerIncomingLetter } from '@/features/incoming-letter/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function IncomingLetterForm({
  jenisSuratOpts = [],
  klasifikasiOpts = [],
  prioritasOpts = [],
  sifatOpts = [],
  instansiOpts = [],
}: unknown) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IncomingLetterFormValues>({
    resolver: zodResolver(incomingLetterSchema),
    defaultValues: {
      tanggalSurat: new Date().toISOString().split('T')[0],
      tanggalDiterima: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: IncomingLetterFormValues) => {
    setLoading(true);
    setError(null);
    const result = await registerIncomingLetter(data);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      router.push('/surat-masuk');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && <div className="p-3 bg-red-100 text-red-600 rounded">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nomorSurat">Nomor Surat</Label>
          <Input id="nomorSurat" {...register('nomorSurat')} />
          {errors.nomorSurat && (
            <span className="text-sm text-red-500">{errors.nomorSurat.message}</span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="pengirim">Pengirim (Nama)</Label>
          <Input id="pengirim" {...register('pengirim')} />
          {errors.pengirim && (
            <span className="text-sm text-red-500">{errors.pengirim.message}</span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="instansiPengirimId">Instansi Pengirim (Opsional)</Label>
          <select
            id="instansiPengirimId"
            {...register('instansiPengirimId')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">-- Pilih Instansi --</option>
            {instansiOpts.map((opt: unknown) => (
              <option key={opt.id} value={opt.id}>
                {opt.nama}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tanggalSurat">Tanggal Surat</Label>
          <Input id="tanggalSurat" type="date" {...register('tanggalSurat')} />
          {errors.tanggalSurat && (
            <span className="text-sm text-red-500">{errors.tanggalSurat.message}</span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tanggalDiterima">Tanggal Diterima</Label>
          <Input id="tanggalDiterima" type="date" {...register('tanggalDiterima')} />
          {errors.tanggalDiterima && (
            <span className="text-sm text-red-500">{errors.tanggalDiterima.message}</span>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="perihal">Perihal</Label>
          <Input id="perihal" {...register('perihal')} />
          {errors.perihal && <span className="text-sm text-red-500">{errors.perihal.message}</span>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="ringkasanIsi">Ringkasan Isi</Label>
          <textarea
            id="ringkasanIsi"
            {...register('ringkasanIsi')}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="jenisSuratId">Jenis Surat</Label>
          <select
            id="jenisSuratId"
            {...register('jenisSuratId')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          >
            <option value="">-- Pilih Jenis --</option>
            {jenisSuratOpts.map((opt: unknown) => (
              <option key={opt.id} value={opt.id}>
                {opt.nama}
              </option>
            ))}
          </select>
          {errors.jenisSuratId && (
            <span className="text-sm text-red-500">{errors.jenisSuratId.message}</span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="klasifikasiId">Klasifikasi</Label>
          <select
            id="klasifikasiId"
            {...register('klasifikasiId')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          >
            <option value="">-- Pilih Klasifikasi --</option>
            {klasifikasiOpts.map((opt: unknown) => (
              <option key={opt.id} value={opt.id}>
                {opt.kode} - {opt.nama}
              </option>
            ))}
          </select>
          {errors.klasifikasiId && (
            <span className="text-sm text-red-500">{errors.klasifikasiId.message}</span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="prioritasId">Prioritas</Label>
          <select
            id="prioritasId"
            {...register('prioritasId')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          >
            <option value="">-- Pilih Prioritas --</option>
            {prioritasOpts.map((opt: unknown) => (
              <option key={opt.id} value={opt.id}>
                {opt.nama}
              </option>
            ))}
          </select>
          {errors.prioritasId && (
            <span className="text-sm text-red-500">{errors.prioritasId.message}</span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sifatSuratId">Sifat Surat</Label>
          <select
            id="sifatSuratId"
            {...register('sifatSuratId')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          >
            <option value="">-- Pilih Sifat --</option>
            {sifatOpts.map((opt: unknown) => (
              <option key={opt.id} value={opt.id}>
                {opt.nama}
              </option>
            ))}
          </select>
          {errors.sifatSuratId && (
            <span className="text-sm text-red-500">{errors.sifatSuratId.message}</span>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="catatan">Catatan</Label>
          <Input id="catatan" {...register('catatan')} />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Batal
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Menyimpan...' : 'Registrasi Surat'}
        </Button>
      </div>
    </form>
  );
}
