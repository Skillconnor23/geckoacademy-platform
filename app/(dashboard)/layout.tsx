'use client';

import { createContext, useContext, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MarketingHeader } from '@/components/layout/MarketingHeader';

type NavDrawerContextValue = {
  navOpen: boolean;
  setNavOpen: (open: boolean) => void;
};
const NavDrawerContext = createContext<NavDrawerContextValue | null>(null);
export function useNavDrawer() {
  const ctx = useContext(NavDrawerContext);
  return ctx ?? { navOpen: false, setNavOpen: () => {} };
}

/**
 * Dashboard/app layout only. Serves /dashboard, /teacher, /classroom, etc.
 * Does NOT serve "/" — the root is owned by (marketing). There must be no
 * app/(dashboard)/page.tsx so "/" is never claimed by this group.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  const pathname = usePathname();
  const showSidebar =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/learning') ||
    pathname?.startsWith('/teacher') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/classroom') ||
    pathname?.startsWith('/students');

  return (
    <NavDrawerContext.Provider value={{ navOpen, setNavOpen }}>
      <div className="flex h-dvh w-full flex-col overflow-hidden bg-background">
        <MarketingHeader showSidebarToggle={showSidebar} onMenuClick={() => setNavOpen(true)} />
        <div className="flex h-full w-full overflow-hidden">
          {children}
        </div>
      </div>
    </NavDrawerContext.Provider>
  );
}
