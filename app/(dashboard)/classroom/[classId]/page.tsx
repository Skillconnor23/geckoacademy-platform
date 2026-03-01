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
    <section className="flex-1 p-4 lg:p-8">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard" className="flex items-center gap-1 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/classroom/${classId}/people`} className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                People
              </Link>
            </Button>
            {canPost && (
              <Button asChild size="sm">
                <Link href={`/classroom/${classId}/new`} className="flex items-center gap-1.5">
                  <Plus className="h-4 w-4" />
                  New post
                </Link>
              </Button>
            )}
          </div>
        </div>

        <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">{eduClass.name}</CardTitle>
          {(eduClass.level || eduClass.timezone) && (
            <p className="text-sm text-muted-foreground">
              {[eduClass.level, eduClass.timezone].filter(Boolean).join(' · ')}
            </p>
          )}
        </CardHeader>
      </Card>

        <Card>
        <CardHeader>
          <CardTitle>Classroom feed</CardTitle>
          <p className="text-sm text-muted-foreground">
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
