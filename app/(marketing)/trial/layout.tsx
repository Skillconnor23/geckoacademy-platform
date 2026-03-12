import { TrialProgressDots } from '@/components/funnel/TrialProgressDots';
import { TrialInfoSection } from '@/components/funnel/TrialInfoSection';

export const dynamic = 'force-dynamic';

/** Trial funnel layout: progress dots, compact info bar, then step content. */
export default function TrialLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="trial-funnel">
      <div className="trial-funnel-progress px-4 pt-8">
        <TrialProgressDots />
      </div>
      <div className="px-4">
        <div className="mx-auto max-w-md">
          <TrialInfoSection />
        </div>
      </div>
      {children}
    </div>
  );
}
