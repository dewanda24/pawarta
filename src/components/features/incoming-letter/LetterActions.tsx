'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { DistributeDialog } from '@/components/features/incoming-letter/DistributeDialog';
import { DispositionDialog } from '@/components/features/incoming-letter/DispositionDialog';

export function LetterActions({
  suratId,
  pegawaiOpts,
  unitKerjaOpts,
}: {
  suratId: string;
  pegawaiOpts: any[];
  unitKerjaOpts: any[];
}) {
  const [distributeOpen, setDistributeOpen] = useState(false);
  const [dispositionOpen, setDispositionOpen] = useState(false);

  return (
    <>
      <div className="flex gap-2">
        <Link href={`/surat-masuk/${suratId}/edit`}>
          <Button variant="outline" className="flex items-center gap-1.5">
            <Pencil className="w-3.5 h-3.5" /> Edit Surat
          </Button>
        </Link>
        <Button variant="secondary" onClick={() => setDistributeOpen(true)}>
          Distribusi
        </Button>
        <Button onClick={() => setDispositionOpen(true)}>
          Disposisi
        </Button>
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
        pegawaiOpts={pegawaiOpts}
      />
    </>
  );
}
