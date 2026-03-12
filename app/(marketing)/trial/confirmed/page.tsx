'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { StepGuide } from '@/components/funnel/StepGuide';
import { Check } from 'lucide-react';
import { TRIAL_FUNNEL_STORAGE_KEY } from '@/lib/trial/config';

function TrialConfirmedContent() {
  const t = useTranslations('funnel.confirmed');
  const tGuide = useTranslations('funnel.guide.confirmed');
  const locale = useLocale();
  const searchParams = useSearchParams();

  const name = searchParams.get('name') || '';
  const slot = searchParams.get('slot') || '';
  const phone = searchParams.get('phone') || '';
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  useEffect(() => {
    try {
      localStorage.removeItem(TRIAL_FUNNEL_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md mx-auto text-center space-y-8">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#7daf41]/15">
            <Check className="h-8 w-8 text-[#7daf41]" strokeWidth={2.5} />
          </div>
        </div>
        <StepGuide
          title={tGuide('title')}
          description={tGuide('description')}
          className="mb-0 text-center [&_h2]:text-center [&_p]:text-center [&_p]:mx-auto"
        />

        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 px-6 py-6 text-left space-y-3">
          {slot && (
            <div>
              <p className="text-sm font-medium text-slate-500">{t('slot')}</p>
              <p className="text-base font-medium text-[#3d4236]">{slot}</p>
            </div>
          )}
          {name && (
            <div>
              <p className="text-sm font-medium text-slate-500">{t('name')}</p>
              <p className="text-base font-medium text-[#3d4236]">{name}</p>
            </div>
          )}
          {phone && (
            <div>
              <p className="text-sm font-medium text-slate-500">{t('phone')}</p>
              <p className="text-base font-medium text-[#3d4236]">{phone}</p>
            </div>
          )}
          {email && (
            <div>
              <p className="text-sm font-medium text-slate-500">{t('email')}</p>
              <p className="text-base font-medium text-[#3d4236]">{email}</p>
            </div>
          )}
        </div>

        <p className="text-sm text-slate-600">{t('reminder')}</p>

        {token && (
          <Link
            href={`/${locale}/trial/portal?token=${encodeURIComponent(token)}`}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#7daf41] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#6b9a39] transition-colors"
          >
            {t('viewTrialPortal')}
          </Link>
        )}

        <Link
          href={`/${locale}/academy`}
          className={`inline-block rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors ${token ? 'mt-4' : ''}`}
        >
          {t('backToAcademy')}
        </Link>
      </div>
    </div>
  );
}

export default function TrialConfirmedPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center px-4"><p className="text-slate-500">Loading...</p></div>}>
      <TrialConfirmedContent />
    </Suspense>
  );
}
