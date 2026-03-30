const parseStoredList = (value: string | null) => {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

const unique = (items: string[]) => [...new Set(items)];

export const favoriteStorageKey = (email: string) => `chefamo:${email}:favorites`;
export const scheduleStorageKey = (email: string) => `chefamo:${email}:plan`;
export const toFavoriteKey = (entityType: 'place' | 'program' | 'organizer', entitySlug: string) => `${entityType}:${entitySlug}`;

export const readStoredFavorites = (email: string) => {
  if (typeof window === 'undefined') return [];
  return unique(parseStoredList(window.localStorage.getItem(favoriteStorageKey(email))));
};

export const writeStoredFavorites = (email: string, values: string[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(favoriteStorageKey(email), JSON.stringify(unique(values)));
};

export const syncStoredFavorite = (email: string, key: string, saved: boolean) => {
  const current = new Set(readStoredFavorites(email));
  if (saved) {
    current.add(key);
  } else {
    current.delete(key);
  }
  writeStoredFavorites(email, Array.from(current));
};

export const toggleStoredFavorite = (email: string, key: string) => {
  const current = new Set(readStoredFavorites(email));
  if (current.has(key)) {
    current.delete(key);
    writeStoredFavorites(email, Array.from(current));
    return false;
  }

  current.add(key);
  writeStoredFavorites(email, Array.from(current));
  return true;
};

export const readStoredSchedule = (email: string) => {
  if (typeof window === 'undefined') return [];
  return unique(parseStoredList(window.localStorage.getItem(scheduleStorageKey(email))));
};

export const writeStoredSchedule = (email: string, values: string[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(scheduleStorageKey(email), JSON.stringify(unique(values)));
};

export const syncStoredSchedule = (email: string, occurrenceId: string, saved: boolean) => {
  const current = new Set(readStoredSchedule(email));
  if (saved) {
    current.add(occurrenceId);
  } else {
    current.delete(occurrenceId);
  }
  writeStoredSchedule(email, Array.from(current));
};

export const toggleStoredSchedule = (email: string, occurrenceId: string) => {
  const current = new Set(readStoredSchedule(email));
  if (current.has(occurrenceId)) {
    current.delete(occurrenceId);
    writeStoredSchedule(email, Array.from(current));
    return false;
  }

  current.add(occurrenceId);
  writeStoredSchedule(email, Array.from(current));
  return true;
};
