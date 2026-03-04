'use client';

import { useState } from 'react';
import {
  TableCell,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { updateHomeworkFeedbackAction } from '@/lib/actions/homework';
import { Loader2, X } from 'lucide-react';
import type { HomeworkSubmission } from '@/lib/db/schema';

type FileItem = { url: string; mimeType: string; name: string; size: number };

function isImage(mime: string): boolean {
  return mime.startsWith('image/');
}
function isAudio(mime: string): boolean {
  return mime.startsWith('audio/');
}

export function HomeworkSubmissionRow({
  submission,
  studentName,
  studentEmail,
  homeworkId,
}: {
  submission: HomeworkSubmission;
  studentName: string | null;
  studentEmail: string;
  homeworkId: string;
}) {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState(submission.feedback ?? '');
  const [score, setScore] = useState<string>(
    submission.score != null ? String(submission.score) : ''
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const files = (submission.files ?? []) as FileItem[];

  async function handleSaveFeedback(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const formData = new FormData();
    formData.set('submissionId', submission.id);
    formData.set('feedback', feedback);
    formData.set('score', score.trim() || '');
    formData.set('homeworkId', homeworkId);
    const result = await updateHomeworkFeedbackAction(null, formData);
    setPending(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setOpen(false);
  }

  return (
    <>
      <TableRow>
        <TableCell>
          <div>
            <p className="font-medium">{studentName ?? studentEmail}</p>
            {studentName && (
              <p className="text-xs text-muted-foreground">{studentEmail}</p>
            )}
          </div>
        </TableCell>
        <TableCell>
          {new Date(submission.submittedAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </TableCell>
        <TableCell>{submission.score != null ? `${submission.score}%` : '—'}</TableCell>
        <TableCell className="text-right">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => setOpen(true)}
          >
            Open
          </Button>
        </TableCell>
      </TableRow>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-[#e5e7eb]">
              <h2 className="text-lg font-semibold text-[#1f2937]">
                {studentName ?? studentEmail} — Submission
              </h2>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
          <div className="space-y-4">
            {submission.textNote && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Note
                </p>
                <p className="text-sm text-[#1f2937] whitespace-pre-wrap">
                  {submission.textNote}
                </p>
              </div>
            )}
            {files.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Files
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {files.map((f, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-[#e5e7eb] p-2 bg-muted/30"
                    >
                      {isImage(f.mimeType) ? (
                        <a
                          href={f.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <img
                            src={f.url}
                            alt={f.name}
                            className="w-full h-24 object-cover rounded"
                          />
                          <p className="text-xs mt-1 truncate">{f.name}</p>
                        </a>
                      ) : isAudio(f.mimeType) ? (
                        <div>
                          <audio
                            controls
                            src={f.url}
                            className="w-full max-h-10"
                          />
                          <p className="text-xs mt-1 truncate">{f.name}</p>
                        </div>
                      ) : (
                        <a
                          href={f.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#429ead] hover:underline truncate block"
                        >
                          {f.name}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <form onSubmit={handleSaveFeedback} className="space-y-4 pt-4 border-t">
              <div>
                <Label htmlFor="feedback">Feedback</Label>
                <textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  className="mt-1 flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                  placeholder="Teacher feedback..."
                />
              </div>
              <div>
                <Label htmlFor="score">Score (0–100)</Label>
                <input
                  id="score"
                  type="number"
                  min={0}
                  max={100}
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="mt-1 flex h-10 w-24 rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                  placeholder="—"
                />
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button
                type="submit"
                disabled={pending}
                className="rounded-full"
                variant="primary"
              >
                {pending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Save feedback'
                )}
              </Button>
            </form>
          </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
