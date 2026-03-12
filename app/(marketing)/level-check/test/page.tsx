import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { PlacementTest } from '@/components/level-check/PlacementTest';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = {
  searchParams: Promise<{ returnToken?: string; email?: string; source?: string }>;
};

export default async function LevelCheckTestPage({ searchParams }: Props) {
  const locale = await getLocale();
  const params = await searchParams;
  const returnToken = params.returnToken ?? undefined;
  const email = params.email ?? undefined;
  const source = params.source ?? undefined;

  return (
    <div className="mx-auto max-w-2xl">
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-1">
        <Link
          href={`/${locale}/level-check`}
          className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Level Check
        </Link>
      </Button>
      <PlacementTest returnToken={returnToken} source={source} email={email} />
    </div>
  );
}
