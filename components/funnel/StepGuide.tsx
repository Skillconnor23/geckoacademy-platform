import { cn } from '@/lib/utils';

type StepGuideProps = {
  title: string;
  description: string;
  eyebrow?: string;
  className?: string;
};

/**
 * Compact step guide prompt for funnel pages.
 * Lightweight, supports momentum, mobile-first.
 */
export function StepGuide({ title, description, eyebrow, className }: StepGuideProps) {
  return (
    <div
      className={cn(
        'mb-6',
        className
      )}
    >
      {eyebrow && (
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
          {eyebrow}
        </p>
      )}
      <h2 className="text-base sm:text-lg font-semibold text-[#3d4236] leading-tight">
        {title}
      </h2>
      <p className="mt-1 text-sm text-slate-600 leading-snug max-w-prose">
        {description}
      </p>
    </div>
  );
}
