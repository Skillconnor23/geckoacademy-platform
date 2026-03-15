'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addQuestionAction, addQuestionMcqAction } from '@/lib/actions/quizzes';
import type { QuizQuestionType } from '@/lib/db/schema';
import { ArrowLeft, GripVertical, Shuffle } from 'lucide-react';

type AddQuestionModalProps = {
  quizId: string;
  onClose: () => void;
};

const QUESTION_TYPES: { value: QuizQuestionType; label: string }[] = [
  { value: 'MCQ', label: 'Multiple choice' },
  { value: 'SPELLING', label: 'Spelling / typed answer' },
  { value: 'SENTENCE_BUILDER', label: 'Sentence builder (drag & drop)' },
  { value: 'TRUE_FALSE', label: 'True / False' },
];

export function AddQuestionModal({ quizId, onClose }: AddQuestionModalProps) {
  const router = useRouter();
  const t = useTranslations('quizzes.addQuestion');
  const [step, setStep] = useState<'type' | 'form'>('type');
  const [selectedType, setSelectedType] = useState<QuizQuestionType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  // Sentence builder: shuffle preview (client-only)
  const [sentenceBuilderShuffleKey, setSentenceBuilderShuffleKey] = useState(0);

  function handleSelectType(type: QuizQuestionType) {
    setSelectedType(type);
    setStep('form');
    setError(null);
  }

  function handleBack() {
    setStep('type');
    setSelectedType(null);
    setError(null);
  }

  async function handleSubmitMcq(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const result = await addQuestionMcqAction(quizId, formData);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
    onClose();
  }

  async function handleSubmitGeneric(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedType) return;
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set('type', selectedType);
    const result = await addQuestionAction(quizId, formData);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
    onClose();
  }

  if (step === 'type') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
          <h3 className="text-lg font-medium text-[#1f2937] mb-2">{t('title')}</h3>
          <p className="text-sm text-muted-foreground mb-4">{t('selectType')}</p>
          <div className="space-y-2">
            {QUESTION_TYPES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleSelectType(value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-left text-sm font-medium text-[#1f2937] hover:bg-gray-50 transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex justify-end pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-full">
              {t('cancel')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedType === 'MCQ') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> {t('back')}
          </button>
          <h3 className="text-lg font-medium text-[#1f2937] mb-4">{t('multipleChoice')}</h3>
          <form onSubmit={handleSubmitMcq} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-[#1f2937]">
                {t('promptLabel')} <span className="text-red-500">*</span>
              </Label>
              <textarea
                name="prompt"
                required
                rows={3}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                placeholder={t('promptPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#1f2937]">{t('optionsLabel')}</Label>
              {['A', 'B', 'C', 'D'].map((letter, i) => (
                <div key={letter} className="flex items-center gap-3">
                  <span className="w-6 text-sm font-medium text-muted-foreground">{letter}.</span>
                  <input
                    name={`option${letter}`}
                    className="flex-1 rounded-full border border-gray-200 px-3 py-2 text-sm"
                    placeholder={t('optionPlaceholder', { letter })}
                  />
                  <label className="flex items-center gap-1 text-sm whitespace-nowrap">
                    <input type="radio" name="correctIndex" value={i} required className="rounded-full" />
                    {t('correctLabel')}
                  </label>
                </div>
              ))}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="ghost" onClick={onClose} className="rounded-full">
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={pending}
                className="rounded-full bg-[#7daf41] text-white hover:bg-[#6c9b38]"
              >
                {pending ? t('saving') : t('saveQuestion')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (selectedType === 'SPELLING') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> {t('back')}
          </button>
          <h3 className="text-lg font-medium text-[#1f2937] mb-4">{t('spellingQuestion')}</h3>
          <form onSubmit={handleSubmitGeneric} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-[#1f2937]">
                {t('promptLabel')} <span className="text-red-500">*</span>
              </Label>
              <textarea
                name="prompt"
                required
                rows={2}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                placeholder={t('spellingPromptPlaceholder')}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-[#1f2937]">
                {t('correctAnswer')} <span className="text-red-500">*</span>
              </Label>
              <Input
                name="correctAnswer"
                required
                className="rounded-xl border-gray-200"
                placeholder="e.g. apartment"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-[#1f2937]">{t('acceptedAnswersOptional')}</Label>
              <Input
                name="acceptedAnswers"
                className="rounded-xl border-gray-200"
                placeholder="Comma-separated or JSON array"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-[#1f2937]">{t('hintOptional')}</Label>
              <Input name="hint" className="rounded-xl border-gray-200" placeholder={t('hintPlaceholder')} />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-[#1f2937]">{t('imageUrlOptional')}</Label>
              <Input name="imageUrl" type="url" className="rounded-xl border-gray-200" placeholder="https://..." />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-[#1f2937]">{t('audioUrlOptional')}</Label>
              <Input name="audioUrl" type="url" className="rounded-xl border-gray-200" placeholder="https://..." />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-[#1f2937]">{t('explanationOptional')}</Label>
              <textarea name="explanation" rows={2} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="ghost" onClick={onClose} className="rounded-full">
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={pending}
                className="rounded-full bg-[#7daf41] text-white hover:bg-[#6c9b38]"
              >
                {pending ? t('saving') : t('saveQuestion')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (selectedType === 'SENTENCE_BUILDER') {
    return (
      <SentenceBuilderForm
        quizId={quizId}
        onClose={onClose}
        onBack={handleBack}
        error={error}
        setError={setError}
        pending={pending}
        setPending={setPending}
        shuffleKey={sentenceBuilderShuffleKey}
        onShufflePreview={() => setSentenceBuilderShuffleKey((k) => k + 1)}
        t={t}
        router={router}
      />
    );
  }

  if (selectedType === 'TRUE_FALSE') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> {t('back')}
          </button>
          <h3 className="text-lg font-medium text-[#1f2937] mb-4">{t('trueFalseQuestion')}</h3>
          <form onSubmit={handleSubmitGeneric} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-[#1f2937]">
                {t('statement')} <span className="text-red-500">*</span>
              </Label>
              <textarea
                name="prompt"
                required
                rows={3}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                placeholder={t('trueFalseStatementPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#1f2937]">{t('correctAnswer')}</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="correctAnswer" value="true" required className="rounded-full" />
                  <span className="text-sm">True</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="correctAnswer" value="false" className="rounded-full" />
                  <span className="text-sm">False</span>
                </label>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-[#1f2937]">{t('explanationOptional')}</Label>
              <textarea name="explanation" rows={2} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="ghost" onClick={onClose} className="rounded-full">
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={pending}
                className="rounded-full bg-[#7daf41] text-white hover:bg-[#6c9b38]"
              >
                {pending ? t('saving') : t('saveQuestion')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return null;
}

function SentenceBuilderForm({
  quizId,
  onClose,
  onBack,
  error,
  setError,
  pending,
  setPending,
  shuffleKey,
  onShufflePreview,
  t,
  router,
}: {
  quizId: string;
  onClose: () => void;
  onBack: () => void;
  error: string | null;
  setError: (e: string | null) => void;
  pending: boolean;
  setPending: (p: boolean) => void;
  shuffleKey: number;
  onShufflePreview: () => void;
  t: (key: string) => string;
  router: { refresh: () => void };
}) {
  const [correctSentence, setCorrectSentence] = useState('');
  const [tokensManual, setTokensManual] = useState('');
  const [useManualTokens, setUseManualTokens] = useState(false);
  const [distractorTokens, setDistractorTokens] = useState('');
  const [alternativeSentence, setAlternativeSentence] = useState('');

  const autoTokens = correctSentence.trim() ? correctSentence.trim().split(/\s+/) : [];
  const displayTokens = useManualTokens && tokensManual.trim()
    ? tokensManual.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean)
    : autoTokens;
  const shuffledPreview = [...displayTokens].sort(() => Math.random() - 0.5);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set('type', 'SENTENCE_BUILDER');
    formData.set('correctAnswer', correctSentence.trim());
    const tokensToUse = useManualTokens && tokensManual.trim()
      ? tokensManual.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean)
      : autoTokens;
    formData.set('tokensJson', JSON.stringify(tokensToUse));
    const distractors = distractorTokens.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
    if (distractors.length) formData.set('distractorTokensJson', JSON.stringify(distractors));
    if (alternativeSentence.trim()) formData.set('alternativeCorrectSentence', alternativeSentence.trim());
    const result = await addQuestionAction(quizId, formData);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> {t('back')}
        </button>
        <h3 className="text-lg font-medium text-[#1f2937] mb-4">{t('sentenceBuilderQuestion')}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label className="text-sm font-medium text-[#1f2937]">
              {t('promptLabel')} <span className="text-red-500">*</span>
            </Label>
            <textarea
              name="prompt"
              required
              rows={2}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              placeholder={t('sentenceBuilderPromptPlaceholder')}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm font-medium text-[#1f2937]">
              {t('correctSentence')} <span className="text-red-500">*</span>
            </Label>
            <Input
              value={correctSentence}
              onChange={(e) => setCorrectSentence(e.target.value)}
              className="rounded-xl border-gray-200"
              placeholder="e.g. I live in an apartment."
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="useManualTokens"
              checked={useManualTokens}
              onChange={(e) => setUseManualTokens(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="useManualTokens" className="text-sm font-medium text-[#1f2937]">
              {t('manualTokens')}
            </Label>
          </div>
          {useManualTokens && (
            <div className="space-y-1">
              <Label className="text-sm font-medium text-[#1f2937]">{t('tokensCommaOrSpace')}</Label>
              <Input
                value={tokensManual}
                onChange={(e) => setTokensManual(e.target.value)}
                className="rounded-xl border-gray-200"
                placeholder="word1, word2, word3"
              />
            </div>
          )}
          {displayTokens.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-[#1f2937]">{t('previewShuffled')}</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onShufflePreview}
                  className="text-xs gap-1"
                >
                  <Shuffle className="h-3 w-3" /> {t('shufflePreview')}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 rounded-xl border border-gray-200 p-3 bg-muted/30">
                {shuffledPreview.map((token, i) => (
                  <span
                    key={`${shuffleKey}-${i}-${token}`}
                    className="inline-flex items-center gap-1 rounded-full bg-white border border-gray-200 px-2.5 py-1 text-sm"
                  >
                    <GripVertical className="h-3 w-3 text-muted-foreground" /> {token}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-1">
            <Label className="text-sm font-medium text-[#1f2937]">{t('distractorTokensOptional')}</Label>
            <Input
              value={distractorTokens}
              onChange={(e) => setDistractorTokens(e.target.value)}
              className="rounded-xl border-gray-200"
              placeholder="extra, words"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm font-medium text-[#1f2937]">{t('alternativeCorrectOptional')}</Label>
            <Input
              value={alternativeSentence}
              onChange={(e) => setAlternativeSentence(e.target.value)}
              className="rounded-xl border-gray-200"
              placeholder="Alternative correct sentence"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm font-medium text-[#1f2937]">{t('explanationOptional')}</Label>
            <textarea name="explanation" rows={2} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-full">
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={pending || !correctSentence.trim()}
              className="rounded-full bg-[#7daf41] text-white hover:bg-[#6c9b38]"
            >
              {pending ? t('saving') : t('saveQuestion')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
