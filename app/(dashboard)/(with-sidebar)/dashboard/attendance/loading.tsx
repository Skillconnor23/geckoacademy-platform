import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AttendanceDetailsLoading() {
  return (
    <section className="flex-1 space-y-6">
      <div className="h-9 w-32 animate-pulse rounded bg-muted" aria-hidden />
      <div className="flex flex-col gap-1">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded bg-muted" />
      </div>
      <div className="space-y-4">
        <div className="h-5 w-28 animate-pulse rounded bg-muted" />
        <Card className="rounded-2xl border-[#e5e7eb]">
          <CardHeader className="pb-2">
            <CardTitle className="h-5 w-40 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-7 w-16 animate-pulse rounded bg-muted" />
            <div className="h-16 w-full animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
