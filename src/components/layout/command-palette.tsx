'use client';

import { useState, useEffect } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Search, Command, FileText, Users, Settings, Building2 } from 'lucide-react';

export function CommandPaletteTrigger() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 px-4 py-2 rounded-lg border border-gray-200 w-full sm:w-64 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left hidden sm:inline-block">Cari sesuatu...</span>
        <span className="text-left sm:hidden">Cari...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-1.5 font-mono text-[10px] font-medium text-gray-500">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Basic Command Palette Mockup (sementara karena menunggu instalasi CMD-K shadcn) */}
      {open && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-start justify-center pt-[15vh]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center px-4 border-b border-gray-100">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                autoFocus
                className="flex-1 h-12 bg-transparent border-0 px-4 text-sm focus:outline-none focus:ring-0"
                placeholder="Ketik perintah atau cari..."
              />
              <button
                onClick={() => setOpen(false)}
                className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded"
              >
                ESC
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">Master Data</div>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-lg transition-colors text-left">
                <Building2 className="w-4 h-4" /> Instansi & Unit Kerja
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-lg transition-colors text-left">
                <Users className="w-4 h-4" /> Pegawai
              </button>

              <div className="px-2 py-1.5 mt-2 text-xs font-semibold text-gray-500">
                Surat & Template
              </div>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-lg transition-colors text-left">
                <FileText className="w-4 h-4" /> Cari Template Surat
              </button>

              <div className="px-2 py-1.5 mt-2 text-xs font-semibold text-gray-500">Sistem</div>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-lg transition-colors text-left">
                <Settings className="w-4 h-4" /> Pengaturan Preferensi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
