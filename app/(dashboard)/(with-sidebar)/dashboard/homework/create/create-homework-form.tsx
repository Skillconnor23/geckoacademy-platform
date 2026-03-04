'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  createHomeworkAction,
  uploadHomeworkWorksheetAction,
} from '@/lib/actions/homework';
import { Loader2 } from 'lucide-react';

type CreateHomeworkFormProps = {
  classes: { id: string; name: string }[];
};

export function CreateHomeworkForm({ classes }: CreateHomeworkFormProps) {
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [classId, setClassId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      let url: string | null = null;
      if (file?.size) {
        const formData = new FormData();
        formData.set('file', file);
        const uploadResult = await uploadHomeworkWorksheetAction(null, formData);
        if (!uploadResult.success) {
          setError(uploadResult.error);
          setPending(false);
          return;
        }
        url = uploadResult.url;
      }

      const formData = new FormData();
      formData.set('classId', classId);
      formData.set('title', title.trim());
      if (instructions.trim()) formData.set('instructions', instructions.trim());
      if (dueDate) formData.set('dueDate', new Date(dueDate).toISOString());
      if (url) formData.set('attachmentUrl', url);

      const result = await createHomeworkAction(null, formData);
      if (!result.success) {
        setError(result.error);
        setPending(false);
        return;
      }
      // Action redirects on success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setPending(false);
    }
  }

  return (
    <Card className="rounded-2xl border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <CardHeader>
        <CardTitle>Homework details</CardTitle>
        <p className="text-sm text-muted-foreground">
          Create a new homework assignment for a class.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Week 3 Reading Response"
              required
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <textarea
              id="instructions"
              name="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Describe what students need to do..."
              rows={4}
              className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="classId">Assign to class</Label>
            <select
              id="classId"
              name="classId"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              required
              className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select a class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due date (optional)</Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-lg max-w-xs"
            />
          </div>
          <div className="space-y-2">
            <Label>Worksheet attachment (optional)</Label>
            <Input
              type="file"
              accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="rounded-lg max-w-md"
            />
            <p className="text-xs text-muted-foreground">
              PDF or images. Max 20 MB.
            </p>
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
              'Create homework'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
