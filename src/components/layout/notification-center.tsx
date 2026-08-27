'use client';

import { Bell, Check, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import {
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '@/features/iam/actions/notifications';
import Link from 'next/link';

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUserNotifications();
      if (res.success && res.data) {
        setItems(res.data);
      }
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifs();
  }, [fetchNotifs]);

  const unreadCount = items.filter((i) => !i.isRead).length;

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
    } catch {
      // ignore
    }
  };

  const handleItemClick = async (item: any) => {
    setOpen(false);
    if (!item.isRead) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isRead: true } : i))
      );
      try {
        await markNotificationAsRead(item.id);
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className='relative'>
      <button 
        onClick={() => {
          setOpen(!open);
          if (!open) fetchNotifs();
        }}
        className='relative flex items-center justify-center w-9 h-9 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors'
      >
        <Bell className='w-5 h-5' />
        {unreadCount > 0 && (
          <span className='absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse'></span>
        )}
      </button>

      {open && (
        <div className='absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50'>
          <div className='p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50'>
            <div className='flex items-center gap-2'>
              <h3 className='font-semibold text-gray-900 text-sm'>Notifikasi</h3>
              {unreadCount > 0 && (
                <span className='text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-bold'>
                  {unreadCount} baru
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className='text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1'
              >
                <Check className='w-3 h-3' /> Tandai dibaca
              </button>
            )}
          </div>
          
          <div className='max-h-96 overflow-y-auto'>
            {loading && items.length === 0 ? (
              <div className='p-6 text-center text-gray-400'>
                <Loader2 className='w-5 h-5 animate-spin mx-auto' />
              </div>
            ) : items.length > 0 ? (
              <div className='divide-y divide-gray-50'>
                {items.map((item) => (
                  <Link
                    key={item.id}
                    href={item.linkUrl || '#'}
                    onClick={() => handleItemClick(item)}
                    className={'block p-3.5 hover:bg-gray-50 transition-colors ' + (!item.isRead ? 'bg-blue-50/30' : '')}
                  >
                    <div className='flex gap-3'>
                      <div className='w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600'>
                        <Bell className='w-3.5 h-3.5' />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <p className='text-xs font-semibold text-gray-900 truncate'>{item.judul}</p>
                        <p className='text-xs text-gray-600 mt-0.5 line-clamp-2'>{item.pesan}</p>
                        <p className='text-[10px] text-gray-400 mt-1'>
                          {new Date(item.createdAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className='p-8 text-center'>
                <div className='w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2'>
                  <Bell className='w-4 h-4 text-gray-300' />
                </div>
                <p className='text-xs font-medium text-gray-900'>Belum ada notifikasi</p>
                <p className='text-[11px] text-gray-500 mt-0.5'>Pemberitahuan surat dan disposisi akan muncul di sini.</p>
              </div>
            )}
          </div>
          
          <div className='p-2.5 border-t border-gray-50 bg-gray-50 text-center'>
            <Link
              href='/disposisi-saya'
              onClick={() => setOpen(false)}
              className='text-xs font-medium text-blue-600 hover:text-blue-700'
            >
              Buka Disposisi Saya →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
