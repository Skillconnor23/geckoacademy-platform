import { auth } from '@/auth';
import { getTranslations, getLocale } from 'next-intl/server';
import Link from 'next/link';
import { Section } from '@/components/landing/Section';
import { getClassesByLevel, GEKO_LEVEL_META } from '@/lib/enrollment/gecko-classes';
import type { GeckoEnrollLevel } from '@/lib/enrollment/gecko-classes';
import { EnrollPageClient } from './EnrollPageClient';
import { HelpCircle, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EnrollPage() {
  const t = await getTranslations('enroll');
  const locale = await getLocale();
  const session = await auth();
  const isLoggedIn = !!session?.user;

  const levelCheckHref = `/${locale}/level-check`;
  const signInHref = `/${locale}/sign-in?callbackUrl=/${encodeURIComponent(`/${locale}/enroll`)}`;

  const levelOrder: GeckoEnrollLevel[] = ['G', 'E', 'C', 'K', 'O'];
  const classesByLevel = Object.fromEntries(
    levelOrder.map((l) => [l, getClassesByLevel(l)])
  ) as Record<GeckoEnrollLevel, ReturnType<typeof getClassesByLevel>>;

  return (
    <div className="min-h-screen bg-[#fafbfc]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-white px-4 pb-12 pt-12 sm:px-6 sm:pb-16 sm:pt-20">
        <div className="absolute inset-0 h-32 bg-gradient-to-b from-[#7daf41]/8 to-transparent" aria-hidden />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#7daf41]">
            Gecko Academy
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#3d4236] sm:text-4xl md:text-5xl md:leading-tight">
            {t('heroTitle')}
          </h1>
          <p className="mt-4 text-lg text-[#5a5f57] sm:text-xl">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Placement test CTA */}
      <Section variant="alt" className="py-6 sm:py-8">
        <div className="mx-auto max-w-2xl">
          <Link
            href={levelCheckHref}
            className="flex items-center gap-3 rounded-2xl border border-[#429ead]/30 bg-white px-5 py-4 shadow-sm transition hover:border-[#429ead]/50 hover:shadow-md"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#429ead]/10">
              <HelpCircle className="h-5 w-5 text-[#429ead]" />
            </div>
            <div className="text-left">
              <span className="font-semibold text-[#3d4236]">{t('placementTest.title')}</span>
              <p className="mt-0.5 text-sm text-[#5a5f57]">{t('placementTest.subtitle')}</p>
            </div>
          </Link>
        </div>
      </Section>

      {/* Level selector + Schedule */}
      <Section className="py-12 sm:py-16">
        <h2 className="text-center text-xl font-semibold text-[#3d4236] sm:text-2xl">
          {t('levelSelector.title')}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-[#5a5f57]">
          {t('levelSelector.subtitle')}
        </p>

        <EnrollPageClient
          locale={locale}
          isLoggedIn={!!isLoggedIn}
          signInHref={signInHref}
          classesByLevel={classesByLevel}
          levelMeta={GEKO_LEVEL_META}
        />
      </Section>

      {/* Schedule explanation */}
      <Section variant="alt" className="py-12 sm:py-16">
        <h2 className="text-center text-xl font-semibold text-[#3d4236] sm:text-2xl">
          {t('explanation.title')}
        </h2>
        <div className="mx-auto mt-8 max-w-2xl space-y-4">
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
            <p className="font-medium text-[#3d4236]">{t('explanation.intro')}</p>
            <ul className="mt-3 space-y-2 text-sm text-[#5a5f57]">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7daf41]" />
                {t('explanation.weekend')}
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7daf41]" />
                {t('explanation.oneClass')}
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7daf41]" />
                {t('explanation.example')}
              </li>
            </ul>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm text-[#5a5f57]">
            <Calendar className="h-4 w-4 shrink-0 text-[#429ead]" />
            <span>{t('explanation.weekendNote')}</span>
          </div>
        </div>
      </Section>
    </div>
  );
}
