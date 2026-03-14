'use client';

import { useRef } from 'react';
import { Volume2 } from 'lucide-react';

type Props = {
  url: string;
  /** Compact: smaller button for flashcards. Default false for reading prompts. */
  compact?: boolean;
  className?: string;
  ariaLabel?: string;
};

export function AudioPlayButton({
  url,
  compact = false,
  className = '',
  ariaLabel = 'Play audio',
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  }

  const size = compact ? 'h-7 w-7' : 'h-9 w-9';

  return (
    <>
      <audio ref={audioRef} src={url} preload="metadata" />
      <button
        type="button"
        onClick={handleClick}
        aria-label={ariaLabel}
        className={`inline-flex items-center justify-center rounded-full bg-[#7daf41]/15 text-[#5a8a2e] hover:bg-[#7daf41]/25 transition-colors ${size} ${className}`}
      >
        <Volume2 className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} aria-hidden />
      </button>
    </>
  );
}
