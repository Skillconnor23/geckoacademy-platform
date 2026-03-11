'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { StepGuide } from '@/components/funnel/StepGuide';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import {
  createTrialBookingAction,
} from '@/lib/actions/trial-booking';
import {
  TRIAL_FUNNEL_STORAGE_KEY,
  TRIAL_SLOTS_UTAH,
  getSlotLabelInTimezone,
  getSlotTimestamp,
  type TrialSlotId,
} from '@/lib/trial/config';

function TrialFormContent() {
  const t = useTranslations('funnel.form');
  const tGuide = useTranslations('funnel.guide.form');
  const tFunnel = useTranslations('funnel');
  const tSlots = useTranslations('funnel.time.slots');
  const locale = useLocale();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [userTimezone, setUserTimezone] = useState('UTC');
  const [funnelData, setFunnelData] = useState<Record<string, unknown>>({});

  useEffect(() => {
    try {
      setUserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch {
      setUserTimezone('America/Denver');
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TRIAL_FUNNEL_STORAGE_KEY);
      if (raw) setFunnelData(JSON.parse(raw));
    } catch {
      // ignore
    }
    setMounted(true);
  }, []);

  const rawSlotId = funnelData.slotId as string | undefined;
  const selectedDateStr = funnelData.selectedDate as string | undefined;
  const validSlot = rawSlotId && TRIAL_SLOTS_UTAH.find((s) => s.id === rawSlotId);
  const slotId = validSlot ? (validSlot.id as TrialSlotId) : undefined;
  const slotLabel = slotId
    ? getSlotLabelInTimezone(slotId, userTimezone, (k) => tSlots(k), locale, selectedDateStr)
    : '';

  const [state, formAction, pending] = useActionState(createTrialBookingAction, null);

  if (!mounted || !slotId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <p className="text-slate-500">{tFunnel('loading')}</p>
      </div>
    );
  }

  const trialTime = getSlotTimestamp(slotId, selectedDateStr);

  return (
    <div className="min-h-[60vh] px-4 py-12">
      <div className="mx-auto max-w-md">
        <StepGuide title={tGuide('title')} description={tGuide('description')} />

        <form action={formAction} className="space-y-6">
          <input type="hidden" name="slotId" value={slotId} />
          <input type="hidden" name="slotLabel" value={slotLabel} />
          <input
            type="hidden"
            name="trialTime"
            value={trialTime.toISOString()}
          />
          <input
            type="hidden"
            name="recommendedLevel"
            value={(funnelData.englishLevel as string) || 'beginner'}
          />
          <input type="hidden" name="learnerType" value={(funnelData.learnerType as string) || 'self'} />
          <input type="hidden" name="locale" value={locale} />
          <input
            type="hidden"
            name="questionnaireAnswers"
            value={JSON.stringify(funnelData)}
          />

          <div>
            <Label htmlFor="fullName" className="text-[#3d4236] font-medium">
              {t('nameLabel')}
            </Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder={t('namePlaceholder')}
              required
              className="mt-2 h-12 rounded-xl border-slate-200"
            />
          </div>
          <div>
            <Label htmlFor="phone" className="text-[#3d4236] font-medium">
              {t('phoneLabel')}
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder={t('phonePlaceholder')}
              required
              className="mt-2 h-12 rounded-xl border-slate-200"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-[#3d4236] font-medium">
              {t('emailLabel')}
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t('emailPlaceholder')}
              className="mt-2 h-12 rounded-xl border-slate-200"
            />
          </div>

          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

          <Button
            type="submit"
            disabled={pending}
            size="lg"
            className="w-full min-h-12 rounded-full bg-[#7daf41] text-base font-semibold hover:bg-[#6b9a39] disabled:opacity-50"
          >
            {pending ? '...' : t('submit')}
          </Button>
        </form>

        <div className="mt-8">
          <Button asChild variant="outline" className="rounded-full border-slate-300">
            <Link href={`/${locale}/trial/time`}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              {tFunnel('back')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function TrialFormPage() {
  return <TrialFormContent />;
}
