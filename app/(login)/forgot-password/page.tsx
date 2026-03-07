import { getTranslations } from 'next-intl/server';
import { ForgotPasswordForm } from './ForgotPasswordForm';

export const dynamic = 'force-dynamic';

export default async function ForgotPasswordPage() {
  const t = await getTranslations('auth.forgotPassword');
  const tNav = await getTranslations('nav');

  return (
    <ForgotPasswordForm
      t={{
        title: t('title'),
        subtitle: t('subtitle'),
        emailLabel: t('emailLabel'),
        emailPlaceholder: t('emailPlaceholder'),
        submit: t('submit'),
        sending: t('sending'),
        successMessage: t('successMessage'),
        backToSignIn: t('backToSignIn'),
      }}
      tNav={{ brand: tNav('brand') }}
    />
  );
}
