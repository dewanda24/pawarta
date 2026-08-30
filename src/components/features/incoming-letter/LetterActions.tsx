'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Pencil, CheckCircle2 } from 'lucide-react';
import { DistributeDialog } from '@/components/features/incoming-letter/DistributeDialog';
import { DispositionDialog } from '@/components/features/incoming-letter/DispositionDialog';

export function LetterActions({
  suratId,
  status,
  pegawaiOpts = [],
  unitKerjaOpts = [],
  userOpts = [],
  canDisposisi = true,
  canDistribusi = true,
  canEdit = true,
}: {
  suratId: string;
  status?: string;
  pegawaiOpts?: any[];
  unitKerjaOpts?: any[];
  userOpts?: any[];
  canDisposisi?: boolean;
  canDistribusi?: boolean;
  canEdit?: boolean;
}) {
  const [distributeOpen, setDistributeOpen] = useState(false);
  const [dispositionOpen, setDispositionOpen] = useState(false);

  const isCompleted = status === 'COMPLETED';

  return (
    <>
      <div className="flex gap-2 items-center">
        {canEdit && (
          <Link href={`/surat-masuk/${suratId}/edit`}>
            <Button variant="outline" size="sm" className="flex items-center gap-1.5 h-9 text-xs">
              <Pencil className="w-3.5 h-3.5" /> Edit Surat
            </Button>
          </Link>
        )}
        {!isCompleted ? (
          <>
            {canDistribusi && (
              <Button
                variant="secondary"
                size="sm"
                className="h-9 text-xs"
                onClick={() => setDistributeOpen(true)}
              >
                Distribusi
              </Button>
            )}
            {canDisposisi && (
              <Button
                size="sm"
                className="h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                onClick={() => setDispositionOpen(true)}
              >
                Buat Lembar Disposisi
              </Button>
            )}
          </>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-md border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Selesai Diproses
          </span>
        )}
      </div>


      <DistributeDialog
        open={distributeOpen}
        onOpenChange={setDistributeOpen}
        suratId={suratId}
        pegawaiOpts={pegawaiOpts}
        unitKerjaOpts={unitKerjaOpts}
      />
      <DispositionDialog
        open={dispositionOpen}
        onOpenChange={setDispositionOpen}
        suratId={suratId}
        userOpts={userOpts}
        pegawaiOpts={pegawaiOpts}
      />
    </>
  );
}

