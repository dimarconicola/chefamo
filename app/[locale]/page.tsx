import { PlayfulIcon } from '@/components/brand/PlayfulIcon';
import { DigestForm } from '@/components/forms/DigestForm';
import { LoopVideo } from '@/components/media/LoopVideo';
import { OccurrenceSpotlightCard } from '@/components/marketing/OccurrenceSpotlightCard';
import { ServerButtonLink, ServerLink } from '@/components/ui/server';
import { getOccurrencePath } from '@/lib/catalog/occurrence-links';
import { applyPublicCityFilters, getPublicCitySnapshot } from '@/lib/catalog/public-read-models';
import { resolveOccurrenceCardDataFromSnapshot } from '@/lib/catalog/session-card-data';
import { resolveLocale } from '@/lib/i18n/routing';
import { publicVideos } from '@/lib/media/public-videos';

const spotlightTones = ['red', 'blue', 'yellow', 'green'] as const;

export default async function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
  const locale = resolveLocale((await params).locale);
  const snapshot = await getPublicCitySnapshot('palermo');

  if (!snapshot) {
    throw new Error('Missing public Palermo snapshot');
  }

  const featuredOccurrences = applyPublicCityFilters(snapshot, { date: 'week' }).slice(0, 4);
  const resolvedFeaturedOccurrences = resolveOccurrenceCardDataFromSnapshot(snapshot, featuredOccurrences);
  const featuredCollections = snapshot.collections.slice(0, 3);
  const cityHref = `/${locale}/palermo`;
  const metrics = snapshot.metrics;

  const copy =
    locale === 'it'
      ? {
          heroBadge: 'Palermo-first family activity guide',
          heroTitle: 'Chefamo rende leggibile il tempo libero in famiglia.',
          heroBody:
            'Un sistema guida per famiglie 0-14: attività con orari reali, luoghi affidabili e organizzatori chiari abbastanza da farti decidere senza aprire dieci tab.',
          ctaPrimary: 'Esplora attività',
          ctaSecondary: 'Apri Palermo hub',
          heroChipOne: '0-14 vero',
          heroChipTwo: 'Palermo-first',
          heroChipThree: 'Solo segnali utili',
          motionEyebrow: 'Perché funziona',
          motionTitle: 'Una guida famiglia, non un portale rumoroso.',
          motionBody:
            'Il tono resta caldo e giocoso, ma la struttura porta davvero alla decisione: età leggibili, pianificazione semplice e piani B sensati.',
          featuresEyebrow: 'Cinque segnali che contano',
          featuresTitle: 'Non solo cosa fare, ma dove ha senso andare.',
          featuresBody:
            'Sport, weekend culturali, coding, letture e luoghi tranquilli convivono nello stesso flusso senza trasformarsi in rumore.',
          cityEyebrow: 'Attivita in evidenza',
          cityTitle: 'Una cabina di regia per weekend, doposcuola e piani pioggia.',
          cityBody: 'Attività, luoghi e organizzatori con conteggi reali e segnali freschi. Persone, non solo slot.',
          collectionsEyebrow: 'Dalla casa alla città',
          collectionsTitle: 'Una guida che aiuta a scegliere in fretta.',
          collectionsBody:
            'Età, quartiere, ritmo e fallback lavorano insieme. La UI resta amichevole, ma la struttura porta davvero alla decisione.',
          newsletterEyebrow: 'Ricevi solo idee utili per la settimana',
          newsletterTitle: 'Aggiornamenti mirati, non spam.',
          newsletterBody:
            'Nuove attività, weekend forti, luoghi indoor quando piove e selezioni curate per Palermo. Ti scriviamo solo quando c’è davvero qualcosa di buono da fare.',
          newsletterChipOne: 'Zero rumore',
          newsletterChipTwo: 'Piani pioggia',
          newsletterChipThree: 'Weekend forti',
          motionCards: [
          stats: {
            activities: 'Attività nel catalogo',
            places: 'Luoghi',
            neighborhoods: 'Quartieri',
            formats: 'Formati'
          },
          features: [
            {
              icon: 'map' as const,
              title: 'Sport, cultura, laboratori, coding',
              body: 'Non solo liste: il catalogo dice dove ha senso andare per una fascia d età e un livello di energia.'
            },
            {
              icon: 'calendar' as const,
              title: 'Gli slot con orario chiaro stanno in primo piano',
              body: 'Tutto il resto resta luogo o programma. Niente finzione di precisione quando il dato non è abbastanza forte.'
            },
            {
              icon: 'cloud' as const,
              title: 'C’è sempre un piano B sensato',
              body: 'Anche quando non esiste lo slot perfetto, puoi comunque raggiungere il posto giusto per quella giornata.'
            }
          ],
          features: [
            {
              icon: 'pin' as const,
              tone: 'blue',
              title: 'Mappa prima dello scroll',
              description: 'La città si legge per quartiere e non per feed infinito.'
            },
            {
              icon: 'calendar' as const,
              tone: 'yellow',
              title: 'Orari affidabili',
              description: 'Se non abbiamo un orario solido, non facciamo finta che esista.'
            },
            {
              icon: 'spark' as const,
              tone: 'green',
              title: 'Età e filtri chiari',
              description: 'Sport, musei, letture, planetario, coding e luoghi calmi convivono nello stesso flusso.'
            },
            {
              icon: 'book' as const,
              tone: 'red',
              title: 'Catalogo selezionato',
              description: 'La copertura cresce solo quando la qualità e la fiducia sono davvero buone.'
            }
          ]
        }
      : {
          heroBadge: 'Palermo-first family activity guide',
          heroTitle: 'Chefamo makes family free time readable.',
          heroBody:
            'A guide system for 0-14 families: activities with actual times, trustworthy places, and organizers clear enough to help you decide without opening ten tabs.',
          ctaPrimary: 'Explore activities',
          ctaSecondary: 'Open Palermo hub',
          heroChipOne: 'True 0-14 focus',
          heroChipTwo: 'Palermo-first',
          heroChipThree: 'Useful signal only',
          motionEyebrow: 'Why it works',
          motionTitle: 'A family guide, not a noisy portal.',
          motionBody:
            'The tone stays warm and playful, but the structure still gets a family to a decision: readable ages, simple planning, and sensible backups.',
          featuresEyebrow: 'Five signals that matter',
          featuresTitle: 'Not just what to do, but where it makes sense to go.',
          featuresBody:
            'Sports, cultural weekends, coding, reading, and calm places live in one flow without turning into noise.',
          cityEyebrow: 'Palermo Hub',
          cityTitle: 'A control room for weekends, after-school windows, and rainy-day backups.',
          cityBody: 'Activities, places, and organizers with real counts and fresh signals.',
          collectionsEyebrow: 'From home to city',
          collectionsTitle: 'A guide built for fast decisions.',
          collectionsBody:
            'Age fit, neighborhood, rhythm, and fallback options work together. The UI stays friendly, but the structure still gets a family to a decision.',
          newsletterEyebrow: 'Get only useful ideas for the week',
          newsletterTitle: 'Targeted updates, not spam.',
          newsletterBody:
            'New activities, strong weekends, indoor backups when it rains, and curated Palermo picks. We only write when there is something genuinely worth doing.',
          newsletterChipOne: 'No noise',
          newsletterChipTwo: 'Rain plans',
          newsletterChipThree: 'Strong weekends',
          motionCards: [
          stats: {
            activities: 'Activities in catalog',
            places: 'Places',
            neighborhoods: 'Neighborhoods',
            formats: 'Formats'
          },
          features: [
            {
              icon: 'map' as const,
              title: 'Sports, culture, labs, coding',
              body: 'Not just lists: the catalog tells you where it makes sense to go for a given age band and energy level.'
            },
            {
              icon: 'calendar' as const,
              title: 'Anything with clear timing gets the spotlight',
              body: 'Everything else stays a place or a program. No fake precision when the data is not strong enough.'
            },
            {
              icon: 'cloud' as const,
              title: 'There is always a sensible backup plan',
              body: 'Even when there is no perfect slot, you can still reach the right place for that day.'
            }
          ],
          features: [
            {
              icon: 'pin' as const,
              tone: 'blue',
              title: 'Map before scroll',
              description: 'The city reads by neighborhood, not by endless feed.'
            },
            {
              icon: 'calendar' as const,
              tone: 'yellow',
              title: 'Reliable schedules',
              description: 'If we do not have a solid time, we do not pretend we do.'
            },
            {
              icon: 'spark' as const,
              tone: 'green',
              title: 'Readable ages and filters',
              description: 'Sports, museums, reading, planetarium, coding, and calmer places all live in one flow.'
            },
            {
              icon: 'book' as const,
              tone: 'red',
              title: 'Selected catalog',
              description: 'Coverage only grows when quality and trust are actually there.'
            }
          ]
        };

  return (
    <div className="home-v2">
      <section className="home-v2-hero">
        <div className="home-v2-shell home-v2-hero-grid">
          <div className="home-v2-hero-copy">
            <div className="home-v2-badge">
              <PlayfulIcon name="spark" className="chefamo-inline-icon" />
              <span>{copy.heroBadge}</span>
            </div>
            <h1>{copy.heroTitle}</h1>
            <p>{copy.heroBody}</p>
            <div className="home-v2-hero-actions">
              <ServerButtonLink href={`${cityHref}/activities`} className="home-v2-btn home-v2-btn-primary">
                {copy.ctaPrimary}
                <PlayfulIcon name="arrow" className="chefamo-inline-icon" />
              </ServerButtonLink>
              <ServerButtonLink href={cityHref} className="home-v2-btn home-v2-btn-secondary">
                <PlayfulIcon name="pin" className="chefamo-inline-icon" />
                {copy.ctaSecondary}
              </ServerButtonLink>
            </div>
            <div className="home-v2-metric-pills">
              <span>{copy.heroChipOne}</span>
              <span>{copy.heroChipTwo}</span>
              <span>{copy.heroChipThree}</span>
            </div>
          </div>

          <div className="home-v2-hero-visual">
            <div className="home-v2-photo-wrap">
              <LoopVideo asset={publicVideos.heroFlow} label={copy.heroTitle} className="home-v2-photo-video" priority />
              <div className="home-v2-photo-ring" />
              <div className="home-v2-photo-glow home-v2-photo-glow-left" />
              <div className="home-v2-photo-glow home-v2-photo-glow-right" />
            </div>
          </div>
        </div>
      </section>
          <div className="chefamo-hero-stack">
            <article className="chefamo-play-card chefamo-city-overview-card">
              <p className="chefamo-card-kicker">{copy.cityPanelEyebrow}</p>
              <h2>{copy.cityPanelTitle}</h2>
              <div className="chefamo-stat-grid">
                <div className="chefamo-stat-tile chefamo-tone-red">
                  <strong>{metrics.programs}</strong>
                  <span>{copy.stats.activities}</span>
                </div>
                <div className="chefamo-stat-tile chefamo-tone-blue">
                  <strong>{metrics.places}</strong>
                  <span>{copy.stats.places}</span>
                </div>
                <div className="chefamo-stat-tile chefamo-tone-yellow">
                  <strong>{metrics.neighborhoods}</strong>
                  <span>{copy.stats.neighborhoods}</span>
                </div>
                <div className="chefamo-stat-tile chefamo-tone-green">
                  <strong>{metrics.styles}</strong>
                  <span>{copy.stats.formats}</span>
                </div>
              </div>
            </article>

      <section className="home-v2-motion">
        <div className="home-v2-shell">
          <div className="home-v2-motion-head">
            <p>{copy.motionEyebrow}</p>
            <h2>{copy.motionTitle}</h2>
            <p>{copy.motionBody}</p>
          </div>
          <div className="home-v2-motion-grid">
            {copy.motionCards.map((card, index) => (
              <article key={card.title} className="home-v2-motion-card">
                <div className={`home-v2-motion-media home-v2-illustration home-v2-illustration-${index === 0 ? 'energy' : index === 1 ? 'quiet' : 'culture'}`}>
                  {index === 1 ? (
                    <LoopVideo asset={publicVideos.meditation} label={card.title} className="home-v2-photo-video" />
                  ) : index === 2 ? (
                    <LoopVideo asset={publicVideos.stretching} label={card.title} className="home-v2-photo-video" />
                  ) : null}
                  <div className="home-v2-illustration-icon">
                    <PlayfulIcon name={card.icon} className="chefamo-inline-icon" />
                  </div>
                  <div className="home-v2-illustration-orb home-v2-illustration-orb-a" />
                  <div className="home-v2-illustration-orb home-v2-illustration-orb-b" />
                  {index !== 1 ? <div className="home-v2-illustration-strip" /> : null}
                </div>
                <div className="home-v2-motion-copy">
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-v2-features">
        <div className="home-v2-shell">
          <div className="home-v2-features-head">
            <p>{copy.featuresEyebrow}</p>
            <h2>{copy.featuresTitle}</h2>
            <p>{copy.featuresBody}</p>
          </div>
          <div className="home-v2-features-grid">
            {copy.features.map((feature) => (
              <article key={feature.title} className={`home-v2-feature-item chefamo-tone-${feature.tone}`}>
                <div className="home-v2-feature-icon">
                  <PlayfulIcon name={feature.icon} className="chefamo-inline-icon" />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-v2-cityhub">
        <div className="home-v2-shell">
          <div className="home-v2-cityhub-head">
            <p>{copy.cityEyebrow}</p>
            <h2>{copy.cityTitle}</h2>
            <p>{copy.cityBody}</p>
            <div className="home-v2-metric-pills">
              <span>{metrics.programs} {locale === 'it' ? 'Programmi attivi' : 'Active programs'}</span>
              <span>{metrics.places} {locale === 'it' ? 'luoghi' : 'places'}</span>
              <span>{metrics.organizers} {locale === 'it' ? 'organizzatori' : 'organizers'}</span>
              <span>{metrics.neighborhoods} {locale === 'it' ? 'Quartieri coperti' : 'Neighborhoods covered'}</span>
            </div>
          </div>

          <div className="home-v2-cards-grid">
            {featuredOccurrences.map((occurrence, index) => {
              const resolved = resolvedFeaturedOccurrences.get(occurrence.id);
              if (!resolved) return null;

              return (
                <OccurrenceSpotlightCard
                  key={occurrence.id}
                  occurrence={occurrence}
                  resolved={resolved}
                  locale={locale}
                  href={getOccurrencePath(locale, occurrence.citySlug, occurrence.id)}
                  tone={spotlightTones[index % spotlightTones.length]}
                />
              );
            })}
          </div>

          <div className="home-v2-cityhub-cta">
            <ServerButtonLink href={cityHref} className="home-v2-btn home-v2-btn-secondary">
              {locale === 'it' ? 'Apri Palermo hub' : 'Open Palermo hub'}
              <PlayfulIcon name="arrow" className="chefamo-inline-icon" />
            </ServerButtonLink>
          </div>
        </div>
      </section>

      <section className="home-v2-newsletter">
        <div className="home-v2-shell home-v2-newsletter-grid">
          <div className="home-v2-newsletter-copy">
            <p className="home-v2-badge">
              <PlayfulIcon name="spark" className="chefamo-inline-icon" />
              <span>{copy.newsletterEyebrow}</span>
            </p>
            <h2>{copy.newsletterTitle}</h2>
            <p>{copy.newsletterBody}</p>
            <div className="home-v2-newsletter-pills">
              <span>{copy.newsletterChipOne}</span>
              <span>{copy.newsletterChipTwo}</span>
              <span>{copy.newsletterChipThree}</span>
            </div>
            <DigestForm citySlug="palermo" locale={locale} surface="plain" compact className="home-v2-newsletter-form" />
            <div className="home-v2-newsletter-notes">
              {featuredCollections.map((collection) => (
                <article key={collection.slug}>
                  <h3>{collection.title[locale]}</h3>
                  <p>{collection.description[locale]}</p>
                  <ServerLink href={`/${locale}/palermo/collections/${collection.slug}`} className="home-v2-class-link">
                    {locale === 'it' ? 'Apri collezione' : 'Open collection'}
                    <PlayfulIcon name="arrow" className="chefamo-inline-icon" />
                  </ServerLink>
                </article>
              ))}
            </div>
          </div>

          <div className="home-v2-newsletter-media-stack" aria-hidden="true">
            <div className="home-v2-newsletter-media home-v2-newsletter-media-tall">
              <LoopVideo asset={publicVideos.aerial} label={copy.newsletterTitle} className="home-v2-newsletter-video" />
            </div>
            <div className="home-v2-newsletter-media home-v2-newsletter-media-wide">
              <LoopVideo asset={publicVideos.seaPanorama} label={copy.newsletterTitle} className="home-v2-newsletter-video" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
