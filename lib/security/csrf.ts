import { headers } from 'next/headers';

function getBaseUrlHost(): string | null {
  try {
    if (!process.env.BASE_URL) return null;
    return new URL(process.env.BASE_URL).host;
  } catch {
    return null;
  }
}

export async function assertValidOrigin(options?: { allowMissingOrigin?: boolean }) {
  const h = await headers();
  const origin = h.get('origin');
  const referer = h.get('referer');
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const trustedHost = getBaseUrlHost() ?? host;

  const requestSource = origin ?? referer;
  if (!requestSource) {
    if (options?.allowMissingOrigin) return;
    throw new Error('CSRF check failed: missing origin/referer');
  }

  let sourceHost: string;
  try {
    sourceHost = new URL(requestSource).host;
  } catch {
    throw new Error('CSRF check failed: invalid origin/referer');
  }

  if (!trustedHost || sourceHost !== trustedHost) {
    throw new Error('CSRF check failed: origin mismatch');
  }
}
