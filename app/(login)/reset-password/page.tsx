import { getTranslations } from 'next-intl/server';
import { ResetPasswordForm } from './ResetPasswordForm';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: Props) {
  const t = await getTranslations('auth.resetPassword');
  const tNav = await getTranslations('nav');
  const params = await searchParams;
  const token = params.token ?? '';

  return (
    <ResetPasswordForm
      token={token}
      t={{
        title: t('title'),
        subtitle: t('subtitle'),
        newPasswordLabel: t('newPasswordLabel'),
        confirmPasswordLabel: t('confirmPasswordLabel'),
        passwordPlaceholder: t('passwordPlaceholder'),
        confirmPasswordPlaceholder: t('confirmPasswordPlaceholder'),
        submit: t('submit'),
        resetting: t('resetting'),
        successTitle: t('successTitle'),
        successDesc: t('successDesc'),
        signIn: t('signIn'),
        invalidToken: t('invalidToken'),
        invalidTokenTitle: t('invalidTokenTitle'),
        missingToken: t('missingToken'),
        requestNewLink: t('requestNewLink'),
        passwordMismatch: t('passwordMismatch'),
      }}
      tNav={{ brand: tNav('brand') }}
    />
  );
}
