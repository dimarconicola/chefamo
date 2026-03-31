'use client';

import { resolveExternalInfoTarget } from '@/lib/catalog/external-links';
import type { BookingTarget } from '@/lib/catalog/types';

interface BookingLinkProps {
  citySlug: string;
  categorySlug: string;
  venueSlug: string;
  sessionId?: string;
  sourceUrl: string;
  target: BookingTarget;
  label: string;
}

export function BookingLink({ citySlug, categorySlug, venueSlug, sessionId, sourceUrl, target, label }: BookingLinkProps) {
  const externalTarget = resolveExternalInfoTarget({ target, fallbackHref: sourceUrl });

  const track = () => {
    navigator.sendBeacon(
      '/api/outbound',
      JSON.stringify({
        sessionId,
        venueSlug,
        citySlug,
        categorySlug,
        targetType: externalTarget.targetType,
        href: externalTarget.href
      })
    );
  };

  return (
    <a href={externalTarget.href} className="button button-primary" onClick={track} target="_blank" rel="noreferrer">
      {label}
    </a>
  );
}
