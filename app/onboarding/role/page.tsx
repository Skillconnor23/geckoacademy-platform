import { setPlatformRole } from '../actions';
import { RoleSelectionForm } from './role-selection-form';

export default function RoleOnboardingPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
          Choose your role
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Select how you&apos;ll use the platform. You can&apos;t change this later
          without contacting support.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <RoleSelectionForm action={setPlatformRole} />
      </div>
    </div>
  );
}
