'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Send, Loader2, ArrowLeft } from 'lucide-react';
import {
  startConversationAction,
  sendMessageAction,
} from '@/lib/actions/messaging';
import type { PlatformRole } from '@/lib/db/schema';

function initials(name: string | null, email: string): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
    if (parts.length > 1) {
      return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase();
    }
  }
  return email.slice(0, 2).toUpperCase();
}

function displayName(name: string | null, email: string): string {
  return name?.trim() ?? email;
}

type Conversation = {
  id: string;
  otherUser: { id: number; name: string | null; email: string };
  lastMessage: { body: string; createdAt: Date } | null;
};

type Recipient = { id: number; name: string | null; email: string };

type ThreadData = {
  conversationId: string;
  otherUser: { id: number; name: string | null; email: string } | null;
  messages: Array<{
    id: string;
    body: string;
    createdAt: Date;
    senderId: number;
    senderName: string | null;
  }>;
};

type Props = {
  role: PlatformRole;
  currentUserId: number;
  conversations: Conversation[];
  recipients: Recipient[];
  selectedId: string | null;
  thread: ThreadData | null;
};

export function MessagesView({
  role,
  currentUserId,
  conversations,
  recipients,
  selectedId,
  thread,
}: Props) {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [startPending, setStartPending] = useState<number | null>(null);
  const [newMessageOpen, setNewMessageOpen] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!thread) return;
    setError(null);
    setPending(true);
    const result = await sendMessageAction(thread.conversationId, body.trim());
    setPending(false);
    if (result.success) {
      setBody('');
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  async function handleStartConversation(recipientId: number) {
    setError(null);
    setStartPending(recipientId);
    const result = await startConversationAction(recipientId);
    setStartPending(null);
    if (!result.success) {
      setError(result.error);
    }
    // On success, action redirects
  }

  return (
    <section className="flex h-[calc(100dvh-68px)] w-full lg:h-[calc(100vh-68px)]">
      {/* Left: conversation list — 380px column, on mobile hidden when thread selected */}
      <aside
        className={`flex w-full shrink-0 flex-col border-r border-[#e5e7eb] bg-white lg:w-[380px] ${
          selectedId ? 'hidden lg:flex' : 'flex'
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <h1 className="text-base font-medium text-foreground">Messages</h1>
          {recipients.length > 0 && (
            <div className="relative">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setNewMessageOpen(!newMessageOpen)}
              >
                New message
              </Button>
              {newMessageOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    aria-hidden
                    onClick={() => setNewMessageOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-20 mt-1 min-w-[220px] max-h-64 overflow-y-auto rounded-lg border border-border bg-card py-1 shadow-sm">
                    {recipients.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          handleStartConversation(r.id);
                          setNewMessageOpen(false);
                        }}
                        disabled={startPending !== null}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/50 disabled:opacity-50"
                      >
                        <Avatar className="h-6 w-6 shrink-0">
                          <AvatarFallback className="text-xs">
                            {initials(r.name, r.email)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">
                          {displayName(r.name, r.email)}
                        </span>
                        {startPending === r.id && (
                          <Loader2 className="ml-auto h-4 w-4 shrink-0 animate-spin" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              No conversations yet. Start one with &quot;New message&quot;.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {conversations.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/dashboard/messages?c=${c.id}`}
                    className={`flex gap-3 px-4 py-3 hover:bg-muted/50 ${
                      selectedId === c.id ? 'bg-muted/60' : ''
                    }`}
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="text-sm">
                        {initials(c.otherUser.name, c.otherUser.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-sm">
                        {displayName(c.otherUser.name, c.otherUser.email)}
                      </p>
                      {c.lastMessage ? (
                        <p className="truncate text-xs text-muted-foreground">
                          {c.lastMessage.body}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          No messages yet
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Right: thread + composer — on mobile, shown only when conversation selected */}
      <main
        className={`flex min-w-0 flex-1 flex-col bg-white ${
          selectedId ? 'flex' : 'hidden lg:flex'
        }`}
      >
        {thread ? (
          <>
            <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden shrink-0"
                asChild
              >
                <Link href="/dashboard/messages" aria-label="Back to conversations">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="text-sm">
                    {thread.otherUser
                      ? initials(thread.otherUser.name, thread.otherUser.email)
                      : '—'}
                  </AvatarFallback>
                </Avatar>
                <p className="truncate font-medium">
                  {thread.otherUser
                    ? displayName(thread.otherUser.name, thread.otherUser.email)
                    : 'Unknown'}
                </p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {thread.messages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No messages yet. Send one below.
                </p>
              ) : (
                thread.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${
                      m.senderId === currentUserId ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
                        m.senderId === currentUserId
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card border border-border'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.body}</p>
                      <p
                        className={`mt-1 text-xs ${
                          m.senderId === currentUserId
                            ? 'text-primary-foreground/80'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {new Date(m.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="border-t border-border bg-card p-4">
              <form onSubmit={handleSend} className="flex gap-2">
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Type a message..."
                  rows={2}
                  className="flex-1 resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  disabled={pending}
                  maxLength={5000}
                />
                <Button type="submit" size="icon" disabled={pending || !body.trim()}>
                  {pending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span className="sr-only">Send</span>
                </Button>
              </form>
              {error && (
                <p className="mt-2 text-sm text-destructive">{error}</p>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-1 w-full items-center justify-center p-8">
            <div className="flex flex-col items-center gap-3 text-center text-black/50">
              <MessageSquare className="h-10 w-10 text-black/30" />
              <p className="text-base">Select a conversation or start a new one.</p>
            </div>
          </div>
        )}
      </main>
    </section>
  );
}
