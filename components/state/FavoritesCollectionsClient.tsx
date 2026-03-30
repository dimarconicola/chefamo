'use client';

import NextLink from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { readStoredFavorites } from '@/components/state/storage';

interface FavoritesCollectionsClientProps {
  signedInEmail: string;
  initialFavoriteKeys: string[];
  places: Array<{ slug: string; title: string; href: string; meta: string }>;
  organizers: Array<{ slug: string; title: string; href: string; meta: string }>;
  programs: Array<{ id: string; title: string; href: string; meta: string }>;
  copy: {
    favoritesStudios: string;
    favoritesTeachers: string;
    favoritesClasses: string;
    noFavorites: string;
  };
}

export function FavoritesCollectionsClient({
  signedInEmail,
  initialFavoriteKeys,
  places,
  organizers,
  programs,
  copy
}: FavoritesCollectionsClientProps) {
  const [favoriteKeys, setFavoriteKeys] = useState(initialFavoriteKeys);

  useEffect(() => {
    const localFavoriteKeys = readStoredFavorites(signedInEmail);

    setFavoriteKeys([...new Set([...initialFavoriteKeys, ...localFavoriteKeys])]);
  }, [initialFavoriteKeys, signedInEmail]);

  const placeFavorites = useMemo(
    () =>
      favoriteKeys
        .filter((key) => key.startsWith('place:'))
        .map((key) => places.find((place) => place.slug === key.replace('place:', '')))
        .filter((item): item is (typeof places)[number] => Boolean(item)),
    [favoriteKeys, places]
  );
  const organizerFavorites = useMemo(
    () =>
      favoriteKeys
        .filter((key) => key.startsWith('organizer:'))
        .map((key) => organizers.find((organizer) => organizer.slug === key.replace('organizer:', '')))
        .filter((item): item is (typeof organizers)[number] => Boolean(item)),
    [favoriteKeys, organizers]
  );
  const programFavorites = useMemo(
    () =>
      favoriteKeys
        .filter((key) => key.startsWith('program:'))
        .map((key) => programs.find((program) => program.id === key.replace('program:', '')))
        .filter((item): item is (typeof programs)[number] => Boolean(item)),
    [favoriteKeys, programs]
  );
  return (
    <section className="saved-grid">
      <section className="panel saved-section-panel">
        <div className="saved-section-header">
          <p className="eyebrow">{copy.favoritesStudios}</p>
        </div>
        {placeFavorites.length > 0 ? (
          <div className="stack-list">
            {placeFavorites.map((item) => (
              <NextLink href={item.href} key={`place:${item.href}`} className="list-link">
                <strong>{item.title}</strong>
                <span>{item.meta}</span>
              </NextLink>
            ))}
          </div>
        ) : (
          <p className="muted saved-empty-copy">{copy.noFavorites}</p>
        )}
      </section>

      <section className="panel saved-section-panel">
        <div className="saved-section-header">
          <p className="eyebrow">{copy.favoritesTeachers}</p>
        </div>
        {organizerFavorites.length > 0 ? (
          <div className="stack-list">
            {organizerFavorites.map((item) => (
              <NextLink href={item.href} key={`organizer:${item.href}`} className="list-link">
                <strong>{item.title}</strong>
                <span>{item.meta}</span>
              </NextLink>
            ))}
          </div>
        ) : (
          <p className="muted saved-empty-copy">{copy.noFavorites}</p>
        )}
      </section>

      <section className="panel saved-section-panel">
        <div className="saved-section-header">
          <p className="eyebrow">{copy.favoritesClasses}</p>
        </div>
        {programFavorites.length > 0 ? (
          <div className="stack-list">
            {programFavorites.map((item) => (
              <NextLink href={item.href} key={`program:${item.href}`} className="list-link">
                <strong>{item.title}</strong>
                <span>{item.meta}</span>
              </NextLink>
            ))}
          </div>
        ) : (
          <p className="muted saved-empty-copy">{copy.noFavorites}</p>
        )}
      </section>
    </section>
  );
}
