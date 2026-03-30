import { z } from 'zod';
import { apiHandler } from '@/lib/errors/api-handler';
import { AppError } from '@/lib/errors/handler';
import { logger } from '@/lib/observability/logger';
import { getSessionUser } from '@/lib/auth/session';
import { isUserFavorite, toggleUserFavorite } from '@/lib/runtime/store';
import { getRuntimeCapabilities } from '@/lib/runtime/capabilities';

const entityTypeSchema = z.enum(['place', 'program', 'organizer', 'venue', 'studio', 'teacher', 'class'], {
  message: 'Invalid entity type'
});

const querySchema = z.object({
  entityType: entityTypeSchema,
  entitySlug: z.string().min(1, 'Entity slug is required')
});

const normalizeEntityType = (entityType: z.infer<typeof entityTypeSchema>) => {
  if (entityType === 'venue' || entityType === 'studio') return 'place' as const;
  if (entityType === 'teacher') return 'organizer' as const;
  if (entityType === 'class') return 'program' as const;
  return entityType;
};

export const GET = apiHandler(async (request) => {
  const capabilities = await getRuntimeCapabilities();
  if (capabilities.authMode === 'unavailable' || capabilities.storeMode !== 'database') {
    throw new AppError('Salvataggio temporaneamente non disponibile.', 503, 'STORE_UNAVAILABLE');
  }

  const user = await getSessionUser();
  if (!user) {
    logger.info('Unauthorized favorites check - no session');
    throw new AppError('Accesso richiesto.', 401, 'AUTH_REQUIRED');
  }

  const url = new URL(request.url);
  const parsed = querySchema.parse({
    entityType: url.searchParams.get('entityType'),
    entitySlug: url.searchParams.get('entitySlug')
  });
  const entityType = normalizeEntityType(parsed.entityType);

  const saved = await isUserFavorite(user.id, entityType, parsed.entitySlug);

  return {
    status: 200,
    data: {
      saved,
      entityType,
      entitySlug: parsed.entitySlug
    }
  };
});

export const POST = apiHandler(async (request) => {
  const capabilities = await getRuntimeCapabilities();
  if (capabilities.authMode === 'unavailable' || capabilities.storeMode !== 'database') {
    throw new AppError('Salvataggio temporaneamente non disponibile.', 503, 'STORE_UNAVAILABLE');
  }

  const user = await getSessionUser();
  if (!user) {
    logger.info('Unauthorized favorite toggle - no session');
    throw new AppError('Accesso richiesto.', 401, 'AUTH_REQUIRED');
  }

  const parsed = querySchema.parse(await request.json());
  const entityType = normalizeEntityType(parsed.entityType);
  const saved = await toggleUserFavorite(user.id, entityType, parsed.entitySlug);

  logger.info('User favorite toggled', {
    userId: user.id,
    entityType,
    entitySlug: parsed.entitySlug,
    saved
  });

  return {
    status: 200,
    data: {
      saved,
      entityType,
      entitySlug: parsed.entitySlug,
      message: saved ? 'Added to favorites' : 'Removed from favorites'
    }
  };
});
