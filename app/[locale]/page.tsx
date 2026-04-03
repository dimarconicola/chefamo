import { DateTime } from 'luxon';

import { PlayfulIcon } from '@/components/brand/PlayfulIcon';
import { OccurrenceSpotlightCard } from '@/components/marketing/OccurrenceSpotlightCard';
import { DigestForm } from '@/components/forms/DigestForm';
import { ServerButtonLink, ServerCardLink, ServerLink } from '@/components/ui/server';
import { getOccurrencePath } from '@/lib/catalog/occurrence-links';
import { getCatalogSnapshot } from '@/lib/catalog/repository';
import { resolveOccurrenceCardDataFromSnapshot } from '@/lib/catalog/session-card-data';
import { getCityMetrics, getFeaturedOccurrences, getLocaleLabel } from '@/lib/catalog/server-data';
import { resolveLocale } from '@/lib/i18n/routing';

const collectionTones = ['yellow', 'blue', 'red'] as const;
const spotlightTones = ['red', 'blue', 'yellow'] as const;

export default async function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
  const locale = resolveLocale((await params).locale);
  const [metrics, featuredOccurrences, catalog] = await Promise.all([getCityMetrics('palermo'), getFeaturedOccurrences('palermo'), getCatalogSnapshot()]);

  const spotlightOccurrences = featuredOccurrences.slice(0, 3);
  const resolvedSpotlights = resolveOccurrenceCardDataFromSnapshot(catalog, spotlightOccurrences);
  const featuredCollections = catalog.collections.filter((collection) => collection.citySlug === 'palermo').slice(0, 3);
  const cityHref = `/${locale}/palermo`;

  const copy =
    locale === 'it'
      ? {
          heroBadge: 'Palermo-first family activity guide',
          heroTitle: 'Chefamo rende leggibile il tempo libero in famiglia.',
          heroBody:
            'Chefamo prende il tono giocoso e rassicurante del nuovo concept e lo mette al servizio di cose vere: attività con orari reali, luoghi affidabili e organizzatori che pubblicano abbastanza bene da farti decidere senza aprire dieci tab.',
          ctaPrimary: 'Esplora attività',
          ctaSecondary: 'Apri Palermo hub',
          chipOne: '0-14 vero',
          chipTwo: 'Palermo-first',
          chipThree: 'Solo segnali utili',
          cityPanelEyebrow: 'Palermo Hub',
          cityPanelTitle: 'Una cabina di regia per weekend, doposcuola e piani pioggia.',
          liveNow: 'Nuovo questa settimana',
          liveNowFallback: 'Stiamo preparando i prossimi slot verificati.',
          featuresEyebrow: 'Perché è diverso',
          featuresTitle: 'Una guida famiglia, non un portale rumoroso',
          featuresBody: 'Il mockup diventa prodotto vero quando il tono caldo incontra filtri utili, età leggibili e posti affidabili.',
          weekEyebrow: 'Nuovo questa settimana',
          weekTitle: 'Programmi e slot con segnali freschi, non idee vaghe.',
          weekCta: 'Vedi tutte le attività',
          collectionsEyebrow: 'Dalla casa alla città',
          collectionsTitle: 'Una guida che aiuta a scegliere in fretta',
          collectionsBody: 'Età, quartiere, ritmo e fallback lavorano insieme. La UI resta amichevole, ma la struttura ti porta davvero alla decisione.',
          newsletterEyebrow: 'Ricevi solo idee utili per la settimana',
          newsletterTitle: 'Aggiornamenti mirati, non spam.',
          newsletterBody:
            'Nuove attività, weekend forti, luoghi indoor quando piove e selezioni curate per Palermo. Ti scriviamo solo quando c è davvero qualcosa di buono da fare.',
          newsletterChipOne: 'Zero rumore',
          newsletterChipTwo: 'Piani pioggia',
          newsletterChipThree: 'Weekend forti',
          stats: {
            activities: 'Attività',
            places: 'Luoghi',
            neighborhoods: 'Quartieri',
            formats: 'Formati'
          },
          features: [
            {
              icon: 'map' as const,
              tone: 'blue',
              title: 'Sport, weekend culturali, laboratori, coding',
              description: 'Non solo cosa fare, ma dove ha senso andare con quella fascia d eta e con quel livello di energia.'
            },
            {
              icon: 'calendar' as const,
              tone: 'yellow',
              title: 'Le attività con orario chiaro finiscono in evidenza',
              description: 'Il resto resta luogo o programma. Nessuna finzione di precisione quando il dato non è abbastanza buono.'
            },
            {
              icon: 'spark' as const,
              tone: 'green',
              title: 'Età leggibili e filtri utili',
              description: 'Sport, musei, letture, planetario, coding, circo e luoghi tranquilli convivono nello stesso flusso senza diventare caos.'
            },
            {
              icon: 'cloud' as const,
              tone: 'red',
              title: 'Trova sempre un piano B sensato',
              description: 'Anche quando non c è uno slot perfetto, puoi comunque arrivare a un luogo giusto per quella giornata.'
            }
          ]
        }
      : {
          heroBadge: 'Palermo-first family activity guide',
          heroTitle: 'Chefamo makes family free time readable.',
          heroBody:
            'Chefamo takes the playful, reassuring UI concept and puts it to work on real discovery: activities with actual times, trustworthy places, and organizers clear enough to help you decide without opening ten tabs.',
          ctaPrimary: 'Explore activities',
          ctaSecondary: 'Open Palermo hub',
          chipOne: 'True 0-14 focus',
          chipTwo: 'Palermo-first',
          chipThree: 'Useful signal only',
          cityPanelEyebrow: 'Palermo Hub',
          cityPanelTitle: 'A control room for weekends, after-school windows, and rainy-day backups.',
          liveNow: 'New this week',
          liveNowFallback: 'We are preparing the next verified slots.',
          featuresEyebrow: 'Why it is different',
          featuresTitle: 'A family guide, not a noisy portal',
          featuresBody: 'The mockup becomes a real product when the warm tone meets useful filters, readable ages, and trustworthy places.',
          weekEyebrow: 'New this week',
          weekTitle: 'Programs and slots with fresh signals, not vague ideas.',
          weekCta: 'See all activities',
          collectionsEyebrow: 'From home to city',
          collectionsTitle: 'A guide built for fast decisions',
          collectionsBody: 'Age fit, neighborhood, rhythm, and fallback options work together. The UI stays friendly, but the structure still gets a family to a decision.',
          newsletterEyebrow: 'Get only useful ideas for the week',
          newsletterTitle: 'Targeted updates, not spam.',
          newsletterBody:
            'New activities, strong weekends, indoor backups when it rains, and curated Palermo picks. We only write when there is something genuinely worth doing.',
          newsletterChipOne: 'No noise',
          newsletterChipTwo: 'Rain plans',
          newsletterChipThree: 'Strong weekends',
          stats: {
            activities: 'Activities',
            places: 'Places',
            neighborhoods: 'Neighborhoods',
            formats: 'Formats'
          },
          features: [
            {
              icon: 'map' as const,
              tone: 'blue',
              title: 'Sports, culture weekends, labs, coding',
              description: 'Not just what to do, but where it makes sense to go for that age band and energy level.'
            },
            {
              icon: 'calendar' as const,
              tone: 'yellow',
              title: 'Anything with clear timing gets the spotlight',
              description: 'Everything else stays a place or a program. No fake precision when the data is not strong enough.'
            },
            {
              icon: 'spark' as const,
              tone: 'green',
              title: 'Readable ages and useful filters',
              description: 'Sports, museums, reading, planetarium, coding, circus, and calmer places live in one flow without turning into noise.'
            },
            {
              icon: 'cloud' as const,
              tone: 'red',
              title: 'There is always a sensible backup plan',
              description: 'Even when there is no perfect slot, you can still reach the right place for that day.'
            }
          ]
        };

  return (
    <div className="chefamo-page">
      <section className="chefamo-band chefamo-hero-band full-bleed">
        <div className="chefamo-shell chefamo-hero-grid">
          <div className="chefamo-hero-copy">
            <div className="chefamo-eyebrow-pill chefamo-tone-green">
              <PlayfulIcon name="spark" className="chefamo-inline-icon" />
              <span>{copy.heroBadge}</span>
            </div>
            <h1 className="chefamo-display-lg">{copy.heroTitle}</h1>
            <p className="chefamo-lead">{copy.heroBody}</p>
            <div className="chefamo-action-row">
              <ServerButtonLink href={`${cityHref}/activities`} className="chefamo-cta chefamo-cta-primary">
                {copy.ctaPrimary}
                <PlayfulIcon name="arrow" className="chefamo-inline-icon" />
              </ServerButtonLink>
              <ServerButtonLink href={cityHref} className="chefamo-cta chefamo-cta-secondary">
                <PlayfulIcon name="pin" className="chefamo-inline-icon" />
                {copy.ctaSecondary}
              </ServerButtonLink>
            </div>
            <div className="chefamo-chip-row">
              <span className="chefamo-chip chefamo-chip-yellow">{copy.chipOne}</span>
              <span className="chefamo-chip chefamo-chip-red">{copy.chipTwo}</span>
              <span className="chefamo-chip chefamo-chip-blue">{copy.chipThree}</span>
            </div>
          </div>

          <div className="chefamo-hero-stack">
            <article className="chefamo-play-card chefamo-city-overview-card">
              <p className="chefamo-card-kicker">{copy.cityPanelEyebrow}</p>
              <h2>{copy.cityPanelTitle}</h2>
              <div className="chefamo-stat-grid">
                <div className="chefamo-stat-tile chefamo-tone-red">
                  <strong>{metrics.sessions}</strong>
                  <span>{copy.stats.activities}</span>
                </div>
                <div className="chefamo-stat-tile chefamo-tone-blue">
                  <strong>{metrics.places}</strong>
                  <span>{copy.stats.places}</span>
                </div>
                <div className="chefamo-stat-tile chefamo-tone-yellow">
                  <strong>{metrics.neighborhoods}</strong>
                  <span>{copy.stats.neighborhoods}</span>
                </div>
                <div className="chefamo-stat-tile chefamo-tone-green">
                  <strong>{metrics.styles}</strong>
                  <span>{copy.stats.formats}</span>
                </div>
              </div>
            </article>

            <article className="chefamo-play-card chefamo-live-card">
              <div className="chefamo-card-head">
                <div>
                  <p className="chefamo-card-kicker">{copy.liveNow}</p>
                  <h3>{spotlightOccurrences[0]?.title[locale] ?? copy.liveNowFallback}</h3>
                </div>
                <span className="chefamo-badge chefamo-tone-yellow">{DateTime.now().setZone('Europe/Rome').toFormat(locale === 'it' ? 'LLL' : 'LLL')}</span>
              </div>
              {spotlightOccurrences[0] ? (
                <div className="chefamo-mini-activity-list">
                  <div className="chefamo-mini-activity-row">
                    <PlayfulIcon name="calendar" className="chefamo-inline-icon" />
                    <span>{DateTime.fromISO(spotlightOccurrences[0].startAt).setZone('Europe/Rome').toFormat(locale === 'it' ? 'ccc d LLL · HH:mm' : 'ccc LLL d · HH:mm')}</span>
                  </div>
                  <div className="chefamo-mini-activity-row">
                    <PlayfulIcon name="pin" className="chefamo-inline-icon" />
                    <span>{resolvedSpotlights.get(spotlightOccurrences[0].id)?.place.name}</span>
                  </div>
                  <ServerLink href={`${cityHref}/activities`} className="chefamo-inline-link">
                    {copy.weekCta}
                    <PlayfulIcon name="arrow" className="chefamo-inline-icon" />
                  </ServerLink>
                </div>
              ) : (
                <p className="chefamo-muted">{copy.liveNowFallback}</p>
              )}
            </article>
          </div>
        </div>
      </section>

      <section className="chefamo-band chefamo-light-band full-bleed">
        <div className="chefamo-shell chefamo-section-stack">
          <div className="chefamo-section-intro chefamo-section-intro-center">
            <p className="chefamo-section-eyebrow">{copy.featuresEyebrow}</p>
            <h2 className="chefamo-display-md">{copy.featuresTitle}</h2>
            <p className="chefamo-muted">{copy.featuresBody}</p>
          </div>
          <div className="chefamo-feature-grid">
            {copy.features.map((feature) => (
              <article key={feature.title} className={`chefamo-feature-card chefamo-tone-${feature.tone}`}>
                <div className="chefamo-feature-icon">
                  <PlayfulIcon name={feature.icon} className="chefamo-inline-icon" />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="chefamo-shell chefamo-section-stack">
        <div className="chefamo-section-head">
          <div className="chefamo-section-intro">
            <p className="chefamo-section-eyebrow">{copy.weekEyebrow}</p>
            <h2 className="chefamo-display-md">{copy.weekTitle}</h2>
          </div>
          <ServerLink href={`${cityHref}/activities`} className="chefamo-inline-link">
            {copy.weekCta}
            <PlayfulIcon name="arrow" className="chefamo-inline-icon" />
          </ServerLink>
        </div>
        {spotlightOccurrences.length > 0 ? (
          <div className="chefamo-spotlight-grid">
            {spotlightOccurrences.map((occurrence, index) => {
              const resolved = resolvedSpotlights.get(occurrence.id);
              if (!resolved) return null;
              return (
                <OccurrenceSpotlightCard
                  key={occurrence.id}
                  occurrence={occurrence}
                  resolved={resolved}
                  locale={locale}
                  href={getOccurrencePath(locale, occurrence.citySlug, occurrence.id)}
                  tone={spotlightTones[index % spotlightTones.length]}
                />
              );
            })}
          </div>
        ) : (
          <div className="chefamo-empty-card">{copy.liveNowFallback}</div>
        )}
      </section>

      <section className="chefamo-band chefamo-white-band full-bleed">
        <div className="chefamo-shell chefamo-section-stack">
          <div className="chefamo-section-intro">
            <p className="chefamo-section-eyebrow">{copy.collectionsEyebrow}</p>
            <h2 className="chefamo-display-md">{copy.collectionsTitle}</h2>
            <p className="chefamo-muted">{copy.collectionsBody}</p>
          </div>
          <div className="chefamo-collection-grid">
            {featuredCollections.map((collection, index) => (
              <ServerCardLink
                key={collection.slug}
                href={`/${locale}/palermo/collections/${collection.slug}`}
                className={`chefamo-collection-card chefamo-tone-${collectionTones[index % collectionTones.length]}`}
              >
                <div className="chefamo-feature-icon">
                  <PlayfulIcon
                    name={index === 0 ? 'sun' : index === 1 ? 'rain' : 'pin'}
                    className="chefamo-inline-icon"
                  />
                </div>
                <h3>{getLocaleLabel(locale, collection.title)}</h3>
                <p>{getLocaleLabel(locale, collection.description)}</p>
                <span className="chefamo-card-link">
                  {locale === 'it' ? 'Apri collezione' : 'Open collection'}
                  <PlayfulIcon name="arrow" className="chefamo-inline-icon" />
                </span>
              </ServerCardLink>
            ))}
          </div>
        </div>
      </section>

      <section className="chefamo-shell chefamo-newsletter-section">
        <div className="chefamo-newsletter-card">
          <div className="chefamo-newsletter-stripe" aria-hidden="true" />
          <div className="chefamo-newsletter-icon">
            <PlayfulIcon name="spark" className="chefamo-inline-icon" />
          </div>
          <div className="chefamo-section-intro chefamo-section-intro-center">
            <p className="chefamo-section-eyebrow">{copy.newsletterEyebrow}</p>
            <h2 className="chefamo-display-md">{copy.newsletterTitle}</h2>
            <p className="chefamo-muted">{copy.newsletterBody}</p>
          </div>
          <div className="chefamo-chip-row chefamo-chip-row-center">
            <span className="chefamo-chip chefamo-chip-red">{copy.newsletterChipOne}</span>
            <span className="chefamo-chip chefamo-chip-yellow">{copy.newsletterChipTwo}</span>
            <span className="chefamo-chip chefamo-chip-green">{copy.newsletterChipThree}</span>
          </div>
          <DigestForm citySlug="palermo" locale={locale} surface="plain" compact className="chefamo-newsletter-form" />
        </div>
      </section>
    </div>
  );
}
