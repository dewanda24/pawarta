'use client';

import { LogOut, Shield } from 'lucide-react';
import { NotificationCenter } from './notification-center';
import { CommandPaletteTrigger } from './command-palette';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

interface HeaderUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  image?: string | null;
}

const roleBadgeColors: Record<string, { bg: string; text: string; border: string }> = {
  'Super Admin': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  'Kepala Sekolah': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Kepala Tata Usaha': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Staf TU': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Guru': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Arsiparis': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
};

export function Header({ user }: { user?: HeaderUser }) {
  const displayName = user?.name || 'Pengguna PAWARTA';
  const displayRole = user?.role || 'Pengguna Sistem';
  const initial = (displayName.charAt(0) || 'P').toUpperCase();
  const badgeStyle = roleBadgeColors[displayRole] || {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40 shadow-xs print:hidden">
      <div className="flex-1 flex items-center gap-4">
        {/* Command Palette Trigger */}
        <CommandPaletteTrigger />
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notification Center */}
        <NotificationCenter />

        <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

        {/* User Menu */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 p-1 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="text-right hidden md:block">
              <div
                className="text-xs font-bold text-gray-900 leading-tight truncate max-w-[200px]"
                title={displayName}
              >
                {displayName}
              </div>
              <div className="mt-0.5">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                >
                  <Shield className="w-2.5 h-2.5" />
                  {displayRole}
                </span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs text-sm">
              {initial}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            title="Keluar / Logout"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors rounded-xl"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

