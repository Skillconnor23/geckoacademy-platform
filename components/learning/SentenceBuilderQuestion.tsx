'use client';

import { useState, useMemo } from 'react';
import { GripVertical } from 'lucide-react';

type Props = {
  questionId: string;
  /** Tokens to show (e.g. shuffled correct + distractors). */
  tokens: string[];
  /** Hidden input name for form submit. */
  name: string;
  /** Optional hint. */
  hint?: string | null;
};

export function SentenceBuilderQuestion({ questionId, tokens, name, hint }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const remaining = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of tokens) counts.set(t, (counts.get(t) ?? 0) + 1);
    for (const t of selected) counts.set(t, (counts.get(t) ?? 0) - 1);
    const out: string[] = [];
    counts.forEach((n, t) => {
      for (let i = 0; i < n; i++) out.push(t);
    });
    return out;
  }, [tokens, selected]);

  function addToken(token: string) {
    setSelected((prev) => [...prev, token]);
  }

  function removeAt(index: number) {
    setSelected((prev) => prev.filter((_, i) => i !== index));
  }

  const valueJson = JSON.stringify(selected);

  return (
    <div className="space-y-3" data-sentence-builder-question={questionId}>
      <input type="hidden" name={name} value={valueJson} />
      <p className="text-xs text-muted-foreground">Tap words to build the sentence in order. Tap a word in your sentence to remove it.</p>
      {hint && <p className="text-sm text-muted-foreground italic">{hint}</p>}
      {/* Built sentence */}
      <div className="min-h-[44px] rounded-xl border border-dashed border-gray-300 bg-muted/30 p-3 flex flex-wrap items-center gap-2">
        {selected.length === 0 && (
          <span className="text-sm text-muted-foreground">Your sentence will appear here</span>
        )}
        {selected.map((token, i) => (
          <button
            key={`${i}-${token}`}
            type="button"
            onClick={() => removeAt(i)}
            className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-[#1f2937] hover:bg-gray-50"
          >
            <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
            {token}
          </button>
        ))}
      </div>
      {/* Word bank */}
      <div className="flex flex-wrap gap-2">
        {remaining.map((token, i) => (
          <button
            key={`${token}-${i}`}
            type="button"
            onClick={() => addToken(token)}
            className="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm text-[#1f2937] hover:bg-[#7daf41]/10 hover:border-[#7daf41]/50 transition-colors"
          >
            {token}
          </button>
        ))}
      </div>
    </div>
  );
}
