'use client';

import { useState } from 'react';

import type { Locale } from '@/lib/catalog/types';

export function ClaimForm({
  placeSlug,
  locale,
  panel = true
}: {
  placeSlug: string;
  locale: Locale;
  panel?: boolean;
}) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const labels =
    locale === 'it'
      ? {
          name: 'Nome',
          email: 'Email',
          role: 'Ruolo',
          rolePlaceholder: 'Gestore, referente, curatore',
          notes: 'Note',
          notesPlaceholder: 'Indica cosa vuoi aggiornare, correggere o verificare.',
          submitting: 'Invio in corso...',
          submit: 'Invia aggiornamento',
          done: 'Grazie. Il team verificherà l aggiornamento prima della pubblicazione.'
        }
      : {
          name: 'Name',
          email: 'Email',
          role: 'Role',
          rolePlaceholder: 'Manager, coordinator, curator',
          notes: 'Notes',
          notesPlaceholder: 'Tell us what needs updating, fixing, or verifying.',
          submitting: 'Submitting...',
          submit: 'Send update',
          done: 'Thanks. The team will review it before publishing changes.'
        };

  return (
    <form
      className={panel ? 'panel form-stack' : 'form-stack'}
      onSubmit={async (event) => {
        event.preventDefault();
        setStatus('loading');
        const formData = new FormData(event.currentTarget);
        const payload = Object.fromEntries(formData.entries());
        await fetch('/api/claims', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, placeSlug, locale })
        });
        setStatus('done');
        event.currentTarget.reset();
      }}
    >
      <label>
        <span>{labels.name}</span>
        <input name="name" required />
      </label>
      <label>
        <span>{labels.email}</span>
        <input name="email" type="email" required />
      </label>
      <label>
        <span>{labels.role}</span>
        <input name="role" placeholder={labels.rolePlaceholder} required />
      </label>
      <label>
        <span>{labels.notes}</span>
        <textarea name="notes" rows={4} placeholder={labels.notesPlaceholder} required />
      </label>
      <button className="button button-primary" type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? labels.submitting : labels.submit}
      </button>
      <div aria-live="polite">
        {status === 'done' ? <p className="muted">{labels.done}</p> : null}
      </div>
    </form>
  );
}
