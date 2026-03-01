export const dynamic = 'force-dynamic';

import { requirePermission } from '@/lib/auth/permissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export default async function SchoolAdminDashboardPage() {
  await requirePermission(['classes:read']);

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">
        School Admin Dashboard
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>School Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Manage teachers, students, and school settings.
          </p>
          <Button asChild>
            <Link href="/dashboard/admin/classes">
              <GraduationCap className="mr-2 h-4 w-4" />
              Manage classes
            </Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
