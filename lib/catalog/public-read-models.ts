import { unstable_cache, revalidateTag } from 'next/cache';

import { getCatalogSnapshot } from '@/lib/catalog/repository';
import {
  buildPublicCitySearchIndex,
  buildPublicCitySnapshot,
  type PublicCitySearchIndex,
  type PublicCitySnapshot
} from '@/lib/catalog/public-models';

const tagsForCity = (citySlug: string) => [
  `city:${citySlug}:public`,
  `city:${citySlug}:classes`,
  `city:${citySlug}:places`,
  `city:${citySlug}:organizers`
];

const revalidatePublicCityTags = (citySlug: string) => {
  for (const tag of tagsForCity(citySlug)) {
    try {
      revalidateTag(tag);
    } catch {
      // Rebuilds from scripts or cron can run outside request lifecycle.
    }
  }
};

export const getPublicCitySnapshot = async (citySlug: string) =>
  unstable_cache(
    async () => {
      const snapshot = buildPublicCitySnapshot(await getCatalogSnapshot(), citySlug);
      return snapshot;
    },
    [`public-city-snapshot:${citySlug}`],
    { tags: tagsForCity(citySlug), revalidate: 60 * 30 }
  )();

export const getPublicCitySearchIndex = async (citySlug: string) =>
  unstable_cache(
    async () => {
      const snapshot = await getPublicCitySnapshot(citySlug);
      if (!snapshot) return null;
      return buildPublicCitySearchIndex(snapshot);
    },
    [`public-city-search-index:${citySlug}`],
    { tags: tagsForCity(citySlug), revalidate: 60 * 30 }
  )();

export const rebuildPublicCityReadModels = async (citySlug: string) => {
  const snapshot = await getPublicCitySnapshot(citySlug);
  if (!snapshot) return null;

  const searchIndex: PublicCitySearchIndex = buildPublicCitySearchIndex(snapshot);
  revalidatePublicCityTags(citySlug);

  return {
    snapshot,
    searchIndex
  };
};

export const getPublicSnapshotRouteTags = (citySlug: string) => tagsForCity(citySlug);
export { applyPublicCityFilters } from '@/lib/catalog/public-models';
export type { PublicCitySearchIndex, PublicCitySnapshot };
