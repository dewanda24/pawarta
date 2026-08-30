'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
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
  User,
  ShieldHalf,
  Activity,
  SlidersHorizontal,
  Bell,
  Plug,
  HardDrive,
  ScrollText,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Pin,
  FolderOpen,
  Home,
  Shield,
  Layers,
  Landmark,
  Radio,
  Sliders,
  type LucideIcon,
} from 'lucide-react';
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
  return IconMap[iconName] || FolderOpen;
}

export function Sidebar({ menus = [] }: { menus?: MenuItem[] }) {
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const pathname = usePathname();

  // Auto expand parent group jika sedang aktif di halaman anaknya
  useEffect(() => {
    if (!menus.length) return;
    const initialOpen: Record<string, boolean> = {};

    menus.forEach((item) => {
      if (item.children && item.children.length > 0) {
        const isChildActive = item.children.some(
          (child) => child.route && (pathname === child.route || pathname.startsWith(`${child.route}/`))
        );
        if (isChildActive) {
          initialOpen[item.id] = true;
        }
      }
    });

    setOpenGroups((prev) => ({ ...prev, ...initialOpen }));
  }, [pathname, menus]);

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <aside
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } bg-white border-r border-gray-200 flex flex-col hidden md:flex print:hidden transition-all duration-300 ease-in-out relative flex-shrink-0 min-h-screen select-none`}
    >
      {/* Brand Header */}
      <div
        className={`flex items-center h-16 px-4 border-b border-gray-200 ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-base shadow-sm">
              P
            </div>
            <div>
              <div className="font-bold text-gray-900 text-lg tracking-tight leading-tight">PAWARTA</div>
              <div className="text-[10px] text-gray-500 font-medium leading-none">Tata Naskah Digital</div>
            </div>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">
            P
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 text-gray-400 hover:text-gray-600 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors ${
            collapsed ? 'absolute -right-3 top-5 z-20 bg-white shadow-xs' : ''
          }`}
          title={collapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 scrollbar-thin">
        {menus.map((item) => {
          const Icon = getIcon(item.icon);
          const hasChildren = item.children && item.children.length > 0;
          const isGroupOpen = openGroups[item.id] ?? false;

          // Cek active state
          const isCurrentActive = item.route
            ? pathname === item.route || (item.route !== '/dashboard' && pathname.startsWith(`${item.route}/`))
            : false;

          const isAnyChildActive = hasChildren
            ? item.children.some(
                (child) =>
                  child.route &&
                  (pathname === child.route || (child.route !== '/dashboard' && pathname.startsWith(`${child.route}/`)))
              )
            : false;

          // Jika menu adalah parent group yang punya anak-anak
          if (hasChildren) {
            return (
              <div key={item.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleGroup(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                    isAnyChildActive
                      ? 'bg-blue-50/80 text-blue-800'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  } ${collapsed ? 'justify-center' : 'justify-between'}`}
                  title={collapsed ? item.nama : undefined}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 ${
                        isAnyChildActive ? 'text-blue-700' : 'text-gray-500'
                      }`}
                    />
                    {!collapsed && <span className="truncate">{item.nama}</span>}
                  </div>
                  {!collapsed && (
                    <div className="text-gray-400">
                      {isGroupOpen ? (
                        <ChevronDown className="w-3.5 h-3.5 transition-transform" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 transition-transform" />
                      )}
                    </div>
                  )}
                </button>

                {/* Sub Menu Items (Accordion) */}
                {!collapsed && isGroupOpen && (
                  <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-blue-100 ml-5 my-1 animate-in fade-in-50 duration-200">
                    {item.children.map((child) => {
                      const ChildIcon = getIcon(child.icon);
                      const isChildActive = child.route
                        ? pathname === child.route ||
                          (child.route !== '/dashboard' && pathname.startsWith(`${child.route}/`))
                        : false;

                      return (
                        <Link
                          key={child.id}
                          href={child.route || '#'}
                          className={`flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-lg font-medium transition-all ${
                            isChildActive
                              ? 'bg-blue-600 text-white shadow-xs font-semibold'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          <ChildIcon className={`w-3.5 h-3.5 flex-shrink-0 ${isChildActive ? 'text-white' : 'text-gray-400'}`} />
                          <span className="truncate flex-1">{child.nama}</span>
                          {isChildActive && <Pin className="w-3 h-3 text-blue-200" />}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Single Route Link
          return (
            <Link
              key={item.id}
              href={item.route || '#'}
              className={`flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                isCurrentActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.nama : undefined}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 ${
                  isCurrentActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                }`}
              />
              {!collapsed && <span className="flex-1 truncate">{item.nama}</span>}
              {!collapsed && isCurrentActive && <Pin className="w-3.5 h-3.5 text-blue-200" />}
            </Link>
          );
        })}
      </div>

      {/* Footer System Info */}
      <div
        className={`p-3.5 border-t border-gray-100 text-[11px] text-gray-400 bg-gray-50/50 ${
          collapsed ? 'text-center' : 'flex items-center justify-between'
        }`}
      >
        {!collapsed ? (
          <>
            <span className="font-semibold text-gray-600">PAWARTA</span>
            <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-mono font-bold">
              v1.0
            </span>
          </>
        ) : (
          <span className="font-mono text-[10px] text-gray-400 font-bold">v1.0</span>
        )}
      </div>
    </aside>
  );
}

