'use client';

import { useActionState } from 'react';
import {
  toggleJoinCodeAction,
  regenerateJoinCodeAction,
} from '@/lib/actions/education';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, RefreshCw, ShieldOff, Shield } from 'lucide-react';
import { useState } from 'react';

type ActionState = { error?: string };

type JoinCodeCardProps = {
  classId: string;
  joinCode: string | null;
  joinCodeEnabled: boolean;
};

export function JoinCodeCard({
  classId,
  joinCode,
  joinCodeEnabled,
}: JoinCodeCardProps) {
  const [copied, setCopied] = useState(false);
  const [toggleState, toggleAction, isTogglePending] = useActionState<
    ActionState,
    FormData
  >(toggleJoinCodeAction, {});
  const [regenState, regenAction, isRegenPending] = useActionState<
    ActionState,
    FormData
  >(regenerateJoinCodeAction, {});

  const handleCopy = () => {
    if (!joinCode) return;
    navigator.clipboard.writeText(joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Join code</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {joinCode ? (
          <>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-gray-100 px-3 py-2 font-mono text-lg tracking-wider">
                {joinCode}
              </code>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
              >
                {copied ? 'Copied!' : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Status:{' '}
              <span
                className={joinCodeEnabled ? 'text-green-600' : 'text-amber-600'}
              >
                {joinCodeEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              <form action={toggleAction}>
                <input type="hidden" name="classId" value={classId} />
                <input
                  type="hidden"
                  name="enabled"
                  value={joinCodeEnabled ? 'false' : 'true'}
                />
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  disabled={isTogglePending}
                >
                  {joinCodeEnabled ? (
                    <>
                      <ShieldOff className="mr-1 h-4 w-4" />
                      Disable join code
                    </>
                  ) : (
                    <>
                      <Shield className="mr-1 h-4 w-4" />
                      Enable join code
                    </>
                  )}
                </Button>
              </form>
              <form action={regenAction}>
                <input type="hidden" name="classId" value={classId} />
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  disabled={isRegenPending}
                >
                  <RefreshCw
                    className={`mr-1 h-4 w-4 ${isRegenPending ? 'animate-spin' : ''}`}
                  />
                  Regenerate code
                </Button>
              </form>
            </div>
            {(toggleState?.error || regenState?.error) && (
              <p className="text-sm text-red-500">
                {toggleState?.error ?? regenState?.error}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            No join code set. Regenerate or create the class again to get a code.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
