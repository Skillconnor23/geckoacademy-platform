'use client';

import { usePathname } from 'next/navigation';
import { ProgressDots } from './ProgressDots';

const TOTAL_STEPS = 5;

const STEP_SEGMENTS: Record<string, number> = {
  start: 1,
  level: 2,
  info: 3,
  time: 4,
  form: 5,
};

/** Derives current step from pathname. Works with locale prefix (e.g. /en/trial/start). */
function getStepFromPathname(pathname: string): number | null {
  const segments = pathname.split('/').filter(Boolean);
  const trialIdx = segments.indexOf('trial');
  if (trialIdx === -1) return null;
  const stepSegment = segments[trialIdx + 1];
  if (!stepSegment) return null;
  return STEP_SEGMENTS[stepSegment] ?? null;
}

/** Renders ProgressDots for trial funnel. Step derived from path. Hidden on confirmed. */
export function TrialProgressDots() {
  const pathname = usePathname();
  const step = getStepFromPathname(pathname);

  if (step == null) return null;

  return <ProgressDots currentStep={step} totalSteps={TOTAL_STEPS} />;
}
