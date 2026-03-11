import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';

/** Trial funnel entry — redirect to first question. */
export default async function TrialPage() {
  const locale = await getLocale();
  redirect(`/${locale}/trial/start`);
}
