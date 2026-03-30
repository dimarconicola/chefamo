import { DateTime } from 'luxon';

import { DigestForm } from '@/components/forms/DigestForm';
import { ServerButtonLink, ServerCard, ServerCardLink, ServerChip, ServerLink } from '@/components/ui/server';
import { getCatalogSnapshot } from '@/lib/catalog/repository';
import { getCityMetrics, getFeaturedOccurrences, getPlace } from '@/lib/catalog/server-data';
import { resolveLocale } from '@/lib/i18n/routing';

type IconName = 'map' | 'calendar' | 'mail' | 'book' | 'spark' | 'sun';

function InlineIcon({ name }: { name: IconName }) {
  if (name === 'map') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 7.5 8.5 5l7 2.5L21 5v11.5l-5.5 2.5-7-2.5L3 19V7.5Z" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8.5 5v11.5m7-9V19" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }
  if (name === 'calendar') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3.5" y="5.5" width="17" height="15" rx="2.6" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8 3.5v4m8-4v4M3.5 9.5h17" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }
  if (name === 'mail') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3.5" y="5.5" width="17" height="13" rx="2.6" stroke="currentColor" strokeWidth="1.7" />
        <path d="m4.5 7 7.5 6 7.5-6" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }
  if (name === 'book') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 5.5h11a2 2 0 0 1 2 2v11H8a2 2 0 0 0-2 2V5.5Z" stroke="currentColor" strokeWidth="1.7" />
        <path d="M6 5.5a2 2 0 0 0-2 2v12.5h2" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }
  if (name === 'spark') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m12 3 1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3Z" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="5.2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 2.8v2.8M12 18.4v2.8M4.8 12h2.8m8.8 0h2.8" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export default async function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
  const locale = resolveLocale((await params).locale);
  const [metrics, featured, catalog] = await Promise.all([getCityMetrics('palermo'), getFeaturedOccurrences('palermo'), getCatalogSnapshot()]);
  const featuredPlaces = await Promise.all(featured.slice(0, 3).map((occurrence) => getPlace(occurrence.placeSlug)));

  const copy =
    locale === 'it'
      ? {
          heroBadge: 'Palermo 0-14',
          heroTitle: 'Chefamo rende leggibile il tempo libero in famiglia.',
          heroBody:
            'Attività con orari reali, luoghi affidabili e organizzatori che pubblicano abbastanza bene da farti decidere senza saltare tra dieci siti.',
          ctaPrimary: 'Esplora attività',
          ctaSecondary: 'Apri Palermo hub',
          featuresEyebrow: 'Perché è diverso',
          featuresTitle: 'Una guida famiglia, non un portale rumoroso',
          featuresBody:
            'Weekend culturali, laboratori, coding, letture, parchi e movimento: solo ciò che aiuta davvero a scegliere.',
          cityTitle: 'Palermo Hub',
          cityBody: 'La guida cittadina per attività 0-14 con segnali di fiducia leggibili.',
          classes: 'Attività',
          venues: 'Luoghi',
          neighborhoods: 'Quartieri',
          styles: 'Formati',
          viewDetails: 'Apri dettaglio',
          fullSchedule: 'Vedi tutte le attività',
          newsletterTitle: 'Ricevi solo idee utili per la settimana',
          newsletterBody:
            'Aggiornamenti mirati: nuove attività, weekend forti, luoghi indoor quando piove e selezioni curate per Palermo.',
          newsletterOne: 'Zero rumore',
          newsletterTwo: 'Solo segnali utili',
          motionEyebrow: 'Dalla casa alla città',
          motionTitle: 'Una guida che aiuta a scegliere in fretta',
          motionBody:
            'Non solo liste: età, ritmo, quartiere e contesto lavorano insieme per trasformare la ricerca in decisione.',
          weeklyArticles: 'Nuovo questa settimana',
          weeklyArticlesBody: 'Programmi e slot con segnali freschi, non idee vaghe.',
          noSpam: 'Niente spam',
          noSpamBody: 'Ti scriviamo solo quando c è davvero qualcosa di buono da fare.'
        }
      : {
          heroBadge: 'Palermo 0-14',
          heroTitle: 'Chefamo makes family free time readable.',
          heroBody:
            'Activities with real times, trustworthy places, and organizers that publish clearly enough for you to decide without bouncing across ten sites.',
          ctaPrimary: 'Explore activities',
          ctaSecondary: 'Open Palermo hub',
          featuresEyebrow: 'Why it is different',
          featuresTitle: 'A family guide, not a noisy portal',
          featuresBody:
            'Culture weekends, labs, coding, reading, parks, and movement: only what actually helps a family choose.',
          cityTitle: 'Palermo Hub',
          cityBody: 'The city guide for 0-14 activities with readable trust signals.',
          classes: 'Activities',
          venues: 'Places',
          neighborhoods: 'Neighborhoods',
          styles: 'Formats',
          viewDetails: 'View details',
          fullSchedule: 'View all activities',
          newsletterTitle: 'Get only useful ideas for the week.',
          newsletterBody:
            'Targeted updates: new activities, strong weekends, indoor backups when it rains, and curated Palermo picks.',
          newsletterOne: 'No noise',
          newsletterTwo: 'Useful signal only',
          motionEyebrow: 'From home to city',
          motionTitle: 'A guide built for fast family decisions',
          motionBody:
            'Not just lists: age fit, rhythm, neighborhood, and context work together so search becomes a decision.',
          weeklyArticles: 'New this week',
          weeklyArticlesBody: 'Programs and slots with fresh signals, not vague ideas.',
          noSpam: 'No spam',
          noSpamBody: 'We only write when there is something genuinely worth doing.'
        };

  const features = [
    {
      icon: 'map' as const,
      title: locale === 'it' ? 'Per quartiere e contesto' : 'By neighborhood and context',
      description:
        locale === 'it'
          ? 'Non solo cosa fare, ma dove ha senso andare con quella fascia d età.'
          : 'Not just what to do, but where it makes sense to go for that age band.'
    },
    {
      icon: 'calendar' as const,
      title: locale === 'it' ? 'Orari leggibili' : 'Readable timing',
      description:
        locale === 'it'
          ? 'Le attività con orario chiaro finiscono in evidenza. Il resto resta luogo o programma.'
          : 'Anything with a clear time gets highlighted. Everything else stays a place or a program.'
    },
    {
      icon: 'mail' as const,
      title: locale === 'it' ? 'Digest calibrato' : 'Calibrated digest',
      description:
        locale === 'it'
          ? 'Weekend, pioggia, doposcuola: selezioni utili invece di newsletter casuali.'
          : 'Weekend, rain plan, after-school: useful selections instead of random newsletters.'
    },
    {
      icon: 'book' as const,
      title: locale === 'it' ? 'Cultura + movimento' : 'Culture + movement',
      description:
        locale === 'it'
          ? 'Musei, letture, planetario, coding, circo e luoghi tranquilli convivono nello stesso flusso.'
          : 'Museums, reading, planetarium, coding, circus, and calm fallback places live in one flow.'
    },
    {
      icon: 'spark' as const,
      title: locale === 'it' ? '0-14 vero' : 'True 0-14 focus',
      description:
        locale === 'it'
          ? 'Età leggibili, filtri utili e niente dispersione su offerte che non servono davvero.'
          : 'Readable ages, useful filters, and no drift into offers that do not really fit.'
    },
    {
      icon: 'sun' as const,
      title: locale === 'it' ? 'Fallback intelligenti' : 'Smarter fallback picks',
      description:
        locale === 'it'
          ? 'Anche quando non c è uno slot, puoi comunque trovare un luogo giusto per la giornata.'
          : 'Even without a fixed slot, you can still find the right place for the day.'
    }
  ];

  const motionClips = [
    {
      title: locale === 'it' ? 'Cultura breve' : 'Short culture plan',
      body:
        locale === 'it'
          ? 'Visite, spettacoli e luoghi con ingresso leggibile per il weekend.'
          : 'Visits, shows, and places with readable entry points for the weekend.',
      icon: 'book' as const,
      tone: 'culture' as const
    },
    {
      title: locale === 'it' ? 'Fallback calmo' : 'Calm fallback',
      body:
        locale === 'it'
          ? 'Biblioteche, musei e luoghi indoor da usare quando serve abbassare il ritmo.'
          : 'Libraries, museums, and indoor places to use when the day needs a gentler pace.',
      icon: 'sun' as const,
      tone: 'quiet' as const
    },
    {
      title: locale === 'it' ? 'Energia guidata' : 'Guided energy',
      body:
        locale === 'it'
          ? 'Laboratori, coding e attività motorie con struttura chiara.'
          : 'Labs, coding, and movement formats with a clear structure.',
      icon: 'spark' as const,
      tone: 'energy' as const
    }
  ];

  return (
    <div className="home-v2">
      <section className="home-v2-hero">
        <div className="home-v2-shell">
          <div className="home-v2-hero-grid">
            <div className="home-v2-hero-copy">
              <div className="home-v2-badge">
                <InlineIcon name="map" />
                <span>{copy.heroBadge}</span>
              </div>
              <h1>{copy.heroTitle}</h1>
              <p>{copy.heroBody}</p>
              <div className="home-v2-hero-actions">
                <ServerButtonLink href={`/${locale}/palermo/activities`} className="home-v2-btn home-v2-btn-primary">
                  <span>{copy.ctaPrimary}</span>
                </ServerButtonLink>
                <ServerButtonLink href={`/${locale}/palermo`} className="home-v2-btn home-v2-btn-secondary">
                  <span>{copy.ctaSecondary}</span>
                </ServerButtonLink>
              </div>
              <div className="home-v2-feature-chips">
                <ServerChip tone="meta">{locale === 'it' ? '0-14' : '0-14'}</ServerChip>
                <ServerChip tone="meta">{locale === 'it' ? 'Palermo-first' : 'Palermo-first'}</ServerChip>
                <ServerChip tone="meta">{locale === 'it' ? 'Famiglie reali, non buyer personas' : 'Real families, not buyer personas'}</ServerChip>
              </div>
            </div>
            <div className="home-v2-hero-side">
              <ServerCard className="home-v2-city-card">
                <p className="eyebrow">{copy.cityTitle}</p>
                <h2>{copy.cityBody}</h2>
                <div className="home-v2-city-stats">
                  <div>
                    <strong>{metrics.sessions}</strong>
                    <span>{copy.classes}</span>
                  </div>
                  <div>
                    <strong>{metrics.venues}</strong>
                    <span>{copy.venues}</span>
                  </div>
                  <div>
                    <strong>{metrics.neighborhoods}</strong>
                    <span>{copy.neighborhoods}</span>
                  </div>
                  <div>
                    <strong>{metrics.styles}</strong>
                    <span>{copy.styles}</span>
                  </div>
                </div>
                <ServerButtonLink href={`/${locale}/palermo`} className="home-v2-btn home-v2-btn-secondary">
                  {copy.viewDetails}
                </ServerButtonLink>
              </ServerCard>
            </div>
          </div>
        </div>
      </section>

      <section className="home-v2-shell home-v2-features">
        <div>
          <p className="eyebrow">{copy.featuresEyebrow}</p>
          <h2>{copy.featuresTitle}</h2>
          <p className="muted">{copy.featuresBody}</p>
        </div>
        <div className="home-v2-features-grid">
          {features.map((feature) => (
            <ServerCard key={feature.title} className="home-v2-feature-card">
              <div className="home-v2-feature-icon">
                <InlineIcon name={feature.icon} />
              </div>
              <strong>{feature.title}</strong>
              <p className="muted">{feature.description}</p>
            </ServerCard>
          ))}
        </div>
      </section>

      <section className="home-v2-shell home-v2-city-preview">
        <div className="detail-header">
          <div>
            <p className="eyebrow">{copy.weeklyArticles}</p>
            <h2>{copy.weeklyArticlesBody}</h2>
          </div>
          <ServerLink href={`/${locale}/palermo/activities`} className="inline-link">
            {copy.fullSchedule}
          </ServerLink>
        </div>
        <div className="card-grid">
          {featured.slice(0, 3).map((occurrence, index) => {
            const place = featuredPlaces[index];
            return (
              <ServerCardLink key={occurrence.id} href={`/${locale}/${occurrence.citySlug}/places/${occurrence.placeSlug}`} className="collection-card">
                <strong>{occurrence.title[locale]}</strong>
                <span className="muted">
                  {place?.name ?? occurrence.placeSlug} · {DateTime.fromISO(occurrence.startAt).setZone('Europe/Rome').toFormat('ccc d LLL · HH:mm')}
                </span>
              </ServerCardLink>
            );
          })}
        </div>
      </section>

      <section className="home-v2-shell home-v2-motion">
        <div className="home-v2-motion-copy">
          <p className="eyebrow">{copy.motionEyebrow}</p>
          <h2>{copy.motionTitle}</h2>
          <p className="muted">{copy.motionBody}</p>
        </div>
        <div className="home-v2-motion-grid">
          {motionClips.map((clip) => (
            <ServerCard key={clip.title} className="home-v2-motion-card">
              <div className={`home-v2-illustration home-v2-illustration-${clip.tone}`}>
                <div className="home-v2-illustration-icon">
                  <InlineIcon name={clip.icon} />
                </div>
                <div className="home-v2-illustration-orb home-v2-illustration-orb-a" aria-hidden="true" />
                <div className="home-v2-illustration-orb home-v2-illustration-orb-b" aria-hidden="true" />
                <div className="home-v2-illustration-strip" aria-hidden="true" />
              </div>
              <strong>{clip.title}</strong>
              <p className="muted">{clip.body}</p>
            </ServerCard>
          ))}
        </div>
      </section>

      <section className="home-v2-shell home-v2-newsletter">
        <div>
          <p className="eyebrow">{copy.newsletterTitle}</p>
          <h2>{copy.newsletterBody}</h2>
          <div className="badge-row">
            <ServerChip tone="meta">{copy.newsletterOne}</ServerChip>
            <ServerChip tone="meta">{copy.newsletterTwo}</ServerChip>
            <ServerChip tone="meta">{copy.noSpam}</ServerChip>
          </div>
          <p className="muted">{copy.noSpamBody}</p>
        </div>
        <DigestForm citySlug="palermo" locale={locale} />
      </section>

      <section className="home-v2-shell home-v2-collections">
        <div className="card-grid">
          {catalog.collections
            .filter((collection) => collection.citySlug === 'palermo')
            .slice(0, 3)
            .map((collection) => (
              <ServerCardLink key={collection.slug} href={`/${locale}/palermo/collections/${collection.slug}`} className="collection-card">
                <strong>{collection.title[locale]}</strong>
                <span className="muted">{collection.description[locale]}</span>
              </ServerCardLink>
            ))}
        </div>
      </section>
    </div>
  );
}
