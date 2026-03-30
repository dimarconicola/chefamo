import { isCategoryInScope, isOccurrenceInScope, normalizeAttendanceModel } from '@/lib/catalog/policy';

type ImportKind = 'places' | 'organizers' | 'programs' | 'occurrences';

const IMPORT_HEADERS: Record<ImportKind, { required: readonly string[]; optional: readonly string[] }> = {
  places: {
    required: [
      'city_slug',
      'place_slug',
      'place_name',
      'neighborhood_slug',
      'address',
      'lat',
      'lng',
      'category_slug',
      'place_profile',
      'booking_target_href',
      'source_url',
      'last_verified_at',
      'verification_status'
    ],
    optional: ['style_slugs', 'tagline_it', 'tagline_en', 'description_it', 'description_en', 'good_anytime', 'price_note_it', 'price_note_en']
  },
  organizers: {
    required: ['city_slug', 'organizer_slug', 'organizer_name', 'source_url', 'last_verified_at'],
    optional: ['short_bio_it', 'short_bio_en', 'languages', 'specialties']
  },
  programs: {
    required: [
      'city_slug',
      'program_slug',
      'place_slug',
      'organizer_slug',
      'category_slug',
      'style_slug',
      'title',
      'audience',
      'attendance_model',
      'booking_target_slug',
      'source_url',
      'last_verified_at',
      'verification_status'
    ],
    optional: ['age_min', 'age_max', 'price_note_it', 'price_note_en', 'schedule_kind', 'language', 'format', 'level']
  },
  occurrences: {
    required: [
      'city_slug',
      'occurrence_id',
      'program_slug',
      'place_slug',
      'organizer_slug',
      'category_slug',
      'style_slug',
      'title',
      'start_at',
      'end_at',
      'level',
      'language',
      'format',
      'booking_target_slug',
      'source_url',
      'last_verified_at',
      'verification_status'
    ],
    optional: ['attendance_model', 'age_min', 'age_max', 'price_note_it', 'price_note_en']
  }
};

export interface ImportIssue {
  row: number;
  field?: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ImportValidationResult {
  ok: boolean;
  rows: number;
  headers: string[];
  missingHeaders: string[];
  warnings: ImportIssue[];
  errors: ImportIssue[];
  importKind?: ImportKind;
}

const splitCsvLine = (line: string) => {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
};

const isIsoDateTime = (value: string) => {
  if (!value) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && value.includes('T');
};

const isFiniteCoordinate = (value: string, bounds: { min: number; max: number }) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= bounds.min && parsed <= bounds.max;
};

const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
};

const getRows = (csv: string) => {
  const trimmed = csv.trim();
  if (!trimmed) return { headers: [] as string[], rows: [] as Record<string, string>[] };
  const [headerLine, ...rowLines] = trimmed.split(/\r?\n/);
  const headers = splitCsvLine(headerLine).map((header) => header.trim());
  const rows = rowLines
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const values = splitCsvLine(line);
      return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
    });
  return { headers, rows };
};

const resultFor = (
  headers: string[],
  rows: Record<string, string>[],
  requiredHeaders: readonly string[],
  optionalHeaders: readonly string[],
  warnings: ImportIssue[],
  errors: ImportIssue[],
  importKind: ImportKind
): ImportValidationResult => ({
  ok: errors.length === 0,
  rows: rows.length,
  headers: [...headers, ...optionalHeaders.filter((header) => headers.includes(header))],
  missingHeaders: requiredHeaders.filter((header) => !headers.includes(header)),
  warnings,
  errors,
  importKind
});

const validateAgeRange = (row: Record<string, string>, rowNumber: number, errors: ImportIssue[], warnings: ImportIssue[]) => {
  const ageMin = row.age_min ? Number(row.age_min) : undefined;
  const ageMax = row.age_max ? Number(row.age_max) : undefined;

  if (!Number.isFinite(ageMin) || !Number.isFinite(ageMax)) {
    warnings.push({
      row: rowNumber,
      field: 'age_min',
      message: 'Programs and occurrences should include age_min and age_max for 0-14 targeting.',
      severity: 'warning'
    });
    return;
  }

  if ((ageMin as number) < 0 || (ageMax as number) > 14 || (ageMin as number) > (ageMax as number)) {
    errors.push({
      row: rowNumber,
      field: 'age_min',
      message: 'Age range must stay within 0-14 and use a valid min/max order.',
      severity: 'error'
    });
  }
};

export const validatePlacesCsv = (csv: string): ImportValidationResult => {
  const { headers, rows } = getRows(csv);
  const warnings: ImportIssue[] = [];
  const errors: ImportIssue[] = [];
  const { required, optional } = IMPORT_HEADERS.places;

  if (headers.length === 0) {
    return resultFor(headers, rows, required, optional, warnings, [{ row: 0, message: 'CSV is empty.', severity: 'error' }], 'places');
  }

  const missingHeaders = required.filter((header) => !headers.includes(header));
  if (missingHeaders.length > 0) {
    errors.push({ row: 0, message: `Missing headers: ${missingHeaders.join(', ')}`, severity: 'error' });
  }

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    if (!isCategoryInScope(row.category_slug)) {
      errors.push({ row: rowNumber, field: 'category_slug', message: `Category ${row.category_slug} is out of chefamo scope.`, severity: 'error' });
    }
    if (!isFiniteCoordinate(row.lat, { min: -90, max: 90 })) {
      errors.push({ row: rowNumber, field: 'lat', message: 'Latitude must be a valid coordinate.', severity: 'error' });
    }
    if (!isFiniteCoordinate(row.lng, { min: -180, max: 180 })) {
      errors.push({ row: rowNumber, field: 'lng', message: 'Longitude must be a valid coordinate.', severity: 'error' });
    }
    if (!isHttpUrl(row.booking_target_href)) {
      errors.push({ row: rowNumber, field: 'booking_target_href', message: 'Booking target must be a valid URL.', severity: 'error' });
    }
    if (!isHttpUrl(row.source_url)) {
      errors.push({ row: rowNumber, field: 'source_url', message: 'Source URL must be a valid URL.', severity: 'error' });
    }
    if (!isIsoDateTime(row.last_verified_at)) {
      errors.push({ row: rowNumber, field: 'last_verified_at', message: 'last_verified_at must be a full ISO datetime.', severity: 'error' });
    }
    if (!row.price_note_it && !row.price_note_en) {
      warnings.push({ row: rowNumber, field: 'price_note_it', message: 'Pricing or access notes are recommended for public places.', severity: 'warning' });
    }
  });

  return resultFor(headers, rows, required, optional, warnings, errors, 'places');
};

export const validateOrganizersCsv = (csv: string): ImportValidationResult => {
  const { headers, rows } = getRows(csv);
  const warnings: ImportIssue[] = [];
  const errors: ImportIssue[] = [];
  const { required, optional } = IMPORT_HEADERS.organizers;

  if (headers.length === 0) {
    return resultFor(headers, rows, required, optional, warnings, [{ row: 0, message: 'CSV is empty.', severity: 'error' }], 'organizers');
  }

  const missingHeaders = required.filter((header) => !headers.includes(header));
  if (missingHeaders.length > 0) {
    errors.push({ row: 0, message: `Missing headers: ${missingHeaders.join(', ')}`, severity: 'error' });
  }

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    if (!isHttpUrl(row.source_url)) {
      errors.push({ row: rowNumber, field: 'source_url', message: 'Source URL must be a valid URL.', severity: 'error' });
    }
    if (!isIsoDateTime(row.last_verified_at)) {
      errors.push({ row: rowNumber, field: 'last_verified_at', message: 'last_verified_at must be a full ISO datetime.', severity: 'error' });
    }
  });

  return resultFor(headers, rows, required, optional, warnings, errors, 'organizers');
};

export const validateProgramsCsv = (csv: string): ImportValidationResult => {
  const { headers, rows } = getRows(csv);
  const warnings: ImportIssue[] = [];
  const errors: ImportIssue[] = [];
  const { required, optional } = IMPORT_HEADERS.programs;

  if (headers.length === 0) {
    return resultFor(headers, rows, required, optional, warnings, [{ row: 0, message: 'CSV is empty.', severity: 'error' }], 'programs');
  }

  const missingHeaders = required.filter((header) => !headers.includes(header));
  if (missingHeaders.length > 0) {
    errors.push({ row: 0, message: `Missing headers: ${missingHeaders.join(', ')}`, severity: 'error' });
  }

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const attendanceModel = normalizeAttendanceModel(row.attendance_model);
    const title = row.title || row.style_slug || row.category_slug;

    if (!isCategoryInScope(row.category_slug)) {
      errors.push({ row: rowNumber, field: 'category_slug', message: `Category ${row.category_slug} is out of chefamo scope.`, severity: 'error' });
    }

    if (!isOccurrenceInScope({
      categorySlug: row.category_slug,
      attendanceModel,
      ageMax: row.age_max ? Number(row.age_max) : undefined,
      title: { en: title, it: title }
    })) {
      errors.push({ row: rowNumber, field: 'title', message: 'Program is out of scope for current catalog policy.', severity: 'error' });
    }

    if (!isHttpUrl(row.source_url)) {
      errors.push({ row: rowNumber, field: 'source_url', message: 'Source URL must be a valid URL.', severity: 'error' });
    }
    if (!isIsoDateTime(row.last_verified_at)) {
      errors.push({ row: rowNumber, field: 'last_verified_at', message: 'last_verified_at must be a full ISO datetime.', severity: 'error' });
    }

    validateAgeRange(row, rowNumber, errors, warnings);

    if (!row.price_note_it && !row.price_note_en) {
      warnings.push({ row: rowNumber, field: 'price_note_it', message: 'Pricing guidance is recommended for public programs.', severity: 'warning' });
    }
  });

  return resultFor(headers, rows, required, optional, warnings, errors, 'programs');
};

export const validateOccurrencesCsv = (csv: string): ImportValidationResult => {
  const { headers, rows } = getRows(csv);
  const warnings: ImportIssue[] = [];
  const errors: ImportIssue[] = [];
  const { required, optional } = IMPORT_HEADERS.occurrences;

  if (headers.length === 0) {
    return resultFor(headers, rows, required, optional, warnings, [{ row: 0, message: 'CSV is empty.', severity: 'error' }], 'occurrences');
  }

  const missingHeaders = required.filter((header) => !headers.includes(header));
  if (missingHeaders.length > 0) {
    errors.push({ row: 0, message: `Missing headers: ${missingHeaders.join(', ')}`, severity: 'error' });
  }

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const attendanceModel = normalizeAttendanceModel(row.attendance_model);
    const title = row.title || row.style_slug || row.category_slug;

    if (!row.attendance_model) {
      warnings.push({
        row: rowNumber,
        field: 'attendance_model',
        message: 'Missing attendance_model. Import will default to drop_in.',
        severity: 'warning'
      });
    }

    if (!isCategoryInScope(row.category_slug)) {
      errors.push({ row: rowNumber, field: 'category_slug', message: `Category ${row.category_slug} is out of chefamo scope.`, severity: 'error' });
    }

    if (!isOccurrenceInScope({
      categorySlug: row.category_slug,
      attendanceModel,
      ageMax: row.age_max ? Number(row.age_max) : undefined,
      title: { en: title, it: title }
    })) {
      errors.push({ row: rowNumber, field: 'title', message: 'Occurrence is out of scope for current catalog policy.', severity: 'error' });
    }

    if (!isHttpUrl(row.source_url)) {
      errors.push({ row: rowNumber, field: 'source_url', message: 'Source URL must be a valid URL.', severity: 'error' });
    }
    if (!isIsoDateTime(row.start_at)) {
      errors.push({ row: rowNumber, field: 'start_at', message: 'start_at must be a full ISO datetime.', severity: 'error' });
    }
    if (!isIsoDateTime(row.end_at)) {
      errors.push({ row: rowNumber, field: 'end_at', message: 'end_at must be a full ISO datetime.', severity: 'error' });
    }
    if (!isIsoDateTime(row.last_verified_at)) {
      errors.push({ row: rowNumber, field: 'last_verified_at', message: 'last_verified_at must be a full ISO datetime.', severity: 'error' });
    }

    validateAgeRange(row, rowNumber, errors, warnings);

    if (!row.price_note_it && !row.price_note_en) {
      warnings.push({ row: rowNumber, field: 'price_note_it', message: 'Pricing guidance is recommended for public occurrences.', severity: 'warning' });
    }
  });

  return resultFor(headers, rows, required, optional, warnings, errors, 'occurrences');
};

const normalizeLegacyOccurrenceCsv = (csv: string) =>
  csv
    .replaceAll('venue_slug', 'place_slug')
    .replaceAll('venue_name', 'place_name')
    .replaceAll('booking_target_type', 'booking_target_slug')
    .replaceAll('session_id', 'occurrence_id')
    .replaceAll('instructor_slug', 'organizer_slug');

export const validateImportCsv = (csv: string): ImportValidationResult => {
  const { headers } = getRows(csv);

  if (headers.includes('place_profile')) return validatePlacesCsv(csv);
  if (headers.includes('organizer_slug') && headers.includes('organizer_name') && !headers.includes('program_slug')) return validateOrganizersCsv(csv);
  if (headers.includes('program_slug') && headers.includes('occurrence_id')) return validateOccurrencesCsv(csv);
  if (headers.includes('program_slug') && !headers.includes('start_at')) return validateProgramsCsv(csv);

  const normalizedLegacy = normalizeLegacyOccurrenceCsv(csv)
    .replaceAll('place_slug,place_name', 'place_slug,place_name')
    .replaceAll('place_slug,place_name', 'place_slug,place_name');
  const occurrenceCsv = normalizedLegacy
    .replace('city_slug,place_slug,place_name,neighborhood_slug,address,lat,lng,category_slug,style_slug,title,start_at,end_at,level,language,format,booking_target_slug,booking_target_href,source_url,last_verified_at,verification_status', 'city_slug,occurrence_id,program_slug,place_slug,organizer_slug,category_slug,style_slug,title,start_at,end_at,level,language,format,booking_target_slug,source_url,last_verified_at,verification_status')
    .replace(/^[^\n]*\n/, (headerLine) =>
      headerLine
        .replace('city_slug,venue_slug,venue_name,neighborhood_slug,address,lat,lng,category_slug,style_slug,title,start_at,end_at,level,language,format,booking_target_type,booking_target_href,source_url,last_verified_at,verification_status', 'city_slug,occurrence_id,program_slug,place_slug,organizer_slug,category_slug,style_slug,title,start_at,end_at,level,language,format,booking_target_slug,source_url,last_verified_at,verification_status')
        .replace('city_slug,place_slug,place_name,neighborhood_slug,address,lat,lng,category_slug,style_slug,title,start_at,end_at,level,language,format,booking_target_slug,booking_target_href,source_url,last_verified_at,verification_status', 'city_slug,occurrence_id,program_slug,place_slug,organizer_slug,category_slug,style_slug,title,start_at,end_at,level,language,format,booking_target_slug,source_url,last_verified_at,verification_status')
    );

  const legacyRows = occurrenceCsv.split(/\r?\n/);
  if (legacyRows.length > 1) {
    const [header, ...body] = legacyRows;
    const fixedBody = body.map((line) => {
      const cells = splitCsvLine(line);
      if (cells.length < 20) return line;
      return [
        cells[0],
        cells[1],
        `${cells[1]}-${cells[9].toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        cells[1],
        'legacy-import-organizer',
        cells[7],
        cells[8],
        cells[9],
        cells[10],
        cells[11],
        cells[12],
        cells[13],
        cells[14],
        cells[15] || 'legacy-booking',
        cells[17],
        cells[18],
        cells[19],
        cells[20] ?? '',
        cells[21] ?? '',
        cells[22] ?? ''
      ].join(',');
    });
    return validateOccurrencesCsv([header, ...fixedBody].join('\n'));
  }

  return validateOccurrencesCsv(csv);
};

export const importRequiredHeaders = [...IMPORT_HEADERS.occurrences.required];
export const importOptionalHeaders = [...IMPORT_HEADERS.occurrences.optional];
export const importSchemas = IMPORT_HEADERS;
