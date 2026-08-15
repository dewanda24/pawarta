'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
