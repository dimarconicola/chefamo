import { resolveLocale } from '@/lib/i18n/routing';

export default async function CookiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = resolveLocale((await params).locale);
  const copy =
    locale === 'it'
      ? {
          eyebrow: 'Cookies',
          title: 'Uso di cookie e storage locale',
          lead:
            'kinelo.fit usa cookie e storage locale in modo limitato per sessione, autenticazione, preferenze e corretto funzionamento dell’esperienza.',
          sections: [
            {
              title: 'Cookie essenziali',
              body: 'Servono per mantenere la sessione attiva, gestire login e proteggere il servizio da usi impropri.'
            },
            {
              title: 'Preferenze locali',
              body: 'Preferiti e agenda salvata possono essere memorizzati anche nel browser per mantenere l’esperienza coerente tra una visita e l’altra.'
            },
            {
              title: 'Analitiche tecniche',
              body: 'Possiamo raccogliere eventi tecnici essenziali e click outbound per capire se il servizio funziona correttamente e quali link sono piu utili.'
            }
          ]
        }
      : {
          eyebrow: 'Cookies',
          title: 'Use of cookies and local storage',
          lead:
            'kinelo.fit uses cookies and local storage in a limited way for session handling, authentication, preferences, and core product behavior.',
          sections: [
            {
              title: 'Essential cookies',
              body: 'These are used to keep the session active, handle sign-in, and protect the service from misuse.'
            },
            {
              title: 'Local preferences',
              body: 'Favorites and saved schedule may also be stored in the browser so the experience stays consistent from one visit to the next.'
            },
            {
              title: 'Technical analytics',
              body: 'We may collect essential technical events and outbound clicks to understand whether the service works correctly and which links are most useful.'
            }
          ]
        };

  return (
    <section className="panel stack-list">
      <p className="eyebrow">{copy.eyebrow}</p>
      <h1>{copy.title}</h1>
      <p className="lead">{copy.lead}</p>
      {copy.sections.map((section) => (
        <section key={section.title} className="stack-list">
          <h2>{section.title}</h2>
          <p className="muted">{section.body}</p>
        </section>
      ))}
    </section>
  );
}
