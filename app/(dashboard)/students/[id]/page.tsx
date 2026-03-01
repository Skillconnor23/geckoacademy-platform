export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

type Props = { params: Promise<{ id: string }> };

export default async function StudentDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="mx-auto w-full max-w-4xl px-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard" className="flex items-center gap-1 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </Button>
        <h1 className="mt-6 text-lg font-medium">Student</h1>
        <p className="text-sm text-muted-foreground mt-2">
          View student {id} — placeholder page.
        </p>
      </div>
    </section>
  );
}
