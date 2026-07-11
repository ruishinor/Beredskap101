import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

function spawnProcess(label, args) {
  const child = spawn(process.execPath, args, {
    stdio: 'inherit',
    env: process.env,
  });

  child.on('error', (error) => {
    console.error(`[dev-runtime] ${label} failed to start:`, error);
  });

  return child;
}

const processes = [
  { label: 'api', child: spawnProcess('api', ['--import', 'tsx', 'server.js']) },
  { label: 'ui', child: spawnProcess('ui', ['./node_modules/vite/bin/vite.js', '--port=3011', '--host=0.0.0.0']) },
];

let shuttingDown = false;
let exitCode = 0;

function stopChild(child, signal) {
  if (!child || child.exitCode !== null) return;
  try {
    if (process.platform === 'win32' && signal === 'SIGKILL') {
      spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
      return;
    }
    child.kill(signal);
  } catch {
    // Ignore shutdown races.
  }
}

function waitForExit(child) {
  if (!child || child.exitCode !== null) return Promise.resolve();
  return new Promise((resolve) => child.once('exit', resolve));
}

async function shutdown(trigger) {
  if (shuttingDown) return;
  shuttingDown = true;
  if (trigger) {
    console.log(`[dev-runtime] shutting down after ${trigger}`);
  }

  for (const { child } of processes) {
    stopChild(child, 'SIGTERM');
  }

  await Promise.race([
    Promise.all(processes.map(({ child }) => waitForExit(child))),
    delay(1500),
  ]);

  for (const { child } of processes) {
    stopChild(child, 'SIGKILL');
  }

  await Promise.race([
    Promise.all(processes.map(({ child }) => waitForExit(child))),
    delay(750),
  ]);

  process.exit(exitCode);
}

for (const { label, child } of processes) {
  child.on('exit', (code, signal) => {
    if (shuttingDown) return;
    const failed = code !== 0 && code !== null;
    if (failed) exitCode = code || 1;
    const reason = signal ? `${label} received ${signal}` : `${label} exited with code ${code}`;
    void shutdown(reason);
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
