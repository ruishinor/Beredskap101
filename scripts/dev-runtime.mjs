import { spawn, spawnSync } from 'node:child_process';

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

function shutdown(trigger) {
  if (shuttingDown) return;
  shuttingDown = true;
  if (trigger) {
    console.log(`[dev-runtime] shutting down after ${trigger}`);
  }

  for (const { child } of processes) {
    if (child.killed) continue;
    try {
      if (process.platform === 'win32') {
        spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
      } else {
        child.kill('SIGTERM');
      }
    } catch {
      // Ignore shutdown races.
    }
  }

  setTimeout(() => {
    for (const { child } of processes) {
      if (!child.killed) {
        try {
          if (process.platform === 'win32') {
            spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
          } else {
            child.kill('SIGKILL');
          }
        } catch {
          // Ignore shutdown races.
        }
      }
    }
    process.exit(exitCode);
  }, 750);
}

for (const { label, child } of processes) {
  child.on('exit', (code, signal) => {
    if (shuttingDown) return;
    const failed = code !== 0 && code !== null;
    if (failed) exitCode = code || 1;
    const reason = signal ? `${label} received ${signal}` : `${label} exited with code ${code}`;
    shutdown(reason);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
