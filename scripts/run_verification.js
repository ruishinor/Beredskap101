import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const CWD = process.cwd();

function assert(condition, message) {
  if (!condition) {
    throw new Error(`[FAIL] ${message}`);
  }
  console.log(`  [PASS] ${message}`);
}

async function runTypeCheck() {
  console.log('\n--- Running TypeScript Check (tsc --noEmit) ---');
  execSync('npm run lint', { stdio: 'inherit', cwd: CWD });
  console.log('  [PASS] TypeScript check passed.');
}

async function runProductionBuild() {
  console.log('\n--- Running Production Build (vite build) ---');
  execSync('npm run build', { stdio: 'inherit', cwd: CWD });
  console.log('  [PASS] Production build passed.');
}

async function runIngestValidation() {
  console.log('\n--- Running Processed Asset Validation (npm run ingest:validate) ---');
  execSync('npm run ingest:validate', { stdio: 'inherit', cwd: CWD });
  console.log('  [PASS] Processed asset validation passed.');
}

function verifyFounderReleaseModules() {
  console.log('\n--- Verifying Founder Release Modules ---');

  const requiredFiles = [
    'api/healthz.ts',
    'api/source-feeds.ts',
    'api/feed-utils.ts',
    'api/norway-news.ts',
    'api/contact.ts',
    'vercel.json',
    'src/components/SourceLinksSection.tsx',
    'src/components/NorwegianNewsFeed.tsx',
    'src/components/StaticPages.tsx',
    'src/data/sourceRegistry.ts',
    'src/data/glossaryData.ts'
  ];

  requiredFiles.forEach((relativePath) => {
    const fullPath = path.join(CWD, relativePath);
    assert(fs.existsSync(fullPath), `${relativePath} exists`);
  });

  const app = fs.readFileSync(path.join(CWD, 'src/App.tsx'), 'utf8');
  assert(app.includes("setActiveTab('reference-library')"), 'Reference Library route is reachable from App shell');
  assert(app.includes("recommended-reading"), 'Recommended Reading hash route is registered');
  assert(app.includes('<SourceLinksSection currentLang={currentLang} />'), 'Official sources section is mounted');
  assert(app.includes('<NorwegianNewsFeed currentLang={currentLang} />'), 'Norwegian news feed is mounted');
  assert(app.includes('<RecommendedReadingPage currentLang={currentLang} />'), 'Recommended Reading page is mounted');
  assert(app.includes('<GlossaryPage currentLang={currentLang} />'), 'Glossary page is mounted');
  assert(app.includes('<CookieBanner'), 'Cookie banner is mounted');
  assert(app.includes("import processedAssetsData from './data/processedAssets.json';"), 'Processed assets are loaded from the bundled JSON payload');

  const sourceFeeds = fs.readFileSync(path.join(CWD, 'api/source-feeds.ts'), 'utf8');
  assert(sourceFeeds.includes("parser: 'politiloggen'"), 'Source feeds use Politiloggen parser for police updates');

  const norwayNews = fs.readFileSync(path.join(CWD, 'api/norway-news.ts'), 'utf8');
  assert(norwayNews.includes('https://www.nrk.no/nyheter/siste.rss'), 'Norway news includes NRK RSS source');
  assert(norwayNews.includes('https://www.digi.no/feeds/general.xml'), 'Norway news includes Digi RSS source');
  assert(norwayNews.includes('https://www.politiet.no/politiloggen'), 'Norway news includes Politiloggen source');
  assert(norwayNews.includes('https://api.met.no/weatherapi/metalerts/2.0/current'), 'Norway news includes MET Norway alerts');
}

function verifySecurityAndPolicy() {
  console.log('\n--- Verifying Security & Policy Configuration ---');

  const vercelConfig = fs.readFileSync(path.join(CWD, 'vercel.json'), 'utf8');
  const expectedHeaders = [
    'Content-Security-Policy',
    'Strict-Transport-Security',
    'X-Frame-Options',
    'X-Content-Type-Options',
    'Referrer-Policy',
    'Permissions-Policy'
  ];

  expectedHeaders.forEach((header) => {
    assert(vercelConfig.includes(header), `${header} is configured in vercel.json`);
  });

  const contactApi = fs.readFileSync(path.join(CWD, 'api/contact.ts'), 'utf8');
  assert(contactApi.includes('mailto:'), 'Contact endpoint returns mailto handoff');
  assert(contactApi.includes('Missing required fields'), 'Contact endpoint validates required fields');
}

function verifyOfflineCompatibility() {
  console.log('\n--- Verifying Offline Phase 0-4 Compatibility Guardrails ---');

  const requiredFiles = [
    'src/sw.ts',
    'docs/offline-phase-0-1-audit.md',
    'src/types/offline.ts'
  ];

  requiredFiles.forEach((relativePath) => {
    const fullPath = path.join(CWD, relativePath);
    assert(fs.existsSync(fullPath), `${relativePath} exists`);
  });

  const packageJson = JSON.parse(fs.readFileSync(path.join(CWD, 'package.json'), 'utf8'));
  const dependencies = { ...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {}) };
  assert(Boolean(dependencies.leaflet), 'Leaflet is installed as a local dependency');
  assert(Boolean(dependencies['vite-plugin-pwa']), 'vite-plugin-pwa is installed for generated precache');
  assert(Boolean(dependencies.minisearch), 'MiniSearch is installed for local search coverage');
  assert(Boolean(dependencies['maplibre-gl']), 'MapLibre GL is installed for optional PMTiles rendering');
  assert(Boolean(dependencies.pmtiles), 'PMTiles is installed for optional offline basemap packages');
  assert(!dependencies['@google/generative-ai'], 'Google Generative AI package is not installed');

  assert(!fs.existsSync(path.join(CWD, 'public/sw.js')), 'Legacy hand-written public/sw.js is removed');
  assert(fs.existsSync(path.join(CWD, 'public/maps/pmtiles-manifest.json')), 'PMTiles manifest exists for the local offline basemap package');
  assert(fs.existsSync(path.join(CWD, 'public/maps/norway-style.json')), 'PMTiles style exists for the local offline basemap package');
  assert(fs.existsSync(path.join(CWD, 'public/maps/norway.pmtiles')), 'PMTiles archive exists for the local offline basemap package');

  const runtimeFiles = [
    'src/components/ShelterMap.tsx',
    'src/components/NorwegianNewsFeed.tsx',
    'src/components/SourceLinksSection.tsx',
    'src/index.css',
    'src/sw.ts',
    'src/components/shelter-map/mapPackConfig.ts',
    'src/components/shelter-map/mapProvider.ts',
    'server.js',
    'vite.config.ts'
  ];

  const bannedRuntimeTokens = [
    'unpkg',
    'cartocdn',
    'google.com/s2',
    'fonts.googleapis',
    'fonts.gstatic',
    'generativelanguage',
    '@google/generative-ai',
    'GoogleGenerativeAI'
  ];

  runtimeFiles.forEach((relativePath) => {
    const content = fs.readFileSync(path.join(CWD, relativePath), 'utf8');
    bannedRuntimeTokens.forEach((token) => {
      assert(!content.includes(token), `${relativePath} does not include banned runtime token: ${token}`);
    });
  });

  const sw = fs.readFileSync(path.join(CWD, 'src/sw.ts'), 'utf8');
  assert(sw.includes('__WB_MANIFEST'), 'Service worker uses generated precache manifest');
  assert(sw.includes("status: 'offline-ready'"), 'Service worker returns offline-ready health response');
  assert(sw.includes('/api/source-feeds'), 'Service worker runtime-caches source feeds');
  assert(sw.includes('/api/norway-news'), 'Service worker runtime-caches Norwegian news');

  const shelterMap = fs.readFileSync(path.join(CWD, 'src/components/ShelterMap.tsx'), 'utf8');
  const mapProvider = fs.readFileSync(path.join(CWD, 'src/components/shelter-map/mapProvider.ts'), 'utf8');
  assert(shelterMap.includes("import L from 'leaflet'"), 'Shelter map imports local Leaflet package');
  assert(shelterMap.includes('tileLayer') || shelterMap.includes('openstreetmap-standard'), 'Shelter map keeps the live street basemap fallback');
  assert(shelterMap.includes('offline-shelter-basemap'), 'Shelter map exposes an offline basemap fallback');
  assert(mapProvider.includes('fallback-shelter-map'), 'Shelter map supports fallback provider abstraction');
  assert(mapProvider.includes('pmtiles-vector-map'), 'Shelter map supports PMTiles vector provider abstraction');
  assert(shelterMap.includes('future-poi-overlay'), 'Shelter map reserves future POI overlays above basemap');
  assert(shelterMap.includes('Street is the default') || shelterMap.includes('Gatekart er standard'), 'Shelter map explains the street-first default');
  assert(shelterMap.includes('The offline package is not installed in this copy') || shelterMap.includes('Offline-pakken er ikke installert i denne kopien'), 'Shelter map provides explicit PMTiles package status copy');

  const server = fs.readFileSync(path.join(CWD, 'server.js'), 'utf8');
  assert(server.includes("provider: 'deterministic-local'"), 'Copilot endpoint has deterministic local provider');
  assert(server.includes("provider: 'local-llm'"), 'Copilot endpoint can route to optional local LLM provider');
  assert(!server.includes('gemini-1.5'), 'Copilot endpoint no longer references Gemini models');

  const shelters = JSON.parse(fs.readFileSync(path.join(CWD, 'src/data/shelters.json'), 'utf8'));
  assert(Array.isArray(shelters) && shelters.length === 556, 'Shelter content count remains 556');
}

function verifyLegacyStressModeRemoved() {
  console.log('\n--- Verifying Legacy Stress Mode Cleanup ---');

  const removedFiles = [
    'src/components/StressModeDashboard.tsx',
    'src/utils/stressSearchEngine.ts'
  ];

  removedFiles.forEach((relativePath) => {
    const fullPath = path.join(CWD, relativePath);
    assert(!fs.existsSync(fullPath), `${relativePath} is removed`);
  });
}

function verifyPhase5To7Compatibility() {
  console.log('\n--- Verifying Offline Phase 5-7 Compatibility Guardrails ---');

  const requiredFiles = [
    'src/components/LocalDocumentVault.tsx',
    'src/components/LocalAiAssistant.tsx',
    'src/utils/localAiSettings.ts',
    'docs/offline-phase-5-7-audit.md'
  ];

  requiredFiles.forEach((relativePath) => {
    const fullPath = path.join(CWD, relativePath);
    assert(fs.existsSync(fullPath), `${relativePath} exists`);
  });

  const app = fs.readFileSync(path.join(CWD, 'src/App.tsx'), 'utf8');
  assert(app.includes("checklistSubTab === 'vault'"), 'App renders Local Document Vault tab');
  assert(app.includes("checklistSubTab === 'ai'"), 'App renders Local AI Assist tab');
  assert(app.includes('<LocalAiAssistant'), 'Local AI assistant is mounted');
  assert(app.includes('<LocalDocumentVault'), 'Local document vault is mounted');

  const secureSave = fs.readFileSync(path.join(CWD, 'src/components/SecureSaveManager.tsx'), 'utf8');
  assert(secureSave.includes('buildSecureBackupBundle'), 'Secure backup export uses v2 bundle builder');
  assert(secureSave.includes('decryptSecureBackupBundle'), 'Secure backup import supports v2 bundle decrypt');
  assert(secureSave.includes('loadVaultDocuments'), 'Secure backup export includes vault documents');
  assert(secureSave.includes('readLocalAiSettings'), 'Secure backup export includes local AI settings');

  const saveSystem = fs.readFileSync(path.join(CWD, 'src/utils/saveSystem.ts'), 'utf8');
  assert(saveSystem.includes("const DB_VERSION = 2"), 'Save system upgrades IndexedDB schema to v2');
  assert(saveSystem.includes("const DOCUMENT_STORE = 'document-vault'"), 'Save system includes dedicated document vault store');
  assert(saveSystem.includes('exportSecureBackupBundle'), 'Save system exports secure backup bundle helper');
  assert(saveSystem.includes('decryptSecureBackupBundle'), 'Save system exports secure backup bundle decrypt helper');

  const localAiSettings = fs.readFileSync(path.join(CWD, 'src/utils/localAiSettings.ts'), 'utf8');
  assert(localAiSettings.includes('enabled: false'), 'Local AI defaults to disabled');
  assert(localAiSettings.includes('http://localhost:11434/v1'), 'Local AI default endpoint points to localhost');

  const localAiAssistant = fs.readFileSync(path.join(CWD, 'src/components/LocalAiAssistant.tsx'), 'utf8');
  assert(localAiAssistant.includes('deterministicAssistiveResponse'), 'Local AI assistant always has deterministic fallback');
  assert(localAiAssistant.includes('tryLocalModel'), 'Local AI assistant supports optional local model routing');
  assert(!localAiAssistant.includes('openai.com'), 'Local AI assistant does not call cloud OpenAI endpoints');
  assert(!localAiAssistant.includes('gemini'), 'Local AI assistant does not reference Gemini');
  assert(localAiAssistant.includes('RAG-lite local context'), 'Local AI assistant exposes RAG-lite context messaging');
  const vercelConfig = fs.readFileSync(path.join(CWD, 'vercel.json'), 'utf8');

  function extractCspDirective(configText, directiveName) {
    const match = configText.match(new RegExp(`${directiveName}\\s+([^;]+);?`));
    return match ? match[1].trim().split(/\s+/) : [];
  }

  const imgSrcTokens = extractCspDirective(vercelConfig, 'img-src');

  assert(
    imgSrcTokens.includes("'self'") &&
      imgSrcTokens.includes('data:') &&
      imgSrcTokens.includes('blob:') &&
      imgSrcTokens.includes('https://tile.openstreetmap.org'),
    'CSP image policy allows self/data/blob images plus the explicit OSM tile host'
  );

  assert(!imgSrcTokens.includes('*'), 'CSP does not allow wildcard image sources');
  assert(!imgSrcTokens.includes('https:'), 'CSP does not allow broad remote HTTPS image hosts');
  assert(!imgSrcTokens.includes('http:'), 'CSP does not allow broad remote HTTP image hosts');

  const staticPages = fs.readFileSync(path.join(CWD, 'src/components/StaticPages.tsx'), 'utf8');
  assert(!staticPages.includes('covers.openlibrary.org'), 'Recommended reading does not pull external cover image runtime dependencies');

  const connectSrcTokens = extractCspDirective(vercelConfig, 'connect-src');

  assert(
    connectSrcTokens.includes("http://localhost:*"),
    'CSP connect-src allows localhost local AI endpoints'
  );

  assert(!connectSrcTokens.includes('*'), 'CSP connect-src does not allow wildcard connect sources');
  assert(!connectSrcTokens.includes('https:'), 'CSP connect-src does not allow broad HTTPS connect sources');
  assert(!connectSrcTokens.includes('http:'), 'CSP connect-src does not allow broad HTTP connect sources');
}

async function runVerificationCycle(cycleNum) {
  console.log(`\n========================================`);
  console.log(`STARTING VERIFICATION CYCLE ${cycleNum}/3`);
  console.log(`========================================`);

  try {
    await runTypeCheck();
    await runProductionBuild();
    await runIngestValidation();
    verifyFounderReleaseModules();
    verifySecurityAndPolicy();
    verifyOfflineCompatibility();
    verifyLegacyStressModeRemoved();
    verifyPhase5To7Compatibility();
    console.log(`\n[SUCCESS] CYCLE ${cycleNum}/3 PASSED 100%`);
    return true;
  } catch (err) {
    console.error(`\n[FAILURE] CYCLE ${cycleNum}/3 FAILED:`, err.message);
    return false;
  }
}

async function run() {
  for (let i = 1; i <= 3; i++) {
    const success = await runVerificationCycle(i);
    if (!success) {
      console.log(`\n[ABORT] Verification loop failed at cycle ${i}.`);
      process.exit(1);
    }
  }

  console.log('\n========================================');
  console.log('VERIFICATION COMPLETE: 3/3 CONSECUTIVE 100% SUCCESS CYCLES ACHIEVED');
  console.log('========================================');
  process.exit(0);
}

run();
