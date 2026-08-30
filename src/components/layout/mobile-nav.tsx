'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Home,
  Inbox,
  Send,
  GraduationCap,
  ClipboardList,
  Archive,
  Database,
  Users,
  Settings,
  HelpCircle,
  List,
  Plus,
  BookOpen,
  PenLine,
  FileText,
  FileCheck,
  UserCheck,
  CalendarCheck,
  School,
  Briefcase,
  Building2,
  Building,
  DoorOpen,
  UserSquare,
  FileType,
  FolderTree,
  PenTool,
  Heading,
  LayoutTemplate,
  Flag,
  ShieldCheck,
  Shield,
  User,
  ShieldHalf,
  Activity,
  SlidersHorizontal,
  Sliders,
  Bell,
  Plug,
  HardDrive,
  ScrollText,
  Layers,
  Landmark,
  Radio,
  Menu,
  X,
  type LucideIcon,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import type { MenuItem } from '@/lib/auth/menu';

const IconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Home,
  Inbox,
  Send,
  GraduationCap,
  ClipboardList,
  Archive,
  Database,
  Users,
  Settings,
  HelpCircle,
  List,
  Plus,
  BookOpen,
  PenLine,
  FileText,
  FileCheck,
  UserCheck,
  CalendarCheck,
  School,
  Briefcase,
  Building2,
  Building,
  DoorOpen,
  UserSquare,
  FileType,
  FolderTree,
  PenTool,
  Heading,
  LayoutTemplate,
  Flag,
  ShieldCheck,
  Shield,
  User,
  ShieldHalf,
  Activity,
  SlidersHorizontal,
  Sliders,
  Bell,
  Plug,
  HardDrive,
  ScrollText,
  Layers,
  Landmark,
  Radio,
};

function getIcon(iconName?: string | null): LucideIcon {
  if (!iconName) return FileText;
  return IconMap[iconName] || FileText;
}

const bottomNavItems = [
  { label: 'Beranda', icon: Home, route: '/dashboard' },
  { label: 'Surat Masuk', icon: Inbox, route: '/surat-masuk' },
  { label: 'Disposisi', icon: ClipboardList, route: '/disposisi-saya' },
  { label: 'Surat Dinas', icon: Send, route: '/surat-keluar' },
  { label: 'Siswa', icon: GraduationCap, route: '/surat-siswa' },
];

export function MobileNav({
  user,
  menus = [],
}: {
  user?: { name?: string | null; email?: string | null; role?: string | null };
  menus?: MenuItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Drawer Backdrop & Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Content */}
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-300">
            {/* Drawer Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-blue-700 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white text-blue-700 font-bold flex items-center justify-center text-sm shadow-xs">
                  P
                </div>
                <div>
                  <h2 className="font-bold text-base tracking-tight leading-tight">PAWARTA</h2>
                  <p className="text-[10px] text-blue-100">Tata Naskah Digital</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-blue-100 hover:bg-blue-600 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Bar in Drawer */}
            {user && (
              <div className="p-3.5 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between">
                <div className="min-w-0 flex-1 pr-2">
                  <p className="font-bold text-xs text-gray-900 truncate">
                    {user.name || 'Pengguna'}
                  </p>
                  <p className="text-[10px] text-blue-700 font-medium">{user.role || 'Pengguna Sistem'}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="h-7 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 px-2"
                >
                  Keluar
                </Button>
              </div>
            )}

            {/* Nav Items List from Database */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {menus.map((item) => {
                const Icon = getIcon(item.icon);
                const hasChildren = item.children && item.children.length > 0;

                if (hasChildren) {
                  return (
                    <div key={item.id} className="space-y-1">
                      <div className="px-2 pt-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5" />
                        <span>{item.nama}</span>
                      </div>
                      <div className="space-y-0.5 pl-2">
                        {item.children.map((child) => {
                          const ChildIcon = getIcon(child.icon);
                          const isActive =
                            child.route &&
                            (pathname === child.route || (child.route !== '/dashboard' && pathname.startsWith(`${child.route}/`)));

                          return (
                            <Link
                              key={child.id}
                              href={child.route || '#'}
                              onClick={() => setIsOpen(false)}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                                isActive
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              <ChildIcon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                              <span className="truncate">{child.nama}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                const isActive =
                  item.route &&
                  (pathname === item.route || (item.route !== '/dashboard' && pathname.startsWith(`${item.route}/`)));

                return (
                  <div key={item.id}>
                    <Link
                      href={item.route || '#'}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                      <span className="truncate">{item.nama}</span>
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Drawer Footer */}
            <div className="p-3 border-t border-gray-100 text-center text-[10px] text-gray-400 bg-gray-50">
              PAWARTA Tata Naskah Digital • v1.0
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Navigation Bar for Mobile */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-40 px-2 py-1.5 shadow-lg flex items-center justify-around">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.route ||
            (item.route !== '/dashboard' && pathname?.startsWith(`${item.route}/`));
          return (
            <Link
              key={item.route}
              href={item.route}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all ${
                isActive
                  ? 'text-blue-700 font-bold'
                  : 'text-gray-500 hover:text-gray-900 font-medium'
              }`}
            >
              <div className={`p-1 rounded-full ${isActive ? 'bg-blue-100 text-blue-700' : ''}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-0.5 leading-none">{item.label}</span>
            </Link>
          );
        })}

        {/* More Button to trigger Drawer */}
        <button
          onClick={() => setIsOpen(true)}
          className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-gray-500 hover:text-gray-900 font-medium transition-all"
        >
          <div className="p-1 rounded-full">
            <Menu className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5 leading-none">Menu</span>
        </button>
      </nav>
    </>
  );
}

