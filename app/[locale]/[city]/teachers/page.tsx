import { redirect } from 'next/navigation';

export default async function LegacyTeachersRedirect({ params }: { params: Promise<{ locale: string; city: string }> }) {
  const { locale, city } = await params;
  redirect(`/${locale}/${city}/organizers`);
}
