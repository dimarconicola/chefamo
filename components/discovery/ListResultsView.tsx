'use client';

import NextLink from 'next/link';
import { Button } from '@heroui/react';

import { SessionCard } from '@/components/discovery/SessionCard';
import type { ResolvedSessionCardData } from '@/lib/catalog/session-card-data';
import type { Locale, Session } from '@/lib/catalog/types';

interface ListResultsViewProps {
  locale: Locale;
  pagedSessions: Session[];
  resolvedSessionCards: Record<string, ResolvedSessionCardData>;
  signedInEmail?: string;
  scheduleLabel: string;
  noResultsLabel: string;
  totalPages: number;
  currentPage: number;
  prevHref?: string;
  nextHref?: string;
}

export function ListResultsView({
  locale,
  pagedSessions,
  resolvedSessionCards,
  signedInEmail,
  scheduleLabel,
  noResultsLabel,
  totalPages,
  currentPage,
  prevHref,
  nextHref
}: ListResultsViewProps) {
  const labels =
    locale === 'it'
      ? { page: 'Pagina', previous: 'Precedente', next: 'Successiva' }
      : { page: 'Page', previous: 'Previous', next: 'Next' };

  return (
    <>
      <section className="stack-list">
        {pagedSessions.length > 0 ? (
          pagedSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              locale={locale}
              resolved={resolvedSessionCards[session.id]}
              signedInEmail={signedInEmail}
              scheduleLabel={scheduleLabel}
            />
          ))
        ) : (
          <div className="empty-state">
            <p>{noResultsLabel}</p>
          </div>
        )}
      </section>

      {totalPages > 1 ? (
        <section className="panel pagination-row">
          <span className="muted">
            {labels.page} {currentPage} / {totalPages}
          </span>
          <div className="site-actions">
            {prevHref ? (
              <Button as={NextLink} href={prevHref} variant="ghost" radius="full" className="button button-ghost">
                {labels.previous}
              </Button>
            ) : null}
            {nextHref ? (
              <Button as={NextLink} href={nextHref} color="primary" radius="full" className="button button-primary">
                {labels.next}
              </Button>
            ) : null}
          </div>
        </section>
      ) : null}
    </>
  );
}
