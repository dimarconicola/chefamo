'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { readStoredSchedule, syncStoredSchedule, toggleStoredSchedule } from '@/components/state/storage';
import { readApiErrorCode } from '@/lib/errors/api-client';
import type { RuntimeCapabilities } from '@/lib/runtime/capabilities';

interface ScheduleButtonProps {
  occurrenceId: string;
  locale: string;
  signedInEmail?: string;
  label: string;
  savedLabel?: string;
  runtimeCapabilities?: RuntimeCapabilities;
}

export function ScheduleButton({ occurrenceId, locale, signedInEmail, label, savedLabel, runtimeCapabilities }: ScheduleButtonProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const copy =
    locale === 'it'
      ? {
          unavailable: 'Agenda temporaneamente non disponibile.',
          authRequired: 'Accedi per salvare nel piano.'
        }
      : {
          unavailable: 'Plan is temporarily unavailable.',
          authRequired: 'Sign in to save to your plan.'
        };

  useEffect(() => {
    if (!signedInEmail) return;
    setSaved(readStoredSchedule(signedInEmail).includes(occurrenceId));

    const controller = new AbortController();
    void fetch(`/api/state/schedule?occurrenceId=${encodeURIComponent(occurrenceId)}`, {
      method: 'GET',
      signal: controller.signal
    })
      .then(async (response) => {
        if (!response.ok) return;
        const payload = (await response.json()) as { saved: boolean };
        setSaved(Boolean(payload.saved));
        syncStoredSchedule(signedInEmail, occurrenceId, Boolean(payload.saved));
      })
      .catch(() => {});

    return () => {
      controller.abort();
    };
  }, [occurrenceId, signedInEmail]);

  const toggle = async () => {
    setNotice(null);

    if (runtimeCapabilities?.storeMode === 'unavailable' || runtimeCapabilities?.authMode === 'unavailable') {
      setNotice(copy.unavailable);
      return;
    }

    if (!signedInEmail) {
      if (runtimeCapabilities?.authMode === 'dev-local' || runtimeCapabilities?.authMode === 'supabase' || !runtimeCapabilities) {
        router.push(`/${locale}/sign-in`);
      } else {
        setNotice(copy.authRequired);
      }
      return;
    }

    setPending(true);
    const optimisticSaved = toggleStoredSchedule(signedInEmail, occurrenceId);
    const previousSaved = saved;
    setSaved(optimisticSaved);
    try {
      const response = await fetch('/api/state/schedule', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ occurrenceId })
      });
      if (!response.ok) {
        const code = await readApiErrorCode(response);
        if (response.status === 401 || code === 'AUTH_REQUIRED') {
          router.push(`/${locale}/sign-in`);
        } else {
          setNotice(copy.unavailable);
        }
        setSaved(previousSaved);
        syncStoredSchedule(signedInEmail, occurrenceId, previousSaved);
        return;
      }

      const payload = (await response.json()) as { saved: boolean };
      setSaved(Boolean(payload.saved));
      syncStoredSchedule(signedInEmail, occurrenceId, Boolean(payload.saved));
    } catch {
      setSaved(previousSaved);
      syncStoredSchedule(signedInEmail, occurrenceId, previousSaved);
      setNotice(copy.unavailable);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="action-control">
      <button className="button button-secondary" type="button" onClick={toggle} disabled={pending} aria-pressed={saved} aria-busy={pending}>
        {saved ? (savedLabel ?? (locale === 'it' ? 'Nel piano' : 'In plan')) : label}
      </button>
      {notice ? (
        <span className="action-feedback" aria-live="polite">
          {notice}
        </span>
      ) : null}
    </div>
  );
}
