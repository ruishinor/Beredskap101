import { spawn, spawnSync } from 'node:child_process';

const releaseMode = process.argv.includes('--release');
const npmCommand = process.platform === 'win32' ? process.env.ComSpec || 'cmd.exe' : 'npm';

const steps = [
  { script: 'verify:portability', timeoutMs: 30_000 },
  { script: 'lint', timeoutMs: 120_000 },
  { script: 'verify:text-integrity', timeoutMs: 60_000 },
  { script: 'verify:localization', timeoutMs: 120_000 },
  { script: 'ingest:validate', timeoutMs: 60_000 },
  { script: 'build', timeoutMs: 120_000 },
  { script: 'verify:module1:api', timeoutMs: 120_000 },
  { script: 'verify:contracts', timeoutMs: 120_000 },
];

if (releaseMode) {
  steps.push(
    { script: 'verify:security', timeoutMs: 120_000 },
    { script: 'test:e2e', timeoutMs: 300_000 }
  );
}

function terminateProcessTree(child) {
  if (!child || child.exitCode !== null) return;

  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    return;
  }

  try {
    process.kill(-child.pid, 'SIGKILL');
  } catch {
    try {
      child.kill('SIGKILL');
    } catch {
      // Ignore termination races.
    }
  }
}

function runStep({ script, timeoutMs }) {
  return new Promise((resolve, reject) => {
    console.log(`\n[verify] START ${script} (timeout ${Math.round(timeoutMs / 1000)}s)`);

    const npmArgs = process.platform === 'win32'
      ? ['/d', '/s', '/c', `npm run ${script}`]
      : ['run', script];

    const child = spawn(npmCommand, npmArgs, {
      stdio: 'inherit',
      detached: process.platform !== 'win32',
      shell: false,
      env: process.env,
    });

    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      terminateProcessTree(child);
      reject(new Error(`${script} exceeded ${Math.round(timeoutMs / 1000)} seconds and was terminated.`));
    }, timeoutMs);

    child.once('error', (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(new Error(`${script} failed to start: ${error.message}`));
    });

    child.once('exit', (code, signal) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);

      if (code === 0) {
        console.log(`[verify] PASS ${script}`);
        resolve();
        return;
      }

      const reason = signal ? `signal ${signal}` : `exit code ${code}`;
      reject(new Error(`${script} failed with ${reason}.`));
    });
  });
}

try {
  for (const step of steps) {
    await runStep(step);
  }
  console.log(`\n[verify] SUCCESS ${releaseMode ? 'release' : 'non-browser'} verification completed.`);
} catch (error) {
  console.error(`\n[verify] STOP ${error.message}`);
  process.exitCode = 1;
}
