# Struktur Folder PAWARTA

Aplikasi PAWARTA menggunakan **Feature-Based Architecture**. Artinya, sebagian besar logika bisnis dan komponen UI yang spesifik untuk suatu fitur tidak diletakkan secara global, melainkan dienkapsulasi di dalam folder fiturnya masing-masing.

## `src/`

Root dari seluruh kode aplikasi.

- **`app/`**: Folder utama untuk Next.js App Router.
  - `(auth)/`: Route group untuk halaman otentikasi (login, register, dll).
  - `(dashboard)/`: Route group untuk halaman utama aplikasi setelah login.
- **`components/`**: Komponen UI global yang dapat digunakan ulang di seluruh aplikasi.
  - `layout/`: Komponen pembentuk layout (Sidebar, Header, Footer).
  - `ui/`: Komponen dasar UI (Shadcn UI base components seperti Button, Input).
  - `shared/`: Komponen gabungan yang lebih kompleks tapi digunakan lintas fitur.
- **`features/`**: Kumpulan modul/fitur bisnis aplikasi.
  Setiap fitur (misal: `surat-masuk`, `users`) akan memiliki strukturnya sendiri:
  - `components/`: UI khusus fitur ini.
  - `hooks/`: Custom hooks spesifik fitur.
  - `services/`: Panggilan API/Data fetching untuk fitur.
  - `types/`: Definisi tipe TypeScript untuk fitur.
  - `schemas/`: Zod schemas untuk validasi form/API fitur.
  - `actions/`: Next.js Server Actions untuk mutasi data fitur.
  - `constants/`: Nilai statis terkait fitur.
  - `utils/`: Fungsi pembantu spesifik fitur.
- **`lib/`**: Konfigurasi dan inisialisasi *library* pihak ketiga (contoh: konfigurasi Supabase, konfigurasi Auth, instansiasi Axios/Fetch).
- **`hooks/`**: Custom hooks global (contoh: `use-media-query`, `use-local-storage`).
- **`services/`**: Kumpulan fungsi pemanggilan API eksternal yang tidak spesifik pada satu fitur bisnis tertentu.
- **`db/`**: Segala sesuatu yang berhubungan dengan *database*.
  - `schema/`: Definisi skema tabel Drizzle ORM.
  - `index.ts`: File koneksi Drizzle ORM.
- **`types/`**: Definisi tipe TypeScript global (contoh: Response types standar).
- **`utils/`**: Kumpulan fungsi *helper* global (contoh: format tanggal, format uang).
- **`config/`**: Konfigurasi umum aplikasi (environment variables parser, site metadata).
