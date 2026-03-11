'use client';

import { useLocale } from 'next-intl';
import Link from 'next/link';
import { trackFunnelEvent } from '@/lib/actions/funnel-events';

type Props = React.ComponentProps<typeof Link> & {
  ctaLabel?: string;
};

export function TrialCtaLink({ children, ctaLabel = 'hero_primary', ...props }: Props) {
  const locale = useLocale();

  const handleClick = () => {
    trackFunnelEvent('landing_page_cta_clicked', { cta: ctaLabel }, locale);
  };

  return (
    <Link {...props} onClick={handleClick}>
      {children}
    </Link>
  );
}
