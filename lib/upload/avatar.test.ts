import { describe, it, expect } from 'vitest';
import {
  AVATAR_ALLOWED_MIME_TYPES,
  AVATAR_MAX_SIZE_BYTES,
  isAllowedAvatarMimeType,
  validateAvatarFile,
} from './avatar';

describe('avatar upload helpers', () => {
  describe('AVATAR_ALLOWED_MIME_TYPES', () => {
    it('includes png, jpeg, jpg, webp', () => {
      expect(AVATAR_ALLOWED_MIME_TYPES).toContain('image/png');
      expect(AVATAR_ALLOWED_MIME_TYPES).toContain('image/jpeg');
      expect(AVATAR_ALLOWED_MIME_TYPES).toContain('image/jpg');
      expect(AVATAR_ALLOWED_MIME_TYPES).toContain('image/webp');
      expect(AVATAR_ALLOWED_MIME_TYPES).toHaveLength(4);
    });
  });

  describe('AVATAR_MAX_SIZE_BYTES', () => {
    it('is 2MB', () => {
      expect(AVATAR_MAX_SIZE_BYTES).toBe(2 * 1024 * 1024);
    });
  });

  describe('isAllowedAvatarMimeType', () => {
    it('returns true for allowed types', () => {
      expect(isAllowedAvatarMimeType('image/png')).toBe(true);
      expect(isAllowedAvatarMimeType('image/jpeg')).toBe(true);
      expect(isAllowedAvatarMimeType('image/jpg')).toBe(true);
      expect(isAllowedAvatarMimeType('image/webp')).toBe(true);
    });

    it('returns false for disallowed types', () => {
      expect(isAllowedAvatarMimeType('image/gif')).toBe(false);
      expect(isAllowedAvatarMimeType('application/pdf')).toBe(false);
      expect(isAllowedAvatarMimeType('')).toBe(false);
    });
  });

  describe('validateAvatarFile', () => {
    it('returns ok for valid file', () => {
      const file = new File(['x'], 'avatar.png', { type: 'image/png' });
      Object.defineProperty(file, 'size', { value: 1024 });
      expect(validateAvatarFile(file)).toEqual({ ok: true });
    });

    it('rejects empty file', () => {
      const file = new File([], 'avatar.png', { type: 'image/png' });
      expect(validateAvatarFile(file)).toEqual({ ok: false, error: 'File is empty.' });
    });

    it('rejects file over 2MB', () => {
      const file = new File(['x'], 'avatar.png', { type: 'image/png' });
      Object.defineProperty(file, 'size', { value: AVATAR_MAX_SIZE_BYTES + 1 });
      expect(validateAvatarFile(file)).toEqual({ ok: false, error: 'File too large (max 2 MB).' });
    });

    it('rejects invalid mime type', () => {
      const file = new File(['x'], 'doc.pdf', { type: 'application/pdf' });
      Object.defineProperty(file, 'size', { value: 1024 });
      expect(validateAvatarFile(file)).toEqual({
        ok: false,
        error: 'Invalid file type. Allowed: PNG, JPG, JPEG, WEBP.',
      });
    });
  });
});
