const OSLO_TIME_ZONE = 'Europe/Oslo';
const NEUTRAL_PLACEHOLDER = '—';

export type OsloDateLocale = 'nb-NO' | 'en-GB';

const dateTimeFormatterCache = new Map<string, Intl.DateTimeFormat>();

function getDateTimeFormatter(locale: OsloDateLocale): Intl.DateTimeFormat {
  const cacheKey = `${locale}:${OSLO_TIME_ZONE}:datetime`;
  const cached = dateTimeFormatterCache.get(cacheKey);
  if (cached) return cached;

  const formatter = new Intl.DateTimeFormat(locale, {
    timeZone: OSLO_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZoneName: 'short',
  });

  dateTimeFormatterCache.set(cacheKey, formatter);
  return formatter;
}

function getDateOnlyFormatter(locale: OsloDateLocale): Intl.DateTimeFormat {
  const cacheKey = `${locale}:${OSLO_TIME_ZONE}:date`;
  const cached = dateTimeFormatterCache.get(cacheKey);
  if (cached) return cached;

  const formatter = new Intl.DateTimeFormat(locale, {
    timeZone: OSLO_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  dateTimeFormatterCache.set(cacheKey, formatter);
  return formatter;
}

function coerceDate(value: string | number | Date | null | undefined): Date | null {
  if (value == null) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function formatDateRange(formatter: Intl.DateTimeFormat, start: Date, end: Date): string {
  try {
    if (typeof formatter.formatRange === 'function') {
      return formatter.formatRange(start, end);
    }
  } catch {
    // Fall back to the manual range below.
  }

  const startLabel = formatter.format(start);
  const endLabel = formatter.format(end);
  return startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`;
}

export function formatOsloDateTime(
  value: string | number | Date | null | undefined,
  locale: OsloDateLocale = 'en-GB'
): string {
  const date = coerceDate(value);
  if (!date) return NEUTRAL_PLACEHOLDER;

  try {
    return getDateTimeFormatter(locale).format(date);
  } catch {
    return NEUTRAL_PLACEHOLDER;
  }
}

export function formatOsloDateOnly(
  value: string | number | Date | null | undefined,
  locale: OsloDateLocale = 'en-GB'
): string {
  const date = coerceDate(value);
  if (!date) return NEUTRAL_PLACEHOLDER;

  try {
    return getDateOnlyFormatter(locale).format(date);
  } catch {
    return NEUTRAL_PLACEHOLDER;
  }
}

export function formatOsloDateTimeRange(
  start: string | number | Date | null | undefined,
  end: string | number | Date | null | undefined,
  locale: OsloDateLocale = 'en-GB'
): string {
  const startDate = coerceDate(start);
  const endDate = coerceDate(end);

  if (!startDate && !endDate) return NEUTRAL_PLACEHOLDER;
  if (!startDate) return formatOsloDateTime(endDate, locale);
  if (!endDate) return formatOsloDateTime(startDate, locale);

  try {
    return formatDateRange(getDateTimeFormatter(locale), startDate, endDate);
  } catch {
    return `${formatOsloDateTime(startDate, locale)} – ${formatOsloDateTime(endDate, locale)}`;
  }
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
