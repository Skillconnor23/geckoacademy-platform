'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  updateCurriculumWeekAction,
  attachFilesToWeekAction,
  detachFileFromWeekAction,
  getCurriculumFileDownloadUrl,
  listCurriculumFilesForTeacherAction,
} from '@/lib/actions/curriculum';
import { ChevronDown, ChevronRight, Download, Link2, Trash2 } from 'lucide-react';
import type { CurriculumWeekWithAttachments } from '@/lib/db/queries/curriculum';

type Props = {
  classId: string;
  weeks: CurriculumWeekWithAttachments[];
  className: string;
};

export function PlannerContent({ classId, weeks, className }: Props) {
  const router = useRouter();
  const t = useTranslations('curriculum');
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    () => (weeks[0] ? { [weeks[0].id]: true } : {})
  );

  function toggleWeek(weekId: string) {
    setExpanded((p) => ({ ...p, [weekId]: !p[weekId] }));
  }

  async function handleDownload(fileId: string) {
    const result = await getCurriculumFileDownloadUrl(fileId);
    if (result.success) window.open(result.url, '_blank', 'noopener');
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium text-[#1f2937] tracking-tight sm:text-2xl">
          {t('plannerTitle')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{className}</p>
      </div>

      <div className="space-y-4">
        {weeks.map((week) => (
          <div
            key={week.id}
            className="rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          >
            <button
              type="button"
              onClick={() => toggleWeek(week.id)}
              className="flex w-full items-center justify-between px-4 py-4 text-left hover:bg-muted/30 sm:px-6"
            >
              <span className="font-medium text-[#1f2937]">
                {t('weekNumber', { number: week.weekNumber })}
              </span>
              {expanded[week.id] ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {expanded[week.id] && (
              <div className="space-y-4 border-t border-[#e5e7eb] px-4 pb-4 pt-4 sm:px-6">
                <form action={(fd) => void updateCurriculumWeekAction(fd)} className="space-y-4">
                  <input type="hidden" name="weekId" value={week.id} />
                  <div>
                    <Label htmlFor={`topic-${week.id}`}>{t('topic')}</Label>
                    <input
                      id={`topic-${week.id}`}
                      name="topic"
                      defaultValue={week.topic ?? ''}
                      className="mt-1 w-full rounded-lg border border-input px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`goals-${week.id}`}>{t('goals')}</Label>
                    <textarea
                      id={`goals-${week.id}`}
                      name="goals"
                      defaultValue={week.goals ?? ''}
                      rows={3}
                      className="mt-1 w-full rounded-lg border border-input px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`notes-${week.id}`}>{t('notes')}</Label>
                    <textarea
                      id={`notes-${week.id}`}
                      name="notes"
                      defaultValue={week.notes ?? ''}
                      rows={3}
                      className="mt-1 w-full rounded-lg border border-input px-3 py-2 text-sm"
                    />
                  </div>
                  <Button type="submit" size="sm">
                    {t('save')}
                  </Button>
                </form>

                <div>
                  <h4 className="mb-2 text-sm font-medium text-[#1f2937]">
                    {t('attachedMaterials')}
                  </h4>
                  {week.attachments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No materials attached.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {week.attachments.map((a) => (
                        <li
                          key={a.fileId}
                          className="flex items-center justify-between rounded-lg border border-[#e5e7eb] px-3 py-2"
                        >
                          <span className="truncate text-sm">
                            {a.title ?? a.originalFilename}
                          </span>
                          <div className="flex shrink-0 gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(a.fileId)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <form action={(fd) => void detachFileFromWeekAction(fd)}>
                              <input type="hidden" name="weekId" value={week.id} />
                              <input type="hidden" name="fileId" value={a.fileId} />
                              <Button type="submit" variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </form>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  <AttachMaterialButton
                    weekId={week.id}
                    classId={classId}
                    onAttached={() => router.refresh()}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AttachMaterialButton({
  weekId,
  classId,
  onAttached,
}: {
  weekId: string;
  classId: string;
  onAttached: () => void;
}) {
  const t = useTranslations('curriculum');
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<
    { id: string; originalFilename: string; title: string | null }[]
  >([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState(false);

  async function openModal() {
    setOpen(true);
    const result = await listCurriculumFilesForTeacherAction(classId);
    setFiles(result.files ?? []);
    setSelected(new Set());
  }

  async function handleAttach() {
    if (selected.size === 0) return;
    setPending(true);
    const formData = new FormData();
    formData.set('weekId', weekId);
    formData.set('fileIds', JSON.stringify([...selected]));
    await attachFilesToWeekAction(formData);
    setPending(false);
    setOpen(false);
    onAttached();
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={openModal}
      >
        <Link2 className="mr-2 h-4 w-4" />
        {t('attachMaterial')}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-medium">{t('attachMaterial')}</h3>
            {files.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t('noMaterialsYet')} Upload materials first.
              </p>
            ) : (
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {files.map((f) => (
                  <label
                    key={f.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 hover:bg-muted/50"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(f.id)}
                      onChange={(e) => {
                        setSelected((prev) => {
                          const next = new Set(prev);
                          if (e.target.checked) next.add(f.id);
                          else next.delete(f.id);
                          return next;
                        });
                      }}
                    />
                    <span className="truncate text-sm">
                      {f.title ?? f.originalFilename}
                    </span>
                  </label>
                ))}
              </div>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                {t('cancel')}
              </Button>
              <Button
                onClick={handleAttach}
                disabled={selected.size === 0 || pending}
              >
                {t('attachMaterial')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
