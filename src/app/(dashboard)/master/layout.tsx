import { hasPermission, isSuperAdmin } from '@/lib/auth/rbac';
import { PERM } from '@/lib/auth/permissions';
import { AccessDenied } from '@/components/shared/access-denied';

export const dynamic = 'force-dynamic';

export default async function MasterLayout({ children }: { children: React.ReactNode }) {
  const [
    isAdmin,
    canPegawai,
    canSiswa,
    canKelas,
    canSekolah,
    canJenis,
    canPenandatangan,
  ] = await Promise.all([
    isSuperAdmin(),
    hasPermission(PERM.MASTER_PEGAWAI_READ),
    hasPermission(PERM.MASTER_SISWA_READ),
    hasPermission(PERM.MASTER_KELAS_READ),
    hasPermission(PERM.MASTER_SEKOLAH_READ),
    hasPermission(PERM.MASTER_JENIS_SURAT_READ),
    hasPermission(PERM.MASTER_PENANDATANGAN_READ),
  ]);

  if (
    !isAdmin &&
    !canPegawai &&
    !canSiswa &&
    !canKelas &&
    !canSekolah &&
    !canJenis &&
    !canPenandatangan
  ) {
    return (
      <AccessDenied
        title="Akses Master Data Ditolak"
        message="Anda tidak memiliki izin untuk membuka atau mengelola data master satuan pendidikan."
        requiredPermission={PERM.MASTER_PEGAWAI_READ}
      />
    );
  }

  return <>{children}</>;
}
