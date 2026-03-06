/**
 * Base URL configuration for building external links (emails, redirects, etc.).
 * Uses process.env.BASE_URL as the single source of truth.
 * No fallbacks to localhost, VERCEL_URL, or request host - ensures strict separation
 * between local and production environments.
 */
export function getBaseUrl(): string {
  const base = process.env.BASE_URL;
  if (!base || typeof base !== 'string' || !base.trim()) {
    throw new Error(
      'BASE_URL is not set. Set BASE_URL in your environment (e.g. .env). ' +
        'Local: http://localhost:3000, Production: https://www.geckoacademy.net'
    );
  }
  return base.replace(/\/$/, '');
}
