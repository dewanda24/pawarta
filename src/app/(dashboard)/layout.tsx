import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MobileNav } from '@/components/layout/mobile-nav';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex min-h-screen bg-gray-50 flex-col md:flex-row print:bg-white print:block print:min-h-0">
      <div className="print:hidden">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden min-w-0 print:overflow-visible print:block">
        <div className="print:hidden">
          <Header user={session?.user} />
        </div>

        <main className="flex-1 overflow-y-auto p-3 sm:p-6 pb-24 md:pb-6 print:p-0 print:m-0 print:overflow-visible print:block">
          <div className="mx-auto max-w-7xl print:max-w-none print:w-full print:p-0">
            {children}
          </div>
        </main>

        <div className="print:hidden">
          <Footer />
        </div>
      </div>

      {/* Mobile Navigation Drawer & Bottom Bar */}
      <div className="print:hidden">
        <MobileNav user={session?.user} />
      </div>
    </div>
  );
}
