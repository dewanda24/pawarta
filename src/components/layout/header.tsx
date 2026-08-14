// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Bell, Search, LayoutGrid, User, Settings, LogOut } from 'lucide-react';
import { NotificationCenter } from './notification-center';
import { CommandPaletteTrigger } from './command-palette';

export function Header() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40 shadow-sm">
      <div className="flex-1 flex items-center gap-4">
        {/* Command Palette Trigger */}
        <CommandPaletteTrigger />
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Quick Actions (Placeholder) */}
        <button className="hidden md:flex items-center justify-center w-9 h-9 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
          <LayoutGrid className="w-5 h-5" />
        </button>

        {/* Notification Center */}
        <NotificationCenter />

        <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

        {/* User Menu */}
        <div className="flex items-center gap-3 cursor-pointer p-1 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="text-right hidden md:block">
            <div className="text-sm font-medium text-gray-900 leading-tight">Admin PAWARTA</div>
            <div className="text-xs text-gray-500">Super Admin</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shadow-inner">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
