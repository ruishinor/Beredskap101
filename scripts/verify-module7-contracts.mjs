import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

function readText(relativePath) {
  const target = path.join(ROOT, relativePath);
  if (!fs.existsSync(target)) {
    throw new Error(`Missing required file: ${relativePath}`);
  }
  return fs.readFileSync(target, 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
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

function getCspValue() {
  const vercelConfig = readJson('vercel.json');
  const allHeaders = Array.isArray(vercelConfig.headers) ? vercelConfig.headers : [];

  for (const headerRule of allHeaders) {
    const headers = Array.isArray(headerRule.headers) ? headerRule.headers : [];
    const cspHeader = headers.find((entry) => entry.key === 'Content-Security-Policy');
    if (cspHeader?.value) {
      return cspHeader.value;
    }
  }

  throw new Error('Content-Security-Policy header is missing from vercel.json');
}

function assertNoBannedRuntimeTokens(text, label) {
  const bannedTokens = [
    'unpkg',
    'cartocdn',
    'google.com/s2',
    'googletagmanager',
    'google-analytics.com',
    'cdn.jsdelivr.net',
  ];

  for (const token of bannedTokens) {
    assert(!text.toLowerCase().includes(token), `${label} excludes banned runtime token: ${token}.`);
  }
}

function runCspChecks() {
  const csp = getCspValue();

  assert(csp.includes("default-src 'self'"), 'CSP keeps default-src restricted to self.');
  assert(csp.includes("script-src 'self'"), 'CSP keeps script-src restricted to self.');
  assert(csp.includes("style-src 'self' 'unsafe-inline'"), 'CSP keeps inline styles narrowly scoped.');
  assert(csp.includes("img-src 'self' data:"), 'CSP keeps images limited to self and data URIs.');
  assert(csp.includes("connect-src 'self'"), 'CSP includes same-origin connect-src.');
  assert(csp.includes('http://localhost:*'), 'CSP allows localhost HTTP for optional local AI.');
  assert(csp.includes('http://127.0.0.1:*'), 'CSP allows loopback IPv4 HTTP for optional local AI.');
  assert(csp.includes('http://*.local:*') && csp.includes('https://*.local:*'), 'CSP allows .local endpoints for trusted local setups.');
  assert(csp.includes("worker-src 'self' blob:"), 'CSP allows same-origin and blob workers for PMTiles renderer support.');
  assert(csp.includes("manifest-src 'self'"), 'CSP explicitly allows same-origin manifest loading.');
  assert(csp.includes("media-src 'self'"), 'CSP explicitly restricts media to same origin.');
  assert(csp.includes("frame-src 'none'"), 'CSP blocks frame embedding.');
  assert(!csp.includes('connect-src *'), 'CSP does not allow wildcard connect-src.');
  assert(!csp.includes('connect-src http:'), 'CSP does not allow all HTTP endpoints.');
  assert(!csp.includes('connect-src https:'), 'CSP does not allow all HTTPS endpoints.');
  assertNoBannedRuntimeTokens(csp, 'CSP');
}

function runRuntimeSourceChecks() {
  const runtimeFiles = [
    'index.html',
    'vite.config.ts',
    'src/main.tsx',
    'src/sw.ts',
    'src/index.css',
    'src/App.tsx',
    'src/components/ShelterMap.tsx',
    'src/components/NorwegianNewsFeed.tsx',
    'src/components/SourceLinksSection.tsx',
    'src/components/LocalAiAssistant.tsx',
    'public/manifest.webmanifest',
  ];

  const combinedRuntime = runtimeFiles.map((file) => readText(file)).join('\n');
  assertNoBannedRuntimeTokens(combinedRuntime, 'Runtime source');
  assert(!/<script[^>]+src=['"]https?:\/\//i.test(combinedRuntime), 'Runtime source has no external script tags.');
  assert(!/<link[^>]+href=['"]https?:\/\//i.test(combinedRuntime), 'Runtime source has no external stylesheet or manifest tags.');
  assert(!/url\((['"]?)https?:\/\//i.test(combinedRuntime), 'Runtime source has no external CSS asset URLs.');

  const mainTsx = readText('src/main.tsx');
  assert(mainTsx.includes("navigator.serviceWorker.register('/sw.js')"), 'App registers the generated service worker path.');

  const swTs = readText('src/sw.ts');
  assert(swTs.includes('precacheAndRoute'), 'Service worker precaches the built application shell.');
  assert(swTs.includes("caches.match('/index.html')"), 'Service worker uses index.html as offline navigation fallback.');
  assert(!swTs.includes('localhost') && !swTs.includes('127.0.0.1') && !swTs.includes('192.168.') && !swTs.includes('10.'), 'Service worker contains no LAN bypass logic.');

  const viteConfig = readText('vite.config.ts');
  assert(viteConfig.includes('VitePWA'), 'Vite config includes the PWA plugin.');
  assert(viteConfig.includes("strategies: 'injectManifest'"), 'Vite PWA uses injectManifest strategy.');
  assert(viteConfig.includes('manualChunks'), 'Vite build config uses manualChunks for better startup splitting.');
  assert(viteConfig.includes('chunkSizeWarningLimit: 1100'), 'Vite build config keeps chunk-size warnings within a stricter limit.');

  const appTsx = readText('src/App.tsx');
  assert(!appTsx.includes("import processedAssetsData from './data/processedAssets.json';"), 'App no longer statically imports processedAssets into the bootstrap path.');
  assert(appTsx.includes("import('./data/processedAssets.json')"), 'App dynamically imports processedAssets after bootstrap.');
  assert(appTsx.includes('lazy(() => import(') && appTsx.includes('<Suspense'), 'App uses lazy-loaded route or panel components with Suspense fallbacks.');

  const packageJson = readJson('package.json');
  assert(packageJson.scripts['preview:lan'] === 'vite preview --host 0.0.0.0 --port 4173', 'Package script exposes preview:lan for self-hosted LAN validation.');
  assert(packageJson.scripts['test:offline:smoke'], 'Package script exposes test:offline:smoke.');
  assert(packageJson.scripts['verify:offline:smoke'], 'Package script exposes verify:offline:smoke.');
  assert(packageJson.scripts['verify:module7:contracts'], 'Package script exposes verify:module7:contracts.');
  assert(packageJson.scripts['verify:module7'], 'Package script exposes verify:module7.');

  const playwrightConfig = readText('playwright.config.ts');
  assert(playwrightConfig.includes("name: 'chromium-offline'"), 'Playwright config defines the chromium-offline project.');
  assert(playwrightConfig.includes("command: 'npm run dev:api'"), 'Playwright config starts the local API server for online seed checks.');
  assert(playwrightConfig.includes("command: 'npm run preview -- --host 127.0.0.1 --port 4173'"), 'Playwright config starts the local preview server.');
  assert(playwrightConfig.includes("serviceWorkers: 'allow'"), 'Playwright config allows service workers for offline verification.');

  const offlineSmokeSpec = readText('tests/offline-smoke.spec.ts');
  assert(offlineSmokeSpec.includes("context.setOffline(true)"), 'Offline smoke spec forces browser offline mode.');
  assert(offlineSmokeSpec.includes("navigator.serviceWorker.ready"), 'Offline smoke spec waits for service worker readiness.');
  assert(offlineSmokeSpec.includes('/#knowledge'), 'Offline smoke spec covers the knowledge route.');
  assert(offlineSmokeSpec.includes('/#shelters'), 'Offline smoke spec covers the shelters route.');
  assert(offlineSmokeSpec.includes('/#library'), 'Offline smoke spec covers the library route.');
  assert(offlineSmokeSpec.includes('/#checklists'), 'Offline smoke spec covers the checklists route.');
}

function runBuildArtifactChecks() {
  const distSw = readText('dist/sw.js');
  assert(distSw.includes('index.html'), 'Built service worker precache references index.html.');
  assert(distSw.includes('manifest.webmanifest'), 'Built service worker precache references the web manifest.');
  assert(distSw.includes('pwa-icon.svg'), 'Built service worker precache references the bundled PWA icon.');

  const distIndex = readText('dist/index.html');
  assert(distIndex.includes('/manifest.webmanifest'), 'Built index.html references the same-origin manifest.');
  assert(!/<script[^>]+src=['"]https?:\/\//i.test(distIndex), 'Built index.html has no external script tag.');
}

function runDocumentationChecks() {
  const readme = readText('README.md');
  assert(readme.includes('## Supported Deployment Modes'), 'README documents supported deployment modes.');
  assert(readme.includes('Hosted/static PWA'), 'README documents hosted/static PWA mode.');
  assert(readme.includes('Self-hosted local PWA'), 'README documents self-hosted local PWA mode.');
  assert(readme.includes('npm run preview:lan'), 'README documents the LAN preview command.');
  assert(readme.includes('Hosted HTTPS note'), 'README documents hosted HTTPS local-AI limits.');
  assert(readme.includes('same-origin proxy'), 'README documents the same-origin proxy fallback for hosted HTTPS.');
  assert(readme.includes('## Offline Deployment Checklist'), 'README includes an offline deployment checklist.');
  assert(readme.includes('## Release Notes (Offline Guarantees vs Online Enhancements)'), 'README includes release notes for offline vs online features.');

  const auditDoc = readText('docs/module7-audit-2026-06-02.md');
  assert(auditDoc.includes('## Module 7 (Deployment Hardening)'), 'Module 7 audit doc includes the deployment hardening section.');
  assert(auditDoc.includes('Adversarial review'), 'Module 7 audit doc records adversarial review notes.');
  assert(auditDoc.includes('Retrospective'), 'Module 7 audit doc records retrospective notes.');

  const checklistDoc = readText('docs/junior-execution-checklist-2026-06-02.md');
  const requiredChecklistModules = ['Module 3', 'Module 4', 'Module 5', 'Module 6', 'Module 7'];
  for (const moduleLabel of requiredChecklistModules) {
    assert(checklistDoc.includes(moduleLabel), `Junior handoff checklist covers ${moduleLabel}.`);
  }
  assert(checklistDoc.includes('3/3 clean passes'), 'Junior handoff checklist preserves the three-pass gate rule.');
}

function run() {
  runCspChecks();
  runRuntimeSourceChecks();
  runBuildArtifactChecks();
  runDocumentationChecks();
  console.log('\n[SUCCESS] Module 7 contract verification completed with no errors or flags.');
}

run();
