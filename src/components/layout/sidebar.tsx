'use client';

import Link from 'next/link';
import {
  Home,
  Inbox,
  Send,
  BookOpen,
  Users,
  FileText,
  Building2,
  Shield,
  ChevronLeft,
  ChevronRight,
  Pin,
  FolderOpen,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

const IconMap: Record<string, LucideIcon> = {
  Home,
  Inbox,
  Send,
  BookOpen,
  Users,
  FileText,
  Building2,
  Shield,
  FolderOpen,
};

// Menu fokus lingkup persuratan sekolah (TU & Kepala Sekolah)
const menuGroups = [
  {
    title: 'Menu Utama',
    items: [
      { id: '1', nama: 'Dashboard', icon: 'Home', route: '/dashboard' },
      { id: '2', nama: 'Surat Masuk', icon: 'Inbox', route: '/surat-masuk' },
      { id: '3', nama: 'Surat Keluar', icon: 'Send', route: '/surat-keluar' },
      { id: '4', nama: 'Buku Agenda & Rekap', icon: 'BookOpen', route: '/agenda-digital' },
    ],
  },
  {
    title: 'Master Data Sekolah',
    items: [
      { id: '5', nama: 'Guru & Staf Pegawai', icon: 'Users', route: '/master/pegawai' },
      { id: '6', nama: 'Kode Klasifikasi Surat', icon: 'FileText', route: '/master/jenis-surat' },
      { id: '7', nama: 'Daftar Instansi Relasi', icon: 'Building2', route: '/master/instansi' },
    ],
  },
  {
    title: 'Pengaturan',
    items: [{ id: '8', nama: 'Pengguna & Hak Akses', icon: 'Shield', route: '/iam/users' }],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`${collapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 flex flex-col hidden md:flex transition-all duration-300 ease-in-out relative flex-shrink-0 min-h-screen`}
    >
      <div
        className={`flex items-center h-16 px-4 border-b border-gray-200 ${collapsed ? 'justify-center' : 'justify-between'}`}
      >
        {!collapsed && (
          <div className="font-bold text-primary text-2xl tracking-tight">PAWARTA</div>
        )}
        {collapsed && <div className="font-bold text-primary text-xl">P</div>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1 text-gray-400 hover:text-gray-600 rounded bg-gray-50 hover:bg-gray-100 ${collapsed ? 'absolute -right-3 top-5 border border-gray-200 z-10' : ''}`}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        <nav className="space-y-6 px-2">
          {menuGroups.map((group, idx) => (
            <div key={idx}>
              {!collapsed && (
                <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {group.title}
                </div>
              )}
              {collapsed && <div className="my-2 border-t border-gray-100 mx-2" />}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon && IconMap[item.icon] ? IconMap[item.icon] : FolderOpen;
                  const isActive =
                    pathname === item.route || pathname?.startsWith(`${item.route}/`);
                  return (
                    <Link
                      key={item.id}
                      href={item.route || '#'}
                      className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      } ${collapsed ? 'justify-center' : ''}`}
                      title={collapsed ? item.nama : ''}
                    >
                      <Icon
                        className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-600'}`}
                      />
                      {!collapsed && <span className="flex-1 truncate">{item.nama}</span>}
                      {!collapsed && isActive && <Pin className="w-3.5 h-3.5 text-blue-400" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div
        className={`p-4 border-t border-gray-100 text-xs text-gray-400 ${collapsed ? 'text-center' : ''}`}
      >
        {!collapsed ? 'PAWARTA Persuratan Sekolah' : 'v1.0'}
      </div>
    </aside>
  );
}
