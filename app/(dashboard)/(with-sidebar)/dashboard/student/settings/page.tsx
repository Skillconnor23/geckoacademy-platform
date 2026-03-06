export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { requireRole } from '@/lib/auth/user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, LogIn, User } from 'lucide-react';

export default async function StudentSettingsPage() {
  await requireRole(['student']);
  const t = await getTranslations('dashboard.student.settingsPage');
  const tSidebar = await getTranslations('dashboard.sidebar.student');

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="mx-auto max-w-xl">
        <h1 className="mb-6 text-lg font-medium text-[#1f2937] lg:text-2xl">
          {t('title')}
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {t('subtitle')}
        </p>
        <Card className="rounded-2xl border border-[#e5e7eb]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('linksHeading')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <Link
              href="/dashboard/profile"
              className="flex min-h-[48px] items-center gap-3 rounded-lg px-3 py-2 text-[#1f2937] transition-colors hover:bg-muted/50"
            >
              <User className="h-5 w-5 shrink-0 text-muted-foreground" />
              <span className="font-medium">{tSidebar('profile')}</span>
            </Link>
            <Link
              href="/dashboard/student/join"
              className="flex min-h-[48px] items-center gap-3 rounded-lg px-3 py-2 text-[#1f2937] transition-colors hover:bg-muted/50"
            >
              <LogIn className="h-5 w-5 shrink-0 text-muted-foreground" />
              <span className="font-medium">{tSidebar('joinClass')}</span>
            </Link>
            <Link
              href="/dashboard/activity"
              className="flex min-h-[48px] items-center gap-3 rounded-lg px-3 py-2 text-[#1f2937] transition-colors hover:bg-muted/50"
            >
              <Activity className="h-5 w-5 shrink-0 text-muted-foreground" />
              <span className="font-medium">{tSidebar('activity')}</span>
            </Link>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
