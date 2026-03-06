'use client';

import { useState } from 'react';
import { BookOpen } from 'lucide-react';

type Props = {
  words: string[];
  title: string;
};

export function VocabularyCard({ words, title }: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (words.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[#7daf41]/25 bg-[#7daf41]/10 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7daf41]/20 text-[#5a8a2e]">
          <BookOpen className="h-4 w-4" aria-hidden />
        </div>
        <h2 className="text-base font-semibold text-[#1f2937]">{title}</h2>
      </div>
      <ul className="flex flex-wrap gap-2">
        {words.map((word, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => setExpandedId(expandedId === i ? null : i)}
              className="group inline-flex flex-col items-start rounded-xl border border-[#7daf41]/30 bg-white/80 px-3 py-2 text-sm font-medium text-[#1f2937] shadow-sm transition hover:border-[#7daf41]/50 hover:bg-white hover:shadow"
              aria-expanded={expandedId === i}
            >
              <span className="text-[#374151]">{word}</span>
              {expandedId === i && (
                <span className="mt-1.5 text-xs font-normal text-muted-foreground">
                  Key vocabulary word — look for it in the reading above.
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
