'use client';

import { useEffect, useState } from 'react';

import type { Locale } from '@/lib/catalog/types';
import { ClaimForm } from '@/components/forms/ClaimForm';

export function ClaimFormDialog({ studioSlug, locale }: { studioSlug: string; locale: Locale }) {
  const [isOpen, setIsOpen] = useState(false);
  const labels =
    locale === 'it'
      ? {
          trigger: 'Invia richiesta',
          title: 'Suggerisci un aggiornamento',
          body: 'Se gestisci questo studio o vuoi segnalare dati da correggere, usa questo form.',
          close: 'Chiudi'
        }
      : {
          trigger: 'Send request',
          title: 'Suggest an update',
          body: 'Use this form if you run this venue or want to report a catalog correction.',
          close: 'Close'
        };

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <>
      <button className="button button-secondary" type="button" onClick={() => setIsOpen(true)}>
        {labels.trigger}
      </button>
      {isOpen ? (
        <div className="dialog-backdrop" role="presentation" onClick={() => setIsOpen(false)}>
          <div
            className="dialog-panel panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="claim-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="dialog-head modal-stack">
              <div>
                <h2 id="claim-dialog-title" className="modal-title">
                  {labels.title}
                </h2>
                <p className="modal-copy">{labels.body}</p>
              </div>
              <button className="dialog-close" type="button" onClick={() => setIsOpen(false)} aria-label={labels.close}>
                {labels.close}
              </button>
            </div>
            <div className="dialog-body">
              <ClaimForm studioSlug={studioSlug} locale={locale} panel={false} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
