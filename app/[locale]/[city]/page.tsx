import { notFound } from 'next/navigation';

import { DigestForm } from '@/components/forms/DigestForm';
import { SessionCard } from '@/components/discovery/SessionCard';
import { StatCard } from '@/components/admin/StatCard';
import { ServerButtonLink, ServerCardLink, ServerLink } from '@/components/ui/server';
import { getSessionUser } from '@/lib/auth/session';
import { applyOccurrenceFilters } from '@/lib/catalog/filters';
import { getCatalogSnapshot } from '@/lib/catalog/repository';
import { resolveOccurrenceCardDataFromSnapshot } from '@/lib/catalog/session-card-data';
import { getLocaleLabel } from '@/lib/catalog/server-data';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { resolveLocale } from '@/lib/i18n/routing';
import { getRuntimeCapabilities } from '@/lib/runtime/capabilities';

export default async function CityPage({ params }: { params: Promise<{ locale: string; city: string }> }) {
  const { locale: rawLocale, city: citySlug } = await params;
  const locale = resolveLocale(rawLocale);
  const dict = getDictionary(locale);
  const catalog = await getCatalogSnapshot();
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
  const visibleCategorySlugs = new Set(categories.map((item) => item.slug));
  const visibleOccurrences = catalog.occurrences.filter(
    (occurrence) => occurrence.citySlug === citySlug && occurrence.verificationStatus !== 'hidden' && visibleCategorySlugs.has(occurrence.categorySlug)
  );
  const weekOccurrences = applyOccurrenceFilters(visibleOccurrences, { date: 'week' });
  const featuredOccurrencePreview = weekOccurrences.slice(0, 4);
  const cityPlaces = catalog.places.filter((place) => place.citySlug === citySlug);
  const metrics = {
    places: cityPlaces.length,
    occurrences: weekOccurrences.length,
    neighborhoods: new Set(cityPlaces.map((place) => place.neighborhoodSlug)).size,
    programs: new Set(weekOccurrences.map((occurrence) => occurrence.programSlug)).size
  };
  const [user, resolvedFeaturedOccurrences, runtimeCapabilities] = await Promise.all([
    getSessionUser(),
    Promise.resolve(resolveOccurrenceCardDataFromSnapshot(catalog, featuredOccurrencePreview)),
    getRuntimeCapabilities()
  ]);
  const copy =
    locale === 'it'
      ? {
          weeklyClasses: 'Attività in settimana',
          weeklyClassesDetail: 'Nei prossimi 7 giorni',
          studios: 'Luoghi',
          studiosDetail: 'Verificati per Palermo.',
          neighborhoods: 'Quartieri coperti',
          neighborhoodsDetail: 'Zone già utili per famiglie.',
          featured: 'Attività in evidenza',
          featuredTitle: 'Utili questa settimana.',
          fullCalendar: 'Apri tutte le attività',
          categories: 'Categorie',
          neighborhoodsSection: 'Quartieri',
          collections: 'Collezioni',
          studiosSection: 'Luoghi',
          studiosTitle: 'Scegli prima il contesto, poi lo slot.',
          studiosLead: 'Musei, biblioteche, parchi, laboratori e sedi che vale la pena tenere presenti anche oltre il singolo evento.',
          openStudios: 'Apri tutti i luoghi',
          teachers: 'Organizzatori',
          teachersTitle: 'Chi rende leggibile il panorama 0-14.',
          teachersLead: 'Istituzioni, piccoli operatori e luoghi che pubblicano abbastanza bene da essere davvero utili.',
          openTeachers: 'Apri tutti gli organizzatori',
          movementTitle: 'Una città family, non un elenco generico',
          movementBody: 'Weekend culturali, laboratori, attività motorie e fallback tranquilli convivono dentro un unico flusso di discovery.',
          movementCta: 'Apri tutte le attività'
        }
      : {
          weeklyClasses: 'Activities this week',
          weeklyClassesDetail: 'Across the next 7 days',
          studios: 'Places',
          studiosDetail: 'Verified for Palermo.',
          neighborhoods: 'Neighborhoods covered',
          neighborhoodsDetail: 'Areas already useful for families.',
          featured: 'Featured activities',
          featuredTitle: 'Useful this week.',
          fullCalendar: 'Open all activities',
          categories: 'Categories',
          neighborhoodsSection: 'Neighborhoods',
          collections: 'Collections',
          studiosSection: 'Places',
          studiosTitle: 'Choose the context before the slot.',
          studiosLead: 'Museums, libraries, parks, labs, and venues worth keeping in mind even beyond a single event.',
          openStudios: 'Open all places',
          teachers: 'Organizers',
          teachersTitle: 'Who makes the 0-14 layer readable.',
          teachersLead: 'Institutions, small operators, and places that publish clearly enough to be genuinely useful.',
          openTeachers: 'Open all organizers',
          movementTitle: 'A family city guide, not a generic list',
          movementBody: 'Culture weekends, labs, movement options, and calm fallback places sit inside one discovery flow.',
          movementCta: 'Open all activities'
        };

  return (
    <div className="stack-list city-page">
      <section className="city-hero city-hero-refresh">
        <div className="hero-copy city-hero-main">
          <p className="eyebrow">{getLocaleLabel(locale, city.name)}</p>
          <h1>{getLocaleLabel(locale, city.hero)}</h1>
          <p>{dict.browseWithoutSignup}</p>
          <div className="site-actions">
            <ServerButtonLink href={`/${locale}/${citySlug}/activities`} className="button-primary">
              {dict.exploreClasses}
            </ServerButtonLink>
            <ServerButtonLink href={`/${locale}/${citySlug}/collections/weekend-families`} className="button-ghost">
              {locale === 'it' ? 'Weekend in famiglia' : 'Weekend families'}
            </ServerButtonLink>
          </div>
        </div>
        <div className="hero-copy city-hero-metrics">
          <div className="hero-metrics">
            <StatCard label={copy.weeklyClasses} value={String(metrics.occurrences)} detail={copy.weeklyClassesDetail} detailClassName="stat-card-detail-subtle" />
            <StatCard label={copy.studios} value={String(metrics.places)} detail={copy.studiosDetail} />
            <StatCard label={copy.neighborhoods} value={String(metrics.neighborhoods)} detail={copy.neighborhoodsDetail} />
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
            {featuredOccurrencePreview.map((occurrence) => (
              <SessionCard
                key={occurrence.id}
                session={occurrence}
                locale={locale}
                resolved={resolvedFeaturedOccurrences.get(occurrence.id)!}
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
              <p className="eyebrow">{getLocaleLabel(locale, city.name)}</p>
              <h2>{copy.movementTitle}</h2>
              <p className="muted">{copy.movementBody}</p>
              <ServerLink href={`/${locale}/${citySlug}/activities`} className="inline-link">
                {copy.movementCta}
              </ServerLink>
            </div>
            <div className="city-motion-grid" aria-hidden="true">
              <div className="city-motion-media city-motion-illustration city-motion-illustration-active">
                <div className="city-motion-mark">0-14</div>
                <strong>{locale === 'it' ? 'Scegli per energia, età e quartiere' : 'Choose by energy, age, and neighborhood'}</strong>
                <span>{locale === 'it' ? 'Non solo un elenco: il contesto conta.' : 'Not just a list: context matters.'}</span>
              </div>
              <div className="city-motion-media city-motion-illustration city-motion-illustration-calm">
                <div className="city-motion-mark">{locale === 'it' ? 'Piano B' : 'Backup'}</div>
                <strong>{locale === 'it' ? 'Pioggia, doposcuola, weekend lenti' : 'Rainy days, after school, slow weekends'}</strong>
                <span>{locale === 'it' ? 'Musei, biblioteche e luoghi calmi restano nel flusso.' : 'Museums, libraries, and calm places stay in the flow.'}</span>
              </div>
            </div>
          </div>
          <div className="panel">
            <p className="eyebrow">{copy.categories}</p>
            <div className="card-grid">
              {categories.map((category) => (
                <ServerCardLink key={category.slug} href={`/${locale}/${citySlug}/categories/${category.slug}`} className="collection-card">
                  <strong>{getLocaleLabel(locale, category.name)}</strong>
                  <span className="muted">{getLocaleLabel(locale, category.description)}</span>
                </ServerCardLink>
              ))}
            </div>
          </div>
          <div className="panel">
            <p className="eyebrow">{copy.neighborhoodsSection}</p>
            <div className="card-grid">
              {neighborhoods.map((item) => (
                <ServerCardLink key={item.slug} href={`/${locale}/${citySlug}/neighborhoods/${item.slug}`} className="collection-card">
                  <strong>{getLocaleLabel(locale, item.name)}</strong>
                  <span className="muted">{getLocaleLabel(locale, item.description)}</span>
                </ServerCardLink>
              ))}
            </div>
          </div>
          <div className="panel">
            <div className="detail-header">
              <div>
                <p className="eyebrow">{copy.studiosSection}</p>
                <h2>{copy.studiosTitle}</h2>
                <p className="muted">{copy.studiosLead}</p>
              </div>
              <ServerLink href={`/${locale}/${citySlug}/places`} className="inline-link">
                {copy.openStudios}
              </ServerLink>
            </div>
            <div className="card-grid">
              {cityPlaces.slice(0, 4).map((place) => (
                <ServerCardLink key={place.slug} href={`/${locale}/${citySlug}/places/${place.slug}`} className="collection-card">
                  <strong>{place.name}</strong>
                  <span className="muted">{place.tagline[locale]}</span>
                </ServerCardLink>
              ))}
            </div>
          </div>
          <div className="panel">
            <div className="detail-header">
              <div>
                <p className="eyebrow">{copy.teachers}</p>
                <h2>{copy.teachersTitle}</h2>
                <p className="muted">{copy.teachersLead}</p>
              </div>
              <ServerLink href={`/${locale}/${citySlug}/organizers`} className="inline-link">
                {copy.openTeachers}
              </ServerLink>
            </div>
            <div className="card-grid">
              {organizers.slice(0, 4).map((organizer) => (
                <ServerCardLink key={organizer.slug} href={`/${locale}/${citySlug}/organizers/${organizer.slug}`} className="collection-card">
                  <strong>{organizer.name}</strong>
                  <span className="muted">{organizer.shortBio[locale]}</span>
                </ServerCardLink>
              ))}
            </div>
          </div>
          <div className="panel">
            <p className="eyebrow">{copy.collections}</p>
            <div className="stack-list">
              {collections.map((collection) => (
                <ServerCardLink key={collection.slug} href={`/${locale}/${citySlug}/collections/${collection.slug}`} className="collection-card">
                  <strong>{getLocaleLabel(locale, collection.title)}</strong>
                  <span className="muted">{getLocaleLabel(locale, collection.description)}</span>
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
