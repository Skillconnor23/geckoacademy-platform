import { randomBytes } from 'node:crypto';

/**
 * Generates a cryptographically random join code.
 * 16 chars from unambiguous alphabet (~80 bits entropy).
 */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 16;

export function generateJoinCode(): string {
  const bytes = randomBytes(CODE_LENGTH);
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return code;
}
