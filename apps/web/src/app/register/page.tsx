'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { register } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Password confirmation does not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      router.push('/login');
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="register-shell">
      <aside className="register-story">
        <span className="eyebrow">Sovereign Ledger</span>
        <h1 className="display-title compact-title">Secure Your Entry into the Sovereign Ledger</h1>
        <p>
          Access the definitive institutional terminal for global capital management and verified
          digital asset custody.
        </p>
        <div className="register-stats">
          <strong>12.4T</strong>
          <strong>99.9%</strong>
          <span>Managed Capital</span>
          <span>Uptime SLA</span>
        </div>
      </aside>
      <form className="auth-panel register-panel form-grid" onSubmit={handleSubmit}>
        <div>
          <h1 className="title">Institutional Onboarding</h1>
          <p className="muted">Complete your verification credentials to access the terminal.</p>
        </div>

        <div className="form-row">
          <label htmlFor="fullName">Full name</label>
          <input
            id="fullName"
            className="input"
            value={form.fullName}
            onChange={(event) => updateField('fullName', event.target.value)}
            placeholder="Alexander Sterling"
            minLength={2}
            required
          />
        </div>

        <div className="form-row">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            className="input"
            value={form.email}
            onChange={(event) => updateField('email', event.target.value)}
            type="email"
            autoComplete="email"
            placeholder="verification@reserve.int"
            required
          />
        </div>

        <div className="form-row">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            className="input"
            value={form.password}
            onChange={(event) => updateField('password', event.target.value)}
            type="password"
            minLength={8}
            autoComplete="new-password"
            placeholder="********"
            required
          />
        </div>

        <div className="form-row">
          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            className="input"
            value={form.confirmPassword}
            onChange={(event) => updateField('confirmPassword', event.target.value)}
            type="password"
            minLength={8}
            autoComplete="new-password"
            placeholder="********"
            required
          />
        </div>

        <label className="check-row">
          <input type="checkbox" required />
          <span>
            I acknowledge that I am authorized to represent this entity and agree to the
            Institutional Master Service Agreement and Privacy Protocols.
          </span>
        </label>

        <div className="form-error">{error}</div>

        <div className="form-footer">
          <Link className="muted" href="/login">
            Back to login
          </Link>
          <button className="solid-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Register'}
          </button>
        </div>
      </form>
    </section>
  );
}
