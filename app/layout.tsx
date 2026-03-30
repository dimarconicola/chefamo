import type { Metadata } from 'next';

import './globals.css';
import 'leaflet/dist/leaflet.css';
import { AppProviders } from '@/components/providers/AppProviders';
import { defaultLocale } from '@/lib/catalog/constants';
import { env } from '@/lib/env';

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: 'chefamo',
    template: '%s · chefamo'
  },
  description: 'Palermo-first discovery for 0-14 activities, family culture, STEM, movement, and outdoor time.',
  openGraph: {
    title: 'chefamo',
    description: 'Find the right Palermo activity, place, or weekend plan for ages 0-14.',
    type: 'website'
  },
  icons: {
    icon: '/icon.svg'
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={defaultLocale}>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
