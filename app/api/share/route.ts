import { z } from 'zod';

import { apiHandler } from '@/lib/errors/api-handler';
import { appendOutboundEvent } from '@/lib/runtime/store';

const schema = z.object({
  occurrenceId: z.string().min(1, 'Occurrence ID is required'),
  venueSlug: z.string().min(1, 'Venue slug is required'),
  citySlug: z.string().min(1, 'City slug is required'),
  categorySlug: z.string().min(1, 'Category slug is required'),
  href: z.string().url('Invalid URL'),
  method: z.enum(['native', 'copy']).optional()
});

export const POST = apiHandler(async (request) => {
  const raw = request.headers.get('content-type')?.includes('application/json')
    ? await request.json()
    : JSON.parse(await request.text());

  const parsed = schema.parse(raw);

  await appendOutboundEvent({
    occurrenceId: parsed.occurrenceId,
    sessionId: parsed.occurrenceId,
    programSlug: undefined,
    placeSlug: parsed.venueSlug,
    venueSlug: parsed.venueSlug,
    citySlug: parsed.citySlug,
    categorySlug: parsed.categorySlug,
    eventKind: 'share',
    shareMethod: parsed.method ?? 'copy',
    targetType: 'website',
    href: parsed.href,
    createdAt: new Date().toISOString()
  });

  return {
    status: 200,
    data: {
      ok: true,
      message: 'Share recorded',
      method: parsed.method ?? 'copy'
    }
  };
});
