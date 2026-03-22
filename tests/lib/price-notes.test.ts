import { describe, expect, it } from 'vitest';

import { getPriceNoteForLocale, normalizePriceNote } from '@/lib/catalog/price-notes';

describe('price note normalization', () => {
  it('translates stock placeholder copy into curated Italian and English text', () => {
    const normalized = normalizePriceNote({
      en: 'Not published on captured pages',
      it: 'Not published on captured pages'
    });

    expect(normalized).toEqual({
      en: 'Price not published online.',
      it: 'Prezzo non pubblicato online.'
    });
  });

  it('keeps English-only arbitrary pricing hidden from Italian UI', () => {
    const normalized = normalizePriceNote({
      en: 'Pricing available via direct message'
    });

    expect(getPriceNoteForLocale(normalized, 'it')).toBeUndefined();
    expect(getPriceNoteForLocale(normalized, 'en')).toBe('Pricing available via direct message');
  });

  it('translates recurring stock pricing copy for Italian surfaces', () => {
    const normalized = normalizePriceNote({
      en: 'Carnet from 12 EUR; monthly open 70 EUR',
      it: 'Carnet from 12 EUR; monthly open 70 EUR'
    });

    expect(getPriceNoteForLocale(normalized, 'it')).toBe('Carnet da 12 EUR; mensile open a 70 EUR.');
  });

  it('translates recurring lesson-pack copy for Italian surfaces', () => {
    const normalized = normalizePriceNote({
      en: '8 lessons 65 EUR; 16 lessons 110 EUR',
      it: '8 lessons 65 EUR; 16 lessons 110 EUR'
    });

    expect(getPriceNoteForLocale(normalized, 'it')).toBe('Carnet 8 lezioni a 65 EUR; carnet 16 lezioni a 110 EUR.');
  });
});
