'use client';

import { useState } from 'react';

interface ShareButtonProps {
  url: string;
  title: string;
  text: string;
  locale: string;
  label: string;
  className?: string;
  tracking?: {
    occurrenceId: string;
    citySlug: string;
    categorySlug: string;
    venueSlug: string;
  };
}

const copyText = async (value: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return true;
  }

  const input = document.createElement('textarea');
  input.value = value;
  input.setAttribute('readonly', 'true');
  input.style.position = 'absolute';
  input.style.left = '-9999px';
  document.body.appendChild(input);
  input.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(input);
  return copied;
};

export function ShareButton({ url, title, text, locale, label, className = 'button button-ghost', tracking }: ShareButtonProps) {
  const [notice, setNotice] = useState<string | null>(null);
  const copy =
    locale === 'it'
      ? {
          copied: 'Link copiato.',
          unavailable: 'Condivisione non disponibile in questo momento.'
        }
      : {
          copied: 'Link copied.',
          unavailable: 'Sharing is not available right now.'
        };

  const share = async () => {
    setNotice(null);
    const resolvedUrl =
      url.startsWith('http://') || url.startsWith('https://') || typeof window === 'undefined'
        ? url
        : new URL(url, window.location.origin).toString();
    const track = (method: 'native' | 'copy') => {
      if (!tracking) return;

      navigator.sendBeacon(
        '/api/share',
        JSON.stringify({
          ...tracking,
          href: resolvedUrl,
          method
        })
      );
    };

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, text, url: resolvedUrl });
        track('native');
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
      }
    }

    try {
      const copied = await copyText(resolvedUrl);
      if (copied) track('copy');
      setNotice(copied ? copy.copied : copy.unavailable);
    } catch {
      setNotice(copy.unavailable);
    }
  };

  return (
    <div className="action-control">
      <button type="button" className={className} onClick={share}>
        {label}
      </button>
      {notice ? (
        <span className="action-feedback" aria-live="polite">
          {notice}
        </span>
      ) : null}
    </div>
  );
}
