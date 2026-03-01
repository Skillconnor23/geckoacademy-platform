/**
 * Generates a random join code: 6–8 chars, A-Z + 2–9, excluding confusing chars (O, 0, I, 1, L).
 */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const MIN_LENGTH = 6;
const MAX_LENGTH = 8;

export function generateJoinCode(): string {
  const length =
    MIN_LENGTH + Math.floor(Math.random() * (MAX_LENGTH - MIN_LENGTH + 1));
  let code = '';
  for (let i = 0; i < length; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}
