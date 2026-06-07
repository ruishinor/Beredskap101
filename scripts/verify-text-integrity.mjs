import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TARGET_DIRS = ['src', 'scripts', 'tests'];
const TARGET_FILES = ['index.html', 'scratch/process_uorganisert.py'];
const TARGET_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.mjs', '.json', '.html', '.py']);
const FILE_EXCLUSIONS = new Set(['scripts/verify-text-integrity.mjs', 'scripts/verify-localization.mjs']);

const MOJIBAKE_PATTERN = /[\uFFFD]|\u00C3[\u0080-\uFFFF]|\u00C2[\u0080-\uFFFF]|\u00E2[\u0080-\uFFFF]{1,2}/u;
const SUSPICIOUS_SEGMENT_PATTERNS = [
  { pattern: /\?n/u, reason: 'broken "én" substitution' },
  { pattern: /\?C/u, reason: 'broken degree-symbol substitution' },
  { pattern: /kaf\?/u, reason: 'broken accented-word substitution' },
  { pattern: /M\?rk/u, reason: 'broken Norwegian UI label' },
  { pattern: /St\?tte/u, reason: 'broken Norwegian UI label' },
  { pattern: /lokals\?k/u, reason: 'broken Norwegian UI label' },
  { pattern: /S\?ker/u, reason: 'broken Norwegian UI label' },
  { pattern: /S\?k/u, reason: 'broken Norwegian UI label' },
  { pattern: /f\?rstehjelp/u, reason: 'broken Norwegian UI label' },
  { pattern: /spr\?k/u, reason: 'broken Norwegian UI label' },
  { pattern: /H\?y/u, reason: 'broken Norwegian UI label' },
  { pattern: /Pr\?v/u, reason: 'broken Norwegian UI label' },
  { pattern: /f\?rre/u, reason: 'broken Norwegian UI label' },
  { pattern: /\?pne/u, reason: 'broken Norwegian UI label' },
  { pattern: /L\?r/u, reason: 'broken Norwegian UI label' },
  { pattern: /fullf\?rt/u, reason: 'broken Norwegian UI label' },
  { pattern: /Beslutningstr\?r/u, reason: 'broken Norwegian UI label' },
  { pattern: /Bruksvilk\?r/u, reason: 'broken Norwegian UI label' },
  { pattern: /N\?v\?rende/u, reason: 'broken Norwegian UI label' },
  { pattern: /klargj\?ringssteg/u, reason: 'broken Norwegian UI label' },
  { pattern: /st\?tteverkt\?y/u, reason: 'broken Norwegian UI label' },
  { pattern: /\?det kunne vært verre\?/u, reason: 'broken quote substitution' },
  { pattern: /\?Det du opplevde var alvorlig/u, reason: 'broken quote substitution' },
  { pattern: /ðŸ/u, reason: 'broken emoji sequence' },
];

const FORBIDDEN_FRAGMENTS = [
  'Lag husstandsoevning',
  'handlingsrekkefolge',
  'paa hukommelse',
  'Prov bredere sok',
  'Husstandsoevning',
  'Oev paa',
  'Hva maa',
  'forste handling',
  'Kjor ny oevning',
  'Kjor assistanse',
  'for a aktivere den',
  'Soker posisjon',
  'Finn naermeste tilfluktsrom',
  'Sok etter gate eller romnr',
  'Naermeste sortert forst',
  'utendors eller pa reise nar',
  'soke dekning i egen bygning',
  'fremfor a bevege deg ut',
  'oppsoke et offentlig tilfluktsrom',
  '72 timer pa a klargjore',
  'Urban forstehjelps',
  'tren pa en-hånds bruk',
  'innblasninger',
  'venter pa hjelp',
  'Kjor månedlig sjekk',
  'utlop og forseglinger',
  'utlop/segl',
];

function collectTargetFiles() {
  const files = TARGET_FILES.map((file) => path.join(ROOT, file));

  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (!TARGET_EXTENSIONS.has(path.extname(entry.name))) {
        continue;
      }
      const relativePath = path.relative(ROOT, fullPath).replace(/\\/g, '/');
      if (!FILE_EXCLUSIONS.has(relativePath)) {
        files.push(fullPath);
      }
    }
  };

  for (const dir of TARGET_DIRS) {
    const fullDir = path.join(ROOT, dir);
    if (fs.existsSync(fullDir)) {
      walk(fullDir);
    }
  }

  return files;
}

function pushFinding(findings, relativePath, lineNumber, reason, line) {
  findings.push({
    relativePath,
    lineNumber,
    reason,
    line: line.trim(),
  });
}

function splitQuotedSegments(line) {
  const matches = line.match(/['"`]([^'"`]+)['"`]/g) || [];
  return matches.map((segment) => segment.slice(1, -1));
}

function scanFile(filePath, findings) {
  const relativePath = path.relative(ROOT, filePath).replace(/\\/g, '/');
  const text = fs.readFileSync(filePath, 'utf8');
  const lines = text.split(/\r?\n/);

  lines.forEach((line, index) => {
    if (MOJIBAKE_PATTERN.test(line)) {
      pushFinding(findings, relativePath, index + 1, 'mojibake or replacement-character sequence', line);
    }

    for (const fragment of FORBIDDEN_FRAGMENTS) {
      if (line.includes(fragment)) {
        pushFinding(findings, relativePath, index + 1, 'forbidden transliteration fragment "' + fragment + '"', line);
      }
    }

    const segments = [line, ...splitQuotedSegments(line)];
    for (const { pattern, reason } of SUSPICIOUS_SEGMENT_PATTERNS) {
      if (segments.some((segment) => pattern.test(segment))) {
        pushFinding(findings, relativePath, index + 1, reason, line);
      }
    }
  });
}

function main() {
  const findings = [];

  for (const filePath of collectTargetFiles()) {
    scanFile(filePath, findings);
  }

  if (findings.length > 0) {
    console.error('[FAIL] Text integrity verification found issues:');
    for (const finding of findings) {
      console.error(`- ${finding.relativePath}:${finding.lineNumber} :: ${finding.reason}`);
      console.error(`  ${finding.line}`);
    }
    process.exit(1);
  }

  console.log('[PASS] No mojibake or forbidden Norwegian transliteration fragments found.');
}

main();
