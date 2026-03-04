import { MarketingLayoutClient } from '@/components/layout/MarketingLayoutClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/** Single marketing layout: header + scrollable main. All marketing routes are dynamic so next-intl resolves per-request. */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <MarketingLayoutClient>{children}</MarketingLayoutClient>;
}
