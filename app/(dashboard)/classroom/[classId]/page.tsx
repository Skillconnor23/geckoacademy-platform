export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { requireClassroomAccess, canPostToClassroom } from '@/lib/auth/classroom';
import { listClassroomPosts } from '@/lib/db/queries/education';
import { ClassroomFeed } from './classroom-feed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Users } from 'lucide-react';

type Props = { params: Promise<{ classId: string }> };

export default async function ClassroomPage({ params }: Props) {
  const { classId } = await params;
  const { user, eduClass } = await requireClassroomAccess(classId);
  const posts = await listClassroomPosts(classId, 50);
  const canPost = await canPostToClassroom(user, classId);

  return (
    <section className="flex-1 p-6 lg:p-10">
      <div className="mx-auto w-full max-w-6xl">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/dashboard" className="flex items-center gap-1 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </Button>

        {/* Header row: class name + level pill + timezone | People */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {eduClass.name}
              </h2>
              {(eduClass.geckoLevel ?? eduClass.level) && (
                <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {eduClass.geckoLevel ?? eduClass.level}
                </span>
              )}
            </div>
            {eduClass.timezone && (
              <p className="mt-1 text-sm text-muted-foreground">{eduClass.timezone}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/classroom/${classId}/people`} className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                People
              </Link>
            </Button>
            {canPost && (
              <Button asChild variant="primary" size="sm">
                <Link href={`/classroom/${classId}/new`} className="flex items-center gap-1.5">
                  <Plus className="h-4 w-4" />
                  New post
                </Link>
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Classroom feed</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Materials, recordings, and announcements from your teacher.
            </p>
          </CardHeader>
        <CardContent>
          <ClassroomFeed
            classId={classId}
            initialPosts={posts}
            canPost={canPost}
          />
        </CardContent>
      </Card>
      </div>
    </section>
  );
}
