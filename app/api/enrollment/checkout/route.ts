import { auth } from '@/auth';
import { getBaseUrl } from '@/lib/config/url';
import { getClassById } from '@/lib/enrollment/gecko-classes';
import { createClassEnrollmentCheckoutSession } from '@/lib/payments/stripe';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/enrollment/checkout
 * Creates a Stripe Checkout session for Gecko Academy class enrollment.
 * Requires classOptionId. If user is logged in, ties checkout to their account.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { classOptionId } = body;

    if (!classOptionId || typeof classOptionId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid classOptionId' },
        { status: 400 }
      );
    }

    const classOption = getClassById(classOptionId);
    if (!classOption) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    if (!classOption.stripePriceId) {
      return NextResponse.json(
        { error: 'Stripe price not configured for this class' },
        { status: 400 }
      );
    }

    const session = await auth();
    const userId = session?.user?.id ? Number(session.user.id) : null;
    const userEmail = session?.user?.email ?? null;

    const locale = request.headers.get('x-locale') ?? 'en';
    const baseUrl = getBaseUrl();
    const successUrl = `${baseUrl}/${locale}/enroll/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/${locale}/enroll`;

    const checkoutSession = await createClassEnrollmentCheckoutSession({
      classOptionId,
      stripePriceId: classOption.stripePriceId,
      userId,
      userEmail,
      successUrl,
      cancelUrl,
    });

    if (!checkoutSession.url) {
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Enrollment checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout' },
      { status: 500 }
    );
  }
}
