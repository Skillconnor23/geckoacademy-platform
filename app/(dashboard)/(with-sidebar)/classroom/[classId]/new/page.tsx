export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireClassroomAccess, canPostToClassroom } from '@/lib/auth/classroom';
import { ClassroomComposer } from '@/components/classroom/ClassroomComposer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users } from 'lucide-react';

type Props = {
  params: Promise<{ classId: string }>;
  searchParams: Promise<{ type?: string }>;
};

export default async function NewClassroomPostPage({ params, searchParams }: Props) {
  const { classId } = await params;
  const { type: typeParam } = await searchParams;
  const { user, eduClass } = await requireClassroomAccess(classId);

  const canPost = await canPostToClassroom(user, classId);
  if (!canPost) {
    redirect(`/classroom/${classId}`);
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/classroom/${classId}`} className="flex items-center gap-1 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to classroom
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/classroom/${classId}/people`} className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              People
            </Link>
          </Button>
        </div>

        <div className="mb-4">
          <h1 className="text-lg font-medium">New post</h1>
          <p className="text-sm text-muted-foreground">
            Add to {eduClass.name}
          </p>
        </div>

        <ClassroomComposer
          classId={classId}
          defaultType={
            typeParam && ['recording', 'document', 'homework', 'announcement', 'test'].includes(typeParam)
              ? typeParam
              : 'announcement'
          }
        />
      </div>
    </section>
  );
}
