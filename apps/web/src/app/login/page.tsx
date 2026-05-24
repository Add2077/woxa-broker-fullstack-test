'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { login } from '@/lib/api';
import { saveSession } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('demo@woxa.test');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const session = await login({ email, password });
      saveSession(session.accessToken, session.user);
      router.push('/create');
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-visual-shell login-visual">
      <form className="auth-panel form-grid" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">Sterling Midnight</p>
          <h1 className="title">Secure Verification</h1>
          <p className="muted">Access the sovereign ledger with your verified credentials.</p>
        </div>

        <div className="form-row">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            className="input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            autoComplete="email"
            required
          />
        </div>

        <div className="form-row">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            className="input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            autoComplete="current-password"
            minLength={8}
            required
          />
        </div>

        <div className="form-error">{error}</div>

        <div className="form-footer">
          <Link className="muted" href="/register">
            Create account
          </Link>
          <button className="solid-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </form>
    </section>
  );
}
