import { requirePermission } from '@/lib/auth/permissions';
import { getSchoolsForInviteSelector } from '@/lib/db/queries/schools';
import { listPlatformInvites } from '@/lib/db/queries/platform-invites';
import { InviteForm } from './InviteForm';
import { InvitationsList } from './InvitationsList';

export const dynamic = 'force-dynamic';

export default async function AdminInvitesPage() {
  const user = await requirePermission('invites:create');
  const isPlatformAdmin = user.platformRole === 'admin';

  const [schools, invitations] = await Promise.all([
    isPlatformAdmin
      ? getSchoolsForInviteSelector()
      : getSchoolsForInviteSelector(user.schoolId ?? undefined),
    listPlatformInvites(isPlatformAdmin ? null : (user.schoolId ?? null)),
  ]);

  const safeSchools = Array.isArray(schools) ? schools : [];
  const safeInvitations = Array.isArray(invitations) ? invitations : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Platform Invitations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Invite teachers or school admins via email. Invite links are single-use
          and expire in 7 days.
        </p>
      </div>

      <div>
        <h2 className="mb-4 text-base font-medium">Send new invite</h2>
        <InviteForm
          schools={safeSchools}
          canInviteSchoolAdmin={isPlatformAdmin || user.platformRole === 'school_admin'}
          inviterUserId={user.id}
        />
      </div>

      <div>
        <h2 className="mb-4 text-base font-medium">Recent invitations</h2>
        <InvitationsList invitations={safeInvitations} />
      </div>
    </div>
  );
}
