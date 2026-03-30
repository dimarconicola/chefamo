import { AuthShell } from '@/components/auth/AuthShell';
import { SavedScheduleClient } from '@/components/state/SavedScheduleClient';
import { ServerButtonLink, ServerChip } from '@/components/ui/server';
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
          signInNeeded: 'Accedi per tenere insieme solo le attivita con giorno e ora che vuoi davvero fare.',
          signIn: 'Accedi',
          unavailable: 'Il piano salvato non è disponibile in questo momento. Continua pure a esplorare le attivita pubbliche.',
          back: 'Torna alle attivita',
          eyebrow: 'Piano',
          title: 'La tua settimana, gia filtrata',
          lead: 'Qui trovi solo gli slot che hai salvato per pianificare la settimana senza rumore.',
          empty: 'Nessuna attivita salvata nel piano. Aggiungila dalle card delle attivita.',
          gateEyebrow: 'Blocca gli orari giusti',
          gateTitle: 'Il piano serve a fissare il tempo, non i preferiti.',
          gateLead: 'Qui restano solo gli slot che vuoi davvero fare, separati da luoghi, organizzatori e programmi che segui.',
          gateItems: [
            'Solo attivita con giorno e orario, nessuna lista confusa di luoghi.',
            'Una vista rapida della settimana da rivedere prima di decidere.',
            'Lo stesso calendario pubblico, ma con un livello personale sopra.'
          ],
          gateChips: ['Solo orari', 'Settimana personale', 'Nessun rumore'],
          scheduleCount: 'Slot nel piano'
        }
      : {
          signInNeeded: 'Sign in to keep only the dated activities you actually want to do together.',
          signIn: 'Sign in',
          unavailable: 'Saved plan is temporarily unavailable. You can keep browsing public activities.',
          back: 'Back to activities',
          eyebrow: 'Plan',
          title: 'Your week, already filtered',
          lead: 'This page only shows the dated slots you saved so your week stays focused.',
          empty: 'No activities saved to your plan yet. Add them from activity cards.',
          gateEyebrow: 'Hold on to the right time slots',
          gateTitle: 'Plan is for time, not generic favorites',
          gateLead: 'Keep the dated slots you actually want to do separate from the places, organizers, and programs you follow.',
          gateItems: [
            'Only activities with day and time, not a mixed list of entities.',
            'A quick weekly view to revisit before you decide.',
            'The same public calendar, with a personal layer on top.'
          ],
          gateChips: ['Only time slots', 'Personal week', 'No noise'],
          scheduleCount: 'Planned slots'
        };

  if (capabilities.authMode === 'unavailable' || capabilities.storeMode !== 'database') {
    return (
      <AuthShell
        eyebrow={copy.gateEyebrow}
        title={copy.gateTitle}
        lead={copy.unavailable}
        sideEyebrow={copy.eyebrow}
        sideTitle={copy.title}
        sideLead={copy.gateLead}
        sideItems={copy.gateItems}
        chips={copy.gateChips}
      >
        <div className="auth-status-card">
          <p className="lead">{copy.unavailable}</p>
          <div className="site-actions">
            <ServerButtonLink href={`/${locale}/palermo/activities`} className="button-primary">
              {copy.back}
            </ServerButtonLink>
          </div>
        </div>
      </AuthShell>
    );
  }

  if (!user) {
    return (
      <AuthShell
        eyebrow={copy.gateEyebrow}
        title={copy.gateTitle}
        lead={copy.signInNeeded}
        sideEyebrow={copy.eyebrow}
        sideTitle={copy.title}
        sideLead={copy.gateLead}
        sideItems={copy.gateItems}
        chips={copy.gateChips}
      >
        <div className="auth-status-card">
          <p className="lead">{copy.signInNeeded}</p>
          <div className="site-actions">
            <ServerButtonLink href={`/${locale}/sign-in`} className="button-primary">
              {copy.signIn}
            </ServerButtonLink>
            <ServerButtonLink href={`/${locale}/palermo/activities`} className="button-ghost">
              {copy.back}
            </ServerButtonLink>
          </div>
        </div>
      </AuthShell>
    );
  }

  let scheduleRows: string[] = [];

  try {
    scheduleRows = await listUserSchedule(user.id);
  } catch {
    return (
      <AuthShell
        eyebrow={copy.gateEyebrow}
        title={copy.gateTitle}
        lead={copy.unavailable}
        sideEyebrow={copy.eyebrow}
        sideTitle={copy.title}
        sideLead={copy.gateLead}
        sideItems={copy.gateItems}
        chips={copy.gateChips}
      >
        <div className="auth-status-card">
          <p className="lead">{copy.unavailable}</p>
          <div className="site-actions">
            <ServerButtonLink href={`/${locale}/palermo/activities`} className="button-primary">
              {copy.back}
            </ServerButtonLink>
          </div>
        </div>
      </AuthShell>
    );
  }
  const catalog = await getCatalogSnapshot();
  const occurrenceItems = catalog.occurrences.map((occurrence) => ({
    id: occurrence.id,
    href: `/${locale}/${occurrence.citySlug}/places/${occurrence.placeSlug ?? occurrence.venueSlug}`,
    title: occurrence.title[locale],
    meta: formatSessionTime(occurrence.startAt, locale)
  }));

  return (
    <div className="stack-list">
      <section className="panel saved-summary-panel">
        <div className="saved-summary-copy">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p className="lead">{copy.lead}</p>
          <div className="auth-shell-chips">
            <ServerChip tone="meta">
              {copy.scheduleCount}: {scheduleRows.length}
            </ServerChip>
          </div>
        </div>
      </section>

      <section className="panel">
        <SavedScheduleClient signedInEmail={user.email} initialScheduleIds={scheduleRows} occurrences={occurrenceItems} emptyLabel={copy.empty} />
      </section>
    </div>
  );
}
