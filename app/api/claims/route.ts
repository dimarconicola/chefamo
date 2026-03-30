import { NextResponse } from 'next/server';
import { z } from 'zod';

import { appendClaim } from '@/lib/runtime/store';

const schema = z.object({
  placeSlug: z.string().min(1).optional(),
  studioSlug: z.string().min(1).optional(),
  locale: z.enum(['en', 'it']),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.string().min(1),
  notes: z.string().min(1)
}).refine((payload) => Boolean(payload.placeSlug ?? payload.studioSlug), {
  message: 'Place slug is required',
  path: ['placeSlug']
});

export async function POST(request: Request) {
  const parsed = schema.parse(await request.json());
  const placeSlug = parsed.placeSlug ?? parsed.studioSlug ?? '';
  await appendClaim({
    ...parsed,
    placeSlug,
    createdAt: new Date().toISOString()
  });
  return NextResponse.json({ ok: true });
}
