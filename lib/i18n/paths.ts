/**
 * Shared helpers for locale-prefixed paths.
 * Canonical routes always use locale prefix: /{locale}/path (e.g. /en/dashboard).
 */

import { getLocale } from 'next-intl/server';
import { defaultLocale } from './config';

/**
 * Build a locale-prefixed path. Use for Link href, redirect targets, etc.
 * Use in Server Components; for client components use useLocale() + withLocalePrefix.
 */
export async function withLocalePrefix(path: string): Promise<string> {
  const locale = (await getLocale()) || defaultLocale;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${normalized}`;
}

/**
 * Synchronous version: pass locale explicitly. Use in client components with useLocale().
 */
export function withLocalePrefixSync(path: string, locale: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${normalized}`;
}
