import Link from 'next/link';
import type { ClassroomPost, ClassroomPostType } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import { ExternalLink, Download } from 'lucide-react';
import { PostThumb } from '@/components/classroom/PostThumb';

type Post = ClassroomPost;

const TYPE_LABELS: Record<string, string> = {
  homework: 'Homework',
  test: 'Test',
  recording: 'Recording',
  announcement: 'Announcement',
  document: 'Document',
  quiz: 'Quiz',
};

const TYPE_BORDER_COLORS: Record<ClassroomPostType, string> = {
  homework: '#ffaa00',
  recording: '#429ead',
  announcement: '#7daf41',
  test: '#e2e8f0',
  document: '#e2e8f0',
  quiz: '#7daf41',
};

const POST_TYPES: ClassroomPostType[] = [
  'recording',
  'homework',
  'test',
  'announcement',
  'document',
  'quiz',
];

function isClassroomPostType(s: string): s is ClassroomPostType {
  return (POST_TYPES as readonly string[]).includes(s);
}

export function ClassroomFeed({
  classId,
  initialPosts,
  canPost,
}: {
  classId: string;
  initialPosts: Post[];
  canPost: boolean;
}) {
  if (initialPosts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center leading-relaxed">
        No posts yet.{canPost ? ' Add materials or a recording link above.' : ''}
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {initialPosts.map((post) => {
        const postType = isClassroomPostType(post.type) ? post.type : 'document';
        const pillColor = TYPE_BORDER_COLORS[postType];
        const quizHref = post.type === 'quiz' && post.quizId ? `/learning/${post.quizId}` : null;
        const primaryAction = quizHref
          ? { href: quizHref, label: 'Open', Icon: ExternalLink, isInternal: true }
          : post.linkUrl
            ? { href: post.linkUrl, label: 'Open', Icon: ExternalLink, isInternal: false }
            : post.fileUrl
              ? { href: post.fileUrl, label: 'Download', Icon: Download, isInternal: false }
              : null;

        return (
          <li
            key={post.id}
            className="flex items-center gap-5 rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          >
            {/* Left: icon */}
            <PostThumb type={postType} size="md" />

            {/* Middle: content */}
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize"
                  style={{
                    backgroundColor: pillColor === '#e2e8f0' ? '#f1f5f9' : `${pillColor}20`,
                    color: pillColor === '#e2e8f0' ? '#64748b' : pillColor,
                  }}
                >
                  {TYPE_LABELS[post.type] ?? post.type}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(post.createdAt).toLocaleString()}
                </span>
              </div>
              {post.title && (
                <p className="font-medium text-sm text-[#1f2937]">{post.title}</p>
              )}
              {post.body && (
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {post.body}
                </p>
              )}
            </div>

            {/* Right: primary action */}
            {primaryAction && (
              <Button
                variant="secondary"
                size="sm"
                className="shrink-0 rounded-full"
                asChild
              >
                {primaryAction.isInternal ? (
                  <Link
                    href={primaryAction.href}
                    className="inline-flex items-center gap-1.5"
                  >
                    <primaryAction.Icon className="h-3.5 w-3.5" />
                    {primaryAction.label}
                  </Link>
                ) : (
                  <a
                    href={primaryAction.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5"
                  >
                    <primaryAction.Icon className="h-3.5 w-3.5" />
                    {primaryAction.label}
                  </a>
                )}
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
