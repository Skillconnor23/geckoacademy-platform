'use client';

import { useState, useEffect } from 'react';

type Props = {
  /** ISO date string for trial start (e.g. from booking.trialTime) */
  trialTimeIso: string | null;
  /** Locale for formatting fallback text */
  locale: string;
  /** Translated "Starts on" prefix for static text */
  startsOnLabel: string;
  /** Translated "days" / "hours" / "minutes" for countdown */
  daysLabel: string;
  hoursLabel: string;
  minutesLabel: string;
};

export function TrialCountdown({
  trialTimeIso,
  locale,
  startsOnLabel,
  daysLabel,
  hoursLabel,
  minutesLabel,
}: Props) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!trialTimeIso) return;
    const interval = setInterval(() => setNow(new Date()), 60_000); // update every minute
    return () => clearInterval(interval);
  }, [trialTimeIso]);

  if (!trialTimeIso) return null;

  const start = new Date(trialTimeIso);
  const diff = start.getTime() - now.getTime();

  if (diff <= 0) {
    return (
      <p className="text-base font-medium text-[#7daf41]">
        {startsOnLabel} — {start.toLocaleString(locale, { dateStyle: 'full', timeStyle: 'short' })}
      </p>
    );
  }

  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

  // If more than 24 hours away, show "Starts on Friday at 12:30 PM" style for clarity
  if (days > 0) {
    return (
      <p className="text-base font-medium text-[#3d4236]">
        {startsOnLabel}{' '}
        {start.toLocaleString(locale, {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })}
      </p>
    );
  }

  return (
    <p className="text-base font-medium text-[#3d4236]" role="timer" aria-live="polite">
      {hours > 0 && (
        <span>
          {hours} {hoursLabel}
        </span>
      )}
      {hours > 0 && minutes >= 0 && ' '}
      <span>
        {minutes} {minutesLabel}
      </span>
    </p>
  );
}
