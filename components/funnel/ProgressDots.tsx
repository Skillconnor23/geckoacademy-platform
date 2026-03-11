'use client';

type ProgressDotsProps = {
  currentStep: number;
  totalSteps: number;
  className?: string;
};

/**
 * Minimal progress indicator for funnel flows.
 * Filled dots for completed/current, unfilled for remaining.
 * Example: step 3 of 5 → ● ● ● ○ ○
 */
export function ProgressDots({
  currentStep,
  totalSteps,
  className = '',
}: ProgressDotsProps) {
  return (
    <div
      className={`flex items-center justify-center gap-1.5 mb-6 ${className}`}
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={`Step ${currentStep} of ${totalSteps}`}
    >
      {Array.from({ length: totalSteps }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full transition-colors ${
            i < currentStep ? 'bg-[#7daf41]' : 'bg-slate-300'
          }`}
          aria-hidden
        />
      ))}
    </div>
  );
}
