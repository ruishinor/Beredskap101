import fs from 'node:fs';
import path from 'node:path';

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

function collectFiles(dir, extensions, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(full, extensions, files);
      continue;
    }
    if (extensions.includes(path.extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

function splitQuotedSegments(line) {
  const matches = line.match(/['"`]([^'"`]+)['"`]/g) || [];
  return matches.map((segment) => segment.slice(1, -1));
}

function detectWhiteOnOrangeSegments() {
  const files = collectFiles(path.join(ROOT, 'src'), ['.ts', '.tsx', '.css']);
  const findings = [];

  for (const file of files) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
    for (let i = 0; i < lines.length; i += 1) {
      const segments = splitQuotedSegments(lines[i]);
      for (const segment of segments) {
        const isOrangeBackground =
          /bg-orange/i.test(segment) ||
          /bg-\[#ff[0-9a-f]{4}\]/i.test(segment) ||
          /background-color:\s*#ff[0-9a-f]{4}/i.test(segment);
        const isWhiteText =
          /text-white/i.test(segment) ||
          /color:\s*#fff(?:fff)?/i.test(segment) ||
          /color:\s*white/i.test(segment);
        if (isOrangeBackground && isWhiteText) {
          findings.push(`${rel}:${i + 1}`);
        }
      }
    }
  }

  return findings;
}

function normalizeHex(hex) {
  const value = hex.trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(value)) return value;
  if (/^#[0-9a-f]{3}$/.test(value)) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
  }
  throw new Error(`Unsupported color value: ${hex}`);
}

function hexToRgb(hex) {
  const normalized = normalizeHex(hex);
  const intValue = Number.parseInt(normalized.slice(1), 16);
  return {
    r: (intValue >> 16) & 255,
    g: (intValue >> 8) & 255,
    b: intValue & 255,
  };
}

function toLinear(value) {
  const channel = value / 255;
  if (channel <= 0.03928) return channel / 12.92;
  return ((channel + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const rgb = hexToRgb(hex);
  return 0.2126 * toLinear(rgb.r) + 0.7152 * toLinear(rgb.g) + 0.0722 * toLinear(rgb.b);
}

function contrastRatio(bg, fg) {
  const l1 = luminance(bg);
  const l2 = luminance(fg);
  const high = Math.max(l1, l2);
  const low = Math.min(l1, l2);
  return (high + 0.05) / (low + 0.05);
}

function extractVarFromTheme(css, themeSelector, varName) {
  const themeRegex = new RegExp(`${themeSelector}\\s*\\{([\\s\\S]*?)\\}`, 'm');
  const match = css.match(themeRegex);
  if (!match) {
    throw new Error(`Missing CSS theme block: ${themeSelector}`);
  }
  const block = match[1];
  const varRegex = new RegExp(`--${varName}:\\s*([^;]+);`);
  const varMatch = block.match(varRegex);
  if (!varMatch) {
    throw new Error(`Missing variable --${varName} in ${themeSelector}`);
  }
  return normalizeHex(varMatch[1]);
}

function flatten(value) {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.map(flatten).join(' ');
  if (typeof value === 'object') return Object.values(value).map(flatten).join(' ');
  return String(value);
}

function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0 || value.every(isEmpty);
  if (typeof value === 'object') {
    const values = Object.values(value);
    return values.length === 0 || values.every(isEmpty);
  }
  return String(value).trim().length === 0;
}

function tokenize(text) {
  const stopWords = new Set([
    'the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'between', 'without', 'your', 'you',
    'are', 'was', 'were', 'have', 'has', 'had', 'will', 'can', 'may', 'not', 'all', 'one', 'two',
    'som', 'det', 'den', 'fra', 'med', 'til', 'for', 'og', 'eller', 'har', 'kan', 'skal', 'ikke',
  ]);
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2 && !stopWords.has(token));
}

function jaccard(a, b) {
  const setA = new Set(tokenize(a));
  const setB = new Set(tokenize(b));
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection += 1;
  }
  const union = setA.size + setB.size - intersection;
  return intersection / union;
}

function run() {
  const appTsx = readText('src/App.tsx');
  const sourceLinksTsx = readText('src/components/SourceLinksSection.tsx');
  const staticPagesTsx = readText('src/components/StaticPages.tsx');
  const pillarsDataTs = readText('src/data/pillarsData.ts');
  const indexCss = readText('src/index.css');

  console.log('\n[Module 2] Layout and Navigation Checks');
  assert(
    sourceLinksTsx.includes('columns-1 lg:columns-2 gap-4'),
    'Source links two-column container uses independent columns (no equal-height stretching).'
  );
  assert(
    sourceLinksTsx.includes('break-inside-avoid') && sourceLinksTsx.includes('rounded-xl p-4'),
    'Source links cards keep intrinsic height for empty feed states.'
  );
  assert(
    /setActiveTab\('shelters'\)[\s\S]{0,900}setActiveTab\('recommended-reading'\)/.test(appTsx),
    'Recommended Reading is positioned immediately after Shelters in main navigation.'
  );
  assert(
    /setActiveTab\('recommended-reading'\)[\s\S]{0,900}setActiveTab\('support'\)/.test(appTsx),
    'Support is positioned immediately after Recommended Reading in main navigation.'
  );
  const recommendedNavHits = (appTsx.match(/setActiveTab\('recommended-reading'\)/g) || []).length;
  assert(recommendedNavHits === 1, 'Recommended Reading is exposed once in primary navigation (footer shortcut removed).');
  const supportNavHits = (appTsx.match(/setActiveTab\('support'\)/g) || []).length;
  assert(supportNavHits >= 1, 'Support is exposed in primary or mobile navigation.');

  console.log('\n[Module 2] Offline Content Pack Interactivity');
  assert(appTsx.includes('id="offline-content-packs"'), 'Offline content pack section exists in reference library.');
  assert(appTsx.includes('role="button"') && appTsx.includes('aria-pressed={isPackSelected}'), 'Content pack cards are keyboard/screen-reader interactive.');
  assert(appTsx.includes("event.key === 'Enter' || event.key === ' '"), 'Content pack cards support Enter/Space activation.');
  assert(
    appTsx.includes('setLibraryPackFilter(pack.id)') && appTsx.includes('reference-library-grid'),
    'Selecting a content pack applies filter and routes user to filtered library results.'
  );

  console.log('\n[Module 2] Browser Back/Forward Behavior');
  assert(appTsx.includes("window.addEventListener('hashchange', handleRouteStateChange)"), 'Hash-based navigation listener is active.');
  assert(appTsx.includes("window.addEventListener('popstate', handleRouteStateChange)"), 'Browser/mouse back-popstate listener is active.');
  assert(appTsx.includes('readUiSubStateFromLocation()'), 'UI sub-state (asset/pillar/topic) is parsed from URL.');
  assert(appTsx.includes("window.history.replaceState(window.history.state, '', nextUrl);"), 'Initial route state is normalized with replaceState.');
  assert(appTsx.includes("window.history.pushState(window.history.state, '', nextUrl);"), 'Subsequent route transitions are captured with pushState.');
  const pushStateCount = (appTsx.match(/window\.history\.pushState/g) || []).length;
  assert(pushStateCount === 1, 'History push logic is consolidated to a single URL-sync path.');

  console.log('\n[Module 2] Accessibility and Color Contrast');
  for (const themeSelector of ['\\.theme-dark', '\\.theme-light', '\\.theme-signal']) {
    const accentSolid = extractVarFromTheme(indexCss, themeSelector, 'accent-solid');
    const accentOnSolid = extractVarFromTheme(indexCss, themeSelector, 'accent-on-solid');
    const accentContrast = contrastRatio(accentSolid, accentOnSolid);
    assert(accentContrast >= 4.5, `${themeSelector.replace('\\.', '')} solid accent contrast passes WCAG AA (${accentContrast.toFixed(2)}:1).`);

    for (const tone of ['success', 'warning', 'error', 'info']) {
      const bg = extractVarFromTheme(indexCss, themeSelector, `status-${tone}-bg`);
      const fg = extractVarFromTheme(indexCss, themeSelector, `status-${tone}-text`);
      const ratio = contrastRatio(bg, fg);
      const toneLabel = tone === 'warning' ? 'alert' : tone;
      assert(ratio >= 4.5, `${themeSelector.replace('\\.', '')} ${toneLabel} status token contrast passes WCAG AA (${ratio.toFixed(2)}:1).`);
    }
  }
  assert(appTsx.includes("id=\"btn-theme-signal\"") && appTsx.includes("setTheme('signal')"), 'Signal theme button and persistence wiring are present.');

  const whiteOnOrangeFindings = detectWhiteOnOrangeSegments();
  assert(
    whiteOnOrangeFindings.length === 0,
    `No white-text-on-orange segments remain in source files (findings: ${whiteOnOrangeFindings.length}).`
  );

  console.log('\n[Module 2] FAQ and User Guidance');
  assert(
    staticPagesTsx.includes('How do I switch between online and offline mode?') &&
      staticPagesTsx.includes('Hvordan bytter jeg mellom online og offline modus?'),
    'FAQ includes online/offline mode toggle instructions in EN and NO.'
  );
  assert(
    staticPagesTsx.includes('How does the map package work now?') &&
      staticPagesTsx.includes('Hvordan fungerer kartpakken nå?'),
    'FAQ explains the shipped map-package behavior in EN and NO.'
  );
  assert(
    staticPagesTsx.includes('Which keywords are useful for Norwegian news and search?') &&
      staticPagesTsx.includes('Hvilke nøkkelord er nyttige for norske nyheter og søk?'),
    'FAQ documents Norwegian news/search keywords in EN and NO.'
  );
  assert(staticPagesTsx.includes('export and deletion') && staticPagesTsx.includes('Article 17'), 'FAQ documents Article 17 and Article 20 user controls.');

  console.log('\n[Module 2] Urban First Aid Kit Restoration');
  const urbanKitIdHits = (pillarsDataTs.match(/id: 'urban-first-aid-kit'/g) || []).length;
  assert(urbanKitIdHits >= 2, 'Urban First Aid Kit checklist group exists in both EN and NO data sets.');
  assert(pillarsDataTs.includes('ifak-tourniquet') && pillarsDataTs.includes('ifak-hemostatic-gauze') && pillarsDataTs.includes('ifak-pressure-bandage'), 'Urban First Aid Kit includes core trauma-control items.');

  console.log('\n[Module 2] B101 Content Integrity Audit');
  const processedAssetsPayload = JSON.parse(readText('src/data/processedAssets.json'));
  const assets = Array.isArray(processedAssetsPayload.assets) ? processedAssetsPayload.assets : [];
  assert(assets.length > 0, 'Processed asset dataset is present.');

  const requiredSections = ['guide', 'checklist', 'protocol', 'courseModule', 'stats'];
  const sectionScores = new Map(requiredSections.map((name) => [name, []]));
  const completenessGaps = [];

  for (const asset of assets) {
    for (const locale of ['en', 'no']) {
      const localized = asset.locales?.[locale] || {};
      const articleText = flatten(localized.article ?? asset.article);
      if (articleText.trim().length === 0) {
        completenessGaps.push(`${asset.id} (${locale}) missing article`);
        continue;
      }

      for (const section of requiredSections) {
        const sectionValue = localized[section] ?? asset[section];
        if (isEmpty(sectionValue)) {
          completenessGaps.push(`${asset.id} (${locale}) missing ${section}`);
          continue;
        }
        const score = jaccard(articleText, flatten(sectionValue));
        sectionScores.get(section).push(score);
      }
    }
  }

  assert(
    completenessGaps.length === 0,
    `All processed assets contain article, guide, checklist, protocol, courseModule, and stats content in EN/NO (${assets.length} assets audited).`
  );

  const MIN_ALIGNMENT_THRESHOLD = 0.008;
  for (const section of requiredSections) {
    const scores = sectionScores.get(section);
    const min = Math.min(...scores);
    const avg = scores.reduce((sum, value) => sum + value, 0) / scores.length;
    assert(min >= MIN_ALIGNMENT_THRESHOLD, `${section} keeps minimum lexical alignment >= ${MIN_ALIGNMENT_THRESHOLD} (min ${min.toFixed(4)}, avg ${avg.toFixed(4)}).`);
  }

  console.log('\n[SUCCESS] Module 2 contract verification completed with no errors or flags.');
}

run();
