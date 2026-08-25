'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  FileText,
  FileSpreadsheet,
  FileImage,
  File as FileIcon,
  Upload,
  Trash2,
  Eye,
  Download,
  Loader2,
  Plus,
  Paperclip,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { deleteIncomingAttachment } from '@/features/incoming-letter/actions';
import { deleteOutgoingAttachment } from '@/features/surat-keluar/actions/surat';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';

export interface AttachmentItem {
  id: string;
  namaFile: string;
  fileUrl: string;
  tipeMime?: string | null;
  ukuranBytes?: number | null;
  deskripsi?: string | null;
  createdAt?: Date | string | null;
}

interface AttachmentSectionProps {
  suratId: string;
  tipeSurat: 'INCOMING' | 'OUTGOING';
  attachments: AttachmentItem[];
}

export function AttachmentSection({
  suratId,
  tipeSurat,
  attachments = [],
}: AttachmentSectionProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deskripsi, setDeskripsi] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (mime?: string | null, name?: string) => {
    if (mime?.includes('pdf') || name?.endsWith('.pdf')) {
      return <FileText className='w-6 h-6 text-red-500' />;
    }
    if (mime?.includes('image') || name?.match(/\.(jpg|jpeg|png|webp)$/i)) {
      return <FileImage className='w-6 h-6 text-blue-500' />;
    }
    if (mime?.includes('sheet') || mime?.includes('excel') || name?.match(/\.(xls|xlsx|csv)$/i)) {
      return <FileSpreadsheet className='w-6 h-6 text-emerald-500' />;
    }
    return <FileIcon className='w-6 h-6 text-gray-500' />;
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Silakan pilih berkas terlebih dahulu');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('suratId', suratId);
      formData.append('tipeSurat', tipeSurat);
      if (deskripsi) formData.append('deskripsi', deskripsi);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success('Berkas lampiran berhasil diunggah');
        setSelectedFile(null);
        setDeskripsi('');
        setIsUploadOpen(false);
        router.refresh();
      } else {
        toast.error(json.error || 'Gagal mengunggah berkas');
      }
    } catch {
      toast.error('Terjadi kesalahan saat mengunggah');
    } finally {
      setIsUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res =
        tipeSurat === 'INCOMING'
          ? await deleteIncomingAttachment(deleteId)
          : await deleteOutgoingAttachment(deleteId);

      if (res.success) {
        toast.success('Lampiran berhasil dihapus');
        setDeleteId(null);
        router.refresh();
      } else {
        toast.error(res.error || 'Gagal menghapus lampiran');
      }
    } catch {
      toast.error('Gagal menghapus lampiran');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className='rounded-xl border border-gray-200 bg-white p-6 shadow-xs space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Paperclip className='w-5 h-5 text-gray-700' />
          <h2 className='text-base font-bold text-gray-900'>Berkas Lampiran & Scan Fisik</h2>
          <span className='text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-semibold'>
            {attachments.length} Berkas
          </span>
        </div>
        <Button
          size='sm'
          onClick={() => setIsUploadOpen(true)}
          className='flex items-center gap-1.5 text-xs h-8 bg-blue-700 hover:bg-blue-800'
        >
          <Plus className='w-3.5 h-3.5' /> Upload Lampiran
        </Button>
      </div>

      {attachments.length === 0 ? (
        <div className='text-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50'>
          <Upload className='w-8 h-8 text-gray-400 mx-auto mb-2 opacity-50' />
          <p className='text-xs font-semibold text-gray-700'>Belum ada berkas lampiran</p>
          <p className='text-[11px] text-gray-500 mt-0.5'>
            Unggah berkas PDF, scan dokumen fisik, atau foto surat pendukung di sini.
          </p>
        </div>
      ) : (
        <div className='space-y-2'>
          {attachments.map((file) => (
            <div
              key={file.id}
              className='flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/60 hover:bg-gray-50 transition-colors'
            >
              <div className='flex items-center gap-3 min-w-0 pr-2'>
                <div className='p-2 bg-white rounded-lg border border-gray-200 shrink-0 shadow-xs'>
                  {getFileIcon(file.tipeMime, file.namaFile)}
                </div>
                <div className='min-w-0'>
                  <p className='text-xs font-semibold text-gray-900 truncate' title={file.namaFile}>
                    {file.namaFile}
                  </p>
                  <p className='text-[11px] text-gray-500 mt-0.5 flex items-center gap-2'>
                    <span>{formatFileSize(file.ukuranBytes)}</span>
                    {file.deskripsi && (
                      <>
                        <span>•</span>
                        <span className='italic text-gray-600 truncate'>{file.deskripsi}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-1 shrink-0'>
                <a
                  href={file.fileUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex'
                >
                  <Button
                    variant='outline'
                    size='sm'
                    className='h-7 px-2.5 text-xs flex items-center gap-1'
                  >
                    <Eye className='w-3 h-3' /> Buka
                  </Button>
                </a>
                <a href={file.fileUrl} download={file.namaFile} className='inline-flex'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-7 px-2 text-gray-600 hover:text-gray-900'
                    title='Download'
                  >
                    <Download className='w-3.5 h-3.5' />
                  </Button>
                </a>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setDeleteId(file.id)}
                  className='h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50'
                  title='Hapus'
                >
                  <Trash2 className='w-3.5 h-3.5' />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className='sm:max-w-[480px]'>
          <DialogHeader>
            <DialogTitle>Unggah Berkas Lampiran</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpload} className='space-y-4 py-2'>
            <div className='space-y-2'>
              <Label>Pilih Berkas (PDF, Dokumen, atau Gambar)</Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className='border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer bg-gray-50/50 hover:bg-blue-50/30 transition-all'
              >
                <input
                  ref={fileInputRef}
                  type='file'
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className='hidden'
                  accept='.pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx'
                />
                <Upload className='w-8 h-8 text-blue-600 mx-auto mb-2' />
                {selectedFile ? (
                  <div>
                    <p className='text-xs font-semibold text-blue-700 truncate max-w-xs mx-auto'>
                      {selectedFile.name}
                    </p>
                    <p className='text-[11px] text-gray-500 mt-0.5'>
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className='text-xs font-semibold text-gray-700'>
                      Klik untuk memilih berkas dari komputer
                    </p>
                    <p className='text-[10px] text-gray-400 mt-1'>
                      Mendukung PDF, Scan JPG/PNG, DOCX (Maksimal 20MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='deskripsi'>Keterangan Lampiran (Opsional)</Label>
              <Input
                id='deskripsi'
                placeholder='Contoh: Scan Surat Fisik Asli, Proposal Kegiatan, dll'
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                className='text-xs'
              />
            </div>

            <DialogFooter className='pt-2'>
              <Button
                type='button'
                variant='outline'
                disabled={isUploading}
                onClick={() => setIsUploadOpen(false)}
              >
                Batal
              </Button>
              <Button
                type='submit'
                disabled={!selectedFile || isUploading}
                className='bg-blue-700 hover:bg-blue-800'
              >
                {isUploading ? (
                  <>
                    <Loader2 className='w-3.5 h-3.5 animate-spin mr-1.5' /> Mengunggah...
                  </>
                ) : (
                  'Unggah Sekarang'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
