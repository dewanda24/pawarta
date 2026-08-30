import { hasPermission, isSuperAdmin } from '@/lib/auth/rbac';
import { PERM } from '@/lib/auth/permissions';
import { AccessDenied } from '@/components/shared/access-denied';

export const dynamic = 'force-dynamic';

export default async function AgendaDigitalLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, canReadArsip, canReadAgenda] = await Promise.all([
    isSuperAdmin(),
    hasPermission(PERM.ARSIP_READ),
    hasPermission(PERM.SURAT_MASUK_AGENDA),
  ]);

  if (!isAdmin && !canReadArsip && !canReadAgenda) {
    return (
      <AccessDenied
        title="Akses Buku Agenda Ditolak"
        message="Anda tidak memiliki izin untuk membuka buku agenda naskah dinas atau rekapitulasi arsip digital sekolah."
        requiredPermission={PERM.ARSIP_READ}
      />
    );
  }

  return <>{children}</>;
}
