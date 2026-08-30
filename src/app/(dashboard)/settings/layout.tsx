import { hasPermission, isSuperAdmin } from '@/lib/auth/rbac';
import { PERM } from '@/lib/auth/permissions';
import { AccessDenied } from '@/components/shared/access-denied';

export const dynamic = 'force-dynamic';

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, canConfig, canNotif, canLog] = await Promise.all([
    isSuperAdmin(),
    hasPermission(PERM.SISTEM_KONFIGURASI),
    hasPermission(PERM.SISTEM_NOTIFIKASI),
    hasPermission(PERM.SISTEM_LOG_READ),
  ]);

  if (!isAdmin && !canConfig && !canNotif && !canLog) {
    return (
      <AccessDenied
        title="Akses Pengaturan Ditolak"
        message="Halaman pengaturan dan integrasi sistem hanya dapat diakses oleh Administrator Sistem (Super Admin)."
        requiredPermission={PERM.SISTEM_KONFIGURASI}
      />
    );
  }

  return <>{children}</>;
}
