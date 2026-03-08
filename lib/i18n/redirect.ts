/**
 * Locale-aware redirect helpers.
 * Use these so redirects go to /{locale}/path instead of /path, avoiding extra middleware hops.
 */
import { redirect } from 'next/navigation';
import { withLocalePrefix } from './paths';

/**
 * Redirect to a path with the current request's locale prefix.
 * Use in server components and server actions.
 */
export async function redirectWithLocale(path: string): Promise<never> {
  const target = await withLocalePrefix(path);
  redirect(target);
}

/**
 * Build a locale-prefixed path. Use when you need the path for redirectTo, Link href, etc.
 */
export async function getLocalePath(path: string): Promise<string> {
  return withLocalePrefix(path);
}
