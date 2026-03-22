import { SavedScheduleClient } from '@/components/state/SavedScheduleClient';
import { ServerButtonLink } from '@/components/ui/server';
import { getSessionUser } from '@/lib/auth/session';
import { getCatalogSnapshot } from '@/lib/catalog/repository';
import { resolveLocale } from '@/lib/i18n/routing';
import { listUserSchedule } from '@/lib/runtime/store';
import { getRuntimeCapabilities } from '@/lib/runtime/capabilities';
import { formatSessionTime } from '@/lib/ui/format';

export default async function SchedulePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = resolveLocale((await params).locale);
  const [user, capabilities] = await Promise.all([getSessionUser(), getRuntimeCapabilities()]);
  const copy =
    locale === 'it'
      ? {
          signInNeeded: 'Accedi per salvare la tua agenda personale.',
          signIn: 'Accedi',
          unavailable: 'L’agenda salvata non è disponibile in questo momento. Continua pure a esplorare il calendario pubblico.',
          back: 'Torna alle classi',
          eyebrow: 'Agenda',
          title: 'Agenda salvata',
          lead: 'Qui trovi solo le lezioni con orario che hai salvato per pianificare la settimana.',
          empty: 'Nessuna lezione salvata in agenda. Aggiungila dalle card delle classi.'
        }
      : {
          signInNeeded: 'Sign in to save your personal schedule.',
          signIn: 'Sign in',
          unavailable: 'Saved schedule is temporarily unavailable. You can keep browsing the public calendar.',
          back: 'Back to classes',
          eyebrow: 'Schedule',
          title: 'Saved schedule',
          lead: 'This page only shows time slots you saved to plan your week.',
          empty: 'No classes saved in your schedule yet. Add them from class cards.'
        };

  if (capabilities.authMode === 'unavailable' || capabilities.storeMode !== 'database') {
    return (
      <div className="empty-state">
        <p>{copy.unavailable}</p>
        <ServerButtonLink href={`/${locale}/palermo/classes`} className="button-primary">
          {copy.back}
        </ServerButtonLink>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="empty-state">
        <p>{copy.signInNeeded}</p>
        <ServerButtonLink href={`/${locale}/sign-in`} className="button-primary">
          {copy.signIn}
        </ServerButtonLink>
      </div>
    );
  }

  let scheduleRows: string[] = [];

  try {
    scheduleRows = await listUserSchedule(user.id);
  } catch {
    return (
      <div className="empty-state">
        <p>{copy.unavailable}</p>
        <ServerButtonLink href={`/${locale}/palermo/classes`} className="button-primary">
          {copy.back}
        </ServerButtonLink>
      </div>
    );
  }
  const catalog = await getCatalogSnapshot();
  const sessionItems = catalog.sessions.map((session) => ({
    id: session.id,
    href: `/${locale}/${session.citySlug}/studios/${session.venueSlug}`,
    title: session.title[locale],
    meta: formatSessionTime(session.startAt, locale)
  }));

  return (
    <div className="stack-list">
      <section className="panel">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p className="lead">{copy.lead}</p>
      </section>

      <section className="panel">
        <SavedScheduleClient signedInEmail={user.email} initialScheduleIds={scheduleRows} sessions={sessionItems} emptyLabel={copy.empty} />
      </section>
    </div>
  );
}
