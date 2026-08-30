import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Home, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AccessDeniedProps {
  title?: string;
  message?: string;
  requiredPermission?: string;
  backUrl?: string;
}

export function AccessDenied({
  title = 'Akses Ditolak (403)',
  message = 'Akun Anda tidak memiliki hak akses yang diperlukan untuk membuka halaman atau fitur ini.',
  requiredPermission,
  backUrl = '/dashboard',
}: AccessDeniedProps) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-200/90 shadow-sm p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Warning Icon Badge */}
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-8 h-8 text-red-600" />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h1>
          <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto">{message}</p>
          {requiredPermission && (
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-mono font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                Memerlukan: {requiredPermission}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
          <Link href={backUrl} className="flex-1">
            <Button variant="default" className="w-full bg-blue-700 hover:bg-blue-800 text-xs font-semibold flex items-center justify-center gap-2">
              <Home className="w-3.5 h-3.5" /> Beranda Dashboard
            </Button>
          </Link>
          <Link href="/bantuan" className="flex-1">
            <Button variant="outline" className="w-full text-xs font-semibold flex items-center justify-center gap-2 border-gray-200">
              <HelpCircle className="w-3.5 h-3.5 text-gray-500" /> Bantuan & SOP
            </Button>
          </Link>
        </div>

        {/* Footer Note */}
        <p className="text-[10px] text-gray-400 border-t border-gray-100 pt-4">
          Hubungi <strong>Administrator Sistem (Super Admin)</strong> atau <strong>Kepala Tata Usaha</strong> jika Anda memerlukan akses ke halaman ini.
        </p>
      </div>
    </div>
  );
}
