import fs from 'node:fs';
import path from 'node:path';
import MiniSearch from 'minisearch';
import { buildOfflineKnowledgeArtifacts } from '../src/utils/offlineKnowledge.ts';
import { pillarsDataEn, pillarsDataNo, checklistsDataEn, checklistsDataNo } from '../src/data/pillarsData.ts';
import { glossaryData } from '../src/data/glossaryData.ts';
import { editorialArticles } from '../src/data/editorialArticles.ts';
import { sourceRegistry } from '../src/data/sourceRegistry.ts';
import sheltersData from '../src/data/shelters.json' with { type: 'json' };

const ROOT = process.cwd();

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function pass(message) {
  console.log(`[PASS] ${message}`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
  pass(message);
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

function makeMiniSearchDocuments(searchDocuments) {
  return searchDocuments.map((doc) => ({
    ...doc,
    tagsText: doc.tags.join(' '),
  }));
}

function findQueryMatches(index, query) {
  return index.search(query, { prefix: true, fuzzy: 0.2 });
}

function assertQueryScenario(index, scenario) {
  const { terms, requiredTypes, label } = scenario;
  let hits = [];
  for (const term of terms) {
    hits = findQueryMatches(index, term);
    if (hits.length > 0) break;
  }

  assert(hits.length > 0, `${label}: local search returns matches.`);
  const hitTypes = new Set(hits.map((row) => row.type));
  assert(
    requiredTypes.some((type) => hitTypes.has(type)),
    `${label}: results include at least one expected content type.`
  );
}

function run() {
  const packageJson = JSON.parse(readText('package.json'));
  const dependencies = { ...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {}) };
  assert(Boolean(dependencies.minisearch), 'MiniSearch dependency is installed.');

  const processedPayload = loadProcessedAssetsPayload();
  const offlineKnowledge = buildOfflineKnowledgeArtifacts({
    bundledAt: '2026-06-01',
    lastSourceReview: '2026-06-01',
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

  const searchDocuments = offlineKnowledge.searchDocuments;
  assert(searchDocuments.length > 0, 'Search document corpus is generated.');

  const expectedTypes = [
    'manual-topic',
    'processed-asset',
    'glossary-term',
    'editorial-article',
    'shelter',
    'source-link',
    'checklist-item',
    'content-pack',
  ];
  const observedTypes = new Set(searchDocuments.map((doc) => doc.type));
  for (const type of expectedTypes) {
    assert(observedTypes.has(type), `Search corpus includes type: ${type}.`);
  }

  const languages = new Set(searchDocuments.map((doc) => doc.language));
  assert(languages.has('en') && languages.has('no'), 'Search corpus includes both EN and NO documents.');

  const indexDocuments = makeMiniSearchDocuments(searchDocuments);
  const index = new MiniSearch({
    idField: 'id',
    fields: ['title', 'body', 'tagsText'],
    storeFields: ['id', 'type', 'title', 'body', 'tags', 'pillarId', 'urlHash', 'sourceId', 'language', 'offlineCriticality'],
    searchOptions: {
      prefix: true,
      fuzzy: 0.2,
      boost: { title: 3, tagsText: 2 },
    },
  });
  index.addAll(indexDocuments);

  const scenarios = [
    { label: 'tilfluktsrom query', terms: ['tilfluktsrom', 'shelter'], requiredTypes: ['shelter'] },
    { label: 'vann query', terms: ['vann', 'water'], requiredTypes: ['manual-topic', 'checklist-item'] },
    { label: 'forstehjelp query', terms: ['førstehjelp', 'forstehjelp', 'first aid'], requiredTypes: ['manual-topic', 'editorial-article'] },
    { label: 'DAB query', terms: ['DAB', 'radio'], requiredTypes: ['checklist-item', 'manual-topic'] },
    { label: 'personvern query', terms: ['personvern', 'privacy'], requiredTypes: ['manual-topic', 'processed-asset'] },
  ];

  for (const scenario of scenarios) {
    assertQueryScenario(index, scenario);
  }

  const appTsx = readText('src/App.tsx');
  assert(appTsx.includes('Offline local search') || appTsx.includes('Offline lokalsøk'), 'Local search UI section is present.');
  assert(appTsx.includes('Works offline') || appTsx.includes('Fungerer offline'), 'Local search UI explicitly labels offline availability.');
  assert(appTsx.includes('searchTypeFilter') && appTsx.includes('searchPillarFilter') && appTsx.includes('searchLanguageFilter') && appTsx.includes('searchCriticalityFilter'), 'Local search filter controls exist for type, pillar, language, and criticality.');

  const searchBlockMatch = appTsx.match(/const localSearchResults = useMemo<LocalSearchResult\[]>\(\(\) => \{([\s\S]*?)\n\s*\}, \[/);
  const searchBlock = searchBlockMatch ? searchBlockMatch[1] : '';
  assert(Boolean(searchBlock), 'Local search result computation block is defined.');
  assert(!searchBlock.includes('fetch('), 'Local search result computation performs no network request.');

  const offlineKnowledgeTs = readText('src/utils/offlineKnowledge.ts');
  assert(offlineKnowledgeTs.includes('buildSearchDocuments'), 'Offline knowledge builder includes local search document assembly.');
  assert(offlineKnowledgeTs.includes('addDraft('), 'Offline knowledge builder constructs normalized search drafts.');

  console.log('\n[SUCCESS] Module 3 contract verification completed with no errors or flags.');
}

run();
