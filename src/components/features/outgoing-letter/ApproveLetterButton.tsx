'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Loader2,
  Printer,
  Send,
  SearchCheck,
  PenTool,
  RotateCcw,
} from 'lucide-react';
import {
  approveSuratKeluar,
  submitSuratKeluarForReview,
  verifySuratKeluar,
  requestRevisionSuratKeluar,
} from '@/features/surat-keluar/actions/surat';
import { toast } from 'sonner';

export function ApproveLetterButton({ suratId, status }: { suratId: string; status: string }) {
  const [loading, setLoading] = useState(false);
  const [revisionPrompt, setRevisionPrompt] = useState(false);
  const [revisionNote, setRevisionNote] = useState('');

  const normalizedStatus = (status || 'DRAFT').toUpperCase();

  const handleSubmitForReview = async () => {
    setLoading(true);
    try {
      const res = await submitSuratKeluarForReview(suratId);
      if (res.success) {
        toast.success('Naskah dinas berhasil diajukan untuk verifikasi KTU!');
      } else {
        toast.error(res.error || 'Gagal mengajukan naskah');
      }
    } catch {
      toast.error('Terjadi kesalahan saat mengajukan naskah');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyKTU = async () => {
    setLoading(true);
    try {
      const res = await verifySuratKeluar(suratId);
      if (res.success) {
        toast.success('Redaksi disetujui KTU! Diteruskan ke Kepala Sekolah untuk TTE.');
      } else {
        toast.error(res.error || 'Gagal memverifikasi naskah');
      }
    } catch {
      toast.error('Terjadi kesalahan saat verifikasi naskah');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAndSign = async () => {
    setLoading(true);
    try {
      const res = await approveSuratKeluar(suratId);
      if (res.success) {
        toast.success(`Surat berhasil ditandatangani & diterbitkan! No: ${res.nomorSurat}`);
      } else {
        toast.error(res.error || 'Gagal menyetujui surat');
      }
    } catch {
      toast.error('Terjadi kesalahan saat menandatangani surat');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionNote.trim()) {
      toast.error('Tuliskan catatan revisi terlebih dahulu');
      return;
    }
    setLoading(true);
    try {
      const res = await requestRevisionSuratKeluar(suratId, revisionNote);
      if (res.success) {
        toast.success('Permintaan revisi berhasil dikirim ke konseptor');
        setRevisionPrompt(false);
        setRevisionNote('');
      } else {
        toast.error(res.error || 'Gagal mengirim revisi');
      }
    } catch {
      toast.error('Terjadi kesalahan saat mengirim revisi');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* 1. DRAFT atau REVISI -> Ajukan */}
      {(normalizedStatus === 'DRAFT' || normalizedStatus === 'REVISI') && (
        <Button
          onClick={handleSubmitForReview}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          Ajukan Verifikasi KTU
        </Button>
      )}

      {/* 2. DIAJUKAN -> Verifikasi KTU atau Minta Revisi */}
      {normalizedStatus === 'DIAJUKAN' && (
        <>
          <Button
            onClick={handleVerifyKTU}
            disabled={loading}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <SearchCheck className="w-3.5 h-3.5" />
            )}
            Verifikasi Redaksi KTU
          </Button>
          <Button
            variant="outline"
            onClick={() => setRevisionPrompt(true)}
            disabled={loading}
            className="text-xs border-amber-300 text-amber-800 hover:bg-amber-50 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Minta Revisi
          </Button>
        </>
      )}

      {/* 3. DIPERIKSA -> TTE Kepala Sekolah */}
      {normalizedStatus === 'DIPERIKSA' && (
        <>
          <Button
            onClick={handleApproveAndSign}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <PenTool className="w-3.5 h-3.5" />
            )}
            Tanda Tangan Elektronik (TTE) & Terbitkan
          </Button>
          <Button
            variant="outline"
            onClick={() => setRevisionPrompt(true)}
            disabled={loading}
            className="text-xs border-red-300 text-red-700 hover:bg-red-50 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Kembalikan
          </Button>
        </>
      )}

      {/* 4. APPROVED / PUBLISHED -> Cetak */}
      {(normalizedStatus === 'APPROVED' ||
        normalizedStatus === 'PUBLISHED' ||
        normalizedStatus === 'SIGNED') && (
        <Button
          onClick={handlePrint}
          variant="outline"
          className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold flex items-center gap-1.5 shadow-xs"
        >
          <Printer className="w-3.5 h-3.5" /> Cetak Lembar Surat
        </Button>
      )}

      {/* Modal Dialog Input Catatan Revisi */}
      {revisionPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-xl border border-gray-200">
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-600" /> Catatan Revisi Naskah
            </h3>
            <textarea
              value={revisionNote}
              onChange={(e) => setRevisionNote(e.target.value)}
              placeholder="Contoh: Perbaiki format penomoran lampiran atau tanggal pelaksanaan acara..."
              className="w-full h-24 text-xs p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRevisionPrompt(false)}
                disabled={loading}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                size="sm"
                onClick={handleRequestRevision}
                disabled={loading}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Kirim Catatan Revisi'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

