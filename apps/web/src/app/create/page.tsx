'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { createBroker } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { BrokerType, brokerTypes } from '@/types/broker';

type BrokerForm = {
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  website: string;
  broker_type: BrokerType;
};

const initialForm: BrokerForm = {
  name: '',
  slug: '',
  description: '',
  logo_url: '',
  website: '',
  broker_type: 'cfd',
};

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function CreateBrokerPage() {
  const router = useRouter();
  const [form, setForm] = useState<BrokerForm>(initialForm);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const currentToken = getToken();
    if (!currentToken) {
      router.replace('/login');
      return;
    }
    setToken(currentToken);
  }, [router]);

  function updateField<T extends keyof BrokerForm>(field: T, value: BrokerForm[T]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleNameChange(name: string) {
    setForm((current) => ({
      ...current,
      name,
      slug: current.slug ? current.slug : toSlug(name),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!token) {
      setError('Please login before creating a broker');
      return;
    }

    setIsSubmitting(true);
    try {
      await createBroker(
        {
          ...form,
          slug: toSlug(form.slug),
        },
        token,
      );
      router.push('/');
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : 'Unable to create broker');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="submit-shell">
      <div className="submit-content">
        <div className="submit-heading">
          <h1 className="display-title compact-title">Submit Broker</h1>
          <p className="muted">
            Register a new institutional entity within the Sterling Midnight ecosystem. Please
            ensure all data points align with regulatory documentation.
          </p>
        </div>

        <form className="submit-panel form-grid" onSubmit={handleSubmit}>
          <div className="form-columns">
            <div className="form-row">
              <label htmlFor="name">Broker Name</label>
              <input
                id="name"
                className="input"
                value={form.name}
                onChange={(event) => handleNameChange(event.target.value)}
                minLength={2}
                placeholder="e.g. Sterling Capital Markets"
                required
              />
            </div>

            <div className="form-row">
              <label htmlFor="slug">Slug</label>
              <input
                id="slug"
                className="input"
                value={form.slug}
                onChange={(event) => updateField('slug', toSlug(event.target.value))}
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                placeholder="sterling-capital-markets"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              className="textarea"
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              placeholder="Provide a comprehensive institutional overview..."
              minLength={10}
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="logo_url">Logo URL</label>
            <input
              id="logo_url"
              className="input"
              value={form.logo_url}
              onChange={(event) => updateField('logo_url', event.target.value)}
              type="url"
              placeholder="https://example.com/logo.png"
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              className="input"
              value={form.website}
              onChange={(event) => updateField('website', event.target.value)}
              type="url"
              placeholder="https://example.com"
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="broker_type">Broker type</label>
            <select
              id="broker_type"
              className="select"
              value={form.broker_type}
              onChange={(event) => updateField('broker_type', event.target.value as BrokerType)}
              required
            >
              {brokerTypes.map((brokerType) => (
                <option key={brokerType} value={brokerType}>
                  {brokerType.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="form-error">{error}</div>
          <div className="submit-actions">
            <span className="muted">Discard Draft</span>
            <button className="solid-button" type="submit" disabled={isSubmitting || !token}>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
