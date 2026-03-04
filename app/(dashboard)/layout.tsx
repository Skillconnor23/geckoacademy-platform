'use client';

import Link from 'next/link';
import Image from 'next/image';
import { createContext, useContext, useState, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home, LogOut, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from '@/app/(login)/actions';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/db/schema';
import { NotificationsBell } from '@/components/notifications/NotificationsBell';
import useSWR, { mutate } from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type NavDrawerContextValue = {
  navOpen: boolean;
  setNavOpen: (open: boolean) => void;
};
const NavDrawerContext = createContext<NavDrawerContextValue | null>(null);
export function useNavDrawer() {
  const ctx = useContext(NavDrawerContext);
  return ctx ?? { navOpen: false, setNavOpen: () => {} };
}

function formatRole(platformRole: string | null): string {
  if (!platformRole) return 'User';
  if (platformRole === 'school_admin') return 'School Admin';
  return platformRole.charAt(0).toUpperCase() + platformRole.slice(1);
}

function NavLink({
  href,
  children,
  isActive,
  muted,
}: {
  href: string;
  children: React.ReactNode;
  isActive: boolean;
  muted?: boolean;
}) {
  const baseColor = isActive ? "text-[#7daf41]" : muted ? "text-gray-400" : "text-gray-700";
  return (
    <Link
      href={href}
      className={`hidden sm:inline font-medium transition-colors duration-200 hover:text-[#429ead] ${baseColor}`}
    >
      {children}
    </Link>
  );
}

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    mutate('/api/user');
    router.push('/');
  }

  if (!user) {
    return (
      <>
        <nav className="flex items-center gap-8 md:gap-10">
          <NavLink href="/schools" isActive={pathname === "/schools"}>
            Schools
          </NavLink>
          <NavLink href="/academy" isActive={pathname === "/academy"}>
            Students
          </NavLink>
          <NavLink href="/pricing" isActive={pathname === "/pricing" || pathname === "/pricing-schools" || pathname === "/pricing-students"}>
            Pricing
          </NavLink>
          <NavLink href="/contact" isActive={pathname === "/contact"}>
            Contact
          </NavLink>
          <NavLink href="/sign-in" isActive={pathname === "/sign-in"} muted>
            Log in
          </NavLink>
        </nav>
        <Button asChild>
          <Link href="/sign-up">Sign up</Link>
        </Button>
      </>
    );
  }

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full bg-transparent px-2 py-1 text-left text-[10px] uppercase tracking-wider text-[#5a5f57] outline-none hover:bg-[#f3f4f6]">
        <span className="hidden sm:inline">
          {formatRole(user.platformRole)} Account
        </span>
        <span className="sm:hidden">Account</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-1">
        <DropdownMenuItem className="cursor-pointer">
          <Link href="/dashboard" className="flex w-full items-center">
            <Home className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <form action={handleSignOut} className="w-full">
          <button type="submit" className="flex w-full">
            <DropdownMenuItem className="w-full flex-1 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Header() {
  const pathname = usePathname();
  const { setNavOpen } = useNavDrawer();
  const showSidebar =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/learning') ||
    pathname?.startsWith('/teacher') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/classroom') ||
    pathname?.startsWith('/students');

  return (
    <header className="w-full border-b border-gray-200 bg-white shrink-0">
      <div className="flex h-16 w-full items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-2 md:flex-initial">
          {showSidebar && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden -ml-2 h-12 min-h-[48px] w-12 min-w-[48px] shrink-0 rounded-full text-[#1f2937] hover:bg-[#f3f4f6] active:bg-[#e5e7eb]"
              onClick={() => setNavOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          )}
          <Link href="/" className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full">
              <Image
                src="/gecko-logo.svg"
                alt=""
                width={120}
                height={120}
                sizes="(max-width: 768px) 40px, 40px"
                className="h-10 w-10 object-contain"
                unoptimized
                priority
              />
            </div>
            <span className="text-lg font-semibold leading-none text-[#3d4236] sm:text-xl">Gecko Academy</span>
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <NotificationsBell />
          <Suspense fallback={<div className="h-9" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  const pathname = usePathname();
  const isMarketingPage =
    pathname === "/" ||
    pathname === "/schools" ||
    pathname === "/academy" ||
    pathname === "/pricing" ||
    pathname === "/pricing-schools" ||
    pathname === "/pricing-students" ||
    pathname === "/contact";

  // Marketing pages: scrollable, no overflow-hidden, normal document flow
  if (isMarketingPage) {
    return (
      <NavDrawerContext.Provider value={{ navOpen, setNavOpen }}>
        <div className="min-h-screen bg-white">
          <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
            <Header />
          </header>
          <main className="w-full">{children}</main>
        </div>
      </NavDrawerContext.Provider>
    );
  }

  // Dashboard / app routes: fixed viewport, inner scroll
  return (
    <NavDrawerContext.Provider value={{ navOpen, setNavOpen }}>
      <div className="flex h-dvh w-full flex-col overflow-hidden bg-background">
        <Header />
        <div className="flex h-full w-full overflow-hidden">
          {children}
        </div>
      </div>
    </NavDrawerContext.Provider>
  );
}
