import { NextResponse } from 'next/server';

import { getSupabaseServerClient, isSupabaseConfigured } from '@/lib/auth/supabase';
import { env } from '@/lib/env';

export async function POST(request: Request) {
  const formData = await request.formData();
  const locale = String(formData.get('locale') ?? 'it');
  const provider = String(formData.get('provider') ?? 'google');

  if (!isSupabaseConfigured) {
    return NextResponse.redirect(new URL(`/${locale}/sign-in`, request.url));
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.redirect(new URL(`/${locale}/sign-in`, request.url));
  }

  const next = encodeURIComponent(`/${locale}/favorites`);
  let data: { url?: string | null } = {};
  try {
    const result = await supabase.auth.signInWithOAuth({
      provider: provider === 'google' ? 'google' : 'google',
      options: {
        redirectTo: `${env.siteUrl}/auth/callback?next=${next}`
      }
    });
    data = result.data;
  } catch {
    return NextResponse.redirect(new URL(`/${locale}/sign-in?error=1`, request.url));
  }

  if (!data.url) {
    return NextResponse.redirect(new URL(`/${locale}/sign-in?error=1`, request.url));
  }

  return NextResponse.redirect(data.url);
}
