import { DateTime } from 'luxon';

import type {
  ActivityCategory,
  BookingTarget,
  City,
  EditorialCollection,
  Neighborhood,
  Occurrence,
  Organizer,
  Place,
  Program,
  Style
} from '@/lib/catalog/types';

const localized = (en: string, it: string) => ({ en, it });

const nextWeekday = (weekday: number, hour: number, minute: number, durationMinutes: number) => {
  const zone = 'Europe/Rome';
  let day = DateTime.now().setZone(zone).startOf('day');

  while (day.weekday !== weekday) {
    day = day.plus({ days: 1 });
  }

  const start = day.set({ hour, minute, second: 0, millisecond: 0 });
  const end = start.plus({ minutes: durationMinutes });
  return {
    startAt: start.toISO() ?? '',
    endAt: end.toISO() ?? ''
  };
};

const buildOccurrence = (
  id: string,
  program: Program,
  schedule: { startAt: string; endAt: string }
): Occurrence => ({
  id,
  programSlug: program.slug,
  citySlug: program.citySlug,
  placeSlug: program.placeSlug,
  organizerSlug: program.organizerSlug,
  categorySlug: program.categorySlug,
  styleSlug: program.styleSlug,
  title: program.title,
  startAt: schedule.startAt,
  endAt: schedule.endAt,
  level: program.level,
  language: program.language,
  format: program.format,
  bookingTargetSlug: program.bookingTargetSlug,
  sourceUrl: program.sourceUrl,
  lastVerifiedAt: program.lastVerifiedAt,
  verificationStatus: program.verificationStatus,
  audience: program.audience,
  attendanceModel: program.attendanceModel,
  ageMin: program.ageMin,
  ageMax: program.ageMax,
  ageBand: program.ageBand,
  guardianRequired: program.guardianRequired,
  priceNote: program.priceNote,
  venueSlug: program.placeSlug,
  instructorSlug: program.organizerSlug
});

const diariaCalendarSource = 'https://www.diariapalermo.org/corsi/calendario/';

export const chefamoCities: City[] = [
  {
    slug: 'palermo',
    countryCode: 'IT',
    timezone: 'Europe/Rome',
    status: 'public',
    bounds: [13.2805, 38.085, 13.405, 38.165],
    name: localized('Palermo', 'Palermo'),
    hero: localized('The citywide family activity guide for Palermo.', 'La guida cittadina alle attivita per famiglie a Palermo.')
  },
  {
    slug: 'catania',
    countryCode: 'IT',
    timezone: 'Europe/Rome',
    status: 'seed',
    bounds: [15.02, 37.45, 15.18, 37.57],
    name: localized('Catania', 'Catania'),
    hero: localized('Next city in the chefamo pipeline.', 'La prossima citta nella pipeline chefamo.')
  }
];

export const chefamoNeighborhoods: Neighborhood[] = [
  {
    citySlug: 'palermo',
    slug: 'politeama',
    name: localized('Politeama', 'Politeama'),
    description: localized(
      'Central Palermo with family-friendly cultural institutions and after-school options.',
      'Palermo centrale con istituzioni culturali family-friendly e opzioni per il doposcuola.'
    ),
    center: { lat: 38.1244, lng: 13.3521 }
  },
  {
    citySlug: 'palermo',
    slug: 'kalsa',
    name: localized('Kalsa', 'Kalsa'),
    description: localized('Historic Palermo with museums and hands-on family culture.', 'Palermo storica con musei e cultura hands-on per famiglie.'),
    center: { lat: 38.1175, lng: 13.3694 }
  },
  {
    citySlug: 'palermo',
    slug: 'capo',
    name: localized('Capo', 'Capo'),
    description: localized(
      'Compact central district with useful weekday indoor options for younger families.',
      'Quartiere centrale compatto con opzioni indoor feriali utili per le famiglie piu giovani.'
    ),
    center: { lat: 38.1191, lng: 13.3514 }
  },
  {
    citySlug: 'palermo',
    slug: 'castellammare',
    name: localized('Castellammare', 'Castellammare'),
    description: localized(
      'Historic center streets with museums, courtyards, and family workshops close to Via Roma.',
      'Strade del centro storico con musei, cortili e laboratori per famiglie vicino a via Roma.'
    ),
    center: { lat: 38.1206, lng: 13.3614 }
  },
  {
    citySlug: 'palermo',
    slug: 'zen',
    name: localized('ZEN', 'ZEN'),
    description: localized(
      'Neighborhood-led cultural spaces with reading, community care, and educational activities for children.',
      'Spazi culturali di quartiere con lettura, cura della comunita e attivita educative per bambini.'
    ),
    center: { lat: 38.1682, lng: 13.3188 }
  }
];

export const chefamoCategories: ActivityCategory[] = [
  {
    slug: 'culture',
    citySlug: 'palermo',
    name: localized('Culture', 'Cultura'),
    description: localized('Museums, theater, guided visits, and family heritage routes.', 'Musei, teatro, visite guidate e percorsi di patrimonio per famiglie.'),
    visibility: 'live',
    heroMetric: localized('Weekend rituals with clear booking paths.', 'Riti del weekend con prenotazioni chiare.')
  },
  {
    slug: 'movement',
    citySlug: 'palermo',
    name: localized('Sports & Movement', 'Sport e movimento'),
    description: localized(
      'Circo, dance, capoeira, active play, and structured after-school movement for children.',
      'Circo, danza, capoeira, gioco motorio e attivita sportive strutturate per il doposcuola.'
    ),
    visibility: 'live',
    heroMetric: localized('Active slots grouped by age band and weekly rhythm.', 'Slot attivi raggruppati per fascia d eta e ritmo settimanale.')
  },
  {
    slug: 'stem',
    citySlug: 'palermo',
    name: localized('Science & STEM', 'Scienza e STEM'),
    description: localized('Planetarium, coding, robotics, and hands-on discovery.', 'Planetario, coding, robotica e scoperta hands-on.'),
    visibility: 'live',
    heroMetric: localized('Structured curiosity for 5-14.', 'Curiosita strutturata per 5-14 anni.')
  },
  {
    slug: 'reading',
    citySlug: 'palermo',
    name: localized('Reading & Stories', 'Lettura e storie'),
    description: localized('Libraries, bookshops, and story-led spaces for younger children.', 'Biblioteche, librerie e spazi narrativi per i piu piccoli.'),
    visibility: 'live',
    heroMetric: localized('Quiet, trustworthy options for 0-10.', 'Opzioni tranquille e affidabili per 0-10.')
  },
  {
    slug: 'outdoors',
    citySlug: 'palermo',
    name: localized('Outdoor Time', 'Tempo all aperto'),
    description: localized('Parks and open-air family hubs that work without heavy planning.', 'Parchi e hub all aperto che funzionano senza pianificazioni pesanti.'),
    visibility: 'live',
    heroMetric: localized('Good-anytime places for family reset.', 'Luoghi da usare quando serve un reset in famiglia.')
  }
];

export const chefamoStyles: Style[] = [
  { slug: 'guided-visit', categorySlug: 'culture', name: localized('Guided visit', 'Visita guidata'), description: localized('Short guided route with a clear start time.', 'Percorso guidato breve con orario chiaro.') },
  { slug: 'circomotricita', categorySlug: 'movement', name: localized('Circomotricity', 'Circomotricita'), description: localized('Play-based movement sessions with circus-inspired motor skills for children.', 'Sessioni di movimento ludico con competenze motorie ispirate al circo per bambini.') },
  { slug: 'aerial-kids-lab', categorySlug: 'movement', name: localized('Aerial kids lab', 'Laboratorio aereo bambini'), description: localized('Suspension-based movement lab for children under close supervision.', 'Laboratorio di movimento in sospensione per bambini con supervisione ravvicinata.') },
  { slug: 'kids-dance-foundations', categorySlug: 'movement', name: localized('Kids dance foundations', 'Danza base bambini'), description: localized('Introductory dance classes for early school years.', 'Lezioni introduttive di danza per i primi anni scolari.') },
  { slug: 'kids-dance-pedagogy', categorySlug: 'movement', name: localized('Dance pedagogy 3-4', 'Pedagogia della danza 3-4'), description: localized('Early-childhood movement pedagogy focused on body awareness.', 'Percorso di pedagogia del movimento per la prima infanzia e la consapevolezza corporea.') },
  { slug: 'kids-contemporary-dance', categorySlug: 'movement', name: localized('Kids contemporary dance', 'Danza contemporanea bambini'), description: localized('Contemporary dance sessions for children with rhythm and movement foundations.', 'Sessioni di danza contemporanea per bambini con basi di ritmo e movimento.') },
  { slug: 'kids-capoeira', categorySlug: 'movement', name: localized('Kids capoeira', 'Capoeira bambini'), description: localized('Capoeira for children blending rhythm, coordination, and play.', 'Capoeira per bambini tra ritmo, coordinazione e gioco.') },
  { slug: 'planetarium-show', categorySlug: 'stem', name: localized('Planetarium show', 'Spettacolo al planetario'), description: localized('Dome-based astronomy format for families.', 'Format sotto cupola dedicato all astronomia per famiglie.') },
  { slug: 'hands-on-lab', categorySlug: 'stem', name: localized('Hands-on lab', 'Laboratorio hands-on'), description: localized('Interactive making or discovery lab.', 'Laboratorio interattivo di scoperta o costruzione.') },
  { slug: 'storytime', categorySlug: 'reading', name: localized('Storytime', 'Letture animate'), description: localized('Reading-led session for young children and carers.', 'Sessione guidata da letture per bimbi piccoli e accompagnatori.') },
  { slug: 'puppet-theater', categorySlug: 'culture', name: localized('Puppet theater', 'Teatro dei pupi'), description: localized('Family theater rooted in Sicilian puppetry.', 'Teatro per famiglie radicato nella tradizione dei pupi siciliani.') },
  { slug: 'open-park-day', categorySlug: 'outdoors', name: localized('Open park day', 'Giornata al parco'), description: localized('Flexible outdoor time with family-friendly infrastructure.', 'Tempo flessibile all aperto con infrastruttura family-friendly.') },
  { slug: 'kids-coding', categorySlug: 'stem', name: localized('Kids coding', 'Coding per bambini'), description: localized('Guided digital creativity and problem-solving.', 'Creativita digitale guidata e problem solving.') },
  { slug: 'creative-kids-lab', categorySlug: 'culture', name: localized('Creative kids lab', 'Laboratorio creativo bambini'), description: localized('Arts, making, and expressive workshops built around play and participation.', 'Laboratori di arte, creazione ed espressione costruiti intorno a gioco e partecipazione.') },
  { slug: 'natural-cooking-lab', categorySlug: 'stem', name: localized('Natural cooking lab', 'Laboratorio di cucina naturale'), description: localized('Hands-on food lab for children and families using seasonal ingredients and practical making.', 'Laboratorio pratico di cucina per bambini e famiglie con ingredienti stagionali e preparazioni concrete.') }
];

export const chefamoOrganizers: Organizer[] = [
  {
    slug: 'fondazione-teatro-massimo',
    citySlug: 'palermo',
    name: 'Fondazione Teatro Massimo',
    shortBio: localized('The main opera house in Palermo, with guided visits that work well for curious families.', 'Il principale teatro d opera di Palermo, con visite guidate adatte anche a famiglie curiose.'),
    specialties: ['guided-visit', 'family-culture'],
    languages: ['Italian', 'English']
  },
  {
    slug: 'planetario-palermo',
    citySlug: 'palermo',
    name: 'Planetario Palermo',
    shortBio: localized('Weekend dome shows and science storytelling for children and families.', 'Spettacoli sotto cupola nel weekend e storytelling scientifico per bambini e famiglie.'),
    specialties: ['planetarium-show', 'science-for-kids'],
    languages: ['Italian']
  },
  {
    slug: 'minimupa',
    citySlug: 'palermo',
    name: 'MiniMuPa',
    shortBio: localized('Interactive museum and creative labs for children, schools, and families.', 'Museo interattivo e laboratori creativi per bambini, scuole e famiglie.'),
    specialties: ['hands-on-lab', 'family-culture'],
    languages: ['Italian']
  },
  {
    slug: 'biblioteca-piccolo-principe',
    citySlug: 'palermo',
    name: 'Biblioteca Il Piccolo Principe',
    shortBio: localized('City-run children and teen library with reading, borrowing, and calm indoor time.', 'Biblioteca comunale per bambini e ragazzi con letture, prestito e tempo indoor tranquillo.'),
    specialties: ['storytime', 'reading-for-kids'],
    languages: ['Italian']
  },
  {
    slug: 'museo-marionette',
    citySlug: 'palermo',
    name: 'Museo delle Marionette',
    shortBio: localized('Family shows and puppet theater rooted in Palermo’s living tradition.', 'Spettacoli per famiglie e teatro di figura radicati nella tradizione viva di Palermo.'),
    specialties: ['puppet-theater', 'family-culture'],
    languages: ['Italian']
  },
  {
    slug: 'palermo-kids-lab',
    citySlug: 'palermo',
    name: 'Palermo Kids Lab',
    shortBio: localized('Small-group coding and digital creativity for older children.', 'Piccoli gruppi di coding e creativita digitale per bambini piu grandi.'),
    specialties: ['kids-coding', 'hands-on-lab'],
    languages: ['Italian', 'English']
  },
  {
    slug: 'circo-pificio-team',
    citySlug: 'palermo',
    name: 'Circo Pificio team',
    shortBio: localized(
      'Local team running circomotricity sessions that work well for younger children with high energy.',
      'Team locale che conduce sessioni di circomotricita adatte ai piu piccoli con energia alta.'
    ),
    specialties: ['circomotricita', 'active-play'],
    languages: ['Italian']
  },
  {
    slug: 'spazio-terra-team',
    citySlug: 'palermo',
    name: 'Spazio Terra team',
    shortBio: localized(
      'Workshop-led movement team behind kids aerial and body-awareness labs.',
      'Team di laboratorio dietro percorsi aerei e di consapevolezza corporea per bambini.'
    ),
    specialties: ['aerial-kids-lab', 'movement-lab'],
    languages: ['Italian']
  },
  {
    slug: 'diaria-kids',
    citySlug: 'palermo',
    name: 'Diaria Kids',
    shortBio: localized(
      'Recurring after-school dance and capoeira supply published through Diaria’s Palermo calendar.',
      'Programmazione ricorrente doposcuola di danza e capoeira pubblicata nel calendario palermitano di Diaria.'
    ),
    specialties: ['kids-contemporary-dance', 'kids-dance-foundations', 'kids-dance-pedagogy', 'kids-capoeira'],
    languages: ['Italian']
  },
  {
    slug: 'le-giuggiole',
    citySlug: 'palermo',
    name: 'Le Giuggiole',
    shortBio: localized(
      'ARCI family circle hosted at EPYC with workshops, play, reading, and cultural activities for children and caregivers.',
      'Circolo ARCI per famiglie ospitato da EPYC con laboratori, gioco, letture e attivita culturali per bambini e accompagnatori.'
    ),
    specialties: ['creative-kids-lab', 'storytime', 'family-culture'],
    languages: ['Italian']
  },
  {
    slug: 'booq',
    citySlug: 'palermo',
    name: 'booq',
    shortBio: localized(
      'Neighborhood bibliofficina in the Kalsa with intercultural reading and family-friendly community programming.',
      'Bibliofficina di quartiere alla Kalsa con letture interculturali e programmazione di comunita family-friendly.'
    ),
    specialties: ['storytime', 'reading-for-kids', 'community-library'],
    languages: ['Italian']
  },
  {
    slug: 'libreria-dudi',
    citySlug: 'palermo',
    name: 'Libreria Dudi',
    shortBio: localized(
      'Children-focused bookshop and workshop space with reading, science, movement, and music activities from early years to 14.',
      'Libreria per bambini e spazio laboratorio con attivita di lettura, scienza, movimento e musica dalla prima infanzia ai 14 anni.'
    ),
    specialties: ['storytime', 'creative-kids-lab', 'reading-for-kids'],
    languages: ['Italian']
  },
  {
    slug: 'giulia-agnello-naturopata',
    citySlug: 'palermo',
    name: 'Giulia Agnello Naturopata',
    shortBio: localized(
      'Natural food educator running family cooking workshops around Palermo with a practical, seasonal approach.',
      'Educatrice al cibo naturale che conduce laboratori di cucina per famiglie a Palermo con un approccio pratico e stagionale.'
    ),
    specialties: ['natural-cooking-lab', 'hands-on-lab'],
    languages: ['Italian']
  },
  {
    slug: 'radici-museo-natura',
    citySlug: 'palermo',
    name: 'Radici Museo della Natura',
    shortBio: localized(
      'Museum and ecological cultural center with recurring family activities, readings, and hands-on labs.',
      'Museo e centro culturale ecologico con attivita ricorrenti per famiglie, letture e laboratori hands-on.'
    ),
    specialties: ['hands-on-lab', 'natural-cooking-lab', 'family-culture'],
    languages: ['Italian', 'English']
  },
  {
    slug: 'laboratorio-zen-insieme',
    citySlug: 'palermo',
    name: 'Laboratorio ZEN Insieme',
    shortBio: localized(
      'Long-running neighborhood association combining reading, after-school support, culture, and social infrastructure for children.',
      'Associazione di quartiere attiva da anni che intreccia lettura, doposcuola, cultura e infrastruttura sociale per bambini.'
    ),
    specialties: ['storytime', 'community-library', 'family-culture'],
    languages: ['Italian']
  }
];

export const chefamoBookingTargets: BookingTarget[] = [
  { slug: 'teatro-massimo-booking', type: 'website', label: 'Teatro Massimo', href: 'https://www.teatromassimo.it/' },
  { slug: 'planetario-contact', type: 'email', label: 'planetariopalermo@gmail.com', href: 'mailto:planetariopalermo@gmail.com' },
  { slug: 'minimupa-booking', type: 'website', label: 'MiniMuPa', href: 'https://www.minimupa.it/' },
  { slug: 'biblioteca-contact', type: 'phone', label: '091 7408870', href: 'tel:+390917408870' },
  { slug: 'museo-marionette-contact', type: 'email', label: 'info@museomarionettepalermo.it', href: 'mailto:info@museomarionettepalermo.it' },
  { slug: 'villa-filippina-info', type: 'email', label: 'parcovillafilippina@gmail.com', href: 'mailto:parcovillafilippina@gmail.com' },
  { slug: 'kids-lab-booking', type: 'website', label: 'Palermo Kids Lab', href: 'https://www.palermokidslab.it/' },
  { slug: 'circopificio-website', type: 'website', label: 'Circo Pificio', href: 'https://www.circopificio.it/circomotricita/' },
  { slug: 'spazio-terra-source', type: 'website', label: 'Spazio Terra', href: 'https://www.facebook.com/spazioterrapalermo' },
  { slug: 'diaria-kids-enroll', type: 'direct', label: 'Diaria iscrizione', href: 'https://www.diariapalermo.org/iscrizione-corsi/' },
  { slug: 'diaria-kids-whatsapp', type: 'whatsapp', label: 'WhatsApp Diaria', href: 'https://wa.me/393517066792' },
  { slug: 'le-giuggiole-website', type: 'website', label: 'Le Giuggiole', href: 'https://www.arcipalermo.it/index.php/i-circoli/le-giuggiole' },
  { slug: 'booq-website', type: 'website', label: 'booq', href: 'https://www.booqpa.org/' },
  { slug: 'booq-mammalingua', type: 'website', label: 'booq MammaLingua', href: 'https://www.mammalingua.it/presidi/bibliofficina-booq/' },
  { slug: 'dudi-laboratori', type: 'website', label: 'Libreria Dudi', href: 'https://www.libreriadudi.it/laboratori/' },
  { slug: 'radici-attivita', type: 'website', label: 'Radici', href: 'https://radicimuseo.it/attivita/' },
  { slug: 'zen-giufa-info', type: 'website', label: 'Biblioteca Giufa', href: 'https://www.zeninsieme.it/la-biblioteca-giufa/' },
  { slug: 'elibe-corsi', type: 'website', label: 'Elibe', href: 'https://www.elibepalermo.it/corsi-elibe-palermo/' },
  { slug: 'palazzo-lampedusa-info', type: 'website', label: 'Palazzo Lampedusa', href: 'https://www.indigorooms.it/palazzo-lampedusa-palermo/' }
];

export const chefamoPlaces: Place[] = [
  {
    slug: 'teatro-massimo-palermo',
    citySlug: 'palermo',
    neighborhoodSlug: 'politeama',
    name: 'Teatro Massimo',
    tagline: localized('Family-ready guided visits in the city center.', 'Visite guidate family-ready nel cuore della citta.'),
    description: localized('A reliable culture pick when you want one clear slot, short duration, and a strong Palermo identity.', 'Una scelta culturale affidabile quando serve uno slot chiaro, una durata breve e una forte identita palermitana.'),
    address: 'Piazza Verdi, Palermo',
    geo: { lat: 38.1228, lng: 13.3578 },
    amenities: ['Central location', 'Indoor', 'Family ticket'],
    languages: ['Italian', 'English'],
    styleSlugs: ['guided-visit'],
    categorySlugs: ['culture'],
    bookingTargetOrder: ['teatro-massimo-booking'],
    freshnessNote: localized('Official guided-visit information checked from the theater website.', 'Informazioni ufficiali sulle visite guidate controllate dal sito del teatro.'),
    sourceUrl: 'https://www.teatromassimo.it/',
    lastVerifiedAt: '2026-03-29T11:00:00+02:00',
    profile: 'arts_center',
    environment: 'indoor'
  },
  {
    slug: 'planetario-palermo-place',
    citySlug: 'palermo',
    neighborhoodSlug: 'politeama',
    name: 'Planetario di Palermo',
    tagline: localized('Weekend astronomy with fixed family-friendly turni.', 'Astronomia nel weekend con turni family-friendly.'),
    description: localized('A clean science option for families who want a repeatable weekend ritual.', 'Un opzione scientifica pulita per famiglie che vogliono un rito del weekend ripetibile.'),
    address: 'Piazza San Francesco di Paola 18, Palermo',
    geo: { lat: 38.1244, lng: 13.3517 },
    amenities: ['Indoor dome', 'Weekend schedule', 'Museum visit'],
    languages: ['Italian'],
    styleSlugs: ['planetarium-show'],
    categorySlugs: ['stem'],
    bookingTargetOrder: ['planetario-contact'],
    freshnessNote: localized('Weekend public timetable monitored from the official planetarium channels.', 'Timetable pubblico del weekend monitorato dai canali ufficiali del planetario.'),
    sourceUrl: 'https://www.planetariopalermo.it/',
    lastVerifiedAt: '2026-03-29T11:00:00+02:00',
    profile: 'museum',
    environment: 'indoor'
  },
  {
    slug: 'minimupa-palermo',
    citySlug: 'palermo',
    neighborhoodSlug: 'kalsa',
    name: 'MiniMuPa',
    tagline: localized('Interactive museum sessions for curious 4-12 year olds.', 'Sessioni di museo interattivo per curiosi dai 4 ai 12 anni.'),
    description: localized('Best when you want one high-engagement indoor activity rather than a generic afternoon filler.', 'Ideale quando serve un attivita indoor ad alto coinvolgimento, non un semplice tappabuchi pomeridiano.'),
    address: 'Vicolo San Carlo 32-34, Palermo',
    geo: { lat: 38.1171, lng: 13.3691 },
    amenities: ['Indoor', 'Hands-on', 'Family events'],
    languages: ['Italian'],
    styleSlugs: ['hands-on-lab'],
    categorySlugs: ['stem', 'culture'],
    bookingTargetOrder: ['minimupa-booking'],
    freshnessNote: localized('Event-led program with official booking pages.', 'Programmazione a eventi con pagine di prenotazione ufficiali.'),
    sourceUrl: 'https://www.minimupa.it/',
    lastVerifiedAt: '2026-03-29T11:00:00+02:00',
    profile: 'museum',
    environment: 'indoor'
  },
  {
    slug: 'biblioteca-piccolo-principe-place',
    citySlug: 'palermo',
    neighborhoodSlug: 'capo',
    name: 'Biblioteca Il Piccolo Principe',
    tagline: localized('Quiet reading and story-led time for younger families.', 'Tempo tranquillo di lettura e storie per le famiglie piu giovani.'),
    description: localized('A strong fallback when you need something gentle, free, and central during the week.', 'Un ottimo fallback quando serve qualcosa di gentile, gratuito e centrale durante la settimana.'),
    address: 'Cortile Scalilla 37, Palermo',
    geo: { lat: 38.1189, lng: 13.3513 },
    amenities: ['Free access', '0-6 area', 'Borrowing'],
    languages: ['Italian'],
    styleSlugs: ['storytime'],
    categorySlugs: ['reading'],
    bookingTargetOrder: ['biblioteca-contact'],
    freshnessNote: localized('Core opening hours and family services checked from municipal library information.', 'Orari base e servizi per famiglie controllati dalle informazioni comunali.'),
    sourceUrl: 'https://www.comune.palermo.it/',
    lastVerifiedAt: '2026-03-29T11:00:00+02:00',
    profile: 'library',
    environment: 'indoor'
  },
  {
    slug: 'museo-marionette-palermo',
    citySlug: 'palermo',
    neighborhoodSlug: 'kalsa',
    name: 'Museo delle Marionette',
    tagline: localized('Weekend theater with one of Palermo’s strongest family identities.', 'Teatro del weekend con una delle identita family piu forti di Palermo.'),
    description: localized('Useful when the family wants one cultural plan that still feels playful and visually rich.', 'Utile quando la famiglia vuole un piano culturale che resti giocoso e visivamente ricco.'),
    address: 'Piazzetta Antonio Pasqualino 5, Palermo',
    geo: { lat: 38.1178, lng: 13.3699 },
    amenities: ['Indoor', 'Family theater', 'Weekend rhythm'],
    languages: ['Italian'],
    styleSlugs: ['puppet-theater'],
    categorySlugs: ['culture'],
    bookingTargetOrder: ['museo-marionette-contact'],
    freshnessNote: localized('Recurring family shows tracked from the museum’s public program.', 'Spettacoli ricorrenti per famiglie tracciati dal programma pubblico del museo.'),
    sourceUrl: 'https://www.museomarionettepalermo.it/',
    lastVerifiedAt: '2026-03-29T11:00:00+02:00',
    profile: 'museum',
    environment: 'indoor'
  },
  {
    slug: 'villa-filippina-palermo',
    citySlug: 'palermo',
    neighborhoodSlug: 'politeama',
    name: 'Parco Villa Filippina',
    tagline: localized('A dependable outdoor reset without heavy logistics.', 'Un reset all aperto affidabile senza logistica pesante.'),
    description: localized('Use it as a good-anytime outdoor anchor when the family needs movement and space more than a ticketed program.', 'Da usare come ancora outdoor good-anytime quando la famiglia ha bisogno di spazio e movimento piu che di un programma ticketed.'),
    address: 'Piazza San Francesco di Paola 18, Palermo',
    geo: { lat: 38.1248, lng: 13.3513 },
    amenities: ['Outdoor', 'Play area', 'Open access'],
    languages: ['Italian'],
    styleSlugs: ['open-park-day'],
    categorySlugs: ['outdoors'],
    bookingTargetOrder: ['villa-filippina-info'],
    freshnessNote: localized('Access and contact details checked from public city-facing sources.', 'Accesso e contatti controllati da fonti pubbliche cittadine.'),
    sourceUrl: 'https://www.parcovillafilippina.it/',
    lastVerifiedAt: '2026-03-29T11:00:00+02:00',
    profile: 'park',
    environment: 'outdoor',
    goodAnytime: true
  },
  {
    slug: 'palermo-kids-lab-place',
    citySlug: 'palermo',
    neighborhoodSlug: 'politeama',
    name: 'Palermo Kids Lab',
    tagline: localized('Small-group coding for older children after school and on Saturdays.', 'Coding in piccoli gruppi per i piu grandi dopo scuola e il sabato.'),
    description: localized('A practical STEM option when you want continuity instead of a one-off workshop.', 'Un opzione STEM pratica quando serve continuita invece di un workshop singolo.'),
    address: 'Via Dante 52, Palermo',
    geo: { lat: 38.1274, lng: 13.3506 },
    amenities: ['Small groups', 'Indoor', 'Beginner friendly'],
    languages: ['Italian', 'English'],
    styleSlugs: ['kids-coding'],
    categorySlugs: ['stem'],
    bookingTargetOrder: ['kids-lab-booking'],
    freshnessNote: localized('Published beginner coding slots tracked from the organizer’s public page.', 'Slot di coding beginner tracciati dalla pagina pubblica dell organizzatore.'),
    sourceUrl: 'https://www.palermokidslab.it/',
    lastVerifiedAt: '2026-03-29T11:00:00+02:00',
    profile: 'community_hub',
    environment: 'indoor'
  },
  {
    slug: 'circo-pificio-palermo',
    citySlug: 'palermo',
    neighborhoodSlug: 'politeama',
    name: 'Circo Pificio',
    tagline: localized('Circomotricity and active play for children with a real weekly rhythm.', 'Circomotricita e gioco motorio per bambini con un vero ritmo settimanale.'),
    description: localized(
      'A focused movement pick for families who want coordination, balance, and fun without the chaos of a generic playroom.',
      'Una scelta motoria centrata per famiglie che cercano coordinazione, equilibrio e divertimento senza il caos di una ludoteca generica.'
    ),
    address: 'Via Serradifalco 130, Palermo',
    geo: { lat: 38.1239, lng: 13.3394 },
    amenities: ['Small groups', 'Movement lab', 'Kids-focused programming'],
    languages: ['Italian'],
    styleSlugs: ['circomotricita'],
    categorySlugs: ['movement'],
    bookingTargetOrder: ['circopificio-website'],
    freshnessNote: localized('Current public program checked from the official circomotricity page.', 'Programma pubblico corrente controllato dalla pagina ufficiale di circomotricita.'),
    sourceUrl: 'https://www.circopificio.it/circomotricita/',
    lastVerifiedAt: '2026-03-12T12:00:00+01:00',
    profile: 'studio',
    environment: 'indoor'
  },
  {
    slug: 'spazio-terra-palermo',
    citySlug: 'palermo',
    neighborhoodSlug: 'politeama',
    name: 'Spazio Terra',
    tagline: localized('Workshop-led aerial and body-awareness sessions for children.', 'Sessioni aeree e di consapevolezza corporea per bambini guidate come laboratorio.'),
    description: localized(
      'Useful when the family wants one playful but supervised movement format that feels different from standard classes.',
      'Utile quando la famiglia vuole un format di movimento giocoso ma supervisionato, diverso dalle classi standard.'
    ),
    address: 'Via Dante 119, Palermo',
    geo: { lat: 38.1268, lng: 13.3498 },
    amenities: ['Workshop format', 'Indoor', 'Supervised apparatus'],
    languages: ['Italian'],
    styleSlugs: ['aerial-kids-lab'],
    categorySlugs: ['movement'],
    bookingTargetOrder: ['spazio-terra-source'],
    freshnessNote: localized('Public workshop listing checked from the organizer’s active public page.', 'Scheda laboratorio controllata dalla pagina pubblica attiva dell organizzatore.'),
    sourceUrl: 'https://www.facebook.com/spazioterrapalermo',
    lastVerifiedAt: '2026-03-12T12:00:00+01:00',
    profile: 'studio',
    environment: 'indoor'
  },
  {
    slug: 'diaria-sala-venezia',
    citySlug: 'palermo',
    neighborhoodSlug: 'kalsa',
    name: 'Diaria - Sala Venezia',
    tagline: localized('After-school dance and capoeira in the historic center.', 'Danza e capoeira doposcuola nel centro storico.'),
    description: localized(
      'One of the strongest recurring kids-active clusters in the city if you need repeatable weekday options.',
      'Uno dei cluster attivi per bambini piu forti in citta se servono opzioni feriali ripetibili.'
    ),
    address: 'Via Venezia 61, Palermo',
    geo: { lat: 38.1173, lng: 13.3619 },
    amenities: ['Weekly timetable', 'Historic center', 'Multi-age slots'],
    languages: ['Italian'],
    styleSlugs: ['kids-dance-foundations', 'kids-dance-pedagogy', 'kids-contemporary-dance', 'kids-capoeira'],
    categorySlugs: ['movement'],
    bookingTargetOrder: ['diaria-kids-enroll', 'diaria-kids-whatsapp'],
    freshnessNote: localized('Kids timetable checked against the official Diaria calendar.', 'Calendario bambini controllato sul calendario ufficiale Diaria.'),
    sourceUrl: diariaCalendarSource,
    lastVerifiedAt: '2026-03-12T12:00:00+01:00',
    profile: 'studio',
    environment: 'indoor'
  },
  {
    slug: 'diaria-studio-gagini',
    citySlug: 'palermo',
    neighborhoodSlug: 'kalsa',
    name: 'Diaria - Studio Gagini',
    tagline: localized('Recurring kids dance slots near La Loggia.', 'Slot ricorrenti di danza bambini vicino La Loggia.'),
    description: localized(
      'A dependable center-city option for families planning weekly movement habits instead of one-off events.',
      'Un opzione affidabile in centro per famiglie che pianificano abitudini motorie settimanali invece di eventi una tantum.'
    ),
    address: 'Via Antonio Gagini 31/59, Palermo',
    geo: { lat: 38.1202, lng: 13.3621 },
    amenities: ['Weekly timetable', 'Central location', 'Beginner-friendly'],
    languages: ['Italian'],
    styleSlugs: ['kids-contemporary-dance'],
    categorySlugs: ['movement'],
    bookingTargetOrder: ['diaria-kids-enroll', 'diaria-kids-whatsapp'],
    freshnessNote: localized('Kids dance slots checked against the official Diaria calendar.', 'Slot danza bambini controllati sul calendario ufficiale Diaria.'),
    sourceUrl: diariaCalendarSource,
    lastVerifiedAt: '2026-03-12T12:00:00+01:00',
    profile: 'studio',
    environment: 'indoor'
  },
  {
    slug: 'le-giuggiole-epyc',
    citySlug: 'palermo',
    neighborhoodSlug: 'politeama',
    name: 'Le Giuggiole @ EPYC',
    tagline: localized('Family ARCI circle with culture, play, and flexible workshops in the center.', 'Circolo ARCI per famiglie con cultura, gioco e laboratori flessibili in centro.'),
    description: localized(
      'A good city-center pick for creative family afternoons with a lighter, more community-led feel than formal classes.',
      'Una buona scelta in centro per pomeriggi creativi in famiglia con un tono piu comunitario e meno formale delle classi strutturate.'
    ),
    address: 'Via Pignatelli Aragona 40 c/o EPYC, Palermo',
    geo: { lat: 38.1227, lng: 13.3558 },
    amenities: ['Family circle', 'Indoor', 'Creative labs'],
    languages: ['Italian'],
    styleSlugs: ['creative-kids-lab', 'storytime'],
    categorySlugs: ['culture', 'reading'],
    bookingTargetOrder: ['le-giuggiole-website'],
    freshnessNote: localized('Family programming and EPYC location checked from the ARCI Palermo page.', 'Programmazione family e sede presso EPYC controllate dalla pagina ARCI Palermo.'),
    sourceUrl: 'https://www.arcipalermo.it/index.php/i-circoli/le-giuggiole',
    lastVerifiedAt: '2026-04-01T10:30:00+02:00',
    profile: 'association',
    environment: 'indoor'
  },
  {
    slug: 'booq-palermo',
    citySlug: 'palermo',
    neighborhoodSlug: 'kalsa',
    name: 'booq',
    tagline: localized('Intercultural neighborhood library and workshop space in the Kalsa.', 'Biblioteca interculturale e spazio laboratorio di quartiere alla Kalsa.'),
    description: localized(
      'Useful when the family wants reading-led time, community atmosphere, and activities shaped around inclusion rather than commerce.',
      'Utile quando la famiglia cerca tempo guidato dai libri, atmosfera di comunita e attivita costruite sull inclusione piu che sul consumo.'
    ),
    address: 'Piazza Kalsa 31, Palermo',
    geo: { lat: 38.1168, lng: 13.3704 },
    amenities: ['Reading room', 'Intercultural books', 'Community space'],
    languages: ['Italian'],
    styleSlugs: ['storytime'],
    categorySlugs: ['reading', 'culture'],
    bookingTargetOrder: ['booq-website', 'booq-mammalingua'],
    freshnessNote: localized('Neighborhood bibliofficina and MammaLingua activity checked from official project pages.', 'Bibliofficina di quartiere e attivita MammaLingua controllate su pagine ufficiali di progetto.'),
    sourceUrl: 'https://www.mammalingua.it/presidi/bibliofficina-booq/',
    lastVerifiedAt: '2026-04-01T10:30:00+02:00',
    profile: 'library',
    environment: 'indoor'
  },
  {
    slug: 'libreria-dudi-palermo',
    citySlug: 'palermo',
    neighborhoodSlug: 'politeama',
    name: 'Libreria Dudi',
    tagline: localized('Bookshop for 0-14 with reading, science, music, and movement workshops.', 'Libreria 0-14 con letture, scienza, musica e laboratori di movimento.'),
    description: localized(
      'A reliable family culture anchor when you want book-led programming with a strong age spread from toddlers to older children.',
      'Un ancora affidabile di cultura family quando cerchi programmazione guidata dai libri con una buona copertura d eta dai piccoli ai piu grandi.'
    ),
    address: 'Via Quintino Sella 71, Palermo',
    geo: { lat: 38.1284, lng: 13.3498 },
    amenities: ['Bookshop', 'Workshop room', '0-14 focus'],
    languages: ['Italian'],
    styleSlugs: ['storytime', 'creative-kids-lab'],
    categorySlugs: ['reading', 'stem', 'culture'],
    bookingTargetOrder: ['dudi-laboratori'],
    freshnessNote: localized('Current workshop roster checked from the official laboratori page.', 'Roster laboratori corrente controllato dalla pagina ufficiale laboratori.'),
    sourceUrl: 'https://www.libreriadudi.it/laboratori/',
    lastVerifiedAt: '2026-04-01T10:30:00+02:00',
    profile: 'community_hub',
    environment: 'indoor'
  },
  {
    slug: 'radici-museo-natura-place',
    citySlug: 'palermo',
    neighborhoodSlug: 'castellammare',
    name: 'Radici Museo della Natura',
    tagline: localized('Ecology, culture, and family workshops in a small central museum.', 'Ecologia, cultura e laboratori per famiglie in un piccolo museo centrale.'),
    description: localized(
      'One of the better central options when you want nature, making, and cultural depth in the same place.',
      'Una delle opzioni centrali migliori quando cerchi natura, attivita pratiche e profondita culturale nello stesso posto.'
    ),
    address: 'Via Antonio Gagini 23, Palermo',
    geo: { lat: 38.1203, lng: 13.3621 },
    amenities: ['Museum', 'Bistrot', 'Recurring family activities'],
    languages: ['Italian', 'English'],
    styleSlugs: ['hands-on-lab', 'natural-cooking-lab'],
    categorySlugs: ['stem', 'culture'],
    bookingTargetOrder: ['radici-attivita'],
    freshnessNote: localized('Family activity pages and venue information checked from the official Radici site.', 'Pagine attivita family e informazioni venue controllate dal sito ufficiale di Radici.'),
    sourceUrl: 'https://radicimuseo.it/attivita/',
    lastVerifiedAt: '2026-04-01T10:30:00+02:00',
    profile: 'museum',
    environment: 'indoor'
  },
  {
    slug: 'laboratorio-zen-insieme-place',
    citySlug: 'palermo',
    neighborhoodSlug: 'zen',
    name: 'Laboratorio ZEN Insieme',
    tagline: localized('Neighborhood reading, after-school, and cultural support rooted in everyday family life.', 'Lettura, doposcuola e supporto culturale di quartiere radicati nella vita dei bambini.'),
    description: localized(
      'A key social and cultural infrastructure pick for families who value community-rooted spaces over polished commercial venues.',
      'Una scelta chiave di infrastruttura sociale e culturale per famiglie che valorizzano spazi radicati nella comunita piu che venue commerciali rifinite.'
    ),
    address: 'Via Costante Girardengo 18, Palermo',
    geo: { lat: 38.1682, lng: 13.3188 },
    amenities: ['Neighborhood library', 'After-school support', 'Community programming'],
    languages: ['Italian'],
    styleSlugs: ['storytime'],
    categorySlugs: ['reading', 'culture'],
    bookingTargetOrder: ['zen-giufa-info'],
    freshnessNote: localized('Biblioteca Giufa and community programs checked from the association website.', 'Biblioteca Giufa e programmi di comunita controllati dal sito dell associazione.'),
    sourceUrl: 'https://www.zeninsieme.it/la-biblioteca-giufa/',
    lastVerifiedAt: '2026-04-01T10:30:00+02:00',
    profile: 'association',
    environment: 'indoor'
  },
  {
    slug: 'elibe-spazio-maternage',
    citySlug: 'palermo',
    neighborhoodSlug: 'politeama',
    name: 'Elibe Spazio Maternage',
    tagline: localized('Early-family space hosting courses and gentle workshops in central Palermo.', 'Spazio per la prima infanzia che ospita corsi e laboratori gentili nel centro di Palermo.'),
    description: localized(
      'Useful for younger-family routines and small-group activities that need a calmer, more caregiving-led environment.',
      'Utile per routine delle famiglie piu giovani e attivita in piccolo gruppo che richiedono un ambiente piu calmo e orientato alla cura.'
    ),
    address: 'Via Agrigento 3d / 3e, Palermo',
    geo: { lat: 38.1285, lng: 13.3491 },
    amenities: ['Early-family space', 'Indoor', 'Small-group rooms'],
    languages: ['Italian'],
    styleSlugs: ['natural-cooking-lab'],
    categorySlugs: ['stem', 'culture'],
    bookingTargetOrder: ['elibe-corsi'],
    freshnessNote: localized('Venue address and current courses checked from the official Elibe website.', 'Indirizzo venue e corsi attuali controllati dal sito ufficiale Elibe.'),
    sourceUrl: 'https://www.elibepalermo.it/corsi-elibe-palermo/',
    lastVerifiedAt: '2026-04-01T10:30:00+02:00',
    profile: 'community_hub',
    environment: 'indoor'
  },
  {
    slug: 'palazzo-lampedusa',
    citySlug: 'palermo',
    neighborhoodSlug: 'castellammare',
    name: 'Palazzo Lampedusa',
    tagline: localized('Historic courtyard venue near Via Roma used for family workshops and events.', 'Venue storica con cortile vicino via Roma usata per laboratori ed eventi family.'),
    description: localized(
      'A strong setting-driven pick when a one-off workshop matters as much for atmosphere as for the activity itself.',
      'Una scelta forte quando un laboratorio one-off conta tanto per l atmosfera quanto per l attivita in se.'
    ),
    address: 'Via di Lampedusa 23, Palermo',
    geo: { lat: 38.1201, lng: 13.3612 },
    amenities: ['Historic venue', 'Central location', 'Event hosting'],
    languages: ['Italian'],
    styleSlugs: ['natural-cooking-lab'],
    categorySlugs: ['culture', 'stem'],
    bookingTargetOrder: ['palazzo-lampedusa-info'],
    freshnessNote: localized('Venue information and address checked from the Palazzo Lampedusa page.', 'Informazioni venue e indirizzo controllati dalla pagina dedicata a Palazzo Lampedusa.'),
    sourceUrl: 'https://www.indigorooms.it/palazzo-lampedusa-palermo/',
    lastVerifiedAt: '2026-04-01T10:30:00+02:00',
    profile: 'arts_center',
    environment: 'indoor'
  }
];

export const chefamoPrograms: Program[] = [
  {
    slug: 'teatro-massimo-family-tour',
    citySlug: 'palermo',
    placeSlug: 'teatro-massimo-palermo',
    organizerSlug: 'fondazione-teatro-massimo',
    categorySlug: 'culture',
    styleSlug: 'guided-visit',
    title: localized('Family Theater Tour', 'Visita famiglia al Teatro Massimo'),
    summary: localized('A short, central culture slot with easy logistics and strong visual payoff.', 'Uno slot culturale breve, centrale e semplice da gestire, con forte impatto visivo.'),
    level: 'open',
    language: 'Italian',
    format: 'in_person',
    bookingTargetSlug: 'teatro-massimo-booking',
    sourceUrl: 'https://www.teatromassimo.it/',
    lastVerifiedAt: '2026-03-29T11:00:00+02:00',
    verificationStatus: 'verified',
    audience: 'families',
    attendanceModel: 'drop_in',
    ageMin: 4,
    ageMax: 14,
    ageBand: 'mixed-kids',
    guardianRequired: true,
    priceNote: localized('Family tickets available, with free entry for the youngest children in some cases.', 'Disponibili formule famiglia, con accesso gratuito per i piu piccoli in alcuni casi.'),
    scheduleKind: 'recurring',
    venueSlug: 'teatro-massimo-palermo',
    instructorSlug: 'fondazione-teatro-massimo'
  },
  {
    slug: 'planetario-weekend-show',
    citySlug: 'palermo',
    placeSlug: 'planetario-palermo-place',
    organizerSlug: 'planetario-palermo',
    categorySlug: 'stem',
    styleSlug: 'planetarium-show',
    title: localized('Weekend Planetarium Show', 'Spettacolo del weekend al planetario'),
    summary: localized('A fixed science ritual for 5-12, especially strong for weekends with mixed-age siblings.', 'Un rito scientifico fisso per 5-12, utile soprattutto nei weekend con fratelli di eta diverse.'),
    level: 'open',
    language: 'Italian',
    format: 'in_person',
    bookingTargetSlug: 'planetario-contact',
    sourceUrl: 'https://www.planetariopalermo.it/',
    lastVerifiedAt: '2026-03-29T11:00:00+02:00',
    verificationStatus: 'verified',
    audience: 'families',
    attendanceModel: 'drop_in',
    ageMin: 5,
    ageMax: 12,
    ageBand: 'mixed-kids',
    guardianRequired: true,
    priceNote: localized('Weekend public shows from EUR 5-10 depending on age and format.', 'Spettacoli pubblici del weekend da 5 a 10 EUR secondo eta e formato.'),
    scheduleKind: 'recurring',
    venueSlug: 'planetario-palermo-place',
    instructorSlug: 'planetario-palermo'
  },
  {
    slug: 'minimupa-creative-lab',
    citySlug: 'palermo',
    placeSlug: 'minimupa-palermo',
    organizerSlug: 'minimupa',
    categorySlug: 'stem',
    styleSlug: 'hands-on-lab',
    title: localized('MiniMuPa Creative Lab', 'Laboratorio creativo MiniMuPa'),
    summary: localized('High-engagement indoor lab for children who want to touch, build, and ask questions.', 'Laboratorio indoor ad alto coinvolgimento per bambini che vogliono toccare, costruire e fare domande.'),
    level: 'open',
    language: 'Italian',
    format: 'in_person',
    bookingTargetSlug: 'minimupa-booking',
    sourceUrl: 'https://www.minimupa.it/',
    lastVerifiedAt: '2026-03-29T11:00:00+02:00',
    verificationStatus: 'verified',
    audience: 'kids',
    attendanceModel: 'cycle',
    ageMin: 6,
    ageMax: 12,
    ageBand: '6-10',
    guardianRequired: false,
    priceNote: localized('Pricing varies by lab and event cycle.', 'Prezzi variabili in base al laboratorio e al ciclo evento.'),
    scheduleKind: 'seasonal',
    venueSlug: 'minimupa-palermo',
    instructorSlug: 'minimupa'
  },
  {
    slug: 'biblioteca-storytime',
    citySlug: 'palermo',
    placeSlug: 'biblioteca-piccolo-principe-place',
    organizerSlug: 'biblioteca-piccolo-principe',
    categorySlug: 'reading',
    styleSlug: 'storytime',
    title: localized('Library Story Circle', 'Cerchio di letture in biblioteca'),
    summary: localized('A gentle weekday option for 3-7 year olds with low friction and low cost.', 'Un opzione feriale gentile per 3-7 anni, con attrito e costo molto bassi.'),
    level: 'open',
    language: 'Italian',
    format: 'in_person',
    bookingTargetSlug: 'biblioteca-contact',
    sourceUrl: 'https://www.comune.palermo.it/',
    lastVerifiedAt: '2026-03-29T11:00:00+02:00',
    verificationStatus: 'verified',
    audience: 'families',
    attendanceModel: 'drop_in',
    ageMin: 3,
    ageMax: 7,
    ageBand: '3-5',
    guardianRequired: true,
    priceNote: localized('Library access is free; some special events may require reservation.', 'Accesso biblioteca gratuito; alcuni eventi speciali possono richiedere prenotazione.'),
    scheduleKind: 'recurring',
    venueSlug: 'biblioteca-piccolo-principe-place',
    instructorSlug: 'biblioteca-piccolo-principe'
  },
  {
    slug: 'marionette-weekend-show',
    citySlug: 'palermo',
    placeSlug: 'museo-marionette-palermo',
    organizerSlug: 'museo-marionette',
    categorySlug: 'culture',
    styleSlug: 'puppet-theater',
    title: localized('Weekend Puppet Theater', 'Teatro dei pupi del weekend'),
    summary: localized('A visually memorable culture plan that works well for shared family time.', 'Un piano culturale visivamente memorabile che funziona bene per il tempo condiviso in famiglia.'),
    level: 'open',
    language: 'Italian',
    format: 'in_person',
    bookingTargetSlug: 'museo-marionette-contact',
    sourceUrl: 'https://www.museomarionettepalermo.it/',
    lastVerifiedAt: '2026-03-29T11:00:00+02:00',
    verificationStatus: 'verified',
    audience: 'families',
    attendanceModel: 'drop_in',
    ageMin: 4,
    ageMax: 12,
    ageBand: 'mixed-kids',
    guardianRequired: true,
    priceNote: localized('Family pricing varies by show and season.', 'Prezzi famiglia variabili secondo spettacolo e stagione.'),
    scheduleKind: 'recurring',
    venueSlug: 'museo-marionette-palermo',
    instructorSlug: 'museo-marionette'
  },
  {
    slug: 'villa-filippina-open-day',
    citySlug: 'palermo',
    placeSlug: 'villa-filippina-palermo',
    organizerSlug: 'planetario-palermo',
    categorySlug: 'outdoors',
    styleSlug: 'open-park-day',
    title: localized('Open Park Day', 'Giornata libera a Villa Filippina'),
    summary: localized('A good-anytime outdoor choice when the family needs flexible energy release.', 'Una scelta outdoor good-anytime quando la famiglia ha bisogno di scaricare energia con flessibilita.'),
    level: 'open',
    language: 'Italian',
    format: 'in_person',
    bookingTargetSlug: 'villa-filippina-info',
    sourceUrl: 'https://www.parcovillafilippina.it/',
    lastVerifiedAt: '2026-03-29T11:00:00+02:00',
    verificationStatus: 'verified',
    audience: 'families',
    attendanceModel: 'drop_in',
    ageMin: 0,
    ageMax: 14,
    ageBand: 'mixed-kids',
    guardianRequired: true,
    priceNote: localized('Park access is generally free; special events may vary.', 'L accesso al parco e in genere gratuito; gli eventi speciali possono variare.'),
    scheduleKind: 'evergreen',
    venueSlug: 'villa-filippina-palermo',
    instructorSlug: 'planetario-palermo'
  },
  {
    slug: 'palermo-kids-coding-club',
    citySlug: 'palermo',
    placeSlug: 'palermo-kids-lab-place',
    organizerSlug: 'palermo-kids-lab',
    categorySlug: 'stem',
    styleSlug: 'kids-coding',
    title: localized('Coding Club 8-12', 'Coding club 8-12'),
    summary: localized('A continuity-focused Saturday option for children ready for digital projects.', 'Un opzione del sabato orientata alla continuita per bambini pronti a progetti digitali.'),
    level: 'beginner',
    language: 'Italian',
    format: 'in_person',
    bookingTargetSlug: 'kids-lab-booking',
    sourceUrl: 'https://www.palermokidslab.it/',
    lastVerifiedAt: '2026-03-29T11:00:00+02:00',
    verificationStatus: 'verified',
    audience: 'kids',
    attendanceModel: 'cycle',
    ageMin: 8,
    ageMax: 12,
    ageBand: '6-10',
    guardianRequired: false,
    priceNote: localized('Small-group cycle pricing shared on request.', 'Prezzi del ciclo in piccoli gruppi condivisi su richiesta.'),
    scheduleKind: 'recurring',
    venueSlug: 'palermo-kids-lab-place',
    instructorSlug: 'palermo-kids-lab'
  },
  {
    slug: 'circo-pificio-circomotricita',
    citySlug: 'palermo',
    placeSlug: 'circo-pificio-palermo',
    organizerSlug: 'circo-pificio-team',
    categorySlug: 'movement',
    styleSlug: 'circomotricita',
    title: localized('Kids Circomotricity', 'Circomotricita bambini'),
    summary: localized(
      'A strong coordination and confidence format for younger children who need structured movement more than competition.',
      'Un format forte per coordinazione e sicurezza corporea nei piu piccoli che hanno bisogno di movimento strutturato piu che di competizione.'
    ),
    level: 'beginner',
    language: 'Italian',
    format: 'in_person',
    bookingTargetSlug: 'circopificio-website',
    sourceUrl: 'https://www.circopificio.it/circomotricita/',
    lastVerifiedAt: '2026-03-12T12:00:00+01:00',
    verificationStatus: 'verified',
    audience: 'kids',
    attendanceModel: 'cycle',
    ageMin: 3,
    ageMax: 10,
    ageBand: 'mixed-kids',
    guardianRequired: false,
    priceNote: localized('Enrollment details are shared directly by the organizer.', 'I dettagli di iscrizione vengono condivisi direttamente dall organizzatore.'),
    scheduleKind: 'recurring',
    venueSlug: 'circo-pificio-palermo',
    instructorSlug: 'circo-pificio-team'
  },
  {
    slug: 'spazio-terra-aerial-lab',
    citySlug: 'palermo',
    placeSlug: 'spazio-terra-palermo',
    organizerSlug: 'spazio-terra-team',
    categorySlug: 'movement',
    styleSlug: 'aerial-kids-lab',
    title: localized('Aerial Kids Lab', 'Laboratorio aereo bambini'),
    summary: localized(
      'A playful Saturday movement option when the family wants novelty, supervision, and one clear slot.',
      'Un opzione motoria del sabato quando la famiglia cerca novita, supervisione e uno slot chiaro.'
    ),
    level: 'beginner',
    language: 'Italian',
    format: 'in_person',
    bookingTargetSlug: 'spazio-terra-source',
    sourceUrl: 'https://www.facebook.com/spazioterrapalermo',
    lastVerifiedAt: '2026-03-12T12:00:00+01:00',
    verificationStatus: 'verified',
    audience: 'kids',
    attendanceModel: 'drop_in',
    ageMin: 6,
    ageMax: 12,
    ageBand: '6-10',
    guardianRequired: false,
    priceNote: localized('Workshop pricing is usually shared per event.', 'Il prezzo del laboratorio viene in genere condiviso evento per evento.'),
    scheduleKind: 'seasonal',
    venueSlug: 'spazio-terra-palermo',
    instructorSlug: 'spazio-terra-team'
  },
  {
    slug: 'diaria-contemporary-dance',
    citySlug: 'palermo',
    placeSlug: 'diaria-studio-gagini',
    organizerSlug: 'diaria-kids',
    categorySlug: 'movement',
    styleSlug: 'kids-contemporary-dance',
    title: localized('Contemporary Dance 7-10', 'Danza contemporanea 7-10'),
    summary: localized(
      'A repeatable weekly dance slot for children ready for rhythm, sequence, and expressive movement.',
      'Uno slot di danza settimanale ripetibile per bambini pronti a ritmo, sequenza e movimento espressivo.'
    ),
    level: 'beginner',
    language: 'Italian',
    format: 'in_person',
    bookingTargetSlug: 'diaria-kids-enroll',
    sourceUrl: diariaCalendarSource,
    lastVerifiedAt: '2026-03-12T12:00:00+01:00',
    verificationStatus: 'verified',
    audience: 'kids',
    attendanceModel: 'cycle',
    ageMin: 7,
    ageMax: 10,
    ageBand: '6-10',
    guardianRequired: false,
    priceNote: localized('Enrollment is handled directly through the Diaria registration flow.', 'L iscrizione si gestisce direttamente tramite il flusso di registrazione Diaria.'),
    scheduleKind: 'recurring',
    venueSlug: 'diaria-studio-gagini',
    instructorSlug: 'diaria-kids'
  },
  {
    slug: 'diaria-capoeira',
    citySlug: 'palermo',
    placeSlug: 'diaria-sala-venezia',
    organizerSlug: 'diaria-kids',
    categorySlug: 'movement',
    styleSlug: 'kids-capoeira',
    title: localized('Capoeira 6-10', 'Capoeira 6-10'),
    summary: localized(
      'A rhythmic active format that works well for children who want movement, music, and coordination together.',
      'Un format attivo ritmico che funziona bene per bambini che vogliono movimento, musica e coordinazione insieme.'
    ),
    level: 'beginner',
    language: 'Italian',
    format: 'in_person',
    bookingTargetSlug: 'diaria-kids-enroll',
    sourceUrl: diariaCalendarSource,
    lastVerifiedAt: '2026-03-12T12:00:00+01:00',
    verificationStatus: 'verified',
    audience: 'kids',
    attendanceModel: 'cycle',
    ageMin: 6,
    ageMax: 10,
    ageBand: '6-10',
    guardianRequired: false,
    priceNote: localized('Registration and pricing are shared through Diaria.', 'Iscrizione e prezzi vengono condivisi tramite Diaria.'),
    scheduleKind: 'recurring',
    venueSlug: 'diaria-sala-venezia',
    instructorSlug: 'diaria-kids'
  },
  {
    slug: 'diaria-dance-foundations',
    citySlug: 'palermo',
    placeSlug: 'diaria-sala-venezia',
    organizerSlug: 'diaria-kids',
    categorySlug: 'movement',
    styleSlug: 'kids-dance-foundations',
    title: localized('Dance 5-6 Years', 'Danza 5-6 anni'),
    summary: localized(
      'An early-school dance slot with a clean age fit for families wanting a gentle structured start.',
      'Uno slot di danza per i primi anni scolari con una fascia eta chiara per famiglie che cercano un inizio strutturato ma gentile.'
    ),
    level: 'beginner',
    language: 'Italian',
    format: 'in_person',
    bookingTargetSlug: 'diaria-kids-enroll',
    sourceUrl: diariaCalendarSource,
    lastVerifiedAt: '2026-03-12T12:00:00+01:00',
    verificationStatus: 'verified',
    audience: 'kids',
    attendanceModel: 'cycle',
    ageMin: 5,
    ageMax: 6,
    ageBand: '3-5',
    guardianRequired: false,
    priceNote: localized('Registration and pricing are shared through Diaria.', 'Iscrizione e prezzi vengono condivisi tramite Diaria.'),
    scheduleKind: 'recurring',
    venueSlug: 'diaria-sala-venezia',
    instructorSlug: 'diaria-kids'
  },
  {
    slug: 'diaria-dance-pedagogy',
    citySlug: 'palermo',
    placeSlug: 'diaria-sala-venezia',
    organizerSlug: 'diaria-kids',
    categorySlug: 'movement',
    styleSlug: 'kids-dance-pedagogy',
    title: localized('Dance Pedagogy 3-4', 'Pedagogia della danza 3-4'),
    summary: localized(
      'A first-steps body-awareness class designed for very young children and caregivers planning early routines.',
      'Una classe di primi passi e consapevolezza corporea pensata per bambini molto piccoli e famiglie che impostano routine precoci.'
    ),
    level: 'beginner',
    language: 'Italian',
    format: 'in_person',
    bookingTargetSlug: 'diaria-kids-enroll',
    sourceUrl: diariaCalendarSource,
    lastVerifiedAt: '2026-03-12T12:00:00+01:00',
    verificationStatus: 'verified',
    audience: 'families',
    attendanceModel: 'cycle',
    ageMin: 3,
    ageMax: 4,
    ageBand: '3-5',
    guardianRequired: true,
    priceNote: localized('Registration and pricing are shared through Diaria.', 'Iscrizione e prezzi vengono condivisi tramite Diaria.'),
    scheduleKind: 'recurring',
    venueSlug: 'diaria-sala-venezia',
    instructorSlug: 'diaria-kids'
  },
  {
    slug: 'le-giuggiole-family-labs',
    citySlug: 'palermo',
    placeSlug: 'le-giuggiole-epyc',
    organizerSlug: 'le-giuggiole',
    categorySlug: 'culture',
    styleSlug: 'creative-kids-lab',
    title: localized('Creative Family Labs at EPYC', 'Laboratori creativi in famiglia da EPYC'),
    summary: localized(
      'Flexible family workshops with a community feel, good for children who want art, making, and shared time rather than a rigid course.',
      'Laboratori family flessibili con un tono di comunita, utili per bambini che vogliono arte, creazione e tempo condiviso piu che un corso rigido.'
    ),
    level: 'open',
    language: 'Italian',
    format: 'in_person',
    bookingTargetSlug: 'le-giuggiole-website',
    sourceUrl: 'https://www.arcipalermo.it/index.php/i-circoli/le-giuggiole',
    lastVerifiedAt: '2026-04-01T10:30:00+02:00',
    verificationStatus: 'verified',
    audience: 'families',
    attendanceModel: 'drop_in',
    ageMin: 3,
    ageMax: 12,
    ageBand: 'mixed-kids',
    guardianRequired: true,
    priceNote: localized('Program details change across the season and are shared through the organizer pages.', 'I dettagli del programma cambiano durante la stagione e vengono condivisi tramite le pagine dell organizzatore.'),
    scheduleKind: 'variable',
    venueSlug: 'le-giuggiole-epyc',
    instructorSlug: 'le-giuggiole'
  },
  {
    slug: 'booq-mammalingua-reading',
    citySlug: 'palermo',
    placeSlug: 'booq-palermo',
    organizerSlug: 'booq',
    categorySlug: 'reading',
    styleSlug: 'storytime',
    title: localized('MammaLingua and Intercultural Reading', 'MammaLingua e letture interculturali'),
    summary: localized(
      'A reading-led inclusion format for younger children and multilingual families in a neighborhood cultural space.',
      'Un format guidato dai libri e dall inclusione per i piu piccoli e le famiglie multilingue in uno spazio culturale di quartiere.'
    ),
    level: 'open',
    language: 'Italian',
    format: 'in_person',
    bookingTargetSlug: 'booq-mammalingua',
    sourceUrl: 'https://www.mammalingua.it/presidi/bibliofficina-booq/',
    lastVerifiedAt: '2026-04-01T10:30:00+02:00',
    verificationStatus: 'verified',
    audience: 'families',
    attendanceModel: 'drop_in',
    ageMin: 0,
    ageMax: 10,
    ageBand: 'mixed-kids',
    guardianRequired: true,
    priceNote: localized('Activities are usually free or low-cost and communicated through project updates.', 'Le attivita sono in genere gratuite o low-cost e vengono comunicate tramite gli aggiornamenti del progetto.'),
    scheduleKind: 'variable',
    venueSlug: 'booq-palermo',
    instructorSlug: 'booq'
  },
  {
    slug: 'dudi-reading-labs',
    citySlug: 'palermo',
    placeSlug: 'libreria-dudi-palermo',
    organizerSlug: 'libreria-dudi',
    categorySlug: 'reading',
    styleSlug: 'storytime',
    title: localized('Dudi Readings and Workshops', 'Letture e laboratori Dudi'),
    summary: localized(
      'A broad 0-14 workshop roster anchored in books, from toddler formats to labs for older children.',
      'Un roster ampio di laboratori 0-14 ancorati ai libri, dai format per piccolissimi ai laboratori per bambini piu grandi.'
    ),
    level: 'open',
    language: 'Italian',
    format: 'in_person',
    bookingTargetSlug: 'dudi-laboratori',
    sourceUrl: 'https://www.libreriadudi.it/laboratori/',
    lastVerifiedAt: '2026-04-01T10:30:00+02:00',
    verificationStatus: 'verified',
    audience: 'families',
    attendanceModel: 'drop_in',
    ageMin: 0,
    ageMax: 14,
    ageBand: 'mixed-kids',
    guardianRequired: true,
    priceNote: localized('Formats and prices vary by lab and age band.', 'Format e prezzi variano in base al laboratorio e alla fascia d eta.'),
    scheduleKind: 'variable',
    venueSlug: 'libreria-dudi-palermo',
    instructorSlug: 'libreria-dudi'
  },
  {
    slug: 'radici-family-ecology-labs',
    citySlug: 'palermo',
    placeSlug: 'radici-museo-natura-place',
    organizerSlug: 'radici-museo-natura',
    categorySlug: 'stem',
    styleSlug: 'hands-on-lab',
    title: localized('Family Ecology Labs at Radici', 'Laboratori di ecologia per famiglie da Radici'),
    summary: localized(
      'Recurring family activities mixing nature, sensory exploration, and practical making in a small museum setting.',
      'Attivita ricorrenti per famiglie che intrecciano natura, esplorazione sensoriale e fare pratico in un piccolo museo.'
    ),
    level: 'open',
    language: 'Italian',
    format: 'in_person',
    bookingTargetSlug: 'radici-attivita',
    sourceUrl: 'https://radicimuseo.it/attivita/',
    lastVerifiedAt: '2026-04-01T10:30:00+02:00',
    verificationStatus: 'verified',
    audience: 'families',
    attendanceModel: 'drop_in',
    ageMin: 5,
    ageMax: 14,
    ageBand: 'mixed-kids',
    guardianRequired: true,
    priceNote: localized('Family activities vary month by month and are published on the official activity page.', 'Le attivita per famiglie variano di mese in mese e vengono pubblicate sulla pagina ufficiale attivita.'),
    scheduleKind: 'variable',
    venueSlug: 'radici-museo-natura-place',
    instructorSlug: 'radici-museo-natura'
  },
  {
    slug: 'zen-giufa-reading-club',
    citySlug: 'palermo',
    placeSlug: 'laboratorio-zen-insieme-place',
    organizerSlug: 'laboratorio-zen-insieme',
    categorySlug: 'reading',
    styleSlug: 'storytime',
    title: localized('Biblioteca Giufa Reading Club', 'Biblioteca Giufa legge e crea'),
    summary: localized(
      'Neighborhood reading and making activity with a strong social mission and an everyday family feel.',
      'Attivita di quartiere tra lettura e creazione con una missione sociale forte e un tono family quotidiano.'
    ),
    level: 'open',
    language: 'Italian',
    format: 'in_person',
    bookingTargetSlug: 'zen-giufa-info',
    sourceUrl: 'https://www.zeninsieme.it/la-biblioteca-giufa/',
    lastVerifiedAt: '2026-04-01T10:30:00+02:00',
    verificationStatus: 'verified',
    audience: 'families',
    attendanceModel: 'drop_in',
    ageMin: 3,
    ageMax: 14,
    ageBand: 'mixed-kids',
    guardianRequired: true,
    priceNote: localized('Community activities are usually shared through the association channels.', 'Le attivita di comunita vengono in genere condivise tramite i canali dell associazione.'),
    scheduleKind: 'variable',
    venueSlug: 'laboratorio-zen-insieme-place',
    instructorSlug: 'laboratorio-zen-insieme'
  },
  {
    slug: 'giulia-agnello-natural-cooking-dudi',
    citySlug: 'palermo',
    placeSlug: 'libreria-dudi-palermo',
    organizerSlug: 'giulia-agnello-naturopata',
    categorySlug: 'stem',
    styleSlug: 'natural-cooking-lab',
    title: localized('Natural Cooking Lab at Dudi', 'Laboratorio di cucina naturale da Dudi'),
    summary: localized(
      'Hands-on April cooking workshop centered on Easter eggs and natural ingredients for children 4+ and families.',
      'Laboratorio pratico di aprile centrato su uova di Pasqua e ingredienti naturali per bambini 4+ e famiglie.'
    ),
    level: 'open',
    language: 'Italian',
    format: 'in_person',
    bookingTargetSlug: 'dudi-laboratori',
    sourceUrl: 'https://www.libreriadudi.it/laboratori/',
    lastVerifiedAt: '2026-04-01T10:30:00+02:00',
    verificationStatus: 'verified',
    audience: 'families',
    attendanceModel: 'drop_in',
    ageMin: 4,
    ageMax: 14,
    ageBand: 'mixed-kids',
    guardianRequired: true,
    priceNote: localized('EUR 15. Sibling discount: EUR 5 off.', 'EUR 15. Riduzione fratelli e sorelle: EUR 5.'),
    scheduleKind: 'seasonal',
    venueSlug: 'libreria-dudi-palermo',
    instructorSlug: 'giulia-agnello-naturopata'
  },
  {
    slug: 'giulia-agnello-natural-cooking-palazzo-lampedusa',
    citySlug: 'palermo',
    placeSlug: 'palazzo-lampedusa',
    organizerSlug: 'giulia-agnello-naturopata',
    categorySlug: 'stem',
    styleSlug: 'natural-cooking-lab',
    title: localized('Natural Cooking Lab at Palazzo Lampedusa', 'Laboratorio di cucina naturale a Palazzo Lampedusa'),
    summary: localized(
      'April family cooking slot focused on brioches and cocoa spread in a historic central venue.',
      'Slot family di aprile dedicato a brioche e crema al cacao in una venue storica del centro.'
    ),
    level: 'open',
    language: 'Italian',
    format: 'in_person',
    bookingTargetSlug: 'palazzo-lampedusa-info',
    sourceUrl: 'https://www.indigorooms.it/palazzo-lampedusa-palermo/',
    lastVerifiedAt: '2026-04-01T10:30:00+02:00',
    verificationStatus: 'verified',
    audience: 'families',
    attendanceModel: 'drop_in',
    ageMin: 0,
    ageMax: 14,
    ageBand: 'mixed-kids',
    guardianRequired: true,
    priceNote: localized('EUR 15. Sibling discount: EUR 5 off.', 'EUR 15. Riduzione fratelli e sorelle: EUR 5.'),
    scheduleKind: 'seasonal',
    venueSlug: 'palazzo-lampedusa',
    instructorSlug: 'giulia-agnello-naturopata'
  },
  {
    slug: 'giulia-agnello-natural-cooking-elibe',
    citySlug: 'palermo',
    placeSlug: 'elibe-spazio-maternage',
    organizerSlug: 'giulia-agnello-naturopata',
    categorySlug: 'stem',
    styleSlug: 'natural-cooking-lab',
    title: localized('Natural Cooking Lab at Elibe', 'Laboratorio di cucina naturale da Elibe'),
    summary: localized(
      'Younger-family April cooking lab focused on lentil-and-vegetable bites in a maternage setting.',
      'Laboratorio di aprile per famiglie piu giovani centrato su polpette di lenticchie e verdure in uno spazio maternage.'
    ),
    level: 'open',
    language: 'Italian',
    format: 'in_person',
    bookingTargetSlug: 'elibe-corsi',
    sourceUrl: 'https://www.elibepalermo.it/corsi-elibe-palermo/',
    lastVerifiedAt: '2026-04-01T10:30:00+02:00',
    verificationStatus: 'verified',
    audience: 'families',
    attendanceModel: 'drop_in',
    ageMin: 1,
    ageMax: 14,
    ageBand: 'mixed-kids',
    guardianRequired: true,
    priceNote: localized('EUR 15. Sibling discount: EUR 5 off.', 'EUR 15. Riduzione fratelli e sorelle: EUR 5.'),
    scheduleKind: 'seasonal',
    venueSlug: 'elibe-spazio-maternage',
    instructorSlug: 'giulia-agnello-naturopata'
  },
  {
    slug: 'giulia-agnello-natural-cooking-radici',
    citySlug: 'palermo',
    placeSlug: 'radici-museo-natura-place',
    organizerSlug: 'giulia-agnello-naturopata',
    categorySlug: 'stem',
    styleSlug: 'natural-cooking-lab',
    title: localized('Natural Cooking Lab at Radici', 'Laboratorio di cucina naturale da Radici'),
    summary: localized(
      'April family lab focused on vegetarian spring rolls with a practical, seasonal kitchen approach.',
      'Laboratorio family di aprile dedicato agli involtini primavera vegetariani con un approccio pratico e stagionale.'
    ),
    level: 'open',
    language: 'Italian',
    format: 'in_person',
    bookingTargetSlug: 'radici-attivita',
    sourceUrl: 'https://radicimuseo.it/attivita/',
    lastVerifiedAt: '2026-04-01T10:30:00+02:00',
    verificationStatus: 'verified',
    audience: 'families',
    attendanceModel: 'drop_in',
    ageMin: 5,
    ageMax: 14,
    ageBand: 'mixed-kids',
    guardianRequired: true,
    priceNote: localized('EUR 15. Sibling discount: EUR 5 off.', 'EUR 15. Riduzione fratelli e sorelle: EUR 5.'),
    scheduleKind: 'seasonal',
    venueSlug: 'radici-museo-natura-place',
    instructorSlug: 'giulia-agnello-naturopata'
  }
];

export const chefamoOccurrences: Occurrence[] = [
  buildOccurrence('teatro-massimo-family-tour-sat', chefamoPrograms[0], nextWeekday(6, 10, 30, 40)),
  buildOccurrence('teatro-massimo-family-tour-sun', chefamoPrograms[0], nextWeekday(7, 11, 20, 40)),
  buildOccurrence('planetario-weekend-show-sat', chefamoPrograms[1], nextWeekday(6, 17, 0, 60)),
  buildOccurrence('planetario-weekend-show-sun', chefamoPrograms[1], nextWeekday(7, 12, 0, 60)),
  buildOccurrence('minimupa-creative-lab-sat', chefamoPrograms[2], nextWeekday(6, 10, 30, 90)),
  buildOccurrence('biblioteca-storytime-wed', chefamoPrograms[3], nextWeekday(3, 16, 30, 45)),
  buildOccurrence('marionette-weekend-show-sat', chefamoPrograms[4], nextWeekday(6, 16, 30, 60)),
  buildOccurrence('marionette-weekend-show-sun', chefamoPrograms[4], nextWeekday(7, 12, 0, 60)),
  buildOccurrence('palermo-kids-coding-club-sat', chefamoPrograms[6], nextWeekday(6, 10, 0, 90)),
  buildOccurrence('circo-pificio-circomotricita-tue', chefamoPrograms[7], nextWeekday(2, 17, 0, 60)),
  buildOccurrence('spazio-terra-aerial-lab-sat', chefamoPrograms[8], nextWeekday(6, 10, 30, 60)),
  buildOccurrence('diaria-contemporary-dance-mon', chefamoPrograms[9], nextWeekday(1, 17, 0, 60)),
  buildOccurrence('diaria-contemporary-dance-wed', chefamoPrograms[9], nextWeekday(3, 17, 0, 60)),
  buildOccurrence('diaria-capoeira-mon', chefamoPrograms[10], nextWeekday(1, 16, 45, 60)),
  buildOccurrence('diaria-capoeira-thu', chefamoPrograms[10], nextWeekday(4, 16, 45, 60)),
  buildOccurrence('diaria-dance-foundations-tue', chefamoPrograms[11], nextWeekday(2, 16, 30, 60)),
  buildOccurrence('diaria-dance-pedagogy-wed', chefamoPrograms[12], nextWeekday(3, 16, 0, 60)),
  buildOccurrence('giulia-dudi-natural-cooking-2026-04-04', chefamoPrograms[18], {
    startAt: '2026-04-04T17:00:00+02:00',
    endAt: '2026-04-04T18:00:00+02:00'
  }),
  buildOccurrence('giulia-palazzo-lampedusa-natural-cooking-2026-04-10', chefamoPrograms[19], {
    startAt: '2026-04-10T17:45:00+02:00',
    endAt: '2026-04-10T18:45:00+02:00'
  }),
  buildOccurrence('giulia-elibe-natural-cooking-2026-04-13', chefamoPrograms[20], {
    startAt: '2026-04-13T16:30:00+02:00',
    endAt: '2026-04-13T17:30:00+02:00'
  }),
  buildOccurrence('giulia-radici-natural-cooking-2026-04-23', chefamoPrograms[21], {
    startAt: '2026-04-23T17:45:00+02:00',
    endAt: '2026-04-23T18:45:00+02:00'
  })
];

export const chefamoCollections: EditorialCollection[] = [
  {
    slug: 'weekend-families',
    citySlug: 'palermo',
    title: localized('Weekend families', 'Weekend in famiglia'),
    description: localized('Shortlisted Palermo plans that work best on Saturday and Sunday.', 'Selezione di piani palermitani che funzionano meglio il sabato e la domenica.'),
    cta: localized('Open weekend plans', 'Apri i piani del weekend'),
    kind: 'rule'
  },
  {
    slug: 'all-weather-picks',
    citySlug: 'palermo',
    title: localized('All-weather picks', 'Picks per ogni meteo'),
    description: localized('Indoor options you can trust when the forecast turns or energy drops.', 'Opzioni indoor affidabili quando il meteo gira o cala l energia.'),
    cta: localized('See indoor picks', 'Vedi i posti indoor'),
    kind: 'editorial'
  },
  {
    slug: 'after-school-active',
    citySlug: 'palermo',
    title: localized('After-school active', 'Doposcuola attivo'),
    description: localized(
      'Movement, dance, capoeira, and coordination picks that fit the weekday family schedule.',
      'Picks di movimento, danza, capoeira e coordinazione che stanno dentro l agenda feriale di famiglia.'
    ),
    cta: localized('Open active picks', 'Apri i pick attivi'),
    kind: 'rule'
  }
];
