'use client';

import { Bell, Check } from 'lucide-react';
import { useState } from 'react';

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(3);

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center w-9 h-9 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
          <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-semibold text-gray-900">Notifikasi</h3>
            {unread > 0 && (
              <button 
                onClick={() => setUnread(0)}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Tandai semua dibaca
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {unread > 0 ? (
              <div className="divide-y divide-gray-50">
                <div className="p-4 hover:bg-gray-50/50 transition-colors cursor-pointer bg-blue-50/20">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Bell className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Disposisi Baru Diterima</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">Anda menerima disposisi dari Kepala Sekolah terkait undangan rapat koordinasi.</p>
                      <p className="text-[10px] text-gray-400 mt-1">5 menit yang lalu</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 hover:bg-gray-50/50 transition-colors cursor-pointer bg-blue-50/20">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Surat Keluar Disetujui</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">Draft surat permohonan dana telah disetujui oleh Wakil Kepala Sekolah.</p>
                      <p className="text-[10px] text-gray-400 mt-1">1 jam yang lalu</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-5 h-5 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-900">Belum ada notifikasi baru</p>
                <p className="text-xs text-gray-500 mt-1">Saat ini Anda telah membaca semua notifikasi.</p>
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-gray-50 bg-gray-50 text-center">
            <button className="text-xs font-medium text-gray-600 hover:text-gray-900">
              Lihat Semua Notifikasi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
