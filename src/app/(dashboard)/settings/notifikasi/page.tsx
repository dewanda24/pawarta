'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  MessageSquare,
  Mail,
  Send,
  Plus,
  Trash2,
  Pencil,
  CheckCircle2,
  Radio,
  History,
  Check,
  Star,
  RefreshCw,
} from 'lucide-react';
import {
  getNotificationChannels,
  saveNotificationChannel,
  deleteNotificationChannel,
  sendTestMessage,
  getNotificationLogs,
  ChannelInput,
} from '@/features/system/actions/notifications-gateway';
import { toast } from 'sonner';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';

export default function NotificationSettingsPage() {
  const [activeTab, setActiveTab] = useState<'channels' | 'logs'>('channels');
  const [channels, setChannels] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Channel Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nama, setNama] = useState('');
  const [tipe, setTipe] = useState('WHATSAPP');
  const [provider, setProvider] = useState('FONNTE');
  const [apiKey, setApiKey] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isAktif, setIsAktif] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Test Message Modal
  const [testChannelId, setTestChannelId] = useState<string | null>(null);
  const [testRecipient, setTestRecipient] = useState('');
  const [testMessage, setTestMessage] = useState(
    'Halo Bapak/Ibu Guru, terdapat surat masuk baru dengan nomor agenda 005/SM/2026 yang membutuhkan disposisi tindak lanjut Anda di PAWARTA.'
  );
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Delete Confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resChan, resLogs] = await Promise.all([
        getNotificationChannels(),
        getNotificationLogs(),
      ]);
      if (resChan.success) setChannels(resChan.data || []);
      if (resLogs.success) setLogs(resLogs.data || []);
    } catch {
      toast.error('Gagal mengambil data gateway notifikasi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setNama('');
    setTipe('WHATSAPP');
    setProvider('FONNTE');
    setApiKey('');
    setSenderNumber('');
    setEndpoint('');
    setIsDefault(channels.length === 0);
    setIsAktif(true);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingId(item.id);
    setNama(item.nama);
    setTipe(item.tipe);
    setProvider(item.provider || 'FONNTE');
    setApiKey(item.konfigurasi?.apiKey || '');
    setSenderNumber(item.konfigurasi?.senderNumber || item.konfigurasi?.senderEmail || '');
    setEndpoint(item.konfigurasi?.endpoint || '');
    setIsDefault(item.isDefault);
    setIsAktif(item.isAktif);
    setIsFormOpen(true);
  };

  const handleSaveChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama) {
      toast.error('Nama kanal wajib diisi');
      return;
    }

    setIsSaving(true);
    try {
      const payload: ChannelInput = {
        id: editingId || undefined,
        nama,
        tipe,
        provider,
        konfigurasi: {
          apiKey,
          senderNumber,
          endpoint,
        },
        isDefault,
        isAktif,
      };

      const res = await saveNotificationChannel(payload);
      if (res.success) {
        toast.success(editingId ? 'Gateway berhasil diperbarui' : 'Gateway baru berhasil ditambahkan');
        setIsFormOpen(false);
        fetchData();
      } else {
        toast.error(res.error || 'Gagal menyimpan gateway');
      }
    } catch {
      toast.error('Gagal memproses data gateway');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testChannelId || !testRecipient) {
      toast.error('Nomor/Email tujuan wajib diisi');
      return;
    }

    setIsSendingTest(true);
    try {
      const res = await sendTestMessage(testChannelId, testRecipient, testMessage);
      if (res.success) {
        toast.success('Pesan uji coba berhasil dikirim!');
        setTestChannelId(null);
        fetchData();
      } else {
        toast.error(res.error || 'Gagal mengirim pesan uji coba');
      }
    } catch {
      toast.error('Gagal mengirim pesan');
    } finally {
      setIsSendingTest(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await deleteNotificationChannel(deleteId);
      if (res.success) {
        toast.success('Kanal notifikasi berhasil dihapus');
        setDeleteId(null);
        fetchData();
      } else {
        toast.error(res.error || 'Gagal menghapus kanal');
      }
    } catch {
      toast.error('Gagal menghapus kanal');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2'>
            <Radio className='w-6 h-6 text-blue-600' /> Gateway Notifikasi & Integrasi Pesan
          </h1>
          <p className='text-sm text-gray-500'>
            Konfigurasi pengiriman notifikasi instan via WhatsApp Gateway (Fonnte/Wablas) dan Email untuk disposisi surat dan tugas dinas.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            onClick={fetchData}
            className='flex items-center gap-1.5 text-xs text-gray-600'
          >
            <RefreshCw className='w-3.5 h-3.5' /> Segarkan
          </Button>
          <Button
            onClick={handleOpenCreate}
            className='flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-xs'
          >
            <Plus className='w-4 h-4' /> Tambah Gateway
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className='flex border-b border-gray-200'>
        <button
          onClick={() => setActiveTab('channels')}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'channels'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <MessageSquare className='w-4 h-4' /> Kanal & Gateway Aktif ({channels.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'logs'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <History className='w-4 h-4' /> Log & Riwayat Pengiriman ({logs.length})
        </button>
      </div>

      {/* TAB 1: CHANNELS */}
      {activeTab === 'channels' && (
        <div className='space-y-4'>
          {loading ? (
            <div className='py-16 text-center text-gray-400'>Memuat konfigurasi gateway...</div>
          ) : channels.length === 0 ? (
            <div className='text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-white p-8'>
              <MessageSquare className='w-12 h-12 text-gray-300 mx-auto mb-3' />
              <h3 className='font-bold text-gray-900'>Belum Ada Gateway Notifikasi</h3>
              <p className='text-xs text-gray-500 max-w-md mx-auto mt-1 mb-4'>
                Tambahkan gateway WhatsApp (Fonnte/Wablas) atau SMTP Email untuk mengirim notifikasi disposisi otomatis ke nomor handphone guru & staf.
              </p>
              <Button onClick={handleOpenCreate} className='bg-blue-700 hover:bg-blue-800 text-xs'>
                <Plus className='w-3.5 h-3.5 mr-1.5' /> Tambah Gateway Sekarang
              </Button>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {channels.map((chan) => (
                <div
                  key={chan.id}
                  className={`rounded-2xl border bg-white p-5 shadow-xs flex flex-col justify-between transition-all ${
                    chan.isDefault
                      ? 'border-blue-500 ring-2 ring-blue-500/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div>
                    <div className='flex items-center justify-between gap-2 mb-3 pb-3 border-b border-gray-100'>
                      <div className='flex items-center gap-2.5'>
                        <div className={`p-2 rounded-lg ${chan.tipe === 'WHATSAPP' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                          {chan.tipe === 'WHATSAPP' ? <MessageSquare className='w-5 h-5' /> : <Mail className='w-5 h-5' />}
                        </div>
                        <div>
                          <h3 className='font-bold text-gray-900 text-sm'>{chan.nama}</h3>
                          <p className='text-[11px] text-gray-400'>
                            Provider: <span className='font-semibold text-gray-700'>{chan.provider}</span>
                          </p>
                        </div>
                      </div>

                      <div className='flex items-center gap-1.5'>
                        {chan.isDefault && (
                          <span className='inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full'>
                            <Star className='w-2.5 h-2.5 fill-blue-700' /> Default
                          </span>
                        )}
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            chan.isAktif ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {chan.isAktif ? 'Aktif' : 'Non-Aktif'}
                        </span>
                      </div>
                    </div>

                    <div className='bg-gray-50/80 p-3 rounded-lg text-xs space-y-1 font-mono text-gray-600 mb-4'>
                      <p className='truncate'>
                        <span className='text-gray-400'>API Key:</span>{' '}
                        {chan.konfigurasi?.apiKey
                          ? `${chan.konfigurasi.apiKey.slice(0, 6)}••••••••••`
                          : 'Tersimpan'}
                      </p>
                      {chan.konfigurasi?.senderNumber && (
                        <p>
                          <span className='text-gray-400'>Pengirim:</span> {chan.konfigurasi.senderNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className='flex items-center justify-between pt-2 border-t border-gray-100 gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        setTestChannelId(chan.id);
                        setTestRecipient(chan.konfigurasi?.senderNumber || '');
                      }}
                      className='text-xs text-blue-700 border-blue-200 hover:bg-blue-50 h-8'
                    >
                      <Send className='w-3 h-3 mr-1.5' /> Uji Kirim Pesan
                    </Button>

                    <div className='flex items-center gap-1'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleOpenEdit(chan)}
                        className='text-xs text-gray-600 hover:text-blue-600 h-8'
                      >
                        <Pencil className='w-3.5 h-3.5 mr-1' /> Edit
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => setDeleteId(chan.id)}
                        className='text-xs text-red-600 hover:bg-red-50 h-8'
                      >
                        <Trash2 className='w-3.5 h-3.5' />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LOGS */}
      {activeTab === 'logs' && (
        <div className='bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full text-xs text-left border-collapse'>
              <thead className='bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-600 uppercase'>
                <tr>
                  <th className='p-3 text-center w-10 border'>No</th>
                  <th className='p-3 border'>Waktu Pengiriman</th>
                  <th className='p-3 border'>Penerima</th>
                  <th className='p-3 border'>Judul Notifikasi</th>
                  <th className='p-3 border'>Isi Pesan Notifikasi</th>
                  <th className='p-3 border text-center'>Status</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {loading ? (
                  <tr>
                    <td colSpan={6} className='p-8 text-center text-gray-400'>
                      Memuat log notifikasi...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className='p-8 text-center text-gray-500'>
                      Belum ada riwayat pengiriman notifikasi keluar.
                    </td>
                  </tr>
                ) : (
                  logs.map((log, idx) => (
                    <tr key={log.id || idx} className='hover:bg-gray-50/80'>
                      <td className='p-2.5 text-center border font-medium text-gray-500'>
                        {idx + 1}
                      </td>
                      <td className='p-2.5 border whitespace-nowrap text-gray-600'>
                        {log.createdAt
                          ? new Date(log.createdAt).toLocaleString('id-ID')
                          : '-'}
                      </td>
                      <td className='p-2.5 border whitespace-nowrap font-medium text-gray-900'>
                        <div>{log.recipient}</div>
                        <div className='text-[10px] text-gray-400'>{log.recipientName || 'Pegawai'}</div>
                      </td>
                      <td className='p-2.5 border font-semibold text-blue-700'>{log.judul}</td>
                      <td className='p-2.5 border text-gray-700 max-w-xs truncate' title={log.pesan}>
                        {log.pesan}
                      </td>
                      <td className='p-2.5 border text-center whitespace-nowrap'>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded ${
                            log.status === 'SENT' || log.status === 'DELIVERED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          <Check className='w-2.5 h-2.5' /> {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Form Gateway */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className='sm:max-w-[550px]'>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Konfigurasi Gateway' : 'Tambah Gateway Notifikasi'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveChannel} className='space-y-4 py-2'>
            <div className='space-y-1.5'>
              <Label htmlFor='nama'>Nama Gateway / Kanal <span className='text-red-500'>*</span></Label>
              <Input
                id='nama'
                placeholder='Contoh: WhatsApp Gateway Fonnte Utama'
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
              />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label htmlFor='tipe'>Tipe Saluran</Label>
                <select
                  id='tipe'
                  value={tipe}
                  onChange={(e) => setTipe(e.target.value)}
                  className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                >
                  <option value='WHATSAPP'>WhatsApp (Pesan Instan)</option>
                  <option value='EMAIL'>Email (SMTP Server)</option>
                  <option value='TELEGRAM'>Telegram Bot</option>
                </select>
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='provider'>Penyedia Layanan (Provider)</Label>
                <select
                  id='provider'
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                >
                  <option value='FONNTE'>Fonnte (WhatsApp)</option>
                  <option value='WABLAS'>Wablas (WhatsApp)</option>
                  <option value='SMTP_GMAIL'>Google Gmail SMTP</option>
                  <option value='CUSTOM_WEBHOOK'>Custom Webhook URL</option>
                </select>
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='apiKey'>API Key / Token Rahasia</Label>
              <Input
                id='apiKey'
                type='password'
                placeholder='Masukkan API Token dari Fonnte / Wablas'
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='senderNumber'>Nomor Pengirim / Alamat Email Pengirim</Label>
              <Input
                id='senderNumber'
                placeholder='Contoh: 081234567890 atau info@sekolah.sch.id'
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
              />
            </div>

            <div className='grid grid-cols-2 gap-3 pt-1'>
              <div className='flex items-center justify-between rounded-lg border p-3 bg-gray-50/50'>
                <div>
                  <Label className='text-xs font-semibold'>Kanal Default</Label>
                  <p className='text-[10px] text-gray-500'>Prioritas pengiriman</p>
                </div>
                <input
                  type='checkbox'
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className='h-4 w-4 rounded border-gray-300 text-blue-600'
                />
              </div>

              <div className='flex items-center justify-between rounded-lg border p-3 bg-gray-50/50'>
                <div>
                  <Label className='text-xs font-semibold'>Status Aktif</Label>
                  <p className='text-[10px] text-gray-500'>Dapat digunakan</p>
                </div>
                <input
                  type='checkbox'
                  checked={isAktif}
                  onChange={(e) => setIsAktif(e.target.checked)}
                  className='h-4 w-4 rounded border-gray-300 text-blue-600'
                />
              </div>
            </div>

            <DialogFooter className='pt-3'>
              <Button type='button' variant='outline' onClick={() => setIsFormOpen(false)}>
                Batal
              </Button>
              <Button type='submit' disabled={isSaving} className='bg-blue-700 hover:bg-blue-800'>
                {isSaving ? 'Menyimpan...' : 'Simpan Gateway'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Uji Kirim Pesan */}
      <Dialog open={!!testChannelId} onOpenChange={(open) => !open && setTestChannelId(null)}>
        <DialogContent className='sm:max-w-[480px]'>
          <DialogHeader>
            <DialogTitle>Uji Coba Pengiriman Notifikasi</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSendTest} className='space-y-4 py-2'>
            <div className='space-y-1.5'>
              <Label htmlFor='testRecipient'>Nomor WhatsApp / Email Tujuan <span className='text-red-500'>*</span></Label>
              <Input
                id='testRecipient'
                placeholder='Contoh: 08123456789 atau guru@sekolah.sch.id'
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                required
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='testMessage'>Pesan Notifikasi Uji Coba</Label>
              <Textarea
                id='testMessage'
                rows={3}
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className='text-xs'
              />
            </div>

            <DialogFooter className='pt-2'>
              <Button type='button' variant='outline' onClick={() => setTestChannelId(null)}>
                Batal
              </Button>
              <Button type='submit' disabled={isSendingTest} className='bg-emerald-600 hover:bg-emerald-700'>
                {isSendingTest ? 'Mengirim...' : 'Kirim Pesan Sekarang'}
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
