import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { validateTrialAccessToken, getTrialLeadWithBooking } from '@/lib/actions/trial-leads';
import { GEKO_LEVEL_INFO } from '@/lib/level-check/level-info';
import type { GeckoLevel } from '@/lib/level-check/questions';
import { TrialCountdown } from '@/components/trial-portal/TrialCountdown';
import {
  Calendar,
  BookOpen,
  ExternalLink,
  CheckCircle2,
  Bell,
  Sparkles,
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const GECKO_LETTERS = ['G', 'E', 'C', 'K', 'O'] as const;

/** Normalize to Gecko letter for display; returns null if not a Gecko level. */
function toGeckoLevel(value: string | null | undefined): GeckoLevel | null {
  if (!value) return null;
  const upper = value.toUpperCase();
  if (!GECKO_LETTERS.includes(upper as (typeof GECKO_LETTERS)[number])) return null;
  return upper as GeckoLevel;
}

type Props = {
  searchParams: Promise<{ token?: string }>;
};

async function TrialPortalContent({ token }: { token: string | undefined }) {
  const t = await getTranslations('trialPortal');
  const locale = await getLocale();

  if (!token) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className="text-xl font-semibold text-[#3d4236]">{t('noTokenTitle')}</h1>
        <p className="mt-2 text-slate-600">{t('noTokenDescription')}</p>
        <Link
          href={`/${locale}/academy`}
          className="mt-6 inline-block rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {t('backToAcademy')}
        </Link>
      </div>
    );
  }

  const valid = await validateTrialAccessToken(token);
  if (!valid) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className="text-xl font-semibold text-[#3d4236]">{t('invalidTokenTitle')}</h1>
        <p className="mt-2 text-slate-600">{t('invalidTokenDescription')}</p>
        <Link
          href={`/${locale}/academy`}
          className="mt-6 inline-block rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {t('backToAcademy')}
        </Link>
      </div>
    );
  }

  const data = await getTrialLeadWithBooking(valid.trialLeadId);
  if (!data) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <p className="text-slate-600">{t('dataNotFound')}</p>
        <Link
          href={`/${locale}/academy`}
          className="mt-6 inline-block rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {t('backToAcademy')}
        </Link>
      </div>
    );
  }

  const { lead, booking } = data;
  const level = (lead.recommendedLevel ?? lead.placementLevel ?? 'G') as GeckoLevel;
  const placementDone = !!lead.placementCompletedAt;
  const geckoLevel = toGeckoLevel(lead.placementLevel ?? lead.recommendedLevel) ?? level;
  const geckoInfo = GEKO_LEVEL_INFO[geckoLevel] ?? GEKO_LEVEL_INFO.G;
  const trialTimeIso = booking?.trialTime ? new Date(booking.trialTime).toISOString() : null;
  const levelCheckHref = `/${locale}/level-check${lead.email ? `?email=${encodeURIComponent(lead.email)}` : ''}${token ? `${lead.email ? '&' : '?'}returnToken=${encodeURIComponent(token)}` : ''}`;

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6 sm:py-12">
      {/* 1. Hero / Trial Status */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-[#3d4236] sm:text-3xl">
          {t('hero.title')}
        </h1>

        {booking ? (
          <div className="mt-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7daf41]/15">
                <Calendar className="h-5 w-5 text-[#7daf41]" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-[#3d4236]">{t('upcomingTrial')}</h2>
                <p className="mt-1 text-slate-600">{booking.slotLabel}</p>
                <div className="mt-2">
                  <TrialCountdown
                    trialTimeIso={trialTimeIso}
                    locale={locale}
                    startsOnLabel={t('hero.startsOn')}
                    daysLabel={t('hero.days')}
                    hoursLabel={t('hero.hours')}
                    minutesLabel={t('hero.minutes')}
                  />
                </div>
                {/* Join button: placeholder until meeting URL is wired; structure ready for href={meetingUrl} */}
                <span
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#7daf41] px-5 py-2.5 text-sm font-medium text-white"
                  aria-hidden
                >
                  <ExternalLink className="h-4 w-4" />
                  {t('joinButtonLabel')}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/50 p-5">
            <p className="text-slate-600">{t('noBookingYet')}</p>
            <Button asChild variant="outline" className="mt-4 rounded-full border-slate-300">
              <Link href={`/${locale}/trial/time?level=${level}`}>{t('bookTrial')}</Link>
            </Button>
          </div>
        )}
      </section>

      {/* 2. What happens in your trial */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-[#3d4236]">
          <Sparkles className="h-5 w-5 text-[#7daf41]" />
          {t('whatHappens.title')}
        </h2>
        <ul className="mt-4 space-y-3">
          {[
            { key: 'meetTeacher', icon: CheckCircle2 },
            { key: 'practiceSpeaking', icon: CheckCircle2 },
            { key: 'learnLevel', icon: CheckCircle2 },
            { key: 'seeHowItWorks', icon: CheckCircle2 },
          ].map(({ key, icon: Icon }) => (
            <li key={key} className="flex items-start gap-3">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#7daf41]" />
              <span className="text-slate-600">{t(`whatHappens.${key}`)}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 3. Recommended Gecko Level — dynamic: CTA if no placement, Gecko result if done */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#429ead]/10">
            <BookOpen className="h-5 w-5 text-[#429ead]" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-[#3d4236]">{t('geckoLevelSection.title')}</h2>
            {placementDone ? (
              <>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#7daf41] px-4 py-2">
                  <span className="text-lg font-bold text-white">{geckoLevel}</span>
                  <span className="text-sm font-medium text-white/90">— {geckoInfo.name}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{t('geckoLevelSection.basedOnPlacement')}</p>
                <p className="mt-1 text-sm text-slate-600">{t('geckoLevelSection.bestStartingPoint')}</p>
              </>
            ) : (
              <>
                <p className="mt-2 text-slate-600">{t('geckoLevelSection.takePlacementPrompt')}</p>
                <Button asChild className="mt-4 rounded-full bg-[#7daf41] hover:bg-[#6b9a39]">
                  <Link href={levelCheckHref}>{t('geckoLevelSection.takePlacementButton')}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 4. Prepare for class */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#3d4236]">{t('prepareForClass.title')}</h2>
        <ul className="mt-4 space-y-2">
          {['deviceReady', 'quietPlace', 'readyToSpeak', 'optionalPractice'].map((key) => (
            <li key={key} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
              <span className="text-slate-600">{t(`prepareForClass.${key}`)}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 5. Reminders / Save this page */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-[#3d4236]">
          <Bell className="h-5 w-5 text-[#7daf41]" />
          {t('reminders.title')}
        </h2>
        <p className="mt-2 text-slate-600">{t('reminders.weSendReminders')}</p>
        <p className="mt-1 text-slate-600">{t('reminders.saveThisPage')}</p>
        {/* Future-ready: Add to calendar placeholder */}
        <div className="mt-4">
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500">
            {t('addToCalendar')}
          </span>
        </div>
      </section>

      {/* 6. After-trial / Next step (when final recommendation exists) */}
      {lead.finalRecommendedLevel && (
        <section className="mt-6 rounded-2xl border border-[#7daf41]/30 bg-[#7daf41]/5 p-6">
          <h2 className="text-lg font-semibold text-[#3d4236]">{t('afterTrial.title')}</h2>
          <p className="mt-2 font-medium text-[#3d4236]">
            {lead.finalRecommendedClass ?? lead.finalRecommendedLevel}
          </p>
          <p className="mt-2 text-slate-600">{t('afterTrial.enrollPrompt')}</p>
          {lead.finalNotes && (
            <p className="mt-2 text-sm text-slate-500">{lead.finalNotes}</p>
          )}
        </section>
      )}

      {/* Back to academy */}
      <div className="mt-8 text-center">
        <Link
          href={`/${locale}/academy`}
          className="text-sm font-medium text-[#7daf41] hover:underline"
        >
          {t('backToAcademy')}
        </Link>
      </div>
    </div>
  );
}

export default async function TrialPortalPage({ searchParams }: Props) {
  const params = await searchParams;
  const token = params.token;

  return (
    <div className="min-h-[60vh]">
      <Suspense
        fallback={
          <div className="flex min-h-[40vh] items-center justify-center">
            <p className="text-slate-500">Loading...</p>
          </div>
        }
      >
        <TrialPortalContent token={token} />
      </Suspense>
    </div>
  );
}
