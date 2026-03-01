import {
  Video,
  NotebookPen,
  FileCheck,
  Megaphone,
  FileText,
  type LucideIcon,
} from 'lucide-react';
import type { ClassroomPostType } from '@/lib/db/schema';

const ICON_MAP: Record<ClassroomPostType, LucideIcon> = {
  recording: Video,
  homework: NotebookPen,
  test: FileCheck,
  announcement: Megaphone,
  document: FileText,
};

export type PostThumbProps = {
  type: ClassroomPostType;
  size?: 'sm' | 'md';
};

const sizeClasses = {
  sm: 'h-14 w-14',
  md: 'h-16 w-16',
} as const;

export function PostThumb({ type, size = 'md' }: PostThumbProps) {
  const Icon = ICON_MAP[type] ?? FileText;
  const boxClass = sizeClasses[size];

  return (
    <div
      className={`flex ${boxClass} shrink-0 items-center justify-center rounded-xl border bg-muted/40`}
      aria-hidden
    >
      <Icon className="h-5 w-5 text-muted-foreground" />
    </div>
  );
}
