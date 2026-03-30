import type { MetadataRoute } from 'next';

import { getCollections, getPublicCities } from '@/lib/catalog/server-data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const cities = await getPublicCities();
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? 'https://chefamo.vercel.app').replace(/\/$/, '');

  for (const locale of ['en', 'it']) {
    entries.push({ url: `${baseUrl}/${locale}` });
    entries.push({ url: `${baseUrl}/${locale}/who-we-are` });
    entries.push({ url: `${baseUrl}/${locale}/suggest-calendar` });
    for (const city of cities) {
      entries.push({ url: `${baseUrl}/${locale}/${city.slug}` });
      entries.push({ url: `${baseUrl}/${locale}/${city.slug}/activities` });
      entries.push({ url: `${baseUrl}/${locale}/${city.slug}/places` });
      entries.push({ url: `${baseUrl}/${locale}/${city.slug}/organizers` });
      const collections = await getCollections(city.slug);
      collections.forEach((collection) => {
        entries.push({ url: `${baseUrl}/${locale}/${city.slug}/collections/${collection.slug}` });
      });
    }
  }

  return entries;
}
