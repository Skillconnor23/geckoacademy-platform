import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';

/**
 * School admin classes are shown on the My School page.
 * Redirect so old links and bookmarks land in the right place.
 */
export default async function SchoolAdminClassesRedirect() {
  const locale = await getLocale();
  redirect(`/${locale}/dashboard/school-admin/school`);
}
