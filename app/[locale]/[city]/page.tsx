import { notFound } from 'next/navigation';

import { PlayfulIcon } from '@/components/brand/PlayfulIcon';
import { OccurrenceSpotlightCard } from '@/components/marketing/OccurrenceSpotlightCard';
import { DigestForm } from '@/components/forms/DigestForm';
import { ServerButtonLink, ServerCardLink, ServerLink } from '@/components/ui/server';
import { applyOccurrenceFilters } from '@/lib/catalog/filters';
import { getOccurrencePath } from '@/lib/catalog/occurrence-links';
import { getCatalogSnapshot } from '@/lib/catalog/repository';
import { resolveOccurrenceCardDataFromSnapshot } from '@/lib/catalog/session-card-data';
import { getCityMetrics, getLocaleLabel } from '@/lib/catalog/server-data';
import { resolveLocale } from '@/lib/i18n/routing';

const spotlightTones = ['red', 'blue', 'yellow'] as const;
const categoryTones = ['yellow', 'blue', 'green', 'red'] as const;

export default async function CityPage({ params }: { params: Promise<{ locale: string; city: string }> }) {
  const { locale: rawLocale, city: citySlug } = await params;
  const locale = resolveLocale(rawLocale);
  const [catalog, metrics] = await Promise.all([getCatalogSnapshot(), getCityMetrics(citySlug)]);

  const city = catalog.cities.find((item) => item.slug === citySlug);
  if (!city || city.status !== 'public') {
    notFound();
  }

  const categories = catalog.categories.filter((item) => item.citySlug === citySlug && item.visibility !== 'hidden');
  const neighborhoods = catalog.neighborhoods.filter((item) => item.citySlug === citySlug);
  const collections = catalog.collections.filter((item) => item.citySlug === citySlug);
  const organizers = catalog.organizers
    .filter((item) => item.citySlug === citySlug)
    .sort((left, right) => left.name.localeCompare(right.name, 'it', { sensitivity: 'base' }));
  const cityPlaces = catalog.places.filter((place) => place.citySlug === citySlug);

  const visibleCategorySlugs = new Set(categories.map((item) => item.slug));
  const visibleOccurrences = catalog.occurrences.filter(
    (occurrence) => occurrence.citySlug === citySlug && occurrence.verificationStatus !== 'hidden' && visibleCategorySlugs.has(occurrence.categorySlug)
  );
  const weekOccurrences = applyOccurrenceFilters(visibleOccurrences, { date: 'week' });
  const spotlightOccurrences = weekOccurrences.slice(0, 3);
  const resolvedSpotlights = resolveOccurrenceCardDataFromSnapshot(catalog, spotlightOccurrences);

  const copy =
    locale === 'it'
      ? {
          heroBadge: `${getLocaleLabel(locale, city.name)} family hub`,
          heroLead:
            'Una vista unica su attività con orari reali, luoghi utili anche senza slot, e organizzatori che meritano fiducia abbastanza da entrare nella giornata di una famiglia.',
          ctaPrimary: 'Esplora attività',
          ctaSecondary: 'Apri luoghi',
          cityPulse: 'Pulse Palermo',
          cityPulseTitle: 'Il mockup giocoso ora è il layer operativo della città.',
          cityPulseBody: 'Weekend forti, sport, piani pioggia, luoghi culturali, movimento e fallback calmi stanno nello stesso spazio senza confondersi.',
          statActivities: 'Attività nel catalogo',
          statPlaces: 'Luoghi verificati',
          statPrograms: 'Programmi',
          statNeighborhoods: 'Quartieri coperti',
          featuredEyebrow: 'Attività in evidenza',
          featuredTitle: 'Cose che valgono davvero questa settimana',
          featuredCta: 'Apri tutte le attività',
          categoryEyebrow: 'Categorie',
          categoryTitle: 'Scegli il tipo di giornata prima del singolo slot',
          neighborhoodEyebrow: 'Quartieri',
          neighborhoodTitle: 'Quando vuoi ridurre attrito, il quartiere conta',
          collectionEyebrow: 'Collezioni',
          collectionTitle: 'Flussi curati per arrivare più velocemente a una decisione',
          placesEyebrow: 'Luoghi',
          placesTitle: 'Musei, biblioteche, parchi e sedi che restano utili nel tempo',
          placesCta: 'Apri tutti i luoghi',
          organizersEyebrow: 'Organizzatori',
          organizersTitle: 'Chi rende davvero leggibile il panorama 0-14',
          organizersCta: 'Apri tutti gli organizzatori',
          newsletterEyebrow: 'Digest Palermo',
          newsletterTitle: 'Tieniti il tono giocoso, ma ricevi solo segnale utile.',
          newsletterBody:
            'Nuove attività, aperture affidabili, picks per pioggia e shortlist per il weekend. Nessun rumore, solo cose che possono finire davvero nel calendario.',
          newsletterChipOne: 'Zero rumore',
          newsletterChipTwo: 'Indoor quando serve',
          newsletterChipThree: 'Solo posti utili',
          emptyActivities: 'Stiamo preparando i prossimi slot verificati.'
        }
      : {
          heroBadge: `${getLocaleLabel(locale, city.name)} family hub`,
          heroLead:
            'One clear view across activities with real times, places that stay useful without a slot, and organizers trustworthy enough to enter a family plan.',
          ctaPrimary: 'Explore activities',
          ctaSecondary: 'Open places',
          cityPulse: 'Pulse Palermo',
          cityPulseTitle: 'The playful mockup is now the city operating layer.',
          cityPulseBody: 'Strong weekends, sports, rain plans, cultural places, movement, and calmer backups live in the same space without turning into noise.',
          statActivities: 'Activities in catalog',
          statPlaces: 'Verified places',
          statPrograms: 'Programs',
          statNeighborhoods: 'Neighborhoods covered',
          featuredEyebrow: 'Featured activities',
          featuredTitle: 'Things actually worth doing this week',
          featuredCta: 'Open all activities',
          categoryEyebrow: 'Categories',
          categoryTitle: 'Choose the type of day before chasing one slot',
          neighborhoodEyebrow: 'Neighborhoods',
          neighborhoodTitle: 'When you want less friction, neighborhood matters',
          collectionEyebrow: 'Collections',
          collectionTitle: 'Curated flows that get a family to a decision faster',
          placesEyebrow: 'Places',
          placesTitle: 'Museums, libraries, parks, and venues that stay useful over time',
          placesCta: 'Open all places',
          organizersEyebrow: 'Organizers',
          organizersTitle: 'Who actually makes the 0-14 layer readable',
          organizersCta: 'Open all organizers',
          newsletterEyebrow: 'Palermo digest',
          newsletterTitle: 'Keep the playful tone, receive only useful signal.',
          newsletterBody:
            'New activities, trustworthy openings, rainy-day picks, and weekend shortlists. No noise, only things that can genuinely make it into a family calendar.',
          newsletterChipOne: 'No noise',
          newsletterChipTwo: 'Indoor when needed',
          newsletterChipThree: 'Useful places only',
          emptyActivities: 'We are preparing the next verified slots.'
        };

  return (
    <div className="chefamo-page">
      <section className="chefamo-band chefamo-hero-band full-bleed">
        <div className="chefamo-shell chefamo-hero-grid chefamo-city-hero-grid">
          <div className="chefamo-hero-copy">
            <div className="chefamo-eyebrow-pill chefamo-tone-red">
              <PlayfulIcon name="pin" className="chefamo-inline-icon" />
              <span>{copy.heroBadge}</span>
            </div>
            <h1 className="chefamo-display-lg">{getLocaleLabel(locale, city.hero)}</h1>
            <p className="chefamo-lead">{copy.heroLead}</p>
            <div className="chefamo-action-row">
              <ServerButtonLink href={`/${locale}/${citySlug}/activities`} className="chefamo-cta chefamo-cta-primary">
                {copy.ctaPrimary}
                <PlayfulIcon name="arrow" className="chefamo-inline-icon" />
              </ServerButtonLink>
              <ServerButtonLink href={`/${locale}/${citySlug}/places`} className="chefamo-cta chefamo-cta-secondary">
                <PlayfulIcon name="map" className="chefamo-inline-icon" />
                {copy.ctaSecondary}
              </ServerButtonLink>
            </div>
          </div>

          <div className="chefamo-hero-stack">
            <article className="chefamo-play-card chefamo-city-overview-card">
              <p className="chefamo-card-kicker">{copy.cityPulse}</p>
              <h2>{copy.cityPulseTitle}</h2>
              <p className="chefamo-muted">{copy.cityPulseBody}</p>
              <div className="chefamo-stat-grid">
                <div className="chefamo-stat-tile chefamo-tone-red">
                  <strong>{metrics.programs}</strong>
                  <span>{copy.statActivities}</span>
                </div>
                <div className="chefamo-stat-tile chefamo-tone-blue">
                  <strong>{metrics.places}</strong>
                  <span>{copy.statPlaces}</span>
                </div>
                <div className="chefamo-stat-tile chefamo-tone-yellow">
                  <strong>{metrics.programs}</strong>
                  <span>{copy.statPrograms}</span>
                </div>
                <div className="chefamo-stat-tile chefamo-tone-green">
                  <strong>{metrics.neighborhoods}</strong>
                  <span>{copy.statNeighborhoods}</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="chefamo-shell chefamo-section-stack">
        <div className="chefamo-section-head">
          <div className="chefamo-section-intro">
            <p className="chefamo-section-eyebrow">{copy.featuredEyebrow}</p>
            <h2 className="chefamo-display-md">{copy.featuredTitle}</h2>
          </div>
          <ServerLink href={`/${locale}/${citySlug}/activities`} className="chefamo-inline-link">
            {copy.featuredCta}
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
                  href={getOccurrencePath(locale, citySlug, occurrence.id)}
                  tone={spotlightTones[index % spotlightTones.length]}
                />
              );
            })}
          </div>
        ) : (
          <div className="chefamo-empty-card">{copy.emptyActivities}</div>
        )}
      </section>

      <section className="chefamo-band chefamo-light-band full-bleed">
        <div className="chefamo-shell chefamo-triad-grid">
          <article className="chefamo-play-card">
            <p className="chefamo-section-eyebrow">{copy.categoryEyebrow}</p>
            <h2 className="chefamo-display-sm">{copy.categoryTitle}</h2>
            <div className="chefamo-link-grid">
              {categories.slice(0, 4).map((category, index) => (
                <ServerCardLink
                  key={category.slug}
                  href={`/${locale}/${citySlug}/categories/${category.slug}`}
                  className={`chefamo-mini-link-card chefamo-tone-${categoryTones[index % categoryTones.length]}`}
                >
                  <strong>{getLocaleLabel(locale, category.name)}</strong>
                  <span>{getLocaleLabel(locale, category.description)}</span>
                </ServerCardLink>
              ))}
            </div>
          </article>

          <article className="chefamo-play-card">
            <p className="chefamo-section-eyebrow">{copy.neighborhoodEyebrow}</p>
            <h2 className="chefamo-display-sm">{copy.neighborhoodTitle}</h2>
            <div className="chefamo-link-stack">
              {neighborhoods.slice(0, 4).map((item, index) => (
                <ServerCardLink
                  key={item.slug}
                  href={`/${locale}/${citySlug}/neighborhoods/${item.slug}`}
                  className={`chefamo-mini-link-card chefamo-tone-${categoryTones[index % categoryTones.length]}`}
                >
                  <strong>{getLocaleLabel(locale, item.name)}</strong>
                  <span>{getLocaleLabel(locale, item.description)}</span>
                </ServerCardLink>
              ))}
            </div>
          </article>

          <article className="chefamo-play-card">
            <p className="chefamo-section-eyebrow">{copy.collectionEyebrow}</p>
            <h2 className="chefamo-display-sm">{copy.collectionTitle}</h2>
            <div className="chefamo-link-stack">
              {collections.slice(0, 4).map((collection, index) => (
                <ServerCardLink
                  key={collection.slug}
                  href={`/${locale}/${citySlug}/collections/${collection.slug}`}
                  className={`chefamo-mini-link-card chefamo-tone-${categoryTones[index % categoryTones.length]}`}
                >
                  <strong>{getLocaleLabel(locale, collection.title)}</strong>
                  <span>{getLocaleLabel(locale, collection.description)}</span>
                </ServerCardLink>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="chefamo-shell chefamo-split-section">
        <article className="chefamo-play-card">
          <div className="chefamo-section-head">
            <div className="chefamo-section-intro">
              <p className="chefamo-section-eyebrow">{copy.placesEyebrow}</p>
              <h2 className="chefamo-display-sm">{copy.placesTitle}</h2>
            </div>
            <ServerLink href={`/${locale}/${citySlug}/places`} className="chefamo-inline-link">
              {copy.placesCta}
              <PlayfulIcon name="arrow" className="chefamo-inline-icon" />
            </ServerLink>
          </div>
          <div className="chefamo-link-grid">
            {cityPlaces.slice(0, 4).map((place, index) => (
              <ServerCardLink
                key={place.slug}
                href={`/${locale}/${citySlug}/places/${place.slug}`}
                className={`chefamo-mini-link-card chefamo-tone-${categoryTones[index % categoryTones.length]}`}
              >
                <strong>{place.name}</strong>
                <span>{place.tagline[locale]}</span>
              </ServerCardLink>
            ))}
          </div>
        </article>

        <article className="chefamo-play-card">
          <div className="chefamo-section-head">
            <div className="chefamo-section-intro">
              <p className="chefamo-section-eyebrow">{copy.organizersEyebrow}</p>
              <h2 className="chefamo-display-sm">{copy.organizersTitle}</h2>
            </div>
            <ServerLink href={`/${locale}/${citySlug}/organizers`} className="chefamo-inline-link">
              {copy.organizersCta}
              <PlayfulIcon name="arrow" className="chefamo-inline-icon" />
            </ServerLink>
          </div>
          <div className="chefamo-link-grid">
            {organizers.slice(0, 4).map((organizer, index) => (
              <ServerCardLink
                key={organizer.slug}
                href={`/${locale}/${citySlug}/organizers/${organizer.slug}`}
                className={`chefamo-mini-link-card chefamo-tone-${categoryTones[index % categoryTones.length]}`}
              >
                <strong>{organizer.name}</strong>
                <span>{organizer.shortBio[locale]}</span>
              </ServerCardLink>
            ))}
          </div>
        </article>
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
          <DigestForm citySlug={citySlug} locale={locale} surface="plain" showIntro={false} compact className="chefamo-newsletter-form" />
        </div>
      </section>
    </div>
  );
}
