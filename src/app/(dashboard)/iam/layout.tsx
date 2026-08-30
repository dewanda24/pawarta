import { hasPermission, isSuperAdmin } from '@/lib/auth/rbac';
import { PERM } from '@/lib/auth/permissions';
import { AccessDenied } from '@/components/shared/access-denied';

export const dynamic = 'force-dynamic';

export default async function IAMLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, canReadUsers, canReadRoles] = await Promise.all([
    isSuperAdmin(),
    hasPermission(PERM.IAM_USER_READ),
    hasPermission(PERM.IAM_ROLE_READ),
  ]);

  if (!isAdmin && !canReadUsers && !canReadRoles) {
    return (
      <AccessDenied
        title="Akses IAM Ditolak"
        message="Halaman ini hanya dapat diakses oleh Administrator Sistem (Super Admin) atau Kepala Tata Usaha untuk pengelolaan pengguna dan wewenang."
        requiredPermission={PERM.IAM_USER_READ}
      />
    );
  }

  return <>{children}</>;
}
