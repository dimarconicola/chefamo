import { ServerButtonLink } from '@/components/ui/server';
import { resolveLocale } from '@/lib/i18n/routing';

export default async function WhoWeArePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = resolveLocale((await params).locale);
  const copy =
    locale === 'it'
      ? {
          eyebrow: 'Chi siamo',
          title: 'Un progetto locale, pensato per Palermo.',
          lead:
            'chefamo nasce per rendere il tempo libero in famiglia piu leggibile: attivita con orari reali, luoghi affidabili e percorsi d azione diretti.',
          cta: 'Esplora le attivita'
        }
      : {
          eyebrow: 'Who we are',
          title: 'A local project designed for Palermo.',
          lead:
            'chefamo exists to make family activity discovery more reliable: real schedules, trustworthy places, and direct actions.',
          cta: 'Explore activities'
        };

  return (
    <section className="panel stack-list">
      <p className="eyebrow">{copy.eyebrow}</p>
      <h1>{copy.title}</h1>
      <p className="lead">{copy.lead}</p>
      <div className="site-actions">
        <ServerButtonLink href={`/${locale}/palermo/activities`} className="button-primary">
          {copy.cta}
        </ServerButtonLink>
      </div>
    </section>
  );
}
