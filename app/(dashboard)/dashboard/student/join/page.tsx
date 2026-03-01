export const dynamic = 'force-dynamic';

import { requireRole } from '@/lib/auth/user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { JoinClassForm } from './join-class-form';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function StudentJoinClassPage() {
  await requireRole(['student']);

  return (
    <section className="flex-1 p-4 lg:p-8">
      <Link
        href="/dashboard/student"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to dashboard
      </Link>

      <h1 className="text-lg lg:text-2xl font-medium mb-6">Join a class</h1>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Enter class code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Ask your teacher or school for the class code. Enter it below to join
            the class and see upcoming sessions.
          </p>
          <JoinClassForm />
        </CardContent>
      </Card>
    </section>
  );
}
