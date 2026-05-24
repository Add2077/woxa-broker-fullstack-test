import type { Metadata } from 'next';
import { AppHeader } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';
import './globals.css';

export const metadata: Metadata = {
  title: 'Woxa Broker Directory',
  description: 'Broker directory with authentication, search, filtering, and broker details.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppHeader />
        <main>{children}</main>
        <AppFooter />
      </body>
    </html>
  );
}
