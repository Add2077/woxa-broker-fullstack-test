import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="auth-shell">
      <div className="auth-panel form-grid">
        <div>
          <p className="eyebrow">404</p>
          <h1 className="title">Broker not found</h1>
          <p className="muted">The broker record may have been removed or the URL is invalid.</p>
        </div>
        <Link className="solid-button" href="/">
          Back to list
        </Link>
      </div>
    </section>
  );
}
