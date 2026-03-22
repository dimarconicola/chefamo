import { redirect } from 'next/navigation';

import { getSessionUser } from '@/lib/auth/session';
import { resolveLocale } from '@/lib/i18n/routing';
import { getRuntimeCapabilities } from '@/lib/runtime/capabilities';
import { ServerButton, ServerButtonLink, ServerChip, ServerInput } from '@/components/ui/server';

export default async function SignInPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = resolveLocale((await params).locale);
  const resolvedSearchParams = await searchParams;
  const checkEmail = resolvedSearchParams.checkEmail === '1';
  const hasError = resolvedSearchParams.error === '1';
  const [user, capabilities] = await Promise.all([getSessionUser(), getRuntimeCapabilities()]);
  if (user) {
    redirect(`/${locale}/favorites`);
  }

  const copy =
    locale === 'it'
      ? {
          eyebrow: 'Accedi',
          title: 'Salva preferiti e agenda personale',
          lead: 'Accedi per ritrovare studi, insegnanti e classi che vuoi tenere d’occhio.',
          email: 'Email',
          continue: 'Continua',
          magicLink: 'Invia magic link',
          google: 'Continua con Google',
          checkEmail: 'Controlla la tua email: il magic link è stato inviato.',
          authError: 'Non siamo riusciti a completare l’accesso. Riprova tra poco.',
          unavailableTitle: 'Accesso temporaneamente non disponibile',
          unavailableLead: 'Le pagine pubbliche restano consultabili. Riprova tra poco per salvare preferiti e agenda.',
          savedTitle: 'Cosa puoi salvare',
          savedLead: 'Preferiti per seguire studi e insegnanti, agenda per tenere traccia delle lezioni che vuoi fare.'
        }
      : {
          eyebrow: 'Sign in',
          title: 'Save favorites and your personal schedule',
          lead: 'Sign in to keep track of studios, teachers, and classes you want to revisit.',
          email: 'Email',
          continue: 'Continue',
          magicLink: 'Send magic link',
          google: 'Continue with Google',
          checkEmail: 'Check your inbox. We sent a magic link.',
          authError: 'We could not complete sign-in. Please try again shortly.',
          unavailableTitle: 'Sign-in is temporarily unavailable',
          unavailableLead: 'Public pages remain available. Try again later to save favorites and schedule items.',
          savedTitle: 'What you can save',
          savedLead: 'Favorites help you follow studios and teachers. Saved schedule keeps track of the class times you plan to attend.'
        };

  return (
    <section className="detail-hero">
      <div className="panel form-stack">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p className="lead">{copy.lead}</p>
        {checkEmail ? (
          <div>
            <ServerChip tone="meta">
              {copy.checkEmail}
            </ServerChip>
          </div>
        ) : null}
        {hasError ? (
          <div className="empty-state-inline">
            <p className="muted">{copy.authError}</p>
          </div>
        ) : null}

        {capabilities.authMode === 'unavailable' ? (
          <div className="empty-state-inline">
            <p className="lead">{copy.unavailableTitle}</p>
            <p className="muted">{copy.unavailableLead}</p>
          </div>
        ) : capabilities.authMode === 'supabase' ? (
          <>
            <form action="/api/auth/magic-link" method="post" className="form-stack">
              <input type="hidden" name="locale" value={locale} />
              <ServerInput name="email" type="email" label={copy.email} required placeholder="you@example.com" />
              <ServerButton className="button-primary" type="submit">
                {copy.magicLink}
              </ServerButton>
            </form>
            <form action="/api/auth/oauth" method="post" className="form-stack">
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="provider" value="google" />
              <ServerButton className="button-ghost" type="submit">
                {copy.google}
              </ServerButton>
            </form>
          </>
        ) : (
          <form action="/api/auth/demo" method="post" className="form-stack">
            <input type="hidden" name="locale" value={locale} />
            <ServerInput name="email" type="email" label={copy.email} required placeholder="you@example.com" />
            <ServerButton className="button-primary" type="submit">
              {copy.continue}
            </ServerButton>
          </form>
        )}
      </div>
      <div className="panel">
        <p className="eyebrow">{copy.savedTitle}</p>
        <p className="lead">{copy.savedLead}</p>
        <div className="site-actions">
          <ServerButtonLink href={`/${locale}`} className="button-ghost">
            {locale === 'it' ? 'Torna alla home' : 'Back to home'}
          </ServerButtonLink>
        </div>
      </div>
    </section>
  );
}
