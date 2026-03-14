'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, Square, Play, RotateCcw, Save, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadAudioFileAction } from '@/lib/actions/upload-audio';
import { updateReadingAudioAction } from '@/lib/actions/learning/readings';
import { updateFlashcardCardAudioAction } from '@/lib/actions/learning/flashcards';

type Props =
  | {
      type: 'reading';
      readingId: string;
      currentUrl: string | null;
      label?: string;
    }
  | {
      type: 'flashcard';
      deckId: string;
      cardId: string;
      currentUrl: string | null;
      label?: string;
    }
  | {
      type: 'create';
      onRecordingReady: (blob: Blob | null) => void;
      /** Blob from a prior recording in this session (before form submit). */
      pendingBlob?: Blob | null;
      label?: string;
    };

type RecorderState = 'idle' | 'recording' | 'recorded' | 'saving' | 'saved' | 'error';

/** MIME types MediaRecorder typically supports, in order of preference. */
const RECORDER_MIME_ORDER = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/ogg',
];

function getSupportedMimeType(): string | null {
  if (typeof window === 'undefined' || !window.MediaRecorder?.isTypeSupported) return null;
  for (const mime of RECORDER_MIME_ORDER) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return null;
}

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function AudioRecorderField(props: Props) {
  const router = useRouter();
  const [state, setState] = useState<RecorderState>('idle');
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startRecording = async () => {
    setError(null);
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Microphone access is not available in this browser.');
      setState('error');
      return;
    }
    const mimeType = getSupportedMimeType();
    if (!mimeType) {
      setError('Audio recording is not supported in this browser. Try Chrome or Firefox.');
      setState('error');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stopTracks();
        if (chunksRef.current.length) {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          setRecordedBlob(blob);
          setState('recorded');
        } else {
          setState('idle');
          setError('Recording was empty. Please try again.');
        }
        stopTimer();
      };
      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setState('recording');
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    } catch (err) {
      stopTracks();
      setError(err instanceof Error ? err.message : 'Could not access microphone.');
      setState('error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    stopTimer();
  };

  const reRecord = () => {
    setRecordedBlob(null);
    setError(null);
    setState('idle');
    setRecordingSeconds(0);
  };

  const saveRecording = async () => {
    if (!recordedBlob) return;
    setError(null);

    if (props.type === 'create') {
      props.onRecordingReady(recordedBlob);
      setRecordedBlob(null);
      setState('idle');
      return;
    }

    setState('saving');

    const ext = recordedBlob.type.includes('ogg') ? '.ogg' : '.webm';
    const file = new File([recordedBlob], `recording${ext}`, { type: recordedBlob.type });
    const formData = new FormData();
    formData.set('file', file);

    const result = await uploadAudioFileAction(null, formData);

    if (!result.success) {
      setError(result.error);
      setState('recorded');
      return;
    }

    if (props.type === 'reading') {
      const res = await updateReadingAudioAction(props.readingId, result.url);
      if (res.error) {
        setError(res.error);
        setState('recorded');
        return;
      }
    } else {
      const res = await updateFlashcardCardAudioAction(props.deckId, props.cardId, result.url);
      if (res.error) {
        setError(res.error);
        setState('recorded');
        return;
      }
    }

    setRecordedBlob(null);
    setState('idle');
    router.refresh();
  };

  const removeRecording = async () => {
    if (props.type === 'create') {
      props.onRecordingReady(null);
      setRecordedBlob(null);
      setState('idle');
      setError(null);
      return;
    }
    setError(null);
    setIsRemoving(true);

    if (props.type === 'reading') {
      const res = await updateReadingAudioAction(props.readingId, null);
      if (res.error) {
        setError(res.error);
      } else {
        router.refresh();
      }
    } else {
      const res = await updateFlashcardCardAudioAction(props.deckId, props.cardId, null);
      if (res.error) {
        setError(res.error);
      } else {
        router.refresh();
      }
    }
    setIsRemoving(false);
  };

  const label = props.label ?? 'Voice recording';

  // Create mode with pending blob: show preview + remove
  if (props.type === 'create' && props.pendingBlob && state !== 'recorded') {
    const blobUrl = URL.createObjectURL(props.pendingBlob);
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#1f2937]">{label}</label>
        <div className="flex flex-wrap items-center gap-2">
          <audio src={blobUrl} controls className="h-9 max-w-[200px] rounded-lg" preload="metadata" />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => props.onRecordingReady(null)}
            className="rounded-full"
            aria-label="Remove recording"
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Remove recording
          </Button>
        </div>
      </div>
    );
  }

  // Already saved audio: show player + remove (reading/flashcard)
  if (props.type !== 'create' && props.currentUrl && state !== 'recorded' && state !== 'saving') {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#1f2937]">{label}</label>
        <div className="flex flex-wrap items-center gap-2">
          <audio
            src={props.currentUrl}
            controls
            className="h-9 max-w-[200px] rounded-lg"
            preload="metadata"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={removeRecording}
            disabled={isRemoving}
            className="rounded-full"
            aria-label="Remove recording"
          >
            {isRemoving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="mr-1 h-4 w-4" />
                Remove recording
              </>
            )}
          </Button>
        </div>
        {error && <p className="text-sm text-[#b64b29]">{error}</p>}
      </div>
    );
  }

  // Recording flow
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[#1f2937]">{label}</label>

      {state === 'idle' && (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={startRecording}
            className="rounded-full"
          >
            <Mic className="mr-1 h-4 w-4" />
            Start recording
          </Button>
        </div>
      )}

      {state === 'recording' && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#b64b29]/10 px-3 py-1.5 text-sm font-medium text-[#b64b29]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#b64b29]" />
            Recording {formatTimer(recordingSeconds)}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={stopRecording}
            className="rounded-full"
          >
            <Square className="mr-1 h-4 w-4" />
            Stop
          </Button>
        </div>
      )}

      {state === 'recorded' && recordedBlob && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <audio
              src={URL.createObjectURL(recordedBlob)}
              controls
              className="h-9 max-w-[200px] rounded-lg"
              preload="metadata"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={reRecord}
              className="rounded-full"
            >
              <RotateCcw className="mr-1 h-4 w-4" />
              Re-record
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={saveRecording}
              className="rounded-full bg-[#429ead] text-white hover:bg-[#36899a]"
            >
              <Save className="mr-1 h-4 w-4" />
              Save recording
            </Button>
          </div>
        </div>
      )}

      {state === 'saving' && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Saving…
        </div>
      )}

      {state === 'error' && (
        <p className="text-sm text-[#b64b29]">{error}</p>
      )}

      {error && state !== 'error' && <p className="text-sm text-[#b64b29]">{error}</p>}
    </div>
  );
}
