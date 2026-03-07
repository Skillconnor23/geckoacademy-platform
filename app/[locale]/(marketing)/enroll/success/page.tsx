import { auth } from '@/auth';
import { getTranslations, getLocale } from 'next-intl/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Section } from '@/components/landing/Section';
import { stripe } from '@/lib/payments/stripe';
import { getClassById, GEKO_LEVEL_META } from '@/lib/enrollment/gecko-classes';
import { enrollStudent } from '@/lib/db/queries/education';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { CheckCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EnrollSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const t = await getTranslations('enroll.success');
  const locale = await getLocale();
  const session = await auth();
  const params = await searchParams;
  const sessionId = params.session_id;

  if (!sessionId) {
    redirect(`/${locale}/enroll`);
  }

  let success = false;
  let className = '';
  let error: string | null = null;

  try {
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (stripeSession.payment_status !== 'paid') {
      error = t('notPaid');
    } else {
      const classOptionId = stripeSession.metadata?.classOptionId;
      const userIdFromSession = stripeSession.client_reference_id;

      if (!classOptionId || !userIdFromSession) {
        error = t('invalidSession');
      } else {
        const classOption = getClassById(classOptionId);
        if (!classOption) {
          error = t('classNotFound');
        } else {
          const meta = GEKO_LEVEL_META[classOption.level];
          const levelLabel = meta ? (locale === 'mn' ? meta.nameMn : meta.nameEn) : classOption.level;
          className =
            classOption.level + ' Level — ' + levelLabel + ' · ' +
            classOption.time +
            ' (' +
            classOption.days.join(', ') +
            ')';

          // Create enrollment if we have eduClassId and user
          const userId = Number(userIdFromSession);
          if (classOption.eduClassId && userId) {
            const [user] = await db
              .select()
              .from(users)
              .where(eq(users.id, userId))
              .limit(1);

            if (user) {
              try {
                await enrollStudent({
                  classId: classOption.eduClassId,
                  studentUserId: userId,
                });
                success = true;
              } catch (enrollErr) {
                // Enrollment may already exist (idempotent)
                const msg =
                  enrollErr instanceof Error ? enrollErr.message : 'enroll_error';
                if (msg.includes('unique') || msg.includes('duplicate')) {
                  success = true;
                } else {
                  error = t('enrollmentFailed');
                }
              }
            } else {
              success = true; // Payment succeeded, user not found in DB - show success anyway
            }
          } else {
            // No eduClassId configured - payment succeeded, show success
            success = true;
          }
        }
      }
    }
  } catch (err) {
    console.error('Enroll success error:', err);
    error = t('genericError');
  }

  const dashboardHref = `/${locale}/dashboard`;
  const enrollHref = `/${locale}/enroll`;

  return (
    <div className="min-h-screen bg-white">
      <Section className="pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="mx-auto max-w-xl text-center">
          {error ? (
            <>
              <h1 className="text-2xl font-bold text-[#b64b29] sm:text-3xl">
                {t('errorTitle')}
              </h1>
              <p className="mt-4 text-[#5a5f57]">{error}</p>
              <Button asChild size="lg" className="mt-8 bg-[#7daf41] text-white hover:bg-[#6b9a39]">
                <Link href={enrollHref}>{t('backToEnroll')}</Link>
              </Button>
            </>
          ) : (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#7daf41]/20">
                <CheckCircle className="h-10 w-10 text-[#7daf41]" />
              </div>
              <h1 className="mt-6 text-2xl font-bold text-[#3d4236] sm:text-3xl">
                {t('title')}
              </h1>
              <p className="mt-4 text-lg text-[#5a5f57]">{t('subtitle')}</p>
              {className && (
                <p className="mt-6 rounded-xl border border-slate-200 bg-[#f5f6f4] px-4 py-3 font-medium text-[#3d4236]">
                  {className}
                </p>
              )}
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6">
                <Button
                  asChild
                  size="lg"
                  className="bg-[#7daf41] text-white hover:bg-[#6b9a39]"
                >
                  <Link href={dashboardHref}>{t('goToDashboard')}</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-[#429ead] text-[#429ead] hover:bg-[#429ead]/5">
                  <Link href={enrollHref}>{t('enrollAnother')}</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </Section>
    </div>
  );
}
