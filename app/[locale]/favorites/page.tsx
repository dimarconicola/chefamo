import { AuthShell } from '@/components/auth/AuthShell';
import { FavoritesCollectionsClient } from '@/components/state/FavoritesCollectionsClient';
import { ServerButtonLink, ServerChip } from '@/components/ui/server';
import { getSessionUser } from '@/lib/auth/session';
import { getCatalogSnapshot } from '@/lib/catalog/repository';
import { resolveLocale } from '@/lib/i18n/routing';
import { listUserFavorites, listUserSchedule } from '@/lib/runtime/store';
import { getRuntimeCapabilities } from '@/lib/runtime/capabilities';

export default async function FavoritesPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = resolveLocale((await params).locale);
  const [user, capabilities] = await Promise.all([getSessionUser(), getRuntimeCapabilities()]);
  const copy =
    locale === 'it'
      ? {
          signInNeeded: 'Accedi per ritrovare luoghi, organizzatori e programmi che hai deciso di seguire.',
          signIn: 'Accedi',
          unavailable: 'Preferiti e piano non sono disponibili in questo momento. Le pagine pubbliche restano consultabili.',
          back: 'Torna a Palermo',
          eyebrow: 'Salvati',
          title: 'Preferiti per scegliere con calma',
          lead: 'Tieni qui luoghi, organizzatori e programmi da confrontare. Il piano salvato resta separato per gli slot che vuoi davvero fare.',
          favoritesStudios: 'Luoghi da seguire',
          favoritesTeachers: 'Organizzatori da seguire',
          favoritesClasses: 'Programmi da confrontare',
          noFavorites: 'Nessun elemento salvato per ora.',
          noSchedule: 'Aggiungi attività dal calendario per costruire la tua settimana.',
          gateEyebrow: 'Ritrova ciò che conta',
          gateTitle: 'Qui tornano le scelte che vuoi seguire con calma',
          gateLead: 'Questa pagina tiene separato ciò che vuoi monitorare da ciò che vuoi davvero fare.',
          gateItems: [
            'Luoghi e organizzatori da seguire nel tempo.',
            'Programmi salvati per confronto rapido quando riapri l’app.',
            'Piano settimanale separato, senza mischiare contesti e orari.'
          ],
          gateChips: ['Segui luoghi', 'Segui organizzatori', 'Separa gli orari'],
          totalSaved: 'Elementi salvati',
          scheduleCount: 'Slot nel piano',
          schedulePanelEyebrow: 'Piano',
          schedulePanelTitle: 'Il tempo resta dall altra parte',
          schedulePanelLead: 'Quando un attività passa da idea a intenzione, salvala nel piano. Lì restano solo slot con giorno e ora.',
          openSchedule: 'Apri piano salvato'
        }
      : {
          signInNeeded: 'Sign in to revisit the places, organizers, and programs you decided to keep track of.',
          signIn: 'Sign in',
          unavailable: 'Favorites and saved plan are temporarily unavailable. Public pages are still available.',
          back: 'Back to Palermo',
          eyebrow: 'Saved',
          title: 'Favorites for calm comparison',
          lead: 'Keep places, organizers, and programs you want to compare here. Saved plan stays separate for the time slots you actually plan to attend.',
          favoritesStudios: 'Places to follow',
          favoritesTeachers: 'Organizers to follow',
          favoritesClasses: 'Programs to compare',
          noFavorites: 'No saved items yet.',
          noSchedule: 'Add activities from the calendar to build your week.',
          gateEyebrow: 'Keep the right things close',
          gateTitle: 'This page holds what you want to track, not just what you clicked',
          gateLead: 'Favorites and saved schedule solve two different jobs and stay separate here.',
          gateItems: [
            'Places and organizers you may want to revisit later.',
            'Programs saved for quick comparison when you come back.',
            'A weekly plan kept apart from people and places.'
          ],
          gateChips: ['Follow places', 'Follow organizers', 'Keep time slots separate'],
          totalSaved: 'Saved items',
          scheduleCount: 'Planned slots',
          schedulePanelEyebrow: 'Plan',
          schedulePanelTitle: 'Time stays on the other side',
          schedulePanelLead: 'When an activity moves from idea to intent, save it to plan. That page keeps only dated time slots.',
          openSchedule: 'Open saved plan'
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
            <ServerButtonLink href={`/${locale}/palermo`} className="button-primary">
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
            <ServerButtonLink href={`/${locale}/palermo`} className="button-ghost">
              {copy.back}
            </ServerButtonLink>
          </div>
        </div>
      </AuthShell>
    );
  }

  let favoriteRows = [];
  let scheduleRows: string[] = [];

  try {
    [favoriteRows, scheduleRows] = await Promise.all([listUserFavorites(user.id), listUserSchedule(user.id)]);
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
            <ServerButtonLink href={`/${locale}/palermo`} className="button-primary">
              {copy.back}
            </ServerButtonLink>
          </div>
        </div>
      </AuthShell>
    );
  }
  const catalog = await getCatalogSnapshot();

  const placeItems = catalog.places
    .map((place) => ({
      slug: place.slug,
      href: `/${locale}/${place.citySlug}/places/${place.slug}`,
      title: place.name,
      meta: place.tagline[locale]
    }));
  const organizerItems = catalog.organizers
    .map((organizer) => ({
      slug: organizer.slug,
      href: `/${locale}/${organizer.citySlug}/organizers/${organizer.slug}`,
      title: organizer.name,
      meta: organizer.shortBio[locale]
    }));
  const programItems = catalog.programs.map((program) => ({
    id: program.slug,
    href: `/${locale}/${program.citySlug}/places/${program.placeSlug}`,
    title: program.title[locale],
    meta: program.summary[locale]
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
              {copy.totalSaved}: {favoriteRows.length}
            </ServerChip>
            <ServerChip tone="meta">
              {copy.scheduleCount}: {scheduleRows.length}
            </ServerChip>
          </div>
        </div>
      </section>
      <FavoritesCollectionsClient
        signedInEmail={user.email}
        initialFavoriteKeys={favoriteRows.map((row) => `${row.entityType}:${row.entitySlug}`)}
        places={placeItems}
        organizers={organizerItems}
        programs={programItems}
        copy={copy}
      />
      <section className="panel saved-separation-panel">
        <p className="eyebrow">{copy.schedulePanelEyebrow}</p>
        <h2>{copy.schedulePanelTitle}</h2>
        <p className="lead">{copy.schedulePanelLead}</p>
        <div className="auth-shell-chips">
          <ServerChip tone="meta">
            {copy.scheduleCount}: {scheduleRows.length}
          </ServerChip>
        </div>
        <div className="site-actions">
          <ServerButtonLink href={`/${locale}/schedule`} className="button-primary">
            {copy.openSchedule}
          </ServerButtonLink>
        </div>
      </section>
    </div>
  );
}
