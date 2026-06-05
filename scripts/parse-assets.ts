import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCHEMA_VERSION = '1.1.0';
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'data', 'processedAssets.json');
const REJECTED_OUTPUT_FILE = path.join(__dirname, '..', 'src', 'data', 'processedAssets.rejected.json');
const REPORT_OUTPUT_FILE = path.join(__dirname, '..', 'src', 'data', 'processedAssets.ingest-report.json');

type IngestStatus = 'accepted' | 'rejected';
type LocaleCode = 'en' | 'no';

interface KeyElement {
  element: string;
  description: string;
}

interface LocalizedAsset {
  title: string;
  category: string;
  keyElements: KeyElement[];
  sourceDerivedClaims?: string[];
  domainActions?: string[];
  validationNotes?: string[];
  humanReviewStatus?: string;
  article: {
    overview: string;
    centralKnowledge: string[];
    context: string;
    conclusion: string;
  };
  stats: {
    dataComplexity: string;
    readinessFactor: string;
    distribution: string[];
  };
  guide: {
    preparation: string[];
    execution: string[];
    evaluation: string[];
  };
  checklist: string[];
  protocol: {
    purpose: string;
    procedures: string[];
    requirements: string[];
  };
  courseModule: {
    moduleId: string;
    learningGoals: string[];
    theory: string;
    reflectionQuestions: string[];
  };
}

interface ProcessedAsset extends LocalizedAsset {
  id: string;
  title: string;
  category: string;
  pillarId: string;
  metadata: {
    sourceFile: string;
    fileSizeKb: number;
  };
  locales: {
    en: LocalizedAsset;
    no: LocalizedAsset;
  };
}

interface ProcessedAssetsBundle {
  schemaVersion: string;
  generatedAt: string;
  sourceRepo: string;
  sourceRevision: string;
  assets: ProcessedAsset[];
}

interface RejectedAsset {
  id: string;
  title: string;
  category: string;
  ingestStatus: 'rejected';
  rejectionReasons: string[];
  sourceFiles: string[];
}

interface IngestDecision {
  id: string;
  title: string;
  ingestStatus: IngestStatus;
  rejectionReasons: string[];
}

interface LocalePaths {
  datasetPath: string;
  articlePath: string;
  statsPath: string;
  guidePath: string;
  checklistPath: string;
  protocolPath: string;
  modulePath: string;
}

interface ParseLocaleResult {
  ok: boolean;
  localized?: LocalizedAsset;
  dataset?: any;
  sourceFiles: string[];
  rejectionReasons: string[];
}

const OFF_DOMAIN_SIGNAL_TERMS = [
  'seo',
  'headline',
  'landing page',
  'conversion',
  'marketing',
  'brand voice',
  'social media',
  'meta content',
  'copywriting',
];

const PREPAREDNESS_SIGNAL_TERMS = [
  'beredskap',
  'krise',
  'nød',
  'first aid',
  'førstehjelp',
  'trauma',
  'tourniquet',
  'cpr',
  'hlr',
  'evaku',
  'storm',
  'flom',
  'blackout',
  'strøm',
  'vann',
  'mat',
  'personvern',
  'privacy',
  'privacy operations',
  'travel',
  'reisesikkerhet',
  'situasjons',
  'wilderness',
  'friluft',
  'overlevelse',
  'snow',
  'snø',
  'sno',
  'winter',
  'cold weather',
  'hypothermia',
  'frostbite',
  'cyber',
  'authentication',
  'kryptering',
  'digi112',
];

const NORWEGIAN_SIGNAL_WORDS = new Set([
  'og',
  'for',
  'med',
  'til',
  'på',
  'er',
  'en',
  'et',
  'av',
  'ikke',
  'som',
  'den',
  'det',
  'beredskap',
  'personvern',
  'sikkerhet',
  'nød',
  'krise',
  'førstehjelp',
  'reise',
  'friluftsliv',
]);

const ENGLISH_SIGNAL_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'to',
  'of',
  'is',
  'in',
  'on',
  'your',
  'you',
  'that',
  'preparedness',
  'privacy',
  'security',
  'emergency',
  'first',
  'travel',
  'wilderness',
]);

const TITLE_BLACKLIST_PATTERNS: RegExp[] = [
  /^contents?$/i,
  /^oadm\s+hbwn$/i,
  /^misunderstandings related to$/i,
  /^\*?field manual$/i,
  /^fixing your$/i,
  /^preparedness and measures for\b/i,
];

const TITLE_LOW_VALUE_TERMS = [
  'notes',
  'slides',
  'key',
  'exercise',
  'oppgave',
  'skjermbilde',
  'contents',
];

const SOURCE_SPECIFIC_TERMS = [
  'nsw',
  'section menu',
  'on this page',
  'business.gov.au',
  'transport for nsw',
  'nsw ses',
  'nsw government',
  'australian red cross',
  'wow day',
  'source material for',
  'press release',
  'pressemelding',
  'lovdata',
  'copyright',
  'www.',
  'http://',
  'https://',
];

const CROSS_CONTEXT_VALUE_TERMS = [
  'preparedness',
  'beredskap',
  'emergency',
  'krise',
  'safety',
  'security',
  'risk',
  'response',
  'procedure',
  'checklist',
  'evacuation',
  'communication',
  'first aid',
  'førstehjelp',
  'privacy',
  'personvern',
  'continuity',
  'fatigue',
  'distraction',
  'storm',
  'flood',
  'fire',
  'winter',
  'snow',
  'cold',
  'hypothermia',
  'frostbite',
  'shelter',
  'cyber',
];

const CONCEPT_NOISE_TERMS = new Set([
  'nsw',
  'government',
  'section',
  'menu',
  'page',
  'pages',
  'source',
  'material',
  'watch',
  'day',
  'fuel',
  'supply',
  'update',
  'www',
  'http',
  'https',
  'dette',
  'dette',
  'that',
  'this',
  'their',
  'your',
  'through',
  'should',
  'being',
  'ensure',
  'where',
  'which',
  'under',
  'after',
  'before',
  'while',
  'during',
  'could',
  'would',
  'about',
  'across',
  'these',
  'those',
  'there',
  'using',
  'used',
  'needs',
  'need',
  'must',
  'from',
  'into',
  'have',
  'with',
]);

type EditorialTheme =
  | 'transport-safety'
  | 'cyber-privacy'
  | 'natural-hazards'
  | 'winter-survival'
  | 'first-aid'
  | 'household-preparedness'
  | 'business-continuity';

const MOJIBAKE_REPLACEMENTS: Array<[string, string]> = [
  ['\u00C3\u0192\u00C2\u00B8', 'ø'],
  ['\u00C3\u0192\u00C2\u00A5', 'å'],
  ['\u00C3\u0192\u00C2\u00A6', 'æ'],
  ['\u00C3\u0192\u00CB\u0153', 'Ø'],
  ['\u00C3\u0192\u00E2\u20AC\u00A6', 'Å'],
  ['\u00C3\u0192\u00E2\u20AC\u00A0', 'Æ'],
  ['\u00C3\u00B8', 'ø'],
  ['\u00C3\u00A5', 'å'],
  ['\u00C3\u00A6', 'æ'],
  ['\u00C3\u02DC', 'Ø'],
  ['\u00C3\u2026', 'Å'],
  ['\u00C3\u2020', 'Æ'],
  ['\u00C3\u00A2\u00E2\u201A\u00AC\u00E2\u20AC\u0153', '–'],
  ['\u00C3\u00A2\u00E2\u201A\u00AC\u00E2\u20AC\u009D', '—'],
  ['\u00C3\u00A2\u00E2\u201A\u00AC\u00C5\u201C', '"'],
  ['\u00C3\u00A2\u00E2\u201A\u00AC\u00C2\u009D', '"'],
  ['\u00C3\u00A2\u00E2\u201A\u00AC\u00CB\u0153', "'"],
  ['\u00C3\u00A2\u00E2\u201A\u00AC\u00E2\u201E\u00A2', "'"],
  ['\u00C3\u201A\u00C2\u00B0', '°'],
  ['\u00C3\u201A', ''],
  ['\u00A0', ' '],
];

function requireAssetsDirFromEnv(): string {
  const raw = process.env.B101_ASSETS_DIR?.trim();
  if (!raw) {
    throw new Error(
      'Missing required env var B101_ASSETS_DIR. Example: B101_ASSETS_DIR="C:\\00 DEV\\In Progress\\beredskap101-content-lab\\processed-assets"'
    );
  }
  const resolved = path.resolve(raw);
  if (!fs.existsSync(resolved)) {
    throw new Error(`B101_ASSETS_DIR does not exist: ${resolved}`);
  }
  return resolved;
}

function normalizeText(input: string): string {
  let out = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  for (const [bad, good] of MOJIBAKE_REPLACEMENTS) {
    out = out.split(bad).join(good);
  }
  out = out.replace(/\u0000/g, '');
  return out.trim();
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => normalizeText(String(item))).filter(Boolean);
}

function normalizeOptionalText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = normalizeText(value);
  return normalized || undefined;
}

function readNormalizedText(filePath: string): string {
  const raw = fs.readFileSync(filePath, 'utf8');
  return normalizeText(raw);
}

function normalizeHeadingToken(value: string): string {
  return normalizeText(value).toLowerCase();
}

function parseSectionAny(content: string, headingCandidates: string[]): string {
  const headingTokens = headingCandidates.map(normalizeHeadingToken);
  const lines = content.split('\n');
  let inside = false;
  const resultLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      const title = normalizeHeadingToken(trimmed.replace(/^##? /, '').trim());
      if (inside) break;
      if (headingTokens.some((h) => title.includes(h))) {
        inside = true;
        continue;
      }
    }
    if (inside) resultLines.push(line);
  }

  return normalizeText(resultLines.join('\n'));
}

function parseListSectionAny(content: string, headingCandidates: string[]): string[] {
  const raw = parseSectionAny(content, headingCandidates);
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- ') || line.startsWith('* ') || /^\d+\.\s/.test(line))
    .map((line) => normalizeText(line.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '').replace(/^\*\*[^*]+\*\*:\s*/, '').trim()))
    .filter(Boolean);
}

function slugify(input: string): string {
  return normalizeText(input)
    .toLowerCase()
    .replace(/[^a-z0-9æøå]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function tokenizeWords(input: string): string[] {
  return normalizeText(input)
    .toLowerCase()
    .split(/[^a-z0-9æøå]+/)
    .filter((w) => w.length >= 2);
}

function countSignals(words: string[], dictionary: Set<string>): number {
  return words.reduce((sum, word) => sum + (dictionary.has(word) ? 1 : 0), 0);
}

function hasLanguageMismatch(locale: LocaleCode, text: string): boolean {
  const words = tokenizeWords(text);
  if (words.length < 20) return false;

  const noHits = countSignals(words, NORWEGIAN_SIGNAL_WORDS);
  const enHits = countSignals(words, ENGLISH_SIGNAL_WORDS);

  if (locale === 'no') {
    return enHits >= 6 && noHits <= 2;
  }
  return noHits >= 6 && enHits <= 2;
}

function evaluateTitleQuality(title: string): string[] {
  const reasons: string[] = [];
  const normalized = normalizeText(title);
  const singleLine = normalized.replace(/\s+/g, ' ').trim();
  const lower = singleLine.toLowerCase();
  const words = tokenizeWords(singleLine);

  if (!singleLine || singleLine.length < 6) reasons.push('EMPTY_OR_TOO_SHORT_TITLE');
  if (normalized.includes('\n')) reasons.push('MULTILINE_TITLE');
  if (TITLE_BLACKLIST_PATTERNS.some((pattern) => pattern.test(singleLine))) reasons.push('GIBBERISH_OR_GENERIC_TITLE');
  if (singleLine.includes('..')) reasons.push('TRUNCATED_TITLE');
  if (/^(\d+(\.\d+)?\s*){2,}/.test(singleLine)) reasons.push('TOC_LIKE_TITLE');

  const lowValueHits = TITLE_LOW_VALUE_TERMS.filter((term) => lower.includes(term)).length;
  if (lowValueHits >= 2 || (words.length <= 4 && lowValueHits >= 1)) {
    reasons.push('LOW_VALUE_TITLE');
  }

  const uppercaseLetters = (singleLine.match(/[A-ZÆØÅ]/g) || []).length;
  const alphaLetters = (singleLine.match(/[A-Za-zÆØÅæøå]/g) || []).length;
  if (alphaLetters > 0 && uppercaseLetters / alphaLetters > 0.9 && words.length <= 6) {
    reasons.push('SHOUTY_OR_OCR_TITLE');
  }

  return [...new Set(reasons)];
}

function hasTitleContentMismatch(title: string, bodyText: string): boolean {
  const stopwords = new Set([
    'the',
    'and',
    'for',
    'with',
    'from',
    'this',
    'that',
    'into',
    'your',
    'about',
    'norsk',
    'som',
    'med',
    'for',
    'til',
    'det',
    'den',
    'og',
    'av',
  ]);

  const titleTerms = tokenizeWords(title).filter((w) => w.length >= 4 && !stopwords.has(w));
  if (titleTerms.length === 0) return false;

  const bodyLower = normalizeText(bodyText).toLowerCase();
  const hits = titleTerms.filter((term) => bodyLower.includes(term)).length;
  return hits === 0;
}

function mapCategoryToPillar(category: string, title: string): string {
  const cat = normalizeText(category).toLowerCase();
  const t = normalizeText(title).toLowerCase();

  if (cat.includes('personvern') || cat.includes('privacy') || cat.includes('cyber') || t.includes('cyber') || t.includes('kryptering') || t.includes('authentication')) {
    return 'personvern';
  }
  if (cat.includes('førstehjelp') || cat.includes('first aid') || cat.includes('medisinsk') || t.includes('førstehjelp') || t.includes('traume') || t.includes('blødning') || t.includes('cpr') || t.includes('heteslag')) {
    return 'førstehjelp';
  }
  if (
    cat.includes('friluftsliv') ||
    cat.includes('wilderness') ||
    cat.includes('villmark') ||
    cat.includes('winter') ||
    cat.includes('cold weather') ||
    t.includes('elv') ||
    t.includes('bål') ||
    t.includes('kart') ||
    t.includes('tur') ||
    t.includes('vær') ||
    t.includes('snø') ||
    t.includes('sno') ||
    t.includes('snow') ||
    t.includes('hypothermia') ||
    t.includes('frostbite')
  ) {
    return 'friluftsliv';
  }
  if (cat.includes('reise') || cat.includes('travel') || t.includes('cuba') || t.includes('hotel') || t.includes('flyplass') || t.includes('taxi') || t.includes('embassy')) {
    return 'reisesikkerhet';
  }
  if (cat.includes('egensikkerhet') || cat.includes('personal safety') || cat.includes('situasjonsforståelse') || t.includes('situasjons') || t.includes('trussel') || t.includes('konflikt') || t.includes('vold')) {
    return 'egensikkerhet';
  }
  return 'egenberedskap';
}

function hasPreparednessSignal(text: string): boolean {
  const lower = text.toLowerCase();
  return PREPAREDNESS_SIGNAL_TERMS.some((term) => lower.includes(term));
}

function hasStrongOffDomainSignal(text: string): boolean {
  const lower = text.toLowerCase();
  const offDomainHits = OFF_DOMAIN_SIGNAL_TERMS.filter((term) => lower.includes(term)).length;
  return offDomainHits >= 2;
}

function countTermHits(text: string, terms: string[]): number {
  const lower = normalizeText(text).toLowerCase();
  return terms.reduce((acc, term) => acc + (lower.includes(term) ? 1 : 0), 0);
}

function sanitizeForEditorial(input: string): string {
  const text = normalizeText(input)
    .replace(/https?:\/\/\S+/gi, ' ')
    .replace(/\bwww\.[^\s)]+/gi, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[*_`#>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) return '';

  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 30 && s.length <= 220)
    .filter((s) => countTermHits(s, SOURCE_SPECIFIC_TERMS) < 2);

  if (sentences.length === 0) {
    return text.slice(0, 320);
  }

  return sentences.slice(0, 4).join(' ');
}

function detectEditorialTheme(text: string): EditorialTheme | null {
  const lower = normalizeText(text).toLowerCase();
  const scores: Record<EditorialTheme, number> = {
    'transport-safety': 0,
    'cyber-privacy': 0,
    'natural-hazards': 0,
    'winter-survival': 0,
    'first-aid': 0,
    'household-preparedness': 0,
    'business-continuity': 0,
  };

  const boost = (theme: EditorialTheme, terms: string[]) => {
    for (const term of terms) {
      if (lower.includes(term)) scores[theme] += 1;
    }
  };

  boost('transport-safety', ['driver', 'driving', 'road', 'vehicle', 'fatigue', 'distraction', 'bike', 'bicycle', 'seatbelt']);
  boost('cyber-privacy', ['cyber', 'privacy', 'personvern', 'router', 'wifi', 'password', 'authentication', 'digital', 'mobile']);
  boost('natural-hazards', ['storm', 'flood', 'fire', 'bushfire', 'skred', 'weather', 'evacuation', 'flom']);
  boost('winter-survival', ['winter', 'snow', 'snø', 'sno', 'cold', 'hypothermia', 'frostbite', 'snow cave', 'shelter', 'quinzhee', 'igloo']);
  boost('first-aid', ['first aid', 'førstehjelp', 'bleeding', 'cpr', 'trauma', 'injury', 'livreddende']);
  boost('household-preparedness', ['household', 'home', 'hjem', 'water', 'mat', 'kit', 'go bag', 'egenberedskap']);
  boost('business-continuity', ['business', 'continuity', 'operations', 'recovery', 'incident', 'plan', 'supply', 'governance']);

  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]) as Array<[EditorialTheme, number]>;
  if (!ranked[0] || ranked[0][1] < 2) return null;
  return ranked[0][0];
}

function isCrossContextRelevant(title: string, category: string, content: string): boolean {
  const combined = `${title} ${category} ${content}`;
  const localHits = countTermHits(combined, SOURCE_SPECIFIC_TERMS);
  const valueHits = countTermHits(combined, CROSS_CONTEXT_VALUE_TERMS);
  const lowerTitle = normalizeText(title).toLowerCase();

  if (lowerTitle.includes('pressemelding') || lowerTitle.includes('press release')) return false;
  if (valueHits < 3) return false;
  if (localHits >= 6 && valueHits < 6) return false;

  return true;
}

function titleCase(input: string): string {
  return input
    .split(' ')
    .filter(Boolean)
    .map((word) => (word.length <= 2 ? word.toLowerCase() : word[0].toUpperCase() + word.slice(1).toLowerCase()))
    .join(' ')
    .replace(/\b(gdpr|osint|cpr|wifi)\b/gi, (m) => m.toUpperCase());
}

function normalizeEditorialTitle(rawTitle: string): string {
  return normalizeText(rawTitle)
    .replace(/\b(pdf|txt|html|docx?)\b/gi, ' ')
    .replace(/\b(nsw|government|transport for nsw|business\.gov\.au|lovdata|australian red cross|ses)\b/gi, ' ')
    .replace(/\bsintef\b/gi, ' ')
    .replace(/\b(digi\d+|v\d+|module|samling|kurs|opplæring)\b/gi, ' ')
    .replace(/\b\d{1,2}[a-z]?\b/gi, ' ')
    .replace(/[:;,]+/g, ' ')
    .replace(/\b(final|complete)\b/gi, ' ')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toEnglishTitle(rawTitle: string, theme: EditorialTheme): string {
  let text = normalizeEditorialTitle(rawTitle).toLowerCase();

  const replacements: Array<[RegExp, string]> = [
    [/\bhytter\b/g, 'cabins'],
    [/\bhuler\b/g, 'caves'],
    [/\bav\b/g, 'of'],
    [/\bsnø\b/g, 'snow'],
    [/\bsno\b/g, 'snow'],
    [/\bbyggforsk\b/g, 'building research'],
    [/\bførstehjelp\b/g, 'first aid'],
    [/\bheteslag\b/g, 'heat stroke'],
    [/\bpersonvern\b/g, 'privacy'],
    [/\bpersonopplysninger\b/g, 'personal data'],
    [/\bberedskap\b/g, 'preparedness'],
    [/\begenberedskap\b/g, 'household preparedness'],
    [/\breisesikkerhet\b/g, 'travel safety'],
    [/\bfriluftsliv\b/g, 'outdoor survival'],
    [/\begensikkerhet\b/g, 'personal safety'],
  ];

  for (const [pattern, replacement] of replacements) {
    text = text.replace(pattern, replacement);
  }

  text = text.replace(/\s+/g, ' ').trim();

  if (text.includes('huts') && text.includes('caves') && text.includes('snow')) {
    return 'Snow Shelters: Huts and Caves';
  }
  if (text.includes('winter') || text.includes('snow') || text.includes('hypothermia') || text.includes('frostbite')) {
    return 'Cold Weather and Winter Survival';
  }

  const candidate = titleCase(text);
  if (!candidate || candidate.length < 12 || candidate.length > 72) {
    return defaultThemeTitle(theme, 'en');
  }
  return candidate;
}

function themeCategory(theme: EditorialTheme): string {
  switch (theme) {
    case 'transport-safety': return 'Travel Safety and Incident Prevention';
    case 'cyber-privacy': return 'Digital Privacy and Cybersecurity';
    case 'natural-hazards': return 'Natural Disasters and Extreme Weather';
    case 'winter-survival': return 'Cold Weather and Winter Survival';
    case 'first-aid': return 'First Aid and Emergency Medicine';
    case 'household-preparedness': return 'Household Preparedness and Storage';
    case 'business-continuity': return 'Business Continuity and Crisis Operations';
  }
}

function defaultThemeTitle(theme: EditorialTheme, locale: LocaleCode): string {
  switch (theme) {
    case 'transport-safety': return 'Transport Safety: Risk and Prevention Playbook';
    case 'cyber-privacy': return 'Digital Security and Privacy: Practical Operations Guide';
    case 'natural-hazards': return 'Natural Hazards: Preparedness and Response';
    case 'winter-survival': return 'Cold Weather and Winter Survival';
    case 'first-aid': return 'First Aid Under Pressure: Operational Essentials';
    case 'household-preparedness': return 'Household Preparedness: Core Readiness Actions';
    case 'business-continuity': return 'Business Continuity During Disruption';
  }
}

function extractConcepts(input: string, max = 5): string[] {
  const stop = new Set([
    'the', 'and', 'for', 'with', 'from', 'that', 'this', 'into', 'your', 'over',
    'som', 'det', 'den', 'til', 'fra', 'med', 'for', 'på', 'av', 'og',
  ]);

  const words = tokenizeWords(input).filter((w) => w.length >= 4 && !stop.has(w) && !CONCEPT_NOISE_TERMS.has(w));
  const counts = new Map<string, number>();
  for (const w of words) counts.set(w, (counts.get(w) || 0) + 1);

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([w]) => w)
    .slice(0, max);
}

function defaultThemeConcepts(theme: EditorialTheme, locale: LocaleCode): string[] {
  switch (theme) {
    case 'transport-safety': return ['hazard scanning', 'speed discipline', 'decision timing'];
    case 'cyber-privacy': return ['access control', 'account hygiene', 'data minimization'];
    case 'natural-hazards': return ['early warning', 'evacuation planning', 'resource prioritization'];
    case 'winter-survival': return ['thermal management', 'snow shelter construction', 'cold injury prevention'];
    case 'first-aid': return ['rapid assessment', 'life-saving intervention', 'role clarity'];
    case 'household-preparedness': return ['supply resilience', 'communication discipline', 'fallback plans'];
    case 'business-continuity': return ['critical functions', 'ownership model', 'service recovery'];
  }
}

function themeConceptVocabulary(theme: EditorialTheme): string[] {
  switch (theme) {
    case 'transport-safety':
      return ['fatigue', 'distraction', 'vehicle', 'road', 'speed', 'crash', 'hazard', 'transport', 'awareness'];
    case 'cyber-privacy':
      return ['cyber', 'privacy', 'security', 'access', 'authentication', 'account', 'router', 'device', 'data', 'control'];
    case 'natural-hazards':
      return ['storm', 'flood', 'fire', 'evacuation', 'warning', 'weather', 'resources', 'response'];
    case 'winter-survival':
      return ['winter', 'snow', 'cold', 'hypothermia', 'frostbite', 'shelter', 'insulation', 'layers', 'thermal', 'wind'];
    case 'first-aid':
      return ['first', 'aid', 'trauma', 'bleeding', 'assessment', 'injury', 'intervention', 'patient'];
    case 'household-preparedness':
      return ['household', 'preparedness', 'water', 'food', 'kit', 'backup', 'communication', 'storage', 'readiness'];
    case 'business-continuity':
      return ['business', 'continuity', 'operations', 'recovery', 'incident', 'critical', 'service', 'planning'];
  }
}

function composeEditorialLocalized(raw: LocalizedAsset, locale: LocaleCode): LocalizedAsset | null {
  const sourceText = [
    raw.title,
    raw.category,
    raw.article.overview,
    raw.article.context,
    raw.article.conclusion,
    ...raw.article.centralKnowledge,
    ...raw.guide.preparation,
    ...raw.guide.execution,
    ...raw.guide.evaluation,
    ...raw.checklist,
    ...raw.protocol.procedures,
  ].join(' ');

  if (!isCrossContextRelevant(raw.title, raw.category, sourceText)) {
    return null;
  }

  const theme = detectEditorialTheme(sourceText);
  if (!theme) return null;

  const sanitizedSource = sanitizeForEditorial(sourceText);
  const allowedConcepts = new Set(themeConceptVocabulary(theme));
  const conceptsRaw = extractConcepts(sanitizedSource, 8).filter((c) => allowedConcepts.has(c));
  const defaults = defaultThemeConcepts(theme, 'en');
  const concepts = [...conceptsRaw, ...defaults].slice(0, 6);
  const editorialTitle = toEnglishTitle(raw.title, theme);
  const categoryTitle = themeCategory(theme);

  const conceptA = concepts[0] || 'risk awareness';
  const conceptB = concepts[1] || 'execution discipline';
  const conceptC = concepts[2] || 'continuous improvement';

  const articleOverview =
    `If you strip away local agency labels and one-off terminology, this topic comes down to a practical preparedness challenge: how to make better decisions before conditions deteriorate.\n\n` +
    `What matters most is building a repeatable method around ${conceptA}, ${conceptB}, and ${conceptC}. That means defining clear triggers, assigning ownership early, and practicing under realistic pressure instead of relying on memory during an incident.\n\n` +
    `The core lesson is that resilient outcomes rarely depend on one heroic action. They come from small controls that stack: early signals, disciplined communication, and checkable procedures.\n\n` +
    `To build on this, run short scenario drills, measure where decisions slow down, and tighten one weak point at a time. The goal is operational reliability that works across countries, sectors, and skill levels.`;

  const articleContext =
    'This knowledge article is rewritten as an editorial synthesis. Local references and source-specific formatting are intentionally removed so the guidance can transfer across regions, organizations, and experience levels.';

  const articleConclusion =
    'Treat this as a working baseline: adapt the thresholds, roles, and resource assumptions to your local environment, then retest on a fixed schedule.';

  const centralKnowledge = [
    `Define objective triggers tied to ${conceptA} so escalation is based on signals, not guesswork.`,
    `Standardize team actions for ${conceptB} with short checklists and clear role ownership.`,
    `Track a few operational metrics linked to ${conceptC} and update procedures after every drill.`,
    'Design for redundancy: if one channel, person, or tool fails, the response should still continue.',
  ];

  const prep = [
    'Map likely failure points, critical dependencies, and hard escalation thresholds.',
    'Assign primary/backup responsibilities and verify who makes final go/no-go decisions.',
    'Pre-position reference checklists and offline contact paths for degraded conditions.',
  ];

  const exec = [
    'Stabilize first: reduce immediate risk and confirm shared situational understanding.',
    'Issue short operational updates in a fixed format: status, action, owner, next checkpoint.',
    'Log decisions and deviations in real time to support correction and post-incident learning.',
  ];

  const evalSteps = [
    'Measure response latency, decision quality, and procedure adherence.',
    'Document friction points and convert them into concrete control updates.',
    'Retest with increased complexity to verify that improvements hold under stress.',
  ];

  const checklist = [
    'Trigger thresholds are explicit and understood by all roles.',
    'Primary and fallback communication paths are tested.',
    'Critical resources are available within required response windows.',
    'Decision ownership is unambiguous during escalation.',
    'After-action findings are logged with owners and deadlines.',
  ];

  const protocolPurpose =
    `Validate that ${editorialTitle} controls remain reliable across different environments and skill levels.`;

  const protocolProcedures = [
    'Run a time-boxed scenario with defined entry conditions and measurable outcomes.',
    'Capture decision points, handoffs, and information delays as they occur.',
    'Repeat under altered assumptions to test robustness and recovery behavior.',
  ];

  const protocolRequirements = [
    'Roles, thresholds, and minimum actions are documented without ambiguity.',
    'Response actions remain executable under realistic staffing and resource constraints.',
    'All improvement actions have an owner, due date, and verification method.',
  ];

  const learningGoals = [
    'Convert weak signals into timely, prioritized action.',
    'Coordinate under pressure with concise, structured communication.',
    'Continuously improve procedures through measured drills and reviews.',
  ];

  const moduleTheory =
    'Preparedness quality improves when teams move from reference-heavy reading to operational design. This means translating principles into triggers, ownership rules, and verification routines that can be executed under stress. The same framework should hold across countries and institutions, with only local constraints changing.';

  const reflectionQuestions = [
    'Which trigger decisions are currently ambiguous in our workflow?',
    'Where do we lose time during handoffs or escalation?',
    'What single control update would most improve reliability this month?',
  ];

  return {
    ...raw,
    category: categoryTitle,
    title: editorialTitle,
    keyElements: [
      {
        element: 'Early Detection',
        description: `Establish clear indicators for ${conceptA} before escalation.`,
      },
      {
        element: 'Coordinated Response',
        description: `Standardize information flow and ownership around ${conceptB}.`,
      },
      {
        element: 'Continuous Improvement',
        description: `Use drills and metrics to improve ${conceptC} over time.`,
      },
    ],
    article: {
      overview: articleOverview,
      centralKnowledge,
      context: articleContext,
      conclusion: articleConclusion,
    },
    guide: {
      preparation: prep,
      execution: exec,
      evaluation: evalSteps,
    },
    checklist,
    protocol: {
      purpose: protocolPurpose,
      procedures: protocolProcedures,
      requirements: protocolRequirements,
    },
    courseModule: {
      ...raw.courseModule,
      learningGoals,
      theory: moduleTheory,
      reflectionQuestions,
    },
  };
}

function buildPaths(baseDir: string, key: string): LocalePaths {
  return {
    datasetPath: path.join(baseDir, '2_curated_datasets', `dataset_${key}.json`),
    articlePath: path.join(baseDir, '1_knowledge_articles', `article_${key}.md`),
    statsPath: path.join(baseDir, '3_statistical_summaries', `stats_${key}.md`),
    guidePath: path.join(baseDir, '4_instructional_guides', `guide_${key}.md`),
    checklistPath: path.join(baseDir, '5_operational_checklists', `checklist_${key}.md`),
    protocolPath: path.join(baseDir, '6_testing_protocols', `protocol_${key}.md`),
    modulePath: path.join(baseDir, '7_course_modules', `module_${key}.md`),
  };
}

function parseArgs() {
  const arg = process.argv[2]?.trim().toLowerCase();
  if (!arg || arg === 'build') return { mode: 'build' as const };
  if (arg === 'preview') return { mode: 'preview' as const };
  throw new Error(`Unknown mode "${arg}". Use "preview" or "build".`);
}

function splitKey(key: string): { docId: string; locale: LocaleCode } {
  if (key.endsWith('_no')) {
    return { docId: key.slice(0, -3), locale: 'no' };
  }
  return { docId: key, locale: 'en' };
}

function parseStatValue(statsRaw: string, labels: string[], fallback: string): string {
  const lowerLabels = labels.map((l) => normalizeText(l).toLowerCase());
  for (const line of statsRaw.split('\n')) {
    const normalizedLine = normalizeText(line).toLowerCase();
    for (const label of lowerLabels) {
      if (normalizedLine.includes(label + ':') || normalizedLine.includes(label + ' :')) {
        const value = line.split(':').slice(1).join(':').replace(/[*_]/g, '').trim();
        return normalizeText(value) || fallback;
      }
    }
  }
  return fallback;
}

function parseLocaleAsset(assetsBaseDir: string, key: string, locale: LocaleCode): ParseLocaleResult {
  const paths = buildPaths(assetsBaseDir, key);
  const sourceFiles = Object.values(paths).map((p) => path.basename(p));
  const rejectionReasons: string[] = [];

  const missingCompanions = Object.values(paths).filter((p) => !fs.existsSync(p));
  if (missingCompanions.length > 0) {
    rejectionReasons.push('MISSING_COMPANION_FILES');
    return { ok: false, sourceFiles, rejectionReasons };
  }

  let dataset: any = null;
  try {
    dataset = JSON.parse(readNormalizedText(paths.datasetPath));
  } catch {
    rejectionReasons.push('INVALID_DATASET_JSON');
    return { ok: false, sourceFiles, rejectionReasons };
  }

  if (!dataset || typeof dataset !== 'object') {
    rejectionReasons.push('MISSING_DATASET_OBJECT');
    return { ok: false, sourceFiles, rejectionReasons };
  }

  if (!dataset.title || !dataset.category || !dataset.metadata?.source_file) {
    rejectionReasons.push('MISSING_REQUIRED_DATASET_FIELDS');
  }
  if (!Array.isArray(dataset.key_elements) || dataset.key_elements.length === 0) {
    rejectionReasons.push('MISSING_KEY_ELEMENTS');
  }

  const articleRaw = readNormalizedText(paths.articlePath);
  const statsRaw = readNormalizedText(paths.statsPath);
  const guideRaw = readNormalizedText(paths.guidePath);
  const checklistRaw = readNormalizedText(paths.checklistPath);
  const protocolRaw = readNormalizedText(paths.protocolPath);
  const moduleRaw = readNormalizedText(paths.modulePath);

  const articleOverview = parseSectionAny(articleRaw, ['Oversikt', 'Overview']);
  const articleKnowledge = parseListSectionAny(articleRaw, ['Sentral Kunnskap', 'Central Knowledge']);
  const articleContext = parseSectionAny(articleRaw, ['Kontekst og Bakgrunn', 'Context and Background']);
  const articleConclusion = parseSectionAny(articleRaw, ['Konklusjon', 'Conclusion']);

  const complexity = parseStatValue(statsRaw, ['Datakompleksitet', 'Data Complexity'], locale === 'no' ? 'Middels' : 'Medium');
  const readiness = parseStatValue(statsRaw, ['Beredskapsfaktor', 'Readiness Factor'], '8/10');
  const statsDistribution = parseListSectionAny(statsRaw, ['Fordeling av fokusområder', 'Focus Area Distribution', 'Fordeling']);

  const guidePrep = parseListSectionAny(guideRaw, ['Forberedelsesfase', 'Preparation Phase']);
  const guideExec = parseListSectionAny(guideRaw, ['Gjennomføringsfase', 'Execution Phase']);
  const guideEval = parseListSectionAny(guideRaw, ['Evalueringsfase', 'Evaluation Phase']);

  const checklistItems = checklistRaw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- [ ]'))
    .map((line) => normalizeText(line.replace(/^-\s*\[\s*\]\s*/, '').replace(/^\*\*Sjekkpunkt \d+\*\*:\s*/, '').trim()))
    .filter(Boolean);

  const protocolPurpose = parseSectionAny(protocolRaw, ['Formål', 'Purpose']);
  const protocolProcedures = parseListSectionAny(protocolRaw, ['Testprosedyrer', 'Testing Procedures']);
  const protocolRequirements = parseListSectionAny(protocolRaw, ['Godkjenningskrav', 'Approval Requirements']);

  let moduleId = `ML-${key.substring(0, 10).toUpperCase()}`;
  for (const line of moduleRaw.split('\n')) {
    const lower = normalizeText(line).toLowerCase();
    if (lower.includes('modul-id:') || lower.includes('modul id:') || lower.includes('module id:')) {
      moduleId = normalizeText(line.split(':').slice(1).join(':').replace(/[*_]/g, '').trim());
    }
  }
  const moduleGoals = parseListSectionAny(moduleRaw, ['Læringsmål', 'Learning Objectives']);
  const moduleTheory = parseSectionAny(moduleRaw, ['Teori', 'Theory']);
  const moduleQuestions = parseListSectionAny(moduleRaw, ['Spørsmål til refleksjon', 'Questions for Reflection', 'refleksjon']);

  if (articleOverview.length < 60) rejectionReasons.push('LOW_QUALITY_ARTICLE_OVERVIEW');
  if (guideExec.length < 2) rejectionReasons.push('LOW_QUALITY_GUIDE_EXECUTION');
  if (checklistItems.length < 3) rejectionReasons.push('LOW_QUALITY_CHECKLIST');
  if (protocolProcedures.length < 2) rejectionReasons.push('LOW_QUALITY_PROTOCOL');
  if (moduleTheory.length < 80) rejectionReasons.push('LOW_QUALITY_MODULE_THEORY');
  if (hasLanguageMismatch(locale, [articleOverview, articleContext, moduleTheory, ...guideExec.slice(0, 3)].join(' '))) {
    rejectionReasons.push('LANGUAGE_MISMATCH');
  }

  const preparednessSignalText = [
    normalizeText(String(dataset.title || '')),
    normalizeText(String(dataset.category || '')),
    articleOverview,
    articleContext,
    ...articleKnowledge,
  ].join(' ');

  if (!hasPreparednessSignal(preparednessSignalText)) {
    rejectionReasons.push('OFF_DOMAIN_CONTENT');
  } else if (hasStrongOffDomainSignal(preparednessSignalText)) {
    rejectionReasons.push('LOW_RELEVANCE_CONTENT');
  }

  if (rejectionReasons.length > 0) {
    return { ok: false, dataset, sourceFiles, rejectionReasons: [...new Set(rejectionReasons)] };
  }

  const rawLocalized: LocalizedAsset = {
    title: normalizeText(String(dataset.title || '')),
    category: normalizeText(String(dataset.category || '')),
    keyElements: (dataset.key_elements as any[]).map((el) => ({
      element: normalizeText(String(el?.element || '')),
      description: normalizeText(String(el?.description || '')),
    })),
    sourceDerivedClaims: normalizeStringArray(
      dataset.sourceDerivedClaims ?? dataset.source_derived_claims ?? dataset.evidence?.sourceDerivedClaims
    ),
    domainActions: normalizeStringArray(
      dataset.domainActions ?? dataset.domain_actions ?? dataset.evidence?.domainActions
    ),
    validationNotes: normalizeStringArray(
      dataset.validationNotes ?? dataset.validation_notes ?? dataset.evidence?.validationNotes
    ),
    humanReviewStatus: normalizeOptionalText(
      dataset.humanReviewStatus ?? dataset.human_review_status ?? dataset.reviewStatus ?? dataset.review_status
    ),
    article: {
      overview: articleOverview,
      centralKnowledge: articleKnowledge,
      context: articleContext,
      conclusion: articleConclusion,
    },
    stats: {
      dataComplexity: complexity,
      readinessFactor: readiness,
      distribution: statsDistribution,
    },
    guide: {
      preparation: guidePrep,
      execution: guideExec,
      evaluation: guideEval,
    },
    checklist: checklistItems,
    protocol: {
      purpose: protocolPurpose,
      procedures: protocolProcedures,
      requirements: protocolRequirements,
    },
    courseModule: {
      moduleId,
      learningGoals: moduleGoals,
      theory: moduleTheory,
      reflectionQuestions: moduleQuestions,
    },
  };

  const editorialLocalized = composeEditorialLocalized(rawLocalized, locale);
  if (!editorialLocalized) {
    return {
      ok: false,
      dataset,
      sourceFiles,
      rejectionReasons: ['LOW_CROSS_CONTEXT_RELEVANCE_OR_LOW_EDITORIAL_VALUE'],
    };
  }

  return { ok: true, localized: editorialLocalized, dataset, sourceFiles, rejectionReasons: [] };
}

function run() {
  const { mode } = parseArgs();
  const assetsBaseDir = requireAssetsDirFromEnv();
  const sourceRepo = process.env.B101_SOURCE_REPO?.trim() || path.basename(path.dirname(assetsBaseDir));
  const sourceRevision = process.env.B101_SOURCE_REVISION?.trim() || 'unknown';
  const generatedAt = new Date().toISOString();

  console.log(`[ingest] Mode: ${mode}`);
  console.log(`[ingest] Source assets: ${assetsBaseDir}`);

  const datasetDir = path.join(assetsBaseDir, '2_curated_datasets');
  if (!fs.existsSync(datasetDir)) {
    throw new Error(`Missing dataset directory: ${datasetDir}`);
  }

  const files = fs
    .readdirSync(datasetDir)
    .filter((f) => f.endsWith('.json'))
    .sort((a, b) => a.localeCompare(b));

  if (files.length === 0) {
    throw new Error(`No dataset_*.json files found in ${datasetDir}`);
  }

  const byDocId = new Map<string, { enKey?: string; noKey?: string }>();
  for (const file of files) {
    const key = file.replace(/^dataset_/, '').replace(/\.json$/, '');
    const { docId, locale } = splitKey(key);
    const current = byDocId.get(docId) || {};
    if (locale === 'en') current.enKey = key;
    if (locale === 'no') current.noKey = key;
    byDocId.set(docId, current);
  }

  const acceptedAssets: ProcessedAsset[] = [];
  const rejectedAssets: RejectedAsset[] = [];
  const decisions: IngestDecision[] = [];
  const seenTitleSlugs = new Set<string>();
  const seenFinalTitleSlugs = new Set<string>();

  for (const [docId, pair] of byDocId.entries()) {
    const rejectionReasons: string[] = [];

    if (!pair.enKey || !pair.noKey) {
      rejectionReasons.push('MISSING_LOCALE_PAIR');
      rejectedAssets.push({
        id: docId,
        title: docId,
        category: 'Unknown',
        ingestStatus: 'rejected',
        rejectionReasons,
        sourceFiles: [],
      });
      decisions.push({ id: docId, title: docId, ingestStatus: 'rejected', rejectionReasons });
      continue;
    }

    const enParsed = parseLocaleAsset(assetsBaseDir, pair.enKey, 'en');
    const noParsed = parseLocaleAsset(assetsBaseDir, pair.noKey, 'no');

    rejectionReasons.push(...enParsed.rejectionReasons.map((r) => `EN_${r}`));
    rejectionReasons.push(...noParsed.rejectionReasons.map((r) => `NO_${r}`));

    const normalizedTitle = normalizeText(String(enParsed.dataset?.title || docId));
    const titleSlug = slugify(normalizedTitle);
    if (!titleSlug) rejectionReasons.push('EMPTY_TITLE_AFTER_NORMALIZATION');
    if (seenTitleSlugs.has(titleSlug)) rejectionReasons.push('DUPLICATE_TITLE');
    rejectionReasons.push(...evaluateTitleQuality(normalizedTitle));

    if (enParsed.localized && noParsed.localized) {
      const enOverview = normalizeText(enParsed.localized.article.overview);
      const noOverview = normalizeText(noParsed.localized.article.overview);
      if (enOverview && noOverview && enOverview === noOverview) {
        rejectionReasons.push('NO_LOCALE_NOT_TRANSLATED');
      }

      const semanticBody = [
        enParsed.localized.article.overview,
        enParsed.localized.article.context,
        ...enParsed.localized.article.centralKnowledge,
      ].join(' ');
      if (hasTitleContentMismatch(enParsed.localized.title, semanticBody)) {
        rejectionReasons.push('TITLE_CONTENT_MISMATCH');
      }
    }

    if (rejectionReasons.length > 0 || !enParsed.ok || !noParsed.ok || !enParsed.localized || !noParsed.localized) {
      rejectedAssets.push({
        id: docId,
        title: normalizedTitle || docId,
        category: normalizeText(String(enParsed.dataset?.category || 'Unknown')),
        ingestStatus: 'rejected',
        rejectionReasons: [...new Set(rejectionReasons)],
        sourceFiles: [...enParsed.sourceFiles, ...noParsed.sourceFiles],
      });
      decisions.push({
        id: docId,
        title: normalizedTitle || docId,
        ingestStatus: 'rejected',
        rejectionReasons: [...new Set(rejectionReasons)],
      });
      continue;
    }

    seenTitleSlugs.add(titleSlug);

    let finalEnTitle = enParsed.localized.title;
    let finalNoTitle = noParsed.localized.title;
    if (finalEnTitle) {
      let candidate = finalEnTitle;
      let counter = 2;
      while (seenFinalTitleSlugs.has(slugify(candidate))) {
        candidate = `${finalEnTitle} (${counter})`;
        counter += 1;
      }
      if (candidate !== finalEnTitle) {
        finalEnTitle = candidate;
        finalNoTitle = `${finalNoTitle} (${counter - 1})`;
      }
      seenFinalTitleSlugs.add(slugify(finalEnTitle));
    }

    const pillarId = mapCategoryToPillar(enParsed.localized.category, finalEnTitle);

    const asset: ProcessedAsset = {
      id: docId,
      title: finalEnTitle,
      category: enParsed.localized.category,
      pillarId,
      metadata: {
        sourceFile: normalizeText(String(enParsed.dataset?.metadata?.source_file || '')),
        fileSizeKb: Number(enParsed.dataset?.metadata?.file_size_kb) || 0,
      },
      keyElements: enParsed.localized.keyElements,
      sourceDerivedClaims: enParsed.localized.sourceDerivedClaims,
      domainActions: enParsed.localized.domainActions,
      validationNotes: enParsed.localized.validationNotes,
      humanReviewStatus: enParsed.localized.humanReviewStatus,
      article: enParsed.localized.article,
      stats: enParsed.localized.stats,
      guide: enParsed.localized.guide,
      checklist: enParsed.localized.checklist,
      protocol: enParsed.localized.protocol,
      courseModule: enParsed.localized.courseModule,
      locales: {
        en: {
          ...enParsed.localized,
          title: finalEnTitle,
        },
        no: {
          ...noParsed.localized,
          title: finalNoTitle,
        },
      },
    };

    acceptedAssets.push(asset);
    decisions.push({
      id: docId,
      title: normalizedTitle,
      ingestStatus: 'accepted',
      rejectionReasons: [],
    });
  }

  const rejectionByReason = rejectedAssets
    .flatMap((item) => item.rejectionReasons)
    .reduce<Record<string, number>>((acc, reason) => {
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {});

  const report = {
    schemaVersion: SCHEMA_VERSION,
    generatedAt,
    sourceRepo,
    sourceRevision,
    sourceAssetsDir: assetsBaseDir,
    summary: {
      totalDatasets: files.length,
      totalDocIds: byDocId.size,
      accepted: acceptedAssets.length,
      rejected: rejectedAssets.length,
      acceptanceRate: Number((acceptedAssets.length / Math.max(byDocId.size, 1)).toFixed(4)),
      rejectionByReason,
    },
    decisions,
  };

  const bundle: ProcessedAssetsBundle = {
    schemaVersion: SCHEMA_VERSION,
    generatedAt,
    sourceRepo,
    sourceRevision,
    assets: acceptedAssets,
  };

  console.log(`[ingest] Total datasets: ${files.length}`);
  console.log(`[ingest] Grouped doc IDs: ${byDocId.size}`);
  console.log(`[ingest] Accepted: ${acceptedAssets.length}`);
  console.log(`[ingest] Rejected: ${rejectedAssets.length}`);

  if (mode === 'preview') {
    const topReasons = Object.entries(rejectionByReason).sort((a, b) => b[1] - a[1]).slice(0, 8);
    if (topReasons.length > 0) {
      console.log('[ingest] Top rejection reasons:');
      for (const [reason, count] of topReasons) {
        console.log(`  - ${reason}: ${count}`);
      }
    }
    return;
  }

  const targetDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(bundle, null, 2), 'utf8');
  fs.writeFileSync(REJECTED_OUTPUT_FILE, JSON.stringify(rejectedAssets, null, 2), 'utf8');
  fs.writeFileSync(REPORT_OUTPUT_FILE, JSON.stringify(report, null, 2), 'utf8');

  console.log(`[ingest] Wrote: ${OUTPUT_FILE}`);
  console.log(`[ingest] Wrote: ${REJECTED_OUTPUT_FILE}`);
  console.log(`[ingest] Wrote: ${REPORT_OUTPUT_FILE}`);
}

run();
