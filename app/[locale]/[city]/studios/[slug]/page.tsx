import { redirect } from 'next/navigation';

export default async function LegacyStudioRedirect({
  params
}: {
  params: Promise<{ locale: string; city: string; slug: string }>;
}) {
  const { locale, city, slug } = await params;
  redirect(`/${locale}/${city}/places/${slug}`);
}
