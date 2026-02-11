"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GaiaButton, GaiaCard, GaiaInput } from '@/components/gaia/primitives';
import { useAuth } from '@/contexts/auth-context';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--gaia-bg))] p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[hsl(var(--gaia-accent)/0.1)] mb-4">
            <Icon icon="lucide:cloud" className="w-8 h-8 text-[hsl(var(--gaia-accent))]" />
          </div>
          <h1 className="text-3xl font-bold text-[hsl(var(--gaia-text))] mb-2">Welcome back</h1>
          <p className="text-sm text-[hsl(var(--gaia-muted))]">Sign in to access your files</p>
        </div>

        <GaiaCard className="space-y-6 border-[hsl(var(--gaia-border))] shadow-xl">
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[hsl(var(--gaia-muted))] uppercase tracking-wider">
                Email
              </label>
              <GaiaInput 
                placeholder="you@example.com" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="h-12 text-base"
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[hsl(var(--gaia-muted))] uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <GaiaInput
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 text-base pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-[hsl(var(--gaia-soft))] text-[hsl(var(--gaia-muted))] transition-colors"
                >
                  <Icon icon={showPassword ? "lucide:eye-off" : "lucide:eye"} className="w-5 h-5" />
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20"
              >
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:alert-circle" className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </motion.div>
            )}

            <GaiaButton 
              className="w-full h-12 text-base font-semibold shadow-lg shadow-[hsl(var(--gaia-accent)/0.3)]" 
              type="submit" 
              disabled={submitting}
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:log-in" className="w-5 h-5" />
                  <span>Sign in</span>
                </div>
              )}
            </GaiaButton>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[hsl(var(--gaia-border))]"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[hsl(var(--gaia-panel))] px-3 text-[hsl(var(--gaia-muted))] font-semibold tracking-wider">
                New here?
              </span>
            </div>
          </div>

          <Link href="/auth/register" className="block">
            <button className="w-full h-12 rounded-2xl border-2 border-[hsl(var(--gaia-border))] hover:border-[hsl(var(--gaia-accent))] hover:bg-[hsl(var(--gaia-accent)/0.05)] text-[hsl(var(--gaia-text))] font-semibold transition-all">
              Create account
            </button>
          </Link>
        </GaiaCard>

        <p className="text-center text-xs text-[hsl(var(--gaia-muted))] mt-6">
          Secured with end-to-end encryption
        </p>
      </motion.div>
    </div>
  );
}
