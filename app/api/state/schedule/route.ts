import { z } from 'zod';
import { apiHandler } from '@/lib/errors/api-handler';
import { AppError } from '@/lib/errors/handler';
import { logger } from '@/lib/observability/logger';
import { getSessionUser } from '@/lib/auth/session';
import { isUserScheduleSaved, toggleUserSchedule } from '@/lib/runtime/store';
import { getRuntimeCapabilities } from '@/lib/runtime/capabilities';

const querySchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required')
});

export const GET = apiHandler(async (request) => {
  const capabilities = await getRuntimeCapabilities();
  if (capabilities.authMode === 'unavailable' || capabilities.storeMode !== 'database') {
    throw new AppError('Salvataggio temporaneamente non disponibile.', 503, 'STORE_UNAVAILABLE');
  }

  const user = await getSessionUser();
  if (!user) {
    logger.info('Unauthorized schedule check - no session');
    throw new AppError('Accesso richiesto.', 401, 'AUTH_REQUIRED');
  }

  const url = new URL(request.url);
  const parsed = querySchema.parse({
    sessionId: url.searchParams.get('sessionId')
  });

  const saved = await isUserScheduleSaved(user.id, parsed.sessionId);

  return {
    status: 200,
    data: {
      saved,
      sessionId: parsed.sessionId
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
    logger.info('Unauthorized schedule toggle - no session');
    throw new AppError('Accesso richiesto.', 401, 'AUTH_REQUIRED');
  }

  const parsed = querySchema.parse(await request.json());
  const saved = await toggleUserSchedule(user.id, parsed.sessionId);

  logger.info('User schedule toggled', {
    userId: user.id,
    sessionId: parsed.sessionId,
    saved
  });

  return {
    status: 200,
    data: {
      saved,
      sessionId: parsed.sessionId,
      message: saved ? 'Added to schedule' : 'Removed from schedule'
    }
  };
});
