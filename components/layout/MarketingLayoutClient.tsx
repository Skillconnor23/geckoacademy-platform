'use client';

import { MarketingHeader } from '@/components/layout/MarketingHeader';

/** Single marketing layout: header (logo → /, nav, user menu) + scrollable main. */
export function MarketingLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
        <MarketingHeader />
      </header>
      <main className="w-full">{children}</main>
    </div>
  );
}
