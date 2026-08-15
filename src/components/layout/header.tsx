'use client';

import { Bell, Search, LayoutGrid, User, Settings, LogOut } from 'lucide-react';
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

export function Header({ user }: { user?: HeaderUser }) {
  const displayName = user?.name || 'Pengguna PAWARTA';
  const displayRole = user?.role || 'Pengguna Sistem';
  const initial = (displayName.charAt(0) || 'P').toUpperCase();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40 shadow-sm">
      <div className="flex-1 flex items-center gap-4">
        {/* Command Palette Trigger */}
        <CommandPaletteTrigger />
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Quick Actions */}
        <button
          title="Modul Sistem"
          className="hidden md:flex items-center justify-center w-9 h-9 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LayoutGrid className="w-5 h-5" />
        </button>

        {/* Notification Center */}
        <NotificationCenter />

        <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

        {/* User Menu */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 p-1 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-right hidden md:block">
              <div
                className="text-sm font-semibold text-gray-900 leading-tight truncate max-w-[200px]"
                title={displayName}
              >
                {displayName}
              </div>
              <div className="text-xs text-blue-600 font-medium">{displayRole}</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              {initial}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            title="Keluar / Logout"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
