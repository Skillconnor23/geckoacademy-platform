import Link from 'next/link';
import Image from 'next/image';
import { getTranslations, getLocale } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Check, ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TrialInfoPage() {
  const t = await getTranslations('funnel.info');
  const tGuide = await getTranslations('funnel.guide.info');
  const tFunnel = await getTranslations('funnel');
  const locale = await getLocale();
  const href = `/${locale}/trial/time`;

  const bullets = [t('bullet1'), t('bullet2'), t('bullet3'), t('bullet4')];
  const previewItems = [t('preview1'), t('preview2'), t('preview3')];

  return (
    <div className="min-h-[60vh] px-4 py-12">
      <div className="mx-auto max-w-md">
        <div className="mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-[#3d4236] leading-tight">
            {tGuide('title')}
          </h2>
          <p className="mt-1 text-sm text-slate-600 font-medium">
            {t('trustLine')}
          </p>
          <p className="mt-2 text-sm text-slate-500 leading-snug">
            {tGuide('description')}
          </p>
        </div>

        <ul className="space-y-3 mb-8">
          {bullets.map((item) => (
            <li key={item} className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#7daf41]/15">
                <Check className="h-3.5 w-3.5 text-[#7daf41]" strokeWidth={2.5} />
              </span>
              <span className="text-slate-700 text-sm sm:text-base">{item}</span>
            </li>
          ))}
        </ul>

        <div className="rounded-xl bg-slate-50/80 border border-slate-100 px-4 py-4 mb-6">
          <p className="text-sm font-semibold text-[#3d4236] mb-3">
            {t('previewHeading')}
          </p>
          <ul className="space-y-2">
            {previewItems.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                <span className="h-1 w-1 rounded-full bg-slate-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-3 mb-6 py-3 px-4 rounded-lg bg-white border border-slate-100">
          <div className="h-14 w-14 shrink-0 rounded-full overflow-hidden relative bg-slate-100">
            <Image
              src="/teacher-connor.png"
              alt={t('teacherName')}
              width={56}
              height={56}
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">{t('teacherHeading')}</p>
            <p className="text-sm font-semibold text-[#3d4236]">{t('teacherName')}</p>
            <p className="text-xs text-slate-500 leading-snug">{t('teacherDescription')}</p>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-4">
          {t('urgency')}
        </p>

        <Button
          asChild
          size="lg"
          className="min-h-12 w-full rounded-full bg-[#7daf41] text-base font-semibold hover:bg-[#6b9a39]"
        >
          <Link href={href} className="inline-flex items-center justify-center gap-2">
            {t('bookTrial')}
            <ChevronRight className="h-5 w-5" />
          </Link>
        </Button>

        <p className="mt-5 text-xs text-slate-400 text-center">
          {t('trustSignal')}
        </p>

        <div className="mt-8">
          <Link
            href={`/${locale}/trial/level`}
            className="text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            ← {tFunnel('back')}
          </Link>
        </div>
      </div>
    </div>
  );
}
