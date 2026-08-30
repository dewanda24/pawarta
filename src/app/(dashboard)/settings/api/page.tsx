import { requireAuth } from '@/lib/server-action';
import { ApiClient } from './ApiClient';
import { Plug } from 'lucide-react';

export const metadata = {
  title: 'API & Integrasi | PAWARTA',
};

export default async function ApiSettingsPage() {
  await requireAuth('SISTEM_API_KEY');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
            <Plug className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
              API & Integrasi Gateway
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Konfigurasi WhatsApp Gateway (Fonnte/Wablas), SMTP Server, dan REST API Token
            </p>
          </div>
        </div>
      </div>

      <ApiClient />
    </div>
  );
}
