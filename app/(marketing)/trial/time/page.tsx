'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StepGuide } from '@/components/funnel/StepGuide';
import {
  getSlotsForLevel,
  getSlotLabelInTimezone,
  TRIAL_FUNNEL_STORAGE_KEY,
  getAvailableDatesForNextMonth,
  geckoLevelToFunnelLevel,
  type TrialSlotId,
  type FunnelLevel,
} from '@/lib/trial/config';
import { trackFunnelEvent } from '@/lib/actions/funnel-events';
import { Calendar, ChevronLeft } from 'lucide-react';

const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

export default function TrialTimePage() {
  const t = useTranslations('funnel.time');
  const tGuide = useTranslations('funnel.guide.time');
  const tSlots = useTranslations('funnel.time.slots');
  const tFunnel = useTranslations('funnel');
  const tSchedule = useTranslations('schedule.weekdays.short');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mounted, setMounted] = useState(false);
  const [userTimezone, setUserTimezone] = useState('UTC');
  const [level, setLevel] = useState<FunnelLevel | string | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<TrialSlotId | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      setUserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch {
      setUserTimezone('America/Denver');
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      const raw = localStorage.getItem(TRIAL_FUNNEL_STORAGE_KEY);
      const data: Record<string, unknown> = raw ? JSON.parse(raw) : {};
      const urlLevel = searchParams.get('level');
      if (urlLevel) {
        const funnelLevel = geckoLevelToFunnelLevel(urlLevel) ?? urlLevel;
        data.englishLevel = funnelLevel;
        data.geckoLevel = urlLevel.length === 1 ? urlLevel.toUpperCase() : undefined;
        data.learnerType = data.learnerType ?? 'self';
        localStorage.setItem(TRIAL_FUNNEL_STORAGE_KEY, JSON.stringify(data));
        setLevel(funnelLevel as FunnelLevel);
      } else {
        setLevel((data.englishLevel as FunnelLevel) || undefined);
      }
    } catch {
      // ignore
    }
  }, [mounted, searchParams]);

  const availDates = mounted ? getAvailableDatesForNextMonth(level) : [];
  const availDateSet = new Set(availDates.map((a) => a.date));

  const slotsForLevel = mounted ? getSlotsForLevel(level) : [];
  const selectedDateData = selectedDate ? availDates.find((a) => a.date === selectedDate) : null;

  const handleSelectSlot = (slotId: TrialSlotId) => {
    if (!selectedDate) return;
    setSelectedSlotId(slotId);
    try {
      const raw = localStorage.getItem(TRIAL_FUNNEL_STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : {};
      data.slotId = slotId;
      data.selectedDate = selectedDate;
      data.slotLabel = getSlotLabelInTimezone(
        slotId,
        userTimezone,
        (k) => tSlots(k),
        locale,
        selectedDate
      );
      localStorage.setItem(TRIAL_FUNNEL_STORAGE_KEY, JSON.stringify(data));
      trackFunnelEvent('trial_time_selected', { slotId, selectedDate, userTimezone }, locale);
    } catch {
      // ignore
    }
    router.push(`/${locale}/trial/form`);
  };

  if (!mounted) {
    return (
      <div className="min-h-[60vh] px-4 py-12 flex items-center justify-center">
        <p className="text-slate-500">{tFunnel('loading')}</p>
      </div>
    );
  }

  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // Show month that contains available dates; if current month has none left, show next
  let year = now.getFullYear();
  let month = now.getMonth();
  const firstAvail = availDates[0]?.date;
  if (firstAvail) {
    const [y, m] = firstAvail.split('-').map(Number);
    if (y !== undefined && m !== undefined && (y > year || (y === year && m > month + 1))) {
      year = y;
      month = m - 1;
    }
  }

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const displayDate = new Date(year, month, 15);

  const days: (string | null)[] = [];
  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  }

  return (
    <div className="min-h-[60vh] px-4 py-12">
      <div className="mx-auto max-w-md">
        <StepGuide title={tGuide('title')} description={tGuide('description')} />
        <p className="text-sm text-slate-600 mb-4">{t('subtitle')}</p>

        {/* Month header */}
        <p className="text-sm font-medium text-slate-700 mb-3">
          {new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(displayDate)}
        </p>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAY_KEYS.map((key) => (
            <div
              key={key}
              className="text-center text-xs font-medium text-slate-500 py-1"
            >
              {tSchedule(key)}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 mb-8">
          {days.map((dateKey, i) => {
            if (!dateKey) {
              return <div key={`empty-${i}`} className="aspect-square" />;
            }
            const isToday = dateKey === todayKey;
            const isAvailable = availDateSet.has(dateKey);
            const isSelected = selectedDate === dateKey;
            const canSelect = isAvailable;

            return (
              <button
                key={dateKey}
                type="button"
                disabled={!canSelect}
                onClick={() => canSelect && setSelectedDate(isSelected ? null : dateKey)}
                className={`aspect-square rounded-lg text-sm font-medium transition-colors flex items-center justify-center
                  ${!canSelect ? 'text-slate-300 bg-slate-50/50 cursor-not-allowed' : ''}
                  ${canSelect && !isSelected && !isToday ? 'text-slate-700 bg-white border border-slate-200 hover:border-[#7daf41] hover:bg-[#7daf41]/5' : ''}
                  ${isToday && !isSelected ? 'text-[#3d4236] border-2 border-[#7daf41] bg-[#7daf41]/10' : ''}
                  ${isSelected ? 'text-white bg-[#7daf41] border-2 border-[#7daf41]' : ''}
                `}
              >
                {new Date(dateKey + 'T12:00:00').getDate()}
              </button>
            );
          })}
        </div>

        {/* Slot selection (when date selected) */}
        {selectedDate && selectedDateData && (
          <div className="mb-8">
            <p className="text-sm font-medium text-slate-700 mb-3">
              {t('timesForDate', {
                date: new Intl.DateTimeFormat(locale, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                }).format(new Date(selectedDate + 'T12:00:00')),
              })}
            </p>
            <div className="space-y-3">
              {selectedDateData.slotIds.map((slotId) => {
                const slot = slotsForLevel.find((s) => s.id === slotId);
                if (!slot) return null;
                const label = getSlotLabelInTimezone(
                  slotId,
                  userTimezone,
                  (k) => tSlots(k),
                  locale,
                  selectedDate
                );
                const isSelected = selectedSlotId === slotId;
                return (
                  <button
                    key={slotId}
                    type="button"
                    onClick={() => handleSelectSlot(slotId)}
                    className={`w-full flex items-center gap-3 rounded-xl border-2 px-5 py-4 text-left text-base font-medium transition-colors ${
                      isSelected
                        ? 'border-[#7daf41] bg-[#7daf41]/10 text-[#3d4236]'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-[#7daf41] hover:bg-[#7daf41]/5'
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7daf41]/10">
                      <Calendar className="h-5 w-5 text-[#7daf41]" />
                    </div>
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-10">
          <Button asChild variant="outline" className="rounded-full border-slate-300">
            <Link href={`/${locale}/trial/info`}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              {tFunnel('back')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
