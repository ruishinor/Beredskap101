import fs from 'node:fs';
import path from 'node:path';
import { buildOfflineKnowledgeArtifacts } from '../src/utils/offlineKnowledge.ts';
import { pillarsDataEn, pillarsDataNo, checklistsDataEn, checklistsDataNo } from '../src/data/pillarsData.ts';
import { glossaryData } from '../src/data/glossaryData.ts';
import { editorialArticles } from '../src/data/editorialArticles.ts';
import { sourceRegistry } from '../src/data/sourceRegistry.ts';
import sheltersData from '../src/data/shelters.json' with { type: 'json' };

const ROOT = process.cwd();
const TITLE_BAD_PATTERN = /[\uFFFD]|\u00C3[\u0080-\uFFFF]|\u00C2[\u0080-\uFFFF]|\u00E2[\u0080-\uFFFF]{1,2}|handlingsrekkefolge|husstandsoevning|naermeste|forstehjelp|soker|innblasninger|\?n|\?C|kaf\?|\?[A-Za-zÆØÅæøå]{2,}/u;
const EXACT_TITLE_ALLOWLIST = new Set([
  'CPR, AED and Emergency Dispatch Discipline',
  'CPR, AED and Emergency Dispatch Discipline / HLR, hjertestarter og nødvarsling',
]);

function fail(message) {
  throw new Error(message);
}

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) fail(message);
  console.log(`[PASS] ${message}`);
}

function pass(message) {
  console.log(`[PASS] ${message}`);
}

function loadProcessedAssetsPayload() {
  const payload = JSON.parse(readText('src/data/processedAssets.json'));
  if (Array.isArray(payload)) {
    return { assets: payload, generatedAt: '' };
  }
  return {
    assets: Array.isArray(payload.assets) ? payload.assets : [],
    generatedAt: typeof payload.generatedAt === 'string' ? payload.generatedAt : '',
  };
}

function assertCleanNorwegianText(value, label) {
  assert(Boolean(value && value.trim()), `${label} is populated.`);
  assert(!TITLE_BAD_PATTERN.test(value), `${label} is free of mojibake and blocked transliterations.`);
}

function ensureCleanNorwegianText(value, label) {
  if (!value || !String(value).trim()) return;
  if (TITLE_BAD_PATTERN.test(String(value))) {
    fail(`${label} is free of mojibake and blocked transliterations.`);
  }
}

function walkStringLeaves(value, visitor, trail = []) {
  if (typeof value === 'string') {
    visitor(value, trail.join('.'));
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((entry, index) => walkStringLeaves(entry, visitor, [...trail, String(index)]));
    return;
  }

  if (value && typeof value === 'object') {
    for (const [key, entry] of Object.entries(value)) {
      walkStringLeaves(entry, visitor, [...trail, key]);
    }
  }
}

function assertTitlePair(noTitle, enTitle, label, requireDistinct = true) {
  assertCleanNorwegianText(noTitle, `${label} (NO title)`);
  if (requireDistinct && !EXACT_TITLE_ALLOWLIST.has(noTitle)) {
    assert(noTitle !== enTitle, `${label} does not leak the English title into the Norwegian slot.`);
  }
}

function verifyPillars() {
  assert(pillarsDataEn.length === pillarsDataNo.length, 'Pillar datasets have matching EN/NO counts.');

  pillarsDataNo.forEach((pillarNo, index) => {
    const pillarEn = pillarsDataEn[index];
    assert(pillarNo.id === pillarEn.id, `Pillar alignment is stable for ${pillarNo.id}.`);
    assertTitlePair(pillarNo.title, pillarEn.title, `Pillar ${pillarNo.id}`);
    assert(Array.isArray(pillarNo.topics) && pillarNo.topics.length > 0, `Pillar ${pillarNo.id} has Norwegian topics.`);

    assert(pillarNo.topics.length === pillarEn.topics.length, `Topic counts match for pillar ${pillarNo.id}.`);
    pillarNo.topics.forEach((topicNo, topicIndex) => {
      const topicEn = pillarEn.topics[topicIndex];
      assert(Boolean(topicEn), `English topic exists for ${pillarNo.id}/${topicNo.id}.`);
      assertTitlePair(topicNo.title, topicEn.title, `Topic ${pillarNo.id}/${topicNo.id}`);
    });
  });
}

function verifyChecklists() {
  assert(checklistsDataEn.length === checklistsDataNo.length, 'Checklist datasets have matching EN/NO counts.');

  checklistsDataNo.forEach((groupNo, index) => {
    const groupEn = checklistsDataEn[index];
    assert(groupNo.id === groupEn.id, `Checklist alignment is stable for ${groupNo.id}.`);
    assertTitlePair(groupNo.title, groupEn.title, `Checklist ${groupNo.id}`);
    groupNo.items.forEach((itemNo, itemIndex) => {
      const itemEn = groupEn.items[itemIndex];
      assert(itemNo.id === itemEn.id, `Checklist item alignment is stable for ${groupNo.id}/${itemNo.id}.`);
      assertCleanNorwegianText(itemNo.text, `Checklist item ${groupNo.id}/${itemNo.id}`);
    });
  });
}

function verifyEditorialArticles() {
  assert(editorialArticles.length > 0, 'Editorial article corpus exists.');
  editorialArticles.forEach((article) => {
    assertTitlePair(article.titleNo, article.title, `Editorial article ${article.id}`);
    assertCleanNorwegianText(article.summaryNo, `Editorial article ${article.id} summary`);
    article.body.forEach((section, index) => {
      assertTitlePair(section.headingNo, section.heading, `Editorial article ${article.id} section ${index + 1}`);
      assertCleanNorwegianText(section.contentNo, `Editorial article ${article.id} section ${index + 1} body`);
    });
    assertTitlePair(article.printSummary.titleNo, article.printSummary.title, `Editorial print summary ${article.id}`);
    article.printSummary.bulletsNo.forEach((bullet, index) => {
      assertCleanNorwegianText(bullet, `Editorial print summary ${article.id} bullet ${index + 1}`);
    });
  });
}

function verifyProcessedAssets() {
  const processedPayload = loadProcessedAssetsPayload();
  assert(processedPayload.assets.length > 0, 'Processed asset bundle exists.');

  processedPayload.assets.forEach((asset) => {
    assert(asset.locales?.no, `Processed asset ${asset.id} includes Norwegian locale.`);
    assertTitlePair(asset.locales.no.title, asset.locales.en.title, `Processed asset ${asset.id}`, false);
    assertCleanNorwegianText(asset.locales.no.category, `Processed asset ${asset.id} category`);
    assertCleanNorwegianText(asset.locales.no.article.overview, `Processed asset ${asset.id} article overview`);
    walkStringLeaves(asset.locales.no, (value, trail) => {
      ensureCleanNorwegianText(value, `Processed asset ${asset.id} ${trail}`);
    }, ['locales', 'no']);
    pass(`Processed asset ${asset.id} Norwegian locale passes recursive text-integrity scan.`);
  });

  return processedPayload;
}

function verifySourceRegistry() {
  assert(sourceRegistry.length > 0, 'Official source registry exists.');
  sourceRegistry.forEach((source) => {
    assertCleanNorwegianText(source.nameNo, `Source registry ${source.id} Norwegian name`);
    assertCleanNorwegianText(source.summaryNo, `Source registry ${source.id} Norwegian summary`);
  });
}

function verifyOfflineKnowledge(processedPayload) {
  const offlineKnowledge = buildOfflineKnowledgeArtifacts({
    bundledAt: '2026-06-04',
    lastSourceReview: '2026-06-04',
    processedAssetsGeneratedAt: processedPayload.generatedAt,
    pillarsEn: pillarsDataEn,
    pillarsNo: pillarsDataNo,
    processedAssets: processedPayload.assets,
    checklistsEn: checklistsDataEn,
    checklistsNo: checklistsDataNo,
    glossary: glossaryData,
    editorialArticles,
    shelters: sheltersData,
    sourceRegistry,
  });

  const candidateTypes = new Set(['manual-topic', 'processed-asset', 'editorial-article', 'checklist-item', 'content-pack']);
  const countsByType = new Map();

  for (const doc of offlineKnowledge.searchDocuments) {
    if (!candidateTypes.has(doc.type) || doc.language !== 'no') continue;
    countsByType.set(doc.type, (countsByType.get(doc.type) || 0) + 1);
    assertCleanNorwegianText(doc.title, `Offline knowledge NO title ${doc.id}`);
  }

  for (const type of candidateTypes) {
    assert((countsByType.get(type) || 0) > 0, `Offline knowledge exposes Norwegian documents for type ${type}.`);
  }
}

function verifyGlossaryCoverage() {
  const normalizedTerms = new Set(
    glossaryData.flatMap((item) => [item.term.toLowerCase(), item.termNo.toLowerCase()])
  );

  for (const requiredTerm of [
    'article 17 erasure',
    'article 20 portability',
    'pmtiles',
    'dsb',
    'nve',
    'sivilforsvaret',
    'lokal ki-kjører',
  ]) {
    assert(normalizedTerms.has(requiredTerm), `Glossary includes ${requiredTerm}.`);
  }
}

function main() {
  verifyPillars();
  verifyChecklists();
  verifyEditorialArticles();
  verifySourceRegistry();
  const processedPayload = verifyProcessedAssets();
  verifyOfflineKnowledge(processedPayload);
  verifyGlossaryCoverage();
  console.log('\n[SUCCESS] Localization verification completed with no errors or flags.');
}

main();
