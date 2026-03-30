import { DateTime } from 'luxon';

import type {
  ActivityCategory,
  BookingTarget,
  EditorialCollection,
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
    name: localized('Movement', 'Movimento'),
    description: localized('Circo, dance, capoeira, and body-led after-school activities.', 'Circo, danza, capoeira e attivita motorie per il doposcuola.'),
    visibility: 'live',
    heroMetric: localized('Physical activities grouped by age band.', 'Attivita fisiche raggruppate per fascia d eta.')
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
  { slug: 'planetarium-show', categorySlug: 'stem', name: localized('Planetarium show', 'Spettacolo al planetario'), description: localized('Dome-based astronomy format for families.', 'Format sotto cupola dedicato all astronomia per famiglie.') },
  { slug: 'hands-on-lab', categorySlug: 'stem', name: localized('Hands-on lab', 'Laboratorio hands-on'), description: localized('Interactive making or discovery lab.', 'Laboratorio interattivo di scoperta o costruzione.') },
  { slug: 'storytime', categorySlug: 'reading', name: localized('Storytime', 'Letture animate'), description: localized('Reading-led session for young children and carers.', 'Sessione guidata da letture per bimbi piccoli e accompagnatori.') },
  { slug: 'puppet-theater', categorySlug: 'culture', name: localized('Puppet theater', 'Teatro dei pupi'), description: localized('Family theater rooted in Sicilian puppetry.', 'Teatro per famiglie radicato nella tradizione dei pupi siciliani.') },
  { slug: 'open-park-day', categorySlug: 'outdoors', name: localized('Open park day', 'Giornata al parco'), description: localized('Flexible outdoor time with family-friendly infrastructure.', 'Tempo flessibile all aperto con infrastruttura family-friendly.') },
  { slug: 'kids-coding', categorySlug: 'stem', name: localized('Kids coding', 'Coding per bambini'), description: localized('Guided digital creativity and problem-solving.', 'Creativita digitale guidata e problem solving.') }
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
  }
];

export const chefamoBookingTargets: BookingTarget[] = [
  { slug: 'teatro-massimo-booking', type: 'website', label: 'Teatro Massimo', href: 'https://www.teatromassimo.it/' },
  { slug: 'planetario-contact', type: 'email', label: 'planetariopalermo@gmail.com', href: 'mailto:planetariopalermo@gmail.com' },
  { slug: 'minimupa-booking', type: 'website', label: 'MiniMuPa', href: 'https://www.minimupa.it/' },
  { slug: 'biblioteca-contact', type: 'phone', label: '091 7408870', href: 'tel:+390917408870' },
  { slug: 'museo-marionette-contact', type: 'email', label: 'info@museomarionettepalermo.it', href: 'mailto:info@museomarionettepalermo.it' },
  { slug: 'villa-filippina-info', type: 'email', label: 'parcovillafilippina@gmail.com', href: 'mailto:parcovillafilippina@gmail.com' },
  { slug: 'kids-lab-booking', type: 'website', label: 'Palermo Kids Lab', href: 'https://www.palermokidslab.it/' }
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
  buildOccurrence('palermo-kids-coding-club-sat', chefamoPrograms[6], nextWeekday(6, 10, 0, 90))
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
  }
];
