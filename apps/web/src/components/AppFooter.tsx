import Link from 'next/link';

const footerLinks = ['Privacy Policy', 'Terms of Service', 'Risk Disclosure', 'Contact'];

export function AppFooter() {
  return (
    <footer className="app-footer">
      <strong>Woxa</strong>
      <nav aria-label="Footer">
        {footerLinks.map((label) => (
          <Link href="/" key={label}>
            {label}
          </Link>
        ))}
      </nav>
      <span>© 2024 Sterling Midnight. All rights reserved.</span>
    </footer>
  );
}
