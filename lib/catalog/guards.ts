import { notFound } from 'next/navigation';

import { getCity } from '@/lib/catalog/server-data';

export const requirePublicCityServer = async (citySlug: string) => {
  const city = await getCity(citySlug);
  if (!city || city.status !== 'public') {
    notFound();
  }
  return city;
};
