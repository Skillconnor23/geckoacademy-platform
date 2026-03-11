'use client';

import { useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { StepGuide } from '@/components/funnel/StepGuide';
import { LEARNER_TYPE_OPTIONS, TRIAL_FUNNEL_STORAGE_KEY } from '@/lib/trial/config';
import { trackFunnelEvent } from '@/lib/actions/funnel-events';
import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export default function TrialStartPage() {
  const t = useTranslations('funnel.learnerType');
  const tGuide = useTranslations('funnel.guide.learnerType');
  const tFunnel = useTranslations('funnel');
  const locale = useLocale();
  const router = useRouter();

  useEffect(() => {
    trackFunnelEvent('funnel_started', {}, locale);
  }, [locale]);

  const handleSelect = (value: string) => {
    try {
      const raw = localStorage.getItem(TRIAL_FUNNEL_STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : {};
      data.learnerType = value;
      localStorage.setItem(TRIAL_FUNNEL_STORAGE_KEY, JSON.stringify(data));
      trackFunnelEvent('question_answered', { question: 'learnerType', value }, locale);
    } catch {
      // ignore
    }
    router.push(`/${locale}/trial/level`);
  };

  return (
    <div className="min-h-[60vh] px-4 py-12">
      <div className="mx-auto max-w-md">
        <StepGuide title={tGuide('title')} description={tGuide('description')} />
        <div className="space-y-3">
          {LEARNER_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className="w-full flex items-center justify-between rounded-xl border-2 border-slate-200 bg-white px-5 py-4 text-left text-base font-medium text-slate-700 hover:border-[#7daf41] hover:bg-[#7daf41]/5 transition-colors"
            >
              <span>{t(opt.labelKey)}</span>
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </button>
          ))}
        </div>
        <div className="mt-10">
          <Button asChild variant="outline" className="rounded-full border-slate-300">
            <Link href={`/${locale}/academy`}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              {tFunnel('back')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
