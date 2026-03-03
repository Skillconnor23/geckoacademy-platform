'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { signIn, signUp } from './actions';
import { ActionState } from '@/lib/auth/middleware';

export function Login({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const priceId = searchParams.get('priceId');
  const inviteId = searchParams.get('inviteId');
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === 'signin' ? signIn : signUp,
    { error: '' }
  );

  const title =
    mode === 'signin' ? 'Welcome back' : 'Create your account';

  const subtitle =
    mode === 'signin'
      ? 'Sign in to continue learning with Gecko Academy.'
      : 'Set up your Gecko Academy account in a few steps.';

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-8">
        {/* Brand lockup */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#e5e7eb] bg-white">
              <Image
                src="/gecko-logo.svg"
                alt="Gecko Academy"
                width={120}
                height={120}
                sizes="40px"
                className="h-10 w-10 object-contain"
                unoptimized
              />
            </div>
            <span className="text-base font-semibold text-[#1f2937]">
              Gecko Academy
            </span>
          </div>
          <h1 className="mt-5 text-xl sm:text-2xl font-semibold tracking-tight text-[#111827]">
            {title}
          </h1>
          <p className="mt-2 text-sm text-[#6b7280]">
            {subtitle}
          </p>
          <div className="mt-3 inline-flex items-center rounded-full bg-[#ffaa00]/15 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-[#92400e]">
            Safe, calm learning
          </div>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-5" action={formAction}>
          <input type="hidden" name="redirect" value={redirect || ''} />
          <input type="hidden" name="priceId" value={priceId || ''} />
          <input type="hidden" name="inviteId" value={inviteId || ''} />

          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="block text-sm font-medium text-[#374151]"
            >
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={state.email}
              required
              maxLength={50}
              className="w-full rounded-full border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#111827] placeholder:text-gray-400 shadow-[0_1px_2px_rgba(15,23,42,0.04)] focus-visible:border-[#7daf41] focus-visible:ring-2 focus-visible:ring-[#7daf41] focus-visible:ring-offset-0"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="password"
              className="block text-sm font-medium text-[#374151]"
            >
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={
                mode === 'signin' ? 'current-password' : 'new-password'
              }
              defaultValue={state.password}
              required
              minLength={8}
              maxLength={100}
              className="w-full rounded-full border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#111827] placeholder:text-gray-400 shadow-[0_1px_2px_rgba(15,23,42,0.04)] focus-visible:border-[#7daf41] focus-visible:ring-2 focus-visible:ring-[#7daf41] focus-visible:ring-offset-0"
              placeholder="••••••••"
            />
          </div>

          {state?.error && (
            <p className="text-sm font-medium text-[#b64b29]">
              {state.error}
            </p>
          )}

          <div className="space-y-3">
            <Button
              type="submit"
              disabled={pending}
              className="inline-flex w-full items-center justify-center rounded-full border-2 border-transparent bg-[#7daf41] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:border-[#7daf41] hover:bg-[#6b9a39] hover:shadow-md disabled:opacity-60 disabled:shadow-none"
            >
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : mode === 'signin' ? (
                'Sign in'
              ) : (
                'Sign up'
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {mode === 'signin' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <Link
                    href={`/sign-up${redirect ? `?redirect=${redirect}` : ''}${priceId ? `&priceId=${priceId}` : ''}`}
                    className="font-medium text-[#429ead] hover:underline"
                  >
                    Sign up here
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <Link
                    href={`/sign-in${redirect ? `?redirect=${redirect}` : ''}${priceId ? `&priceId=${priceId}` : ''}`}
                    className="font-medium text-[#429ead] hover:underline"
                  >
                    Sign in here
                  </Link>
                </>
              )}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
