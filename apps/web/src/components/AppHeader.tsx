'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, CircleUserRound, LogOut, ShieldCheck } from 'lucide-react';
import { clearSession, getToken, getUser } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { User } from '@/types/broker';

const navItems = [
  { href: '/', label: 'Brokers' },
  { href: '/', label: 'Markets' },
  { href: '/', label: 'Analysis' },
  { href: '/', label: 'Education' },
];

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setUser(getUser());
    setHasToken(Boolean(getToken()));
  }, [pathname]);

  function logout() {
    clearSession();
    setUser(null);
    setHasToken(false);
    router.push('/login');
  }

  return (
    <header className="app-header">
      <Link className="brand" href="/">
        <strong>Woxa</strong>
      </Link>

      <nav className="main-nav" aria-label="Primary">
        {navItems.map((item) => {
          return (
            <Link
              key={item.label}
              className={pathname === item.href && item.label === 'Brokers' ? 'nav-link active' : 'nav-link'}
              href={item.href}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="header-actions">
        <button className="header-icon" type="button" aria-label="Notifications">
          <Bell size={18} />
        </button>
        {hasToken ? (
          <>
            <span className="user-chip">
              <ShieldCheck size={16} />
              {user?.fullName ?? 'Signed in'}
            </span>
            <button className="icon-button" type="button" onClick={logout} aria-label="Log out">
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <Link className="header-icon" href="/login" aria-label="Institutional login">
            <CircleUserRound size={19} />
          </Link>
        )}
      </div>
    </header>
  );
}
