import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, '..', 'src', 'data', 'processedAssets.json');
const REPORT_FILE = path.join(__dirname, '..', 'src', 'data', 'processedAssets.ingest-report.json');
const REJECTED_FILE = path.join(__dirname, '..', 'src', 'data', 'processedAssets.rejected.json');
const VALIDATION_REPORT_FILE = path.join(__dirname, '..', 'src', 'data', 'processedAssets.validation-report.json');

const allowedPillars = new Set([
  'førstehjelp',
  'friluftsliv',
  'egensikkerhet',
  'egenberedskap',
  'personvern',
  'reisesikkerhet',
]);

function fail(message: string): never {
  throw new Error(`[validate] ${message}`);
}

function loadJson(filePath: string): any {
  if (!fs.existsSync(filePath)) fail(`Missing file: ${filePath}`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function slugify(value: string): string {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9æøå]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeSignature(value: unknown): string {
  return JSON.stringify(value ?? null).replace(/\s+/g, ' ').toLowerCase();
}

function summarizeSignatureGroups(map: Map<string, string[]>) {
  return [...map.entries()]
    .filter(([, titles]) => titles.length > 1)
    .map(([signature, titles]) => ({
      signature,
      count: titles.length,
      sampleTitles: titles.slice(0, 5),
    }))
    .sort((a, b) => b.count - a.count || a.sampleTitles[0].localeCompare(b.sampleTitles[0]));
}

function ensureLocalizedShape(asset: any, localeName: 'en' | 'no') {
  const localized = asset?.locales?.[localeName];
  if (!localized || typeof localized !== 'object') {
    fail(`Asset ${asset?.id || 'unknown'} missing locales.${localeName}`);
  }
  if (!localized.article?.overview || !localized.protocol?.procedures || !localized.guide?.execution) {
    fail(`Asset ${asset?.id || 'unknown'} locales.${localeName} missing required sections.`);
  }
}

function main() {
  const data = loadJson(DATA_FILE);

  if (!data.schemaVersion || !data.generatedAt || !data.sourceRepo || !data.sourceRevision) {
    fail('Contract metadata missing (schemaVersion, generatedAt, sourceRepo, sourceRevision).');
  }
  if (!Array.isArray(data.assets)) fail('Contract invalid: "assets" must be an array.');

  const assets = data.assets as any[];
  if (assets.length === 0) fail('No assets found in processedAssets.json.');

  const seenTitles = new Set<string>();
  const checklistGroups = new Map<string, string[]>();
  const moduleGroups = new Map<string, string[]>();
  const statsGroups = new Map<string, string[]>();
  const protocolGroups = new Map<string, string[]>();
  let missingEvidenceFields = 0;

  for (const asset of assets) {
    if (!asset.id) fail('Asset is missing id.');
    if (!asset.title) fail(`Asset ${asset.id} is missing title.`);
    if (!asset.category) fail(`Asset ${asset.id} is missing category.`);
    if (!allowedPillars.has(asset.pillarId)) fail(`Asset ${asset.id} has invalid pillarId: ${asset.pillarId}`);

    if (!asset.article?.overview || !asset.protocol?.procedures || !asset.guide?.execution) {
      fail(`Asset ${asset.id} is missing required top-level content sections.`);
    }

    if (!Array.isArray(asset.keyElements) || asset.keyElements.length === 0) {
      fail(`Asset ${asset.id} has empty keyElements.`);
    }

    const checklistSignature = normalizeSignature(asset.checklist || []);
    const moduleSignature = normalizeSignature({
      learningGoals: asset.courseModule?.learningGoals || [],
      theory: asset.courseModule?.theory || '',
      reflectionQuestions: asset.courseModule?.reflectionQuestions || [],
    });
    const statsSignature = normalizeSignature(asset.stats || {});
    const protocolSignature = normalizeSignature(asset.protocol || {});

    checklistGroups.set(checklistSignature, [...(checklistGroups.get(checklistSignature) || []), asset.title]);
    moduleGroups.set(moduleSignature, [...(moduleGroups.get(moduleSignature) || []), asset.title]);
    statsGroups.set(statsSignature, [...(statsGroups.get(statsSignature) || []), asset.title]);
    protocolGroups.set(protocolSignature, [...(protocolGroups.get(protocolSignature) || []), asset.title]);

    if (
      !Array.isArray(asset.sourceDerivedClaims) &&
      !Array.isArray(asset.domainActions) &&
      !Array.isArray(asset.validationNotes) &&
      !asset.humanReviewStatus
    ) {
      missingEvidenceFields += 1;
    }

    ensureLocalizedShape(asset, 'en');
    ensureLocalizedShape(asset, 'no');

    const titleSlug = slugify(String(asset.title));
    if (!titleSlug) fail(`Asset ${asset.id} has empty normalized title.`);
    if (seenTitles.has(titleSlug)) fail(`Duplicate normalized title detected: ${asset.title}`);
    seenTitles.add(titleSlug);
  }

  const adversarialReview = {
    checklistGroups: summarizeSignatureGroups(checklistGroups),
    courseModuleGroups: summarizeSignatureGroups(moduleGroups),
    statsGroups: summarizeSignatureGroups(statsGroups),
    protocolGroups: summarizeSignatureGroups(protocolGroups),
    missingEvidenceFields,
    retrospective: [
      'The current accepted corpus still repeats checklist, module, and stats structures across many assets.',
      'The validator now records those patterns as report output instead of hiding them behind a pass-only check.',
      'Future ingestion should surface source-specific claims, domain actions, validation notes, and review state per asset.',
    ],
  };

  fs.writeFileSync(
    VALIDATION_REPORT_FILE,
    JSON.stringify(
      {
        schemaVersion: data.schemaVersion,
        generatedAt: new Date().toISOString(),
        summary: {
          acceptedAssets: assets.length,
          duplicateChecklistGroups: adversarialReview.checklistGroups.length,
          duplicateCourseModuleGroups: adversarialReview.courseModuleGroups.length,
          duplicateStatsGroups: adversarialReview.statsGroups.length,
          duplicateProtocolGroups: adversarialReview.protocolGroups.length,
          missingEvidenceFields,
        },
        adversarialReview,
      },
      null,
      2
    )
  );

  if (fs.existsSync(REPORT_FILE)) {
    const report = loadJson(REPORT_FILE);
    if (!report.summary || !Array.isArray(report.decisions)) {
      fail('Ingest report exists but does not contain expected summary/decisions.');
    }
  }

  if (fs.existsSync(REJECTED_FILE)) {
    const rejected = loadJson(REJECTED_FILE);
    if (!Array.isArray(rejected)) fail('Rejected file exists but is not an array.');
    for (const item of rejected) {
      if (item.ingestStatus !== 'rejected') fail('Rejected file contains non-rejected item.');
      if (!Array.isArray(item.rejectionReasons)) fail('Rejected item missing rejectionReasons array.');
    }
  }

  console.log(`[validate] OK - validated ${assets.length} accepted assets.`);
}

main();
