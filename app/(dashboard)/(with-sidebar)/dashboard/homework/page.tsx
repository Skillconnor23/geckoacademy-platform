export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getAdminHomeworkList } from '@/lib/actions/homework';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus } from 'lucide-react';

export default async function HomeworkAdminListPage() {
  const list = await getAdminHomeworkList();
  if (!list) return null;

  return (
    <section className="flex-1">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg lg:text-2xl font-medium text-[#1f2937]">
          Homework
        </h1>
        <Button asChild className="rounded-full" variant="primary">
          <Link href="/dashboard/homework/create">
            <Plus className="mr-2 h-4 w-4" />
            Create homework
          </Link>
        </Button>
      </div>

      <Card className="rounded-2xl border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <CardHeader>
          <CardTitle>All assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              No homework yet. Create your first assignment to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Due date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map(({ hw, className }) => (
                  <TableRow key={hw.id}>
                    <TableCell className="font-medium">{hw.title}</TableCell>
                    <TableCell>{className}</TableCell>
                    <TableCell>
                      {hw.dueDate
                        ? new Date(hw.dueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'No due date'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm" className="rounded-full">
                        <Link href={`/dashboard/homework/${hw.id}`}>
                          View submissions
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
