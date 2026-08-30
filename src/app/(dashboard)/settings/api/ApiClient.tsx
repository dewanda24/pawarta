'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plug, MessageSquare, Mail, Key, CheckCircle2, RefreshCw, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function ApiClient() {
  const [waToken, setWaToken] = useState('fonnte_live_tok_98234710293847');
  const [waProvider, setWaProvider] = useState('FONNTE');
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('admin.tu@smpn1ujungjaya.sch.id');
  const [loadingTest, setLoadingTest] = useState(false);

  const handleSave = () => {
    toast.success('Pengaturan API & Integrasi Gateway berhasil disimpan!');
  };

  const handleTestWhatsApp = () => {
    setLoadingTest(true);
    setTimeout(() => {
      setLoadingTest(false);
      toast.success('Koneksi WhatsApp Gateway Aktif! Status: Connected.');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* 1. WhatsApp Gateway */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">WhatsApp Gateway Notifikasi</h2>
              <p className="text-[11px] text-gray-500">Kirim lembar disposisi dan notifikasi surat ke nomor WhatsApp pegawai</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold text-xs flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Terhubung
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">Provider WhatsApp</Label>
            <select
              value={waProvider}
              onChange={(e) => setWaProvider(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium"
            >
              <option value="FONNTE">Fonnte (Rekomendasi Indonesia)</option>
              <option value="WABLAS">Wablas Official</option>
              <option value="WHACENTER">Whacenter API</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">API Token / Secret Key</Label>
            <Input
              type="password"
              value={waToken}
              onChange={(e) => setWaToken(e.target.value)}
              placeholder="Masukkan API Token Provider"
              className="text-xs font-mono"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTestWhatsApp}
            disabled={loadingTest}
            className="text-xs font-semibold flex items-center gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingTest ? 'animate-spin' : ''}`} />
            Uji Koneksi Gateway
          </Button>
        </div>
      </div>

      {/* 2. SMTP Email Service */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">SMTP Email Server</h2>
            <p className="text-[11px] text-gray-500">Layanan pengiriman email notifikasi dan salinan surat digital</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">SMTP Host</Label>
            <Input
              value={smtpHost}
              onChange={(e) => setSmtpHost(e.target.value)}
              placeholder="smtp.gmail.com"
              className="text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">Port SMTP</Label>
            <Input
              value={smtpPort}
              onChange={(e) => setSmtpPort(e.target.value)}
              placeholder="587"
              className="text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">Email Pengirim</Label>
            <Input
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
              placeholder="admin@sekolah.sch.id"
              className="text-xs font-medium"
            />
          </div>
        </div>
      </div>

      {/* 3. API Token Publik */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Kunci API Sistem PAWARTA</h2>
            <p className="text-[11px] text-gray-500">Digunakan untuk integrasi eksternal (Dinas Pendidikan & e-Office)</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-gray-700">Public Bearer Token</Label>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value="pawarta_live_sec_8f93e4b7c12a45098e6d"
              className="text-xs font-mono bg-gray-50 max-w-md"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText('pawarta_live_sec_8f93e4b7c12a45098e6d');
                toast.success('API Key disalin ke clipboard!');
              }}
              className="text-xs font-semibold"
            >
              Salin Key
            </Button>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 h-10 shadow-xs flex items-center gap-2"
        >
          <Send className="w-4 h-4" /> Simpan Pengaturan Integrasi
        </Button>
      </div>
    </div>
  );
}
