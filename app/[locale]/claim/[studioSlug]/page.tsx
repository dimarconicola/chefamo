import { notFound } from 'next/navigation';
import { ClaimForm } from '@/components/forms/ClaimForm';
import { ServerButtonLink } from '@/components/ui/server';
import { getPlace } from '@/lib/catalog/server-data';
import { resolveLocale } from '@/lib/i18n/routing';

export default async function ClaimStudioPage({ params }: { params: Promise<{ locale: string; studioSlug: string }> }) {
  const { locale: rawLocale, studioSlug } = await params;
  const locale = resolveLocale(rawLocale);
  const place = await getPlace(studioSlug);
  if (!place) notFound();
  const copy =
    locale === 'it'
      ? {
          eyebrow: 'Aggiorna questo luogo',
          lead:
            'Chefamo usa un flusso leggero: segnala correzioni, conferma i dettagli pubblici e aiutaci a mantenere affidabile la scheda.',
          back: 'Torna al luogo'
        }
      : {
          eyebrow: 'Update this place',
          lead:
            'Chefamo keeps this lightweight: report corrections, confirm public details, and help keep the listing trustworthy.',
          back: 'Back to place'
        };

  return (
    <section className="detail-hero">
      <div className="panel">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{place.name}</h1>
        <p className="lead">{copy.lead}</p>
        <div className="site-actions">
          <ServerButtonLink href={`/${locale}/${place.citySlug}/places/${place.slug}`} className="button-ghost">
            {copy.back}
          </ServerButtonLink>
        </div>
      </div>
      <ClaimForm placeSlug={studioSlug} locale={locale} />
    </section>
  );
}
