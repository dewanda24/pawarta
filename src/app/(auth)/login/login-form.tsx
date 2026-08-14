'use client';

import { useActionState } from 'react';
import { authenticate } from '@/features/iam/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-4 w-full max-w-sm">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          type="text"
          required
          placeholder="Masukkan username"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          placeholder="Masukkan password"
        />
      </div>
      <div
        className="flex h-8 items-end space-x-1"
        aria-live="polite"
        aria-atomic="true"
      >
        {errorMessage && (
          <p className="text-sm text-red-500">{errorMessage}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
}
