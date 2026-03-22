import { NextResponse } from 'next/server';

import { getSupabaseServerClient, isSupabaseConfigured } from '@/lib/auth/supabase';
import { resolveLocale } from '@/lib/i18n/routing';

const safePath = (value: string | null, fallback: string) => {
  if (!value) return fallback;
  if (!value.startsWith('/')) return fallback;
  if (value.startsWith('//')) return fallback;
  return value;
};

const localeFromPath = (value: string) => {
  const segment = value.split('/').filter(Boolean)[0];
  return resolveLocale(segment ?? 'it');
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = safePath(url.searchParams.get('next'), '/it/favorites');
  const locale = localeFromPath(next);

  if (!isSupabaseConfigured) {
    return NextResponse.redirect(new URL(`/${locale}/sign-in`, url.origin));
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.redirect(new URL(`/${locale}/sign-in`, url.origin));
  }

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
