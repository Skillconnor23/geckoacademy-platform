'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { ClassroomPostType } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, ExternalLink, Download } from 'lucide-react';
import { PostThumb } from '@/components/classroom/PostThumb';

const INITIAL_WEEKS = 3;
const WEEKS_PER_LOAD = 2;

const TYPE_LABELS: Record<string, string> = {
  homework: 'Homework',
  test: 'Test',
  recording: 'Recording',
  announcement: 'Announcement',
  document: 'Document',
  quiz: 'Quiz',
};

const POST_TYPES: ClassroomPostType[] = ['recording', 'homework', 'test', 'announcement', 'document', 'quiz'];

function isClassroomPostType(s: string): s is ClassroomPostType {
  return (POST_TYPES as readonly string[]).includes(s);
}

/** Monday-based start of week */
function startOfWeek(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function formatWeekLabel(start: Date): string {
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

function formatDayHeader(d: Date): string {
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${weekday} — ${date}`;
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1d ago';
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

type PostWithAuthor = {
  id: string;
  type: string;
  title: string | null;
  body: string | null;
  fileUrl: string | null;
  linkUrl: string | null;
  quizId: string | null;
  createdAt: Date | string;
  authorName: string | null;
  authorAvatarUrl: string | null;
};

type DayGroup = { dateKey: string; date: Date; items: PostWithAuthor[] };
type WeekGroup = { startDate: Date; label: string; isCurrentWeek: boolean; days: DayGroup[] };

function groupPostsByWeekAndDay(posts: PostWithAuthor[]): WeekGroup[] {
  const now = new Date();
  const currentWeekStart = startOfWeek(now);
  const weekMap = new Map<string, { startDate: Date; items: PostWithAuthor[] }>();

  for (const post of posts) {
    const d = new Date(post.createdAt);
    const weekStart = startOfWeek(d);
    const key = weekStart.toISOString().slice(0, 10);
    const existing = weekMap.get(key);
    if (existing) existing.items.push(post);
    else weekMap.set(key, { startDate: weekStart, items: [post] });
  }

  const weeks: WeekGroup[] = [];
  const sortedKeys = [...weekMap.keys()].sort().reverse();
  for (const key of sortedKeys) {
    const { startDate, items } = weekMap.get(key)!;
    const dayMap = new Map<string, PostWithAuthor[]>();
    for (const post of items) {
      const d = new Date(post.createdAt);
      const dateKey = d.toISOString().slice(0, 10);
      const list = dayMap.get(dateKey) ?? [];
      list.push(post);
      dayMap.set(dateKey, list);
    }
    const days: DayGroup[] = [...dayMap.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([dateKey, items]) => ({
        dateKey,
        date: new Date(dateKey),
        items,
      }));
    weeks.push({
      startDate,
      label: formatWeekLabel(startDate),
      isCurrentWeek: startDate.getTime() === currentWeekStart.getTime(),
      days,
    });
  }
  return weeks;
}

function getInitials(name: string | null): string {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

type Props = {
  classId: string;
  posts: PostWithAuthor[];
  canPost: boolean;
};

export function ClassroomFeedClient({ classId, posts, canPost }: Props) {
  const t = useTranslations('classroom');
  const [visibleWeeks, setVisibleWeeks] = useState(INITIAL_WEEKS);
  const [collapsedWeeks, setCollapsedWeeks] = useState<Set<string>>(() => {
    const weeks = groupPostsByWeekAndDay(posts);
    const s = new Set<string>();
    weeks.forEach((w, i) => {
      if (!w.isCurrentWeek && i < INITIAL_WEEKS) s.add(w.startDate.toISOString().slice(0, 10));
    });
    return s;
  });

  const weeks = useMemo(() => groupPostsByWeekAndDay(posts), [posts]);
  const displayedWeeks = weeks.slice(0, visibleWeeks);
  const hasMore = visibleWeeks < weeks.length;

  const toggleWeek = (key: string) => {
    setCollapsedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (posts.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No posts yet.{canPost ? ' Add materials or a recording link above.' : ''}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {displayedWeeks.map((week) => {
        const weekKey = week.startDate.toISOString().slice(0, 10);
        const isCollapsed = collapsedWeeks.has(weekKey);
        const isCurrent = week.isCurrentWeek;

        return (
          <div key={weekKey} className="rounded-xl border border-[#e5e7eb] overflow-hidden">
            <button
              type="button"
              onClick={() => toggleWeek(weekKey)}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium transition-colors bg-muted/40 text-muted-foreground hover:bg-muted/60"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0" />
              )}
              Week of {week.label}
              {isCurrent && (
                <span className="text-muted-foreground">
                  ({t('currentWeek')})
                </span>
              )}
            </button>
            {!isCollapsed && (
              <div className="space-y-6 bg-white px-4 pt-4 pb-4">
                {week.days.map((day) => (
                  <div key={day.dateKey}>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      {formatDayHeader(day.date)}
                    </p>
                    <div className="space-y-3">
                      {day.items.map((post) => {
                        const postType = isClassroomPostType(post.type) ? post.type : 'document';
                        const isAnnouncement = post.type === 'announcement';
                        const quizHref = post.type === 'quiz' && post.quizId ? `/learning/${post.quizId}` : null;
                        const homeworkHref = post.type === 'homework' ? '/dashboard/student/homework' : null;
                        const href = quizHref ?? homeworkHref ?? null;

                        if (isAnnouncement) {
                          return (
                            <div
                              key={post.id}
                              className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#7daf41]/20 text-sm font-semibold text-[#7daf41]"
                                  aria-hidden
                                >
                                  {post.authorAvatarUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={post.authorAvatarUrl}
                                      alt=""
                                      className="h-full w-full rounded-full object-cover"
                                    />
                                  ) : (
                                    getInitials(post.authorName)
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <span className="font-medium text-gray-900">{post.authorName ?? 'Teacher'}</span>
                                    <span>·</span>
                                    <span>{formatRelativeTime(new Date(post.createdAt))}</span>
                                  </div>
                                  {post.title && (
                                    <p className="mt-1 font-medium text-gray-900">{post.title}</p>
                                  )}
                                  {post.body && (
                                    <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{post.body}</p>
                                  )}
                                  {(post.fileUrl || post.linkUrl) && (
                                    <div className="mt-3 space-y-2">
                                      {post.fileUrl && (
                                        <a
                                          href={post.fileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-muted/30 px-3 py-1.5 text-sm text-gray-900 hover:bg-muted/50"
                                        >
                                          <Download className="h-3.5 w-3.5" />
                                          Download
                                        </a>
                                      )}
                                      {post.linkUrl && (
                                        <a
                                          href={post.linkUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-muted/30 px-3 py-1.5 text-sm text-gray-900 hover:bg-muted/50"
                                        >
                                          <ExternalLink className="h-3.5 w-3.5" />
                                          Open link
                                        </a>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        }

                        const primaryAction = quizHref
                          ? { href: quizHref, label: 'Open', Icon: ExternalLink, isInternal: true }
                          : post.linkUrl
                            ? { href: post.linkUrl, label: 'Open', Icon: ExternalLink, isInternal: false }
                            : post.fileUrl
                              ? { href: post.fileUrl, label: 'Download', Icon: Download, isInternal: false }
                              : null;

                        return (
                          <div
                            key={post.id}
                            className="flex items-center gap-4 rounded-lg border border-[#e5e7eb] bg-white p-4 transition hover:shadow-sm"
                          >
                            <PostThumb type={postType} size="sm" />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-medium capitalize text-muted-foreground">
                                  {TYPE_LABELS[post.type] ?? post.type}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatRelativeTime(new Date(post.createdAt))}
                                </span>
                              </div>
                              {post.title && (
                                <p className="font-medium text-sm text-gray-900">{post.title}</p>
                              )}
                            </div>
                            {primaryAction && (
                              <Button variant="secondary" size="sm" className="shrink-0 rounded-full" asChild>
                                {primaryAction.isInternal ? (
                                  <Link href={primaryAction.href} className="inline-flex items-center gap-1.5">
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
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {hasMore && (
        <Button
          variant="outline"
          size="sm"
          className="w-full rounded-full"
          onClick={() => setVisibleWeeks((n) => n + WEEKS_PER_LOAD)}
        >
          Load previous weeks
        </Button>
      )}
    </div>
  );
}
