export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { requirePermission } from '@/lib/auth/permissions';
import {
  listSchools,
  getClassCountBySchoolId,
  getStudentCountBySchoolId,
  getSchoolAdminCountBySchoolId,
} from '@/lib/db/queries/schools';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Building2 } from 'lucide-react';
import { AdminSchoolsTable } from './AdminSchoolsTable';

export default async function AdminSchoolsPage() {
  await requirePermission('classes:read');
  const schools = await listSchools();
  const counts = await Promise.all(
    schools.map(async (s) => ({
      id: s.id,
      classes: await getClassCountBySchoolId(s.id),
      students: await getStudentCountBySchoolId(s.id),
      admins: await getSchoolAdminCountBySchoolId(s.id),
    }))
  );
  const countMap = new Map(counts.map((c) => [c.id, c]));

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg lg:text-2xl font-medium">Schools</h1>
        <Button asChild>
          <Link href="/dashboard/admin/schools/new">
            <Plus className="mr-2 h-4 w-4" />
            Create school
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All schools</CardTitle>
          <p className="text-sm text-muted-foreground">
            Schools can have their own classes and school admins. Assign classes to a school to scope them for school admins.
          </p>
        </CardHeader>
        <CardContent>
          {schools.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground/60 mb-4" />
              <h2 className="text-lg font-medium mb-1">No schools yet</h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Create a school to assign school admins and classes. Schools let you organize classes and give school admins access to manage their own school.
              </p>
              <Button asChild>
                <Link href="/dashboard/admin/schools/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create school
                </Link>
              </Button>
            </div>
          ) : (
            <AdminSchoolsTable schools={schools} countMap={countMap} />
          )}
        </CardContent>
      </Card>
    </section>
  );
}
