'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Inbox,
  Send,
  BookOpen,
  Users,
  FileText,
  Building2,
  Shield,
  FolderOpen,
  GraduationCap,
  School,
  ClipboardList,
  Layers,
  Landmark,
  Radio,
  Menu,
  X,
  type LucideIcon,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

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
  GraduationCap,
  School,
  ClipboardList,
  Layers,
  Landmark,
  Radio,
};

const menuGroups = [
  {
    title: 'Menu Utama',
    items: [
      { id: '1', nama: 'Dashboard', icon: 'Home', route: '/dashboard' },
      { id: '2', nama: 'Surat Masuk', icon: 'Inbox', route: '/surat-masuk' },
      { id: '2b', nama: 'Disposisi Saya', icon: 'ClipboardList', route: '/disposisi-saya' },
      { id: '3', nama: 'Surat Keluar (Dinas)', icon: 'Send', route: '/surat-keluar' },
      { id: '4', nama: 'Surat Kesiswaan', icon: 'GraduationCap', route: '/surat-siswa' },
      { id: '5', nama: 'Buku Agenda & Rekap', icon: 'BookOpen', route: '/agenda-digital' },
    ],
  },
  {
    title: 'Master Data Sekolah',
    items: [
      { id: '6', nama: 'Data Siswa', icon: 'GraduationCap', route: '/master/siswa' },
      { id: '7', nama: 'Rombel / Kelas', icon: 'School', route: '/master/kelas' },
      { id: '8', nama: 'Guru & Staf Pegawai', icon: 'Users', route: '/master/pegawai' },
      { id: '9', nama: 'Kode Klasifikasi Surat', icon: 'Layers', route: '/master/klasifikasi' },
      { id: '9b', nama: 'Jenis Surat', icon: 'FileText', route: '/master/jenis-surat' },
      { id: '9c', nama: 'Desain KOP Surat', icon: 'Landmark', route: '/master/kop-surat' },
      { id: '10', nama: 'Daftar Instansi Relasi', icon: 'Building2', route: '/master/instansi' },
    ],
  },
  {
    title: 'Pengaturan',
    items: [
      { id: '11', nama: 'Pengguna & Hak Akses', icon: 'Shield', route: '/iam/users' },
      { id: '12', nama: 'Gateway Notifikasi WA/Email', icon: 'Radio', route: '/settings/notifikasi' },
    ],
  },
];

const bottomNavItems = [
  { label: 'Beranda', icon: Home, route: '/dashboard' },
  { label: 'Surat Masuk', icon: Inbox, route: '/surat-masuk' },
  { label: 'Disposisi', icon: ClipboardList, route: '/disposisi-saya' },
  { label: 'Surat Dinas', icon: Send, route: '/surat-keluar' },
  { label: 'Siswa', icon: GraduationCap, route: '/surat-siswa' },
];

export function MobileNav({ user }: { user?: { name?: string | null; email?: string | null; role?: string | null } }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Drawer Backdrop & Menu */}
      {isOpen && (
        <div className='fixed inset-0 z-50 md:hidden'>
          {/* Backdrop */}
          <div
            className='fixed inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200'
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Content */}
          <div className='fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-300'>
            {/* Drawer Header */}
            <div className='p-4 border-b border-gray-200 flex items-center justify-between bg-blue-700 text-white'>
              <div className='flex items-center gap-2.5'>
                <div className='w-8 h-8 rounded-lg bg-white text-blue-700 font-bold flex items-center justify-center text-sm shadow-xs'>
                  P
                </div>
                <div>
                  <h2 className='font-bold text-base tracking-tight leading-tight'>PAWARTA</h2>
                  <p className='text-[10px] text-blue-100'>Persuratan Digital Sekolah</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className='p-1.5 rounded-lg text-blue-100 hover:bg-blue-600 hover:text-white transition-colors'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            {/* User Profile Bar in Drawer */}
            {user && (
              <div className='p-3.5 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between'>
                <div className='min-w-0 flex-1 pr-2'>
                  <p className='font-bold text-xs text-gray-900 truncate'>{user.name || 'Pengguna'}</p>
                  <p className='text-[10px] text-blue-700 font-medium'>{user.role || 'Staf'}</p>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className='h-7 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 px-2'
                >
                  Keluar
                </Button>
              </div>
            )}

            {/* Nav Items List */}
            <div className='flex-1 overflow-y-auto p-3 space-y-5'>
              {menuGroups.map((group, idx) => (
                <div key={idx}>
                  <p className='px-2 mb-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider'>
                    {group.title}
                  </p>
                  <div className='space-y-0.5'>
                    {group.items.map((item) => {
                      const Icon = item.icon && IconMap[item.icon] ? IconMap[item.icon] : FolderOpen;
                      const isActive =
                        pathname === item.route || pathname?.startsWith(`${item.route}/`);
                      return (
                        <Link
                          key={item.id}
                          href={item.route || '#'}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                          <span className='truncate'>{item.nama}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Drawer Footer */}
            <div className='p-3 border-t border-gray-100 text-center text-[10px] text-gray-400 bg-gray-50'>
              PAWARTA Mobile Web App • v1.0
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Navigation Bar for Mobile */}
      <nav className='md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-40 px-2 py-1.5 shadow-lg flex items-center justify-around'>
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.route || (item.route !== '/dashboard' && pathname?.startsWith(`${item.route}/`));
          return (
            <Link
              key={item.route}
              href={item.route}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all ${
                isActive ? 'text-blue-700 font-bold' : 'text-gray-500 hover:text-gray-900 font-medium'
              }`}
            >
              <div className={`p-1 rounded-full ${isActive ? 'bg-blue-100 text-blue-700' : ''}`}>
                <Icon className='w-4 h-4' />
              </div>
              <span className='text-[10px] mt-0.5 leading-none'>{item.label}</span>
            </Link>
          );
        })}

        {/* More Button to trigger Drawer */}
        <button
          onClick={() => setIsOpen(true)}
          className='flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-gray-500 hover:text-gray-900 font-medium transition-all'
        >
          <div className='p-1 rounded-full'>
            <Menu className='w-4 h-4' />
          </div>
          <span className='text-[10px] mt-0.5 leading-none'>Semua</span>
        </button>
      </nav>
    </>
  );
}
