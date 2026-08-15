'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

export function PrintButton({
  label = 'Cetak Lembar Surat',
  className = '',
}: {
  label?: string;
  className?: string;
}) {
  return (
    <Button
      onClick={() => window.print()}
      className={`bg-blue-700 hover:bg-blue-800 text-white flex items-center gap-2 text-xs h-9 ${className}`}
    >
      <Printer className="w-4 h-4" /> {label}
    </Button>
  );
}
