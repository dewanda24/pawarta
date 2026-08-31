/**
 * PAWARTA - Seed Menu Dinamis Lengkap
 * Jalankan: node -r dotenv/config node_modules/tsx/dist/cli.mjs scripts/seed-menu.ts dotenv_config_path=.env.local
 */
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import crypto from 'crypto';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL missing');
const sql = postgres(connectionString);

type MenuDef = {
  nama: string;
  icon?: string;
  route?: string;
  parentNama?: string;
  urutan: number;
  permissionNama?: string;
};

const MENU_DEFS: MenuDef[] = [
  // === ROOT MENUS ===
  { nama: 'Dashboard', icon: 'LayoutDashboard', route: '/dashboard', urutan: 1 },
  { nama: 'Surat Masuk', icon: 'Inbox', route: '/surat-masuk', urutan: 2, permissionNama: 'SURAT_MASUK_READ' },
  { nama: 'Surat Keluar', icon: 'Send', route: '/surat-keluar', urutan: 3, permissionNama: 'SURAT_KELUAR_READ' },
  { nama: 'Surat Siswa', icon: 'GraduationCap', route: '/surat-siswa', urutan: 4, permissionNama: 'SURAT_SISWA_READ' },
  { nama: 'Disposisi Saya', icon: 'ClipboardList', route: '/disposisi-saya', urutan: 5, permissionNama: 'SURAT_MASUK_DISPOSISI_SAYA' },
  { nama: 'Agenda Digital', icon: 'Archive', route: '/agenda-digital', urutan: 6, permissionNama: 'ARSIP_READ' },
  { nama: 'Master Data', icon: 'Database', urutan: 7, permissionNama: 'MASTER_PEGAWAI_READ' },
  { nama: 'IAM', icon: 'Users', urutan: 8, permissionNama: 'IAM_USER_READ' },
  { nama: 'Pengaturan', icon: 'Settings', urutan: 9, permissionNama: 'SISTEM_KONFIGURASI' },
  { nama: 'Bantuan', icon: 'HelpCircle', route: '/bantuan', urutan: 10 },

  // === CHILD: Surat Masuk ===
  { nama: 'Semua Surat Masuk', icon: 'List', route: '/surat-masuk', parentNama: 'Surat Masuk', urutan: 1, permissionNama: 'SURAT_MASUK_READ' },
  { nama: 'Tambah Surat Masuk', icon: 'Plus', route: '/surat-masuk/tambah', parentNama: 'Surat Masuk', urutan: 2, permissionNama: 'SURAT_MASUK_CREATE' },

  // === CHILD: Surat Keluar ===
  { nama: 'Semua Surat Keluar', icon: 'List', route: '/surat-keluar', parentNama: 'Surat Keluar', urutan: 1, permissionNama: 'SURAT_KELUAR_READ' },
  { nama: 'Buat Surat Baru', icon: 'PenLine', route: '/surat-keluar/create', parentNama: 'Surat Keluar', urutan: 2, permissionNama: 'SURAT_KELUAR_CREATE' },

  // === CHILD: Surat Siswa ===
  { nama: 'Semua Surat Siswa', icon: 'List', route: '/surat-siswa', parentNama: 'Surat Siswa', urutan: 1, permissionNama: 'SURAT_SISWA_READ' },
  { nama: 'Dispensasi', icon: 'FileText', route: '/surat-siswa/dispensasi', parentNama: 'Surat Siswa', urutan: 2, permissionNama: 'SURAT_SISWA_CREATE' },
  { nama: 'Keterangan Aktif', icon: 'FileCheck', route: '/surat-siswa/keterangan-aktif', parentNama: 'Surat Siswa', urutan: 3, permissionNama: 'SURAT_SISWA_CREATE' },
  { nama: 'Panggilan Orang Tua', icon: 'UserCheck', route: '/surat-siswa/panggilan-ortu', parentNama: 'Surat Siswa', urutan: 4, permissionNama: 'SURAT_SISWA_CREATE' },
  { nama: 'Persetujuan 5 Hari Kerja', icon: 'CalendarCheck', route: '/surat-siswa/persetujuan-5-hari-kerja', parentNama: 'Surat Siswa', urutan: 5, permissionNama: 'SURAT_SISWA_CREATE' },

  // === CHILD: Master Data ===
  { nama: 'Data Sekolah', icon: 'School', route: '/master/sekolah', parentNama: 'Master Data', urutan: 1, permissionNama: 'MASTER_SEKOLAH_READ' },
  { nama: 'Pegawai', icon: 'Users', route: '/master/pegawai', parentNama: 'Master Data', urutan: 2, permissionNama: 'MASTER_PEGAWAI_READ' },
  { nama: 'Jabatan', icon: 'Briefcase', route: '/master/jabatan', parentNama: 'Master Data', urutan: 3, permissionNama: 'MASTER_JABATAN_READ' },
  { nama: 'Unit Kerja', icon: 'Building2', route: '/master/unit-kerja', parentNama: 'Master Data', urutan: 4, permissionNama: 'MASTER_UNIT_KERJA_READ' },
  { nama: 'Instansi', icon: 'Building', route: '/master/instansi', parentNama: 'Master Data', urutan: 5, permissionNama: 'MASTER_INSTANSI_READ' },
  { nama: 'Kelas', icon: 'DoorOpen', route: '/master/kelas', parentNama: 'Master Data', urutan: 6, permissionNama: 'MASTER_KELAS_READ' },
  { nama: 'Siswa', icon: 'UserSquare', route: '/master/siswa', parentNama: 'Master Data', urutan: 7, permissionNama: 'MASTER_SISWA_READ' },
  { nama: 'Jenis Surat', icon: 'FileType', route: '/master/jenis-surat', parentNama: 'Master Data', urutan: 8, permissionNama: 'MASTER_JENIS_SURAT_READ' },
  { nama: 'Klasifikasi Surat', icon: 'FolderTree', route: '/master/klasifikasi', parentNama: 'Master Data', urutan: 9, permissionNama: 'MASTER_KLASIFIKASI_READ' },
  { nama: 'Penandatangan', icon: 'PenTool', route: '/master/penandatangan', parentNama: 'Master Data', urutan: 10, permissionNama: 'MASTER_PENANDATANGAN_READ' },
  { nama: 'Kop Surat', icon: 'Heading', route: '/master/kop-surat', parentNama: 'Master Data', urutan: 11, permissionNama: 'MASTER_KOP_SURAT_READ' },
  { nama: 'Template Surat', icon: 'LayoutTemplate', route: '/master/template-surat', parentNama: 'Master Data', urutan: 12, permissionNama: 'MASTER_TEMPLATE_READ' },
  { nama: 'Prioritas', icon: 'Flag', route: '/master/prioritas', parentNama: 'Master Data', urutan: 13, permissionNama: 'MASTER_PRIORITAS_READ' },
  { nama: 'Sifat Surat', icon: 'ShieldCheck', route: '/master/sifat-surat', parentNama: 'Master Data', urutan: 14, permissionNama: 'MASTER_SIFAT_SURAT_READ' },

  // === CHILD: IAM ===
  { nama: 'Pengguna', icon: 'User', route: '/iam/users', parentNama: 'IAM', urutan: 1, permissionNama: 'IAM_USER_READ' },
  { nama: 'Role & Permission', icon: 'ShieldHalf', route: '/iam/role-matrix', parentNama: 'IAM', urutan: 2, permissionNama: 'IAM_ROLE_READ' },
  { nama: 'Log Login', icon: 'Activity', route: '/iam/login-logs', parentNama: 'IAM', urutan: 3, permissionNama: 'IAM_LOGIN_LOG_READ' },

  // === CHILD: Pengaturan ===
  { nama: 'Konfigurasi Sistem', icon: 'SlidersHorizontal', route: '/settings', parentNama: 'Pengaturan', urutan: 1, permissionNama: 'SISTEM_KONFIGURASI' },
  { nama: 'Notifikasi', icon: 'Bell', route: '/settings/notifikasi', parentNama: 'Pengaturan', urutan: 2, permissionNama: 'SISTEM_NOTIFIKASI' },
  { nama: 'API & Integrasi', icon: 'Plug', route: '/settings/api', parentNama: 'Pengaturan', urutan: 3, permissionNama: 'SISTEM_API_KEY' },
  { nama: 'Backup & Restore', icon: 'HardDrive', route: '/settings/backup', parentNama: 'Pengaturan', urutan: 4, permissionNama: 'SISTEM_BACKUP' },
  { nama: 'Activity Log', icon: 'ScrollText', route: '/settings/activity-logs', parentNama: 'Pengaturan', urutan: 5, permissionNama: 'SISTEM_LOG_READ' },
];

async function main() {
  console.log('\n--- PAWARTA: Seeding Seluruh Menu Navigasi ---\n');
  try {
    const allPerms = await sql`SELECT id, nama FROM permissions;`;
    const permMap = new Map(allPerms.map((p) => [p.nama, p.id]));
    console.log('[Info] Total permission di DB:', permMap.size);

    // 1. Bersihkan tabel menus
    await sql`DELETE FROM menus;`;
    console.log('[Info] Tabel menus dibersihkan.');

    // 2. Insert Root Menus
    const rootMenus = MENU_DEFS.filter((m) => !m.parentNama);
    const menuIdMap = new Map<string, string>();

    console.log('\n[1/2] Menambahkan Root Menus...');
    for (const menu of rootMenus) {
      const permissionId = menu.permissionNama ? permMap.get(menu.permissionNama) || null : null;
      const id = crypto.randomUUID();
      await sql`
        INSERT INTO menus (id, nama, icon, route, urutan, permission_id, is_aktif)
        VALUES (${id}, ${menu.nama}, ${menu.icon || null}, ${menu.route || null}, ${menu.urutan}, ${permissionId}, true);
      `;
      menuIdMap.set(menu.nama, id);
      console.log(`  + [Root] ${menu.nama}`);
    }

    // 3. Insert Child Menus
    console.log('\n[2/2] Menambahkan Child Menus...');
    const childMenus = MENU_DEFS.filter((m) => m.parentNama);
    for (const menu of childMenus) {
      const parentId = menuIdMap.get(menu.parentNama!);
      if (!parentId) {
        console.warn(`  [Warning] Parent ${menu.parentNama} tidak ditemukan untuk ${menu.nama}`);
        continue;
      }
      const permissionId = menu.permissionNama ? permMap.get(menu.permissionNama) || null : null;
      const id = crypto.randomUUID();
      await sql`
        INSERT INTO menus (id, nama, icon, route, parent_id, urutan, permission_id, is_aktif)
        VALUES (${id}, ${menu.nama}, ${menu.icon || null}, ${menu.route || null}, ${parentId}, ${menu.urutan}, ${permissionId}, true);
      `;
      console.log(`  └─ [Sub] ${menu.parentNama} > ${menu.nama} (${menu.route})`);
    }

    const count = await sql`SELECT count(*) FROM menus;`;
    console.log(`\n✅ Menu Seeding Selesai 100%! Total menu aktif: ${count[0].count}\n`);
  } catch (error) {
    console.error('Error saat seeding menu:', error);
    process.exit(1);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

main();
