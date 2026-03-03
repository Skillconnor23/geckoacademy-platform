'use client';

import Link from 'next/link';
import { Plus, FileVideo, FileText, BookOpen, Megaphone, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type AddPostMenuProps = {
  classId: string;
};

const OPTIONS = [
  { type: 'recording', label: 'Add recording', href: (id: string) => `/classroom/${id}/new?type=recording`, Icon: FileVideo },
  { type: 'document', label: 'Add document', href: (id: string) => `/classroom/${id}/new?type=document`, Icon: FileText },
  { type: 'homework', label: 'Add homework', href: (id: string) => `/classroom/${id}/new?type=homework`, Icon: BookOpen },
  { type: 'announcement', label: 'Add announcement', href: (id: string) => `/classroom/${id}/new?type=announcement`, Icon: Megaphone },
  { type: 'quiz', label: 'Add quiz', href: (id: string) => `/teacher/quizzes/new?classId=${id}`, Icon: ClipboardList },
] as const;

export function AddPostMenu({ classId }: AddPostMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="primary"
          size="sm"
          className="rounded-full bg-[#7daf41] text-white hover:border-[#7daf41] hover:bg-[#6c9b38]"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 sm:w-48"
        sideOffset={8}
      >
        {OPTIONS.map(({ type, label, href, Icon }) => (
          <DropdownMenuItem key={type} asChild>
            <Link
              href={href(classId)}
              className="flex w-full items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
