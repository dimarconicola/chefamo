import { CalendarSubmissionForm } from '@/components/forms/CalendarSubmissionForm';
import { ServerButtonLink } from '@/components/ui/server';
import { resolveLocale } from '@/lib/i18n/routing';

export default async function SuggestCalendarPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = resolveLocale((await params).locale);
  const copy =
    locale === 'it'
      ? {
          eyebrow: 'Per luoghi e organizzatori',
          title: 'Suggerisci la tua programmazione',
          lead:
            'Se gestisci attivita per 0-14 a Palermo, inviaci fonti pubbliche e orari. Verifichiamo prima di pubblicare nel catalogo.',
          cta: 'Scrivici via email',
          formTitle: 'Invio rapido'
        }
      : {
          eyebrow: 'For places and organizers',
          title: 'Suggest your program',
          lead:
            'If you run 0-14 activities in Palermo, send public sources and schedules. We verify before publishing in the catalog.',
          cta: 'Email us',
          formTitle: 'Quick submission'
        };

  return (
    <div className="stack-list">
      <section className="panel stack-list">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p className="lead">{copy.lead}</p>
        <div className="site-actions">
          <ServerButtonLink href="mailto:hello@chefamo.com" className="button-primary">
            {copy.cta}
          </ServerButtonLink>
          <ServerButtonLink href={`/${locale}/palermo/activities`} className="button-ghost">
            {locale === 'it' ? 'Vedi attivita Palermo' : 'See Palermo activities'}
          </ServerButtonLink>
        </div>
      </section>
      <section className="panel stack-list">
        <p className="eyebrow">{copy.formTitle}</p>
        <CalendarSubmissionForm locale={locale} citySlug="palermo" />
      </section>
    </div>
  );
}
