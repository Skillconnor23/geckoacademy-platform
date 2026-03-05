import { randomBytes } from 'node:crypto';

/**
 * Generates a cryptographically random invite token with ~132 bits of entropy.
 * Base64url chars only, URL-safe and unguessable.
 */
const TOKEN_BYTES = 17; // 136 bits raw entropy

export function generateInviteToken(): string {
  return randomBytes(TOKEN_BYTES).toString('base64url');
}
