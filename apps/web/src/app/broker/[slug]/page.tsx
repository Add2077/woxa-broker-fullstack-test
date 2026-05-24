import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Download, ExternalLink, ShieldCheck, TrendingUp } from 'lucide-react';
import { getBroker } from '@/lib/api';

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function loadBroker(slug: string) {
  try {
    return await getBroker(slug);
  } catch {
    notFound();
  }
}

const heroImages = {
  cfd: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
  bond: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80',
  stock: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1600&q=80',
  crypto: 'https://images.unsplash.com/photo-1518005068251-37900150dfca?auto=format&fit=crop&w=1600&q=80',
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const broker = await loadBroker(slug);

  return {
    title: `${broker.name} | Woxa Broker Directory`,
    description: broker.description,
    openGraph: {
      title: broker.name,
      description: broker.description,
      images: [{ url: broker.logo_url }],
    },
  };
}

export default async function BrokerDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const broker = await loadBroker(slug);

  return (
    <section className="page-grid detail-page">
      <div className="detail-visual">
        <img src={heroImages[broker.broker_type]} alt="" />
        <div className="detail-visual-content">
          <span className="type-pill">{broker.broker_type}</span>
          <h1 className="display-title">{broker.name}</h1>
          <p>{broker.description}</p>
          <div className="detail-actions">
            <a className="solid-button" href={broker.website} target="_blank" rel="noreferrer">
              Visit Website
              <ExternalLink size={16} />
            </a>
            <a className="ghost-button" href={broker.website} target="_blank" rel="noreferrer">
              Download Prospectus
              <Download size={16} />
            </a>
          </div>
        </div>
      </div>

      <div className="detail-content-grid">
        <article className="mandate-copy">
          <h2>The Sovereign Mandate</h2>
          <p>
            Founded for regulated market access, {broker.name} provides institutional coverage,
            broker discovery, and market routing for professional investors.
          </p>
          <p>
            The infrastructure is designed for repeatable due diligence, transparent routing, and
            structured comparison across broker types.
          </p>
          <div className="trust-grid">
            <div className="trust-item">
              <ShieldCheck size={18} />
              <strong>SEC & FCA Regulated</strong>
              <span>Verified profile data and compliance-first onboarding.</span>
            </div>
            <div className="trust-item">
              <TrendingUp size={18} />
              <strong>12ms Execution</strong>
              <span>Low-latency market routing and broker discovery support.</span>
            </div>
          </div>
        </article>

        <aside className="metrics-panel">
          <h2>Performance Metrics</h2>
          <dl>
            <div>
              <dt>AUM Exposure</dt>
              <dd>+24.8%</dd>
            </div>
            <div>
              <dt>Liquidity Access</dt>
              <dd>$12.4B</dd>
            </div>
            <div>
              <dt>Client Retention</dt>
              <dd>98.2%</dd>
            </div>
          </dl>
          <Link className="ghost-button" href="/">
            View Full Audit Report
          </Link>
        </aside>
      </div>

      <dl className="detail-grid">
        <div className="detail-field">
          <dt>Broker ID</dt>
          <dd>{broker.id}</dd>
        </div>
        <div className="detail-field">
          <dt>Broker Type</dt>
          <dd>
            <span className="type-pill">{broker.broker_type}</span>
          </dd>
        </div>
        <div className="detail-field">
          <dt>Slug</dt>
          <dd>{broker.slug}</dd>
        </div>
        <div className="detail-field">
          <dt>Website</dt>
          <dd>
            <a href={broker.website} target="_blank" rel="noreferrer">
              {broker.website}
            </a>
          </dd>
        </div>
        <div className="detail-field span-2">
          <dt>Logo URL</dt>
          <dd>{broker.logo_url}</dd>
        </div>
        <div className="detail-field span-2">
          <dt>Description</dt>
          <dd>{broker.description}</dd>
        </div>
      </dl>

      <Link className="ghost-button" href="/">
        Back to broker list
      </Link>
    </section>
  );
}
