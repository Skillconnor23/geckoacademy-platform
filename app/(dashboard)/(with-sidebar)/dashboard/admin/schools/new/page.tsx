export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { requirePermission } from '@/lib/auth/permissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { CreateSchoolForm } from './CreateSchoolForm';

export default async function NewSchoolPage() {
  await requirePermission('classes:write');

  return (
    <section className="flex-1 p-4 lg:p-8">
      <Link
        href="/dashboard/admin/schools"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to schools
      </Link>
      <h1 className="text-lg lg:text-2xl font-medium mb-6">Create school</h1>
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>School details</CardTitle>
          <p className="text-sm text-muted-foreground">
            Name and slug (used in URLs). Slug will be auto-generated from name if left blank.
          </p>
        </CardHeader>
        <CardContent>
          <CreateSchoolForm />
        </CardContent>
      </Card>
    </section>
  );
}
