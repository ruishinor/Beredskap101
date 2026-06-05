function normalize(input: unknown): string {
  return String(input ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();
}

function tokenize(input: string): string[] {
  return normalize(input)
    .toLowerCase()
    .split(/[^a-z0-9æøå]+/i)
    .filter(Boolean);
}

function hasLowValueTitle(title: string): boolean {
  const t = normalize(title).toLowerCase();
  const words = tokenize(t);

  const lowValueTerms = ['notes', 'slides', 'key', 'exercise', 'exercises', 'oppgave', 'skjermbilde'];
  const lowValueHits = lowValueTerms.filter((term) => t.includes(term)).length;

  if (lowValueHits >= 2) return true;
  if (words.length <= 4 && lowValueHits >= 1) return true;
  if (/^(\d+(\.\d+)?\s*)+[a-z]?\s*(notes?|slides?|key|exercises?)$/i.test(t)) return true;
  if (t.includes('overview of cybersecurity slides')) return true;
  if (t === 'contents' || t === 'oadm hbwn') return true;

  return false;
}

function looksLikeMetadataDump(text: string): boolean {
  const normalized = normalize(text);
  const lower = normalized.toLowerCase();

  if (!normalized) return true;
  if (lower.includes('**category:**') || lower.includes('**source:**')) return true;
  if (/[\\/][^\\s]+\\.(pdf|txt|html|docx?)/i.test(normalized)) return true;
  if (/^\d{1,2}\/\d{1,2}\/\d{2,4},?\s+\d{1,2}:\d{2}\s*(am|pm)/i.test(lower)) return true;

  return false;
}

function looksLikeGibberish(text: string): boolean {
  const normalized = normalize(text);
  if (normalized.length < 40) return false;

  const alpha = (normalized.match(/[A-Za-zÆØÅæøå]/g) || []).length;
  const symbol = (normalized.match(/[:;|<>^~`{}\[\]\\]/g) || []).length;

  if (alpha === 0) return true;
  if (symbol / alpha > 0.25) return true;
  if (/[A-ZÆØÅ0-9]{1,3}[:;][A-ZÆØÅ0-9]{1,3}[:;]/.test(normalized)) return true;

  return false;
}

function getLocalizedView(asset: any, language: string): any {
  const locale = language === 'no' ? 'no' : 'en';
  return asset?.locales?.[locale] || asset?.locales?.en || asset;
}

export function isDisplayWorthyAsset(asset: any, language: string): boolean {
  if (!asset || typeof asset !== 'object') return false;

  const localized = getLocalizedView(asset, language);
  const title = normalize(localized?.title ?? asset.title);
  const overview = normalize(localized?.article?.overview ?? asset?.article?.overview);
  const context = normalize(localized?.article?.context ?? asset?.article?.context);

  if (!title || !overview) return false;
  if (hasLowValueTitle(title)) return false;
  if (looksLikeMetadataDump(overview)) return false;
  if (looksLikeGibberish(overview) || looksLikeGibberish(context)) return false;

  return true;
}

