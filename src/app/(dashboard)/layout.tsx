import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex min-h-screen bg-gray-50 md:flex-row">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={session?.user} />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
