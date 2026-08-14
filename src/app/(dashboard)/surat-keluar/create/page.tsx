'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { outgoingLetterSchema, OutgoingLetterFormValues } from '@/features/outgoing-letter/validations';
import { createOutgoingDraft } from '@/features/outgoing-letter/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CreateSuratKeluarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<OutgoingLetterFormValues>({
    resolver: zodResolver(outgoingLetterSchema),
    defaultValues: {
      templateId: '123e4567-e89b-12d3-a456-426614174000', // Mock UUID for testing since we don't fetch masters yet
      jenisSuratId: '123e4567-e89b-12d3-a456-426614174000',
      klasifikasiId: '123e4567-e89b-12d3-a456-426614174000',
      unitKerjaId: '123e4567-e89b-12d3-a456-426614174000',
      penandatanganId: '123e4567-e89b-12d3-a456-426614174000',
    }
  });

  const onSubmit = async (data: OutgoingLetterFormValues) => {
    setLoading(true);
    setError(null);
    const res = await createOutgoingDraft(data);
    
    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else if (res.success && res.data) {
      // Redirect to editor to fill in the actual letter body
      router.push(`/surat-keluar/${res.data.id}/editor`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 pt-6">
      <h2 className="text-2xl font-bold mb-6">Buat Draft Surat Keluar</h2>
      
      {error && <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-lg border shadow-sm">
        
        <div className="space-y-2">
          <Label htmlFor="perihal">Perihal Surat</Label>
          <Input id="perihal" {...register('perihal')} placeholder="Cth: Undangan Rapat Orang Tua" />
          {errors.perihal && <p className="text-xs text-destructive">{errors.perihal.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tujuanSurat">Tujuan (Personal/Nama)</Label>
          <Input id="tujuanSurat" {...register('tujuanSurat')} placeholder="Cth: Bapak/Ibu Wali Murid Kelas X" />
          {errors.tujuanSurat && <p className="text-xs text-destructive">{errors.tujuanSurat.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="catatanTambahan">Catatan Internal (Opsional)</Label>
          <Input id="catatanTambahan" {...register('catatanTambahan')} />
        </div>

        {/* Note: the other UUID fields are mocked in defaultValues for now since building the master data dropdowns would take a lot of code */}
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" type="button" onClick={() => router.back()} disabled={loading}>Batal</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Draft & Edit Konten'}
          </Button>
        </div>
      </form>
    </div>
  );
}
