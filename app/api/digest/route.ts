import { z } from 'zod';
import { apiHandler } from '@/lib/errors/api-handler';
import { AppError } from '@/lib/errors/handler';
import { appendDigestSubscription } from '@/lib/runtime/store';
import { getRuntimeCapabilities } from '@/lib/runtime/capabilities';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  locale: z.enum(['en', 'it'], { message: 'Locale must be "en" or "it"' }),
  citySlug: z.string().min(1, 'City slug is required'),
  preferences: z.array(z.string()).default([])
});

export const POST = apiHandler(async (request) => {
  const parsed = schema.parse(await request.json());
  const capabilities = await getRuntimeCapabilities();

  if (capabilities.storeMode !== 'database') {
    throw new AppError('Digest temporaneamente non disponibile.', 503, 'STORE_UNAVAILABLE');
  }

  const result = await appendDigestSubscription({
    ...parsed,
    createdAt: new Date().toISOString()
  });

  return {
    status: result.created ? 201 : 200,
    data: {
      ok: true,
      code: result.created ? 'DIGEST_SUBSCRIBED' : 'DIGEST_ALREADY_SUBSCRIBED',
      message: result.created ? 'Digest subscription created successfully' : 'Digest subscription already exists',
      email: parsed.email
    }
  };
});
