'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addFlashcardCardAction } from '@/lib/actions/learning/flashcards';
import { uploadAudioFileAction } from '@/lib/actions/upload-audio';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { AudioRecorderField } from '@/components/learning/AudioRecorderField';

type Props = {
  deckId: string;
  path: string;
  t: {
    frontLabel: string;
    backLabel: string;
    frontPlaceholder: string;
    backPlaceholder: string;
    exampleLabel: string;
    examplePlaceholder: string;
    addCardButton: string;
  };
};

export function AddFlashcardCardForm({ deckId, path, t }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    if (recordingBlob) {
      const ext = recordingBlob.type.includes('ogg') ? '.ogg' : '.webm';
      const file = new File([recordingBlob], `recording${ext}`, { type: recordingBlob.type });
      const uploadForm = new FormData();
      uploadForm.set('file', file);
      const uploadResult = await uploadAudioFileAction(null, uploadForm);
      if (!uploadResult.success) {
        setError(uploadResult.error);
        setPending(false);
        return;
      }
      formData.set('audioUrl', uploadResult.url);
    }

    const result = await addFlashcardCardAction(deckId, formData);
    if (result.error) {
      setError(result.error);
      setPending(false);
      return;
    }

    form.reset();
    setRecordingBlob(null);
    router.refresh();
    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-[#1f2937]">
            {t.frontLabel} <span className="text-[#b64b29]">*</span>
          </label>
          <input
            name="front"
            required
            className="mt-1 w-full rounded-xl border border-[#e5e7eb] px-3 py-2 text-sm"
            placeholder={t.frontPlaceholder}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[#1f2937]">
            {t.backLabel} <span className="text-[#b64b29]">*</span>
          </label>
          <input
            name="back"
            required
            className="mt-1 w-full rounded-xl border border-[#e5e7eb] px-3 py-2 text-sm"
            placeholder={t.backPlaceholder}
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-[#1f2937]">{t.exampleLabel}</label>
        <textarea
          name="example"
          rows={2}
          className="mt-1 w-full rounded-xl border border-[#e5e7eb] px-3 py-2 text-sm"
          placeholder={t.examplePlaceholder}
        />
      </div>
      <div>
        <AudioRecorderField
          type="create"
          onRecordingReady={setRecordingBlob}
          pendingBlob={recordingBlob}
          label="English word audio (optional)"
        />
      </div>
      {error && <p className="text-sm text-[#b64b29]">{error}</p>}
      <Button
        type="submit"
        disabled={pending}
        className="rounded-full bg-[#7daf41] text-white hover:bg-[#6b9a39]"
      >
        {pending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        {t.addCardButton}
      </Button>
    </form>
  );
}
