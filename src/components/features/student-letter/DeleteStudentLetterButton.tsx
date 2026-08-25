'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { deleteStudentLetter } from '@/features/student-letter/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function DeleteStudentLetterButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await deleteStudentLetter(id);
      if (res.success) {
        toast.success('Surat kesiswaan berhasil dihapus');
        setOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || 'Gagal menghapus surat');
      }
    } catch {
      toast.error('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant='ghost'
        size='sm'
        className='h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50'
        onClick={() => setOpen(true)}
      >
        <Trash2 className='w-3.5 h-3.5' />
      </Button>
      <DeleteConfirmDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={handleDelete}
        isDeleting={loading}
      />
    </>
  );
}