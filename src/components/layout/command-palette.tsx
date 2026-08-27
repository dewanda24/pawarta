'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Home,
  Inbox,
  Send,
  BookOpen,
  Users,
  FileText,
  Building2,
  Shield,
  GraduationCap,
  School,
  ClipboardList,
  Layers,
  Landmark,
  Radio,
  HelpCircle,
  ShieldCheck,
  PlusCircle,
  Sliders,
  type LucideIcon,
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  category: string;
  route: string;
  icon: LucideIcon;
  keywords: string;
}

const COMMAND_ITEMS: CommandItem[] = [
  // Menu Utama
  {
    id: '1',
    title: 'Dashboard',
    category: 'Menu Utama',
    route: '/dashboard',
    icon: Home,
    keywords: 'beranda home statistik ringkasan',
  },
  {
    id: '2',
    title: 'Disposisi Saya',
    category: 'Menu Utama',
    route: '/disposisi-saya',
    icon: ClipboardList,
    keywords: 'tugas disposisi tindak lanjut',
  },
  {
    id: '3',
    title: 'Buku Agenda & Rekapitulasi',
    category: 'Menu Utama',
    route: '/agenda-digital',
    icon: BookOpen,
    keywords: 'agenda rekap export excel laporan',
  },

  // Persuratan
  {
    id: '4',
    title: 'Surat Masuk',
    category: 'Persuratan',
    route: '/surat-masuk',
    icon: Inbox,
    keywords: 'surat masuk agenda masuk',
  },
  {
    id: '5',
    title: 'Catat Surat Masuk Baru',
    category: 'Persuratan',
    route: '/surat-masuk/tambah',
    icon: PlusCircle,
    keywords: 'registrasi catat tambah surat masuk',
  },
  {
    id: '6',
    title: 'Surat Keluar (Dinas)',
    category: 'Persuratan',
    route: '/surat-keluar',
    icon: Send,
    keywords: 'surat keluar dinas nota dinas',
  },
  {
    id: '7',
    title: 'Buat Draft Surat Keluar',
    category: 'Persuratan',
    route: '/surat-keluar/create',
    icon: PlusCircle,
    keywords: 'buat draft surat keluar baru',
  },
  {
    id: '8',
    title: 'Surat Kesiswaan',
    category: 'Persuratan',
    route: '/surat-siswa',
    icon: GraduationCap,
    keywords: 'surat siswa kesiswaan',
  },
  {
    id: '9',
    title: 'Buat Surat Dispensasi Siswa',
    category: 'Persuratan',
    route: '/surat-siswa/dispensasi',
    icon: PlusCircle,
    keywords: 'dispensasi lomba izin siswa',
  },
  {
    id: '10',
    title: 'Buat Surat Keterangan Siswa Aktif',
    category: 'Persuratan',
    route: '/surat-siswa/keterangan-aktif',
    icon: PlusCircle,
    keywords: 'keterangan aktif beasiswa siswa',
  },
  {
    id: '11',
    title: 'Buat Surat Panggilan Orang Tua / BK',
    category: 'Persuratan',
    route: '/surat-siswa/panggilan-ortu',
    icon: PlusCircle,
    keywords: 'panggilan orang tua wali murid bk',
  },

  // Master Data
  {
    id: '12',
    title: 'Desain KOP Surat & Logo',
    category: 'Master Data',
    route: '/master/kop-surat',
    icon: Landmark,
    keywords: 'kop surat logo kepala naskah',
  },
  {
    id: '12b',
    title: 'Template & Margin Surat',
    category: 'Master Data',
    route: '/master/template-surat',
    icon: Sliders,
    keywords: 'template margin kertas layout a4 f4 ukuran spasi tipografi',
  },
  {
    id: '13',
    title: 'Data Siswa',
    category: 'Master Data',
    route: '/master/siswa',
    icon: GraduationCap,
    keywords: 'siswa murid peserta didik',
  },
  {
    id: '14',
    title: 'Rombel / Kelas',
    category: 'Master Data',
    route: '/master/kelas',
    icon: School,
    keywords: 'kelas rombel tingkat',
  },
  {
    id: '15',
    title: 'Guru & Pegawai',
    category: 'Master Data',
    route: '/master/pegawai',
    icon: Users,
    keywords: 'guru staf pegawai ptk',
  },
  {
    id: '16',
    title: 'Kode Klasifikasi Surat',
    category: 'Master Data',
    route: '/master/klasifikasi',
    icon: Layers,
    keywords: 'kode klasifikasi penomoran',
  },
  {
    id: '17',
    title: 'Jenis Surat',
    category: 'Master Data',
    route: '/master/jenis-surat',
    icon: FileText,
    keywords: 'jenis surat format',
  },
  {
    id: '18',
    title: 'Daftar Instansi Relasi',
    category: 'Master Data',
    route: '/master/instansi',
    icon: Building2,
    keywords: 'instansi dinas luar pengirim tujuan',
  },

  // Pengaturan & Bantuan
  {
    id: '19',
    title: 'Pengguna & Hak Akses (IAM)',
    category: 'Pengaturan',
    route: '/iam/users',
    icon: Shield,
    keywords: 'user pengguna akun role hak akses',
  },
  {
    id: '20',
    title: 'Gateway Notifikasi WA/Email',
    category: 'Pengaturan',
    route: '/settings/notifikasi',
    icon: Radio,
    keywords: 'whatsapp gateway fonnte wablas email smtp notifikasi',
  },
  {
    id: '21',
    title: 'Portal Verifikasi Dokumen Publik',
    category: 'Pengaturan',
    route: '/verifikasi',
    icon: ShieldCheck,
    keywords: 'verifikasi qr code tte tanda tangan',
  },
  {
    id: '22',
    title: 'Panduan Penggunaan & SOP',
    category: 'Bantuan',
    route: '/bantuan',
    icon: HelpCircle,
    keywords: 'bantuan panduan sop faq petunjuk',
  },
];

export function CommandPaletteTrigger() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return COMMAND_ITEMS;
    const q = query.toLowerCase().trim();
    return COMMAND_ITEMS.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.keywords.toLowerCase().includes(q),
    );
  }, [query]);

  const handleSelect = (route: string) => {
    setOpen(false);
    setQuery('');
    router.push(route);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 px-4 py-2 rounded-lg border border-gray-200 w-full sm:w-64 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left hidden sm:inline-block">Cari menu & surat...</span>
        <span className="text-left sm:hidden">Cari...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-1.5 font-mono text-[10px] font-medium text-gray-500">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-xs flex items-start justify-center pt-[10vh] p-4">
          <div className="fixed inset-0" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-gray-200 z-10 animate-in fade-in zoom-in-95 duration-150">
            {/* Input Header */}
            <div className="flex items-center px-4 border-b border-gray-100 bg-white">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 h-12 bg-transparent border-0 px-3 text-sm focus:outline-none focus:ring-0 text-gray-900 placeholder:text-gray-400"
                placeholder="Ketik menu, registrasi surat, dispensasi, KOP..."
              />
              <button
                onClick={() => setOpen(false)}
                className="text-[10px] font-bold text-gray-400 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
              >
                ESC
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-gray-50">
              {filteredItems.length === 0 ? (
                <div className="py-10 text-center text-xs text-gray-400">
                  Tidak ditemukan menu atau perintah untuk &quot;{query}&quot;
                </div>
              ) : (
                filteredItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.route)}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors text-left group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-1.5 rounded-lg bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 truncate">
                          <p className="font-semibold text-gray-900 group-hover:text-blue-700 truncate">
                            {item.title}
                          </p>
                          <p className="text-[10px] text-gray-400 group-hover:text-blue-500 font-mono truncate">
                            {item.route}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-700 shrink-0 font-medium">
                        {item.category}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer Tip */}
            <div className="p-2.5 border-t border-gray-100 text-[11px] text-gray-400 bg-gray-50 flex items-center justify-between px-4">
              <span>Navigasi Cepat PAWARTA</span>
              <span className="font-mono">ESC untuk tutup</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
