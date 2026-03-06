'use client';

import { Button } from '@/components/ui/button';

type Props = {
  title: string;
  description: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  error?: string | null;
};

export function ArchiveConfirmModal({
  title,
  description,
  onClose,
  onConfirm,
  loading = false,
  error = null,
}: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="archive-modal-title"
    >
      <div
        className="relative z-10 w-full max-w-md rounded-lg border bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="archive-modal-title" className="text-lg font-semibold mb-2">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          {description}
        </p>
        {error && (
          <p className="text-sm text-destructive mb-4">{error}</p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Archiving...' : 'Yes, archive'}
          </Button>
        </div>
      </div>
    </div>
  );
}
