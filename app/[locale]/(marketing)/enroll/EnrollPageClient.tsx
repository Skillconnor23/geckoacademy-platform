'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { GeckoClassOption, GeckoLevelMeta } from '@/lib/enrollment/gecko-classes';
import type { GeckoEnrollLevel } from '@/lib/enrollment/gecko-classes';
import { Check, CreditCard } from 'lucide-react';

interface EnrollPageClientProps {
  locale: string;
  isLoggedIn: boolean;
  signInHref: string;
  classesByLevel: Record<GeckoEnrollLevel, GeckoClassOption[]>;
  levelMeta: Record<GeckoEnrollLevel, GeckoLevelMeta>;
}

export function EnrollPageClient({
  locale,
  isLoggedIn,
  signInHref,
  classesByLevel,
  levelMeta,
}: EnrollPageClientProps) {
  const t = useTranslations('enroll');
  const [selectedLevel, setSelectedLevel] = useState<GeckoEnrollLevel | null>(null);
  const [selectedClass, setSelectedClass] = useState<GeckoClassOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Support ?level=G from placement test deep link
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const level = params.get('level')?.toUpperCase() as GeckoEnrollLevel | null;
    if (level && (level === 'G' || level === 'E' || level === 'C' || level === 'K' || level === 'O')) {
      setSelectedLevel(level);
      setSelectedClass(null);
    }
  }, []);

  const levelOrder: GeckoEnrollLevel[] = ['G', 'E', 'C', 'K', 'O'];

  /** Solid Gecko brand colors per level. No tints. */
  const LEVEL_CARD_STYLES: Record<
    GeckoEnrollLevel,
    { bg: string; text: string; border: string; badgeBg: string; badgeText: string }
  > = {
    G: { bg: '#7daf41', text: 'white', border: '#7daf41', badgeBg: 'rgba(255,255,255,0.25)', badgeText: 'white' },
    E: { bg: '#429ead', text: 'white', border: '#429ead', badgeBg: 'rgba(255,255,255,0.25)', badgeText: 'white' },
    C: { bg: '#b64b29', text: 'white', border: '#b64b29', badgeBg: 'rgba(255,255,255,0.25)', badgeText: 'white' },
    K: { bg: '#ffaa00', text: 'white', border: '#ffaa00', badgeBg: 'rgba(255,255,255,0.3)', badgeText: 'white' },
    O: { bg: 'white', text: '#374151', border: '#7daf41', badgeBg: '#7daf41', badgeText: 'white' },
  };

  const currentClasses = selectedLevel ? classesByLevel[selectedLevel] : [];
  const meta = selectedLevel ? levelMeta[selectedLevel] : null;

  const getLevelLabel = (level: GeckoEnrollLevel) => {
    const m = levelMeta[level];
    return locale === 'mn' ? m.nameMn : m.nameEn;
  };
  const formatPrice = (cents: number, currency: string) => {
    const amount = cents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };
  const formatDays = (days: string[]) => days.join(', ');
  const tzLabel = (tz: string) => {
    const short = tz.split('/').pop() ?? tz;
    return short.replace(/_/g, ' ');
  };

  const handleCheckout = async () => {
    if (!selectedClass) return;
    if (!selectedClass.stripePriceId) {
      alert(t('errors.stripeNotConfigured'));
      return;
    }
    if (!isLoggedIn) {
      window.location.href = signInHref;
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/enrollment/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-locale': locale,
        },
        body: JSON.stringify({ classOptionId: selectedClass.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Checkout failed');
      if (data.url) window.location.href = data.url;
      else throw new Error('No checkout URL');
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : t('errors.checkoutFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-10 space-y-10">
      {/* Level cards — solid Gecko brand colors */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {levelOrder.map((level) => {
          const m = levelMeta[level];
          const isSelected = selectedLevel === level;
          const styles = LEVEL_CARD_STYLES[level];
          const name = locale === 'mn' ? m.nameMn : m.nameEn;
          const desc = locale === 'mn' ? m.descriptionMn : m.descriptionEn;
          return (
            <button
              key={level}
              type="button"
              onClick={() => {
                setSelectedLevel(level);
                setSelectedClass(null);
              }}
              className={`group relative flex flex-col items-start rounded-2xl border-2 p-6 text-left shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7daf41] ${
                isSelected ? 'ring-[3px] ring-[#7daf41] ring-offset-2 shadow-lg' : ''
              }`}
              style={{
                backgroundColor: styles.bg,
                borderColor: isSelected ? '#7daf41' : styles.border,
                color: styles.text,
              }}
            >
              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold"
                style={{
                  backgroundColor: styles.badgeBg,
                  color: styles.badgeText,
                }}
              >
                {level}
              </div>
              <p className="font-semibold">{name}</p>
              <p
                className="mt-1 line-clamp-2 text-xs opacity-90"
                style={{ color: level === 'O' ? '#6b7280' : 'inherit' }}
              >
                {desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Schedule grid */}
      {selectedLevel && currentClasses.length > 0 && meta && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#3d4236]">
            {t('schedule.title')} — {locale === 'mn' ? meta.nameMn : meta.nameEn}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {currentClasses.map((c) => {
              const isSelected = selectedClass?.id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedClass(c)}
                  className={`flex items-start justify-between rounded-2xl border-2 bg-white p-5 text-left shadow-sm transition-all ${
                    isSelected
                      ? 'border-[#7daf41] shadow-md ring-2 ring-[#7daf41]/20'
                      : 'border-[#e5e7eb] hover:border-[#7daf41]/50 hover:shadow-md'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-[#3d4236]">
                      {c.time} · {formatDays(c.days)}
                    </p>
                    <p className="mt-1 text-sm text-[#5a5f57]">{tzLabel(c.timezone)}</p>
                    <p className="mt-2 font-semibold text-[#7daf41]">
                      {formatPrice(c.priceCents, c.currency)}
                    </p>
                    {c.seatsRemaining != null && (
                      <p className="mt-1 text-xs text-[#5a5f57]">
                        {t('schedule.seatsRemaining', { count: c.seatsRemaining })}
                      </p>
                    )}
                  </div>
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      isSelected ? 'bg-[#7daf41] text-white' : 'border-2 border-[#e5e7eb]'
                    }`}
                  >
                    {isSelected ? <Check className="h-4 w-4" /> : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected class summary */}
      {selectedClass && meta && (
        <div className="rounded-2xl border-2 border-[#7daf41]/30 bg-white p-6 shadow-lg sm:p-8">
          <h3 className="mb-4 text-lg font-bold text-[#3d4236]">
            {t('summary.title')}
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#7daf41] text-xs font-bold text-white">
                {selectedClass.level}
              </span>
              <div>
                <p className="font-medium text-[#3d4236]">
                  {locale === 'mn' ? meta.nameMn : meta.nameEn}
                </p>
                <p className="text-[#5a5f57]">
                  {selectedClass.time} · {formatDays(selectedClass.days)} · {tzLabel(selectedClass.timezone)}
                </p>
              </div>
            </div>
            <p className="text-lg font-bold text-[#7daf41]">
              {formatPrice(selectedClass.priceCents, selectedClass.currency)}
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            {isLoggedIn ? (
              <Button
                size="lg"
                disabled={!selectedClass.stripePriceId || isLoading}
                onClick={handleCheckout}
                className="h-12 rounded-xl bg-[#7daf41] px-8 text-base font-semibold text-white shadow-md hover:bg-[#6b9a39] hover:shadow-lg"
              >
                {isLoading ? (
                  t('cta.processing')
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    {t('cta.payWithStripe')}
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  asChild
                  className="h-12 rounded-xl bg-[#7daf41] px-8 text-base font-semibold text-white shadow-md hover:bg-[#6b9a39]"
                >
                  <Link href={signInHref}>{t('cta.signInToEnroll')}</Link>
                </Button>
                <p className="text-sm text-[#5a5f57]">{t('cta.signInPrompt')}</p>
              </>
            )}
          </div>
        </div>
      )}

      {selectedLevel && currentClasses.length === 0 && (
        <div className="rounded-2xl border border-[#e5e7eb] bg-white p-8 text-center">
          <p className="text-[#5a5f57]">{t('schedule.empty')}</p>
        </div>
      )}
    </div>
  );
}
