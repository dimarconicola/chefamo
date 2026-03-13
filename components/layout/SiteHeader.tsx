'use client';

import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { Button, Link, Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenu, NavbarMenuItem, NavbarMenuToggle } from '@heroui/react';

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

  const navItems = [
    { href: `/${locale}/palermo/classes`, label: dict.classes },
    { href: `/${locale}/suggest-calendar`, label: dict.suggestCalendar },
    { href: `/${locale}/favorites`, label: dict.favorites },
    { href: `/${locale}/schedule`, label: dict.schedule }
  ];

  return (
    <div className="site-header-wrap">
      <Navbar
        isBordered={false}
        maxWidth="2xl"
        className="site-header heroui-header"
        isMenuOpen={menuOpen}
        onMenuOpenChange={setMenuOpen}
      >
        <NavbarContent className="sm:hidden" justify="start">
          <NavbarMenuToggle aria-label={menuOpen ? 'Close menu' : 'Open menu'} />
        </NavbarContent>

        <NavbarContent justify="start">
          <NavbarBrand>
            <Link as={NextLink} href={`/${locale}`} className="brand-mark">
              <span className="brand-orbit" />
              <span className="brand-word">{dict.brand}</span>
            </Link>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className="hidden sm:flex gap-1 site-nav-primary" justify="center">
          {navItems.map((item) => (
            <NavbarItem key={item.href}>
              <Link as={NextLink} href={item.href} color="foreground">
                {item.label}
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>

        <NavbarContent justify="end" className="site-actions-primary">
          <NavbarItem>
            <Button
              as={NextLink}
              href={switchLocalePath(pathname, alternate)}
              variant="light"
              radius="full"
              className="locale-toggle"
            >
              {alternate.toUpperCase()}
            </Button>
          </NavbarItem>
          <NavbarItem>
            {signedInEmail ? (
              <form action="/api/auth/signout" method="post">
                <input type="hidden" name="locale" value={locale} />
                <Button type="submit" variant="flat" radius="full" className="button-account">
                  {signedInEmail}
                </Button>
              </form>
            ) : (
              <Button
                as={NextLink}
                href={`/${locale}/sign-in`}
                color="primary"
                radius="full"
                className="button-signin"
              >
                {dict.signIn}
              </Button>
            )}
          </NavbarItem>
        </NavbarContent>

        <NavbarMenu>
          {navItems.map((item) => (
            <NavbarMenuItem key={item.href}>
              <Link as={NextLink} href={item.href} color="foreground" onPress={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </NavbarMenu>
      </Navbar>
    </div>
  );
}
