'use client';

import { createContext, useContext, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MarketingHeader } from '@/components/layout/MarketingHeader';
import { locales, type Locale } from '@/lib/i18n/config';

type NavDrawerContextValue = {
  navOpen: boolean;
  setNavOpen: (open: boolean) => void;
};
const NavDrawerContext = createContext<NavDrawerContextValue | null>(null);
export function useNavDrawer() {
  const ctx = useContext(NavDrawerContext);
  return ctx ?? { navOpen: false, setNavOpen: () => {} };
}

/** Path without locale prefix so we can match dashboard routes (e.g. /en/dashboard -> /dashboard). */
function pathWithoutLocale(pathname: string | null): string {
  if (!pathname) return '/';
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0 && locales.includes(segments[0] as Locale)) {
    return '/' + segments.slice(1).join('/');
  }
  return pathname;
}

/**
 * Dashboard/app layout only. Serves /dashboard, /teacher, /classroom, etc.
 * Does NOT serve "/" — the root is owned by (marketing). There must be no
 * app/(dashboard)/page.tsx so "/" is never claimed by this group.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  const pathname = usePathname();
  const path = pathWithoutLocale(pathname);
  const showSidebar =
    path.startsWith('/dashboard') ||
    path.startsWith('/learning') ||
    path.startsWith('/teacher') ||
    path.startsWith('/admin') ||
    path.startsWith('/classroom') ||
    path.startsWith('/students');

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
