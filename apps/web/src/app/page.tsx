'use client';

import Link from 'next/link';
import {
  ArrowUpRight,
  Database,
  Handshake,
  LucideIcon,
  Search,
  Shield,
  Signal,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { getBrokers } from '@/lib/api';
import { useDebounce } from '@/lib/use-debounce';
import { Broker, BrokerType, brokerTypes } from '@/types/broker';

type LoadStatus = 'idle' | 'loading' | 'error';

type BrokerMeta = {
  icon: LucideIcon;
  label: string;
};

const coverImages = [
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1518005068251-37900150dfca?auto=format&fit=crop&w=900&q=80',
];

const brokerMetaByType: Record<BrokerType, BrokerMeta> = {
  cfd: { icon: Signal, label: 'Tier 1 Licensed' },
  bond: { icon: Shield, label: 'FCA Regulated' },
  stock: { icon: TrendingUp, label: 'Global Reach' },
  crypto: { icon: Database, label: 'Cold Storage' },
};

export default function BrokerListPage() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState<BrokerType | ''>('');
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [error, setError] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    let ignore = false;

    async function loadBrokers() {
      setStatus('loading');
      setError('');
      try {
        const data = await getBrokers({ search: debouncedSearch.trim(), type });
        if (!ignore) {
          setBrokers(data);
          setStatus('idle');
        }
      } catch (currentError) {
        if (!ignore) {
          setError(currentError instanceof Error ? currentError.message : 'Unable to load brokers');
          setStatus('error');
        }
      }
    }

    loadBrokers();
    return () => {
      ignore = true;
    };
  }, [debouncedSearch, type]);

  return (
    <section className="page-grid broker-directory">
      <div className="directory-hero">
        <div>
          <h1 className="display-title">Institutional Brokers</h1>
          <p className="hero-copy">
            Access global liquidity through curated networks of institutional market makers.
          </p>
        </div>
        <Link className="solid-button" href="/create">
          Submit Broker
        </Link>
      </div>

      <div className="search-row">
        <div className="input-wrap">
          <Search size={18} />
          <input
            className="input with-icon"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search broker name"
            type="search"
          />
        </div>
      </div>

      <div className="filter-row" aria-label="Broker type filter">
        <span>Asset Focus</span>
        <button
          className={type === '' ? 'filter-pill active' : 'filter-pill'}
          type="button"
          onClick={() => setType('')}
        >
          All Partners
        </button>
        {brokerTypes.map((brokerType) => (
          <button
            key={brokerType}
            className={type === brokerType ? 'filter-pill active' : 'filter-pill'}
            type="button"
            onClick={() => setType(brokerType)}
          >
            {brokerType.toUpperCase()}
          </button>
        ))}
      </div>

      <div>
        {status === 'loading' ? (
          <div className="loading-state">Loading brokers...</div>
        ) : status === 'error' ? (
          <div className="error-state">{error}</div>
        ) : brokers.length === 0 ? (
          <div className="empty-state">No brokers found.</div>
        ) : (
          <div className="broker-grid">
            {brokers.map((broker, index) => {
              const MetaIcon = brokerMetaByType[broker.broker_type].icon;
              const metaLabel = brokerMetaByType[broker.broker_type].label;

              return (
                <Link className="broker-card" href={`/broker/${broker.slug}`} key={broker.id}>
                  {index === 0 ? <span className="card-badge">Premium Tier</span> : null}
                  <img className="broker-cover" src={coverImages[index % coverImages.length]} alt="" />
                  <div className="broker-card-body">
                    <h2>{broker.name}</h2>
                    <p>{broker.description}</p>
                    <div className="card-meta">
                      <span>
                        <MetaIcon size={13} />
                        {metaLabel}
                      </span>
                      <span>
                        View Details
                        <ArrowUpRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
            <Link className="broker-card partner-card" href="/create">
              <div className="partner-icon">
                <Handshake size={34} />
              </div>
              <h2>Partner with Us</h2>
              <p>Add your institutional broker and publish market access information for review.</p>
              <span className="solid-button compact">Register Now</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
