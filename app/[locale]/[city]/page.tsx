import { DateTime } from 'luxon';
import { notFound } from 'next/navigation';

import { PlayfulIcon } from '@/components/brand/PlayfulIcon';
import { DigestForm } from '@/components/forms/DigestForm';
import { LoopVideo } from '@/components/media/LoopVideo';
import { SessionCard } from '@/components/discovery/SessionCard';
import { StatCard } from '@/components/admin/StatCard';
import { ServerButtonLink, ServerCardLink, ServerLink } from '@/components/ui/server';
import { getSessionUser } from '@/lib/auth/session';
import { applyPublicCityFilters, getPublicCitySnapshot } from '@/lib/catalog/public-read-models';
import { resolveOccurrenceCardDataFromSnapshot } from '@/lib/catalog/session-card-data';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { resolveLocale } from '@/lib/i18n/routing';
import { getRuntimeCapabilities } from '@/lib/runtime/capabilities';
import { publicVideos } from '@/lib/media/public-videos';

export default async function CityPage({ params }: { params: Promise<{ locale: string; city: string }> }) {
  const { locale: rawLocale, city: citySlug } = await params;
  const locale = resolveLocale(rawLocale);
  const dict = getDictionary(locale);
  const snapshot = await getPublicCitySnapshot(citySlug);

  if (!snapshot) notFound();

  const categories = snapshot.categories;
  const neighborhoods = snapshot.neighborhoods;
  const collections = snapshot.collections;
  const cityPlaces = snapshot.places;
  const organizers = snapshot.organizers;
  const featuredOccurrences = applyPublicCityFilters(snapshot, { date: 'week' }).slice(0, 4);
  const resolvedFeaturedOccurrences = resolveOccurrenceCardDataFromSnapshot(snapshot, featuredOccurrences);
  const placeSummaryBySlug = new Map(snapshot.placeSummaries.map((summary) => [summary.placeSlug, summary] as const));
  const organizerSummaryBySlug = new Map(snapshot.organizerSummaries.map((summary) => [summary.organizerSlug, summary] as const));
  const metrics = snapshot.metrics;

  const [user, runtimeCapabilities] = await Promise.all([getSessionUser(), getRuntimeCapabilities()]);

  const copy =
    locale === 'it'
      ? {
          weeklyActivities: 'Programmi attivi',
          weeklyActivitiesDetail: 'Nel catalogo',
          openActivities: 'Esplora attività',
          places: 'Luoghi',
          placesDetail: 'Verificati a Palermo.',
          organizers: 'Organizzatori',
          organizersDetail: 'Persone dietro le attività.',
          neighborhoods: 'Quartieri coperti',
          neighborhoodsDetail: 'Zone utili già in guida.',
          featured: 'Attivita in evidenza',
          featuredTitle: 'Utili oggi.',
          fullCalendar: 'Apri calendario completo',
          categories: 'Categorie',
          neighborhoodsSection: 'Quartieri',
          collections: 'Collezioni',
          placesSection: 'Luoghi',
          placesTitle: 'Dove andare quando serve un posto giusto.',
          placesLead: 'Musei, biblioteche, parchi e luoghi tranquilli con contesto chiaro.',
          openPlaces: 'Apri elenco completo',
          organizersSection: 'Organizzatori',
          organizersTitle: 'Le persone dietro le attività.',
          organizersLead: 'Persone, non solo slot.',
          openOrganizers: 'Apri elenco completo',
          motionEyebrow: 'Dal tappetino alla città',
          motionTitle: 'Una città che si muove in tanti registri',
          motionBody: 'Spazi culturali, movimento, lettura e piani indoor convivono nello stesso flusso. Persone, non solo slot.',
          movementCta: 'Apri tutte le attività'
        }
      : {
          weeklyActivities: 'Active activities',
          weeklyActivitiesDetail: 'In the catalog',
          openActivities: 'Explore activities',
          places: 'Places',
          placesDetail: 'Verified for Palermo.',
          organizers: 'Organizers',
          organizersDetail: 'People behind the activities.',
          neighborhoods: 'Neighborhoods covered',
          neighborhoodsDetail: 'Areas already useful in the guide.',
          featured: 'Featured activities',
          featuredTitle: 'Useful now, not someday.',
          fullCalendar: 'See full calendar',
          categories: 'Categories',
          neighborhoodsSection: 'Neighborhoods',
          collections: 'Collections',
          placesSection: 'Places',
          placesTitle: 'Where to go when you need the right place.',
          placesLead: 'Museums, libraries, parks, and quieter places with clear context.',
          openPlaces: 'Open full directory',
          organizersSection: 'Organizers',
          organizersTitle: 'The people behind the activities.',
          organizersLead: 'People, not just slots.',
          openOrganizers: 'Open full directory',
          motionEyebrow: 'From mat to city',
          motionTitle: 'One city, many tempos',
          motionBody: 'Cultural spaces, movement, reading, and indoor backup plans all live in the same flow.',
          movementCta: 'Open all activities'
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

  const formatNextOccurrence = (iso?: string) => {
    if (!iso) return null;
    return DateTime.fromISO(iso)
      .setZone('Europe/Rome')
      .toFormat(locale === 'it' ? 'ccc d LLL · HH:mm' : 'ccc d LLL · HH:mm');
  };

  return (
    <div className="stack-list city-page">
      <section className="city-hero city-hero-refresh">
        <div className="hero-copy city-hero-main">
          <p className="eyebrow">{snapshot.city.name[locale]}</p>
          <h1>{snapshot.city.hero[locale]}</h1>
          <p>{dict.browseWithoutSignup}</p>
          <div className="site-actions">
            <ServerButtonLink href={`/${locale}/${citySlug}/activities`} className="button-primary">
              {copy.openActivities}
            </ServerButtonLink>
            <ServerButtonLink href={`/${locale}/${citySlug}/collections/today-nearby`} className="button-ghost">
              {dict.todayNearby}
            </ServerButtonLink>
          </div>
        </div>
        <div className="hero-copy city-hero-metrics">
          <div className="hero-metrics">
            <StatCard label={copy.weeklyActivities} value={String(metrics.programs)} detail={copy.weeklyActivitiesDetail} detailClassName="stat-card-detail-subtle" />
            <StatCard label={copy.places} value={String(metrics.places)} detail={copy.placesDetail} />
            <StatCard label={copy.organizers} value={String(metrics.organizers)} detail={copy.organizersDetail} />
            <StatCard label={copy.neighborhoods} value={String(metrics.neighborhoods)} detail={copy.neighborhoodsDetail} />

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

      <section className="detail-hero city-detail-grid">
        <div className="panel">
          <div className="detail-header">
            <div>
              <p className="eyebrow">{copy.featured}</p>
              <h2>{copy.featuredTitle}</h2>
            </div>
            <ServerLink href={`/${locale}/${citySlug}/activities`} className="inline-link">
              {copy.fullCalendar}
            </ServerLink>
          </div>
          <div className="stack-list">
            {featuredOccurrences.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                locale={locale}
                resolved={resolvedFeaturedOccurrences.get(session.id)!}
                signedInEmail={user?.email}
                scheduleLabel={dict.saveSchedule}
                runtimeCapabilities={runtimeCapabilities}
              />
            ))}
          </div>
        </div>

        <div className="stack-list">
          <div className="panel city-motion-panel">
            <div className="city-motion-copy">
              <p className="eyebrow">{copy.motionEyebrow}</p>
              <h2>{copy.motionTitle}</h2>
              <p className="muted">{copy.motionBody}</p>
              <ServerLink href={`/${locale}/${citySlug}/activities`} className="inline-link">
                {copy.movementCta}
                <PlayfulIcon name="arrow" className="chefamo-inline-icon" />
              </ServerLink>
            </div>
            <div className="city-motion-grid" aria-hidden="true">
              <div className="city-motion-media city-motion-media-tall">
                <LoopVideo asset={publicVideos.stretching} label="Stretching class" className="city-motion-video" />
              </div>
              <div className="city-motion-media">
                <LoopVideo asset={publicVideos.aerial} label="Aerial practice" className="city-motion-video" />
              </div>
            </div>
          </div>

          <div className="panel">
            <p className="eyebrow">{copy.categories}</p>
            <div className="card-grid">
              {categories.map((category) => (
                <ServerCardLink key={category.slug} href={`/${locale}/${citySlug}/categories/${category.slug}`} className="collection-card">
                  <strong>{category.name[locale]}</strong>
                  <span className="muted">{category.description[locale]}</span>
                </ServerCardLink>
              ))}
            </div>
          </div>

          <div className="panel">
            <p className="eyebrow">{copy.neighborhoodsSection}</p>
            <div className="card-grid">
              {neighborhoods.map((item) => (
                <ServerCardLink key={item.slug} href={`/${locale}/${citySlug}/neighborhoods/${item.slug}`} className="collection-card">
                  <strong>{item.name[locale]}</strong>
                  <span className="muted">{item.description[locale]}</span>
                </ServerCardLink>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="detail-header">
              <div>
                <p className="eyebrow">{copy.placesSection}</p>
                <h2>{copy.placesTitle}</h2>
                <p className="muted">{copy.placesLead}</p>
              </div>
              <ServerLink href={`/${locale}/${citySlug}/places`} className="inline-link">
                {copy.openPlaces}
              </ServerLink>
            </div>
            <div className="card-grid">
              {cityPlaces.slice(0, 4).map((place) => {
                const summary = placeSummaryBySlug.get(place.slug);
                return (
                  <ServerCardLink key={place.slug} href={`/${locale}/${citySlug}/places/${place.slug}`} className="collection-card">
                    <strong>{place.name}</strong>
                    <span className="muted">{place.tagline[locale]}</span>
                    <span className="muted">
                      {summary?.occurrenceCount ?? 0} {locale === 'it' ? 'attività' : 'activities'}
                      {summary?.nextOccurrenceStartAt ? ` · ${formatNextOccurrence(summary.nextOccurrenceStartAt)}` : ''}
                    </span>
                  </ServerCardLink>
                );
              })}
            </div>
          </div>

          <div className="panel">
            <div className="detail-header">
              <div>
                <p className="eyebrow">{copy.organizersSection}</p>
                <h2>{copy.organizersTitle}</h2>
                <p className="muted">{copy.organizersLead}</p>
              </div>
              <ServerLink href={`/${locale}/${citySlug}/organizers`} className="inline-link">
                {copy.openOrganizers}
              </ServerLink>
            </div>
            <div className="card-grid">
              {organizers.slice(0, 4).map((organizer) => {
                const summary = organizerSummaryBySlug.get(organizer.slug);
                return (
                  <ServerCardLink key={organizer.slug} href={`/${locale}/${citySlug}/organizers/${organizer.slug}`} className="collection-card">
                    <strong>{organizer.name}</strong>
                    <span className="muted">{organizer.shortBio[locale]}</span>
                    <span className="muted">
                      {summary?.occurrenceCount ?? 0} {locale === 'it' ? 'attività' : 'activities'}
                      {summary?.nextOccurrenceStartAt ? ` · ${formatNextOccurrence(summary.nextOccurrenceStartAt)}` : ''}
                    </span>
                  </ServerCardLink>
                );
              })}
            </div>
          </div>

          <div className="panel">
            <p className="eyebrow">{copy.collections}</p>
            <div className="stack-list">
              {collections.map((collection) => (
                <ServerCardLink key={collection.slug} href={`/${locale}/${citySlug}/collections/${collection.slug}`} className="collection-card">
                  <strong>{collection.title[locale]}</strong>
                  <span className="muted">{collection.description[locale]}</span>
                </ServerCardLink>
              ))}
            </div>
          </div>

          <DigestForm citySlug={citySlug} locale={locale} />
        </div>
      </section>
    </div>
  );
}
