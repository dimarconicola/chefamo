'use client';

import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { ChefamoMark } from '@/components/brand/ChefamoMark';
import { switchLocalePath } from '@/lib/i18n/routing';
import type { Locale } from '@/lib/catalog/types';

interface SiteHeaderProps {
  locale: Locale;
  dict: Record<string, string>;
  signedInEmail?: string;
}

export function SiteHeader({ locale, dict, signedInEmail }: SiteHeaderProps) {
  const pathname = usePathname();
  const alternate = locale === 'en' ? 'it' : 'en';
  const [menuOpen, setMenuOpen] = useState(false);
  const menuCopy = locale === 'it' ? { open: 'Menu', close: 'Chiudi' } : { open: 'Menu', close: 'Close' };

  const navItems = [
    { href: `/${locale}/palermo/activities`, label: dict.classes },
    { href: `/${locale}/palermo/places`, label: dict.studios },
    { href: `/${locale}/palermo/organizers`, label: dict.teachers },
    { href: `/${locale}/favorites`, label: dict.favorites },
    { href: `/${locale}/schedule`, label: dict.schedule }
  ];
  const mobileNavId = `mobile-nav-${locale}`;
  const brandNote = locale === 'it' ? 'guida 0-14' : '0-14 guide';
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="site-header-wrap">
      <div className="site-shell site-header chefamo-header">
        <NextLink href={`/${locale}`} className="chefamo-brand-link" onClick={() => setMenuOpen(false)}>
          <ChefamoMark note={brandNote} />
        </NextLink>

        <nav className="site-nav site-nav-primary chefamo-primary-nav">
          {navItems.map((item) => (
            <NextLink
              key={item.href}
              href={item.href}
              className={isActive(item.href) ? 'site-nav-link chefamo-nav-link is-active' : 'site-nav-link chefamo-nav-link'}
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              {item.label}
            </NextLink>
          ))}
        </nav>

        <div className="site-actions site-actions-primary chefamo-header-actions">
          <NextLink href={switchLocalePath(pathname, alternate)} className="chefamo-header-pill chefamo-header-pill-muted locale-toggle">
            {alternate.toUpperCase()}
          </NextLink>
          {signedInEmail ? (
            <div className="account-cluster chefamo-account-cluster">
              <NextLink href={`/${locale}/account`} className="chefamo-header-pill chefamo-header-account" title={signedInEmail}>
                {signedInEmail}
              </NextLink>
              <form action="/api/auth/signout" method="post">
                <input type="hidden" name="locale" value={locale} />
                <button type="submit" className="chefamo-header-pill chefamo-header-pill-muted">
                  {dict.signOut}
                </button>
              </form>
            </div>
          ) : (
            <NextLink href={`/${locale}/sign-in`} className="chefamo-header-pill chefamo-header-pill-primary">
              {dict.signIn}
            </NextLink>
          )}
          <button
            type="button"
            className="chefamo-header-pill chefamo-header-pill-muted mobile-menu-toggle"
            onClick={() => setMenuOpen((current) => !current)}
            aria-expanded={menuOpen}
            aria-controls={mobileNavId}
            aria-label={menuOpen ? menuCopy.close : menuCopy.open}
          >
            {menuOpen ? menuCopy.close : menuCopy.open}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="site-shell mobile-nav-panel chefamo-mobile-nav" id={mobileNavId}>
          {navItems.map((item) => (
            <NextLink
              key={item.href}
              href={item.href}
              className={isActive(item.href) ? 'mobile-nav-link chefamo-mobile-nav-link is-active' : 'mobile-nav-link chefamo-mobile-nav-link'}
              aria-current={isActive(item.href) ? 'page' : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NextLink>
          ))}
          {signedInEmail ? (
            <div className="mobile-account-panel">
              <NextLink
                href={`/${locale}/account`}
                className="chefamo-mobile-nav-link chefamo-mobile-nav-link-strong mobile-account-label"
                title={signedInEmail}
                onClick={() => setMenuOpen(false)}
              >
                {signedInEmail}
              </NextLink>
              <form action="/api/auth/signout" method="post" className="mobile-nav-form">
                <input type="hidden" name="locale" value={locale} />
                <button type="submit" className="chefamo-header-pill chefamo-header-pill-muted button-signout">
                  {dict.signOut}
                </button>
              </form>
            </div>
          ) : (
            <NextLink href={`/${locale}/sign-in`} className="chefamo-header-pill chefamo-header-pill-primary mobile-nav-action" onClick={() => setMenuOpen(false)}>
              {dict.signIn}
            </NextLink>
          )}
          <NextLink
            href={switchLocalePath(pathname, alternate)}
            className="chefamo-header-pill chefamo-header-pill-muted mobile-nav-action"
            onClick={() => setMenuOpen(false)}
          >
            {alternate.toUpperCase()}
          </NextLink>
        </div>
      ) : null}
    </div>
  );
}
