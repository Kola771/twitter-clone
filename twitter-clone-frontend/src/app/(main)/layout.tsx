import Sidebar from '@/components/layout/Sidebar';
import RightPanel from '@/components/layout/RightPanel';
import MobileNav from '@/components/layout/MobileNav';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen max-w-7xl mx-auto">
      {/* Sidebar desktop — cachée sur mobile */}
      <Sidebar />

      {/* Contenu principal — pb-20 pour ne pas se cacher derrière la nav mobile */}
      <main className="flex-1 min-h-screen border-r border-slate-800 min-w-0 pb-20 lg:pb-0">
        {children}
      </main>

      <RightPanel />

      {/* Nav mobile en bas */}
      <MobileNav />
    </div>
  );
}
