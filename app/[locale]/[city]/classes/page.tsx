import { redirect } from 'next/navigation';

export default async function LegacyClassesRedirect({ params }: { params: Promise<{ locale: string; city: string }> }) {
  const { locale, city } = await params;
  redirect(`/${locale}/${city}/activities`);
}
