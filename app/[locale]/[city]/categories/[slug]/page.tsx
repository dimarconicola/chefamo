import { notFound } from 'next/navigation';

import { SessionCard } from '@/components/discovery/SessionCard';
import { ServerButtonLink, ServerCardLink } from '@/components/ui/server';
import { getSessionUser } from '@/lib/auth/session';
import { getCatalogSnapshot } from '@/lib/catalog/repository';
import { resolveOccurrenceCardData } from '@/lib/catalog/session-card-data';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { resolveLocale } from '@/lib/i18n/routing';
import { getRuntimeCapabilities } from '@/lib/runtime/capabilities';

export default async function CategoryPage({ params }: { params: Promise<{ locale: string; city: string; slug: string }> }) {
  const { locale: rawLocale, city: citySlug, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const dict = getDictionary(locale);
  const catalog = await getCatalogSnapshot();
  const category = catalog.categories.find((item) => item.slug === slug && item.citySlug === citySlug);
  if (!category || category.visibility === 'hidden') notFound();

  const occurrences = catalog.occurrences.filter((occurrence) => occurrence.citySlug === citySlug && occurrence.categorySlug === slug).slice(0, 12);
  const programs = catalog.programs.filter((program) => program.citySlug === citySlug && program.categorySlug === slug).slice(0, 8);
  const places = catalog.places.filter((place) => place.citySlug === citySlug && place.categorySlugs.includes(slug)).slice(0, 8);
  const [user, resolvedOccurrences, runtimeCapabilities] = await Promise.all([
    getSessionUser(),
    resolveOccurrenceCardData(occurrences),
    getRuntimeCapabilities()
  ]);
  const labels = locale === 'it' ? { category: 'Categoria', programs: 'Programmi', places: 'Luoghi' } : { category: 'Category', programs: 'Programs', places: 'Places' };

  return (
    <div className="stack-list">
      <section className="panel">
        <p className="eyebrow">{labels.category}</p>
        <h1>{category.name[locale]}</h1>
        <p className="lead">{category.description[locale]}</p>
        <p className="muted">{category.heroMetric[locale]}</p>
        <div className="site-actions">
          <ServerButtonLink href={`/${locale}/${citySlug}/activities?category=${category.slug}`} className="button-primary">
            {dict.exploreClasses}
          </ServerButtonLink>
        </div>
      </section>

      <section className="panel">
        <div className="detail-header">
          <div>
            <p className="eyebrow">{dict.classes}</p>
            <h2>{locale === 'it' ? 'Slot con orario' : 'Timed activities'}</h2>
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
        <p className="eyebrow">{labels.programs}</p>
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
        <p className="eyebrow">{labels.places}</p>
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
