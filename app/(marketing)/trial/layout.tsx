import { TrialProgressDots } from '@/components/funnel/TrialProgressDots';

export const dynamic = 'force-dynamic';

/** Trial funnel layout: progress dots above all trial step content. */
export default function TrialLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="trial-funnel">
      <div className="trial-funnel-progress px-4 pt-8">
        <TrialProgressDots />
      </div>
      {children}
    </div>
  );
}
