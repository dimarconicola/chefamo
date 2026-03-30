import { notFound } from 'next/navigation';

import { SessionCard } from '@/components/discovery/SessionCard';
import { ServerButtonLink, ServerCardLink } from '@/components/ui/server';
import { getSessionUser } from '@/lib/auth/session';
import { getCatalogSnapshot } from '@/lib/catalog/repository';
import { resolveOccurrenceCardData } from '@/lib/catalog/session-card-data';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { resolveLocale } from '@/lib/i18n/routing';
import { getRuntimeCapabilities } from '@/lib/runtime/capabilities';

export default async function NeighborhoodPage({ params }: { params: Promise<{ locale: string; city: string; slug: string }> }) {
  const { locale: rawLocale, city: citySlug, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const dict = getDictionary(locale);
  const catalog = await getCatalogSnapshot();
  const city = catalog.cities.find((item) => item.slug === citySlug && item.status === 'public');
  const neighborhood = catalog.neighborhoods.find((item) => item.slug === slug && item.citySlug === citySlug);
  if (!city || !neighborhood) notFound();

  const places = catalog.places.filter((place) => place.citySlug === citySlug && place.neighborhoodSlug === slug);
  const placeSlugs = new Set(places.map((place) => place.slug));
  const occurrences = catalog.occurrences.filter((occurrence) => placeSlugs.has(occurrence.placeSlug)).slice(0, 12);
  const programs = catalog.programs.filter((program) => placeSlugs.has(program.placeSlug)).slice(0, 8);
  const [user, runtimeCapabilities, resolvedOccurrences] = await Promise.all([
    getSessionUser(),
    getRuntimeCapabilities(),
    resolveOccurrenceCardData(occurrences)
  ]);

  return (
    <div className="stack-list">
      <section className="panel">
        <p className="eyebrow">{locale === 'it' ? 'Quartiere' : 'Neighborhood'}</p>
        <h1>{neighborhood.name[locale]}</h1>
        <p className="lead">{neighborhood.description[locale]}</p>
        <div className="site-actions">
          <ServerButtonLink href={`/${locale}/${citySlug}/activities?neighborhood=${neighborhood.slug}`} className="button-primary">
            {dict.exploreClasses}
          </ServerButtonLink>
        </div>
      </section>

      <section className="panel">
        <div className="detail-header">
          <div>
            <p className="eyebrow">{dict.classes}</p>
            <h2>{locale === 'it' ? 'Attività con orario nel quartiere' : 'Timed activities in this neighborhood'}</h2>
          </div>
        </div>
        <div className="stack-list">
          {occurrences.map((occurrence) => (
            <SessionCard
              key={occurrence.id}
              session={occurrence}
              locale={locale}
              resolved={resolvedOccurrences.get(occurrence.id)!}
              signedInEmail={user?.email}
              scheduleLabel={dict.saveSchedule}
              runtimeCapabilities={runtimeCapabilities}
            />
          ))}
        </div>
      </section>

      <section className="panel">
        <p className="eyebrow">{locale === 'it' ? 'Programmi' : 'Programs'}</p>
        <div className="card-grid">
          {programs.map((program) => (
            <ServerCardLink key={program.slug} href={`/${locale}/${citySlug}/places/${program.placeSlug}`} className="collection-card">
              <strong>{program.title[locale]}</strong>
              <span className="muted">{program.summary[locale]}</span>
            </ServerCardLink>
          ))}
        </div>
      </section>

      <section className="panel">
        <p className="eyebrow">{locale === 'it' ? 'Luoghi' : 'Places'}</p>
        <div className="card-grid">
          {places.map((place) => (
            <ServerCardLink key={place.slug} href={`/${locale}/${citySlug}/places/${place.slug}`} className="collection-card">
              <strong>{place.name}</strong>
              <span className="muted">{place.tagline[locale]}</span>
            </ServerCardLink>
          ))}
        </div>
      </section>
    </div>
  );
}
