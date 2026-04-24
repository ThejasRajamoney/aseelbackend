'use client';

import { ArrowRight, Loader2, Shield, Sparkles, Users } from 'lucide-react';
import { type FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthRole } from '@/lib/types';

type AuthMode = 'login' | 'register';

interface AuthPanelProps {
  defaultMode: AuthMode;
  defaultRole: AuthRole;
  nextPath: string;
  defaultEmail?: string;
  defaultName?: string;
}

function resolveDestination(nextPath: string, role: AuthRole) {
  if (nextPath.startsWith('/') && !nextPath.startsWith('//')) {
    return nextPath;
  }

  return role === 'teacher' ? '/teacher' : '/student';
}

export function AuthPanel({ defaultMode, defaultRole, nextPath, defaultEmail = '', defaultName = '' }: AuthPanelProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [role, setRole] = useState<AuthRole>(defaultRole);
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const destination = useMemo(() => resolveDestination(nextPath, role), [nextPath, role]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode,
          name,
          email,
          password,
          role,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || 'Authentication failed.');
      }

      router.push(resolveDestination(nextPath, data.user?.role ?? role));
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="aseel-shell flex min-h-[calc(100vh-88px)] items-center py-8 sm:py-14">
      <div className="grid w-full gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <section className="space-y-6">
          <div className="aseel-section-kicker">Authentication</div>
          <h1 className="font-display text-4xl leading-[0.95] text-[color:var(--text-primary)] sm:text-6xl">
            Sign in to Aseel.
          </h1>
          <p className="max-w-xl text-base leading-8 text-[color:var(--text-secondary)]">
            Use a teacher or student account to protect submissions, keep sessions personal, and route each user to the right space.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: Shield, title: 'Session cookies', text: 'HTTP-only, server-verified login state.' },
              { icon: Users, title: 'Role aware', text: 'Student and teacher accounts stay separate.' },
              { icon: Sparkles, title: 'Fast setup', text: 'No external provider needed.' },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <article key={item.title} className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--bg-secondary)]/80 p-4">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[color:var(--accent-gold)]/20 bg-[color:var(--accent-gold)]/10 text-[color:var(--accent-gold)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 font-display text-2xl text-[color:var(--text-primary)]">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">{item.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="aseel-card p-5 sm:p-6">
          <div className="flex flex-col gap-3 border-b border-[color:var(--border)] pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="aseel-section-kicker">{mode === 'register' ? 'Create account' : 'Welcome back'}</div>
              <h2 className="mt-2 font-display text-2xl text-[color:var(--text-primary)] sm:text-3xl">
                {mode === 'register' ? 'Set up your account' : 'Log in to continue'}
              </h2>
            </div>

            <div className="self-start rounded-full border border-[color:var(--border)] bg-[color:var(--bg-primary)]/60 px-3 py-1 text-xs uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              {role}
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-[color:var(--danger)]/40 bg-[color:var(--danger)]/10 px-4 py-3 text-sm text-[color:var(--danger)]">
              {error}
            </div>
          ) : null}

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            {mode === 'register' ? (
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.26em] text-[color:var(--text-secondary)]">Name</label>
                <input className="aseel-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
              </div>
            ) : null}

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.26em] text-[color:var(--text-secondary)]">Email</label>
              <input className="aseel-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@school.edu" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.26em] text-[color:var(--text-secondary)]">Password</label>
              <input className="aseel-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" />
            </div>

            {mode === 'register' ? (
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.26em] text-[color:var(--text-secondary)]">Account type</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Student', value: 'student' as const },
                    { label: 'Teacher', value: 'teacher' as const },
                  ].map((option) => {
                    const active = role === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setRole(option.value)}
                        className={[
                          'rounded-xl border px-4 py-3 text-sm font-semibold transition',
                          active
                            ? 'border-[color:var(--accent-gold)] bg-[color:var(--accent-gold)]/10 text-[color:var(--accent-gold)]'
                            : 'border-[color:var(--border)] bg-[color:var(--bg-secondary)] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]',
                        ].join(' ')}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <button type="submit" disabled={loading} className="aseel-button-gold w-full disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Working...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  {mode === 'register' ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-5 flex flex-col gap-3 text-sm text-[color:var(--text-secondary)] sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={() => setMode(mode === 'register' ? 'login' : 'register')} className="font-semibold text-[color:var(--accent-gold)]">
              {mode === 'register' ? 'Already have an account?' : 'Need an account?'}
            </button>

            <span className="break-all">Next: <span className="text-[color:var(--text-primary)]">{destination}</span></span>
          </div>
        </section>
      </div>
    </main>
  );
}
