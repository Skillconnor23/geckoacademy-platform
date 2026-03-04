import { Suspense } from 'react';
import { Login } from '../login';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function SignInPage() {
  return (
    <Suspense>
      <Login mode="signin" />
    </Suspense>
  );
}
