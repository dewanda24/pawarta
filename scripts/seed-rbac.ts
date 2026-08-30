/**
 * PAWARTA - Seed RBAC Lengkap
 * Menginisialisasi 6 role, 65+ permission, dan matriks assign per role.
 * Jalankan: npx tsx scripts/seed-rbac.ts
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema';
import * as dotenv from 'dotenv';
import crypto from 'crypto';
import { eq, and } from 'drizzle-orm';

dotenv.config({ path: '.env.local' });
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL missing');
const client = postgres(connectionString, { max: 1 });
const db = drizzle(client, { schema });

const ROLE_DEFS = [
  { namaRole: 'Super Admin', deskripsi: 'Administrator sistem dengan akses penuh ke semua fitur', warnaBadge: 'red', urutan: 1 },
  { namaRole: 'Kepala Sekolah', deskripsi: 'Penandatangan utama, approver final, dapat melihat semua data', warnaBadge: 'purple', urutan: 2 },
  { namaRole: 'Kepala Tata Usaha', deskripsi: 'Mengelola administrasi surat masuk, distribusi, registrasi, dan data master', warnaBadge: 'yellow', urutan: 3 },
  { namaRole: 'Staf TU', deskripsi: 'Operator surat: input surat masuk/keluar, upload lampiran, buat draft', warnaBadge: 'green', urutan: 4 },
  { namaRole: 'Guru', deskripsi: 'Membuat surat terkait siswa, menerima disposisi', warnaBadge: 'blue', urutan: 5 },
  { namaRole: 'Arsiparis', deskripsi: 'Mengelola arsip digital, kebijakan retensi, dan peminjaman arsip', warnaBadge: 'orange', urutan: 6 },
];

const ALL_PERMISSIONS = [
  // Master Data: Sekolah
  { nama: 'MASTER_SEKOLAH_READ', modul: 'Master Data', deskripsi: 'Lihat data sekolah' },
  { nama: 'MASTER_SEKOLAH_UPDATE', modul: 'Master Data', deskripsi: 'Ubah data sekolah' },
  // Master Data: Pegawai
  { nama: 'MASTER_PEGAWAI_READ', modul: 'Master Data', deskripsi: 'Lihat data pegawai' },
  { nama: 'MASTER_PEGAWAI_CREATE', modul: 'Master Data', deskripsi: 'Tambah data pegawai' },
  { nama: 'MASTER_PEGAWAI_UPDATE', modul: 'Master Data', deskripsi: 'Ubah data pegawai' },
  { nama: 'MASTER_PEGAWAI_DELETE', modul: 'Master Data', deskripsi: 'Hapus data pegawai' },
  // Master Data: Jabatan
  { nama: 'MASTER_JABATAN_READ', modul: 'Master Data', deskripsi: 'Lihat data jabatan' },
  { nama: 'MASTER_JABATAN_CREATE', modul: 'Master Data', deskripsi: 'Tambah data jabatan' },
  { nama: 'MASTER_JABATAN_UPDATE', modul: 'Master Data', deskripsi: 'Ubah data jabatan' },
  { nama: 'MASTER_JABATAN_DELETE', modul: 'Master Data', deskripsi: 'Hapus data jabatan' },
  // Master Data: Unit Kerja
  { nama: 'MASTER_UNIT_KERJA_READ', modul: 'Master Data', deskripsi: 'Lihat data unit kerja' },
  { nama: 'MASTER_UNIT_KERJA_CREATE', modul: 'Master Data', deskripsi: 'Tambah data unit kerja' },
  { nama: 'MASTER_UNIT_KERJA_UPDATE', modul: 'Master Data', deskripsi: 'Ubah data unit kerja' },
  { nama: 'MASTER_UNIT_KERJA_DELETE', modul: 'Master Data', deskripsi: 'Hapus data unit kerja' },
  // Master Data: Instansi
  { nama: 'MASTER_INSTANSI_READ', modul: 'Master Data', deskripsi: 'Lihat data instansi' },
  { nama: 'MASTER_INSTANSI_CREATE', modul: 'Master Data', deskripsi: 'Tambah data instansi' },
  { nama: 'MASTER_INSTANSI_UPDATE', modul: 'Master Data', deskripsi: 'Ubah data instansi' },
  { nama: 'MASTER_INSTANSI_DELETE', modul: 'Master Data', deskripsi: 'Hapus data instansi' },
  // Master Data: Kelas
  { nama: 'MASTER_KELAS_READ', modul: 'Master Data', deskripsi: 'Lihat data kelas' },
  { nama: 'MASTER_KELAS_CREATE', modul: 'Master Data', deskripsi: 'Tambah data kelas' },
  { nama: 'MASTER_KELAS_UPDATE', modul: 'Master Data', deskripsi: 'Ubah data kelas' },
  { nama: 'MASTER_KELAS_DELETE', modul: 'Master Data', deskripsi: 'Hapus data kelas' },
  // Master Data: Siswa
  { nama: 'MASTER_SISWA_READ', modul: 'Master Data', deskripsi: 'Lihat data siswa' },
  { nama: 'MASTER_SISWA_CREATE', modul: 'Master Data', deskripsi: 'Tambah data siswa' },
  { nama: 'MASTER_SISWA_UPDATE', modul: 'Master Data', deskripsi: 'Ubah data siswa' },
  { nama: 'MASTER_SISWA_DELETE', modul: 'Master Data', deskripsi: 'Hapus data siswa' },
  // Master Data: Jenis Surat
  { nama: 'MASTER_JENIS_SURAT_READ', modul: 'Master Data', deskripsi: 'Lihat jenis surat' },
  { nama: 'MASTER_JENIS_SURAT_CREATE', modul: 'Master Data', deskripsi: 'Tambah jenis surat' },
  { nama: 'MASTER_JENIS_SURAT_UPDATE', modul: 'Master Data', deskripsi: 'Ubah jenis surat' },
  { nama: 'MASTER_JENIS_SURAT_DELETE', modul: 'Master Data', deskripsi: 'Hapus jenis surat' },
  // Master Data: Klasifikasi Surat
  { nama: 'MASTER_KLASIFIKASI_READ', modul: 'Master Data', deskripsi: 'Lihat klasifikasi surat' },
  { nama: 'MASTER_KLASIFIKASI_CREATE', modul: 'Master Data', deskripsi: 'Tambah klasifikasi surat' },
  { nama: 'MASTER_KLASIFIKASI_UPDATE', modul: 'Master Data', deskripsi: 'Ubah klasifikasi surat' },
  { nama: 'MASTER_KLASIFIKASI_DELETE', modul: 'Master Data', deskripsi: 'Hapus klasifikasi surat' },
  // Master Data: Penandatangan
  { nama: 'MASTER_PENANDATANGAN_READ', modul: 'Master Data', deskripsi: 'Lihat penandatangan' },
  { nama: 'MASTER_PENANDATANGAN_CREATE', modul: 'Master Data', deskripsi: 'Tambah penandatangan' },
  { nama: 'MASTER_PENANDATANGAN_UPDATE', modul: 'Master Data', deskripsi: 'Ubah penandatangan' },
  { nama: 'MASTER_PENANDATANGAN_DELETE', modul: 'Master Data', deskripsi: 'Hapus penandatangan' },
  // Master Data: Kop Surat
  { nama: 'MASTER_KOP_SURAT_READ', modul: 'Master Data', deskripsi: 'Lihat kop surat' },
  { nama: 'MASTER_KOP_SURAT_CREATE', modul: 'Master Data', deskripsi: 'Tambah kop surat' },
  { nama: 'MASTER_KOP_SURAT_UPDATE', modul: 'Master Data', deskripsi: 'Ubah kop surat' },
  { nama: 'MASTER_KOP_SURAT_DELETE', modul: 'Master Data', deskripsi: 'Hapus kop surat' },
  // Master Data: Template Surat
  { nama: 'MASTER_TEMPLATE_READ', modul: 'Master Data', deskripsi: 'Lihat template surat' },
  { nama: 'MASTER_TEMPLATE_CREATE', modul: 'Master Data', deskripsi: 'Tambah template surat' },
  { nama: 'MASTER_TEMPLATE_UPDATE', modul: 'Master Data', deskripsi: 'Ubah template surat' },
  { nama: 'MASTER_TEMPLATE_DELETE', modul: 'Master Data', deskripsi: 'Hapus template surat' },
  // Master Data: Prioritas & Sifat Surat
  { nama: 'MASTER_PRIORITAS_READ', modul: 'Master Data', deskripsi: 'Lihat data prioritas surat' },
  { nama: 'MASTER_PRIORITAS_MANAGE', modul: 'Master Data', deskripsi: 'Kelola data prioritas surat' },
  { nama: 'MASTER_SIFAT_SURAT_READ', modul: 'Master Data', deskripsi: 'Lihat data sifat surat' },
  { nama: 'MASTER_SIFAT_SURAT_MANAGE', modul: 'Master Data', deskripsi: 'Kelola data sifat surat' },
  // Surat Masuk
  { nama: 'SURAT_MASUK_READ', modul: 'Surat Masuk', deskripsi: 'Lihat daftar surat masuk' },
  { nama: 'SURAT_MASUK_CREATE', modul: 'Surat Masuk', deskripsi: 'Input surat masuk baru' },
  { nama: 'SURAT_MASUK_UPDATE', modul: 'Surat Masuk', deskripsi: 'Ubah data surat masuk' },
  { nama: 'SURAT_MASUK_DELETE', modul: 'Surat Masuk', deskripsi: 'Hapus surat masuk' },
  { nama: 'SURAT_MASUK_UPLOAD_LAMPIRAN', modul: 'Surat Masuk', deskripsi: 'Upload lampiran surat masuk' },
  { nama: 'SURAT_MASUK_DISTRIBUSI', modul: 'Surat Masuk', deskripsi: 'Distribusi surat ke unit/pegawai' },
  { nama: 'SURAT_MASUK_DISPOSISI', modul: 'Surat Masuk', deskripsi: 'Beri instruksi disposisi' },
  { nama: 'SURAT_MASUK_DISPOSISI_SAYA', modul: 'Surat Masuk', deskripsi: 'Lihat disposisi yang ditugaskan ke saya' },
  { nama: 'SURAT_MASUK_AGENDA', modul: 'Surat Masuk', deskripsi: 'Kelola buku agenda surat masuk' },
  // Surat Keluar
  { nama: 'SURAT_KELUAR_READ', modul: 'Surat Keluar', deskripsi: 'Lihat daftar surat keluar' },
  { nama: 'SURAT_KELUAR_CREATE', modul: 'Surat Keluar', deskripsi: 'Buat draft surat keluar baru' },
  { nama: 'SURAT_KELUAR_UPDATE', modul: 'Surat Keluar', deskripsi: 'Edit draft surat keluar' },
  { nama: 'SURAT_KELUAR_DELETE', modul: 'Surat Keluar', deskripsi: 'Hapus surat keluar' },
  { nama: 'SURAT_KELUAR_SUBMIT', modul: 'Surat Keluar', deskripsi: 'Ajukan surat ke atasan untuk review' },
  { nama: 'SURAT_KELUAR_REVIEW', modul: 'Surat Keluar', deskripsi: 'Periksa surat yang diajukan' },
  { nama: 'SURAT_KELUAR_APPROVE', modul: 'Surat Keluar', deskripsi: 'Setujui atau tolak surat' },
  { nama: 'SURAT_KELUAR_TTD', modul: 'Surat Keluar', deskripsi: 'Tanda tangani surat' },
  { nama: 'SURAT_KELUAR_PUBLISH', modul: 'Surat Keluar', deskripsi: 'Terbitkan surat dengan nomor resmi' },
  { nama: 'SURAT_KELUAR_DISTRIBUSI', modul: 'Surat Keluar', deskripsi: 'Kirim surat ke penerima eksternal' },
  // Surat Siswa
  { nama: 'SURAT_SISWA_READ', modul: 'Surat Siswa', deskripsi: 'Lihat surat terkait siswa' },
  { nama: 'SURAT_SISWA_CREATE', modul: 'Surat Siswa', deskripsi: 'Buat surat terkait siswa' },
  { nama: 'SURAT_SISWA_UPDATE', modul: 'Surat Siswa', deskripsi: 'Ubah surat terkait siswa' },
  { nama: 'SURAT_SISWA_DELETE', modul: 'Surat Siswa', deskripsi: 'Hapus surat terkait siswa' },
  { nama: 'SURAT_SISWA_APPROVE', modul: 'Surat Siswa', deskripsi: 'Setujui dan tanda tangani surat siswa' },
  // Arsip Digital
  { nama: 'ARSIP_READ', modul: 'Arsip Digital', deskripsi: 'Lihat daftar arsip digital' },
  { nama: 'ARSIP_CREATE', modul: 'Arsip Digital', deskripsi: 'Tambah arsip baru' },
  { nama: 'ARSIP_UPDATE', modul: 'Arsip Digital', deskripsi: 'Ubah data arsip' },
  { nama: 'ARSIP_DELETE', modul: 'Arsip Digital', deskripsi: 'Hapus arsip' },
  { nama: 'ARSIP_PINJAM', modul: 'Arsip Digital', deskripsi: 'Ajukan peminjaman arsip' },
  { nama: 'ARSIP_APPROVE_PINJAM', modul: 'Arsip Digital', deskripsi: 'Setujui atau tolak peminjaman arsip' },
  { nama: 'ARSIP_RETENSI', modul: 'Arsip Digital', deskripsi: 'Kelola kebijakan retensi (JRA)' },
  { nama: 'ARSIP_MUSNAH', modul: 'Arsip Digital', deskripsi: 'Eksekusi pemusnahan arsip' },
  // IAM
  { nama: 'IAM_USER_READ', modul: 'IAM', deskripsi: 'Lihat daftar pengguna sistem' },
  { nama: 'IAM_USER_CREATE', modul: 'IAM', deskripsi: 'Tambah pengguna baru' },
  { nama: 'IAM_USER_UPDATE', modul: 'IAM', deskripsi: 'Ubah data pengguna' },
  { nama: 'IAM_USER_DELETE', modul: 'IAM', deskripsi: 'Hapus pengguna' },
  { nama: 'IAM_USER_RESET_PASSWORD', modul: 'IAM', deskripsi: 'Reset password pengguna lain' },
  { nama: 'IAM_ROLE_READ', modul: 'IAM', deskripsi: 'Lihat daftar role dan permission' },
  { nama: 'IAM_ROLE_MANAGE', modul: 'IAM', deskripsi: 'Kelola role dan permission (tambah/ubah/assign)' },
  { nama: 'IAM_LOGIN_LOG_READ', modul: 'IAM', deskripsi: 'Lihat log login pengguna' },
  // Sistem & Pengaturan
  { nama: 'SISTEM_KONFIGURASI', modul: 'Sistem', deskripsi: 'Ubah konfigurasi sistem' },
  { nama: 'SISTEM_NOTIFIKASI', modul: 'Sistem', deskripsi: 'Kelola template email dan saluran notifikasi' },
  { nama: 'SISTEM_API_KEY', modul: 'Sistem', deskripsi: 'Kelola API Keys' },
  { nama: 'SISTEM_WEBHOOK', modul: 'Sistem', deskripsi: 'Kelola Webhook dan Integrasi' },
  { nama: 'SISTEM_AUTOMATION', modul: 'Sistem', deskripsi: 'Kelola aturan otomatisasi (Rule Engine)' },
  { nama: 'SISTEM_BACKUP', modul: 'Sistem', deskripsi: 'Lakukan backup dan restore sistem' },
  { nama: 'SISTEM_LOG_READ', modul: 'Sistem', deskripsi: 'Lihat activity log dan audit trail sistem' },
];

const ROLE_PERMISSIONS = {
  'Kepala Sekolah': [
    'MASTER_SEKOLAH_READ','MASTER_PEGAWAI_READ','MASTER_JABATAN_READ','MASTER_UNIT_KERJA_READ',
    'MASTER_INSTANSI_READ','MASTER_KELAS_READ','MASTER_SISWA_READ','MASTER_JENIS_SURAT_READ',
    'MASTER_KLASIFIKASI_READ','MASTER_PENANDATANGAN_READ','MASTER_KOP_SURAT_READ',
    'MASTER_TEMPLATE_READ','MASTER_PRIORITAS_READ','MASTER_SIFAT_SURAT_READ',
    'SURAT_MASUK_READ','SURAT_MASUK_DISTRIBUSI','SURAT_MASUK_DISPOSISI','SURAT_MASUK_DISPOSISI_SAYA',
    'SURAT_KELUAR_READ','SURAT_KELUAR_CREATE','SURAT_KELUAR_UPDATE','SURAT_KELUAR_SUBMIT',
    'SURAT_KELUAR_REVIEW','SURAT_KELUAR_APPROVE','SURAT_KELUAR_TTD','SURAT_KELUAR_PUBLISH',
    'SURAT_SISWA_READ','SURAT_SISWA_APPROVE',
    'ARSIP_READ','ARSIP_PINJAM',
    'IAM_USER_READ','IAM_ROLE_READ',
  ],
  'Kepala Tata Usaha': [
    'MASTER_SEKOLAH_READ','MASTER_SEKOLAH_UPDATE',
    'MASTER_PEGAWAI_READ','MASTER_PEGAWAI_CREATE','MASTER_PEGAWAI_UPDATE','MASTER_PEGAWAI_DELETE',
    'MASTER_JABATAN_READ','MASTER_JABATAN_CREATE','MASTER_JABATAN_UPDATE','MASTER_JABATAN_DELETE',
    'MASTER_UNIT_KERJA_READ','MASTER_UNIT_KERJA_CREATE','MASTER_UNIT_KERJA_UPDATE','MASTER_UNIT_KERJA_DELETE',
    'MASTER_INSTANSI_READ','MASTER_INSTANSI_CREATE','MASTER_INSTANSI_UPDATE','MASTER_INSTANSI_DELETE',
    'MASTER_KELAS_READ','MASTER_KELAS_CREATE','MASTER_KELAS_UPDATE','MASTER_KELAS_DELETE',
    'MASTER_SISWA_READ','MASTER_SISWA_CREATE','MASTER_SISWA_UPDATE','MASTER_SISWA_DELETE',
    'MASTER_JENIS_SURAT_READ','MASTER_JENIS_SURAT_CREATE','MASTER_JENIS_SURAT_UPDATE','MASTER_JENIS_SURAT_DELETE',
    'MASTER_KLASIFIKASI_READ','MASTER_KLASIFIKASI_CREATE','MASTER_KLASIFIKASI_UPDATE','MASTER_KLASIFIKASI_DELETE',
    'MASTER_PENANDATANGAN_READ','MASTER_PENANDATANGAN_CREATE','MASTER_PENANDATANGAN_UPDATE','MASTER_PENANDATANGAN_DELETE',
    'MASTER_KOP_SURAT_READ','MASTER_KOP_SURAT_CREATE','MASTER_KOP_SURAT_UPDATE','MASTER_KOP_SURAT_DELETE',
    'MASTER_TEMPLATE_READ','MASTER_TEMPLATE_CREATE','MASTER_TEMPLATE_UPDATE','MASTER_TEMPLATE_DELETE',
    'MASTER_PRIORITAS_READ','MASTER_PRIORITAS_MANAGE','MASTER_SIFAT_SURAT_READ','MASTER_SIFAT_SURAT_MANAGE',
    'SURAT_MASUK_READ','SURAT_MASUK_CREATE','SURAT_MASUK_UPDATE','SURAT_MASUK_UPLOAD_LAMPIRAN',
    'SURAT_MASUK_DISTRIBUSI','SURAT_MASUK_DISPOSISI','SURAT_MASUK_DISPOSISI_SAYA','SURAT_MASUK_AGENDA',
    'SURAT_KELUAR_READ','SURAT_KELUAR_CREATE','SURAT_KELUAR_UPDATE','SURAT_KELUAR_SUBMIT',
    'SURAT_KELUAR_REVIEW','SURAT_KELUAR_PUBLISH','SURAT_KELUAR_DISTRIBUSI',
    'SURAT_SISWA_READ','SURAT_SISWA_CREATE','SURAT_SISWA_UPDATE',
    'ARSIP_READ','ARSIP_CREATE','ARSIP_UPDATE','ARSIP_PINJAM','ARSIP_APPROVE_PINJAM',
    'IAM_USER_READ','IAM_USER_CREATE','IAM_USER_UPDATE','IAM_ROLE_READ','IAM_LOGIN_LOG_READ',
    'SISTEM_LOG_READ',
  ],
  'Staf TU': [
    'MASTER_SEKOLAH_READ','MASTER_PEGAWAI_READ','MASTER_JABATAN_READ','MASTER_UNIT_KERJA_READ',
    'MASTER_INSTANSI_READ','MASTER_KELAS_READ','MASTER_KELAS_UPDATE',
    'MASTER_SISWA_READ','MASTER_SISWA_CREATE','MASTER_SISWA_UPDATE',
    'MASTER_JENIS_SURAT_READ','MASTER_KLASIFIKASI_READ','MASTER_PENANDATANGAN_READ',
    'MASTER_KOP_SURAT_READ','MASTER_TEMPLATE_READ','MASTER_PRIORITAS_READ','MASTER_SIFAT_SURAT_READ',
    'SURAT_MASUK_READ','SURAT_MASUK_CREATE','SURAT_MASUK_UPDATE','SURAT_MASUK_UPLOAD_LAMPIRAN',
    'SURAT_MASUK_DISTRIBUSI','SURAT_MASUK_DISPOSISI_SAYA','SURAT_MASUK_AGENDA',
    'SURAT_KELUAR_READ','SURAT_KELUAR_CREATE','SURAT_KELUAR_UPDATE','SURAT_KELUAR_SUBMIT',
    'SURAT_SISWA_READ','SURAT_SISWA_CREATE','SURAT_SISWA_UPDATE',
    'ARSIP_READ','ARSIP_PINJAM',
  ],
  'Guru': [
    'MASTER_KELAS_READ','MASTER_SISWA_READ','MASTER_PEGAWAI_READ',
    'MASTER_JENIS_SURAT_READ','MASTER_PRIORITAS_READ','MASTER_SIFAT_SURAT_READ',
    'SURAT_MASUK_DISPOSISI_SAYA',
    'SURAT_SISWA_READ','SURAT_SISWA_CREATE','SURAT_SISWA_UPDATE',
  ],
  'Arsiparis': [
    'MASTER_JENIS_SURAT_READ','MASTER_KLASIFIKASI_READ','MASTER_UNIT_KERJA_READ','MASTER_PEGAWAI_READ',
    'ARSIP_READ','ARSIP_CREATE','ARSIP_UPDATE','ARSIP_DELETE',
    'ARSIP_PINJAM','ARSIP_APPROVE_PINJAM','ARSIP_RETENSI','ARSIP_MUSNAH',
    'SURAT_MASUK_READ','SURAT_MASUK_AGENDA','SURAT_KELUAR_READ',
  ],
};

async function upsertRole(roleDef) {
  const existing = await db.query.roles.findFirst({ where: eq(schema.roles.namaRole, roleDef.namaRole) });
  if (existing) {
    await db.update(schema.roles).set({ deskripsi: roleDef.deskripsi, warnaBadge: roleDef.warnaBadge, urutan: roleDef.urutan, isAktif: true, updatedAt: new Date() }).where(eq(schema.roles.id, existing.id));
    console.log('  [update] Role:', roleDef.namaRole);
    return existing;
  }
  const [created] = await db.insert(schema.roles).values({ id: crypto.randomUUID(), ...roleDef, isAktif: true }).returning();
  console.log('  [create] Role:', roleDef.namaRole);
  return created;
}

async function upsertPermission(permDef) {
  const existing = await db.query.permissions.findFirst({ where: eq(schema.permissions.nama, permDef.nama) });
  if (existing) {
    await db.update(schema.permissions).set({ deskripsi: permDef.deskripsi, modul: permDef.modul, updatedAt: new Date() }).where(eq(schema.permissions.id, existing.id));
    return existing;
  }
  const [created] = await db.insert(schema.permissions).values({ id: crypto.randomUUID(), ...permDef }).returning();
  return created;
}

async function assignPermissionToRole(roleId, permissionId) {
  const existing = await db.query.rolePermissions.findFirst({
    where: and(eq(schema.rolePermissions.roleId, roleId), eq(schema.rolePermissions.permissionId, permissionId)),
  });
  if (!existing) {
    await db.insert(schema.rolePermissions).values({ id: crypto.randomUUID(), roleId, permissionId });
  }
}

async function main() {
  console.log('\n PAWARTA - Seed RBAC Lengkap\n');
  try {
    console.log('[1/4] Menyiapkan Roles...');
    const roleMap = new Map();
    for (const roleDef of ROLE_DEFS) {
      const role = await upsertRole(roleDef);
      roleMap.set(role.namaRole, role);
    }

    console.log('\n[2/4] Menyiapkan Permissions...');
    const permMap = new Map();
    for (const permDef of ALL_PERMISSIONS) {
      const perm = await upsertPermission(permDef);
      permMap.set(perm.nama, perm);
    }
    console.log('  ->', permMap.size, 'permissions siap.');

    console.log('\n[3/4] Assign Permission per Role...');
    const superAdmin = roleMap.get('Super Admin');
    if (superAdmin) {
      for (const perm of permMap.values()) await assignPermissionToRole(superAdmin.id, perm.id);
      console.log('  [Super Admin] ->', permMap.size, 'permissions');
    }
    for (const [roleName, permNames] of Object.entries(ROLE_PERMISSIONS)) {
      const role = roleMap.get(roleName);
      if (!role) { console.warn('  Role tidak ditemukan:', roleName); continue; }
      let count = 0;
      for (const permName of permNames) {
        const perm = permMap.get(permName);
        if (!perm) { console.warn('    Permission tidak ditemukan:', permName); continue; }
        await assignPermissionToRole(role.id, perm.id);
        count++;
      }
      console.log('  [' + roleName + '] ->', count, 'permissions');
    }

    console.log('\n[4/4] Assign Super Admin ke User Pertama...');
    const firstUser = await db.query.users.findFirst();
    const superAdminRole = roleMap.get('Super Admin');
    if (firstUser && superAdminRole) {
      const existing = await db.query.userRoles.findFirst({
        where: and(eq(schema.userRoles.userId, firstUser.id), eq(schema.userRoles.roleId, superAdminRole.id)),
      });
      if (!existing) {
        await db.insert(schema.userRoles).values({ id: crypto.randomUUID(), userId: firstUser.id, roleId: superAdminRole.id });
        console.log('  OK: Super Admin ->', firstUser.username);
      } else {
        console.log(' ', firstUser.username, 'sudah Super Admin.');
      }
    } else {
      console.warn('  Tidak ada user untuk assign Super Admin.');
    }

    console.log('\n RBAC Seeding selesai!\n');
  } catch (error) {
    console.error('\n Error saat seeding RBAC:', error);
    process.exit(1);
  } finally {
    await client.end();
    process.exit(0);
  }
}

main();
