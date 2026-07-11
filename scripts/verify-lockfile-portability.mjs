import { readFile } from 'node:fs/promises';

const lockfilePath = new URL('../package-lock.json', import.meta.url);
const lockfileText = await readFile(lockfilePath, 'utf8');
const lockfile = JSON.parse(lockfileText);

const forbiddenPatterns = [
  /internal\.api\.openai\.org/i,
  /applied-caas/i,
  /localhost/i,
  /127\.0\.0\.1/i,
];

const invalid = [];
for (const [packagePath, metadata] of Object.entries(lockfile.packages ?? {})) {
  const resolved = metadata?.resolved;
  if (typeof resolved !== 'string') continue;

  const forbidden = forbiddenPatterns.some((pattern) => pattern.test(resolved));
  let publicRegistry = false;

  try {
    publicRegistry = new URL(resolved).hostname === 'registry.npmjs.org';
  } catch {
    // Non-URL values are invalid for resolved package tarballs.
  }

  if (forbidden || !publicRegistry) {
    invalid.push({ packagePath: packagePath || '<root>', resolved });
  }
}

if (invalid.length > 0) {
  console.error('Lockfile portability verification failed:');
  for (const entry of invalid) {
    console.error(`- ${entry.packagePath}: ${entry.resolved}`);
  }
  process.exit(1);
}

console.log('Lockfile portability verification passed.');
