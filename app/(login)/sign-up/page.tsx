import { Suspense } from 'react';
import { Login } from '../login';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function SignUpPage() {
  return (
    <Suspense>
      <Login mode="signup" />
    </Suspense>
  );
}
