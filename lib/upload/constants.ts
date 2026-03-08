/**
 * Centralized upload limits and allowed types.
 */

/** Max size for generic upload API (images + PDF). */
export const UPLOAD_API_MAX_BYTES = 10 * 1024 * 1024; // 10 MB

/** Max size for curriculum material uploads. */
export const CURRICULUM_UPLOAD_MAX_BYTES = 25 * 1024 * 1024; // 25 MB

/** Generic upload API: images and PDF only. */
export const UPLOAD_API_ALLOWED = [
  { mime: 'application/pdf', extensions: ['.pdf'] },
  { mime: 'image/png', extensions: ['.png'] },
  { mime: 'image/jpeg', extensions: ['.jpg', '.jpeg'] },
] as const;

/** Curriculum uploads: docs, images, audio. */
export const CURRICULUM_UPLOAD_ALLOWED = [
  { mime: 'application/pdf', extensions: ['.pdf'] },
  { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', extensions: ['.docx'] },
  { mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', extensions: ['.pptx'] },
  { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', extensions: ['.xlsx'] },
  { mime: 'image/png', extensions: ['.png'] },
  { mime: 'image/jpeg', extensions: ['.jpg', '.jpeg'] },
  { mime: 'audio/mpeg', extensions: ['.mp3'] },
  { mime: 'audio/mp3', extensions: ['.mp3'] },
  { mime: 'audio/m4a', extensions: ['.m4a'] },
  { mime: 'audio/x-m4a', extensions: ['.m4a'] },
] as const;
