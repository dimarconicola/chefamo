import { ImageResponse } from 'next/og';

import { getCatalogSnapshot } from '@/lib/catalog/repository';
import { resolveOccurrenceCardDataFromSnapshot } from '@/lib/catalog/session-card-data';
import { env } from '@/lib/env';
import { resolveLocale } from '@/lib/i18n/routing';
import { formatSessionTime } from '@/lib/ui/format';

export const alt = 'chefamo activity preview';
export const size = {
  width: 1200,
  height: 630
};
export const contentType = 'image/png';

const getAgeLabel = (locale: 'it' | 'en', ageMin?: number, ageMax?: number, ageBand?: string) => {
  if (typeof ageMin === 'number' && typeof ageMax === 'number') {
    return locale === 'it' ? `${ageMin}-${ageMax} anni` : `${ageMin}-${ageMax}`;
  }

  if (!ageBand) return locale === 'it' ? 'Per famiglie' : 'Family-friendly';

  const labels = {
    it: {
      '0-2': '0-2 anni',
      '3-5': '3-5 anni',
      '6-10': '6-10 anni',
      '11-14': '11-14 anni',
      'mixed-kids': '3-14 anni'
    },
    en: {
      '0-2': '0-2',
      '3-5': '3-5',
      '6-10': '6-10',
      '11-14': '11-14',
      'mixed-kids': '3-14'
    }
  } as const;

  return labels[locale][ageBand as keyof (typeof labels)[typeof locale]] ?? (locale === 'it' ? 'Per famiglie' : 'Family-friendly');
};

const toneByCategory = {
  movement: ['#ff815d', '#ffcc70'],
  stem: ['#1c96aa', '#8de3d1'],
  reading: ['#e55d95', '#ffc4df'],
  culture: ['#4056f4', '#98b3ff'],
  outdoors: ['#4e944f', '#d8f3a1']
} as const;

export default async function Image({
  params
}: {
  params: Promise<{ locale: string; city: string; occurrenceId: string }>;
}) {
  const siteHost = new URL(env.siteUrl).host;
  const { locale: rawLocale, city: citySlug, occurrenceId } = await params;
  const locale = resolveLocale(rawLocale);
  const catalog = await getCatalogSnapshot();
  const occurrence = catalog.occurrences.find((item) => item.id === occurrenceId && item.citySlug === citySlug);

  const fallbackGradient = toneByCategory.stem;

  if (!occurrence) {
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            padding: 48,
            backgroundImage: `linear-gradient(135deg, ${fallbackGradient[0]}, ${fallbackGradient[1]})`,
            color: '#062b37',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', fontSize: 28, fontWeight: 700 }}>chefamo</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', fontSize: 64, fontWeight: 800, lineHeight: 1.05 }}>chefamo</div>
            <div style={{ display: 'flex', fontSize: 28 }}>Palermo-first activity guide for ages 0-14</div>
          </div>
        </div>
      ),
      size
    );
  }

  const resolved = resolveOccurrenceCardDataFromSnapshot(catalog, [occurrence]).get(occurrence.id);
  const gradient = toneByCategory[occurrence.categorySlug as keyof typeof toneByCategory] ?? fallbackGradient;
  const ageLabel = getAgeLabel(locale, occurrence.ageMin, occurrence.ageMax, occurrence.ageBand);
  const timeLabel = formatSessionTime(occurrence.startAt, locale);

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          padding: 42,
          backgroundImage: `linear-gradient(145deg, ${gradient[0]}, ${gradient[1]})`,
          color: '#08313b',
          position: 'relative',
          overflow: 'hidden',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -40,
            right: -20,
            width: 260,
            height: 260,
            borderRadius: 999,
            background: 'rgba(255,255,255,0.22)'
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -70,
            left: -30,
            width: 320,
            height: 320,
            borderRadius: 999,
            background: 'rgba(255,255,255,0.16)'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              padding: '14px 22px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.9)',
              fontSize: 24,
              fontWeight: 700
            }}
          >
            chefamo
          </div>
          <div
            style={{
              display: 'flex',
              padding: '12px 18px',
              borderRadius: 999,
              background: 'rgba(8,49,59,0.12)',
              fontSize: 24,
              fontWeight: 700
            }}
          >
            {ageLabel}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            maxWidth: 920
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap'
            }}
          >
            <div
              style={{
                display: 'flex',
                padding: '10px 16px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.9)',
                fontSize: 24
              }}
            >
              {timeLabel}
            </div>
            <div
              style={{
                display: 'flex',
                padding: '10px 16px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.9)',
                fontSize: 24
              }}
            >
              {resolved?.style.name[locale] ?? occurrence.categorySlug}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.03,
              letterSpacing: -1.8
            }}
          >
            {occurrence.title[locale]}
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: 32,
              lineHeight: 1.25,
              maxWidth: 860
            }}
          >
            {resolved?.place.name ?? citySlug} · {resolved?.organizer.name ?? 'chefamo'}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10
            }}
          >
            <div style={{ display: 'flex', fontSize: 24, opacity: 0.9 }}>{resolved?.place.address ?? 'Palermo'}</div>
            <div style={{ display: 'flex', fontSize: 22, opacity: 0.75 }}>
              {locale === 'it' ? 'Attività verificata per famiglie 0-14' : 'Verified activity for 0-14 families'}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              padding: '12px 18px',
              borderRadius: 999,
              background: 'rgba(8,49,59,0.12)',
              fontSize: 24,
              fontWeight: 700
            }}
          >
            {siteHost}
          </div>
        </div>
      </div>
    ),
    size
  );
}
