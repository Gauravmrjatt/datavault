"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GaiaButton, GaiaCard, GaiaInput } from '@/components/gaia/primitives';
import { useAuth } from '@/contexts/auth-context';

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [loading, user, router]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login(email, password);
      router.replace('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--gaia-bg))] p-4">
      <GaiaCard className="w-full max-w-md space-y-4">
        <h1 className="font-[var(--font-space)] text-2xl font-semibold">Sign in</h1>
        <form className="space-y-3" onSubmit={onSubmit}>
          <GaiaInput placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <GaiaInput
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <GaiaButton className="w-full" type="submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </GaiaButton>
        </form>
        <p className="text-sm text-[hsl(var(--gaia-muted))]">
          New here?{' '}
          <Link href="/auth/register" className="font-semibold text-[hsl(var(--gaia-accent))]">
            Create account
          </Link>
        </p>
      </GaiaCard>
    </div>
  );
}
