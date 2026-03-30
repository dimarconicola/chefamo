import { notFound } from 'next/navigation';

import { SessionCard } from '@/components/discovery/SessionCard';
import { ServerButtonLink, ServerCardLink, ServerChip } from '@/components/ui/server';
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

  const occurrences = catalog.occurrences
    .filter((occurrence) => occurrence.citySlug === citySlug && occurrence.categorySlug === slug)
    .sort((left, right) => left.startAt.localeCompare(right.startAt))
    .slice(0, 12);
  const programs = catalog.programs
    .filter((program) => program.citySlug === citySlug && program.categorySlug === slug)
    .sort((left, right) => left.title[locale].localeCompare(right.title[locale], locale))
    .slice(0, 8);
  const places = catalog.places
    .filter((place) => place.citySlug === citySlug && place.categorySlugs.includes(slug))
    .sort((left, right) => left.name.localeCompare(right.name, locale))
    .slice(0, 8);
  const [user, resolvedOccurrences, runtimeCapabilities] = await Promise.all([
    getSessionUser(),
    resolveOccurrenceCardData(occurrences),
    getRuntimeCapabilities()
  ]);
  const labels =
    locale === 'it'
      ? {
          category: 'Categoria',
          activities: 'Attivita con orario',
          activitiesTitle: 'Cosa puoi fissare gia da questa categoria',
          activitiesEmpty: 'Per ora non ci sono slot imminenti pubblicati in questa categoria.',
          programs: 'Programmi ricorrenti',
          programsTitle: 'Cose da tenere d occhio anche oltre il singolo slot',
          programsEmpty: 'Per ora non abbiamo programmi ricorrenti visibili per questa categoria.',
          places: 'Luoghi utili',
          placesTitle: 'Posti da conoscere anche senza un orario fisso',
          placesEmpty: 'Per ora non abbiamo luoghi aggiuntivi da segnalare in questa categoria.',
          browse: 'Apri tutte le attivita',
          chips: {
            activities: 'slot imminenti',
            programs: 'programmi',
            places: 'luoghi'
          }
        }
      : {
          category: 'Category',
          activities: 'Timed activities',
          activitiesTitle: 'What you can already lock in from this category',
          activitiesEmpty: 'There are no imminent public slots in this category yet.',
          programs: 'Recurring programs',
          programsTitle: 'What is worth keeping in view beyond a single slot',
          programsEmpty: 'There are no visible recurring programs in this category yet.',
          places: 'Useful places',
          placesTitle: 'Places worth knowing even without a fixed time',
          placesEmpty: 'There are no extra places to highlight in this category yet.',
          browse: 'Open all activities',
          chips: {
            activities: 'upcoming slots',
            programs: 'programs',
            places: 'places'
          }
        };

  return (
    <div className="stack-list">
      <section className="panel">
        <p className="eyebrow">{labels.category}</p>
        <h1>{category.name[locale]}</h1>
        <p className="lead">{category.description[locale]}</p>
        <p className="muted">{category.heroMetric[locale]}</p>
        <div className="profile-chip-row">
          <ServerChip tone="meta">
            {occurrences.length} {labels.chips.activities}
          </ServerChip>
          <ServerChip tone="meta">
            {programs.length} {labels.chips.programs}
          </ServerChip>
          <ServerChip tone="meta">
            {places.length} {labels.chips.places}
          </ServerChip>
        </div>
        <div className="site-actions">
          <ServerButtonLink href={`/${locale}/${citySlug}/activities?category=${category.slug}`} className="button-primary">
            {labels.browse}
          </ServerButtonLink>
        </div>
      </section>

      <section className="panel">
        <div className="detail-header">
          <div>
            <p className="eyebrow">{labels.activities}</p>
            <h2>{labels.activitiesTitle}</h2>
          </div>
        </div>
        {occurrences.length > 0 ? (
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
        ) : (
          <p className="muted">{labels.activitiesEmpty}</p>
        )}
      </section>

      <section className="panel">
        <p className="eyebrow">{labels.programs}</p>
        <h2>{labels.programsTitle}</h2>
        {programs.length > 0 ? (
          <div className="card-grid">
            {programs.map((program) => (
              <ServerCardLink key={program.slug} href={`/${locale}/${citySlug}/places/${program.placeSlug}`} className="collection-card">
                <strong>{program.title[locale]}</strong>
                <span className="muted">{program.summary[locale]}</span>
              </ServerCardLink>
            ))}
          </div>
        ) : (
          <p className="muted">{labels.programsEmpty}</p>
        )}
      </section>

      <section className="panel">
        <p className="eyebrow">{labels.places}</p>
        <h2>{labels.placesTitle}</h2>
        {places.length > 0 ? (
          <div className="card-grid">
            {places.map((place) => (
              <ServerCardLink key={place.slug} href={`/${locale}/${citySlug}/places/${place.slug}`} className="collection-card">
                <strong>{place.name}</strong>
                <span className="muted">{place.tagline[locale]}</span>
              </ServerCardLink>
            ))}
          </div>
        ) : (
          <p className="muted">{labels.placesEmpty}</p>
        )}
      </section>
    </div>
  );
}
