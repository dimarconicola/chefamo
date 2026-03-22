'use client';

import { useState } from 'react';

import type { Locale } from '@/lib/catalog/types';
import { readApiErrorCode } from '@/lib/errors/api-client';

interface DigestFormProps {
  citySlug: string;
  locale: Locale;
  className?: string;
  showIntro?: boolean;
  surface?: 'panel' | 'plain';
  compact?: boolean;
}

export function DigestForm({ citySlug, locale, className, showIntro = true, surface = 'panel', compact = false }: DigestFormProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState<string | null>(null);
  const copy =
    locale === 'it'
      ? {
          eyebrow: 'Digest settimanale',
          title: 'Muoviti meglio, ogni settimana',
          lead: 'Aggiornamenti mirati: lezioni verificate, variazioni orarie, nuove aperture e selezioni curate per Palermo.',
          email: 'Email',
          english: 'Classi in inglese',
          beginner: 'Adatte a principianti',
          weekend: 'Weekend picks',
          saving: 'Salvataggio…',
          cta: 'Iscriviti al digest',
          placeholder: 'nome@email.com',
          done: 'Perfetto. Ti avviseremo con gli aggiornamenti utili della settimana.',
          alreadyDone: 'Sei già iscrittə a questo digest. Ti aggiorneremo qui.',
          unavailable: 'Iscrizione temporaneamente non disponibile. Riprova più tardi.',
          genericError: 'Non siamo riusciti a salvare la tua iscrizione. Riprova.'
        }
      : {
          eyebrow: 'Weekly digest',
          title: 'Move better, every week',
          lead: 'Targeted updates: verified classes, schedule changes, new openings, and curated Palermo picks.',
          email: 'Email',
          english: 'English-friendly',
          beginner: 'Beginner-friendly',
          weekend: 'Weekend picks',
          saving: 'Saving…',
          cta: 'Join the digest',
          placeholder: 'name@email.com',
          done: 'Great. You are in for practical weekly updates.',
          alreadyDone: 'You are already subscribed to this digest.',
          unavailable: 'Subscriptions are temporarily unavailable. Please try again later.',
          genericError: 'We could not save your subscription. Please try again.'
        };

  return (
    <form
      className={`${surface === 'panel' ? 'panel ' : ''}digest-form${className ? ` ${className}` : ''}`}
      onSubmit={async (event) => {
        event.preventDefault();
        setFeedback(null);
        setStatus('loading');
        const formData = new FormData(event.currentTarget);
        const values = Object.fromEntries(formData.entries());
        const preferences = formData.getAll('preferences') as string[];
        try {
          const response = await fetch('/api/digest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...values, preferences, citySlug, locale })
          });

          if (!response.ok) {
            const code = await readApiErrorCode(response);
            setStatus('error');
            setFeedback(code === 'STORE_UNAVAILABLE' ? copy.unavailable : copy.genericError);
            return;
          }

          const result = (await response.json()) as { data?: { code?: string } };
          setStatus('success');
          setFeedback(result.data?.code === 'DIGEST_ALREADY_SUBSCRIBED' ? copy.alreadyDone : copy.done);
          event.currentTarget.reset();
        } catch {
          setStatus('error');
          setFeedback(copy.genericError);
        }
      }}
    >
      {showIntro ? (
        <>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h3>{copy.title}</h3>
          <p className="muted">{copy.lead}</p>
        </>
      ) : null}
      <label>
        <span>{copy.email}</span>
        <input name="email" type="email" required placeholder={copy.placeholder} />
      </label>
      {compact ? null : (
        <div className="chip-row digest-preferences">
          <label className="chip-option">
            <input name="preferences" type="checkbox" value="english" />
            <span>{copy.english}</span>
          </label>
          <label className="chip-option">
            <input name="preferences" type="checkbox" value="beginner" />
            <span>{copy.beginner}</span>
          </label>
          <label className="chip-option">
            <input name="preferences" type="checkbox" value="weekend" />
            <span>{copy.weekend}</span>
          </label>
        </div>
      )}
      <button type="submit" disabled={status === 'loading'} className="button button-primary digest-submit">
        {status === 'loading' ? copy.saving : copy.cta}
      </button>
      <div aria-live="polite">
        {feedback ? <p className={`digest-feedback digest-feedback-${status}`}>{feedback}</p> : null}
      </div>
    </form>
  );
}
