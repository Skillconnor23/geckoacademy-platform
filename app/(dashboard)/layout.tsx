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

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
        <Link
          href="/pricing"
          className="text-sm font-medium text-[#5a5f57] hover:text-[#3d4236]"
        >
          Pricing
        </Link>
        <Button asChild>
          <Link href="/sign-up">Sign Up</Link>
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
  const isDashboard = pathname?.startsWith('/dashboard') ?? false;

  return (
    <header className="w-full border-b border-gray-200 bg-white shrink-0">
      <div className="flex h-16 w-full items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-2 md:flex-initial">
          {isDashboard && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden -ml-2 shrink-0 rounded-full text-[#1f2937] hover:bg-[#f3f4f6]"
              onClick={() => setNavOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          )}
          <Link href="/" className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full">
            <Image
              src="/gecko-logo.svg"
              alt=""
              width={36}
              height={36}
              className="h-full w-full object-cover"
            />
          </div>
          <span className="text-xl font-semibold leading-none text-[#3d4236]">Gecko Academy</span>
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
