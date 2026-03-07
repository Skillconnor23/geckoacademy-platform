import { Resend } from 'resend';
import { getBaseUrl } from '@/lib/config/url';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.EMAIL_FROM ?? 'noreply@example.com';

export async function sendVerificationEmail(email: string, token: string) {
  const baseUrl = getBaseUrl();
  const verifyUrl = `${baseUrl}/verify-email?token=${encodeURIComponent(token)}`;

  if (!resend) {
    console.log('[DEV] Verification email would be sent to:', email);
    console.log('[DEV] Verify URL:', verifyUrl);
    return { ok: true };
  }

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Verify your email address',
    html: `
      <p>Thanks for signing up. Please verify your email by clicking the link below:</p>
      <p><a href="${verifyUrl}">Verify email</a></p>
      <p>This link expires in 24 hours.</p>
    `,
  });

  if (error) {
    console.error('Failed to send verification email:', error);
    return { ok: false, error };
  }
  return { ok: true };
}

export async function sendPlatformInviteEmail(
  email: string,
  role: string,
  schoolName: string | null,
  token: string
) {
  const baseUrl = getBaseUrl();
  const inviteUrl = `${baseUrl}/accept-invite?token=${encodeURIComponent(token)}`;

  if (!resend) {
    console.log('[DEV] Invite email would be sent to:', email);
    console.log('[DEV] Invite URL:', inviteUrl);
    return { ok: true };
  }

  const roleLabel = role === 'school_admin' ? 'School Admin' : 'Teacher';
  const context = schoolName ? ` at ${schoolName}` : '';

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `You've been invited as ${roleLabel}${context}`,
    html: `
      <p>You've been invited to join as a ${roleLabel}${schoolName ? ` at ${schoolName}` : ''}.</p>
      <p><a href="${inviteUrl}">Accept invitation</a></p>
      <p>This link expires in 7 days and can only be used once.</p>
    `,
  });

  if (error) {
    console.error('Failed to send invite email:', error);
    return { ok: false, error };
  }
  return { ok: true };
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const baseUrl = getBaseUrl();
  const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

  if (!resend) {
    console.log('[DEV] Password reset email would be sent to:', email);
    console.log('[DEV] Reset URL:', resetUrl);
    return { ok: true };
  }

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Reset your password',
    html: `
      <p>You requested a password reset. Click the link below to set a new password:</p>
      <p><a href="${resetUrl}">Reset password</a></p>
      <p>This link expires in 60 minutes and can only be used once.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });

  if (error) {
    console.error('Failed to send password reset email:', error);
    return { ok: false, error };
  }
  return { ok: true };
}
