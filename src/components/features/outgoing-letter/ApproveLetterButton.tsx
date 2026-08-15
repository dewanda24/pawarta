'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, Printer } from 'lucide-react';
import { approveSuratKeluar } from '@/features/surat-keluar/actions/surat';
import { toast } from 'sonner';

export function ApproveLetterButton({ suratId, status }: { suratId: string; status: string }) {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const res = await approveSuratKeluar(suratId);
      if (res.success) {
        toast.success(`Surat berhasil disetujui! No. Surat: ${res.nomorSurat}`);
      } else {
        toast.error(res.error || 'Gagal menyetujui surat');
      }
    } catch {
      toast.error('Terjadi kesalahan saat menyetujui surat');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex items-center gap-2">
      {status !== 'APPROVED' && status !== 'PUBLISHED' && (
        <Button
          onClick={handleApprove}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-2 shadow-xs"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          Setujui & Terbitkan Nomor
        </Button>
      )}

      {(status === 'APPROVED' || status === 'PUBLISHED') && (
        <Button
          onClick={handlePrint}
          variant="outline"
          className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 flex items-center gap-2"
        >
          <Printer className="w-4 h-4" /> Cetak Lembar Surat
        </Button>
      )}
    </div>
  );
}
