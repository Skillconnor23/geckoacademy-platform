export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/queries';
import { ProfileCard } from './profile-card';

function formatRole(role: string | null): string {
  if (!role) return 'User';
  if (role === 'school_admin') return 'School Admin';
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export default async function ProfilePage() {
  const user = await getUser();
  if (!user) redirect('/sign-in');

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-lg font-medium lg:text-2xl">Profile</h1>
        <ProfileCard
          user={{
            id: user.id,
            name: user.name,
            email: user.email,
          }}
          roleLabel={formatRole(user.platformRole)}
        />
      </div>
    </section>
  );
}
