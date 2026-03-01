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
};

const POST_TYPES: ClassroomPostType[] = [
  'recording',
  'homework',
  'test',
  'announcement',
  'document',
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
  const showThumbs = true;

  if (initialPosts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        No posts yet.{canPost ? ' Add materials or a recording link above.' : ''}
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {initialPosts.map((post) => {
        const postType = isClassroomPostType(post.type) ? post.type : 'document';
        const content = (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium capitalize">
                {TYPE_LABELS[post.type] ?? post.type}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(post.createdAt).toLocaleString()}
              </span>
            </div>
            {(post.title || post.body) && (
              <div>
                {post.title && (
                  <p className="font-medium text-sm">{post.title}</p>
                )}
                {post.body && (
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                    {post.body}
                  </p>
                )}
              </div>
            )}
            <div className="flex gap-2 pt-1">
              {post.fileUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={post.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </a>
                </Button>
              )}
              {post.linkUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={post.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open
                  </a>
                </Button>
              )}
            </div>
          </>
        );

        return (
          <li
            key={post.id}
            className="border rounded-lg p-4 bg-muted/30 space-y-2"
          >
            {showThumbs ? (
              <div className="flex gap-4">
                <PostThumb type={postType} size="md" />
                <div className="min-w-0 flex-1 space-y-2">{content}</div>
              </div>
            ) : (
              content
            )}
          </li>
        );
      })}
    </ul>
  );
}
