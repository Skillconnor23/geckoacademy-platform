export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { requireRole } from '@/lib/auth/user';
import { getScheduleSummaryForUser } from '@/lib/db/queries/education';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, ChevronRight } from 'lucide-react';

export default async function AdminPeoplePage() {
  const user = await requireRole(['admin']);
  const classes = await getScheduleSummaryForUser(user.id, 'admin');

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="text-lg lg:text-2xl font-medium mb-6 flex items-center gap-2">
          <Users className="h-6 w-6" />
          People
        </h1>
        <Card>
          <CardHeader>
            <CardTitle>Class rosters</CardTitle>
            <p className="text-sm text-muted-foreground">
              View teachers and students for each class.
            </p>
          </CardHeader>
          <CardContent>
            {classes.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                No classes yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {classes.map((c) => (
                  <li key={c.id}>
                    <Button variant="outline" className="w-full justify-between" asChild>
                      <Link href={`/classroom/${c.id}/people`}>
                        <span>{c.name}</span>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
