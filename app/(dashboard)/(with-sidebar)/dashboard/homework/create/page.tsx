import Link from 'next/link';
import { getClassesForHomeworkCreate } from '@/lib/actions/homework';
import { CreateHomeworkForm } from './create-homework-form';

export const dynamic = 'force-dynamic';

export default async function CreateHomeworkPage() {
  const classes = await getClassesForHomeworkCreate();

  return (
    <section className="flex-1">
      <div className="mb-6">
        <Link
          href="/dashboard/homework"
          className="text-sm text-muted-foreground hover:text-[#1f2937]"
        >
          ← Back
        </Link>
      </div>
      <h1 className="text-lg lg:text-2xl font-medium text-[#1f2937] mb-6">
        Create homework
      </h1>
      <CreateHomeworkForm classes={classes} />
    </section>
  );
}
