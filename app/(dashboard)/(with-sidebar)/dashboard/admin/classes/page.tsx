import Link from 'next/link';
import { listClasses } from '@/lib/db/queries/education';
import { requirePermission } from '@/lib/auth/permissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AdminClassesTable } from './AdminClassesTable';

export const dynamic = 'force-dynamic';

export default async function AdminClassesPage() {
  await requirePermission('classes:read');
  const classes = await listClasses();

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg lg:text-2xl font-medium">Classes</h1>
        <Button asChild>
          <Link href="/dashboard/admin/classes/new">
            <Plus className="mr-2 h-4 w-4" />
            Create class
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All classes</CardTitle>
        </CardHeader>
        <CardContent>
          {classes.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              No classes yet. Create your first class to get started.
            </p>
          ) : (
            <AdminClassesTable classes={classes} />
          )}
        </CardContent>
      </Card>
    </section>
  );
}
