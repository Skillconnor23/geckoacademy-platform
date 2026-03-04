'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, BookOpen, BookMarked, BookText } from 'lucide-react';

export function LearningToolsCreateDropdown() {
  const t = useTranslations('learningTools');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="min-h-10 rounded-full bg-[#429ead] px-4 text-white hover:bg-[#36899a]">
          {t('create')}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        <DropdownMenuItem asChild>
          <Link href="/teacher/quizzes/new" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {t('quiz')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/teacher/learning/flashcards" className="flex items-center gap-2">
            <BookMarked className="h-4 w-4" />
            {t('flashcards')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/teacher/learning-tools/readings/new" className="flex items-center gap-2">
            <BookText className="h-4 w-4" />
            {t('reading')}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
