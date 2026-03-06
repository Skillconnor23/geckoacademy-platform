'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import { locales } from '@/lib/i18n/config';

const REPORT_LOCALES: { value: Locale; labelKey: 'english' | 'mongolian' }[] = [
  { value: 'en', labelKey: 'english' },
  { value: 'mn', labelKey: 'mongolian' },
];

function getMonthOptions(count = 12, locale: string): { value: string; label: string }[] {
  const now = new Date();
  const options: { value: string; label: string }[] = [];
  const localeTag = locale === 'mn' ? 'mn-MN' : 'en-US';
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const value = `${y}-${String(m).padStart(2, '0')}`;
    const label = d.toLocaleDateString(localeTag, { month: 'long', year: 'numeric' });
    options.push({ value, label });
  }
  return options;
}

type Props = {
  studentId: number;
  studentName?: string | null;
};

export function MonthlyReportCard({ studentId, studentName }: Props) {
  const t = useTranslations('report.monthlyProgress');
  const tCommon = useTranslations('common.language');
  const currentLocale = useLocale() as Locale;
  const [month, setMonth] = useState(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
  });
  const [language, setLanguage] = useState<Locale>(() =>
    locales.includes(currentLocale) ? currentLocale : 'en'
  );
  const [loading, setLoading] = useState(false);

  const monthOptions = getMonthOptions(12, language);

  async function handleDownload() {
    setLoading(true);
    try {
      const url = `/api/reports/monthly/${studentId}?month=${encodeURIComponent(month)}&locale=${encodeURIComponent(language)}`;
      const res = await fetch(url);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        const message = [err.error, err.detail, err.hint].filter(Boolean).join('\n');
        alert(message || 'Failed to generate report');
        return;
      }
      const blob = await res.blob();
      const disposition = res.headers.get('Content-Disposition');
      const match = /filename="?([^";]+)"?/.exec(disposition ?? '');
      const filename = match ? match[1].trim() : `Monthly-Progress-Report-${month}.pdf`;
      const fallback = res.headers.get('X-Report-Fallback') === 'html';
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
      if (fallback) {
        alert(
          'PDF could not be generated (browser not available). An HTML report was downloaded instead. Open it and use Print → Save as PDF.'
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-[#1f2937]">
          {t('cardTitle')}
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-0.5">
          {t('cardDescription', { name: studentName ?? t('thisStudent') })}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label htmlFor="report-month" className="block text-sm font-medium text-[#374151] mb-1.5">
            {t('monthLabel')}
          </label>
          <select
            id="report-month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full max-w-xs rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#1f2937] focus:border-[#7daf41] focus:ring-2 focus:ring-[#7daf41]/20 focus:outline-none"
          >
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="report-language" className="block text-sm font-medium text-[#374151] mb-1.5">
            {t('languageLabel')}
          </label>
          <select
            id="report-language"
            value={language}
            onChange={(e) => setLanguage(e.target.value as Locale)}
            className="w-full max-w-xs rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#1f2937] focus:border-[#7daf41] focus:ring-2 focus:ring-[#7daf41]/20 focus:outline-none"
          >
            {REPORT_LOCALES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {tCommon(opt.labelKey)}
              </option>
            ))}
          </select>
        </div>
        <Button
          type="button"
          onClick={handleDownload}
          disabled={loading}
          className="rounded-full bg-[#7daf41] text-white hover:bg-[#6b9a39]"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              {t('generating')}
            </>
          ) : (
            <>
              <FileDown className="mr-2 h-4 w-4" aria-hidden />
              {t('downloadButton')}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
