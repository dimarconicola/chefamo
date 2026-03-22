import type { Locale } from '@/lib/catalog/types';

export type LocalizedPriceNote = Partial<Record<Locale, string>>;

const STOCK_PRICE_NOTE_TRANSLATIONS = [
  {
    keys: ['not published on captured pages', 'price not published online'],
    value: {
      en: 'Price not published online.',
      it: 'Prezzo non pubblicato online.'
    }
  },
  {
    keys: ['carnet from 12 eur; monthly open 70 eur'],
    value: {
      en: 'Passes from EUR 12; monthly open plan EUR 70.',
      it: 'Carnet da 12 EUR; mensile open a 70 EUR.'
    }
  },
  {
    keys: ['8 lessons 65 eur; 16 lessons 110 eur'],
    value: {
      en: '8-class pass EUR 65; 16-class pass EUR 110.',
      it: 'Carnet 8 lezioni a 65 EUR; carnet 16 lezioni a 110 EUR.'
    }
  }
] as const;

const ITALIAN_HINTS = [
  'prezzo',
  'lezione',
  'lezioni',
  'mensili',
  'mensile',
  'quota',
  'annua',
  'corso',
  'costo',
  'contatti',
  'piu',
  'prenotazione',
  'spot'
];

const ENGLISH_HINTS = ['price', 'pricing', 'monthly', 'captured pages', 'passes', 'from eur', 'book', 'trial lesson', 'details'];

const canonicalize = (value: string) =>
  value
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[’`]/g, "'")
    .replace(/[–—]/g, '-')
    .toLowerCase();

const clean = (value?: string | null) => {
  if (!value) return undefined;
  const next = value.trim().replace(/\s+/g, ' ');
  return next.length > 0 ? next : undefined;
};

const findStockTranslation = (value?: string | null) => {
  const candidate = clean(value);
  if (!candidate) return undefined;
  const key = canonicalize(candidate);
  return STOCK_PRICE_NOTE_TRANSLATIONS.find((item) => item.keys.some((entry) => entry === key))?.value;
};

const includesHint = (value: string, hints: string[]) => {
  const candidate = canonicalize(value);
  return hints.some((hint) => candidate.includes(hint));
};

export const looksItalianPriceNote = (value: string) => includesHint(value, ITALIAN_HINTS);
export const looksEnglishPriceNote = (value: string) => includesHint(value, ENGLISH_HINTS);

export const normalizePriceNote = (value?: LocalizedPriceNote | null): LocalizedPriceNote | undefined => {
  const rawIt = clean(value?.it);
  const rawEn = clean(value?.en);

  if (!rawIt && !rawEn) return undefined;

  const stock = findStockTranslation(rawIt) ?? findStockTranslation(rawEn);
  if (stock) return stock;

  if (rawIt && rawEn && canonicalize(rawIt) === canonicalize(rawEn)) {
    if (looksItalianPriceNote(rawIt) && !looksEnglishPriceNote(rawIt)) {
      return { it: rawIt };
    }

    if (looksEnglishPriceNote(rawEn) && !looksItalianPriceNote(rawEn)) {
      return { en: rawEn };
    }
  }

  const next: LocalizedPriceNote = {};

  if (rawIt) next.it = rawIt;
  if (rawEn) next.en = rawEn;

  if (!next.it && rawEn && looksItalianPriceNote(rawEn) && !looksEnglishPriceNote(rawEn)) {
    next.it = rawEn;
  }

  if (!next.en && rawIt && looksEnglishPriceNote(rawIt) && !looksItalianPriceNote(rawIt)) {
    next.en = rawIt;
  }

  return Object.keys(next).length > 0 ? next : undefined;
};

export const getPriceNoteForLocale = (value: LocalizedPriceNote | undefined, locale: Locale) => normalizePriceNote(value)?.[locale];

export const normalizeSinglePriceText = (value?: string | null) => normalizePriceNote({ en: value ?? undefined, it: value ?? undefined });
