import { db } from '@/db';
import { konfigurasiSistem } from '@/db/schema';
import { requireAuth } from '@/lib/server-action';
import { KonfigurasiClient } from './KonfigurasiClient';
import { SlidersHorizontal } from 'lucide-react';

export const metadata = {
  title: 'Konfigurasi Sistem | PAWARTA',
};

export default async function SettingsPage() {
  await requireAuth('SISTEM_KONFIGURASI');

  const config = await db.query.konfigurasiSistem.findFirst();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
              Konfigurasi Sistem
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Pengaturan naskah dinas, ukuran kertas F4, margin cetak, dan parameter sistem PAWARTA
            </p>
          </div>
        </div>
      </div>

      <KonfigurasiClient initialData={config || null} />
    </div>
  );
}
