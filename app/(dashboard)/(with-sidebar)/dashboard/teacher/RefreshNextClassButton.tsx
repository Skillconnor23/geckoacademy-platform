'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { RotateCw } from 'lucide-react';

export function RefreshNextClassButton() {
  const router = useRouter();
  const t = useTranslations('teacher.dashboard');

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => router.refresh()}
      className="mt-2 rounded-full"
    >
      <RotateCw className="mr-1.5 h-4 w-4" />
      {t('refreshNextClass')}
    </Button>
  );
}
