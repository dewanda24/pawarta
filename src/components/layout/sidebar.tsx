import Link from 'next/link';
import { Home, Inbox, Send, Archive, Users, Settings } from 'lucide-react';

export function Sidebar() {
  const menuItems = [
    { name: 'Dashboard', icon: Home, href: '/dashboard' },
    { name: 'Surat Masuk', icon: Inbox, href: '#' },
    { name: 'Surat Keluar', icon: Send, href: '#' },
    { name: 'Arsip', icon: Archive, href: '#' },
    { name: 'Pengguna', icon: Users, href: '#' },
    { name: 'Pengaturan', icon: Settings, href: '#' },
  ];

  return (
    <aside className="w-full bg-white border-r border-gray-200 p-4 md:w-64 md:flex-shrink-0 md:min-h-screen flex flex-col hidden md:flex">
      <div className="font-bold text-primary text-2xl mb-8 px-2 tracking-tight">
        PAWARTA
      </div>
      <nav className="space-y-1 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-100 hover:text-primary transition-colors"
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="pt-4 border-t border-gray-100 text-xs text-center text-gray-400">
        Enterprise Edition
      </div>
    </aside>
  );
}
